const Notice = require('../models/Notice');
const logActivity = require('../utils/logger');
const { getIO } = require('../config/socket');

exports.getNotices = async (req, res, next) => {
  try {
    const { isActive, priority } = req.query;
    const query = {};
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (priority) query.priority = priority;
    const notices = await Notice.find(query).populate('postedBy', 'name').sort({ createdAt: -1 });
    res.json({ success: true, data: notices });
  } catch (error) {
    next(error);
  }
};

exports.createNotice = async (req, res, next) => {
  try {
    const notice = await Notice.create({ ...req.body, postedBy: req.user._id });
    await logActivity({ user: req.user._id, action: 'create', resource: 'notice', resourceId: notice._id, details: { title: notice.title }, ip: req.ip });
    if (notice.priority === 'urgent') {
      const io = getIO();
      io.emit('announcement:urgent', { notice });
    }
    const populated = await Notice.findById(notice._id).populate('postedBy', 'name');
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

exports.updateNotice = async (req, res, next) => {
  try {
    const notice = await Notice.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('postedBy', 'name');
    if (!notice) return res.status(404).json({ success: false, message: 'Notice not found' });
    res.json({ success: true, data: notice });
  } catch (error) {
    next(error);
  }
};

exports.deleteNotice = async (req, res, next) => {
  try {
    const notice = await Notice.findByIdAndDelete(req.params.id);
    if (!notice) return res.status(404).json({ success: false, message: 'Notice not found' });
    res.json({ success: true, message: 'Notice deleted' });
  } catch (error) {
    next(error);
  }
};
