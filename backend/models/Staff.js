const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  staffId: { type: String, required: true, unique: true },
  designation: {
    type: String,
    enum: ['warden', 'cleaner', 'security', 'maintenance', 'admin', 'accountant'],
    required: true,
  },
  joiningDate: { type: Date, default: Date.now },
  salary: { type: Number },
  shift: { type: String, enum: ['morning', 'evening', 'night', 'general'], default: 'general' },
  duties: [{
    day: { type: String },
    shift: { type: String },
    area: { type: String },
  }],
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Staff', staffSchema);
