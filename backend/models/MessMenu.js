const mongoose = require('mongoose');

const messMenuSchema = new mongoose.Schema({
  mess: {
    type: String,
    enum: ['North', 'South'],
    required: true,
  },
  date: { type: Date, required: true },
  day: { type: String, required: true },
  meal: {
    type: String,
    enum: ['Breakfast', 'Lunch', 'Dinner'],
    required: true,
  },
  items: [{ type: String, required: true }],
  notes: { type: String },
}, { timestamps: true });

messMenuSchema.index({ mess: 1, date: 1, meal: 1 }, { unique: true });

module.exports = mongoose.model('MessMenu', messMenuSchema);
