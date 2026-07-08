const mongoose = require('mongoose');

const roomTransferSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  fromRoom: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  toRoom: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  reason: { type: String },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('RoomTransfer', roomTransferSchema);
