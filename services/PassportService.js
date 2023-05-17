const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const model = require("../models");
const bcrypt = require('bcryptjs');

module.exports = () => {
    passport.use(
        "signup",
        new LocalStrategy(
            {
                usernameField: "email",
                passwordField: "password",
            },
            async (email, password, done) => {
                try {
                    // check if user exists
                    const userExists = await model.user.findOne({ where: { email: email } });
                    if (userExists) {
                        return done(null, false)
                    } else {
                        // Create a new user with the user data provided
                        const user = await model.user.create({ email, password });
                        return done(null, user);
                    }
                } catch (error) {
                    done(error);
                }
            }
        )
    );
    passport.use(
        "login",
        new LocalStrategy(
            {
                usernameField: "email",
                passwordField: "password",
            },
            async (email, password, done) => {
                try {
                    const user = await model.user.findOne({ where: { email: email } });
                    if (!user) return done(null, false, { message: 'Email incorrect.' });

                    bcrypt.compare(password, user.password, (err, res) => {
                        if (res) {
                            return done(null, user);
                        } else {
                            return done(null, false, { message: 'Password incorrect.' });
                        }
                    });
                } catch (error) {
                    console.log(error)
                    return done(error, false, { message: error });
                }
            }
        )
    );
    passport.serializeUser((user, done) => {
        done(null, user.user_id);
    });
    passport.deserializeUser((id, done) => {
        model.user.findByPk(id).then((user) => {
            if (user)
                done(null, user);
            else
                done(null, false, { message: 'User not found.' });

        }).catch((error) => {
            console.log('error', error)
            done(error, false, { message: error });
        });
    });
}
