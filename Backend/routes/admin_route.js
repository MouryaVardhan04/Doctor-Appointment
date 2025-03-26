const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path'); // Import path module
const mongoose = require('mongoose'); // Import mongoose for ObjectId conversion
const Doctor = require('../models/doctorSchema'); // Import Doctor Schema
const Patient = require("../models/patientSchema");
const Appointment = require("../models/appoinmentSchema");

const app = express();

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Storage Setup for Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Save files in the 'uploads' folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
  }
});

const upload = multer({ storage: storage });

router.post('/adddoctor', upload.single('file'), async (req, res) => {
  try {
    // Destructure request body
    const { doct_name, doct_email, doct_phone, doct_specialization, doct_degree,
      doct_experience, doct_consultationFees, doct_address, doct_about } = req.body;

    // Validate input fields
    if (!doct_name || !doct_email || !doct_phone ||
      !doct_specialization || !doct_degree || !doct_experience || !doct_consultationFees ||
      !doct_address || !doct_about) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Get the uploaded file's filename
    const file = req.file ? req.file.filename : null;

    // Create new doctor entry
    const newDoctor = new Doctor({
      doct_name,
      doct_email,
      doct_phone,
      doct_specialization,
      doct_degree,
      doct_experience,
      doct_consultationFees,
      doct_address,
      doct_about,
      file
    });

    // Save doctor to DB
    await newDoctor.save();
    res.status(201).json({ message: "Doctor added successfully", doctor: newDoctor });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
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

// DELETE Doctor by ID
router.delete("/deletedoctor/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const doctor = await Doctor.findByIdAndDelete(id);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found!" });
    }
    res.status(200).json({ message: "Doctor deleted successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting doctor", error });
  }
});

router.put("/editdoctor/:id", upload.single("file"), async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    if (req.file) {
      updatedData.file = req.file.path; // Save file path
    }
    const updatedDoctor = await Doctor.findByIdAndUpdate(id, updatedData, { new: true });

    if (!updatedDoctor) {
      return res.status(404).json({ message: "Doctor not found!" });
    }

    res.status(200).json(updatedDoctor);
  } catch (error) {
    console.error("Error updating doctor:", error);
    res.status(500).json({ message: "Error updating doctor", error });
  }
});

// Appointments 
router.get("/adminAppoint", async (req, res) => {
  try {
    // Fetch all appointments
    const appointments = await Appointment.find({});
    
    if (!appointments.length) {
      return res.status(404).json({ message: "No appointments found" });
    }

    // Fetch doctor and patient details for each appointment
    const formattedAppointments = await Promise.all(
      appointments.map(async (appointment) => {
        // Fetch patient details
        const patientUser = await Patient.findOne({patient_userId:appointment.patient_userId});

        
        // Fetch doctor details
        const doctor = await Doctor.findById(appointment.doctor_id);
        
                // Calculate patient age from date of birth

                let formattedDob = "Unknown";
                if (patientUser && patientUser.patient_dob) {
                  const birthDate = new Date(patientUser.patient_dob);
                  if (!isNaN(birthDate.getTime())) {  // Check if it's a valid date
                    formattedDob = birthDate.toISOString().split("T")[0];  // Extract only YYYY-MM-DD
                  }
                }
        return {
          doctor_name: doctor ? doctor.doct_name : "Unknown Doctor",
          doctor_img: doctor ? doctor.file : "No image",
          doct_consultationFees: doctor ? doctor.doct_consultationFees : "N/A",
          patient_name: patientUser ? patientUser.patient_name : "Unknown Patient",
          patient_img: patientUser ? patientUser.file : "No image",
          patient_dob:  formattedDob,
          appointment_id: appointment._id,
          appointment_date: appointment.appoinment_date,
          appointment_time: appointment.appoinment_time,
          appointment_status: appointment.appoinment_status
        };
      })
    );

    res.json(formattedAppointments);
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/acceptAppointment/:id", async (req, res) => {
  try {
    const appointment_id = req.params.id;
    const { appointment_status } = req.body; // Extract status correctly

    if (!appointment_status) {
      return res.status(400).json({ message: "Appointment status is required" });
    }

    // Find the appointment by ID and update the status
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      appointment_id,
      { appointment_status }, // Update only the status
      { new: true } // Return the updated document
    );

    if (!updatedAppointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    res.json({
      message: `Appointment status updated to '${appointment_status}' successfully`,
      appointment: updatedAppointment,
    });
  } catch (error) {
    console.error("Error updating appointment status:", error);
    res.status(500).json({ message: "Server error" });
  }
});




module.exports = router;
