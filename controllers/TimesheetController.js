const { response } = require("../helpers/index");
const { body, validationResult } = require('express-validator');
const TimesheetService = require("../services/TimesheetService");
const model = require("../models");
const { Op } = require("sequelize");

module.exports = {
    validate(method) {
        // valiate the input
        switch (method) {
            case 'listTimesheet': {
                return [
                    body('user_id', "The selected User id is invalid").custom(async (value) => {
                        if (value) {
                            const data = await model.user.findOne({
                                where: { user_id: value }
                            })
                            if (!data) {
                                throw new Error()
                            }
                        } else {
                            throw new Error()
                        }
                    }).optional(),
                    body('project_id', "The selected Project id is invalid").custom(async (value) => {
                        if (value) {
                            const data = await model.project.findOne({
                                where: { project_id: value }
                            })
                            if (!data) {
                                throw new Error()
                            }
                        } else {
                            throw new Error()
                        }
                    }).optional(),
                    body('billable', "The Billable field does not exist in billable, non billable").isIn(['billable', 'non billable', '', null]).optional(),
                    body('status', "Status should be boolean").isBoolean().optional(),
                    body('start_date', "Start Date should be invalid").trim().isDate().optional(),
                    body('end_date', "End Date should be invalid").trim().isDate().optional(),
                    body('end_date', "The End date must be a greater than or equal to Start date").custom(async (v, { req }) => {
                        const { start_date, end_date } = req.body;
                        console.log(start_date, end_date)
                        console.log(new Date(start_date), new Date(end_date))
                        if (!start_date) {
                            throw new Error('Start date is required')
                        } else if (new Date(end_date) < new Date(start_date)) {
                            throw new Error('The End date must be a greater than or equal to Start date')
                        }
                    }).optional(),
                    body('page', "Page is required").notEmpty(),
                    body('page', "Page should be number").isInt(),
                    body('limit', "Limit is required").notEmpty(),
                    body('limit', "Limit should be number").isInt(),
                ]
            }
            case 'createTimesheet': {
                return [
                    body('user_id', "The selected User id is invalid").custom(async (value) => {
                        if (value) {
                            const data = await model.user.findOne({
                                where: { user_id: value }
                            })
                            if (!data) {
                                throw new Error()
                            }
                        } else {
                            throw new Error()
                        }
                    }).optional(),
                    body('project_id', "Project id is required").notEmpty(),
                    body('project_id', "The selected Project id is invalid").custom(async (value) => {
                        if (value) {
                            const data = await model.project.findOne({
                                where: { project_id: value }
                            })
                            if (!data) {
                                throw new Error()
                            }
                        } else {
                            throw new Error()
                        }
                    }),
                    body('title', "Title is required").trim().notEmpty(),
                    body('date', "Date is required").notEmpty(),
                    body('date', "Date should be invalid").trim().isDate(),
                    body('estimation', "Estimation is required").notEmpty(),
                    body('billable', "Billable is required").notEmpty(),
                    body('billable', "The Billable field does not exist in billable, non billable").isIn(['billable', 'non billable']),
                    body('status', "Status is required").notEmpty(),
                    body('status', "Status should be boolean").isBoolean()
                ]
            }
            case 'updateTimesheet': {
                return [
                    body('id', "Id is required").notEmpty(),
                    body('project_id', "The selected Project id is invalid").custom(async (value) => {
                        if (value) {
                            const data = await model.project.findOne({
                                where: { project_id: value }
                            })
                            if (!data) {
                                throw new Error()
                            }
                        } else {
                            throw new Error()
                        }
                    }).optional(),
                    body('date', "Date should be invalid").trim().isDate().optional(),
                    body('status', "Status should be boolean").isBoolean().optional()
                ]
            }
            case 'getTimesheet': {
                return [
                    body('id', "Id is required").notEmpty()
                ]
            }
            case 'deleteTimesheet': {
                return [
                    body('id', "Id is required").notEmpty()
                ]
            }
        }
    },

    async getTimesheetList(req, res) {
        var data = [];
        try {
            // check validate
            const validateErrors = validationResult(req).formatWith(error => error.msg);
            if (!validateErrors.isEmpty()) {
                var validateErrorMsg = validateErrors.array().join(". ")
                return response(res, false, [], validateErrorMsg)
            } else {
                const { user_id, project_id, title, estimation, billable, status, start_date, end_date, order, group, page, limit } = req.body;

                var where = {
                    timesheet_user_id: user_id ? user_id : { [Op.not]: null },
                    timesheet_project_id: project_id ? project_id : { [Op.not]: null },
                    timesheet_title: title ? { [Op.like]: `%${title}%` } : { [Op.not]: null },
                    timesheet_estimation: estimation ? estimation : { [Op.not]: null },
                    timesheet_billable_type: billable ? billable : { [Op.not]: null },
                    timesheet_status: status == true || status == false ? status : { [Op.not]: null },
                    timesheet_date: start_date && end_date ? {
                        [Op.and]: {
                            [Op.gte]: new Date(start_date),
                            [Op.lte]: new Date(end_date)
                        }
                    } : { [Op.not]: null },
                };

                var TimesheetOrder = [];

                switch (order) {
                    case "date_asc":
                        if (group != 'date') TimesheetOrder.push(["timesheet_date", "ASC"])
                        break;
                    case "date_desc":
                        if (group != 'date') TimesheetOrder.push(["timesheet_date", "DESC"])
                        break;
                    case "project_asc":
                        if (group != 'project') TimesheetOrder.push([model.project, "project_name", "ASC"])
                        break;
                    case "project_desc":
                        if (group != 'project') TimesheetOrder.push([model.project, "project_name", "DESC"])
                        break;
                    case "user_asc":
                        if (group != 'user') TimesheetOrder.push([model.user, "first_name", "ASC"])
                        break;
                    case "user_desc":
                        if (group != 'user') TimesheetOrder.push([model.user, "first_name", "DESC"])
                        break;

                    default:
                        break;
                }

                switch (group) {
                    case "date":
                        TimesheetOrder.push(["timesheet_date", order == "date_desc" ? "DESC" : "ASC"])
                        break;
                    case "project":
                        TimesheetOrder.push([model.project, "project_name", order == "project_desc" ? "DESC" : "ASC"])
                        break;
                    case "user":
                        TimesheetOrder.push([model.user, "first_name", order == "user_desc" ? "DESC" : "ASC"])
                        break;
                }

                const all_conditions = {
                    where: { [Op.and]: where },
                    order: TimesheetOrder.length > 0 ? TimesheetOrder : "",
                    offset: page == 1 ? 0 : (page * limit) - limit,
                    limit: limit
                };

                // get lists from service
                data = await TimesheetService.list(all_conditions);
                const total = await TimesheetService.count({ where: all_conditions.where });

                if (data.length > 0) {
                    return response(res, true, data, "", { page, limit, total })
                } else {
                    return response(res, false, data, "No Records Found")
                }
            }
        } catch (error) {
            // error
            return response(res, false, [], error.message)
        }
    },

    async createTimesheet(req, res) {
        try {
            // check validate
            const validateErrors = validationResult(req).formatWith(error => error.msg);
            if (!validateErrors.isEmpty()) {
                var validateErrorMsg = validateErrors.array().join(". ")
                return response(res, false, [], validateErrorMsg)
            } else {

                const { user_id, project_id, title, description, date, estimation, billable, status } = req.body;

                const inputs = {
                    timesheet_user_id: user_id || req.user.user_id,
                    timesheet_project_id: project_id,
                    timesheet_title: title,
                    timesheet_description: description || null,
                    timesheet_date: new Date(date),
                    timesheet_estimation: estimation,
                    timesheet_billable_type: billable,
                    timesheet_status: status,
                    createdBy: req.user.user_id
                }

                // create record call from service
                const createResponse = await TimesheetService.create(inputs);

                // check create record response
                if (createResponse > 0)
                    return response(res, true, createResponse, "Data Created")
                else
                    return response(res, false, [], createResponse)

            }
        } catch (error) {
            // error
            return response(res, false, [], error.message)
        }
    },

    async getTimesheet(req, res) {
        var data = {};
        try {

            // check validate
            const validateErrors = validationResult(req).formatWith(error => error.msg);
            if (!validateErrors.isEmpty()) {
                var validateErrorMsg = validateErrors.array().join(". ")
                return response(res, false, [], validateErrorMsg)
            } else {
                // get record from service
                let id = req.body.id || "";
                console.log('id', id);

                data = await TimesheetService.view({
                    where: { timesheet_id: id }
                });

                // check get record response
                if (typeof text === 'string')
                    return response(res, false, {}, data)
                else
                    return response(res, true, data, "")
            }
        } catch (error) {
            // error
            return response(res, false, [], error.message)
        }
    },

    async updateTimesheet(req, res) {
        try {

            // check validate
            const validateErrors = validationResult(req).formatWith(error => error.msg);
            if (!validateErrors.isEmpty()) {
                var validateErrorMsg = validateErrors.array().join(". ")
                return response(res, false, [], validateErrorMsg)
            } else {
                var id = req.body.id;
                console.log('id', id);

                const data = await model.timesheet.findOne({
                    where: { timesheet_id: id }
                })

                if (!data) {
                    return response(res, false, [], "Data Not found")
                }

                const { project_id, title, description, date, estimation, billable, status } = req.body;

                // Update record call from service
                const input = {
                    timesheet_project_id: project_id || data.timesheet_project_id,
                    timesheet_title: title || data.timesheet_title,
                    timesheet_description: description || data.timesheet_description,
                    timesheet_date: date ? new Date(date) : data.timesheet_date,
                    timesheet_estimation: estimation || data.timesheet_estimation,
                    timesheet_billable_type: billable || data.timesheet_billable_type,
                    timesheet_status: status == true || status == false ? status : data.timesheet_status,
                    updatedBy: req.user.user_id,
                    updatedAt: new Date()
                }

                const updatedResponse = await TimesheetService.update(id, input);

                // check update record response
                if (updatedResponse > 0)
                    return response(res, true, [], "Data Updated")
                else if (updatedResponse == 0)
                    return response(res, false, [], "Data Not Updated")
                else
                    return response(res, false, [], updatedResponse) // updated response throw the error
            }

        } catch (error) {
            // error
            return response(res, false, [], error.message)
        }
    },

    async deleteTimesheet(req, res) {
        try {

            // check validate
            const validateErrors = validationResult(req).formatWith(error => error.msg);
            if (!validateErrors.isEmpty()) {
                var validateErrorMsg = validateErrors.array().join(". ")
                return response(res, false, [], validateErrorMsg)
            } else {

                // delete record call from service
                const id = req.body.id;
                console.log('id', id);

                const deleteResponse = await TimesheetService.delete(id)

                // check delete record response
                if (deleteResponse > 0)
                    return response(res, true, [], "Data Deleted")
                else if (deleteResponse == 0)
                    return response(res, false, [], "Data Not Deleted")
                else
                    return response(res, false, [], deleteResponse) // updated response throw the error
            }
        } catch (error) {
            // error
            return response(res, false, [], error.message)
        }
    }
};