const { Router } = require('express');
const {
  createAppointment,
  getByPatient,
  getByDoctor,
  updateAppointment,
  cancelAppointment,
  createVideoSession,
  updateVideoSession
} = require('../controllers/appointmentController');

const router = Router();

router.post('/', createAppointment);
router.get('/patient/:patientId', getByPatient);
router.get('/doctor/:doctorId', getByDoctor);
router.put('/:id', updateAppointment);
router.delete('/:id', cancelAppointment);
router.post('/:id/video-session', createVideoSession);
router.patch('/:id/video-session', updateVideoSession);

module.exports = router;
