const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const User = require('../models/User');

let mongoServer;

const connectDB = async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
};

const disconnectDB = async () => {
  await mongoose.disconnect();
  if (mongoServer) await mongoServer.stop();
};

const clearDB = async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
};

const createTestAdmin = async () => {
  return User.create({
    name: 'Admin User',
    email: 'admin@test.com',
    password: 'password123',
    role: 'admin',
    phone: '9876543210',
    emailVerified: true,
  });
};

const createTestStaffUser = async () => {
  return User.create({
    name: 'Staff User',
    email: 'staff@test.com',
    password: 'password123',
    role: 'staff',
    phone: '9876543211',
    emailVerified: true,
  });
};

const createTestStudentUser = async () => {
  return User.create({
    name: 'Student User',
    email: 'student@test.com',
    password: 'password123',
    role: 'student',
    phone: '9876543212',
    emailVerified: true,
  });
};

const createTestRoom = async (overrides = {}) => {
  const Room = require('../models/Room');
  return Room.create({
    roomNumber: '101',
    floor: 1,
    roomType: 'single',
    capacity: 1,
    rentPerMonth: 5000,
    amenities: ['AC', 'Desk', 'Chair', 'Wardrobe'],
    status: 'available',
    ...overrides,
  });
};

const createTestStudent = async (overrides = {}) => {
  const Student = require('../models/Student');
  const user = await createTestStudentUser();
  const student = await Student.create({
    user: user._id,
    studentId: 'STU001',
    dateOfBirth: new Date('2000-01-15'),
    gender: 'male',
    status: 'active',
    ...overrides,
  });
  return { user, student };
};

module.exports = {
  connectDB,
  disconnectDB,
  clearDB,
  createTestAdmin,
  createTestStaffUser,
  createTestStudentUser,
  createTestRoom,
  createTestStudent,
};
