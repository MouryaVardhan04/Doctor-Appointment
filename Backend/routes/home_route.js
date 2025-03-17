const express = require('express');
const router = express.Router();
const Doctor = require('../models/doctorSchema'); // Import Doctor Schema

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

module.exports = router;
