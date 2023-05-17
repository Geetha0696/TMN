'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('timesheets', {
      timesheet_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      timesheet_user_id: {
        allowNull: false,
        references: {
          model: 'users',
          key: 'user_id',
        },
        type: Sequelize.INTEGER
      },
      timesheet_project_id: {
        allowNull: false,
        references: {
          model: 'projects',
          key: 'project_id',
        },
        type: Sequelize.INTEGER
      },
      timesheet_title: {
        allowNull: false,
        type: Sequelize.STRING
      },
      timesheet_description: {
        type: Sequelize.TEXT
      },
      timesheet_date: {
        allowNull: false,
        type: Sequelize.DATE
      },
      timesheet_estimation: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      timesheet_billable: {
        allowNull: false,
        type: Sequelize.BOOLEAN
      },
      timesheet_status: {
        allowNull: false,
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
    await queryInterface.dropTable('timesheets');
  }
};