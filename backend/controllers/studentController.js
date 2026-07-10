const Student = require('../models/Student');
const User = require('../models/User');
const Room = require('../models/Room');
const logActivity = require('../utils/logger');

exports.getStudents = async (req, res, next) => {
  try {
    const { search, status, room, floor, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;
    if (room) query.room = room;
    if (search) {
      query.$or = [
        { studentId: { $regex: search, $options: 'i' } },
      ];
    }
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const students = await Student.find(query)
      .populate('user', 'name email phone photo')
      .populate('room', 'roomNumber floor roomType')
      .skip(skip).limit(parseInt(limit)).sort({ createdAt: -1 });
    const total = await Student.countDocuments(query);
    res.json({ success: true, data: students, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    next(error);
  }
};

exports.getStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('user', 'name email phone photo')
      .populate('room', 'roomNumber floor roomType rentPerMonth');
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    res.json({ success: true, data: student });
  } catch (error) {
    next(error);
  }
};

exports.createStudent = async (req, res, next) => {
  try {
    const { name, email, password, phone, studentId, dateOfBirth, gender, address, guardian, emergencyContact } = req.body;
    const user = await User.create({ name, email, password, phone, role: 'student' });
    const student = await Student.create({
      user: user._id, studentId, dateOfBirth, gender, address, guardian, emergencyContact,
    });
    await logActivity({ user: req.user._id, action: 'create', resource: 'student', resourceId: student._id, details: { studentId, name }, ip: req.ip });
    const populated = await Student.findById(student._id).populate('user', 'name email phone photo');
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

exports.updateStudent = async (req, res, next) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after', runValidators: true })
      .populate('user', 'name email phone photo');
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    if (req.body.name) {
      await User.findByIdAndUpdate(student.user._id, { name: req.body.name });
    }
    await logActivity({ user: req.user._id, action: 'update', resource: 'student', resourceId: student._id, ip: req.ip });
    res.json({ success: true, data: student });
  } catch (error) {
    next(error);
  }
};

exports.deleteStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id).populate('user');
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    if (student.room) {
      await Room.findByIdAndUpdate(student.room, { $pull: { occupants: student._id } });
    }
    await User.findByIdAndUpdate(student.user._id, { isActive: false });
    student.status = 'checkedOut';
    await student.save();
    await logActivity({ user: req.user._id, action: 'delete', resource: 'student', resourceId: student._id, ip: req.ip });
    res.json({ success: true, message: 'Student deactivated' });
  } catch (error) {
    next(error);
  }
};

exports.checkoutStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    if (student.room) {
      await Room.findByIdAndUpdate(student.room, { $pull: { occupants: student._id }, $set: { status: 'available' } });
    }
    student.status = 'checkedOut';
    student.checkOutDate = new Date();
    student.room = null;
    await student.save();
    await logActivity({ user: req.user._id, action: 'checkout', resource: 'student', resourceId: student._id, ip: req.ip });
    res.json({ success: true, message: 'Student checked out' });
  } catch (error) {
    next(error);
  }
};

exports.bulkImport = async (req, res, next) => {
  try {
    const { students } = req.body;
    if (!Array.isArray(students) || students.length === 0) {
      return res.status(400).json({ success: false, message: 'No students data provided' });
    }
    const results = { created: 0, failed: 0, errors: [] };
    for (const s of students) {
      try {
        const user = await User.create({ name: s.name, email: s.email, password: s.password || 'password123', role: 'student' });
        await Student.create({ user: user._id, studentId: s.studentId });
        results.created++;
      } catch (err) {
        results.failed++;
        results.errors.push({ row: s, error: err.message });
      }
    }
    res.status(201).json({ success: true, ...results });
  } catch (error) {
    next(error);
  }
};
