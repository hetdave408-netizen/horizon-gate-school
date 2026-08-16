const mongoose = require('mongoose');

const VisitBookingSchema = new mongoose.Schema(
  {
    parentName: { type: String, required: true, trim: true, maxlength: 120 },
    studentName: { type: String, required: true, trim: true, maxlength: 120 },
    grade: { type: String, required: true, trim: true, maxlength: 40 },
    mobile: { type: String, required: true, trim: true, maxlength: 20 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 160 },
    visitDate: { type: Date, required: true },
    timeSlot: { type: String, required: true, trim: true, maxlength: 40 },
    visitors: { type: Number, min: 1, max: 6, default: 2 },
    remarks: { type: String, trim: true, maxlength: 2000 },
    status: { type: String, enum: ['pending', 'confirmed', 'completed', 'cancelled'], default: 'pending' },
  },
  { timestamps: true }
);

module.exports = mongoose.models.VisitBooking || mongoose.model('VisitBooking', VisitBookingSchema);
