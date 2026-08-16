const mongoose = require('mongoose');

const GalleryItemSchema = new mongoose.Schema(
  {
    caption: { type: String, required: true, trim: true, maxlength: 200 },
    category: { type: String, required: true, enum: ['annual-function', 'sports-day', 'campus-life', 'classrooms', 'cultural'], default: 'campus-life' },
    imageUrl: { type: String, required: true, trim: true, maxlength: 500 },
    fullImageUrl: { type: String, trim: true, maxlength: 500 },
    published: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.models.GalleryItem || mongoose.model('GalleryItem', GalleryItemSchema);
