import { test, expect, Page } from '@playwright/test'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const BACKEND = 'http://localhost:8000/api'

function delay(ms: number) { return new Promise(r => setTimeout(r, ms)) }

function makeUser(n: number) {
  const ts = Date.now()
  return {
    email: `chat_${n}_${ts}@test.local`,
    password: 'TestPass123!',
    name: `Chat User ${n}`,
    username: `chatuser_${n}_${ts}`,
  }
}

async function waitForBackend(timeout = 15000) {
  const deadline = Date.now() + timeout
  while (Date.now() < deadline) {
    try {
      await fetch(`${BACKEND}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'x', password: 'x' }),
      })
      return true
    } catch { await delay(500) }
  }
  return false
}

async function apiRegister(user: { email: string; password: string; name: string; username: string }) {
  await fetch(`${BACKEND}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...user, confirmPassword: user.password }),
  })
}

async function apiLogin(user: { email: string; password: string }) {
  const r = await fetch(`${BACKEND}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user),
  })
  return r.json()
}

async function apiCreateWorkspace(token: string, name: string) {
  const r = await fetch(`${BACKEND}/workspaces`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ name }),
  })
  return r.json()
}

async function apiCreateChatRoom(token: string, workspaceId: string, name: string) {
  const r = await fetch(`${BACKEND}/chat/workspace/${workspaceId}/rooms`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ name }),
  })
  return r.json()
}

async function apiGetChatRooms(token: string, workspaceId: string) {
  const r = await fetch(`${BACKEND}/chat/workspace/${workspaceId}/rooms`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return r.json()
}

async function apiSendMessage(token: string, roomId: string, content: string) {
  const r = await fetch(`${BACKEND}/chat/room/${roomId}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ content }),
  })
  return r.json()
}

async function apiGetMessages(token: string, roomId: string) {
  const r = await fetch(`${BACKEND}/chat/room/${roomId}/messages`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return r.json()
}

// ─── Test Suite ───────────────────────────────────────────────────────────────

test.describe('Chat E2E', () => {
  const USER = makeUser(1)
  let token = ''
  let workspaceId = ''
  let roomId = ''

  test.beforeAll(async () => {
    await waitForBackend()
    await apiRegister(USER)
    const loginRes = await apiLogin(USER)
    token = loginRes.token
    
    const ws = await apiCreateWorkspace(token, 'Chat Test Workspace')
    workspaceId = ws.id
    
    const room = await apiCreateChatRoom(token, workspaceId, 'General')
    roomId = room.id
  })

  test('user can view chat rooms in workspace UI', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 15000 })
    await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {})
    
    await page.locator('input[type="email"]').first().fill(USER.email)
    await page.locator('input[type="password"]').first().fill(USER.password)
    await page.locator('button[type="submit"]').first().click()
    await page.waitForURL(/\/(dashboard|workspace)/, { timeout: 20000 })
    
    // Navigate to workspace
    await page.goto(`/workspace/${workspaceId}`, { waitUntil: 'domcontentloaded' })
    await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {})
    
    // Click Chat tab
    const chatTab = page.locator('button').filter({ hasText: /^Chat$/ }).first()
    if (await chatTab.isVisible({ timeout: 5000 }).catch(() => false)) {
      await chatTab.click()
      await delay(800)
    }
    
    // Should see chat rooms in sidebar
    const roomLink = page.locator('text=General').first()
    const visible = await roomLink.isVisible({ timeout: 5000 }).catch(() => false)
    expect(visible).toBe(true)
  })

  test('API creates chat room successfully', async () => {
    const room = await apiCreateChatRoom(token, workspaceId, 'Test Room')
    expect(room.id).toBeDefined()
    expect(room.name).toBe('Test Room')
  })

  test('API returns chat rooms for workspace', async () => {
    const rooms = await apiGetChatRooms(token, workspaceId)
    expect(Array.isArray(rooms)).toBe(true)
    expect(rooms.length).toBeGreaterThan(0)
  })

  test('API sends and retrieves messages', async () => {
    const msg = await apiSendMessage(token, roomId, 'Hello from API test!')
    expect(msg.id || msg.content).toBeDefined()
    
    const messages = await apiGetMessages(token, roomId)
    expect(Array.isArray(messages)).toBe(true)
    expect(messages.length).toBeGreaterThan(0)
  })
})