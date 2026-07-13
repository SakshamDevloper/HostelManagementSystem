const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  category: {
    type: String,
    enum: ['plumbing', 'electrical', 'furniture', 'cleanliness', 'noise', 'security', 'other'],
    required: true,
  },
  description: { type: String, required: true },
  attachments: [{ url: String }],
  status: {
    type: String,
    enum: ['pending', 'inProgress', 'resolved', 'rejected'],
    default: 'pending',
  },
  resolvedAt: { type: Date },
  resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  feedback: { type: String },
  feedbackRating: { type: Number, min: 1, max: 5 },
}, { timestamps: true });

module.exports = mongoose.model('Complaint', complaintSchema);
