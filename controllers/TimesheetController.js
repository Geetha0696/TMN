const { response } = require("../helpers/index");
const { body, validationResult } = require('express-validator');
const TimesheetService = require("../services/TimesheetService");
const model = require("../models");

module.exports = {
    validate(method) {
        // valiate the input
        switch (method) {
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
            // get lists from service
            data = await TimesheetService.list();

            if (data.length > 0) {
                return response(res, true, data, "")
            } else {
                return response(res, false, data, "No Records Found")
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
                    return response(res, true, [], "Data Created")
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

                data = await TimesheetService.view({ timesheet_id: id });

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