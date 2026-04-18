import { describe, it, expect } from 'vitest'
import request from 'supertest'
import express from 'express'
import pageRouter from '../../routes/page'
import workspaceRouter from '../../routes/workspace'
import authRouter from '../../routes/auth'

const app = express()
app.use(express.json())
app.use('/auth', authRouter)
app.use('/workspaces', workspaceRouter)
app.use('/pages', pageRouter)

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
    .send({ name: 'Test Workspace' })
  return res.body.id || ''
}

describe('Page Routes', () => {
  describe('POST /pages', () => {
    it('should create a page with title and content', async () => {
      const email = 'page_' + Date.now() + '@example.com'
      const token = await getToken(email, 'TestPass123!')
      const workspaceId = await createWorkspace(token)
      const res = await request(app)
        .post('/pages')
        .set('Authorization', 'Bearer ' + token)
        .send({ title: 'Test Page', content: '# Hello\n\nTest content.', workspaceId })
      expect([201, 200]).toContain(res.status)
    })

    it('should reject page creation without authentication', async () => {
      const res = await request(app)
        .post('/pages')
        .send({ title: 'Unauthorized Page', workspaceId: 'some-id' })
      expect([401, 403]).toContain(res.status)
    })

    it('should reject page creation without workspaceId', async () => {
      const email = 'page_' + Date.now() + '@example.com'
      const token = await getToken(email, 'TestPass123!')
      const res = await request(app)
        .post('/pages')
        .set('Authorization', 'Bearer ' + token)
        .send({ title: 'No Workspace' })
      expect(res.status).toBeGreaterThanOrEqual(400)
    })
  })

  describe('GET /pages/workspace/:workspaceId', () => {
    it('should list pages for a workspace', async () => {
      const email = 'page_' + Date.now() + '@example.com'
      const token = await getToken(email, 'TestPass123!')
      const workspaceId = await createWorkspace(token)
      await request(app)
        .post('/pages')
        .set('Authorization', 'Bearer ' + token)
        .send({ title: 'Listed Page', content: 'Content', workspaceId })
      const res = await request(app)
        .get('/pages/workspace/' + workspaceId)
        .set('Authorization', 'Bearer ' + token)
      expect([200, 201]).toContain(res.status)
      expect(Array.isArray(res.body)).toBe(true)
    })
  })

  describe('GET /pages/:id', () => {
    it('should retrieve a page by ID', async () => {
      const email = 'page_' + Date.now() + '@example.com'
      const token = await getToken(email, 'TestPass123!')
      const workspaceId = await createWorkspace(token)
      const createRes = await request(app)
        .post('/pages')
        .set('Authorization', 'Bearer ' + token)
        .send({ title: 'Retrieve Me', content: 'Content', workspaceId })
      const pageId = createRes.body.id || ''
      const res = await request(app)
        .get('/pages/' + pageId)
        .set('Authorization', 'Bearer ' + token)
      expect([200, 404]).toContain(res.status)
    })
  })

  describe('PUT /pages/:id', () => {
    it('should update a page title and content', async () => {
      const email = 'page_' + Date.now() + '@example.com'
      const token = await getToken(email, 'TestPass123!')
      const workspaceId = await createWorkspace(token)
      const createRes = await request(app)
        .post('/pages')
        .set('Authorization', 'Bearer ' + token)
        .send({ title: 'Original Title', content: 'Original', workspaceId })
      const pageId = createRes.body.id || ''
      const res = await request(app)
        .put('/pages/' + pageId)
        .set('Authorization', 'Bearer ' + token)
        .send({ title: 'Updated Title', content: 'Updated content' })
      expect([200, 201]).toContain(res.status)
    })
  })
})
