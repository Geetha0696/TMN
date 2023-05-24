var express = require('express');
var app = express();
const config = require('./config/config');

app.set('view engine', 'ejs');  // import ejs
app.use('/public', express.static('public')); // set public path static and read

// secure HTTP response headers
const helmet = require('helmet')
app.use(helmet())

// cors
var cors = require('cors')
var allowlist = ['http://localhost', 'http://localhost:3000']
var corsOptionsDelegate = function (req, callback) {
    var corsOptions;
    if (allowlist.indexOf(req.header('Origin')) !== -1) {
        corsOptions = { origin: true }
    } else {
        corsOptions = { origin: false }
    }
    callback(null, corsOptions)
}

//body-parser config;
const bodyParser = require("body-parser");
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// express-session
const session = require('express-session');
// Set up session middleware with default settings
app.use(session({
    secret: config.session_secret_key, // a random string used to sign the session ID cookie
    resave: false, // do not save session data if it hasn't been modified
    saveUninitialized: true, // save uninitialized session data
}));

// passport integrate
const passport = require('passport');
app.use(passport.initialize());
app.use(passport.session());

// passport config
const passportConfig = require("./services/PassportService");
passportConfig();

// import router
var Router = require('./routes/index');
app.use('/', cors(corsOptionsDelegate), Router);

// set port
const port = config.server_port || '8080';
app.listen(port, () => {
    console.log(`Application is listening at port ${port}`)

    if (!config.console_log) {
        console.log = () => { }
    }
})