const express = require('express');
const router = express.Router();
const Doctor = require('../models/doctorSchema'); // Import Doctor Schema
const Appointment = require("../models/appoinmentSchema");
const Patient = require("../models/patientSchema");

// Get Doctor by ID
router.get('/getdoctor/:id', async (req, res) => {
    const doctorId = req.params.id;
  
    try {
      const doctor = await Doctor.findById(doctorId);
      if (!doctor) {
        return res.status(404).json({ message: "Doctor not found" });
      }
      res.json(doctor);
    } catch (error) {
      console.error('Error fetching doctor:', error);
      res.status(500).json({ message: "Server error" });
    }
  });

router.get('/alldoctors', async (req, res) => {
    try {
      const doctorData = await Doctor.find({});
      return res.json({ alldata: doctorData }); // Send 'alldata' to match frontend
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  });

router.get('/getdoctor/:id', async (req, res) => {
    const doctorId = req.params.id;
  
    try {
      const doctor = await Doctor.findById(doctorId);
      if (!doctor) {
        return res.status(404).json({ message: "Doctor not found" });
      }
      res.json(doctor);
    } catch (error) {
      console.error('Error fetching doctor:', error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  router.post("/appointments", async (req, res) => {
    try {
      const { patient_userId, doctor_id, appoinment_date, appoinment_time } = req.body;
  
      if (!patient_userId || !doctor_id || !appoinment_date || !appoinment_time) {
        return res.status(400).json({ message: "All fields are required" });
      }

      const existingAppointment = await Appointment.findOne({
        doctor_id,
        appoinment_date,
        appoinment_time,
      });

      if (existingAppointment) {
        return res.status(400).json({ message: "This slot is already booked!" });
      }
      const newAppointment = new Appointment({
        patient_userId,
        doctor_id,
        appoinment_date,
        appoinment_time,
      });

      await newAppointment.save();
      res.status(201).json({ message: "Appointment booked successfully" });
  
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  
  
module.exports = router;
