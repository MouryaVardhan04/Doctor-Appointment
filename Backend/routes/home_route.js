const express = require('express');
const router = express.Router();
const Doctor = require('../models/doctorSchema'); // Import Doctor Schema
const Appointment = require("../models/appoinmentSchema");
const Patient = require("../models/patientSchema");
const nodemailer = require("nodemailer");
const PatientProblem = require("../models/patProblem");
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure Nodemailer Transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
      user: 'bcs_2023015@iiitm.ac.in',
      pass: '2023BCS015'
  }
});

// Create uploads directory if it doesn't exist
const uploadDir = 'uploads/patient_reports';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|pdf/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (extname) {
      return cb(null, true);
    }
    cb(new Error('Only .png, .jpg, .jpeg and .pdf files are allowed!'));
  }
});

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

 
  router.post("/appointments", async (req, res) => {
    try {
      const { patient_userId, doctor_id, appoinment_date, appoinment_time } = req.body;
  
      if (!patient_userId || !doctor_id || !appoinment_date || !appoinment_time) {
        return res.status(400).json({ message: "All fields are required" });
      }
  
      // Check if the appointment slot is already booked
      const existingAppointment = await Appointment.findOne({
        doctor_id,
        appoinment_date,
        appoinment_time,
      });
  
      if (existingAppointment) {
        return res.status(400).json({ message: "This slot is already booked!" });
      }
  
      // Create and save new appointment
      const newAppointment = new Appointment({
        patient_userId,
        doctor_id,
        appoinment_date,
        appoinment_time,
      });
  
      const savedAppointment = await newAppointment.save();
  
      // Fetch patient and doctor details
      const patient = await Patient.findOne({ patient_userId: patient_userId });
      
      const doctor = await Doctor.findById(doctor_id);

      if (!patient || !doctor) {
        return res.status(404).json({ message: "Patient or Doctor not found" });
      }
  

      // Send email confirmation
      const mailOptions = {
        from: "bcs_2023015@iiitm.ac.in",
        to: patient.patient_email, // Assuming patient schema has an email field
        subject: "Appointment Confirmation",
        text: `Dear ${patient.patient_name},\n\nYour appointment with Dr. ${doctor.doct_name} (${doctor.doct_specialization}) has been successfully booked.\n\nDate: ${appoinment_date}\nTime: ${appoinment_time}\n\nThank you!`
      };
  
      transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          console.error("Error sending email:", err);
          return res.status(500).json({ 
            message: "Appointment booked, but email not sent.",
            appointmentId: savedAppointment._id 
          });
        } else {
          return res.status(201).json({ 
            message: "Appointment booked successfully and email sent!",
            appointmentId: savedAppointment._id 
          });
        }
      });
  
    } catch (error) {
      console.error("Error booking appointment:", error);
      res.status(500).json({ message: error.message });
    }
  });
  
  
  router.get("/displayappoint/:id", async (req, res) => {
    try {
        const patientId = req.params.id;

        // Fetch all appointments of the patient
        const appointments = await Appointment.find({ patient_userId: patientId });

        if (!appointments.length) {
            return res.status(404).json({ message: "No appointments found" });
        }

        // Fetch doctor details for each appointment
        const formattedAppointments = await Promise.all(
            appointments.map(async (appointment) => {
                const doctor = await Doctor.findById(appointment.doctor_id);
                return {
                    doctor_name: doctor ? doctor.doct_name : "Unknown Doctor",
                    appointment_id: appointment._id,
                    appointment_date: appointment.appoinment_date,
                    appointment_time: appointment.appoinment_time,
                    appointment_status: appointment.appoinment_status,
                    doct_consultationFees:doctor.doct_consultationFees
                };
            })
        );

        res.json(formattedAppointments);
    } catch (error) {
        console.error("Error fetching appointments:", error);
        res.status(500).json({ message: "Server error" });
    }
});

router.delete('/deleteappoint/:id', async (req, res) => {
  try {
    const appoint_id = req.params.id;
    const appointment = await Appointment.findByIdAndDelete(appoint_id);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    res.status(200).json({ message: "Appointment deleted successfully", appointment });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.get('/bookedAppointments/:id', async (req, res) => {
  try {
    const doctId = req.params.id;
    const appointments = await Appointment.find({ 
      doctor_id: doctId,
      appoinment_status: { $ne: 'cancelled' } // Only get active appointments
    });

    if (!appointments || appointments.length === 0) {
      return res.status(200).json({ appointments: [] }); // Return empty array if no appointments
    }

    res.status(200).json({ appointments });
  } catch (error) {
    console.error("Error fetching booked appointments:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.post("/addpatientreport/:id", upload.array('reports', 5), async (req, res) => {
  const appointmentId = req.params.id;
  try {
    const { problem_description } = req.body;
    const files = req.files ? req.files.map(file => ({
      filename: file.filename,
      path: file.path,
      mimetype: file.mimetype,
      size: file.size
    })) : [];

    const patientProblem = new PatientProblem({
      appointmentId,
      problem_description,
      reports: files
    });

    await patientProblem.save();
    res.status(201).json({ 
      message: 'Patient Problem Report Added Successfully',
      appointmentId 
    });
  } catch (error) {
    console.error('Error adding patient report:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});



module.exports = router;
