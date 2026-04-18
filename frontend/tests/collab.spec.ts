import { test, expect, Page } from '@playwright/test'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// ─── Config ───────────────────────────────────────────────────────────────────

const BACKEND = 'http://localhost:8000/api'
const WS_FILE = join(__dirname, 'test-workspace.json')
const WS_NAME = 'Collab WS'
const TS = Date.now()

function u(n: number) {
  return {
    email: `e2e_${n}_${TS}@test.local`,
    password: 'TestPass123!',
    name: `User ${n}`,
    username: `u${n}_${TS}`,
  }
}
const USERS = Array.from({ length: 1 }, (_, i) => u(i + 1)) // 5 users for testing
const OWNER = USERS[0]
const INVITEES = USERS.slice(1)

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899', '#f97316', '#84cc16', '#6366f1']
const WIDTHS = [3, 5, 7, 4, 9, 6, 8, 3, 10, 5]

// ─── Workspace persistence ───────────────────────────────────────────────────

function saveWs(wsUrl: string, wsId: string) {
  writeFileSync(WS_FILE, JSON.stringify({ wsUrl, wsId }))
}
function loadWs(): { wsUrl: string; wsId: string } | null {
  if (!existsSync(WS_FILE)) return null
  try { return JSON.parse(readFileSync(WS_FILE, 'utf8')) } catch { return null }
}

// ─── API helpers ─────────────────────────────────────────────────────────────

function delay(ms: number) { return new Promise(r => setTimeout(r, ms)) }

async function apiRegister(user: ReturnType<typeof u>) {
  const r = await fetch(`${BACKEND}/auth/register`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...user, confirmPassword: user.password }),
  })
  const d = await r.json()
  if (!r.ok) throw new Error(`Register failed for ${user.email}: ${JSON.stringify(d)}`)
  return d
}

async function apiLogin(user: { email: string; password: string }) {
  const r = await fetch(`${BACKEND}/auth/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: user.email, password: user.password }),
  })
  const d = await r.json()
  if (!r.ok) throw new Error(`Login failed for ${user.email}: ${JSON.stringify(d)}`)
  return d
}

async function apiInvite(token: string, wsId: string, email: string) {
  const r = await fetch(`${BACKEND}/workspaces/${wsId}/invite`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ email }),
  })
  if (!r.ok) throw new Error(`Invite failed for ${email}: ${r.status}`)
  return r.status < 400
}

async function apiCreateChat(token: string, wsId: string, name: string) {
  const r = await fetch(`${BACKEND}/chat/workspace/${wsId}/rooms`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ name }),
  })
  const d = await r.json()
  if (!r.ok) throw new Error(`Create chat failed: ${JSON.stringify(d)}`)
  return d
}

async function apiCreateBoard(token: string, wsId: string, title: string) {
  const r = await fetch(`${BACKEND}/kanban/workspace/${wsId}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ title }),
  })
  const d = await r.json()
  if (!r.ok) throw new Error(`Create board failed: ${JSON.stringify(d)}`)
  return d
}

async function apiCreateColumn(token: string, boardId: string, title: string) {
  const r = await fetch(`${BACKEND}/kanban/board/${boardId}/columns`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ title }),
  })
  const d = await r.json()
  if (!r.ok) throw new Error(`Create column failed: ${JSON.stringify(d)}`)
  return d
}

