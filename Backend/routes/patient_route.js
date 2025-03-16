const express = require("express");
const cookieParser = require('cookie-parser');
const router = express.Router();
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const Patient = require("../models/patientSchema");
const fs = require("fs");
const secret = process.env.JWT_SECRET || "your_secret_key";

const app = express();
app.use(cookieParser()); // Use cookie-parser middleware
// Serve uploaded files
router.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Storage Setup for Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../uploads"); // Adjust the path if needed
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true }); // Create uploads directory if not exists
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Generate unique filename
  },
});

const upload = multer({ storage });

router.post('/addpatient', upload.single('file'), async (req, res) => {
  try {
    console.log('Received Data:', req.body);
    console.log('Uploaded File:', req.file);

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded!" });
    }
    
    if (!req.body.patient_email || req.body.patient_email.trim() === "") {
      return res.status(400).json({ error: "Email is required" });
    }
    
    const newPatient = new Patient({
      patient_userId: req.body.patient_userId,
      patient_name: req.body.patient_name,
      patient_email: req.body.patient_email,
      patient_phone: req.body.patient_phone,
      patient_gender: req.body.patient_gender,
      patient_address: req.body.patient_address,
      patient_dob: req.body.patient_dob,
      file: req.file.filename, // Save filename only
    });

    await newPatient.save();
    res.status(201).json({ message: 'Patient added successfully!', newPatient });
  } catch (error) {
    console.error('Error in patient creation:', error);
    res.status(400).json({ error: error.message });
  }
});


// Get Patient by ID
router.get("/getpatient/:id", async (req, res) => {
  try {
    const patient = await Patient.findOne({ patient_userId: req.params.id });

    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    const patientWithImageURL = {
      ...patient.toObject(),
      file: patient.file
        ? `http://localhost:8000/uploads/${patient.file}`
        : null,
    };

    res.json(patientWithImageURL);
  } catch (error) {
    console.error("Error fetching patient:", error);
    res.status(500).json({ message: "Server error" });
  }
});


// Update Patient
router.put("/updatepatient/:id", upload.single("file"), async (req, res) => {
  try {
    const { id } = req.params; // Get patient ID from URL
    let updatedData = req.body; // Get new data

    // If a file is uploaded, add filename to updatedData
    if (req.file) {
      updatedData.file = req.file.filename;
    }

    // Find patient by `patient_userId` and update it
    const updatedPatient = await Patient.findOneAndUpdate(
      { patient_userId: id }, // Find patient by userId
      { $set: updatedData },  // Update fields
      { new: true }           // Return updated document
    );

    if (!updatedPatient) {
      return res.status(404).json({ message: "Patient not found!" });
    }

    res.status(200).json(updatedPatient);
  } catch (error) {
    console.error("Error updating patient:", error);
    res.status(500).json({ message: "Error updating patient", error });
  }
});


module.exports = router;

