import { describe, it, expect } from 'vitest'
import request from 'supertest'
import express from 'express'
import drawingRouter from '../../routes/drawing'
import workspaceRouter from '../../routes/workspace'
import authRouter from '../../routes/auth'

const app = express()
app.use(express.json())
app.use('/auth', authRouter)
app.use('/workspaces', workspaceRouter)
app.use('/drawings', drawingRouter)

async function getToken(email: string, password: string) {
  await request(app).post('/auth/register').send({
    email, password, confirmPassword: password, username: email.split('@')[0]
  })
  const res = await request(app).post('/auth/login').send({ email, password })
  return res.body.token || ''
}

async function createWorkspace(token: string) {
  const res = await request(app)
    .post('/workspaces')
    .set('Authorization', 'Bearer ' + token)
    .send({ name: 'Drawing Test Workspace' })
  return res.body.id || ''
}

describe('Drawing Routes', () => {
  describe('POST /drawings/workspace/:workspaceId', () => {
    it('should create a new drawing', async () => {
      const email = 'draw_' + Date.now() + '@example.com'
      const token = await getToken(email, 'TestPass123!')
      const workspaceId = await createWorkspace(token)
      const res = await request(app)
        .post('/drawings/workspace/' + workspaceId)
        .set('Authorization', 'Bearer ' + token)
        .send({ title: 'My Drawing', data: '{"strokes":[]}' })
      expect([201, 200]).toContain(res.status)
      expect(res.body.title).toBe('My Drawing')
    })

    it('should create a drawing with default title if none provided', async () => {
      const email = 'draw_' + Date.now() + '@example.com'
      const token = await getToken(email, 'TestPass123!')
      const workspaceId = await createWorkspace(token)
      const res = await request(app)
        .post('/drawings/workspace/' + workspaceId)
        .set('Authorization', 'Bearer ' + token)
        .send({ data: '{"strokes":[]}' })
      expect([201, 200]).toContain(res.status)
    })

    it('should reject drawing creation without authentication', async () => {
      const email = 'draw_' + Date.now() + '@example.com'
      const token = await getToken(email, 'TestPass123!')
      const workspaceId = await createWorkspace(token)
      const res = await request(app)
        .post('/drawings/workspace/' + workspaceId)
        .send({ title: 'Unauthorized Drawing', data: '{}' })
      expect([401, 403]).toContain(res.status)
    })
  })

  describe('GET /drawings/workspace/:workspaceId', () => {
    it('should list all drawings in a workspace', async () => {
      const email = 'draw_' + Date.now() + '@example.com'
      const token = await getToken(email, 'TestPass123!')
      const workspaceId = await createWorkspace(token)
      await request(app)
        .post('/drawings/workspace/' + workspaceId)
        .set('Authorization', 'Bearer ' + token)
        .send({ title: 'Listed Drawing', data: '{}' })
      const res = await request(app)
        .get('/drawings/workspace/' + workspaceId)
        .set('Authorization', 'Bearer ' + token)
      expect([200, 201]).toContain(res.status)
      expect(Array.isArray(res.body)).toBe(true)
    })
  })

  describe('PUT /drawings/:id', () => {
    it('should update a drawing title and data', async () => {
      const email = 'draw_' + Date.now() + '@example.com'
      const token = await getToken(email, 'TestPass123!')
      const workspaceId = await createWorkspace(token)
      const createRes = await request(app)
        .post('/drawings/workspace/' + workspaceId)
        .set('Authorization', 'Bearer ' + token)
        .send({ title: 'Original Title', data: '{"original":true}' })
      const drawingId = createRes.body.id || ''
      const res = await request(app)
        .put('/drawings/' + drawingId)
        .set('Authorization', 'Bearer ' + token)
        .send({ title: 'Updated Title', data: '{"updated":true}' })
      expect([200, 201]).toContain(res.status)
    })
  })
})

describe('Drawing Get/Delete Routes', () => {
  describe('GET /drawings/:id', () => {
    it('should get a single drawing by id', async () => {
      const email = 'draw2_' + Date.now() + '@example.com'
      const token = await getToken(email, 'TestPass123!')
      const workspaceId = await createWorkspace(token)
      const createRes = await request(app)
        .post('/drawings/workspace/' + workspaceId)
        .set('Authorization', 'Bearer ' + token)
        .send({ title: 'Get Test Drawing', data: '{"test":true}' })
      const drawingId = createRes.body.id || ''
      const res = await request(app)
        .get('/drawings/' + drawingId)
        .set('Authorization', 'Bearer ' + token)
      expect([200, 201]).toContain(res.status)
      expect(res.body.id).toBe(drawingId)
    })

    it('should return 404 for non-existent drawing', async () => {
      const email = 'draw3_' + Date.now() + '@example.com'
      const token = await getToken(email, 'TestPass123!')
      const res = await request(app)
        .get('/drawings/00000000-0000-0000-0000-000000000000')
        .set('Authorization', 'Bearer ' + token)
      expect([404]).toContain(res.status)
    })
  })

  describe('DELETE /drawings/:id', () => {
    it('should delete a drawing', async () => {
      const email = 'draw4_' + Date.now() + '@example.com'
      const token = await getToken(email, 'TestPass123!')
      const workspaceId = await createWorkspace(token)
      const createRes = await request(app)
        .post('/drawings/workspace/' + workspaceId)
        .set('Authorization', 'Bearer ' + token)
        .send({ title: 'Delete Me', data: '{}' })
      const drawingId = createRes.body.id || ''
      const res = await request(app)
        .delete('/drawings/' + drawingId)
        .set('Authorization', 'Bearer ' + token)
      expect([200, 201]).toContain(res.status)
    })
  })
})
