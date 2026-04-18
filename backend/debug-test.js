const request = require('supertest')
const authRouter = require('./src/routes/auth').default || require('./src/routes/auth')
const workspaceRouter = require('./src/routes/workspace').default || require('./src/routes/workspace')
const express = require('express')

const app = express()
app.use(express.json())
app.use('/auth', authRouter)
app.use('/workspaces', workspaceRouter)

async function main() {
  const email = 'debug_' + Date.now() + '@test.com'
  const res1 = await request(app).post('/auth/register').send({
    email, password: 'TestPass123!', username: email.split('@')[0]
  })
  console.log('Register:', res1.status, JSON.stringify(res1.body).substring(0, 300))

  const res2 = await request(app).post('/auth/login').send({
    email, password: 'TestPass123!'
  })
  console.log('Login:', res2.status, JSON.stringify(res2.body).substring(0, 300))
  const token = res2.body.token || (res2.body.data && res2.body.data.token)
  console.log('Token:', token ? token.substring(0, 30) + '...' : 'EMPTY')

  if (token) {
    const res3 = await request(app).get('/workspaces').set('Authorization', 'Bearer ' + token)
    console.log('Workspaces:', res3.status, JSON.stringify(res3.body).substring(0, 300))
  }
}
main().catch(console.error)
