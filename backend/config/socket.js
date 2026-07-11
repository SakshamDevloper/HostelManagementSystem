const { Server } = require('socket.io');

let io;

const setupSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || true,
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on('join', (userId) => {
      socket.join(`user:${userId}`);
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    console.warn('Socket.io not initialized - returning noop');
    return null;
  }
  return io;
};

module.exports = { setupSocket, getIO };
