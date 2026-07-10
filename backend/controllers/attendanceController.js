const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const logActivity = require('../utils/logger');

exports.getAttendance = async (req, res, next) => {
  try {
    const { studentId, date, month, year, status } = req.query;
    const query = {};
    if (studentId) query.student = studentId;
    if (status) query.status = status;
    if (date) {
      const d = new Date(date);
      d.setUTCHours(0, 0, 0, 0);
      const end = new Date(d);
      end.setUTCHours(23, 59, 59, 999);
      query.date = { $gte: d, $lte: end };
    }
    if (month && year) {
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0, 23, 59, 59, 999);
      query.date = { $gte: start, $lte: end };
    }
    if (req.user.role === 'student') {
      const student = await Student.findOne({ user: req.user._id });
      if (student) query.student = student._id;
    }
    const records = await Attendance.find(query)
      .populate({ path: 'student', populate: { path: 'user', select: 'name' } })
      .populate('markedBy', 'name')
      .sort({ date: -1 });
    res.json({ success: true, data: records });
  } catch (error) {
    next(error);
  }
};

exports.markAttendance = async (req, res, next) => {
  try {
    const { studentId, date, status, remarks } = req.body;
    const dateStart = new Date(date);
    dateStart.setUTCHours(0, 0, 0, 0);
    const existing = await Attendance.findOne({ student: studentId, date: dateStart });
    if (existing) {
      existing.status = status || existing.status;
      existing.remarks = remarks || existing.remarks;
      existing.markedBy = req.user._id;
      await existing.save();
      await logActivity({ user: req.user._id, action: 'update', resource: 'attendance', resourceId: existing._id, ip: req.ip });
      const populated = await Attendance.findById(existing._id)
        .populate({ path: 'student', populate: { path: 'user', select: 'name' } });
      return res.json({ success: true, data: populated, message: 'Attendance updated' });
    }
    const record = await Attendance.create({ student: studentId, date: dateStart, status, remarks, markedBy: req.user._id });
    await logActivity({ user: req.user._id, action: 'create', resource: 'attendance', resourceId: record._id, ip: req.ip });
    const populated = await Attendance.findById(record._id)
      .populate({ path: 'student', populate: { path: 'user', select: 'name' } });
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

exports.bulkMarkAttendance = async (req, res, next) => {
  try {
    const { records } = req.body;
    if (!Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ success: false, message: 'No records provided' });
    }
    const results = { marked: 0, updated: 0, errors: [] };
    for (const r of records) {
      try {
        const dateStart = new Date(r.date);
        dateStart.setUTCHours(0, 0, 0, 0);
        const existing = await Attendance.findOne({ student: r.studentId, date: dateStart });
        if (existing) {
          existing.status = r.status || existing.status;
          existing.remarks = r.remarks || existing.remarks;
          existing.markedBy = req.user._id;
          await existing.save();
          results.updated++;
        } else {
          await Attendance.create({ student: r.studentId, date: dateStart, status: r.status, remarks: r.remarks, markedBy: req.user._id });
          results.marked++;
        }
      } catch (err) {
        results.errors.push({ row: r, error: err.message });
      }
    }
    res.json({ success: true, ...results });
  } catch (error) {
    next(error);
  }
};

exports.getAttendanceSummary = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    const m = parseInt(month) || (new Date().getMonth() + 1);
    const y = parseInt(year) || new Date().getFullYear();
    const start = new Date(Date.UTC(y, m - 1, 1));
    const end = new Date(Date.UTC(y, m, 0, 23, 59, 59, 999));

    const summary = await Attendance.aggregate([
      { $match: { date: { $gte: start, $lte: end } } },
      { $group: { _id: '$student', present: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } }, absent: { $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] } }, leave: { $sum: { $cond: [{ $eq: ['$status', 'leave'] }, 1, 0] } }, late: { $sum: { $cond: [{ $eq: ['$status', 'late'] }, 1, 0] } }, total: { $sum: 1 } } },
      { $sort: { present: -1 } },
    ]);

    const populated = await Student.populate(summary, { path: '_id', populate: { path: 'user', select: 'name email studentId' } });
    res.json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};
