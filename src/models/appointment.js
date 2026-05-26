const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const VALID_STATUSES = ['programada', 'modificada', 'cancelada', 'completada'];

const Appointment = sequelize.define('Appointment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  patient_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  doctor_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  appointment_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  // Using STRING instead of ENUM to avoid Sequelize/Postgres schema conflicts
  status: {
    type: DataTypes.STRING(30),
    defaultValue: 'programada',
    validate: { isIn: [VALID_STATUSES] }
  },
  reason: {
    type: DataTypes.TEXT
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'appointments',
  schema: 'appointment_service',
  timestamps: false
});

module.exports = Appointment;
