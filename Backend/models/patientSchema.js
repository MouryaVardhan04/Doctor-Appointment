const mongoose = require("mongoose");

const PatientSchema = new mongoose.Schema({
  patient_userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",  // Reference to User schema
    required: true,
  },
  patient_name: {
    type: String,
    required: true,
    trim: true,
  },
  patient_email: {
    type: String, 
    required: true, 
   sparse: true
  },
  patient_phone: {
    type: String,
    required: true,
  },
  patient_gender: {
    type: String,
    enum: ["Male", "Female", "Other"], 
    required: true,
  },
  patient_address: {
    type: String,
    required: true,
  },
  patient_dob: {
    type: Date,
    required: true,
  },
  file: {
    type: String,
    default: "default.png",
  }
}, { timestamps: true });  // Adds createdAt & updatedAt automatically

const Patient = mongoose.model("Patient", PatientSchema);

module.exports = Patient;
