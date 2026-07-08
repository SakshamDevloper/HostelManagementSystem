const ActivityLog = require('../models/ActivityLog');

exports.getAuditLogs = async (req, res, next) => {
  try {
    const { action, resource, from, to, page = 1, limit = 50 } = req.query;
    const query = {};
    if (action) query.action = action;
    if (resource) query.resource = resource;
    if (from || to) {
      query.createdAt = {};
      if (from) query.createdAt.$gte = new Date(from);
      if (to) query.createdAt.$lte = new Date(to);
    }
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const logs = await ActivityLog.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit));
    const total = await ActivityLog.countDocuments(query);
    res.json({ success: true, data: logs, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    next(error);
  }
};
