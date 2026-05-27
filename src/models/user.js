const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true
  },
  full_name: {
    type: DataTypes.STRING(150)
  },
  email: {
    type: DataTypes.STRING(150)
  },
  role: {
    type: DataTypes.STRING(30)
  },
  dni: {
    type: DataTypes.STRING(30)
  },
  phone: {
    type: DataTypes.STRING(30)
  },
  is_active: {
    type: DataTypes.BOOLEAN
  }
}, {
  tableName: 'users',
  timestamps: false
});

module.exports = User;
