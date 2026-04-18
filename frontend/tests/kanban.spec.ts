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
    email: `kanban_${n}_${ts}@test.local`,
    password: 'TestPass123!',
    name: `Kanban User ${n}`,
    username: `kanbanuser_${n}_${ts}`,
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

async function apiCreateBoard(token: string, workspaceId: string, title: string) {
  const r = await fetch(`${BACKEND}/kanban/workspace/${workspaceId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ title }),
  })
  return r.json()
}

async function apiCreateColumn(token: string, boardId: string, title: string) {
  const r = await fetch(`${BACKEND}/kanban/board/${boardId}/columns`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ title }),
  })
  return r.json()
}

async function apiAddCard(token: string, columnId: string, content: string) {
  const r = await fetch(`${BACKEND}/kanban/column/${columnId}/cards`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ content }),
  })
  return r.json()
}

async function apiGetBoard(token: string, boardId: string) {
  const r = await fetch(`${BACKEND}/kanban/board/${boardId}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return r.json()
}

async function apiGetBoards(token: string, workspaceId: string) {
  const r = await fetch(`${BACKEND}/kanban/workspace/${workspaceId}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return r.json()
}

// ─── Test Suite ───────────────────────────────────────────────────────────────

test.describe('Kanban E2E', () => {
  const USER = makeUser(1)
  let token = ''
  let workspaceId = ''
  let boardId = ''

  test.beforeAll(async () => {
    await waitForBackend()
    await apiRegister(USER)
    const loginRes = await apiLogin(USER)
    token = loginRes.token
    
    const ws = await apiCreateWorkspace(token, 'Kanban Test Workspace')
    workspaceId = ws.id
    
    const board = await apiCreateBoard(token, workspaceId, 'Project Board')
    boardId = board.id
    
    await apiCreateColumn(token, boardId, 'To Do')
    await apiCreateColumn(token, boardId, 'In Progress')
  })

  test('user can view kanban board in workspace UI', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 15000 })
    await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {})
    
    await page.locator('input[type="email"]').first().fill(USER.email)
    await page.locator('input[type="password"]').first().fill(USER.password)
    await page.locator('button[type="submit"]').first().click()
    await page.waitForURL(/\/(dashboard|workspace)/, { timeout: 20000 })
    
    await page.goto(`/workspace/${workspaceId}`, { waitUntil: 'domcontentloaded' })
    await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {})
    
    // Click Kanban tab
    const kanbanTab = page.locator('button').filter({ hasText: /^Kanban$/ }).first()
    if (await kanbanTab.isVisible({ timeout: 5000 }).catch(() => false)) {
      await kanbanTab.click()
      await delay(800)
    }
    
    // Should see board
    const boardLink = page.locator('text=Project Board').first()
    const visible = await boardLink.isVisible({ timeout: 5000 }).catch(() => false)
    expect(visible).toBe(true)
  })

  test('API creates board successfully', async () => {
    const board = await apiCreateBoard(token, workspaceId, 'Test Board')
    expect(board.id).toBeDefined()
    expect(board.title).toBe('Test Board')
  })

  test('API returns boards for workspace', async () => {
    const boards = await apiGetBoards(token, workspaceId)
    expect(Array.isArray(boards)).toBe(true)
    expect(boards.length).toBeGreaterThan(0)
  })

  test('API adds card to column', async () => {
    const board = await apiGetBoard(token, boardId)
    const columnId = board.columns[0].id
    
    const card = await apiAddCard(token, columnId, 'Test Card')
    expect(card.id).toBeDefined()
    expect(card.content).toBe('Test Card')
  })
})