const express = require('express');
const appointmentRoutes = require('./routes/appointmentRoutes');

const app = express();

app.use(express.json());

app.get('/health', (_req, res) =>
  res.json({ status: 'ok', service: 'appointment-service' })
);

app.use('/appointments', appointmentRoutes);

module.exports = app;
