var express = require('express');
var app = express();

require('dotenv').config();     // import dotenv
app.set('view engine', 'ejs');  // import ejs
app.use('/public', express.static('public')); // set public path static and read

const helmet = require('helmet')
app.use(helmet())

// cors
var cors = require('cors')
var allowlist = ['http://localhost']
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

// import router
var Router = require('./routes/index');
app.use('/', cors(corsOptionsDelegate), Router);

// set port
const port = process.env.PORT || '3000';
app.listen(port, console.log(`Application is listening at port ${port}`))