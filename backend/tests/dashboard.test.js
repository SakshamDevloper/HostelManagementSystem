const request = require('supertest');
const express = require('express');
const cookieParser = require('cookie-parser');
require('dotenv').config({ path: '.env' });

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api/auth', require('../routes/auth'));
app.use('/api/dashboard', require('../routes/dashboard'));
app.use(require('../middleware/errorHandler'));

const { connectDB, disconnectDB, clearDB, createTestAdmin } = require('./setup');

describe('Dashboard Routes', () => {
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

  describe('GET /api/dashboard/stats', () => {
    it('should return dashboard stats', async () => {
      const res = await request(app)
        .get('/api/dashboard/stats')
        .set('Cookie', cookie);
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('totalStudents');
      expect(res.body.data).toHaveProperty('totalRooms');
      expect(res.body.data).toHaveProperty('occupancyRate');
    });
  });

  describe('GET /api/dashboard/occupancy', () => {
    it('should return occupancy breakdown', async () => {
      const res = await request(app)
        .get('/api/dashboard/occupancy')
        .set('Cookie', cookie);
      expect(res.status).toBe(200);
      expect(res.body.data).toBeInstanceOf(Array);
    });
  });

  describe('GET /api/dashboard/revenue', () => {
    it('should return revenue data', async () => {
      const res = await request(app)
        .get('/api/dashboard/revenue')
        .set('Cookie', cookie);
      expect(res.status).toBe(200);
    });
  });

  describe('GET /api/dashboard/activity', () => {
    it('should return recent activity', async () => {
      const res = await request(app)
        .get('/api/dashboard/activity')
        .set('Cookie', cookie);
      expect(res.status).toBe(200);
    });
  });
});
