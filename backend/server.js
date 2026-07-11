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

const seedDatabase = async () => {
  console.log('Seeding database...');
  try {
    const User = require('./models/User');
    const Student = require('./models/Student');
    const Room = require('./models/Room');
    const Payment = require('./models/Payment');
    const Staff = require('./models/Staff');
    const Notice = require('./models/Notice');

    const existingUsers = await User.countDocuments();
    if (existingUsers > 0) {
      console.log('Database already has data, clearing and re-seeding...');
      await User.deleteMany({});
      await Student.deleteMany({});
      await Room.deleteMany({});
      await Payment.deleteMany({});
      await Notice.deleteMany({});
      await Staff.deleteMany({});
    }

    const adminUser = await User.create({ name: 'Admin User', email: 'admin@hostel.com', password: 'admin123', role: 'admin', phone: '9876543210', emailVerified: true });
    const staffUser = await User.create({ name: 'Staff Member', email: 'staff@hostel.com', password: 'staff123', role: 'staff', phone: '9876543211', emailVerified: true });
    const studentUser = await User.create({ name: 'Student Demo', email: 'student@hostel.com', password: 'student123', role: 'student', phone: '9876543212', emailVerified: true });
    const studentUser2 = await User.create({ name: 'Jane Smith', email: 'jane@hostel.com', password: 'student123', role: 'student', phone: '9876543213', emailVerified: true });

    await Staff.create({ user: staffUser._id, staffId: 'STF001', designation: 'warden', joiningDate: new Date('2024-01-01'), salary: 25000, shift: 'general' });

    const rooms = await Room.insertMany([
      { roomNumber: '101', floor: 1, roomType: 'single', capacity: 1, rentPerMonth: 5000, amenities: ['AC', 'Desk', 'Chair', 'Wardrobe'], status: 'available' },
      { roomNumber: '102', floor: 1, roomType: 'single', capacity: 1, rentPerMonth: 5000, amenities: ['AC', 'Desk', 'Chair', 'Wardrobe'], status: 'available' },
      { roomNumber: '201', floor: 2, roomType: 'double', capacity: 2, rentPerMonth: 8000, amenities: ['AC', 'Desk', 'Chair', 'Wardrobe', 'Balcony'], status: 'available' },
      { roomNumber: '202', floor: 2, roomType: 'double', capacity: 2, rentPerMonth: 8000, amenities: ['AC', 'Desk', 'Chair', 'Wardrobe'], status: 'available' },
      { roomNumber: '301', floor: 3, roomType: 'triple', capacity: 3, rentPerMonth: 10000, amenities: ['Fan', 'Desk', 'Chair', 'Wardrobe'], status: 'available' },
      { roomNumber: '302', floor: 3, roomType: 'triple', capacity: 3, rentPerMonth: 10000, amenities: ['Fan', 'Desk', 'Chair', 'Wardrobe'], status: 'available' },
      { roomNumber: '401', floor: 4, roomType: 'dormitory', capacity: 6, rentPerMonth: 15000, amenities: ['Fan', 'Locker', 'Common Desk'], status: 'available' },
      { roomNumber: 'G1', floor: 0, roomType: 'single', capacity: 1, rentPerMonth: 4000, amenities: ['Fan', 'Desk', 'Chair'], status: 'maintenance' },
    ]);

    const student1 = await Student.create({ user: studentUser._id, studentId: 'STU001', dateOfBirth: new Date('2000-01-15'), gender: 'male', address: '123 Main St', guardian: { name: 'Parent 1', phone: '9999999991', relation: 'Father' }, emergencyContact: '9999999990', room: rooms[0]._id, checkInDate: new Date('2025-09-01'), status: 'active' });
    const student2 = await Student.create({ user: studentUser2._id, studentId: 'STU002', dateOfBirth: new Date('2001-03-20'), gender: 'female', address: '456 Oak Ave', guardian: { name: 'Parent 2', phone: '9999999992', relation: 'Mother' }, emergencyContact: '9999999990', room: rooms[2]._id, checkInDate: new Date('2025-09-01'), status: 'active' });

    rooms[0].occupants.push(student1._id); rooms[0].status = 'occupied';
    rooms[2].occupants.push(student2._id); rooms[2].status = 'occupied';
    await Promise.all([rooms[0].save(), rooms[2].save()]);

    await Payment.insertMany([
      { student: student1._id, amount: 5000, month: 9, year: 2025, paidAt: new Date('2025-09-01'), paymentMethod: 'online', type: 'rent', status: 'paid', receiptNo: 'RCP-250901-0001', recordedBy: adminUser._id },
      { student: student1._id, amount: 5000, month: 10, year: 2025, paidAt: new Date('2025-10-02'), paymentMethod: 'cash', type: 'rent', status: 'paid', receiptNo: 'RCP-251002-0002', recordedBy: adminUser._id },
      { student: student2._id, amount: 4000, month: 9, year: 2025, paidAt: new Date('2025-09-05'), paymentMethod: 'online', type: 'rent', status: 'paid', receiptNo: 'RCP-250905-0003', recordedBy: adminUser._id },
      { student: student1._id, amount: 5000, month: 11, year: 2025, status: 'pending', type: 'rent', receiptNo: 'RCP-PEND-001', recordedBy: adminUser._id },
    ]);

    await Notice.insertMany([
      { title: 'Welcome to Hostel', content: 'Welcome to the new academic year! Please check your room allocations and ensure all dues are cleared.', postedBy: adminUser._id, priority: 'high' },
      { title: 'Maintenance Update', content: 'Water supply will be interrupted on Saturday from 10 AM to 2 PM for tank cleaning.', postedBy: adminUser._id, priority: 'normal' },
      { title: 'URGENT: Security Alert', content: 'All students must ensure their doors are locked by 10 PM. Report any suspicious activity.', postedBy: adminUser._id, priority: 'urgent' },
    ]);

    console.log('✅ Database seeded with demo data');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  Admin:   admin@hostel.com / admin123');
    console.log('  Staff:   staff@hostel.com / staff123');
    console.log('  Student: student@hostel.com / student123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  } catch (seedErr) {
    console.error('Seed error:', seedErr.message);
  }
};

server.listen(PORT, () => {
  console.log(`\n🚀 Server listening on port ${PORT}`);
  console.log('  (database connection in progress...)');
});

connectDB().then(async () => {
  await seedDatabase();
  console.log('  ✅ Database connected and seeded');
}).catch(err => {
  console.error('  ❌ Database connection error:', err.message);
});

process.on('SIGINT', async () => {
  const { disconnectDB } = require('./config/db');
  await disconnectDB();
  process.exit(0);
});
