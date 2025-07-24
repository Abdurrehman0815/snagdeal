// backend/utils/socket.js
let io; // This will hold our Socket.IO server instance

module.exports = {
  init: (httpServer) => {
    // Initialize Socket.IO server and assign it to the 'io' variable
    io = require('socket.io')(httpServer, {
      cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000', // Allow your frontend URL
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true,
      },
    });
    console.log('Socket.IO initialized.'); // Add a log to confirm
    return io;
  },
  getIo: () => {
    if (!io) {
      // This should ideally not happen if init is called correctly
      throw new Error('Socket.IO not initialized! Call socket.init(server) first.');
    }
    return io;
  }
};