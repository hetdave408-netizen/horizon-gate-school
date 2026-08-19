const mongoose = require('mongoose');

const InquirySchema = new mongoose.Schema(
  {
    // The reference enquiry form leads with the child's name, not the
    // parent's — parentName is kept for backward compatibility (the
    // Contact page form still collects it) but is no longer required.
    studentName: { type: String, trim: true, maxlength: 120 },
    parentName: { type: String, trim: true, maxlength: 120 },
    grade: { type: String, trim: true, maxlength: 40 },
    mobile: { type: String, required: true, trim: true, maxlength: 20 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 160 },
    message: { type: String, trim: true, maxlength: 2000 },
    referralSource: { type: String, trim: true, maxlength: 60 }, // "How did you reach us?"
    intent: { type: String, enum: ['enquire', 'appointment'], default: 'enquire' },
    preferredDate: { type: Date }, // only meaningful when intent === 'appointment'
    source: { type: String, trim: true, maxlength: 40, default: 'website' },
    status: { type: String, enum: ['new', 'contacted', 'closed'], default: 'new' },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Inquiry || mongoose.model('Inquiry', InquirySchema);
