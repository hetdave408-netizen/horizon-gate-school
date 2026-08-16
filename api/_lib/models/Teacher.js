const mongoose = require('mongoose');

const TeacherSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    role: { type: String, required: true, trim: true, maxlength: 160 }, // e.g. "Head of STEM" or "Mathematics, Grades 9-12"
    bio: { type: String, trim: true, maxlength: 600 },
    qualifications: { type: String, trim: true, maxlength: 300 },
    photoUrl: { type: String, trim: true, maxlength: 500 },
    order: { type: Number, default: 0 }, // lower = shown first
    published: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Teacher || mongoose.model('Teacher', TeacherSchema);
