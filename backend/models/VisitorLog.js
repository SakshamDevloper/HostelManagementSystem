const mongoose = require('mongoose');

const visitorLogSchema = new mongoose.Schema({
  name: { type: String, required: true },
  contact: { type: String },
  photo: { type: String },
  vehicle: { type: String },
  purpose: { type: String, required: true },
  inTime: { type: Date, default: Date.now },
  outTime: { type: Date },
  visitingStudent: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
  visitingRoom: { type: String },
  passNo: { type: String, unique: true },
  remarks: { type: String },
  recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('VisitorLog', visitorLogSchema);
