'use strict';

const bcrypt = require('bcryptjs');

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

    const users = [{
      first_name: 'admin',
      email: 'admin@gmail.com',
      password: '123456',
      role_id: 1,
      status: 'Active',
      createdAt: new Date()
    }, {
      first_name: 'leader',
      email: 'leader@gmail.com',
      password: '123456',
      role_id: 3,
      status: 'Active',
      createdAt: new Date()
    }, {
      first_name: 'user',
      email: 'user@gmail.com',
      password: '123456',
      role_id: 4,
      status: 'Active',
      createdAt: new Date()
    }];

    for (const user of users) {

      // password bcrypt
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(user.password, salt);
      user.password = hashedPassword;

      await queryInterface.bulkInsert('users', [user]);
    }
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    return queryInterface.bulkDelete('users', null, {});
  }
};
