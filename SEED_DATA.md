# Seed Data — Real-World Example Dataset

This file documents realistic, production-quality seed data for all five core features of the Notion Clone project. Use this as a reference when writing demo content, filling test accounts, or demonstrating the app to your supervisor.

---

## 1. User Personas — Who Uses This?

The app is used by **a small software startup team (6 people)** working on a real product. Each person has a distinct role and contributes different kinds of content.

| Name | Role | Email | Username | What they do |
|---|---|---|---|---|
| **Sarah Chen** | CTO / Founder | sarah@devspark.io | sarahc | Creates the workspace, writes high-level docs, sets the product direction |
| **Marcus Williams** | Senior Backend Dev | marcus@devspark.io | marcusw | Writes technical docs, shares code resources, manages the API kanban board |
| **Priya Sharma** | Product Manager | priya@devspark.io | priya_pm | Creates product specs, meeting notes, manages roadmap kanban board |
| **Alex Thompson** | UI/UX Designer | alex@devspark.io | alexd | Uploads design files, creates wireframes on canvas, writes style guides |
| **Jordan Lee** | Junior Developer | jordan@devspark.io | jordanlee | Writes daily standup notes, updates task statuses, asks questions in chat |
| **Dana Rivera** | QA Engineer | dana@devspark.io | danaq | Reports bugs in kanban, writes test plans, uploads test assets |

---

## 2. Workspace

**Name:** DevSpark Internal  
**Owner:** Sarah Chen

The workspace is the team's private hub. Everyone joined after being invited by Sarah.

---

## 3. Pages (Markdown Content)

### Page 1 — "DevSpark Wiki Home"
- **Author:** Sarah Chen
- **Title:** DevSpark Wiki Home
- **Content (Markdown):**
```markdown
# DevSpark Internal Wiki

Welcome to the DevSpark team wiki! This is where we document everything.

## Quick Links
- [[Backend API Docs]] — Technical reference
- [[Product Roadmap Q3]] — Current sprint goals
- [[Design System v2]] — UI guidelines
- [[Meeting Notes]] — All-hands and standups

## Team Norms
- Write what you'd want to read yourself
- Keep docs alive — stale docs are worse than no docs
- Tag docs with the relevant milestone
```

### Page 2 — "Backend API Documentation"
- **Author:** Marcus Williams
- **Title:** Backend API Documentation
- **Content (Markdown):**
```markdown
# Backend API Documentation

## Base URL
```
https://api.devspark.io/v2
```

## Authentication
All endpoints require a JWT Bearer token in the `Authorization` header.

## Endpoints

### GET /workspaces
Returns all workspaces the authenticated user has access to.

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "DevSpark Internal",
    "ownerId": "uuid",
    "createdAt": "2026-01-15T09:00:00Z"
  }
]
```

### POST /pages
Create a new page in a workspace.

**Body:**
```json
{
  "title": "Page Title",
  "content": "# Hello\n\nThis is markdown.",
  "workspaceId": "uuid"
}
```

## Error Codes
| Code | Meaning |
|------|---------|
| 400 | Invalid request body |
| 401 | Missing or expired token |
| 403 | Insufficient permissions |
| 404 | Resource not found |
| 500 | Internal server error |

*Last reviewed by Marcus on 2026-04-28*
```

### Page 3 — "Q3 Product Roadmap"
- **Author:** Priya Sharma
- **Title:** Q3 Product Roadmap
- **Content (Markdown):**
```markdown
# Q3 2026 Product Roadmap

**Goal:** Ship the mobile app and hit 1,000 MAU by end of September.

## Milestone 1 — Core Mobile (June)
- [x] User onboarding flow
- [x] Push notifications
- [ ] Offline mode (in progress)

## Milestone 2 — Collaboration (July)
- [ ] Real-time co-editing
- [ ] @mentions in comments
- [ ] Activity feed

## Milestone 3 — Monetization (August–September)
- [ ] Pro tier subscription
- [ ] Usage-based billing
- [ ] Team plan with SSO

