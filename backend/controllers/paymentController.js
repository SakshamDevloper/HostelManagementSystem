const Payment = require('../models/Payment');
const Student = require('../models/Student');
const logActivity = require('../utils/logger');
const { generateReceiptNo } = require('../utils/helpers');
const createNotification = require('../utils/createNotification');

exports.getPayments = async (req, res, next) => {
  try {
    const { studentId, month, year, status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (studentId) query.student = studentId;
    if (month) query.month = parseInt(month);
    if (year) query.year = parseInt(year);
    if (status) query.status = status;
    if (req.user.role === 'student') {
      const student = await Student.findOne({ user: req.user._id });
      if (student) query.student = student._id;
    }
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const payments = await Payment.find(query)
      .populate({ path: 'student', populate: { path: 'user', select: 'name email' } })
      .populate('recordedBy', 'name')
      .skip(skip).limit(parseInt(limit)).sort({ createdAt: -1 });
    const total = await Payment.countDocuments(query);
    res.json({ success: true, data: payments, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    next(error);
  }
};

exports.getPayment = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate({ path: 'student', populate: { path: 'user', select: 'name email phone' } });
    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });
    res.json({ success: true, data: payment });
  } catch (error) {
    next(error);
  }
};

exports.getStudentPayments = async (req, res, next) => {
  try {
    const payments = await Payment.find({ student: req.params.studentId })
      .populate('recordedBy', 'name').sort({ createdAt: -1 });
    res.json({ success: true, data: payments });
  } catch (error) {
    next(error);
  }
};

exports.createPayment = async (req, res, next) => {
  try {
    const data = { ...req.body, receiptNo: generateReceiptNo(), recordedBy: req.user._id };
    const payment = await Payment.create(data);
    await logActivity({ user: req.user._id, action: 'create', resource: 'payment', resourceId: payment._id, details: { receiptNo: payment.receiptNo, amount: payment.amount }, ip: req.ip });
    const student = await Student.findById(data.student).populate('user', '_id');
    if (student?.user?._id) {
      await createNotification({
        user: student.user._id,
        type: 'payment',
        title: 'Payment Received',
        message: `Payment of ₹${payment.amount} received. Receipt: ${payment.receiptNo}`,
        link: '/payments',
      });
    }
    const populated = await Payment.findById(payment._id)
      .populate({ path: 'student', populate: { path: 'user', select: 'name email' } });
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

exports.updatePayment = async (req, res, next) => {
  try {
    const payment = await Payment.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after', runValidators: true });
    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });
    res.json({ success: true, data: payment });
  } catch (error) {
    next(error);
  }
};

exports.getDues = async (req, res, next) => {
  try {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();
    const query = {
      status: { $in: ['pending', 'overdue'] },
      $or: [
        { year: { $lt: currentYear } },
        { year: currentYear, month: { $lte: currentMonth } },
      ],
    };
    if (req.user.role === 'student') {
      const student = await Student.findOne({ user: req.user._id });
      if (student) query.student = student._id;
    }
    const dues = await Payment.find(query)
      .populate({ path: 'student', populate: { path: 'user', select: 'name email phone' } }).sort({ createdAt: -1 });
    res.json({ success: true, data: dues });
  } catch (error) {
    next(error);
  }
};
