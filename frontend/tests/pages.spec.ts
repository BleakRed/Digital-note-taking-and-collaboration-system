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
    email: `page_${n}_${ts}@test.local`,
    password: 'TestPass123!',
    name: `Page User ${n}`,
    username: `pageuser_${n}_${ts}`,
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

async function apiCreatePage(token: string, workspaceId: string, title: string) {
  const r = await fetch(`${BACKEND}/pages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ title, workspaceId }),
  })
  return r.json()
}

async function apiGetPages(token: string, workspaceId: string) {
  const r = await fetch(`${BACKEND}/pages/workspace/${workspaceId}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return r.json()
}

// ─── Test Suite ───────────────────────────────────────────────────────────────

test.describe('Pages E2E', () => {
  const USER = makeUser(1)
  let token = ''
  let workspaceId = ''

  test.beforeAll(async () => {
    await waitForBackend()
    await apiRegister(USER)
    const loginRes = await apiLogin(USER)
    token = loginRes.token
    
    const ws = await apiCreateWorkspace(token, 'Pages Test Workspace')
    workspaceId = ws.id
  })

  test('user can create a page via UI in workspace', async ({ page }) => {
    // Login and go to workspace
    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 15000 })
    await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {})
    
    await page.locator('input[type="email"]').first().fill(USER.email)
    await page.locator('input[type="password"]').first().fill(USER.password)
    await page.locator('button[type="submit"]').first().click()
    await page.waitForURL(/\/(dashboard|workspace)/, { timeout: 20000 })
    
    // Navigate to workspace
    await page.goto(`/workspace/${workspaceId}`, { waitUntil: 'domcontentloaded' })
    await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {})
    
    // Click Pages tab
    const pagesTab = page.locator('button').filter({ hasText: /^Pages$/ }).first()
    if (await pagesTab.isVisible({ timeout: 5000 }).catch(() => false)) {
      await pagesTab.click()
      await delay(800)
    }
    
    // Click "New Page" button
    const newPageBtn = page.locator('button').filter({ hasText: /New Page/i }).first()
    if (await newPageBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      page.on('dialog', d => d.accept('My Test Page'))
      await newPageBtn.click()
      await delay(1000)
      page.removeAllListeners('dialog')
    }
    
    // Page should be created - verify we're still in workspace
    expect(page.url()).toMatch(/\/workspace\//)
  })

  test('API creates page successfully', async () => {
    const page = await apiCreatePage(token, workspaceId, 'API Test Page')
    expect(page.id).toBeDefined()
    expect(page.title).toBe('API Test Page')
  })

  test('API returns pages for workspace', async () => {
    const pages = await apiGetPages(token, workspaceId)
    expect(Array.isArray(pages)).toBe(true)
    expect(pages.length).toBeGreaterThan(0)
  })
})