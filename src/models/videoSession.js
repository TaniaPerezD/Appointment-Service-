const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const VideoSession = sequelize.define('VideoSession', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  appointment_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  session_url: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  encrypted_recording_url: {
    type: DataTypes.TEXT
  },
  status: {
    type: DataTypes.STRING(30),
    defaultValue: 'pendiente',
    validate: { isIn: [['pendiente', 'iniciada', 'finalizada']] }
  },
  started_at: {
    type: DataTypes.DATE
  },
  ended_at: {
    type: DataTypes.DATE
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'video_sessions',
  schema: 'appointment_service',
  timestamps: false
});

module.exports = VideoSession;
