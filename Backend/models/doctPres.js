const mongoose = require("mongoose");

const DoctPresSchema = new mongoose.Schema({
    // Appointment Reference
    appointmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Appointment",
        required: true,
      },

    // Patient Information
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
      patient_dob: {
        type: Date,
        required: true,
      },

    // Doctor Information
    doctor_name: {
        type: String,
        required: true,
        trim: true
    },
    doctor_email: {
        type: String,
        required: true,
        trim: true // Added trim for consistency
    },
    doctor_phone: {
        type: String, // Changed to String to handle phone numbers correctly
        required: true,
        minlength: 10, // Changed to minlength for better validation
        maxlength: 15 // Added maxlength for better validation
    },
    doctor_specialization: {
        type: String,
        required: true,
        enum: ['General Physician', 'Gynecologist', 'Dermatologist', 'Pediatricians', 'Neurologist','Gastroenterologist']
    },

    // Medical Information
    diagnosis: {
        type: String,
        required: true,
    },
    medications: [{
        name: {
            type: String,
            required: true,
        },
        dosage: {
            type: String,
            required: true,
        },
        duration: {
            type: String,
            required: true,
        },
        timing: {
            type: String,
            enum: ['Early Morning', 'Morning', 'Afternoon', 'Night', 'Morning & Night', 'Morning, Afternoon & Night'],
            required: true,
        }
    }],
    instructions: {
        type: String,
    },
    followUp: {
        type: Date,
        required: true,
    }
}, { timestamps: true });  // Adds createdAt & updatedAt automatically

const DoctorPrescription = mongoose.model("DoctorPrescription", DoctPresSchema);

module.exports = DoctorPrescription;
