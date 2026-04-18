# Testing Guide

This project uses a three-layer testing strategy:

- **Unit + Integration** — Backend API routes (Vitest + Supertest)
- **Component** — Frontend components (Vitest + React Testing Library)
- **E2E** — Real browser collaboration (Playwright)

---

## Test Results (2026-04-17)

### Backend (54 tests — 54 passing)
```
 Test Files  6 passed (6)
      Tests  54 passed (54)
 Duration  ~44s
```

**Route coverage:**
| Route | Coverage |
|---|---|
| auth.ts | 68.94% |
| chat.ts | 89.65% |
| drawing.ts | 86.84% |
| page.ts | 85.93% |
| kanban.ts | 89.90% |
| workspace.ts | 70.31% |
| file.ts | 0% (unused) |
| upload.ts | 0% (unused) |
| admin.ts | 0% (unused) |

### Frontend (6 tests — 6 passing)
```
 Test Files  1 passed (1)
      Tests  6 passed (6)
 Duration  ~4s
```
- Avatar component: 100% coverage

### E2E / Playwright (16 tests — 16 passing)
```
 Test Files  1 passed (1)
      Tests  16 passed (16)
 Duration  ~3.0m
```
**Authentication (3):** register via UI, wrong password rejection, register form validation

**Workspace Management (2):** create workspace, workspace appears in dashboard

**Real-Time Collaboration (1):** single-user login, workspace navigation, Pages tab, Chat tab

**Real-time Collaboration (4):** dual-login, session persistence, kanban/chat pages load, dark mode toggle

**Navigation (2):** workspace + dashboard pages render without crash

**Multi-User Stress (4):** 10 simultaneous logins, 10-page reload, 10 on same workspace, rapid sequential logins

> **Note:** Backend runs against local Docker DB (`localhost:5433`). E2E tests seed users via API then test real browser sessions with Chromium.

---

## Quick Start

```bash
# Run all backend tests
cd backend && npm test

# Run all frontend tests
cd frontend && npm test

# Run with coverage
cd backend && npm run test:coverage
cd frontend && npm run test:coverage

# Run E2E tests (requires dev server — auto-starts with webServer config)
cd frontend && npx playwright install --with-deps
cd frontend && npm run test:e2e
```

---

## 1. Backend Tests

**Stack:** Vitest + Supertest + Prisma

### Setup

```bash
cd backend
npm install
```

### Create a test database

```bash
# Option A: Docker
docker run --name notion_test_db -e POSTGRES_DB=notion_clone_test \
  -e POSTGRES_USER=testuser -e POSTGRES_PASSWORD=testpass \
  -p 5433:5432 -d postgres:latest

# Set env vars in backend/.env.test
DATABASE_URL="postgresql://testuser:testpass@localhost:5433/notion_clone_test"
DIRECT_URL="postgresql://testuser:testpass@localhost:5433/notion_clone_test"
```

### Run tests

```bash
npm test           # Run once
npm run test:watch # Watch mode
npm run test:coverage # With coverage report
```

### Coverage output

HTML report at `backend/coverage/index.html`

### What is tested

- `auth.test.ts` — register, login, duplicate email rejection, wrong password
- `workspace.test.ts` — create workspace, list workspaces, auth required
- `page.test.ts` — create, retrieve, update, delete pages
- `kanban.test.ts` — create columns, create cards, move cards between columns

---

## 2. Frontend Tests

**Stack:** Vitest + React Testing Library + jsdom

### Setup

```bash
cd frontend
npm install
```

### Run tests

```bash
npm test           # Run once
npm run test:watch # Watch mode
npm run test:coverage # With coverage report
```

### Coverage output

HTML report at `frontend/coverage/index.html`

### What is tested

- `Avatar.test.tsx` — renders image vs fallback, fallback text, error handling, styling

Add more component tests in `frontend/src/__tests__/components/`.

---

## 3. E2E Tests (Collaboration)

**Stack:** Playwright

### Setup

```bash
cd frontend
npm install
npx playwright install --with-deps
```

### Run tests

```bash
npm run test:e2e       # Headless
npm run test:e2e:ui    # Interactive UI mode
```

The `playwright.config.ts` includes a `webServer` block — it automatically starts `npm run dev` before running tests.

### What is tested

- Two users see real-time page edits simultaneously
- Kanban cards created by one user appear for another
- Chat messages sync in real-time between users

---

## Writing Results to Documentation

After running tests, capture the output:

```bash
# Backend
npm run test:coverage > ../Test_Results/backend_test_results.txt 2>&1

# Frontend
npm run test:coverage > ../Test_Results/frontend_test_results.txt 2>&1
```

The `Test_Results/` folder can be included in your diploma documentation under a "Testing" chapter.

---

## Tips

- Tests run against a **separate test database** — never the production database
- Use `beforeEach` to clean up test data between tests
- If a test is flaky, increase the timeout: `it('...', { timeout: 30000 })`
- For E2E tests, make sure both users are in the same workspace before testing collaboration
