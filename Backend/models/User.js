const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        minlength: 4,  // Fixed 'min' to 'minlength'
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    }
}, { timestamps: true });  // Adds createdAt & updatedAt automatically

const User = mongoose.model('User', userSchema);

module.exports = User;
