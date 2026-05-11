"use strict";
/**
 * Prisma Database Seed
 * Populates the database with realistic team data for DevSpark Internal workspace.
 *
 * Run with: npx prisma db seed
 * (requires "prisma": { "seed": "ts-node prisma/seed.ts" } in package.json)
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
const BCRYPT_ROUNDS = 10;
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("🌱 Starting database seed...\n");
        // ============================================================
        // 1. Clean existing seed data (optional reset)
        // ============================================================
        console.log("🧹 Cleaning existing data...");
        yield prisma.chatMessage.deleteMany();
        yield prisma.chatRoom.deleteMany();
        yield prisma.kanbanCard.deleteMany({ where: {} });
        yield prisma.kanbanColumn.deleteMany({ where: {} });
        yield prisma.kanbanBoard.deleteMany({ where: {} });
        yield prisma.drawing.deleteMany({ where: {} });
        yield prisma.file.deleteMany({ where: {} });
        yield prisma.folder.deleteMany({ where: {} });
        yield prisma.page.deleteMany({ where: {} });
        yield prisma.workspaceMember.deleteMany({ where: {} });
        yield prisma.workspace.deleteMany({ where: {} });
        yield prisma.user.deleteMany({ where: {
                email: { in: [
                        "sarah@devspark.io",
                        "marcus@devspark.io",
                        "priya@devspark.io",
                        "alex@devspark.io",
                        "jordan@devspark.io",
                        "dana@devspark.io",
                    ] }
            } });
        console.log("   Done.\n");
        // ============================================================
        // 2. Create Users
        // ============================================================
        console.log("👤 Creating 6 users...");
        const passwordHash = yield bcryptjs_1.default.hash("devspark123", BCRYPT_ROUNDS);
        const sarah = yield prisma.user.create({
            data: {
                email: "sarah@devspark.io",
                password: passwordHash,
                name: "Sarah Chen",
                username: "sarahc",
                isVerified: true,
            },
        });
        const marcus = yield prisma.user.create({
            data: {
                email: "marcus@devspark.io",
                password: passwordHash,
                name: "Marcus Williams",
                username: "marcusw",
                isVerified: true,
            },
        });
        const priya = yield prisma.user.create({
            data: {
                email: "priya@devspark.io",
                password: passwordHash,
                name: "Priya Sharma",
                username: "priya_pm",
                isVerified: true,
            },
        });
        const alex = yield prisma.user.create({
            data: {
                email: "alex@devspark.io",
                password: passwordHash,
                name: "Alex Thompson",
                username: "alexd",
                isVerified: true,
            },
        });
        const jordan = yield prisma.user.create({
            data: {
                email: "jordan@devspark.io",
                password: passwordHash,
                name: "Jordan Lee",
                username: "jordanlee",
                isVerified: true,
            },
        });
        const dana = yield prisma.user.create({
            data: {
                email: "dana@devspark.io",
                password: passwordHash,
                name: "Dana Rivera",
                username: "danaq",
                isVerified: true,
            },
        });
        const users = { sarah, marcus, priya, alex, jordan, dana };
        console.log(`   Created ${Object.keys(users).length} users.\n`);
        // ============================================================
        // 3. Create Workspace
        // ============================================================
        console.log("🏢 Creating workspace 'DevSpark Internal'...");
        const workspace = yield prisma.workspace.create({
            data: {
                name: "DevSpark Internal",
                ownerId: sarah.id,
            },
        });
        console.log(`   Workspace: ${workspace.id}\n`);
        // ============================================================
        // 4. Add Workspace Members
        // ============================================================
        console.log("🔗 Adding workspace members...");
        const memberRole = "MEMBER";
        const adminRole = "ADMIN";
        yield prisma.workspaceMember.createMany({
            data: [
                { workspaceId: workspace.id, userId: sarah.id, role: "OWNER" },
                { workspaceId: workspace.id, userId: marcus.id, role: adminRole },
                { workspaceId: workspace.id, userId: priya.id, role: adminRole },
                { workspaceId: workspace.id, userId: alex.id, role: memberRole },
                { workspaceId: workspace.id, userId: jordan.id, role: memberRole },
                { workspaceId: workspace.id, userId: dana.id, role: memberRole },
            ],
        });
        console.log("   6 members added.\n");
        // ============================================================
        // 5. Create Pages
        // ============================================================
        console.log("📄 Creating 5 pages...");
        const pages = yield Promise.all([
            prisma.page.create({
                data: {
                    title: "DevSpark Wiki Home",
                    content: `# DevSpark Internal Wiki

Welcome to the DevSpark team wiki! This is where we document everything.

## Quick Links
- [[Backend API Docs]] — Technical reference
- [[Product Roadmap Q3]] — Current sprint goals
- [[Design System v2]] — UI guidelines
- [[Meeting Notes]] — All-hands and standups

## Team Norms
- Write what you'd want to read yourself
- Keep docs alive — stale docs are worse than no docs
- Tag docs with the relevant milestone`,
                    workspaceId: workspace.id,
                    authorId: sarah.id,
                },
            }),
            prisma.page.create({
                data: {
                    title: "Backend API Documentation",
                    content: `# Backend API Documentation

## Base URL
\`\`\`
https://api.devspark.io/v2
\`\`\`

## Authentication
All endpoints require a JWT Bearer token in the \`Authorization\` header.

## Endpoints

### GET /workspaces
Returns all workspaces the authenticated user has access to.

**Response:**
\`\`\`json
[
  {
    "id": "uuid",
    "name": "DevSpark Internal",
    "ownerId": "uuid",
    "createdAt": "2026-01-15T09:00:00Z"
  }
]
\`\`\`

### POST /pages
Create a new page in a workspace.

**Body:**
\`\`\`json
{
  "title": "Page Title",
  "content": "# Hello\\n\\nThis is markdown.",
  "workspaceId": "uuid"
}
\`\`\`

## Error Codes
| Code | Meaning |
|------|---------|
| 400 | Invalid request body |
| 401 | Missing or expired token |
| 403 | Insufficient permissions |
| 404 | Resource not found |
| 500 | Internal server error |

*Last reviewed by Marcus on 2026-04-28*`,
                    workspaceId: workspace.id,
                    authorId: marcus.id,
                },
            }),
            prisma.page.create({
                data: {
                    title: "Q3 Product Roadmap",
                    content: `# Q3 2026 Product Roadmap

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
- Is the offline mode MVP or polished?`,
                    workspaceId: workspace.id,
                    authorId: priya.id,
                },
            }),
            prisma.page.create({
                data: {
                    title: "Design System v2",
                    content: `# DevSpark Design System v2

## Colors

| Token | Hex | Usage |
|-------|-----|-------|
| \`brand-primary\` | #6366F1 | CTAs, active states |
| \`brand-secondary\` | #10B981 | Success, confirmations |
| \`surface-base\` | #111827 | Dark mode background |
| \`text-primary\` | #F9FAFB | Body text (dark mode) |

## Typography
- **Headings:** Inter Bold, 700
- **Body:** Inter Regular, 400
- **Code:** JetBrains Mono, 400

## Spacing Scale
We use a 4px base unit:
- \`xs\`: 4px
- \`sm\`: 8px
- \`md\`: 16px
- \`lg\`: 24px
- \`xl\`: 32px

## Components
- Buttons: solid / ghost / danger variants
- Inputs: text, select, toggle
- Cards: elevated / flat
- Navigation: sidebar (desktop) / bottom bar (mobile)

*Figma link: https://www.figma.com/file/devspark-ds-v2*`,
                    workspaceId: workspace.id,
                    authorId: alex.id,
                },
            }),
            prisma.page.create({
                data: {
                    title: "Sprint 12 Standup Notes",
                    content: `# Sprint 12 — Daily Standup Log

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
- **Priya:** Roadmap doc updated with new Milestone 3 details`,
                    workspaceId: workspace.id,
                    authorId: jordan.id,
                },
            }),
        ]);
        console.log(`   Created ${pages.length} pages.\n`);
        // ============================================================
        // 6. Create ChatRooms and ChatMessages
        // ============================================================
        console.log("💬 Creating chat rooms and messages...");
        const generalRoom = yield prisma.chatRoom.create({
            data: {
                name: "general",
                workspaceId: workspace.id,
            },
        });
        const backendRoom = yield prisma.chatRoom.create({
            data: {
                name: "backend-team",
                workspaceId: workspace.id,
            },
        });
        // Helper to create a message
        const msg = (roomId, authorId, content, offsetMinutes) => __awaiter(this, void 0, void 0, function* () {
            const d = new Date("2026-06-09T09:00:00Z");
            d.setMinutes(d.getMinutes() + offsetMinutes);
            return prisma.chatMessage.create({
                data: { chatRoomId: roomId, authorId, content, createdAt: d },
            });
        });
        // General room messages
        yield Promise.all([
            msg(generalRoom.id, jordan.id, "Morning everyone! Quick question — are we using `zod` or `joi` for validation?", 5),
            msg(generalRoom.id, marcus.id, "We agreed on `zod` last quarter. More predictable types", 8),
            msg(generalRoom.id, jordan.id, "Got it, thanks! Pulling it in now", 9),
            msg(generalRoom.id, priya.id, "Heads up — the Q3 roadmap doc is now live on the wiki", 22),
            msg(generalRoom.id, alex.id, "Just pushed the v2 design system to Figma, link is in the design page", 75),
            msg(generalRoom.id, dana.id, "Bug report filed: file upload fails on Safari 17. Priority high, assigning to Marcus", 123),
            msg(generalRoom.id, marcus.id, "On it. Reproduced locally, looks like a headers issue", 128),
            msg(generalRoom.id, sarah.id, "Great work everyone. Reminder: all-hands at 3pm today", 150),
            msg(generalRoom.id, jordan.id, "😄 will be there", 153),
        ]);
        // Backend room messages
        const backendDay2 = new Date("2026-06-10T09:00:00Z");
        const msg2 = (roomId, authorId, content, offsetMinutes) => __awaiter(this, void 0, void 0, function* () {
            const d = new Date(backendDay2);
            d.setMinutes(d.getMinutes() + offsetMinutes);
            return prisma.chatMessage.create({
                data: { chatRoomId: roomId, authorId, content, createdAt: d },
            });
        });
        yield Promise.all([
            msg2(backendRoom.id, marcus.id, "@jordanlee can you pick up card #51 after the file upload PR?", 30),
            msg2(backendRoom.id, jordan.id, "Sure, I'll start after standup", 32),
            msg2(backendRoom.id, marcus.id, "Cool. Also — there's a new column for 'Pending Review' on the API board. Don't forget to move cards there when you open a PR", 33),
            msg2(backendRoom.id, jordan.id, "Makes sense, done", 35),
        ]);
        console.log("   Created 2 chat rooms, 13 messages.\n");
        // ============================================================
        // 7. Create Drawings
        // ============================================================
        console.log("🎨 Creating 3 drawings...");
        const drawings = yield Promise.all([
            prisma.drawing.create({
                data: {
                    title: "App Architecture v3",
                    data: JSON.stringify({
                        version: 1,
                        strokes: [
                            { tool: "pen", color: "#3b82f6", width: 2, points: [{ x: 50, y: 50 }, { x: 200, y: 50 }] },
                            { tool: "pen", color: "#3b82f6", width: 2, points: [{ x: 200, y: 50 }, { x: 200, y: 150 }] },
                        ],
                    }),
                    workspaceId: workspace.id,
                    authorId: marcus.id,
                },
            }),
            prisma.drawing.create({
                data: {
                    title: "Homepage Wireframe Sketch",
                    data: JSON.stringify({
                        version: 1,
                        strokes: [
                            { tool: "pen", color: "#6366f1", width: 3, points: [{ x: 20, y: 30 }, { x: 300, y: 30 }, { x: 300, y: 80 }, { x: 20, y: 80 }, { x: 20, y: 30 }] },
                            { tool: "pen", color: "#6366f1", width: 2, points: [{ x: 30, y: 100 }, { x: 290, y: 100 }, { x: 290, y: 200 }, { x: 30, y: 200 }, { x: 30, y: 100 }] },
                        ],
                    }),
                    workspaceId: workspace.id,
                    authorId: alex.id,
                },
            }),
            prisma.drawing.create({
                data: {
                    title: "Flowchart — Onboarding",
                    data: JSON.stringify({
                        version: 1,
                        strokes: [
                            { tool: "rect", color: "#10b981", width: 2, x: 100, y: 20, w: 80, h: 40 },
                            { tool: "rect", color: "#10b981", width: 2, x: 100, y: 80, w: 80, h: 40 },
                            { tool: "rect", color: "#10b981", width: 2, x: 100, y: 140, w: 80, h: 40 },
                            { tool: "line", color: "#666", width: 1, points: [{ x: 140, y: 60 }, { x: 140, y: 80 }] },
                        ],
                    }),
                    workspaceId: workspace.id,
                    authorId: priya.id,
                },
            }),
        ]);
        console.log(`   Created ${drawings.length} drawings.\n`);
        // ============================================================
        // 8. Create Folders
        // ============================================================
        console.log("📁 Creating 4 folders (one-by-one for IDs)...");
        const designFolder = yield prisma.folder.create({ data: { name: "design", workspaceId: workspace.id } });
        const backendFolder = yield prisma.folder.create({ data: { name: "backend", workspaceId: workspace.id } });
        const productFolder = yield prisma.folder.create({ data: { name: "product", workspaceId: workspace.id } });
        const qaFolder = yield prisma.folder.create({ data: { name: "qa", workspaceId: workspace.id } });
        console.log("   Created folders: design, backend, product, qa.\n");
        // ============================================================
        // 9. Create Files
        // ============================================================
        console.log("📎 Creating files...");
        const makeFile = (name, url, size, type, description, uploaderId, folderId) => prisma.file.create({
            data: {
                name,
                url,
                size,
                type,
                description,
                workspaceId: workspace.id,
                uploaderId,
                folderId: folderId !== null && folderId !== void 0 ? folderId : null,
            },
        });
        yield Promise.all([
            // /design
            makeFile("brand-primary-v2.zip", "https://placeholder.devspark.io/storage/brand-primary-v2.zip", 204800, "image/svg+xml", "Logo assets in SVG + PNG, all color variants", alex.id, designFolder.id),
            makeFile("devspark-ui-kit.fig", "https://placeholder.devspark.io/storage/devspark-ui-kit.fig", 819200, "application/figma", "Figma UI kit for DevSpark v2 design system", alex.id, designFolder.id),
            makeFile("icon-set-v1.svg", "https://placeholder.devspark.io/storage/icon-set-v1.svg", 16384, "image/svg+xml", "Custom icon set (36 icons, outlined style)", alex.id, designFolder.id),
            makeFile("wireframe-homepage-v3.png", "https://placeholder.devspark.io/storage/wireframe-homepage-v3.png", 102400, "image/png", "Exported homepage wireframe at 1440px width", alex.id, designFolder.id),
            makeFile("color-tokens.json", "https://placeholder.devspark.io/storage/color-tokens.json", 2048, "application/json", "Design tokens exported from Figma as JSON", alex.id, designFolder.id),
            // /backend
            makeFile("api-schema-openapi.yaml", "https://placeholder.devspark.io/storage/api-schema-openapi.yaml", 32768, "application/yaml", "OpenAPI 3.0 spec for all v2 endpoints", marcus.id, backendFolder.id),
            makeFile("db-migration-notes.md", "https://placeholder.devspark.io/storage/db-migration-notes.md", 4096, "text/markdown", "Notes on the 2026-05 schema migration", marcus.id, backendFolder.id),
            makeFile("performance-benchmark-q2.pdf", "https://placeholder.devspark.io/storage/performance-benchmark-q2.pdf", 512000, "application/pdf", "Q2 load test results: p95 latency, RPS under load", marcus.id, backendFolder.id),
            makeFile("sql-scripts.zip", "https://placeholder.devspark.io/storage/sql-scripts.zip", 10240, "application/zip", "Utility SQL scripts: cleanup, anonymization", marcus.id, backendFolder.id),
            // /product
            makeFile("q3-roadmap.xlsx", "https://placeholder.devspark.io/storage/q3-roadmap.xlsx", 204800, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "Full Q3 roadmap with owners, status, and dependencies", priya.id, productFolder.id),
            makeFile("user-research-notes.pdf", "https://placeholder.devspark.io/storage/user-research-notes.pdf", 409600, "application/pdf", "Compiled notes from 12 user interviews (anonymized)", priya.id, productFolder.id),
            makeFile("competitive-analysis-2026.pdf", "https://placeholder.devspark.io/storage/competitive-analysis-2026.pdf", 819200, "application/pdf", "Competitor audit: Notion, Linear, Coda", priya.id, productFolder.id),
            makeFile("sprint-retrospective-s11.txt", "https://placeholder.devspark.io/storage/sprint-retrospective-s11.txt", 2048, "text/plain", "S11 retro notes: what worked, what to improve", priya.id, productFolder.id),
            // /qa
            makeFile("test-plan-v1.2.pdf", "https://placeholder.devspark.io/storage/test-plan-v1.2.pdf", 307200, "application/pdf", "Master test plan for v1.2 release", dana.id, qaFolder.id),
            makeFile("bug-report-safari-upload.png", "https://placeholder.devspark.io/storage/bug-report-safari-upload.png", 256000, "image/png", "Screenshots attached to bug report #204", dana.id, qaFolder.id),
            makeFile("automation-suite-cypress.zip", "https://placeholder.devspark.io/storage/automation-suite-cypress.zip", 102400, "application/zip", "Cypress E2E test suite for critical flows", dana.id, qaFolder.id),
            // Root
            makeFile("team-photo-2026.jpg", "https://placeholder.devspark.io/storage/team-photo-2026.jpg", 409600, "image/jpeg", "All-hands team photo, March 2026", sarah.id),
            makeFile("roadmap-meeting-notes.pdf", "https://placeholder.devspark.io/storage/roadmap-meeting-notes.pdf", 102400, "application/pdf", "PDF notes from the Q3 planning meeting", priya.id),
        ]);
        console.log("   Created 17 files across 5 locations.\n");
        // ============================================================
        // 10. Create Kanban Boards
        // ============================================================
        console.log("📋 Creating kanban boards...");
        // --- Sprint 12 ---
        const sprintBoard = yield prisma.kanbanBoard.create({
            data: {
                title: "Sprint 12",
                workspaceId: workspace.id,
            },
        });
        const sprintColumns = yield Promise.all([
            prisma.kanbanColumn.create({ data: { title: "Backlog", color: "#6b7280", boardId: sprintBoard.id, order: 0 } }),
            prisma.kanbanColumn.create({ data: { title: "To Do", color: "#3b82f6", boardId: sprintBoard.id, order: 1 } }),
            prisma.kanbanColumn.create({ data: { title: "In Progress", color: "#f59e0b", boardId: sprintBoard.id, order: 2 } }),
            prisma.kanbanColumn.create({ data: { title: "Pending Review", color: "#8b5cf6", boardId: sprintBoard.id, order: 3 } }),
            prisma.kanbanColumn.create({ data: { title: "Done ✅", color: "#10b981", boardId: sprintBoard.id, order: 4 } }),
        ]);
        const [backlog, todo, inProgress, pendingReview, done] = sprintColumns;
        const card = (colId, authorId, content, description, order, assigneeIds) => prisma.kanbanCard.create({
            data: {
                columnId: colId,
                authorId,
                content,
                description,
                order,
                assignees: { connect: assigneeIds.map((id) => ({ id })) },
            },
        });
        yield Promise.all([
            // Backlog
            card(backlog.id, sarah.id, "Add dark mode toggle persistence", "Save dark/light preference to localStorage and sync across tabs", 0, [jordan.id]),
            card(backlog.id, marcus.id, "Document all new API endpoints", "OpenAPI spec is missing 4 endpoints from Q3", 1, [marcus.id]),
            card(backlog.id, priya.id, "Design onboarding illustrations", "Need 3 new illustrations for mobile onboarding screens", 2, [alex.id]),
            card(backlog.id, dana.id, "Write performance tests for chat", "Load test the WebSocket chat under 50 concurrent users", 3, [dana.id]),
            // To Do
            card(todo.id, dana.id, "Fix file upload on Safari 17", "Bug #204: multipart/form-data headers misconfigured", 0, [marcus.id]),
            card(todo.id, jordan.id, "Kanban card reorder bug", "Cards snap back to original position after drag end", 1, [jordan.id]),
            card(todo.id, priya.id, "Update email templates", "Current templates are from v1.0, need refresh", 2, [priya.id]),
            // In Progress
            card(inProgress.id, marcus.id, "WebSocket reconnection logic", "Auto-reconnect with exponential backoff for mobile users", 0, [marcus.id]),
            card(inProgress.id, jordan.id, "Drawing canvas undo feature", "Store last 50 stroke actions in history stack", 1, [jordan.id]),
            // Pending Review
            card(pendingReview.id, jordan.id, "Drag-and-drop file reordering", "Allow reordering files within folders via drag", 0, [jordan.id]),
            // Done
            card(done.id, marcus.id, "JWT refresh bug", "Refresh tokens were not being rotated on some edge cases", 0, [marcus.id]),
            card(done.id, marcus.id, "Migrate to Prisma v5", "Upgrade ORM and fix breaking changes in schema", 1, [marcus.id]),
            card(done.id, alex.id, "Style guide for markdown renderer", "Code blocks had wrong font, fixed", 2, [alex.id]),
            card(done.id, dana.id, "QA test plan for v1.2", "All 48 test cases written and approved", 3, [dana.id]),
        ]);
        // --- Bug Tracker ---
        const bugBoard = yield prisma.kanbanBoard.create({
            data: {
                title: "Bug Tracker",
                workspaceId: workspace.id,
            },
        });
        const bugColumns = yield Promise.all([
            prisma.kanbanColumn.create({ data: { title: "Open", color: "#ef4444", boardId: bugBoard.id, order: 0 } }),
            prisma.kanbanColumn.create({ data: { title: "Reproduced", color: "#f59e0b", boardId: bugBoard.id, order: 1 } }),
            prisma.kanbanColumn.create({ data: { title: "In Fix", color: "#3b82f6", boardId: bugBoard.id, order: 2 } }),
            prisma.kanbanColumn.create({ data: { title: "Resolved ✅", color: "#10b981", boardId: bugBoard.id, order: 3 } }),
            prisma.kanbanColumn.create({ data: { title: "Closed", color: "#6b7280", boardId: bugBoard.id, order: 4 } }),
        ]);
        const [bugOpen, bugReproduced, bugInFix, bugResolved, bugClosed] = bugColumns;
        yield Promise.all([
            // Open
            card(bugOpen.id, dana.id, "Safari 17 file upload fails", "Reproducible every time on iOS Safari, POST returns 415", 0, [marcus.id]),
            card(bugOpen.id, dana.id, "Chat message timestamp off by 1h", "User-reported: timestamps show UTC instead of local time", 1, []),
            card(bugOpen.id, dana.id, "Drawing canvas eraser leaves artifacts", "Eraser tool doesn't fully clear strokes on high-DPI screens", 2, []),
            // Reproduced
            card(bugReproduced.id, dana.id, "Empty kanban column shows shadow card", "When column has 0 cards, a ghost card outline appears", 0, [jordan.id]),
            // In Fix
            card(bugInFix.id, dana.id, "Safari 17 file upload — fix in progress", "Marcus is actively working on this", 0, [marcus.id]),
            // Resolved
            card(bugResolved.id, sarah.id, "Reset password email not received", "Nodemailer was timing out on some SMTP providers — fixed", 0, [sarah.id]),
            card(bugResolved.id, alex.id, "Avatar upload crops to circle incorrectly", "Aspect ratio was locked causing oval on non-square uploads", 1, [alex.id]),
            // Closed
            card(bugClosed.id, alex.id, "Avatar upload — verified fix", "Fixed in PR #89, closed", 0, [alex.id]),
        ]);
        console.log("   Created 2 boards (Sprint 12, Bug Tracker) with 20+ cards.\n");
        // ============================================================
        // Done
        // ============================================================
        console.log("✅ Seed complete!");
        console.log("\n📋 Login credentials (all verified, password: devspark123):");
        console.log("   sarah@devspark.io    — OWNER");
        console.log("   marcus@devspark.io   — ADMIN");
        console.log("   priya@devspark.io    — ADMIN");
        console.log("   alex@devspark.io     — MEMBER");
        console.log("   jordan@devspark.io   — MEMBER");
        console.log("   dana@devspark.io     — MEMBER");
    });
}
main()
    .then(() => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma.$disconnect();
}))
    .catch((e) => __awaiter(void 0, void 0, void 0, function* () {
    console.error("❌ Seed failed:", e);
    yield prisma.$disconnect();
    process.exit(1);
}));
