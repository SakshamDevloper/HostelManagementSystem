const request = require('supertest');
const express = require('express');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env' });

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api/auth', require('../routes/auth'));
app.use('/api/students', require('../routes/students'));
app.use(require('../middleware/errorHandler'));

const { connectDB, disconnectDB, clearDB, createTestAdmin } = require('./setup');

describe('Students Routes', () => {
  let cookie;

  beforeAll(async () => await connectDB());
  afterAll(async () => await disconnectDB());
  afterEach(async () => await clearDB());

  beforeEach(async () => {
    await createTestAdmin();
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@test.com', password: 'password123' });
    cookie = loginRes.headers['set-cookie'];
  });

  describe('POST /api/students', () => {
    it('should create a new student', async () => {
      const res = await request(app)
        .post('/api/students')
        .set('Cookie', cookie)
        .send({
          name: 'John Doe',
          email: 'john@test.com',
          password: 'password123',
          phone: '1234567890',
          studentId: 'STU001',
          dateOfBirth: '2000-01-15',
          gender: 'male',
        });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.studentId).toBe('STU001');
    });

    it('should fail with duplicate studentId', async () => {
      await request(app)
        .post('/api/students')
        .set('Cookie', cookie)
        .send({
          name: 'John Doe', email: 'john1@test.com', password: 'password123',
          studentId: 'STU001',
        });
      const res = await request(app)
        .post('/api/students')
        .set('Cookie', cookie)
        .send({
          name: 'Jane Doe', email: 'jane@test.com', password: 'password123',
          studentId: 'STU001',
        });
      expect(res.status).toBe(500);
    });
  });

  describe('GET /api/students', () => {
    it('should list students', async () => {
      await request(app)
        .post('/api/students')
        .set('Cookie', cookie)
        .send({
          name: 'John Doe', email: 'john@test.com', password: 'password123',
          studentId: 'STU001',
        });
      const res = await request(app)
        .get('/api/students')
        .set('Cookie', cookie);
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('GET /api/students/:id', () => {
    it('should get a single student', async () => {
      const createRes = await request(app)
        .post('/api/students')
        .set('Cookie', cookie)
        .send({
          name: 'John Doe', email: 'john@test.com', password: 'password123',
          studentId: 'STU001',
        });
      const id = createRes.body.data._id;
      const res = await request(app)
        .get(`/api/students/${id}`)
        .set('Cookie', cookie);
      expect(res.status).toBe(200);
      expect(res.body.data.studentId).toBe('STU001');
    });

    it('should return 404 for non-existent student', async () => {
      const res = await request(app)
        .get(`/api/students/${new mongoose.Types.ObjectId()}`)
        .set('Cookie', cookie);
      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/students/:id', () => {
    it('should update a student', async () => {
      const createRes = await request(app)
        .post('/api/students')
        .set('Cookie', cookie)
        .send({
          name: 'John Doe', email: 'john@test.com', password: 'password123',
          studentId: 'STU001',
        });
      const id = createRes.body.data._id;
      const res = await request(app)
        .put(`/api/students/${id}`)
        .set('Cookie', cookie)
        .send({ studentId: 'STU002' });
      expect(res.status).toBe(200);
      expect(res.body.data.studentId).toBe('STU002');
    });
  });

  describe('DELETE /api/students/:id', () => {
    it('should deactivate a student', async () => {
      const createRes = await request(app)
        .post('/api/students')
        .set('Cookie', cookie)
        .send({
          name: 'John Doe', email: 'john@test.com', password: 'password123',
          studentId: 'STU001',
        });
      const id = createRes.body.data._id;
      const res = await request(app)
        .delete(`/api/students/${id}`)
        .set('Cookie', cookie);
      expect(res.status).toBe(200);
      expect(res.body.message).toMatch(/deactivated/i);
    });
  });

  describe('POST /api/students/bulk-import', () => {
    it('should bulk import students', async () => {
      const res =       await request(app)
        .post('/api/students/bulk')
        .set('Cookie', cookie)
        .send({
          students: [
            { name: 'Bulk One', email: 'bulk1@test.com', studentId: 'BULK001' },
            { name: 'Bulk Two', email: 'bulk2@test.com', studentId: 'BULK002' },
          ],
        });
      expect(res.status).toBe(201);
      expect(res.body.created).toBe(2);
    });
  });
});
