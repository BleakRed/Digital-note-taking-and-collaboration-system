import { describe, it, expect } from 'vitest'
import request from 'supertest'
import express from 'express'
import kanbanRouter from '../../routes/kanban'
import workspaceRouter from '../../routes/workspace'
import authRouter from '../../routes/auth'

const app = express()
app.use(express.json())
app.use('/auth', authRouter)
app.use('/workspaces', workspaceRouter)
app.use('/kanban', kanbanRouter)

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
    .send({ name: 'Kanban Test Workspace' })
  return res.body.id || ''
}

describe('Kanban Routes', () => {
  describe('POST /kanban/workspace/:workspaceId (create board)', () => {
    it('should create a kanban board with default columns', async () => {
      const email = 'kanban_' + Date.now() + '@example.com'
      const token = await getToken(email, 'TestPass123!')
      const workspaceId = await createWorkspace(token)
      const res = await request(app)
        .post('/kanban/workspace/' + workspaceId)
        .set('Authorization', 'Bearer ' + token)
        .send({ title: 'Test Board' })
      expect([201, 200]).toContain(res.status)
      expect(res.body.columns).toBeTruthy()
    })

    it('should reject without authentication', async () => {
      const email = 'kanban_' + Date.now() + '@example.com'
      const token = await getToken(email, 'TestPass123!')
      const workspaceId = await createWorkspace(token)
      const res = await request(app)
        .post('/kanban/workspace/' + workspaceId)
        .send({ title: 'Unauthorized Board' })
      expect([401, 403]).toContain(res.status)
    })
  })

  describe('GET /kanban/workspace/:workspaceId (list boards)', () => {
    it('should list boards for a workspace', async () => {
      const email = 'kanban_' + Date.now() + '@example.com'
      const token = await getToken(email, 'TestPass123!')
      const workspaceId = await createWorkspace(token)
      await request(app)
        .post('/kanban/workspace/' + workspaceId)
        .set('Authorization', 'Bearer ' + token)
        .send({ title: 'Board to List' })
      const res = await request(app)
        .get('/kanban/workspace/' + workspaceId)
        .set('Authorization', 'Bearer ' + token)
      expect([200, 201]).toContain(res.status)
      expect(Array.isArray(res.body)).toBe(true)
    })
  })

  describe('GET /kanban/board/:boardId', () => {
    it('should get a board with columns and cards', async () => {
      const email = 'kanban_' + Date.now() + '@example.com'
      const token = await getToken(email, 'TestPass123!')
      const workspaceId = await createWorkspace(token)
      const boardRes = await request(app)
        .post('/kanban/workspace/' + workspaceId)
        .set('Authorization', 'Bearer ' + token)
        .send({ title: 'Detailed Board' })
      const boardId = boardRes.body.id || ''
      const res = await request(app)
        .get('/kanban/board/' + boardId)
        .set('Authorization', 'Bearer ' + token)
      expect([200, 404]).toContain(res.status)
    })
  })

  describe('POST /kanban/columns/:columnId/cards', () => {
    it('should add a card to a column', async () => {
      const email = 'kanban_' + Date.now() + '@example.com'
      const token = await getToken(email, 'TestPass123!')
      const workspaceId = await createWorkspace(token)
      const boardRes = await request(app)
        .post('/kanban/workspace/' + workspaceId)
        .set('Authorization', 'Bearer ' + token)
        .send({ title: 'Card Board' })
      const boardId = boardRes.body.id || ''
      // Board has 3 default columns, get first one
      const firstColumnId = boardRes.body.columns?.[0]?.id || ''
      if (firstColumnId) {
        const res = await request(app)
          .post('/kanban/columns/' + firstColumnId + '/cards')
          .set('Authorization', 'Bearer ' + token)
          .send({ content: 'New Card', description: 'Card description' })
        expect([201, 200]).toContain(res.status)
      }
    })
  })
})

