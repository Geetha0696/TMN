'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class timesheet extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  timesheet.init({
    timesheet_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    timesheet_user_id: DataTypes.INTEGER,
    timesheet_project_id: DataTypes.INTEGER,
    timesheet_title: DataTypes.STRING,
    timesheet_description: DataTypes.TEXT,
    timesheet_date: DataTypes.DATE,
    timesheet_estimation: DataTypes.INTEGER,
    timesheet_billable: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    timesheet_status: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    createdBy: DataTypes.INTEGER,
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: Date.now()
    },
    updatedBy: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'timesheet',
  });
  return timesheet;
};