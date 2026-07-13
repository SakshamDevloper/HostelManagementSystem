const RoomTransfer = require('../models/RoomTransfer');
const Room = require('../models/Room');
const Student = require('../models/Student');
const logActivity = require('../utils/logger');

exports.getTransfers = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = {};
    if (status) query.status = status;
    if (req.user.role === 'student') {
      const student = await Student.findOne({ user: req.user._id });
      if (student) query.student = student._id;
    }
    const transfers = await RoomTransfer.find(query)
      .populate('fromRoom', 'roomNumber')
      .populate('toRoom', 'roomNumber')
      .populate({ path: 'student', populate: { path: 'user', select: 'name' } })
      .populate('requestedBy', 'name')
      .populate('approvedBy', 'name')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: transfers });
  } catch (error) {
    next(error);
  }
};

exports.createTransfer = async (req, res, next) => {
  try {
    let studentId = req.body.student;
    if (req.user.role === 'student') {
      const student = await Student.findOne({ user: req.user._id });
      if (!student) return res.status(400).json({ success: false, message: 'Student not found' });
      studentId = student._id;
    }
    const transfer = await RoomTransfer.create({
      ...req.body,
      student: studentId,
      requestedBy: req.user._id,
    });
    res.status(201).json({ success: true, data: transfer });
  } catch (error) {
    next(error);
  }
};

exports.updateTransferStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const transfer = await RoomTransfer.findById(req.params.id);
    if (!transfer) return res.status(404).json({ success: false, message: 'Transfer not found' });
    if (status === 'approved') {
      const student = await Student.findById(transfer.student);
      if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
      const fromRoom = await Room.findById(transfer.fromRoom);
      if (fromRoom) {
        fromRoom.occupants = fromRoom.occupants.filter(o => o.toString() !== student._id.toString());
        fromRoom.status = fromRoom.occupants.length === 0 ? 'available' : 'occupied';
        await fromRoom.save();
      }
      const toRoom = await Room.findById(transfer.toRoom);
      if (toRoom) {
        if (!toRoom.occupants.some(o => o.toString() === student._id.toString())) {
          toRoom.occupants.push(student._id);
        }
        toRoom.status = 'occupied';
        await toRoom.save();
      }
      student.room = transfer.toRoom;
      await student.save();
    }
    transfer.status = status;
    transfer.approvedBy = req.user._id;
    await transfer.save();
    await logActivity({ user: req.user._id, action: 'updateStatus', resource: 'roomTransfer', resourceId: transfer._id, details: { status }, ip: req.ip });
    res.json({ success: true, data: transfer });
  } catch (error) {
    next(error);
  }
};
