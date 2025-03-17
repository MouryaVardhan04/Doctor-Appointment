const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
    doct_name: {
        type: String,
        required: true,
        trim: true
    },
    doct_email: {
        type: String,
        required: true,
        unique: true,
        trim: true // Added trim for consistency
    },
    doct_phone: {
        type: String, // Changed to String to handle phone numbers correctly
        required: true,
        minlength: 10, // Changed to minlength for better validation
        maxlength: 15 // Added maxlength for better validation
    },
    doct_specialization: {
        type: String,
        required: true,
        enum: ['General Physician', 'Gynecologist', 'Dermatologist', 'Pediatricians', 'Neurologist','Gastroenterologist']
    },
    doct_degree: {
        type: String,
        required: true,
        trim: true
    },
    doct_experience: {
        type: String,
        required: true,
        enum: ['1-3', '4-7', '8-12', '12+']
    },
    doct_consultationFees: {
        type: String,
        required: true,
        min: 0
    },
    doct_address: {
        type: String,
        required: true
    },
    file: {
        type: String, // URL of the uploaded image
        required: true
    },
    doct_about: {
        type: String,
        required: true
    },
    doct_createdAt: {
        type: Date,
        default: Date.now
    }
});

const Doctor = mongoose.model('Doctor', doctorSchema);

module.exports = Doctor;