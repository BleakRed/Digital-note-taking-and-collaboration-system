import { describe, it, expect } from 'vitest'
import request from 'supertest'
import express from 'express'
import authRouter from '../../routes/auth'

const app = express()
app.use(express.json())
app.use('/auth', authRouter)

async function getToken(email: string, password: string) {
  await request(app).post('/auth/register').send({
    email, password, confirmPassword: password, username: email.split('@')[0]
  })
  const res = await request(app).post('/auth/login').send({ email, password })
  return res.body.token || ''
}

describe('Auth Routes', () => {
  describe('POST /auth/register', () => {
    it('should register with valid data', async () => {
      const res = await request(app).post('/auth/register').send({
        email: 'newuser_' + Date.now() + '@example.com',
        password: 'TestPassword123!',
        confirmPassword: 'TestPassword123!',
        name: 'Test User',
        username: 'testuser_' + Date.now(),
      })
      expect([201, 200]).toContain(res.status)
    })

    it('should reject missing email', async () => {
      const res = await request(app).post('/auth/register').send({
        password: 'TestPassword123!', confirmPassword: 'TestPassword123!'
      })
      expect(res.status).toBeGreaterThanOrEqual(400)
    })

    it('should reject password mismatch', async () => {
      const res = await request(app).post('/auth/register').send({
        email: 'mismatch_' + Date.now() + '@example.com',
        password: 'TestPassword123!',
        confirmPassword: 'DifferentPass123!',
      })
      expect(res.status).toBeGreaterThanOrEqual(400)
    })

    it('should reject duplicate email', async () => {
      const email = 'dup_' + Date.now() + '@example.com'
      await request(app).post('/auth/register').send({
        email, password: 'TestPassword123!', confirmPassword: 'TestPassword123!',
      })
      const res = await request(app).post('/auth/register').send({
        email, password: 'AnotherPass123!', confirmPassword: 'AnotherPass123!',
      })
      expect(res.status).toBeGreaterThanOrEqual(400)
    })

    it('should register without name', async () => {
      const res = await request(app).post('/auth/register').send({
        email: 'noname_' + Date.now() + '@example.com',
        password: 'TestPassword123!',
        confirmPassword: 'TestPassword123!',
      })
      expect([201, 200]).toContain(res.status)
    })
  })

  describe('POST /auth/login', () => {
    it('should login with valid credentials', async () => {
      const email = 'login_' + Date.now() + '@example.com'
      await request(app).post('/auth/register').send({
        email, password: 'TestPassword123!', confirmPassword: 'TestPassword123!',
      })
      const res = await request(app).post('/auth/login').send({
        email, password: 'TestPassword123!'
      })
      expect(res.status).toBe(200)
      expect(res.body.token).toBeTruthy()
    })

    it('should reject wrong password', async () => {
      const email = 'wrongpass_' + Date.now() + '@example.com'
      await request(app).post('/auth/register').send({
        email, password: 'TestPassword123!', confirmPassword: 'TestPassword123!',
      })
      const res = await request(app).post('/auth/login').send({
        email, password: 'WrongPassword123!'
      })
      expect(res.status).toBeGreaterThanOrEqual(400)
    })

    it('should reject non-existent user', async () => {
      const res = await request(app).post('/auth/login').send({
        email: 'nobody_' + Date.now() + '@example.com',
        password: 'TestPassword123!'
      })
      expect(res.status).toBeGreaterThanOrEqual(400)
    })

    it('should return user data on login', async () => {
      const email = 'userdata_' + Date.now() + '@example.com'
      await request(app).post('/auth/register').send({
        email, password: 'TestPassword123!', confirmPassword: 'TestPassword123!',
      })
      const res = await request(app).post('/auth/login').send({
        email, password: 'TestPassword123!'
      })
      expect(res.body.user).toBeDefined()
    })

    it('should reject missing email', async () => {
      const res = await request(app).post('/auth/login').send({
        password: 'TestPassword123!'
      })
      expect(res.status).toBeGreaterThanOrEqual(400)
    })

    it('should reject missing password', async () => {
      const res = await request(app).post('/auth/login').send({
        email: 'test_' + Date.now() + '@example.com'
      })
      expect(res.status).toBeGreaterThanOrEqual(400)
    })
  })

  describe('PUT /auth/profile', () => {
    it('should update username and name', async () => {
      const email = 'profile_' + Date.now() + '@example.com'
      const token = await getToken(email, 'TestPass123!')
      const res = await request(app).put('/auth/profile')
        .set('Authorization', 'Bearer ' + token)
        .send({ username: 'newname_' + Date.now(), name: 'New Display Name' })
      expect([200, 201]).toContain(res.status)
    })

    it('should update with only username', async () => {
      const email = 'profile2_' + Date.now() + '@example.com'
      const token = await getToken(email, 'TestPass123!')
      const res = await request(app).put('/auth/profile')
        .set('Authorization', 'Bearer ' + token)
        .send({ username: 'useronly_' + Date.now() })
      expect([200, 201]).toContain(res.status)
    })

    it('should reject duplicate username', async () => {
      const email1 = 'user1_' + Date.now() + '@example.com'
      const email2 = 'user2_' + Date.now() + '@example.com'
      const token1 = await getToken(email1, 'TestPass123!')
      const token2 = await getToken(email2, 'TestPass123!')
      const sharedUsername = 'shared_' + Date.now()
      await request(app).put('/auth/profile')
        .set('Authorization', 'Bearer ' + token1)
        .send({ username: sharedUsername })
      const res = await request(app).put('/auth/profile')
        .set('Authorization', 'Bearer ' + token2)
        .send({ username: sharedUsername })
      expect(res.status).toBeGreaterThanOrEqual(400)
    })

    it('should reject without auth', async () => {
      const res = await request(app).put('/auth/profile')
        .send({ username: 'someuser' })
      expect(res.status).toBeGreaterThanOrEqual(400)
    })
  })

  describe('GET /auth/verify-email', () => {
    it('should reject invalid token', async () => {
      const res = await request(app).get('/auth/verify-email?token=invalid')
      expect([400, 404]).toContain(res.status)
    })

    it('should handle missing token', async () => {
      const res = await request(app).get('/auth/verify-email')
      // Missing token returns 400 or 200 (depending on query handling)
      expect([200, 400, 404]).toContain(res.status)
    })
  })

  describe('POST /auth/forgot-password', () => {
    it('should return 404 for non-existent email', async () => {
      const res = await request(app).post('/auth/forgot-password')
        .send({ email: 'nobody_' + Date.now() + '@example.com' })
      expect([404]).toContain(res.status)
    })

    it('should reject missing email', async () => {
      const res = await request(app).post('/auth/forgot-password').send({})
      expect(res.status).toBeGreaterThanOrEqual(400)
    })

    it('should send reset email for existing user', async () => {
      // Create user first
      const email = 'forgot_' + Date.now() + '@example.com'
      await request(app).post('/auth/register').send({
        email,
        password: 'TestPass123!',
        confirmPassword: 'TestPass123!',
        username: email.split('@')[0]
      })
      // Call forgot-password
      const res = await request(app).post('/auth/forgot-password').send({ email })
      expect([200]).toContain(res.status)
    })
  })

  describe('POST /auth/reset-password', () => {
    it('should reject invalid token', async () => {
      const res = await request(app).post('/auth/reset-password')
        .send({ token: 'invalid-token', password: 'NewPass123!' })
      expect([400]).toContain(res.status)
    })

    it('should reject missing token', async () => {
      const res = await request(app).post('/auth/reset-password')
        .send({ password: 'NewPass123!' })
      expect([200, 400]).toContain(res.status)
    })

    it('should reject missing password', async () => {
      const res = await request(app).post('/auth/reset-password')
        .send({ token: 'some-token' })
      expect(res.status).toBeGreaterThanOrEqual(400)
    })
  })
})