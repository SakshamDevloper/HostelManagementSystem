const request = require('supertest');
const express = require('express');
const cookieParser = require('cookie-parser');
require('dotenv').config({ path: '.env' });

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api/auth', require('../routes/auth'));
app.use('/api/rooms', require('../routes/rooms'));
app.use('/api/students', require('../routes/students'));
app.use(require('../middleware/errorHandler'));

const { connectDB, disconnectDB, clearDB, createTestAdmin } = require('./setup');

describe('Rooms Routes', () => {
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

  describe('POST /api/rooms', () => {
    it('should create a new room', async () => {
      const res = await request(app)
        .post('/api/rooms')
        .set('Cookie', cookie)
        .send({ roomNumber: '101', floor: 1, roomType: 'single', capacity: 1, rentPerMonth: 5000 });
      expect(res.status).toBe(201);
      expect(res.body.data.roomNumber).toBe('101');
    });

    it('should fail with duplicate room number', async () => {
      await request(app)
        .post('/api/rooms')
        .set('Cookie', cookie)
        .send({ roomNumber: '101', floor: 1, roomType: 'single', capacity: 1, rentPerMonth: 5000 });
      const res = await request(app)
        .post('/api/rooms')
        .set('Cookie', cookie)
        .send({ roomNumber: '101', floor: 1, roomType: 'single', capacity: 1, rentPerMonth: 5000 });
      expect(res.status).toBe(500);
    });
  });

  describe('GET /api/rooms', () => {
    it('should list all rooms', async () => {
      await request(app)
        .post('/api/rooms')
        .set('Cookie', cookie)
        .send({ roomNumber: '101', floor: 1, roomType: 'single', capacity: 1, rentPerMonth: 5000 });
      const res = await request(app)
        .get('/api/rooms')
        .set('Cookie', cookie);
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
    });

    it('should filter by status', async () => {
      await request(app)
        .post('/api/rooms')
        .set('Cookie', cookie)
        .send({ roomNumber: '101', floor: 1, roomType: 'single', capacity: 1, rentPerMonth: 5000 });
      const res = await request(app)
        .get('/api/rooms?status=available')
        .set('Cookie', cookie);
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
    });
  });

  describe('GET /api/rooms/:id', () => {
    it('should get room by id', async () => {
      const createRes = await request(app)
        .post('/api/rooms')
        .set('Cookie', cookie)
        .send({ roomNumber: '101', floor: 1, roomType: 'single', capacity: 1, rentPerMonth: 5000 });
      const res = await request(app)
        .get(`/api/rooms/${createRes.body.data._id}`)
        .set('Cookie', cookie);
      expect(res.status).toBe(200);
    });
  });

  describe('PUT /api/rooms/:id', () => {
    it('should update a room', async () => {
      const createRes = await request(app)
        .post('/api/rooms')
        .set('Cookie', cookie)
        .send({ roomNumber: '101', floor: 1, roomType: 'single', capacity: 1, rentPerMonth: 5000 });
      const res = await request(app)
        .put(`/api/rooms/${createRes.body.data._id}`)
        .set('Cookie', cookie)
        .send({ rentPerMonth: 6000 });
      expect(res.status).toBe(200);
      expect(res.body.data.rentPerMonth).toBe(6000);
    });
  });

  describe('DELETE /api/rooms/:id', () => {
    it('should delete an empty room', async () => {
      const createRes = await request(app)
        .post('/api/rooms')
        .set('Cookie', cookie)
        .send({ roomNumber: '101', floor: 1, roomType: 'single', capacity: 1, rentPerMonth: 5000 });
      const res = await request(app)
        .delete(`/api/rooms/${createRes.body.data._id}`)
        .set('Cookie', cookie);
      expect(res.status).toBe(200);
    });

    it('should not delete a room with occupants', async () => {
      const roomRes = await request(app)
        .post('/api/rooms')
        .set('Cookie', cookie)
        .send({ roomNumber: '101', floor: 1, roomType: 'single', capacity: 1, rentPerMonth: 5000 });
      const studentRes = await request(app)
        .post('/api/students')
        .set('Cookie', cookie)
        .send({ name: 'John', email: 'john@test.com', password: 'pass123', studentId: 'STU001' });
      await request(app)
        .put(`/api/rooms/${roomRes.body.data._id}/allocate`)
        .set('Cookie', cookie)
        .send({ studentId: studentRes.body.data._id });
      const res = await request(app)
        .delete(`/api/rooms/${roomRes.body.data._id}`)
        .set('Cookie', cookie);
      expect(res.status).toBe(400);
    });
  });

  describe('PUT /api/rooms/:id/allocate', () => {
    it('should allocate a room to a student', async () => {
      const roomRes = await request(app)
        .post('/api/rooms')
        .set('Cookie', cookie)
        .send({ roomNumber: '101', floor: 1, roomType: 'single', capacity: 1, rentPerMonth: 5000 });
      const studentRes = await request(app)
        .post('/api/students')
        .set('Cookie', cookie)
        .send({ name: 'John', email: 'john@test.com', password: 'pass123', studentId: 'STU001' });
      const res = await request(app)
        .put(`/api/rooms/${roomRes.body.data._id}/allocate`)
        .set('Cookie', cookie)
        .send({ studentId: studentRes.body.data._id });
      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('occupied');
    });
  });
});
