const mongoose = require('mongoose');

const NewsPostSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    category: { type: String, required: true, enum: ['News', 'Announcement', 'Event', 'Competition', 'Celebration'], default: 'News' },
    date: { type: Date, required: true },
    excerpt: { type: String, trim: true, maxlength: 500 },
    imageUrl: { type: String, trim: true, maxlength: 500 },
    published: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.models.NewsPost || mongoose.model('NewsPost', NewsPostSchema);
