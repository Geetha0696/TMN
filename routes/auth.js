const express = require('express');
const router = express.Router();

const TimesheetController = require("../controllers/TimesheetController");
const AuthController = require("../controllers/AuthController");

const TimesheetRouter = express.Router();
TimesheetRouter.post("/list", TimesheetController.getTimesheetList);
// TimesheetRouter.post("/create", TimesheetController.validate('createUser'), TimesheetController.createUser);
// TimesheetRouter.post("/update", TimesheetController.validate('updateUser'), TimesheetController.updateUser);
// TimesheetRouter.post("/delete", TimesheetController.deleteUser);
// TimesheetRouter.post("/", TimesheetController.getUser);
router.use('/timesheet', TimesheetRouter);

router.post("/auth/logout", AuthController.logout);

module.exports = router;