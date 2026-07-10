const request = require('supertest');
const express = require('express');
const cookieParser = require('cookie-parser');
require('dotenv').config({ path: '.env' });

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api/auth', require('../routes/auth'));
app.use(require('../middleware/errorHandler'));

const { connectDB, disconnectDB, clearDB, createTestAdmin } = require('./setup');

describe('Auth Routes', () => {
  beforeAll(async () => await connectDB());
  afterAll(async () => await disconnectDB());
  afterEach(async () => await clearDB());

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      await createTestAdmin();
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@test.com', password: 'password123' });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user.email).toBe('admin@test.com');
      expect(res.headers['set-cookie']).toBeDefined();
    });

    it('should fail with wrong password', async () => {
      await createTestAdmin();
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@test.com', password: 'wrongpass' });
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should fail with non-existent email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nobody@test.com', password: 'password123' });
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should clear cookie on logout', async () => {
      const res = await request(app).post('/api/auth/logout');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return user when authenticated', async () => {
      await createTestAdmin();
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@test.com', password: 'password123' });
      const cookie = loginRes.headers['set-cookie'];

      const res = await request(app)
        .get('/api/auth/me')
        .set('Cookie', cookie);
      expect(res.status).toBe(200);
      expect(res.body.user.email).toBe('admin@test.com');
    });

    it('should fail without auth cookie', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
    });
  });

  describe('PUT /api/auth/profile', () => {
    it('should update profile name', async () => {
      await createTestAdmin();
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@test.com', password: 'password123' });
      const cookie = loginRes.headers['set-cookie'];

      const res = await request(app)
        .put('/api/auth/profile')
        .set('Cookie', cookie)
        .send({ name: 'Updated Admin' });
      expect(res.status).toBe(200);
      expect(res.body.user.name).toBe('Updated Admin');
    });
  });

  describe('PUT /api/auth/password', () => {
    it('should change password with correct current password', async () => {
      await createTestAdmin();
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@test.com', password: 'password123' });
      const cookie = loginRes.headers['set-cookie'];

      const res = await request(app)
        .put('/api/auth/password')
        .set('Cookie', cookie)
        .send({ currentPassword: 'password123', newPassword: 'newpass123' });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should fail with wrong current password', async () => {
      await createTestAdmin();
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@test.com', password: 'password123' });
      const cookie = loginRes.headers['set-cookie'];

      const res = await request(app)
        .put('/api/auth/password')
        .set('Cookie', cookie)
        .send({ currentPassword: 'wrongpass', newPassword: 'newpass123' });
      expect(res.status).toBe(400);
    });
  });
});
