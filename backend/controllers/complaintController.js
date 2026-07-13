const Complaint = require('../models/Complaint');
const Student = require('../models/Student');
const logActivity = require('../utils/logger');
const createNotification = require('../utils/createNotification');
const { getIO } = require('../config/socket');

exports.getComplaints = async (req, res, next) => {
  try {
    const { status, category, studentId } = req.query;
    const query = {};
    if (status) query.status = status;
    if (category) query.category = category;
    if (studentId) query.student = studentId;
    if (req.user.role === 'student') {
      const student = await Student.findOne({ user: req.user._id });
      if (student) query.student = student._id;
    }
    const complaints = await Complaint.find(query)
      .populate({ path: 'student', populate: { path: 'user', select: 'name' } })
      .populate('resolvedBy', 'user')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: complaints });
  } catch (error) {
    next(error);
  }
};

exports.createComplaint = async (req, res, next) => {
  try {
    const student = await Student.findOne({ user: req.user._id });
    if (!student && req.user.role === 'student') {
      return res.status(400).json({ success: false, message: 'Student profile not found' });
    }
    const studentId = req.body.student || student?._id;
    const recent = await Complaint.findOne({
      student: studentId,
      description: req.body.description,
      createdAt: { $gte: new Date(Date.now() - 30000) },
    });
    if (recent) {
      return res.status(429).json({ success: false, message: 'Duplicate complaint detected. Please wait before submitting again.' });
    }
    const data = {
      ...req.body,
      student: studentId,
    };
    const complaint = await Complaint.create(data);
    await logActivity({ user: req.user._id, action: 'create', resource: 'complaint', resourceId: complaint._id, details: { category: complaint.category }, ip: req.ip });
    const io = getIO();
    if (io) io.emit('complaint:new', { complaint: { _id: complaint._id, category: complaint.category, status: complaint.status, createdAt: complaint.createdAt } });
    const populated = await Complaint.findById(complaint._id)
      .populate({ path: 'student', populate: { path: 'user', select: 'name' } });
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

exports.updateComplaintStatus = async (req, res, next) => {
  try {
    const { status, resolvedBy } = req.body;
    const update = { status };
    if (status === 'resolved') {
      update.resolvedAt = new Date();
      update.resolvedBy = resolvedBy || req.user._id;
    }
    const complaint = await Complaint.findByIdAndUpdate(req.params.id, update, { returnDocument: 'after' })
      .populate({ path: 'student', populate: { path: 'user', select: 'name email' } });
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });
    await logActivity({ user: req.user._id, action: 'updateStatus', resource: 'complaint', resourceId: complaint._id, details: { status }, ip: req.ip });
    const io = getIO();
    if (io) io.emit('complaint:statusChange', { complaintId: complaint._id, status });
    if (complaint.student?.user?._id) {
      await createNotification({
        user: complaint.student.user._id,
        type: 'complaint',
        title: 'Complaint Updated',
        message: `Your complaint (${complaint.category}) is now ${status}`,
        link: '/complaints',
      });
    }
    res.json({ success: true, data: complaint });
  } catch (error) {
    next(error);
  }
};

exports.addFeedback = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });
    if (req.user.role === 'student') {
      const student = await Student.findOne({ user: req.user._id });
      if (!student || complaint.student.toString() !== student._id.toString()) {
        return res.status(403).json({ success: false, message: 'Not authorized to give feedback on this complaint' });
      }
    }
    complaint.feedback = req.body.feedback;
    complaint.feedbackRating = req.body.feedbackRating;
    await complaint.save();
    res.json({ success: true, data: complaint });
  } catch (error) {
    next(error);
  }
};
