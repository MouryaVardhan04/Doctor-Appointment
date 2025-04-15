const express = require('express');
const router = express.Router();
const Doctor = require('../models/doctorSchema'); // Import Doctor Schema
const Appointment = require("../models/appoinmentSchema");
const Patient = require("../models/patientSchema");
const nodemailer = require("nodemailer");
const PatientProblem = require("../models/patProblem");
const DoctorPrescription = require("../models/doctPres");
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure Nodemailer Transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
      user: 'img_2023028@iiitm.ac.in',
      pass: 'Vi@27052004'
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
  
      await newAppointment.save();
      // Fetch patient and doctor details
      const patient = await Patient.findOne({ patient_userId: patient_userId });
      
      const doctor = await Doctor.findById(doctor_id);

      if (!patient || !doctor) {
        return res.status(404).json({ message: "Patient or Doctor not found" });
      }
  

      // Send email confirmation
      const mailOptions = {
        from: process.env.EMAIL_USER || "bcs_2023015@iiitm.ac.in", // Use configured email/env var
        to: patient.patient_email, 
        subject: "✅ Your Appointment is Confirmed!",
        // Plain text version (fallback)
        text: 
`Hi ${patient.patient_name},

Great news! Your appointment is confirmed.

Here are the details:

Doctor: Dr. ${doctor.doct_name}
Specialization: ${doctor.doct_specialization}
Date: ${appoinment_date}
Time: ${appoinment_time}

Clinic: [Your Clinic Name] - [Optional Clinic Address/Phone]

We look forward to seeing you!

If you need to reschedule or have any questions, please contact us at [Your Contact Info].

Best regards,
[Your Clinic/Platform Name] Team`,
        // HTML version for better formatting
        html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: #2e8b57;">Appointment Confirmed!</h2>
          <p>Hi ${patient.patient_name},</p>
          <p>Great news! Your appointment with <strong>Dr. ${doctor.doct_name}</strong> has been successfully booked.</p>
          <hr style="border: none; border-top: 1px solid #eee;">
          <h3 style="color: #333;">Appointment Details:</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee; width: 120px;"><strong>Doctor:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">Dr. ${doctor.doct_name}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Specialization:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">${doctor.doct_specialization}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Date:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">${appoinment_date}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Time:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">${appoinment_time}</td>
            </tr>
             <tr>
              <td style="padding: 8px;"><strong>Clinic:</strong></td>
              <td style="padding: 8px;">[Docubook] - [IIIT Gwalior/9381340810]</td>
            </tr>
          </table>
          <hr style="border: none; border-top: 1px solid #eee;">
          <p>We look forward to seeing you!</p>
          <p>If you need to reschedule or have any questions, please don't hesitate to contact us at <a href="mailto:[bcs_2023015@iiitm.ac.in]">[bcs_2023015@iiitm.ac.in]</a> or call us at [9381340810].</p>
          <br>
          <p>Best regards,</p>
          <p><strong>The [Docubook] Team</strong></p>
        </div>
        `
      };
  
      transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          console.error("Error sending email:", err);
          // Still return success with appointment ID even if email fails
          return res.status(201).json({ 
            message: "Appointment booked successfully!",
            appointmentId: newAppointment._id
          });
        } else {
          return res.status(201).json({ 
            message: "Appointment booked successfully and email sent!",
            appointmentId: newAppointment._id
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

router.get('/getappointment/:id', async (req, res) => {
  try {
    const appoint_id = req.params.id;
    const appointment = await Appointment.findById(appoint_id);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    res.status(200).json({ message: "Appointment fetched successfully", appointment });
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

router.get("/getDoctPres/:patientUserId", async (req, res) => {
  try {
    const patientUserId = req.params.patientUserId;

    // 1. Find all appointments for the given patient user ID
    const appointments = await Appointment.find({ patient_userId: patientUserId });

    if (!appointments || appointments.length === 0) {
      // If no appointments, the patient has no prescriptions via this app
      return res.status(200).json({ doctorPrescriptions: [] }); 
    }

    // 2. Extract appointment IDs
    const appointmentIds = appointments.map(app => app._id);

    // 3. Find all prescriptions linked to these appointment IDs
    const doctorPrescriptions = await DoctorPrescription.find({ 
      appointmentId: { $in: appointmentIds } 
    }).sort({ createdAt: -1 }); // Sort by creation date, newest first

    // 4. Return the found prescriptions
    res.status(200).json({ doctorPrescriptions });

  } catch (error) {
    console.error("Error fetching patient prescriptions:", error);
    res.status(500).json({ message: "Server error while fetching prescriptions" });
  }
});


module.exports = router;

