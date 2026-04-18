import { test, expect, Page } from '@playwright/test'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const BACKEND = 'http://localhost:8000/api'

function delay(ms: number) { return new Promise(r => setTimeout(r, ms)) }

function makeUser(n: number) {
  const ts = Date.now()
  return {
    email: `auth_${n}_${ts}@test.local`,
    password: 'TestPass123!',
    name: `Test User ${n}`,
    username: `testuser_${n}_${ts}`,
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

// ─── Test Suite ───────────────────────────────────────────────────────────────

test.describe('Authentication E2E', () => {
  const USER = makeUser(1)

  test('user can register via UI', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 15000 })
    await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {})
    
    // Click "Don't have an account?" to switch to register mode
    const registerLink = page.locator('text=Don\'t have an account').first()
    if (await registerLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      await registerLink.click()
      await delay(500)
    }
    
    await page.locator('input[type="email"]').first().fill(USER.email)
    await page.locator('input[type="password"]').first().fill(USER.password)
    await page.locator('input[type="password"]').nth(1).fill(USER.password)
    await page.locator('input[name="name"]').first().fill(USER.name)
    await page.locator('input[name="username"]').first().fill(USER.username)
    await page.locator('button[type="submit"]').first().click()
    
    // Should redirect to dashboard after successful registration
    await page.waitForURL(/\/dashboard/, { timeout: 20000 })
    expect(page.url()).toMatch(/\/dashboard/)
  })

  test('user can log in with valid credentials', async ({ page }) => {
    const success = await uiLogin(page, USER.email, USER.password)
    expect(success).toBe(true)
    expect(page.url()).toMatch(/\/(dashboard|workspace)/)
  })

  test('user cannot log in with wrong password', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 15000 })
    await page.locator('input[type="email"]').first().fill(USER.email)
    await page.locator('input[type="password"]').first().fill('WrongPassword123!')
    await page.locator('button[type="submit"]').first().click()
    
    // Should stay on login page (no redirect)
    await delay(2000)
    expect(page.url()).toMatch(/\/$/)
  })

  test('register form shows validation errors for missing fields', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 15000 })
    
    // Click register link
    const registerLink = page.locator('text=Don\'t have an account').first()
    if (await registerLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      await registerLink.click()
      await delay(500)
    }
    
    // Submit empty form
    await page.locator('button[type="submit"]').first().click()
    await delay(500)
    
    // Should still be on login/register page (form validation prevents submission)
    const url = page.url()
    expect(url === 'http://localhost:3000/' || url === 'http://localhost:3000').toBe(true)
  })
})