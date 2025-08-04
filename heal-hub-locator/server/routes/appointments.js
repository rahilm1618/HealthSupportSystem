
const express = require('express');
const { ObjectId } = require('mongodb');
const router = express.Router();

// Clerk JWT Auth middleware import
const clerkAuth = require('../utils/clerkAuth');

// Get all appointments for a user (by Clerk userId string)
router.get('/', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ message: 'userId required' });
    const appointments = await db.collection('appointments')
      .find({ user_id: userId })
      .sort({ appointment_date: -1 })
      .toArray();
    // Get doctor and hospital details for each appointment
    const populatedAppointments = await Promise.all(appointments.map(async (appointment) => {
      const doctor = await db.collection('doctors').findOne({ _id: new ObjectId(appointment.doctor_id) });
      const hospital = await db.collection('hospitals').findOne({ _id: new ObjectId(appointment.hospital_id) });
      return {
        id: appointment._id.toString(),
        doctorId: appointment.doctor_id.toString(),
        hospitalId: appointment.hospital_id.toString(),
        userId: appointment.user_id,
        date: appointment.appointment_date,
        time: appointment.appointment_time,
        status: appointment.status,
        reason: appointment.reason || '',
        doctorName: doctor ? doctor.name : 'Unknown Doctor',
        doctorSpeciality: doctor ? doctor.speciality : '',
        hospitalName: hospital ? hospital.name : 'Unknown Hospital',
        createdAt: appointment.created_at
      };
    }));
    res.json(populatedAppointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Book a new appointment (by Clerk userId string)
router.post('/', async (req, res) => {
  try {
    const { doctorId, hospitalId, date, time, reason, userId } = req.body;
    if (!doctorId || !hospitalId || !date || !time || !userId) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }
    const db = req.app.locals.db;
    // Verify doctor and hospital exist
    const doctor = await db.collection('doctors').findOne({ _id: new ObjectId(doctorId) });
    const hospital = await db.collection('hospitals').findOne({ _id: new ObjectId(hospitalId) });
    if (!doctor || !hospital) {
      return res.status(404).json({ message: 'Doctor or hospital not found' });
    }
    // Create new appointment
    const newAppointment = {
      user_id: userId,
      doctor_id: new ObjectId(doctorId),
      hospital_id: new ObjectId(hospitalId),
      appointment_date: date,
      appointment_time: time,
      reason: reason || '',
      status: 'scheduled',
      created_at: new Date(),
      updated_at: new Date()
    };
    const result = await db.collection('appointments').insertOne(newAppointment);
    res.status(201).json({
      id: result.insertedId,
      doctorId,
      hospitalId,
      userId,
      date,
      time,
      reason: reason || '',
      status: 'scheduled',
      doctorName: doctor.name,
      doctorSpeciality: doctor.speciality,
      hospitalName: hospital.name,
      createdAt: newAppointment.created_at
    });
  } catch (error) {
    console.error('Error booking appointment:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Cancel an appointment
router.patch('/:id/cancel', clerkAuth, async (req, res) => {
  try {
    const db = req.app.locals.db;
    // Support Clerk userId (string) and legacy ObjectId
    const appointment = await db.collection('appointments').findOne({ 
      _id: new ObjectId(req.params.id),
      $or: [
        { user_id: req.userId },
        { user_id: req.user?.clerkUserId }
      ]
    });
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    await db.collection('appointments').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { status: 'cancelled', updated_at: new Date() } }
    );
    res.json({ message: 'Appointment cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
