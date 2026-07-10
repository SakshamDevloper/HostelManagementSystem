const request = require('supertest');
const express = require('express');
const cookieParser = require('cookie-parser');
require('dotenv').config({ path: '.env' });

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api/auth', require('../routes/auth'));
app.use('/api/students', require('../routes/students'));
app.use('/api/payments', require('../routes/payments'));
app.use(require('../middleware/errorHandler'));

const { connectDB, disconnectDB, clearDB, createTestAdmin } = require('./setup');

describe('Payments Routes', () => {
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

  describe('POST /api/payments', () => {
    it('should create a payment', async () => {
      const res = await request(app)
        .post('/api/payments')
        .set('Cookie', cookie)
        .send({ student: studentId, amount: 5000, month: 9, year: 2025, type: 'rent', status: 'paid' });
      expect(res.status).toBe(201);
      expect(res.body.data.receiptNo).toBeDefined();
      expect(res.body.data.totalAmount).toBe(5000);
    });
  });

  describe('GET /api/payments', () => {
    it('should list payments', async () => {
      await request(app)
        .post('/api/payments')
        .set('Cookie', cookie)
        .send({ student: studentId, amount: 5000, month: 9, year: 2025 });
      const res = await request(app)
        .get('/api/payments')
        .set('Cookie', cookie);
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
    });

    it('should filter payments by status', async () => {
      await request(app)
        .post('/api/payments')
        .set('Cookie', cookie)
        .send({ student: studentId, amount: 5000, month: 9, year: 2025, status: 'pending' });
      const res = await request(app)
        .get('/api/payments?status=pending')
        .set('Cookie', cookie);
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
    });
  });

  describe('GET /api/payments/dues', () => {
    it('should list pending dues', async () => {
      await request(app)
        .post('/api/payments')
        .set('Cookie', cookie)
        .send({ student: studentId, amount: 5000, month: 9, year: 2025, status: 'pending' });
      const res = await request(app)
        .get('/api/payments/dues')
        .set('Cookie', cookie);
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
    });
  });
});
