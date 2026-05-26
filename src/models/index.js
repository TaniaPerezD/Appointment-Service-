const Appointment = require('./appointment');
const VideoSession = require('./videoSession');

Appointment.hasOne(VideoSession, { foreignKey: 'appointment_id', as: 'videoSession' });
VideoSession.belongsTo(Appointment, { foreignKey: 'appointment_id', as: 'appointment' });

module.exports = { Appointment, VideoSession };
