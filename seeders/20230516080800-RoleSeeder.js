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
    return queryInterface.bulkInsert('roles', [{
      role_id: 1,
      role_name: 'Adminer',
      role_status: true,
      createdAt: new Date()
    }, {
      role_id: 2,
      role_name: 'Admin',
      role_status: true,
      createdAt: new Date()
    }, {
      role_id: 3,
      role_name: 'Leader',
      role_status: true,
      createdAt: new Date()
    }, {
      role_id: 4,
      role_name: 'Employee',
      role_status: true,
      createdAt: new Date()
    }]);
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    return queryInterface.bulkDelete('roles', null, {});
  }
};