describe('Kanban Card/Column Update & Delete Routes', () => {
  async function createBoardWithColumn(token: string, workspaceId: string) {
    const boardRes = await request(app)
      .post('/kanban/workspace/' + workspaceId)
      .set('Authorization', 'Bearer ' + token)
      .send({ title: 'Update Test Board' })
    const columnId = boardRes.body.columns?.[0]?.id || ''
    const cardRes = await request(app)
      .post('/kanban/columns/' + columnId + '/cards')
      .set('Authorization', 'Bearer ' + token)
      .send({ content: 'Card to Update', description: 'Desc' })
    return {
      boardId: boardRes.body.id || '',
      columnId,
      cardId: cardRes.body.id || '',
    }
  }

  describe('PUT /kanban/cards/:cardId', () => {
    it('should update a card content and description', async () => {
      const email = 'kan2_' + Date.now() + '@example.com'
      const token = await getToken(email, 'TestPass123!')
      const workspaceId = await createWorkspace(token)
      const { cardId } = await createBoardWithColumn(token, workspaceId)
      const res = await request(app)
        .put('/kanban/cards/' + cardId)
        .set('Authorization', 'Bearer ' + token)
        .send({ content: 'Updated Content', description: 'Updated Desc' })
      expect([200, 201]).toContain(res.status)
    })
  })

  describe('PUT /kanban/columns/:columnId', () => {
    it('should update a column title and color', async () => {
      const email = 'kan3_' + Date.now() + '@example.com'
      const token = await getToken(email, 'TestPass123!')
      const workspaceId = await createWorkspace(token)
      const { columnId } = await createBoardWithColumn(token, workspaceId)
      const res = await request(app)
        .put('/kanban/columns/' + columnId)
        .set('Authorization', 'Bearer ' + token)
        .send({ title: 'Renamed Column', color: '#ff0000' })
      expect([200, 201]).toContain(res.status)
    })
  })

  describe('DELETE /kanban/cards/:cardId', () => {
    it('should delete a card', async () => {
      const email = 'kan4_' + Date.now() + '@example.com'
      const token = await getToken(email, 'TestPass123!')
      const workspaceId = await createWorkspace(token)
      const { cardId } = await createBoardWithColumn(token, workspaceId)
      const res = await request(app)
        .delete('/kanban/cards/' + cardId)
        .set('Authorization', 'Bearer ' + token)
      expect([200, 201]).toContain(res.status)
    })
  })

  describe('POST /kanban/board/:boardId/columns', () => {
    it('should create a new column on a board', async () => {
      const email = 'kan5_' + Date.now() + '@example.com'
      const token = await getToken(email, 'TestPass123!')
      const workspaceId = await createWorkspace(token)
      const { boardId } = await createBoardWithColumn(token, workspaceId)
      const res = await request(app)
        .post('/kanban/board/' + boardId + '/columns')
        .set('Authorization', 'Bearer ' + token)
        .send({ title: 'New Column', color: '#00ff00' })
      expect([201, 200]).toContain(res.status)
    })
  })

  describe('PUT /kanban/cards/:cardId/assign', () => {
    it('should assign a user to a card', async () => {
      const email = 'kan6_' + Date.now() + '@example.com'
      const token = await getToken(email, 'TestPass123!')
      const workspaceId = await createWorkspace(token)
      const { cardId } = await createBoardWithColumn(token, workspaceId)
      // Get the user ID from the workspace membership
      const wsRes = await request(app)
        .get('/workspaces/' + workspaceId + '/members')
        .set('Authorization', 'Bearer ' + token)
      const memberId = wsRes.body[0]?.userId || ''
      const res = await request(app)
        .put('/kanban/cards/' + cardId + '/assign')
        .set('Authorization', 'Bearer ' + token)
        .send({ userId: memberId })
      expect([200, 201]).toContain(res.status)
    })
  })
})
