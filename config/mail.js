var nodemailer = require('nodemailer')
const config = require('./config');

module.exports = nodemailer.createTransport({
    host: config.mail_host,
    port: config.mail_port,
    auth: {
        user: config.mail_username,
        pass: config.mail_password
    }
})