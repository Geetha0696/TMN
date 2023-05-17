module.exports = {
    app_name: "CGS",
    server_port: 8080,
    console_log: true,

    passport_expires_in: '1d',
    session_secret_key: 'HS256',
    reset_pass_expires_in: 2, // hours
    encryption_key: "11LuvVNFPr0XZK0kvHJ9aX6nxVvoH79T", // Must be 256 bits (32 characters)

    mail_host: "smtp.gmail.com",
    mail_port: 587,
    mail_username: "",
    mail_password: "",
    mail_from_address: ""
};