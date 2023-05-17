'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class project extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  project.init({
    project_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    project_name: DataTypes.STRING,
    project_start_date: DataTypes.DATE,
    project_end_date: DataTypes.DATE,
    project_status: {
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
    modelName: 'project',
  });
  return project;
};