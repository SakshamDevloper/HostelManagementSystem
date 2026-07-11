const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const logActivity = require('../utils/logger');

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    if (!user.isActive) {
      return res.status(401).json({ success: false, message: 'Account is deactivated' });
    }
    generateToken(user._id, req, res);
    await logActivity({ user: user._id, action: 'login', resource: 'auth', resourceId: user._id, ip: req.ip });
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

exports.logout = async (req, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    secure: req.secure,
    sameSite: 'lax',
    expires: new Date(0),
  });
  res.json({ success: true, message: 'Logged out' });
};

exports.getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone, photo } = req.body;
    const update = {};
    if (name !== undefined) update.name = name;
    if (phone !== undefined) update.phone = phone;
    if (photo !== undefined) update.photo = photo;
    const user = await User.findByIdAndUpdate(req.user._id, update, { returnDocument: 'after' });
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.comparePassword(currentPassword))) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }
    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
};