## Open Questions
- What analytics do we need before the Pro launch?
- Is the offline mode MVP or polished?
```

### Page 4 — "Design System v2"
- **Author:** Alex Thompson
- **Title:** Design System v2
- **Content (Markdown):**
```markdown
# DevSpark Design System v2

## Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `brand-primary` | #6366F1 | CTAs, active states |
| `brand-secondary` | #10B981 | Success, confirmations |
| `surface-base` | #111827 | Dark mode background |
| `text-primary` | #F9FAFB | Body text (dark mode) |

## Typography
- **Headings:** Inter Bold, 700
- **Body:** Inter Regular, 400
- **Code:** JetBrains Mono, 400

## Spacing Scale
We use a 4px base unit:
- `xs`: 4px
- `sm`: 8px
- `md`: 16px
- `lg`: 24px
- `xl`: 32px

## Components
- Buttons: solid / ghost / danger variants
- Inputs: text, select, toggle
- Cards: elevated / flat
- Navigation: sidebar (desktop) / bottom bar (mobile)

*Figma link: https://www.figma.com/file/devspark-ds-v2*
```

### Page 5 — "Sprint 12 Standup Notes"
- **Author:** Jordan Lee
- **Title:** Sprint 12 Standup Notes
- **Content (Markdown):**
```markdown
# Sprint 12 — Daily Standup Log

**Sprint:** June 9–20, 2026

## Monday June 9
- **Jordan:** Started on the file upload bug — it's a MIME type mismatch in the backend
- **Marcus:** Fixed the JWT refresh bug, reviewing Jordan's PR now
- **Priya:** Uploading final Q3 spec to the wiki today

## Tuesday June 10
- **Jordan:** PR merged, moving to kanban card #47 (drag-and-drop reorder)
- **Marcus:** Working on WebSocket reconnection logic for mobile
- **Alex:** Wireframes for the new settings page are done, shared in Files

## Wednesday June 11
- **Jordan:** Card reorder is done, testing edge cases with empty columns
- **Marcus:** WebSocket reconnect works, pushed to staging
- **Dana:** Filed 3 new bug reports for Sprint 12

