const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  amount: { type: Number, required: true },
  lateFee: { type: Number, default: 0 },
  totalAmount: { type: Number },
  month: { type: Number, required: true },
  year: { type: Number, required: true },
  dueDate: { type: Date },
  paidAt: { type: Date, default: Date.now },
  paymentMethod: { type: String, enum: ['cash', 'bankTransfer', 'online', 'cheque'], default: 'cash' },
  transactionId: { type: String },
  type: { type: String, enum: ['rent', 'deposit', 'fine', 'other'], default: 'rent' },
  status: { type: String, enum: ['paid', 'pending', 'overdue'], default: 'paid' },
  receiptNo: { type: String, unique: true },
  notes: { type: String },
  recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

paymentSchema.pre('save', function (next) {
  this.totalAmount = (this.amount || 0) + (this.lateFee || 0);
  next();
});

module.exports = mongoose.model('Payment', paymentSchema);
