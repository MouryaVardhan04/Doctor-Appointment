const mongoose = require("mongoose");

const AppointmentSchema = new mongoose.Schema({
  patient_userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",  // Reference to User schema
    required: true,
  },
  doctor_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",  // Reference to Doctor schema
    required: true,
  },
  appoinment_date:{
    type:String,
    required:true,
  },
  appoinment_time:{
    type:String,
    required:true,
  },
  appoinment_status: {
    type: String,
    enum: ["Accepted", "Rejected"],
    default: "Accepted"
  },  
  payment_status: {
    type: String,
    enum: ["Pending", "Paid"],
    default: "Pending"
  }
}, { timestamps: true });  // Adds createdAt & updatedAt automatically

const Appoinment = mongoose.model("Appoinment", AppointmentSchema);

module.exports = Appoinment;
