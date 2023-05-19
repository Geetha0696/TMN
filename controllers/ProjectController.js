const { response } = require("../helpers/index");
const model = require("../models");

module.exports = {
    async getProjectList(req, res) {
        var data = [];
        try {

            // get all datas
            const Datas = await model.project.findAll();

            Datas.map(item => {
                data.push({
                    id: item.project_id,
                    name: item.project_name,
                })
            })
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