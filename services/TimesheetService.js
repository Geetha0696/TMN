const model = require("../models");

module.exports = {
    async list() {
        try {
            // get all datas
            const Datas = await model.timesheet.findAll();
            return Datas;
        } catch (error) {
            return error.message
        }
    },
}