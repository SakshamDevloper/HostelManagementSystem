const Room = require('../models/Room');
const Student = require('../models/Student');
const logActivity = require('../utils/logger');

exports.getRooms = async (req, res, next) => {
  try {
    const { status, floor, roomType, search } = req.query;
    const query = {};
    if (status) query.status = status;
    if (floor) query.floor = floor;
    if (roomType) query.roomType = roomType;
    if (search) query.roomNumber = { $regex: search, $options: 'i' };
    const rooms = await Room.find(query).populate('occupants', 'studentId user').sort({ roomNumber: 1 });
    const total = await Room.countDocuments(query);
    res.json({ success: true, data: rooms, total });
  } catch (error) {
    next(error);
  }
};

exports.getRoom = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id)
      .populate({ path: 'occupants', populate: { path: 'user', select: 'name email phone photo' } });
    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });
    res.json({ success: true, data: room });
  } catch (error) {
    next(error);
  }
};

exports.createRoom = async (req, res, next) => {
  try {
    const room = await Room.create(req.body);
    await logActivity({ user: req.user._id, action: 'create', resource: 'room', resourceId: room._id, details: { roomNumber: room.roomNumber }, ip: req.ip });
    res.status(201).json({ success: true, data: room });
  } catch (error) {
    next(error);
  }
};

exports.updateRoom = async (req, res, next) => {
  try {
    const room = await Room.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after', runValidators: true });
    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });
    res.json({ success: true, data: room });
  } catch (error) {
    next(error);
  }
};

exports.deleteRoom = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });
    if (room.occupants.length > 0) {
      return res.status(400).json({ success: false, message: 'Cannot delete room with occupants' });
    }
    await Room.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Room deleted' });
  } catch (error) {
    next(error);
  }
};

exports.allocateRoom = async (req, res, next) => {
  try {
    const { studentId } = req.body;
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });
    if (room.status === 'maintenance') return res.status(400).json({ success: false, message: 'Room under maintenance' });
    if (room.occupants.length >= room.capacity) return res.status(400).json({ success: false, message: 'Room is full' });
    if (room.occupants.includes(studentId)) return res.status(400).json({ success: false, message: 'Student already in this room' });

    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    if (student.room) {
      await Room.findByIdAndUpdate(student.room, { $pull: { occupants: studentId } });
    }

    room.occupants.push(studentId);
    if (room.occupants.length === room.capacity) room.status = 'occupied';
    else room.status = 'occupied';
    await room.save();

    student.room = room._id;
    student.checkInDate = new Date();
    student.status = 'active';
    await student.save();

    await logActivity({ user: req.user._id, action: 'allocate', resource: 'room', resourceId: room._id, details: { studentId, roomNumber: room.roomNumber }, ip: req.ip });
    const populated = await Room.findById(room._id).populate('occupants');
    res.json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

exports.vacateRoom = async (req, res, next) => {
  try {
    const { studentId } = req.body;
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });

    room.occupants = room.occupants.filter(o => o.toString() !== studentId);
    room.status = room.occupants.length === 0 ? 'available' : 'occupied';
    await room.save();

    await Student.findByIdAndUpdate(studentId, { room: null, status: 'checkedOut', checkOutDate: new Date() });
    res.json({ success: true, data: room });
  } catch (error) {
    next(error);
  }
};

exports.updateInventory = async (req, res, next) => {
  try {
    const { inventory } = req.body;
    const room = await Room.findByIdAndUpdate(req.params.id, { inventory }, { returnDocument: 'after' });
    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });
    res.json({ success: true, data: room });
  } catch (error) {
    next(error);
  }
};