## Thursday June 12
- **Jordan:** Code review for the drawing canvas undo feature
- **Marcus:** Deployed reconnect fix to prod 🎉
- **Priya:** Roadmap doc updated with new Milestone 3 details
```

---

## 4. Chat (Real-Time Conversations)

### Chat Room — "general"
- **Room:** General team chat

**Messages:**

| Sender | Content | Timestamp |
|--------|---------|-----------|
| Jordan Lee | Morning everyone! Quick question — are we using `zod` or `joi` for validation? | 2026-06-09 09:05 |
| Marcus Williams | We agreed on `zod` last quarter. More predictable types | 2026-06-09 09:08 |
| Jordan Lee | Got it, thanks! Pulling it in now | 2026-06-09 09:09 |
| Priya Sharma | Heads up — the Q3 roadmap doc is now live on the wiki | 2026-06-09 09:22 |
| Alex Thompson | Just pushed the v2 design system to Figma, link is in the design page | 2026-06-09 10:15 |
| Dana Rivera | Bug report filed: file upload fails on Safari 17. Priority high, assigning to Marcus | 2026-06-09 11:03 |
| Marcus Williams | On it. Reproduced locally, looks like a headers issue | 2026-06-09 11:08 |
| Sarah Chen | Great work everyone. Reminder: all-hands at 3pm today | 2026-06-09 11:30 |
| Jordan Lee | 😄 will be there |

### Chat Room — "backend-team"
- **Room:** Backend team coordination

**Messages:**

| Sender | Content | Timestamp |
|--------|---------|-----------|
| Marcus Williams | @jordanlee can you pick up card #51 after the file upload PR? | 2026-06-10 09:30 |
| Jordan Lee | Sure, I'll start after standup | 2026-06-10 09:32 |
| Marcus Williams | Cool. Also — there's a new column for "Pending Review" on the API board. Don't forget to move cards there when you open a PR | 2026-06-10 09:33 |
| Jordan Lee | Makes sense, done | 2026-06-10 09:35 |

---

## 5. Canvas (Collaborative Drawing)

Three shared canvases exist in the workspace:

### Drawing 1 — "App Architecture v3"
- **Author:** Marcus Williams
- **Title:** App Architecture v3
- **Description:** System architecture diagram for the Q3 mobile rebuild. Drafted during the engineering planning session.
- **Use:** Referenced in the backend API docs page.

### Drawing 2 — "Homepage Wireframe Sketch"
- **Author:** Alex Thompson
- **Title:** Homepage Wireframe Sketch
- **Description:** Low-fidelity sketch of the new marketing homepage. Mobile-first layout with sticky nav.
- **Use:** Shared with Priya before the Figma handoff.

### Drawing 3 — "Flowchart — Onboarding"
- **Author:** Priya Sharma
- **Title:** Flowchart — Onboarding
- **Description:** User onboarding flow: signup → email verify → workspace create → invite team → first page.
- **Use:** Used as the basis for the Q3 milestone checklist.

---

## 6. Files (GitHub-Style with Descriptions)

Files are organized in folders by category:

### Folder: `/design`
| File Name | Description | Type |
|-----------|-------------|------|
| `brand-primary-v2.zip` | Logo assets in SVG + PNG, all color variants | image/svg+xml |
| `devspark-ui-kit.fig` | Figma UI kit for DevSpark v2 design system | application/figma |
| `icon-set-v1.svg` | Custom icon set (36 icons, outlined style) | image/svg+xml |
| `wireframe-homepage-v3.png` | Exported homepage wireframe at 1440px width | image/png |
| `color-tokens.json` | Design tokens exported from Figma as JSON | application/json |

### Folder: `/backend`
| File Name | Description | Type |
|-----------|------------|------|
| `api-schema-openapi.yaml` | OpenAPI 3.0 spec for all v2 endpoints | application/yaml |
| `db-migration-notes.md` | Notes on the 2026-05 schema migration | text/markdown |
| `performance-benchmark-q2.pdf` | Q2 load test results: p95 latency, RPS under load | application/pdf |
| `sql-scripts.zip` | Utility SQL scripts: cleanup, anonymization | application/zip |

### Folder: `/product`
| File Name | Description | Type |
|-----------|------------|------|
| `q3-roadmap.xlsx` | Full Q3 roadmap with owners, status, and dependencies | application/vnd.openxmlformats-officedocument.spreadsheetml.sheet |
| `user-research-notes.pdf` | Compiled notes from 12 user interviews (anonymized) | application/pdf |
| `competitive-analysis-2026.pdf` | Competitor audit: Notion, Linear, Coda | application/pdf |
| `sprint-retrospective-s11.txt` | S11 retro notes: what worked, what to improve | text/plain |

### Folder: `/qa`
| File Name | Description | Type |
|-----------|------------|------|
| `test-plan-v1.2.pdf` | Master test plan for v1.2 release | application/pdf |
| `bug-report-safari-upload.png` | Screenshots attached to bug report #204 | image/png |
| `automation-suite-cypress.zip` | Cypress E2E test suite for critical flows | application/zip |

### Root (unfiled)
| File Name | Description | Type |
|-----------|------------|------|
| `team-photo-2026.jpg` | All-hands team photo, March 2026 | image/jpeg |
| `roadmap-meeting-notes.pdf` | PDF notes from the Q3 planning meeting | application/pdf |

---

## 7. Kanban Board — "Sprint 12"

### Board: Sprint 12  
**Author:** Priya Sharma  
**Columns:** Backlog · To Do · In Progress · Pending Review · Done

#### Column: Backlog
| Card | Description | Assignee |
|------|-------------|----------|
| Add dark mode toggle persistence | Save dark/light preference to localStorage and sync across tabs | Jordan Lee |
| Document all new API endpoints | OpenAPI spec is missing 4 endpoints from Q3 | Marcus Williams |
| Design onboarding illustrations | Need 3 new illustrations for mobile onboarding screens | Alex Thompson |
| Write performance tests for chat | Load test the WebSocket chat under 50 concurrent users | Dana Rivera |

#### Column: To Do
| Card | Description | Assignee |
|------|-------------|----------|
| Fix file upload on Safari 17 | Bug #204: multipart/form-data headers misconfigured | Marcus Williams |
| Kanban card reorder bug | Cards snap back to original position after drag end | Jordan Lee |
| Update email templates | Current templates are from v1.0, need refresh | Priya Sharma |

#### Column: In Progress
| Card | Description | Assignee |
|------|-------------|----------|
| WebSocket reconnection logic | Auto-reconnect with exponential backoff for mobile users | Marcus Williams |
| Drawing canvas undo feature | Store last 50 stroke actions in history stack | Jordan Lee |

#### Column: Pending Review
| Card | Description | Assignee |
|------|-------------|----------|
| Drag-and-drop file reordering | Allow reordering files within folders via drag | Jordan Lee |

#### Column: Done ✅
| Card | Description | Assignee |
|------|-------------|----------|
| JWT refresh bug | Refresh tokens were not being rotated on some edge cases | Marcus Williams |
| Migrate to Prisma v5 | Upgrade ORM and fix breaking changes in schema | Marcus Williams |
| Style guide for markdown renderer | Code blocks had wrong font, fixed | Alex Thompson |
| QA test plan for v1.2 | All 48 test cases written and approved | Dana Rivera |

---

## Kanban Board — "Bug Tracker"

### Board: Bug Tracker  
**Author:** Dana Rivera  
**Columns:** Open · Reproduced · In Fix · Resolved · Closed

#### Column: Open
| Card | Description | Assignee |
|------|-------------|----------|
| Safari 17 file upload fails | Reproducible every time on iOS Safari, POST returns 415 | Marcus Williams |
| Chat message timestamp off by 1h | User-reported: timestamps show UTC instead of local time | — |
| Drawing canvas eraser leaves artifacts | Eraser tool doesn't fully clear strokes on high-DPI screens | — |

#### Column: Reproduced
| Card | Description | Assignee |
|------|-------------|----------|
| Empty kanban column shows shadow card | When column has 0 cards, a ghost card outline appears | Jordan Lee |

#### Column: Resolved ✅
| Card | Description | Assignee |
|------|-------------|----------|
| Reset password email not received | Nodemailer was timing out on some SMTP providers — fixed | Sarah Chen |
| Avatar upload crops to circle incorrectly | Aspect ratio was locked causing oval on non-square uploads | Alex Thompson |

---

## 8. How to Populate This Data

Use Prisma's `prisma.seed.ts` or a manual DB seed script. Here's the recommended seed order:

```
1. Create 6 users (User model)
2. Create 1 workspace (Workspace model) — owned by Sarah
3. Add WorkspaceMember records for all 6 users under the workspace
4. Create the 5 pages with realistic markdown content
5. Create 2 ChatRooms ("general" + "backend-team")
6. Seed ChatMessages into each room
7. Create 3 Drawings with titles and descriptions
8. Create folders (design, backend, product, qa)
9. Seed File records pointing to uploaded assets
10. Create 2 KanbanBoards (Sprint 12 + Bug Tracker)
11. Create KanbanColumns for each board
12. Seed KanbanCards with assignees (use CardAssignees relation)
```

### Example CardAssignees Seed (Kanban):

```ts
// Pseudocode — actual implementation in prisma/seed.ts
await prisma.kanbanCard.update({
  where: { id: cardId },
  data: {
    assignees: {
      connect: [{ id: marcusUserId }]
    }
  }
});
```

---

*Generated for the DevSpark Internal workspace. Replace all names, emails, and content with your own team data for the live demo.*
