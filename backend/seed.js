const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Student = require('./models/Student');
const Room = require('./models/Room');
const Payment = require('./models/Payment');
const Staff = require('./models/Staff');
const Notice = require('./models/Notice');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    await Promise.all([
      User.deleteMany({}), Student.deleteMany({}), Room.deleteMany({}),
      Payment.deleteMany({}), Staff.deleteMany({}), Notice.deleteMany({}),
    ]);
    console.log('Cleared existing data');

    const adminUser = await User.create({
      name: 'Admin User', email: 'admin@hostel.com', password: 'admin123',
      role: 'admin', phone: '9876543210', emailVerified: true,
    });
    const staffUser = await User.create({
      name: 'Staff Member', email: 'staff@hostel.com', password: 'staff123',
      role: 'staff', phone: '9876543211', emailVerified: true,
    });
    const studentUser = await User.create({
      name: 'Student Demo', email: 'student@hostel.com', password: 'student123',
      role: 'student', phone: '9876543212', emailVerified: true,
    });
    const studentUser2 = await User.create({
      name: 'Jane Smith', email: 'jane@hostel.com', password: 'student123',
      role: 'student', phone: '9876543213', emailVerified: true,
    });

    const staff = await Staff.create({
      user: staffUser._id, staffId: 'STF001', designation: 'warden',
      joiningDate: new Date('2024-01-01'), salary: 25000, shift: 'general',
    });

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

    const student1 = await Student.create({
      user: studentUser._id, studentId: 'STU001',
      dateOfBirth: new Date('2000-01-15'), gender: 'male',
      address: '123 Main St, City', guardian: { name: 'Parent 1', phone: '9999999991', email: 'parent1@email.com', relation: 'Father' },
      emergencyContact: '9999999990', room: rooms[0]._id, checkInDate: new Date('2025-09-01'), status: 'active',
    });
    const student2 = await Student.create({
      user: studentUser2._id, studentId: 'STU002',
      dateOfBirth: new Date('2001-03-20'), gender: 'female',
      address: '456 Oak Ave, Town', guardian: { name: 'Parent 2', phone: '9999999992', email: 'parent2@email.com', relation: 'Mother' },
      emergencyContact: '9999999990', room: rooms[2]._id, checkInDate: new Date('2025-09-01'), status: 'active',
    });

    rooms[0].occupants.push(student1._id);
    rooms[0].status = 'occupied';
    rooms[2].occupants.push(student2._id);
    rooms[2].status = 'occupied';
    await Promise.all([rooms[0].save(), rooms[2].save()]);

    const payments = await Payment.insertMany([
      { student: student1._id, amount: 5000, month: 9, year: 2025, dueDate: new Date('2025-09-10'), paidAt: new Date('2025-09-01'), paymentMethod: 'online', type: 'rent', status: 'paid', receiptNo: 'RCP-250901-0001', recordedBy: adminUser._id },
      { student: student1._id, amount: 5000, month: 10, year: 2025, dueDate: new Date('2025-10-10'), paidAt: new Date('2025-10-02'), paymentMethod: 'cash', type: 'rent', status: 'paid', receiptNo: 'RCP-251002-0002', recordedBy: adminUser._id },
      { student: student2._id, amount: 4000, month: 9, year: 2025, dueDate: new Date('2025-09-10'), paidAt: new Date('2025-09-05'), paymentMethod: 'online', type: 'rent', status: 'paid', receiptNo: 'RCP-250905-0003', recordedBy: adminUser._id },
      { student: student1._id, amount: 5000, month: 11, year: 2025, dueDate: new Date('2025-11-10'), status: 'pending', type: 'rent', receiptNo: 'RCP-PEND-001', recordedBy: adminUser._id },
    ]);

    await Notice.insertMany([
      { title: 'Welcome to Hostel', content: 'Welcome to the new academic year! Please check your room allocations and ensure all dues are cleared.', postedBy: adminUser._id, priority: 'high', targetAudience: 'all' },
      { title: 'Maintenance Update', content: 'Water supply will be interrupted on Saturday from 10 AM to 2 PM for tank cleaning.', postedBy: adminUser._id, priority: 'normal', targetAudience: 'all' },
      { title: 'URGENT: Security Alert', content: 'All students must ensure their doors are locked by 10 PM. Report any suspicious activity to security.', postedBy: adminUser._id, priority: 'urgent', targetAudience: 'students' },
    ]);

    console.log('\n✅ Seed completed!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Demo Credentials:');
    console.log('  Admin:   admin@hostel.com / admin123');
    console.log('  Staff:   staff@hostel.com / staff123');
    console.log('  Student: student@hostel.com / student123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Created: 2 students, 8 rooms, 4 payments, 3 notices`);

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seed();
