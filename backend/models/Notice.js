const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  targetAudience: { type: String, enum: ['all', 'students', 'staff'], default: 'all' },
  priority: { type: String, enum: ['low', 'normal', 'high', 'urgent'], default: 'normal' },
  isActive: { type: Boolean, default: true },
  expiresAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Notice', noticeSchema);
