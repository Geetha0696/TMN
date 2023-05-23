const express = require('express');
const router = express.Router();

const TimesheetController = require("../controllers/TimesheetController");
const AuthController = require("../controllers/AuthController");
const ProjectController = require("../controllers/ProjectController");

const TimesheetRouter = express.Router();
TimesheetRouter.post("/list", TimesheetController.validate('listTimesheet'), TimesheetController.getTimesheetList);
TimesheetRouter.post("/create", TimesheetController.validate('createTimesheet'), TimesheetController.createTimesheet);
TimesheetRouter.post("/update", TimesheetController.validate('updateTimesheet'), TimesheetController.updateTimesheet);
TimesheetRouter.post("/delete", TimesheetController.validate('deleteTimesheet'), TimesheetController.deleteTimesheet);
TimesheetRouter.post("/", TimesheetController.validate('getTimesheet'), TimesheetController.getTimesheet);
router.use('/timesheet', TimesheetRouter);

router.post("/project/list", ProjectController.getProjectList);
router.post("/auth/logout", AuthController.logout);

module.exports = router;