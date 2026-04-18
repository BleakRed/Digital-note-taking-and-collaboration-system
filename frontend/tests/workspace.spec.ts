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
    email: `ws_${n}_${ts}@test.local`,
    password: 'TestPass123!',
    name: `WS User ${n}`,
    username: `wsuser_${n}_${ts}`,
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
    } catch { /* not ready */ }
    await delay(500)
  }
  return false
}

async function uiLogin(page: Page, email: string, password: string, retries = 3) {
  await waitForBackend(10000)
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 15000 })
      await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {})
      if (page.url().match(/\/(dashboard|workspace)/)) return true
      
      await page.locator('input[type="email"]').first().waitFor({ state: 'visible', timeout: 10000 })
      await page.locator('input[type="email"]').first().fill(email)
      await page.locator('input[type="password"]').first().fill(password)
      await page.locator('button[type="submit"]').first().click()
      await page.waitForURL(/\/(dashboard|workspace)/, { timeout: 20000 })
      return true
    } catch {
      if (attempt === retries) return false
      await delay(1000 * attempt)
    }
  }
  return false
}

async function apiRegister(user: { email: string; password: string; name: string; username: string }) {
  const r = await fetch(`${BACKEND}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...user, confirmPassword: user.password }),
  })
  return r.json()
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

async function apiGetWorkspaces(token: string) {
  const r = await fetch(`${BACKEND}/workspaces`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return r.json()
}

// ─── Test Suite ───────────────────────────────────────────────────────────────

test.describe('Workspace E2E', () => {
  const USER = makeUser(1)
  let token = ''

  test.beforeAll(async () => {
    await waitForBackend()
    await apiRegister(USER)
    const loginRes = await apiLogin(USER)
    token = loginRes.token
  })

  test('user can create workspace via dashboard UI', async ({ page }) => {
    await uiLogin(page, USER.email, USER.password)
    await page.waitForURL(/\/dashboard/, { timeout: 20000 })
    
    // Find workspace creation input
    const wsInput = page.locator('input[placeholder*="workspace" i], input[placeholder="Create new workspace..."]').first()
    if (await wsInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      await wsInput.fill('My Test Workspace')
      await wsInput.press('Enter')
      await delay(1000)
    } else {
      // Try clicking create button
      const createBtn = page.locator('button').filter({ hasText: /create new workspace/i }).first()
      if (await createBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await createBtn.click()
        await delay(500)
      }
    }
    
    // Should navigate to workspace
    await page.waitForURL(/\/workspace\//, { timeout: 15000 })
    expect(page.url()).toMatch(/\/workspace\//)
  })

  test('workspace appears in dashboard after creation', async ({ page }) => {
    // Navigate to dashboard
    await page.goto('/dashboard', { waitUntil: 'domcontentloaded', timeout: 15000 })
    await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {})
    
    // Should see the workspace we created
    const wsLink = page.locator('text=My Test Workspace').first()
    const visible = await wsLink.isVisible({ timeout: 5000 }).catch(() => false)
    expect(visible).toBe(true)
  })

  test('API creates workspace successfully', async () => {
    const ws = await apiCreateWorkspace(token, 'API Test Workspace')
    expect(ws.id).toBeDefined()
    expect(ws.name).toBe('API Test Workspace')
  })

  test('user can see their workspaces via API', async () => {
    const workspaces = await apiGetWorkspaces(token)
    expect(Array.isArray(workspaces)).toBe(true)
    expect(workspaces.length).toBeGreaterThan(0)
  })
})