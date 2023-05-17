const { response } = require("../helpers/index");
const { body, validationResult } = require('express-validator');
const TimesheetService = require("../services/TimesheetService");

module.exports = {
    validate(method) {
        // valiate the input
        switch (method) {
            case 'login': {
                return [
                    body('email', "Email is required").notEmpty(),
                    body('email', "Invalid email format").isEmail().normalizeEmail(),
                    body('password', "Password is required").notEmpty(),
                    body('password', "Password must be Strong").isStrongPassword({
                        minLength: 8,
                        minLowercase: 1,
                        minUppercase: 1,
                        minNumbers: 1
                    })
                ]
            }
        }
    },

    async getTimesheetList(req, res) {
        var data = [];
        try {
            // get lists from service
            data = await TimesheetService.list();
            console.log('data', data)

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
};