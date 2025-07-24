const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middlewares/errorMiddleware');
const http = require('http');
// const { Server } = require('socket.io'); // REMOVE THIS LINE
const cors = require('cors');

const socket = require('./utils/socket'); // NEW: Import our socket utility

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));
app.use(express.json());

app.get('/', (req, res) => {
  res.send('API is running...');
});

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/negotiations', require('./routes/negotiationRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));


app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);

  // NEW: Initialize Socket.IO here using our utility
  const ioInstance = socket.init(server);

  // Now, attach Socket.IO event listeners to the instance returned by init
  ioInstance.on('connection', (s) => { // Use 's' to avoid naming conflict with the 'io' variable in utils/socket.js scope
    console.log('A user connected:', s.id);

    s.on('joinRoom', (userId) => {
      s.join(userId);
      console.log(`User ${userId} joined room`);
    });

    s.on('disconnect', () => {
      console.log('User disconnected:', s.id);
    });
  });
});

// REMOVE THESE LINES from server.js:
// const getIo = () => io;
// module.exports = { app, server, getIo };

// Instead, you'd only export app and server if other parts of your app
// explicitly need them. For getting the Socket.IO instance,
// controllers will use `require('../utils/socket').getIo()`.
// For simplicity, you can remove module.exports from server.js if nothing else needs it.
// If you do need to export app/server for testing or other reasons, just export those:
// module.exports = { app, server };