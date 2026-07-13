const LeaveRequest = require('../models/LeaveRequest');
const Student = require('../models/Student');
const createNotification = require('../utils/createNotification');

exports.getLeaves = async (req, res, next) => {
  try {
    const { status, studentId } = req.query;
    const query = {};
    if (status) query.status = status;
    if (studentId) query.student = studentId;
    if (req.user.role === 'student') {
      const student = await Student.findOne({ user: req.user._id });
      if (student) query.student = student._id;
    }
    const leaves = await LeaveRequest.find(query)
      .populate({ path: 'student', populate: { path: 'user', select: 'name' } })
      .populate('approvedBy', 'name')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: leaves });
  } catch (error) {
    next(error);
  }
};

exports.createLeave = async (req, res, next) => {
  try {
    const student = await Student.findOne({ user: req.user._id });
    if (!student) return res.status(400).json({ success: false, message: 'Student profile not found' });
    const recent = await LeaveRequest.findOne({
      student: student._id,
      fromDate: req.body.fromDate,
      toDate: req.body.toDate,
      createdAt: { $gte: new Date(Date.now() - 30000) },
    });
    if (recent) {
      return res.status(429).json({ success: false, message: 'Duplicate leave request detected. Please wait before submitting again.' });
    }
    const leave = await LeaveRequest.create({ ...req.body, student: student._id });
    const populated = await LeaveRequest.findById(leave._id)
      .populate({ path: 'student', populate: { path: 'user', select: 'name' } });
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

exports.updateLeaveStatus = async (req, res, next) => {
  try {
    const { status, remarks } = req.body;
    const leave = await LeaveRequest.findByIdAndUpdate(req.params.id, { status, approvedBy: req.user._id, remarks }, { returnDocument: 'after' })
      .populate({ path: 'student', populate: { path: 'user', select: 'name email _id' } });
    if (!leave) return res.status(404).json({ success: false, message: 'Leave request not found' });
    if (leave.student?.user?._id) {
      await createNotification({
        user: leave.student.user._id,
        type: 'leave',
        title: `Leave ${status}`,
        message: `Your leave request (${leave.fromDate.toDateString()} - ${leave.toDate.toDateString()}) was ${status}`,
        link: '/leaves',
      });
    }
    res.json({ success: true, data: leave });
  } catch (error) {
    next(error);
  }
};
