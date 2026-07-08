const Student = require('../models/Student');
const Room = require('../models/Room');
const Payment = require('../models/Payment');
const Staff = require('../models/Staff');
const Complaint = require('../models/Complaint');
const ActivityLog = require('../models/ActivityLog');

exports.getStats = async (req, res, next) => {
  try {
    const [totalStudents, activeStudents, totalRooms, occupiedRooms, availableRooms,
      maintenanceRooms, totalStaff, totalPayments, totalRevenue, pendingComplaints] = await Promise.all([
      Student.countDocuments(),
      Student.countDocuments({ status: 'active' }),
      Room.countDocuments(),
      Room.countDocuments({ status: 'occupied' }),
      Room.countDocuments({ status: 'available' }),
      Room.countDocuments({ status: 'maintenance' }),
      Staff.countDocuments({ isActive: true }),
      Payment.countDocuments(),
      Payment.aggregate([{ $match: { status: 'paid' } }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
      Complaint.countDocuments({ status: { $in: ['pending', 'inProgress'] } }),
    ]);
    res.json({
      success: true,
      data: {
        totalStudents, activeStudents, checkedOutStudents: totalStudents - activeStudents,
        totalRooms, occupiedRooms, availableRooms, maintenanceRooms,
        occupancyRate: totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0,
        totalStaff, totalPayments,
        totalRevenue: totalRevenue[0]?.total || 0,
        pendingComplaints,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getOccupancy = async (req, res, next) => {
  try {
    const rooms = await Room.aggregate([
      { $group: { _id: '$roomType', total: { $sum: 1 }, occupied: { $sum: { $cond: [{ $eq: ['$status', 'occupied'] }, 1, 0] } } } },
    ]);
    res.json({ success: true, data: rooms });
  } catch (error) {
    next(error);
  }
};

exports.getRevenue = async (req, res, next) => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const revenue = await Payment.aggregate([
      { $match: { status: 'paid', paidAt: { $gte: sixMonthsAgo } } },
      { $group: { _id: { year: { $year: '$paidAt' }, month: { $month: '$paidAt' } }, total: { $sum: '$totalAmount' } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);
    res.json({ success: true, data: revenue });
  } catch (error) {
    next(error);
  }
};

exports.getActivity = async (req, res, next) => {
  try {
    const activities = await ActivityLog.find()
      .populate('user', 'name photo')
      .sort({ createdAt: -1 }).limit(20);
    res.json({ success: true, data: activities });
  } catch (error) {
    next(error);
  }
};

exports.getUpcoming = async (req, res, next) => {
  try {
    const today = new Date();
    const weekLater = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const [upcomingCheckouts, pendingPayments] = await Promise.all([
      Student.find({ status: 'active', checkOutDate: { $gte: today, $lte: weekLater } })
        .populate('user', 'name').populate('room', 'roomNumber'),
      Payment.find({ status: 'pending' })
        .populate({ path: 'student', populate: { path: 'user', select: 'name' } }).limit(10),
    ]);
    res.json({ success: true, data: { upcomingCheckouts, pendingPayments } });
  } catch (error) {
    next(error);
  }
};
