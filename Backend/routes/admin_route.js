const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path'); // Import path module
const mongoose = require('mongoose'); // Import mongoose for ObjectId conversion
const Doctor = require('../models/doctorSchema'); // Import Doctor Schema

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




module.exports = router;
