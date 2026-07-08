const Notification = require('../models/Notification');
const { getIO } = require('../config/socket');

const createNotification = async ({ user, type, title, message, link }) => {
  try {
    const notification = await Notification.create({
      user,
      type,
      title,
      message,
      link,
    });

    const io = getIO();
    io.to(`user:${user}`).emit('notification:new', notification);

    return notification;
  } catch (error) {
    console.error('Create notification error:', error.message);
  }
};

module.exports = createNotification;
