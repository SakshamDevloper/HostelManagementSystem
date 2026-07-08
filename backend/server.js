const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const connectDB = require('./config/db');
const { setupSocket } = require('./config/socket');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const server = http.createServer(app);

setupSocket(server);

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Server is running', timestamp: new Date().toISOString() });
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/students', require('./routes/students'));
app.use('/api/rooms', require('./routes/rooms'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/complaints', require('./routes/complaints'));
app.use('/api/notices', require('./routes/notices'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/staff', require('./routes/staff'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/leaves', require('./routes/leaves'));
app.use('/api/visitors', require('./routes/visitors'));
app.use('/api/transfers', require('./routes/transfers'));
app.use('/api/exports', require('./routes/exports'));
app.use('/api/uploads', require('./routes/uploads'));
app.use('/api/audit', require('./routes/audit'));

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
