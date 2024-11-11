// backend/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, match: /^\d{10,15}$/ }, // Phone validation: 10-15 digits
    email: { 
        type: String, 
        required: true, 
        unique: true, 
        match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, // Email validation
        lowercase: true // Ensure email is stored in lowercase
    },
    domicile: { type: String, required: true, trim: true },
    role: { 
        type: String, 
        enum: ['Mother', 'Child'], 
        required: true 
    },
    session_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Session' }, // Reference to Session model
    is_deleted: { type: Boolean, default: false }, // Optional: Soft delete flag
}, { timestamps: true });

// Add an index for email to improve performance
userSchema.index({ email: 1 });

// Pre-save hook to ensure email is always lowercase
userSchema.pre('save', function (next) {
    this.email = this.email.toLowerCase();
    next();
});

module.exports = mongoose.model('User', userSchema);