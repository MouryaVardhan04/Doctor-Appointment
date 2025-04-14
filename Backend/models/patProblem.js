const mongoose = require("mongoose");

const PatientProblemSchema = new mongoose.Schema({
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Appointment",
    required: true,
  },
  problem_description: {
    type: String,
  },
  reports: [{
    filename: String,
    path: String,
    mimetype: String,
    size: Number
  }],
}, { 
  timestamps: true 
});

const PatientProblem = mongoose.model("PatientProblem", PatientProblemSchema);

module.exports = PatientProblem;
