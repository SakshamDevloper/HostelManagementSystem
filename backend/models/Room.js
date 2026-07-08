const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  roomNumber: { type: String, required: true, unique: true },
  floor: { type: Number, required: true },
  roomType: { type: String, enum: ['single', 'double', 'triple', 'dormitory'], required: true },
  capacity: { type: Number, required: true },
  occupants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
  rentPerMonth: { type: Number, required: true },
  amenities: [String],
  status: { type: String, enum: ['available', 'occupied', 'maintenance'], default: 'available' },
  inventory: [{
    item: { type: String },
    quantity: { type: Number, default: 1 },
    condition: { type: String, enum: ['good', 'needsRepair', 'replaced'], default: 'good' },
  }],
}, { timestamps: true });

roomSchema.virtual('availableSlots').get(function () {
  return this.capacity - (this.occupants?.length || 0);
});

roomSchema.set('toJSON', { virtuals: true });
roomSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Room', roomSchema);