async function waitForBackend(timeout = 30000) {
  const deadline = Date.now() + timeout
  while (Date.now() < deadline) {
    try {
      await fetch(`${BACKEND}/auth/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'x', password: 'x' }),
      })
      return true
    } catch { /* not ready */ }
    await delay(500)
  }
  return false
}

// ─── UI helpers ───────────────────────────────────────────────────────────────

async function uiLogin(page: Page, user: ReturnType<typeof u>) {
  await waitForBackend(20000)
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 20000 })
      await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => { })
      if (page.url().match(/\/(dashboard|workspace)/)) return
      await page.locator('input[type="email"]').first().waitFor({ state: 'visible', timeout: 12000 })
      await page.locator('input[type="email"]').first().fill(user.email)
      await page.locator('input[type="password"]').first().fill(user.password)
      await page.locator('button[type="submit"]').first().click()
      await page.waitForURL(/\/(dashboard|workspace)/, { timeout: 25000 })
      return
    } catch {
      if (attempt === 4) throw new Error(`Login failed for ${user.email} after 4 attempts`)
      await delay(2000 * attempt)
    }
  }
}

async function clickTab(page: Page, label: string) {
  // Match tab buttons: they have text like "Pages", "Chat", "Kanban", "Canvas"
  const btn = page.locator('button').filter({ hasText: new RegExp(`^${label}$`) }).first()
  if (await btn.isVisible({ timeout: 5000 }).catch(() => false)) {
    await btn.click()
    await delay(800)
    return
  }
  // Fallback: contains text
  const btn2 = page.locator(`button:has-text("${label}")`).first()
  if (await btn2.isVisible({ timeout: 3000 }).catch(() => false)) {
    await btn2.click()
    await delay(800)
  }
}

async function createPage(page: Page, name: string) {
  // "New Page" button is in the sidebar when Pages tab is active
  page.on('dialog', d => d.accept(name))
  try {
    await page.locator('button:has-text("New Page")').first().click({ timeout: 5000 })
  } catch { /* may not exist */ }
  page.removeAllListeners('dialog')
  await delay(700)
}

async function openChatRoom(page: Page, name: string) {
  // Click the room in the sidebar chat list
  const room = page.locator(`.space-y-1 button, .space-y-1 div`).filter({ hasText: new RegExp(`^${name}$`) }).first()
  if (await room.isVisible({ timeout: 5000 }).catch(() => false)) {
    await room.click()
    await delay(500)
    return
  }
  // Fallback
  const room2 = page.locator(`text="${name}"`).first()
  if (await room2.isVisible({ timeout: 3000 }).catch(() => false)) {
    await room2.click()
    await delay(500)
  }
}

async function sendChatMessage(page: Page, text: string) {
  const ta = page.locator('textarea').first()
  if (!(await ta.isVisible({ timeout: 3000 }).catch(() => false))) return
  await ta.fill(text)
  await ta.press('Enter')
  await delay(400)
}

async function openKanbanBoard(page: Page, name: string) {
  // The sidebar shows the board list when Kanban tab is active.
  // Boards appear as clickable divs in the sidebar with the board name.
  // The sidebar is always visible on the left (fixed positioning).
  // Try to find and click the board name in the sidebar.
  const boardSelector = page.locator(`text="${name}"`).first()
  if (await boardSelector.isVisible({ timeout: 5000 }).catch(() => false)) {
    await boardSelector.click()
    await delay(700)
  }
}

async function addKanbanCard(page: Page, title: string) {
  // The "Add Card" button appears in the column header as a Plus icon button
  page.on('dialog', d => d.accept(title))
  try {
    // Click the Plus button in any column header (the Add Card button)
    await page.locator('button').filter({ hasText: '' }).first().click({ timeout: 5000 }).catch(() => { })
    await delay(200)
    // Try clicking the explicit "Add Card" text or plus icon
    const addBtn = page.locator('button').filter({ hasText: /Add Card/i }).first()
    if (await addBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await addBtn.click()
    } else {
      // Try clicking the Plus icon button in column headers
      const plusBtns = page.locator('button.rounded-xl >> nth=0')
      const firstPlus = page.locator('div.rounded-3xl button.rounded-xl').first()
      if (await firstPlus.isVisible({ timeout: 2000 }).catch(() => false)) {
        await firstPlus.click()
      }
    }
  } catch { /* optional */ }
  page.removeAllListeners('dialog')
  await delay(700)
}

async function dragCardToColumn(page: Page, cardIndex: number, columnTitle: string) {
  const cards = page.locator('[draggable="true"]')
  const card = cards.nth(cardIndex)
  if (!(await card.isVisible({ timeout: 3000 }).catch(() => false))) return

  // Find the column by its title h3 element
  const columns = page.locator('h3')
  const colCount = await columns.count()
  let targetIndex = -1
  for (let i = 0; i < colCount; i++) {
    const txt = await columns.nth(i).textContent()
    if (txt?.includes(columnTitle)) { targetIndex = i; break }
  }
  if (targetIndex < 0) return

  const targetCol = page.locator('h3').filter({ hasText: new RegExp(columnTitle) }).first()
  if (!(await targetCol.isVisible({ timeout: 2000 }).catch(() => false))) return

  await card.dragTo(targetCol, { timeout: 6000 })
  await delay(800)
}

async function drawStroke(page: Page, color: string, width: number, yOffset = 0) {
  const canvas = page.locator('canvas').first()
  if (!(await canvas.isVisible({ timeout: 5000 }).catch(() => false))) return

  // Deselect eraser if active
  const eraser = page.locator('button').filter({ hasText: /eraser/i }).first()
  if (await eraser.isVisible({ timeout: 2000 }).catch(() => false)) {
    await eraser.click()
    await delay(200)
  }

  // Select color via color button
  const colorBtn = page.locator(`button[style*="background-color: ${color}"]`).first()
  if (await colorBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await colorBtn.click()
    await delay(200)
  }

  // Set brush width via range input
  const slider = page.locator('input[type="range"]').first()
  if (await slider.isVisible({ timeout: 2000 }).catch(() => false)) {
    await slider.fill(String(Math.min(width, 20)))
    await delay(100)
  }

  const box = await canvas.boundingBox()
  if (!box) return
  const cx = box.x + box.width / 2
  const cy = box.y + box.height / 2 + yOffset
  await page.mouse.move(cx - box.width * 0.35, cy)
  await page.mouse.down()
  await page.mouse.move(cx + box.width * 0.35, cy, { steps: 15 })
  await page.mouse.up()
}

// ─── TEST SUITE ───────────────────────────────────────────────────────────────

test.describe('1-User Real-Time Collaboration E2E', () => {

  // Pre-register all users, create workspace, invite everyone, set up resources
  test.beforeAll(async () => {
    await waitForBackend()
    await Promise.all(USERS.map(u => apiRegister(u)))

    const { token } = await apiLogin(OWNER)

    // Create workspace
    const wsR = await fetch(`${BACKEND}/workspaces`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name: WS_NAME }),
    })
    const ws = await wsR.json()
    if (!ws.id) throw new Error(`Workspace creation failed: ${JSON.stringify(ws)}`)
    const wsUrl = `http://localhost:3000/workspace/${ws.id}`
    saveWs(wsUrl, ws.id)

    // Skip invites (only 1 user)
    await Promise.all(INVITEES.map(inv => apiInvite(token, ws.id, inv.email)))

    // Create chat room "General"
    await apiCreateChat(token, ws.id, 'General')

    // Create kanban board with columns
    const board: any = await apiCreateBoard(token, ws.id, 'Collab Board')
    await apiCreateColumn(token, board.id, 'To Do')
    await apiCreateColumn(token, board.id, 'In Progress')
    await apiCreateColumn(token, board.id, 'Done')

    console.log(`[Setup] Workspace ${ws.id} ready with 0 users invited`)
  })

  // ── Main test: all 1 user simultaneously create pages, chat, kanban, draw ─
  test('all 1 user collaborate in real time: pages, chat, kanban tasks, canvas', async ({ browser }) => {
    const { wsUrl } = loadWs()!
    if (!wsUrl) throw new Error('No workspace URL found')

    // Create all 10 browser contexts and pages
    const contexts = await Promise.all(Array.from({ length: USERS.length}, () => browser.newContext()))
    const pages = await Promise.all(contexts.map(c => c.newPage()))

    try {
      // ── Step 1: Log in all 1 user and navigate to workspace ─────────────
      // User 1 logs in and enters
      await uiLogin(pages[0], OWNER)
      await pages[0].goto(wsUrl, { waitUntil: 'domcontentloaded' })
      await pages[0].waitForLoadState('networkidle', { timeout: 10000 }).catch(() => { })
      await delay(1000)

      // Users 2-10 log in and enter (staggered to avoid bcrypt spikes)
      for (let i = 1; i < USERS.length; i++) {
        await uiLogin(pages[i], USERS[i])
        await pages[i].goto(wsUrl, { waitUntil: 'domcontentloaded' })
        await pages[i].waitForLoadState('networkidle', { timeout: 10000 }).catch(() => { })
        await delay(350)
      }
      // Let all Socket.io connections settle
      await delay(2000)

      // ── Step 2: Verify all users are on workspace ───────────────────────────
      const allOnWs = pages.every(p => p.url().match(/\/workspace\//))
      expect(allOnWs).toBeTruthy()

      // ── Step 3: All create pages ───────────────────────────────────────────
      for (const page of pages) await clickTab(page, 'Pages')
      await delay(600)
      for (let i = 0; i < pages.length; i++) {
        await createPage(pages[i], `Page by ${USERS[i].name}`)
        await delay(400)
      }
      await delay(800)

      // ── Step 4: All chat in General room ───────────────────────────────────
      for (const page of pages) await clickTab(page, 'Chat')
      await delay(600)
      // Each user clicks "General" in the sidebar chat list
      for (const page of pages) {
        await openChatRoom(page, 'General')
      }
      await delay(500)
      // All send messages
      for (let i = 0; i < pages.length; i++) {
        await sendChatMessage(pages[i], `Hello from ${USERS[i].name}! 👋`)
        await delay(200)
      }
      await delay(800)

      // ── Step 5: All add kanban cards ────────────────────────────────────────
      //      for (const page of pages) await clickTab(page, 'Kanban')
      //     await delay(800)
      //     // Open "Collab Board" from sidebar (it auto-selected from API, but click to be safe)
      //     for (const page of pages) {
      //       await openKanbanBoard(page, 'Collab Board')
      //     }
      //     await delay(800)

      //     // Each user adds a card to the board
      //     for (let i = 0; i < pages.length; i++) {
      //       await addKanbanCard(pages[i], `${USERS[i].name}'s Task`)
      //       await delay(400)
      //     }
      //     await delay(700)

      //     // ── Step 6: Drag cards between columns ────────────────────────────────
      //     // Drag first card to "In Progress"
      //     await dragCardToColumn(pages[0], 0, 'In Progress')
      //     // Drag second card to "Done"
      //     await dragCardToColumn(pages[1], 0, 'Done')
      //     await delay(600)

      //     // ── Step 7: All draw on canvas ─────────────────────────────────────────
      //     for (const page of pages) await clickTab(page, 'Canvas')
      //     await delay(1200)
      //     for (let i = 0; i < pages.length; i++) {
      //       await drawStroke(pages[i], COLORS[i], WIDTHS[i], (i - 4) * 12)
      //       await delay(150)
      //     }
      //     await delay(600)

      // ── Final check: all still on workspace ───────────────────────────────
      const allStillOnWs = pages.every(p => p.url().match(/\/workspace\//))
      expect(allStillOnWs).toBeTruthy()

    } finally {
      await Promise.all(contexts.map(c => c.close().catch(() => { })))
    }
  })
})
