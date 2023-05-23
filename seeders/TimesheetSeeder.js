'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        /**
         * Add seed commands here.
         *
         * Example:
         * await queryInterface.bulkInsert('People', [{
         *   name: 'John Doe',
         *   isBetaMember: false
         * }], {});
        */
        for (var i = 0; i < 30; i++) {
            await queryInterface.bulkInsert('timesheets', [{
                timesheet_user_id: i % 2 == 0 ? 2 : 3,
                timesheet_project_id: i < 10 ? 1 : (i < 20 ? 2 : 3),
                timesheet_title: 'demo ' + i,
                timesheet_date: new Date("2023/05/" + (i + 1)),
                timesheet_estimation: '5',
                timesheet_billable_type: i < 15 ? 'billable' : 'non billable',
                timesheet_status: i < 15 ? true : false,
                createdBy: 1,
                createdAt: new Date()
            }]);
        }

    },

    async down(queryInterface, Sequelize) {
        /**
         * Add commands to revert seed here.
         *
         * Example:
         * await queryInterface.bulkDelete('People', null, {});
         */
        return queryInterface.bulkDelete('timesheets', null, {});
    }
};
