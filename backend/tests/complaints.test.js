const request = require('supertest');
const express = require('express');
const cookieParser = require('cookie-parser');
require('dotenv').config({ path: '.env' });

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api/auth', require('../routes/auth'));
app.use('/api/complaints', require('../routes/complaints'));
app.use('/api/students', require('../routes/students'));
app.use(require('../middleware/errorHandler'));

const { connectDB, disconnectDB, clearDB, createTestAdmin } = require('./setup');

describe('Complaints Routes', () => {
  let cookie, studentId;

  beforeAll(async () => await connectDB());
  afterAll(async () => await disconnectDB());
  afterEach(async () => await clearDB());

  beforeEach(async () => {
    await createTestAdmin();
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@test.com', password: 'password123' });
    cookie = loginRes.headers['set-cookie'];

    const studentRes = await request(app)
      .post('/api/students')
      .set('Cookie', cookie)
      .send({ name: 'John', email: 'john@test.com', password: 'pass123', studentId: 'STU001' });
    studentId = studentRes.body.data._id;
  });

  describe('POST /api/complaints', () => {
    it('should create a complaint', async () => {
      const res = await request(app)
        .post('/api/complaints')
        .set('Cookie', cookie)
        .send({ student: studentId, category: 'plumbing', description: 'Leaky faucet' });
      expect(res.status).toBe(201);
      expect(res.body.data.category).toBe('plumbing');
    });
  });

  describe('GET /api/complaints', () => {
    it('should list complaints', async () => {
      await request(app)
        .post('/api/complaints')
        .set('Cookie', cookie)
        .send({ student: studentId, category: 'electrical', description: 'Power out' });
      const res = await request(app)
        .get('/api/complaints')
        .set('Cookie', cookie);
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
    });

    it('should filter by status', async () => {
      await request(app)
        .post('/api/complaints')
        .set('Cookie', cookie)
        .send({ student: studentId, category: 'noise', description: 'Loud music' });
      const res = await request(app)
        .get('/api/complaints?status=pending')
        .set('Cookie', cookie);
      expect(res.status).toBe(200);
    });
  });

  describe('PUT /api/complaints/:id/status', () => {
    it('should update complaint status', async () => {
      const createRes = await request(app)
        .post('/api/complaints')
        .set('Cookie', cookie)
        .send({ student: studentId, category: 'plumbing', description: 'Leak' });
      const res = await request(app)
        .put(`/api/complaints/${createRes.body.data._id}/status`)
        .set('Cookie', cookie)
        .send({ status: 'resolved' });
      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('resolved');
    });
  });
});
