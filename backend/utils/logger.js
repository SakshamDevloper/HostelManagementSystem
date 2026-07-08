const ActivityLog = require('../models/ActivityLog');

const logActivity = async ({ user, action, resource, resourceId, details, ip }) => {
  try {
    await ActivityLog.create({
      user: user?._id || user,
      action,
      resource,
      resourceId,
      details,
      ip: ip || '0.0.0.0',
    });
  } catch (error) {
    console.error('Activity log error:', error.message);
  }
};

module.exports = logActivity;
