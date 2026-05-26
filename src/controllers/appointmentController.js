const { v4: uuidv4 } = require('uuid');
const { Op } = require('sequelize');
const { Appointment, VideoSession } = require('../models');

const TERMINAL_STATUSES = ['cancelada', 'completada'];
const SLOT_MS = 30 * 60 * 1000;

const findConflict = async ({ patient_id, doctor_id, appointment_date, excludeId }) => {
  const date = new Date(appointment_date);
  const where = {
    status: { [Op.notIn]: ['cancelada'] },
    appointment_date: {
      [Op.gte]: new Date(date.getTime() - SLOT_MS),
      [Op.lt]: new Date(date.getTime() + SLOT_MS)
    },
    [Op.or]: [{ patient_id }, { doctor_id }]
  };
  if (excludeId) where.id = { [Op.ne]: excludeId };
  return Appointment.findOne({ where });
};

const createAppointment = async (req, res) => {
  try {
    const { patient_id, doctor_id, appointment_date, reason } = req.body;

    if (!patient_id || !doctor_id || !appointment_date) {
      return res.status(400).json({
        error: 'patient_id, doctor_id y appointment_date son requeridos'
      });
    }

    if (new Date(appointment_date) <= new Date()) {
      return res.status(400).json({
        error: 'La fecha de la cita debe ser futura'
      });
    }

    const conflict = await findConflict({ patient_id, doctor_id, appointment_date });
    if (conflict) {
      const who = conflict.patient_id === patient_id ? 'paciente' : 'doctor';
      return res.status(409).json({
        error: `El ${who} ya tiene una cita en ese horario (slot de 30 min)`
      });
    }

    const appointment = await Appointment.create({
      patient_id,
      doctor_id,
      appointment_date,
      reason
    });

    return res.status(201).json(appointment);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getByPatient = async (req, res) => {
  try {
    const { patientId } = req.params;

    const appointments = await Appointment.findAll({
      where: { patient_id: patientId },
      include: [{ model: VideoSession, as: 'videoSession', required: false }],
      order: [['appointment_date', 'ASC']]
    });

    return res.json(appointments);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getByDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;

    const appointments = await Appointment.findAll({
      where: { doctor_id: doctorId },
      include: [{ model: VideoSession, as: 'videoSession', required: false }],
      order: [['appointment_date', 'ASC']]
    });

    return res.json(appointments);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { appointment_date, reason, status } = req.body;

    const appointment = await Appointment.findByPk(id);
    if (!appointment) {
      return res.status(404).json({ error: 'Cita no encontrada' });
    }

    if (TERMINAL_STATUSES.includes(appointment.status)) {
      return res.status(400).json({
        error: `No se puede modificar una cita con estado '${appointment.status}'`
      });
    }

    if (appointment_date && new Date(appointment_date) <= new Date()) {
      return res.status(400).json({ error: 'La nueva fecha debe ser futura' });
    }

    if (appointment_date) {
      const conflict = await findConflict({
        patient_id: appointment.patient_id,
        doctor_id: appointment.doctor_id,
        appointment_date,
        excludeId: id
      });
      if (conflict) {
        const who = conflict.patient_id === appointment.patient_id ? 'paciente' : 'doctor';
        return res.status(409).json({
          error: `El ${who} ya tiene una cita en ese horario (slot de 30 min)`
        });
      }
    }

    const updates = {};
    if (appointment_date) updates.appointment_date = appointment_date;
    if (reason) updates.reason = reason;
    // Allow explicit status change (e.g. to 'completada'), otherwise mark as 'modificada'
    updates.status = status || 'modificada';

    await appointment.update(updates);
    return res.json(appointment);
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ error: error.errors.map(e => e.message).join(', ') });
    }
    return res.status(500).json({ error: error.message });
  }
};

const cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await Appointment.findByPk(id);
    if (!appointment) {
      return res.status(404).json({ error: 'Cita no encontrada' });
    }

    if (appointment.status === 'cancelada') {
      return res.status(400).json({ error: 'La cita ya está cancelada' });
    }

    if (appointment.status === 'completada') {
      return res.status(400).json({ error: 'No se puede cancelar una cita completada' });
    }

    await appointment.update({ status: 'cancelada' });
    return res.json({ message: 'Cita cancelada exitosamente', id });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const createVideoSession = async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await Appointment.findByPk(id);
    if (!appointment) {
      return res.status(404).json({ error: 'Cita no encontrada' });
    }

    if (appointment.status === 'cancelada') {
      return res.status(400).json({
        error: 'No se puede crear una sesión de video para una cita cancelada'
      });
    }

    // Return existing session if already created
    const existing = await VideoSession.findOne({ where: { appointment_id: id } });
    if (existing) {
      return res.json(existing);
    }

    const sessionId = uuidv4();
    const session = await VideoSession.create({
      appointment_id: id,
      session_url: `https://video.mediconnect.app/session/${sessionId}`,
      // Simulated reference to encrypted S3 recording
      encrypted_recording_url: `s3://mediconnect-recordings/session-${sessionId}.enc`,
      status: 'pendiente'
    });

    return res.status(201).json(session);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createAppointment,
  getByPatient,
  getByDoctor,
  updateAppointment,
  cancelAppointment,
  createVideoSession
};
