const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const Student = require('../models/Student');
const Room = require('../models/Room');

const fix = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const students = await Student.find({ room: { $ne: null } });
  console.log(`Found ${students.length} students with room assignments`);

  const roomMap = {};
  for (const s of students) {
    const rid = s.room.toString();
    if (!roomMap[rid]) roomMap[rid] = [];
    roomMap[rid].push(s._id);
  }

  let updated = 0;
  for (const [roomId, occupantIds] of Object.entries(roomMap)) {
    await Room.findByIdAndUpdate(roomId, {
      $set: { occupants: occupantIds, status: 'occupied' },
    });
    updated++;
  }

  console.log(`Updated ${updated} rooms with ${students.length} total occupants`);
  await mongoose.disconnect();
  console.log('Done');
};

fix().catch(err => { console.error(err); process.exit(1); });
