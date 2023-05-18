const model = require("../models");
const config = require('../config/config');
const { response, encrypt, decrypt } = require("../helpers/index");
const { body, validationResult } = require('express-validator');

const passport = require("passport");
const jwt = require('jsonwebtoken');
var crypto = require("crypto");
const ejs = require('ejs');
const path = require('path');
const transporter = require('../config/mail')

module.exports = {
    validate(method) {
        // valiate the input
        switch (method) {
            case 'login': {
                return [
                    body('email', "Email is required").notEmpty(),
                    body('email', "Invalid email format").isEmail().normalizeEmail(),
                    body('email', "This mail not registered").custom(async (value) => {
                        const user = await model.user.findOne({
                            where: { email: value }
                        })
                        if (!user) {
                            throw new Error()
                        }
                    }),
                    body('password', "Password is required").notEmpty()
                ]
            }
            case 'forgotPassword': {
                return [
                    body('email', "Email is required").notEmpty(),
                    body('email', "Invalid email format").isEmail().normalizeEmail(),
                    body('email', "This mail not registered").custom(async (value) => {
                        const user = await model.user.findOne({
                            where: { email: value }
                        })
                        if (!user) {
                            throw new Error()
                        }
                    })
                ]
            }
            case 'resetPassword': {
                return [
                    body('token', "Token is required").notEmpty(),
                    body('key', "Key is required").notEmpty(),
                    body('password', "Password is required").notEmpty(),
                    body('password', "Password must be Strong").isStrongPassword({
                        minLength: 8,
                        minLowercase: 1,
                        minUppercase: 1,
                        minNumbers: 1
                    }),
                    body('confirmPassword', "Confirm Password is required").notEmpty(),
                    body('confirmPassword', "Passwords must be same").custom(async (value, { req }) => {
                        const password = req.body.password
                        if (password !== value) {
                            throw new Error()
                        }
                    }),
                ]
            }
        }
    },

    async login(req, res, next) {

        // check validate
        const validateErrors = validationResult(req).formatWith(error => error.msg);

        if (!validateErrors.isEmpty()) {

            var validateErrorMsg = validateErrors.array().join(". ")
            return response(res, false, [], validateErrorMsg)
        } else {

            // login check
            passport.authenticate('login', (err, user, info) => {
                console.log('user', user)

                if (err)
                    return response(res, false, [], err.message)
                else if (info)
                    return response(res, false, [], info.message)
                else if (!user)
                    return response(res, false, [], "User not found")

                // login
                req.logIn(user, (err) => {
                    if (err)
                        return response(res, false, err, err.message)
                    else {

                        try {
                            // token generate
                            const token = jwt.sign({ user: user }, config.session_secret_key, { expiresIn: config.passport_expires_in });
                            console.log('token', token)

                            // create token in table
                            model.login_log.create({ user_id: user.user_id, token: token })

                            const responseData = {
                                user_id: user.user_id,
                                name: user.name,
                                email: user.email,
                                token
                            }

                            return response(res, true, responseData, "Login success")
                        } catch (error) {
                            // error
                            return response(res, false, [], error.message)
                        }
                    }
                });
            })(req, res, next)
        }
    },

    async logout(req, res) {

        // token expired in table
        const user_id = req.user.user_id;
        console.log('user_id', user_id)

        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        console.log('token', token)

        if (token) {

            // check token is revoked
            model.login_log.findOne({ where: { user_id: user_id, token: token, expiry: false } }).then(async (TokenData) => {
                console.log('TokenData', TokenData)

                if (TokenData) {

                    // token revoke
                    await model.login_log.update(
                        { expiry: true, updatedAt: new Date() },
                        { where: { user_id, token } });
                    return response(res, true, [], "Logout success")
                } else {
                    return response(res, false, [], "Token expired")
                }
            });
        } else {
            return response(res, false, [], "Unauthorised")
        }
    },

    async tokenVerify(req, res, next) {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (token) {

            // jwt verfiction check
            jwt.verify(token, config.session_secret_key, (err, user) => {
                const user_id = user && user.user ? user.user.user_id : null;

                // check token is revoked
                model.login_log.findOne({ where: { user_id: user_id, token: token, expiry: false } }).then((TokenData) => {
                    if (TokenData) {

                        if (err) {

                            // token revoked in table
                            model.login_log.update(
                                { expiry: true, updatedAt: new Date() },
                                { where: { user_id, token } });

                            if (err.name === 'TokenExpiredError') {
                                return response(res, false, [], "Token expired")
                            } else {
                                return response(res, false, [], "Invalid Token")
                            }
                        } else {

                            req.user = user.user;
                            next();
                        }
                    } else {
                        return response(res, false, [], "Unauthorised")
                    }
                }).catch((error) => {
                    return response(res, false, [], error.message)
                });
            });
        } else {
            return response(res, false, [], "Unauthorised")
        }
    },

    async forgotPassword(req, res, next) {

        // check validate
        const validateErrors = validationResult(req).formatWith(error => error.msg);

        if (!validateErrors.isEmpty()) {

            var validateErrorMsg = validateErrors.array().join(". ")
            return response(res, false, [], validateErrorMsg)
        } else {

            const { email } = req.body;
            console.log('email', email);

            // get user_id
            const user = await model.user.findOne({ where: { email } })
            const user_id = user.user_id;
            console.log('user_id', user_id);

            // generate token and upadte
            const token = crypto.randomBytes(16).toString('hex');
            console.log('token', token);

            // generate expiry date
            const expiry_at = new Date();
            expiry_at.setHours(expiry_at.getHours() + config.reset_pass_expires_in);

            var key = encrypt(email);
            key = key.encryptedData + ":" + key.iv

            // create token in table
            await model.user.update(
                { forgot_pass_token: token, forgot_pass_expiry_at: expiry_at },
                { where: { user_id } });

            ejs.renderFile(path.join(__dirname, '../views/email/ResetPassword.ejs'), { url: `?token=${token}&key=${key}` }, (err, data) => {
                if (err) {
                    console.log('err', err);
                    return response(res, false, [], err.message)
                }

                var mailMessage = {
                    from: config.mail_from_address,
                    to: email,
                    subject: `Reset Password - ${config.app_name}`,
                    html: data
                }

                // Send email
                transporter.sendMail(mailMessage, (err, info) => {
                    if (err) {
                        console.log('err', err);
                        return response(res, false, [], "Mail not sending")
                    }

                    console.log('Email sent: ' + info.response);
                    return response(res, true, { token, key }, "Mail Sented. Check your mail")
                });
            });

        }
    },

    async resetPassword(req, res, next) {

        // check validate
        const validateErrors = validationResult(req).formatWith(error => error.msg);

        if (!validateErrors.isEmpty()) {

            var validateErrorMsg = validateErrors.array().join(". ")
            return response(res, false, [], validateErrorMsg)
        } else {

            const { key, token, password } = req.body;
            console.log('token', token);

            // decrypt email
            const email = decrypt(key);
            console.log('email', email);

            req.body.email = email;

            // check old password
            passport.authenticate('login', async (err, user, info) => {
                console.log('user', user);

                if (err || info || !user) {

                    // get user_id
                    const user = await model.user.findOne({
                        where: { email: email, forgot_pass_token: token }
                    })
                    if (user) {
                        const user_id = user.user_id;
                        console.log('user_id', user_id);

                        if (user.forgot_pass_expiry_at < new Date()) {
                            return response(res, false, [], "Token Expired")
                        } else {
                            // create token in table
                            model.user.update(
                                { password: password, forgot_pass_expiry_at: new Date() },
                                { where: { user_id }, individualHooks: true });
                            return response(res, false, [], "Password Changed")
                        }
                    } else {
                        return response(res, false, [], "Invalid Token")
                    }
                } else {
                    return response(res, false, [], "It's old password. Enter new password.")
                }
            })(req, res)
        }
    },
}