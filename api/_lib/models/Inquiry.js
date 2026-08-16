const mongoose = require('mongoose');

const InquirySchema = new mongoose.Schema(
  {
    parentName: { type: String, required: true, trim: true, maxlength: 120 },
    grade: { type: String, trim: true, maxlength: 40 },
    mobile: { type: String, required: true, trim: true, maxlength: 20 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 160 },
    message: { type: String, trim: true, maxlength: 2000 },
    source: { type: String, trim: true, maxlength: 40, default: 'website' },
    status: { type: String, enum: ['new', 'contacted', 'closed'], default: 'new' },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Inquiry || mongoose.model('Inquiry', InquirySchema);
