const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();
if (!process.env.NODE_ENV) process.env.NODE_ENV = 'production';

console.log('🚀 Hostel Management System starting...');
console.log('  NODE_ENV:', process.env.NODE_ENV);
console.log('  PORT:', process.env.PORT || 'not set, will use 5000');
console.log('  MONGODB_URI:', process.env.MONGODB_URI ? '✅ set' : '❌ NOT SET');
console.log('  JWT_SECRET:', process.env.JWT_SECRET ? '✅ set' : '❌ NOT SET');
console.log('  CLIENT_URL:', process.env.CLIENT_URL || 'not set (using default)');

const connectDB = require('./config/db');
const { setupSocket } = require('./config/socket');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const server = http.createServer(app);

setupSocket(server);

app.set('trust proxy', 1);

app.use(cors({
  origin: process.env.CLIENT_URL || true,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api', (req, res, next) => {
  console.log(`[API ROUTE CHECK] ${req.method} ${req.originalUrl}`);
  next();
});

app.use('/api/health', (req, res) => {
  res.json({ success: true, message: 'Server is running', timestamp: new Date().toISOString() });
});

app.use('/api/attendance', require('./routes/attendance'));
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

app.use('/api', (req, res) => {
  res.status(404).json({ success: false, message: 'API endpoint not found' });
});

const frontendDist = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendDist));
app.use((req, res) => {
  res.sendFile(path.join(frontendDist, 'index.html'));
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const createEssentialUsers = async () => {
  console.log('Creating essential users...');
  try {
    const User = require('./models/User');

    const existingUsers = await User.countDocuments();
    if (existingUsers > 0) {
      console.log('Users already exist — skipping user creation to preserve existing records.');
      return;
    }

    await User.create({ name: 'Admin User', email: 'admin@hostel.com', password: 'admin123', role: 'admin', phone: '9876543210', emailVerified: true });
    await User.create({ name: 'Staff Member', email: 'staff@hostel.com', password: 'staff123', role: 'staff', phone: '9876543211', emailVerified: true });
    await User.create({ name: 'Warden User', email: 'warden@hostel.com', password: 'warden123', role: 'warden', phone: '9876543214', emailVerified: true });
    await User.create({ name: 'Student Demo', email: 'student@hostel.com', password: 'student123', role: 'student', phone: '9876543212', emailVerified: true });
    await User.create({ name: 'Jane Smith', email: 'jane@hostel.com', password: 'student123', role: 'student', phone: '9876543213', emailVerified: true });

    console.log('✅ Essential users created');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  Admin:   admin@hostel.com / admin123');
    console.log('  Staff:   staff@hostel.com / staff123');
    console.log('  Warden:  warden@hostel.com / warden123');
    console.log('  Student: student@hostel.com / student123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  No rooms, students, payments, or other data seeded.');
    console.log('  Log in as admin to add rooms and data manually.');
  } catch (seedErr) {
    console.error('User creation error:', seedErr.message);
  }
};

connectDB().then(async () => {
  console.log('  ✅ Database connected');
  await createEssentialUsers();
  server.listen(PORT, () => {
    console.log(`\n🚀 Server listening on port ${PORT}`);
  });
}).catch(err => {
  console.error('  ❌ Database connection error:', err.message);
  process.exit(1);
});

process.on('SIGINT', async () => {
  const { disconnectDB } = require('./config/db');
  await disconnectDB();
  process.exit(0);
});
