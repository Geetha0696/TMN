const model = require("../models");

module.exports = {
    async list() {
        try {
            // get all datas
            const response = await model.timesheet.findAll();
            console.log('response', JSON.stringify(response, null, 2))

            return response;
        } catch (error) {
            return error.message
        }
    },

    async create(input) {
        console.log('input', input)
        try {

            // create data
            const response = await model.timesheet.create(input)
            console.log('response', response.toJSON())
            return response.timesheet_id;
        } catch (error) {
            return error.message
        }
    },

    async view(input) {
        console.log('input', input)
        try {
            // find by id
            const response = await model.timesheet.findOne({
                where: input
            });
            console.log('response', response.toJSON())

            return response;
        } catch (error) {
            return error.message
        }
    },

    async update(id, input) {
        console.log('input', input)
        try {
            // update data
            const updateResponse = await model.timesheet.update(input, { where: { timesheet_id: id } });
            console.log('updateResponse', JSON.stringify(updateResponse, null, 2))

            return updateResponse[0];
        } catch (error) {
            return error.message
        }
    },

    async delete(ids) {
        console.log('ids', ids)
        try {
            // delete data
            const deletedResponse = await model.timesheet.destroy({ where: { timesheet_id: ids } });
            console.log('deletedResponse', deletedResponse);

            return deletedResponse;
        } catch (error) {
            return error.message
        }

    }
}