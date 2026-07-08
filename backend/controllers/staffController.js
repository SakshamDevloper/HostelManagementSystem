const Staff = require('../models/Staff');
const User = require('../models/User');
const logActivity = require('../utils/logger');

exports.getStaff = async (req, res, next) => {
  try {
    const { designation, search } = req.query;
    const query = {};
    if (designation) query.designation = designation;
    if (search) query.staffId = { $regex: search, $options: 'i' };
    const staff = await Staff.find(query).populate('user', 'name email phone photo').sort({ createdAt: -1 });
    res.json({ success: true, data: staff });
  } catch (error) {
    next(error);
  }
};

exports.createStaff = async (req, res, next) => {
  try {
    const { name, email, password, phone, staffId, designation, joiningDate, salary, shift } = req.body;
    const user = await User.create({ name, email, password, phone, role: 'staff' });
    const staff = await Staff.create({ user: user._id, staffId, designation, joiningDate, salary, shift });
    await logActivity({ user: req.user._id, action: 'create', resource: 'staff', resourceId: staff._id, details: { staffId, name }, ip: req.ip });
    const populated = await Staff.findById(staff._id).populate('user', 'name email phone photo');
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

exports.updateStaff = async (req, res, next) => {
  try {
    const staff = await Staff.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('user', 'name email phone photo');
    if (!staff) return res.status(404).json({ success: false, message: 'Staff not found' });
    if (req.body.name) {
      await User.findByIdAndUpdate(staff.user._id, { name: req.body.name });
    }
    res.json({ success: true, data: staff });
  } catch (error) {
    next(error);
  }
};

exports.deleteStaff = async (req, res, next) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff) return res.status(404).json({ success: false, message: 'Staff not found' });
    await User.findByIdAndUpdate(staff.user._id, { isActive: false });
    await Staff.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Staff deleted' });
  } catch (error) {
    next(error);
  }
};
