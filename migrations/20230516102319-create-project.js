'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('projects', {
      project_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      project_name: {
        allowNull: false,
        type: Sequelize.STRING
      },
      project_start_date: {
        allowNull: false,
        type: Sequelize.DATE
      },
      project_end_date: {
        type: Sequelize.DATE
      },
      project_status: {
        type: Sequelize.BOOLEAN
      },
      createdBy: {
        allowNull: false,
        references: {
          model: 'users',
          key: 'user_id',
        },
        type: Sequelize.INTEGER
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedBy: {
        references: {
          model: 'users',
          key: 'user_id',
        },
        type: Sequelize.INTEGER
      },
      updatedAt: {
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('projects');
  }
};