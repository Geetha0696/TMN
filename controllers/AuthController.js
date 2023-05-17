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
}