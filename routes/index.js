var express = require('express');
var router = express.Router();

const AuthController = require("../controllers/AuthController");

router.get('/', function (req, res) {
    const fs = require('fs');
    const package = fs.readFileSync('package.json')
    const packageParse = JSON.parse(package)
    const expressVersion = 'v' + packageParse.dependencies.express.slice(1)

    res.render('index', { expressVersion: expressVersion, Version: process.version });
});
router.get('/email', function (req, res) {
    res.render('email/ResetPassword', { url: "#" });
});

var apiRouter = express.Router();

// without auth router
apiRouter.post("/auth/login", AuthController.validate('login'), AuthController.login);

// import auth router in middleware
const auth = require('./auth');
apiRouter.use('/', AuthController.tokenVerify, auth);

router.use('/api', apiRouter);

module.exports = router;