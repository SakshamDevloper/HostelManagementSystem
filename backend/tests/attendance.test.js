const request = require('supertest');
const express = require('express');
const cookieParser = require('cookie-parser');
require('dotenv').config({ path: '.env' });

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api/auth', require('../routes/auth'));
app.use('/api/students', require('../routes/students'));
app.use('/api/attendance', require('../routes/attendance'));
app.use(require('../middleware/errorHandler'));

const { connectDB, disconnectDB, clearDB, createTestWarden } = require('./setup');

describe('Attendance Routes', () => {
  let cookie, studentId;

  beforeAll(async () => await connectDB());
  afterAll(async () => await disconnectDB());
  afterEach(async () => await clearDB());

  beforeEach(async () => {
    await createTestWarden();
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'warden@test.com', password: 'password123' });
    cookie = loginRes.headers['set-cookie'];

    const studentRes = await request(app)
      .post('/api/students')
      .set('Cookie', cookie)
      .send({ name: 'John', email: 'john@test.com', password: 'pass123', studentId: 'STU001' });
    studentId = studentRes.body.data._id;
  });

  describe('POST /api/attendance (mark)', () => {
    it('should mark attendance for a student', async () => {
      const res = await request(app)
        .post('/api/attendance')
        .set('Cookie', cookie)
        .send({ studentId, date: '2025-09-15', status: 'present' });
      expect(res.status).toBe(201);
      expect(res.body.data.status).toBe('present');
    });

    it('should update existing attendance record', async () => {
      await request(app)
        .post('/api/attendance')
        .set('Cookie', cookie)
        .send({ studentId, date: '2025-09-15', status: 'present' });
      const res = await request(app)
        .post('/api/attendance')
        .set('Cookie', cookie)
        .send({ studentId, date: '2025-09-15', status: 'absent' });
      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('absent');
    });
  });

  describe('POST /api/attendance/bulk', () => {
    it('should bulk mark attendance', async () => {
      const res = await request(app)
        .post('/api/attendance/bulk')
        .set('Cookie', cookie)
        .send({ records: [{ studentId, date: '2025-09-15', status: 'present' }] });
      expect(res.status).toBe(200);
      expect(res.body.marked).toBe(1);
    });
  });

  describe('GET /api/attendance', () => {
    it('should get attendance records', async () => {
      await request(app)
        .post('/api/attendance')
        .set('Cookie', cookie)
        .send({ studentId, date: '2025-09-15', status: 'present' });
      const res = await request(app)
        .get('/api/attendance?month=9&year=2025')
        .set('Cookie', cookie);
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
    });
  });

  describe('GET /api/attendance/summary', () => {
    it('should get attendance summary', async () => {
      await request(app)
        .post('/api/attendance')
        .set('Cookie', cookie)
        .send({ studentId, date: '2025-09-15', status: 'present' });
      await request(app)
        .post('/api/attendance')
        .set('Cookie', cookie)
        .send({ studentId, date: '2025-09-16', status: 'present' });
      const res = await request(app)
        .get('/api/attendance/summary?month=9&year=2025')
        .set('Cookie', cookie);
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].present).toBe(2);
    });
  });
});
