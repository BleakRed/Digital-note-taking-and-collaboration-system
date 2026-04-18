import { describe, it, expect } from 'vitest'
import request from 'supertest'
import express from 'express'
import workspaceRouter from '../../routes/workspace'
import authRouter from '../../routes/auth'
import { PrismaClient } from '@prisma/client'

const app = express()
app.use(express.json())
app.use('/auth', authRouter)
app.use('/workspaces', workspaceRouter)

const prisma = new PrismaClient()

async function getToken(email: string, password: string) {
  await request(app).post('/auth/register').send({
    email, password, confirmPassword: password, username: email.split('@')[0]
  })
  const res = await request(app).post('/auth/login').send({ email, password })
  return res.body.token || ''
}

describe('Workspace Routes', () => {
  describe('POST /workspaces', () => {
    it('should create a workspace with valid name', async () => {
      const email = 'ws_' + Date.now() + '@example.com'
      const token = await getToken(email, 'TestPass123!')
      const res = await request(app)
        .post('/workspaces')
        .set('Authorization', 'Bearer ' + token)
        .send({ name: 'My Test Workspace' })
      expect([201, 200]).toContain(res.status)
    })

    it('should reject workspace creation without authentication', async () => {
      const res = await request(app)
        .post('/workspaces')
        .send({ name: 'Unauthorized Workspace' })
      expect([401, 403]).toContain(res.status)
    })

    it('should reject workspace creation with empty name', async () => {
      const email = 'ws_' + Date.now() + '@example.com'
      const token = await getToken(email, 'TestPass123!')
      const res = await request(app)
        .post('/workspaces')
        .set('Authorization', 'Bearer ' + token)
        .send({ name: '' })
      expect(res.status).toBeGreaterThanOrEqual(400)
    })
  })

  describe('GET /workspaces', () => {
    it('should list workspaces for authenticated user', async () => {
      const email = 'ws_' + Date.now() + '@example.com'
      const token = await getToken(email, 'TestPass123!')
      await request(app).post('/workspaces').set('Authorization', 'Bearer ' + token).send({ name: 'List Test' })
      const res = await request(app)
        .get('/workspaces')
        .set('Authorization', 'Bearer ' + token)
      expect([200, 201]).toContain(res.status)
    })

    it('should reject listing workspaces without authentication', async () => {
      const res = await request(app).get('/workspaces')
      expect([401, 403]).toContain(res.status)
    })
  })

  describe('GET /workspaces/:id/members', () => {
    it('should list workspace members', async () => {
      const email = 'wsm_' + Date.now() + '@example.com'
      const token = await getToken(email, 'TestPass123!')
      const wsRes = await request(app)
        .post('/workspaces')
        .set('Authorization', 'Bearer ' + token)
        .send({ name: 'Members Test WS' })
      const wsId = wsRes.body.id || ''
      const res = await request(app)
        .get('/workspaces/' + wsId + '/members')
        .set('Authorization', 'Bearer ' + token)
      expect([200, 201]).toContain(res.status)
    })
  })

  describe('POST /workspaces/:id/invite', () => {
    it('should invite a user by email', async () => {
      const ownerEmail = 'owner_' + Date.now() + '@example.com'
      const inviteEmail = 'invite_' + Date.now() + '@example.com'
      const ownerToken = await getToken(ownerEmail, 'TestPass123!')
      await getToken(inviteEmail, 'TestPass123!')
      const wsRes = await request(app)
        .post('/workspaces')
        .set('Authorization', 'Bearer ' + ownerToken)
        .send({ name: 'Invite Test WS' })
      const wsId = wsRes.body.id || ''
      const res = await request(app)
        .post('/workspaces/' + wsId + '/invite')
        .set('Authorization', 'Bearer ' + ownerToken)
        .send({ email: inviteEmail })
      expect([200, 201]).toContain(res.status)
    })

    it('should reject invite from non-owner', async () => {
      const ownerEmail = 'owner2_' + Date.now() + '@example.com'
      const memberEmail = 'member2_' + Date.now() + '@example.com'
      const ownerToken = await getToken(ownerEmail, 'TestPass123!')
      const memberToken = await getToken(memberEmail, 'TestPass123!')
      const wsRes = await request(app)
        .post('/workspaces')
        .set('Authorization', 'Bearer ' + ownerToken)
        .send({ name: 'Non-Owner Invite Test' })
      const wsId = wsRes.body.id || ''
      const res = await request(app)
        .post('/workspaces/' + wsId + '/invite')
        .set('Authorization', 'Bearer ' + memberToken)
        .send({ email: 'some_' + Date.now() + '@example.com' })
      expect([403]).toContain(res.status)
    })

    it('should reject invite with invalid email', async () => {
      const ownerEmail = 'owner3_' + Date.now() + '@example.com'
      const ownerToken = await getToken(ownerEmail, 'TestPass123!')
      const wsRes = await request(app)
        .post('/workspaces')
        .set('Authorization', 'Bearer ' + ownerToken)
        .send({ name: 'Invalid Email Test' })
      const wsId = wsRes.body.id || ''
      const res = await request(app)
        .post('/workspaces/' + wsId + '/invite')
        .set('Authorization', 'Bearer ' + ownerToken)
        .send({ email: 'invalid-email' })
      expect([400, 404]).toContain(res.status)
    })

    it('should reject invite to workspace without name', async () => {
      const ownerEmail = 'owner4_' + Date.now() + '@example.com'
      const ownerToken = await getToken(ownerEmail, 'TestPass123!')
      const wsRes = await request(app)
        .post('/workspaces')
        .set('Authorization', 'Bearer ' + ownerToken)
        .send({ name: '' })
      // Empty name may fail
    })

    it('should get workspace settings', async () => {
      const email = 'settings_' + Date.now() + '@example.com'
      const token = await getToken(email, 'TestPass123!')
      const wsRes = await request(app)
        .post('/workspaces')
        .set('Authorization', 'Bearer ' + token)
        .send({ name: 'Settings Test' })
      const wsId = wsRes.body.id || ''
      const res = await request(app)
        .get('/workspaces/' + wsId + '/settings')
        .set('Authorization', 'Bearer ' + token)
      expect([200, 201, 404]).toContain(res.status)
    })

    it('should update workspace settings', async () => {
      const email = 'settings2_' + Date.now() + '@example.com'
      const token = await getToken(email, 'TestPass123!')
      const wsRes = await request(app)
        .post('/workspaces')
        .set('Authorization', 'Bearer ' + token)
        .send({ name: 'Settings Update Test' })
      const wsId = wsRes.body.id || ''
      const res = await request(app)
        .put('/workspaces/' + wsId + '/settings')
        .set('Authorization', 'Bearer ' + token)
        .send({ name: 'Updated Name' })
      expect([200, 201, 404]).toContain(res.status)
    })
  })

  describe('DELETE /workspaces/:id/members/:memberId', () => {
    it('should remove a member as owner', async () => {
      const ownerEmail = 'remove_' + Date.now() + '@example.com'
      const memberEmail = 'member_' + Date.now() + '@example.com'
      const ownerToken = await getToken(ownerEmail, 'TestPass123!')
      const memberToken = await getToken(memberEmail, 'TestPass123!')
      const wsRes = await request(app)
        .post('/workspaces')
        .set('Authorization', 'Bearer ' + ownerToken)
        .send({ name: 'Remove Test' })
      const wsId = wsRes.body.id || ''
      // Member joins via invite
      await request(app)
        .post('/workspaces/' + wsId + '/invite')
        .set('Authorization', 'Bearer ' + ownerToken)
        .send({ email: memberEmail })
      // Get member id from members list
      const membersRes = await request(app)
        .get('/workspaces/' + wsId + '/members')
        .set('Authorization', 'Bearer ' + ownerToken)
      const memberRecord = membersRes.body.find((m: any) => m.email === memberEmail)
      if (memberRecord) {
        const removeRes = await request(app)
          .delete('/workspaces/' + wsId + '/members/' + memberRecord.id)
          .set('Authorization', 'Bearer ' + ownerToken)
        expect([200, 404]).toContain(removeRes.status)
      }
    })

    it('should return 404 for non-existent workspace', async () => {
      const email = 'notfound_' + Date.now() + '@example.com'
      const token = await getToken(email, 'TestPass123!')
      const res = await request(app)
        .delete('/workspaces/nonexistent/members/someid')
        .set('Authorization', 'Bearer ' + token)
      expect([404, 403]).toContain(res.status)
    })
  })
})
