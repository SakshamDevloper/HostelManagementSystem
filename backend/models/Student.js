const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  studentId: { type: String, required: true, unique: true },
  dateOfBirth: { type: Date },
  gender: { type: String, enum: ['male', 'female', 'other'] },
  address: { type: String },
  guardian: {
    name: { type: String },
    phone: { type: String },
    email: { type: String },
    relation: { type: String },
  },
  emergencyContact: { type: String },
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', default: null },
  checkInDate: { type: Date },
  checkOutDate: { type: Date },
  status: { type: String, enum: ['active', 'checkedOut'], default: 'active' },
  documents: [{ name: String, url: String }],
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);
