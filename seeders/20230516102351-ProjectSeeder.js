'use strict';
const model = require("../models");

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

    // get admin user_id
    var user = await model.user.findOne({
      where: { role_id: 1 }
    });
    const user_id = user ? user.user_id : null;

    await queryInterface.bulkInsert('projects', [{
      project_name: 'Ebix',
      project_start_date: new Date(),
      project_status: true,
      createdBy: user_id,
      createdAt: new Date()
    }, {
      project_name: 'Human Bridge',
      project_start_date: new Date(),
      project_status: true,
      createdBy: user_id,
      createdAt: new Date()
    }, {
      project_name: 'Axis',
      project_start_date: new Date(),
      project_status: true,
      createdBy: user_id,
      createdAt: new Date()
    }], {});
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    return queryInterface.bulkDelete('projects', null, {});
  }
};
