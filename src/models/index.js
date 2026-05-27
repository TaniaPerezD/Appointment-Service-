const Appointment = require('./appointment');
const VideoSession = require('./videoSession');
const User = require('./user');

Appointment.hasOne(VideoSession, { foreignKey: 'appointment_id', as: 'videoSession' });
VideoSession.belongsTo(Appointment, { foreignKey: 'appointment_id', as: 'appointment' });

Appointment.belongsTo(User, { foreignKey: 'patient_id', as: 'patient' });
Appointment.belongsTo(User, { foreignKey: 'doctor_id', as: 'doctor' });

module.exports = { Appointment, VideoSession, User };
