# Notion Clone — Full Project Documentation

A full-stack collaborative workspace application inspired by Notion, built with Next.js, Express, Socket.io, and PostgreSQL. Supports real-time collaborative editing, team chat, kanban boards, file management, and collaborative drawing.

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Architecture Overview](#architecture-overview)
3. [Features](#features)
4. [Project Structure](#project-structure)
5. [Database Schema](#database-schema)
6. [API Reference](#api-reference)
7. [Real-Time System](#real-time-system)
8. [Authentication & Security](#authentication--security)
9. [Deployment](#deployment)
10. [Setup & Running](#setup--running)
11. [Testing](#testing)

---

## Tech Stack

### Frontend

| Technology | Purpose |
|---|---|
| **Next.js 15** (App Router) | React framework |
| **React 19** | UI library |
| **TypeScript** | Type safety |
| **Tailwind CSS 3** | Utility-first styling |
| **Socket.io Client** | Real-time connections |
| **Axios** | HTTP client with JWT interceptors |
| **Lucide React** | Icon library |
| **react-markdown + remark-gfm** | Markdown editing & preview |
| **rehype-highlight + highlight.js** | Code syntax highlighting |

### Backend

| Technology | Purpose |
|---|---|
| **Node.js / Express 4** | REST API server |
| **TypeScript** | Type safety |
| **Socket.io 4** | Real-time events |
| **Prisma ORM 5** | Database ORM |
| **PostgreSQL (Supabase)** | Database |
| **Supabase JS Client** | File storage (avatars, uploads) |
| **JWT (jsonwebtoken)** | Authentication |
| **bcryptjs** | Password hashing |
| **Multer** | File upload handling |
| **Nodemailer** | Email (verification, password reset) |
| **Node-cron** | Scheduled maintenance |

### DevOps

| Technology | Purpose |
|---|---|
| **Docker & Docker Compose** | 3-service containerization |
| **Render** | Cloud deployment |
| **Vitest + Supertest** | Backend testing |
| **Playwright** | E2E testing |

---

## Architecture Overview

The application follows a standard 3-tier architecture:

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                    │
│  Port 3000                                              │
│  - Landing / Login / Register / Forgot Password         │
│  - Dashboard (workspace listing)                        │
│  - Workspace (Pages, Chat, Kanban, Files, Canvas)       │
│  - Admin Panel                                          │
│  - Email verification & password reset pages            │
└──────────────┬────────────────────┬──────────────────────┘
               │ HTTP (Axios)       │ WebSocket (Socket.io)
               ▼                    ▼
┌─────────────────────────────────────────────────────────┐
│                 Backend (Express + Socket.io)             │
│  Port 8000                                               │
│  Routes: /api/auth, /api/workspaces, /api/pages, ...     │
│  Socket rooms: page-*, drawing-*, chat-room-*, kanban-*  │
│  Middleware: JWT authentication                           │
│  Scheduled: daily cleanup of unverified users & orphans   │
└──────────────┬───────────────────────────────────────────┘
               │ Prisma ORM
               ▼
┌─────────────────────────────────────────────────────────┐
│            PostgreSQL (Supabase)                         │
│  13 tables: User, Workspace, WorkspaceMember, Page,     │
│  Folder, File, Drawing, ChatRoom, ChatMessage,           │
│  KanbanBoard, KanbanColumn, KanbanCard, Report           │
└─────────────────────────────────────────────────────────┘
```

The frontend communicates with the backend via REST API for data operations and WebSocket (Socket.io) for real-time collaboration. The backend uses Prisma ORM to interact with PostgreSQL and Supabase's JS client for file storage.

---

## Features

### 1. Authentication & User Management

- **Registration** with first/last name, email, password
- **Email verification** flow (sends verification email with token)
- **Login** with JWT token (stored in cookie)
- **Forgot / Reset password** via email link
- **Profile editing** (username, avatar upload)
- **Two hardcoded admin accounts**: `admin@example.com` and `admin@gmail.com`

### 2. Workspaces

- Create, rename, and delete workspaces
- Invite members via email or username
- Role system: OWNER > ADMIN > MEMBER (only owner can delete the workspace)
- Members listed with avatars in the dashboard
- Dashboard shows all workspaces the user belongs to

### 3. Real-Time Collaborative Pages (Markdown Editor)

- Full Markdown editor with live preview
- GitHub Flavored Markdown support (tables, task lists, etc.)
- **Syntax highlighting** for code blocks via highlight.js
- **Collaborative cursors**: see other users' caret positions in real-time
- Auto-save on content change
- Pages can be nested (parentId relationship)
- Each workspace has its own set of pages
- Image embedding via upload or URL

### 4. Team Chat

- Multiple chat rooms per workspace (e.g., "general", "backend-team")
- **Real-time messaging** via Socket.io
- Edit and delete own messages
- Messages show "(edited)" tag when modified
- Character limit of 1000 per message
- Auto-scroll to bottom with new messages

### 5. Kanban Boards

- Multiple boards per workspace
- Custom columns with **color coding** and ordering
- **Drag-and-drop cards** between columns and reorder within columns
- Card detail modal: content, description, assigned members
- Column reorder for workspace owner
- Real-time updates across all connected users
- Board rename support

### 6. File Explorer

- **GitHub-like** nested folder structure
- File upload with description (commit-style)
- Uploads stored in **Supabase Storage**
- Image preview with modal viewer
- Code file preview with **syntax highlighting**
- In-browser code editing and saving
- File search within workspace
- Type-based file icons

### 7. Collaborative Drawing Canvas

- Drawing tools: **Pen** (with color picker) and **Eraser**
- Line width slider (1-50px)
- **Undo history** (last 20 actions)
- **Real-time stroke sync** across connected users
- Save/load drawings with thumbnails
- Download as PNG
- Supports both **data URL** and **JSON stroke format** for saved drawings

### 8. Admin Panel

- Dashboard with user/workspace/file counts and **30-day growth stats**
- User management: view, edit, and cleanup unverified users (>30 days)
- Workspace management: view details, delete, cleanup orphan workspaces
- File management: view and delete files
- Report management: view, update status (OPEN/RESOLVED)
- **CSV export** of reports
- Sorting and pagination on all list views

### 9. Scheduled Maintenance

- **Daily at midnight**: removes unverified users older than 30 days
- **Daily at midnight**: removes orphan workspaces (no members, no owner)
- Cascade deletes: removing a user deletes their pages, drawings, chat messages, kanban cards
- Supabase storage cleanup for removed files

### 10. Dark Mode

- System-wide dark mode toggle
- Persisted in localStorage
- Applied via Tailwind's `dark:` prefix and CSS custom properties
- Works across all pages and components

---

## Project Structure

```
notion-clone-project/
├── docker-compose.yml          # PostgreSQL + Backend + Frontend
├── README.md                   # Quick start
├── SEED_DATA.md                # Demo dataset guide
├── GEMINI.md                   # AI context memory
├── Document.md                 # Full system documentation
├── TESTING.md                  # Testing guide
│
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   ├── prisma/
│   │   ├── schema.prisma       # 13 database models
│   │   └── seed.ts             # Demo data seeder
│   └── src/
│       ├── index.ts            # Server entry
│       ├── prisma.ts           # Prisma client singleton
│       ├── supabase.ts         # Supabase client
│       ├── middleware/
│       │   └── auth.ts         # JWT verification
│       ├── routes/
│       │   ├── auth.ts         # Auth endpoints
│       │   ├── workspace.ts    # Workspace CRUD
│       │   ├── page.ts         # Page CRUD
│       │   ├── file.ts         # File + folder management
│       │   ├── upload.ts       # Image upload
│       │   ├── drawing.ts      # Drawing CRUD
│       │   ├── chat.ts         # Chat rooms + messages
│       │   ├── kanban.ts       # Kanban CRUD
│       │   └── admin.ts        # Admin operations
│       ├── socket/
│       │   └── index.ts        # Socket.io handlers
│       ├── scripts/
│       │   └── cleanup.ts      # Cron maintenance
│       └── utils/
│           └── mailer.ts       # Email sender
│
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   ├── next.config.js
│   ├── tailwind.config.js
│   ├── vitest.config.ts
│   └── src/
│       ├── lib/
│       │   ├── api.ts          # Axios with JWT interceptor
│       │   └── socket.ts       # Socket.io client
│       ├── components/
│       │   ├── Sidebar.tsx     # Nav + members
│       │   ├── Avatar.tsx      # User avatar
│       │   ├── FileExplorer.tsx
│       │   ├── DrawingCanvas.tsx
│       │   ├── Chat.tsx
│       │   └── KanbanBoard.tsx
│       ├── app/
│       │   ├── layout.tsx
│       │   ├── globals.css
│       │   ├── page.tsx              # Landing
│       │   ├── dashboard/page.tsx    # Workspace list
│       │   ├── workspace/[id]/page.tsx
│       │   ├── admin/page.tsx
│       │   ├── reset-password/page.tsx
│       │   └── verify-email/page.tsx
│       └── __tests__/
│           ├── setup.ts
│           └── components/
│               ├── Avatar.test.tsx
│               ├── Chat.test.tsx
│               ├── Sidebar.test.tsx
│               ├── FileExplorer.test.tsx
│               ├── DrawingCanvas.test.tsx
│               └── KanbanBoard.test.tsx
│
└── docs/                       # Research papers
    ├── Research-Paper-Complete.md
    ├── Backend-Research-Paper.md
    ├── Diploma-Research-Paper.md
    ├── Diploma-Presentation.md
    └── ... (Mongolian docs)
```

---

## Database Schema

The database has **13 tables** with UUID primary keys and cascade deletes on all foreign keys.

### User
| Field | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| email | String | Unique |
| password | String | bcrypt hashed |
| firstName | String? | |
| lastName | String? | |
| name | String? | Computed full name |
| username | String? | Unique |
| avatarUrl | String? | Supabase Storage URL |
| isVerified | Boolean | Default false |
| verificationToken | String? | Email verification |
| resetToken | String? | Password reset |
| resetTokenExpiry | DateTime? | |
| createdAt | DateTime | |
| updatedAt | DateTime | |

### Workspace
| Field | Type | Notes |
|---|---|---|
| id | UUID | |
| name | String | |
| ownerId | String | FK -> User |
| createdAt | DateTime | |
| updatedAt | DateTime | |

### WorkspaceMember
| Field | Type | Notes |
|---|---|---|
| id | UUID | |
| workspaceId | String | FK -> Workspace |
| userId | String | FK -> User |
| role | String | OWNER / ADMIN / MEMBER |
| joinedAt | DateTime | |
| **Unique** | | (workspaceId, userId) |

### Page
| Field | Type | Notes |
|---|---|---|
| id | UUID | |
| title | String | |
| content | String | Markdown content |
| workspaceId | String | FK -> Workspace |
| authorId | String | FK -> User |
| parentId | String? | FK -> Page (self, nesting) |
| createdAt | DateTime | |
| updatedAt | DateTime | |

### Folder
| Field | Type | Notes |
|---|---|---|
| id | UUID | |
| name | String | |
| workspaceId | String | FK -> Workspace |
| parentId | String? | FK -> Folder (self, nesting) |
| createdAt | DateTime | |
| updatedAt | DateTime | |

### File
| Field | Type | Notes |
|---|---|---|
| id | UUID | |
| name | String | |
| url | String | Supabase Storage URL |
| size | Int | bytes |
| type | String | MIME type |
| description | String? | Commit-style |
| workspaceId | String | FK -> Workspace |
| uploaderId | String | FK -> User |
| folderId | String? | FK -> Folder |
| createdAt | DateTime | |

### Drawing
| Field | Type | Notes |
|---|---|---|
| id | UUID | |
| title | String | Default "Untitled Drawing" |
| data | String | Base64 or JSON strokes |
| workspaceId | String | FK -> Workspace |
| authorId | String | FK -> User |
| createdAt | DateTime | |
| updatedAt | DateTime | |

### ChatRoom
| Field | Type | Notes |
|---|---|---|
| id | UUID | |
| name | String | |
| workspaceId | String | FK -> Workspace |
| createdAt | DateTime | |

### ChatMessage
| Field | Type | Notes |
|---|---|---|
| id | UUID | |
| content | String | |
| chatRoomId | String | FK -> ChatRoom |
| authorId | String | FK -> User |
| createdAt | DateTime | |
| updatedAt | DateTime | |

### KanbanBoard
| Field | Type | Notes |
|---|---|---|
| id | UUID | |
| title | String | |
| workspaceId | String | FK -> Workspace |
| createdAt | DateTime | |
| updatedAt | DateTime | |

### KanbanColumn
| Field | Type | Notes |
|---|---|---|
| id | UUID | |
| title | String | |
| color | String? | Default "#3b82f6" |
| boardId | String | FK -> KanbanBoard |
| order | Int | |
| createdAt | DateTime | |
| updatedAt | DateTime | |

### KanbanCard
| Field | Type | Notes |
|---|---|---|
| id | UUID | |
| content | String | |
| description | String? | |
| columnId | String | FK -> KanbanColumn |
| authorId | String | FK -> User |
| order | Int | |
| createdAt | DateTime | |
| updatedAt | DateTime | |

**Many-to-Many**: KanbanCard <-> User (assignees via implicit relation table)

### Report
| Field | Type | Notes |
|---|---|---|
| id | UUID | |
| title | String | |
| description | String | |
| status | String | OPEN / RESOLVED |
| reporterId | String | (no formal FK) |
| createdAt | DateTime | |
| updatedAt | DateTime | |

---

## API Reference

All API routes are mounted under `/api` and use JSON request/response bodies unless noted.

### Authentication (`/api/auth`)

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | No | Register with email, password, firstName, lastName |
| POST | `/auth/login` | No | Login with email, password → returns JWT |
| POST | `/auth/forgot-password` | No | Sends reset email |
| POST | `/auth/reset-password` | No | Resets password with token |
| GET | `/auth/verify-email` | No | Verifies email with token (query param) |
| PUT | `/auth/profile` | Yes | Update username, avatar |

### Workspaces (`/api/workspaces`)

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/workspaces` | Yes | Create workspace |
| GET | `/workspaces` | Yes | List user's workspaces (with member count & avatars) |
| GET | `/workspaces/:id` | Yes | Get workspace details |
| PUT | `/workspaces/:id` | Yes | Rename workspace (owner only) |
| DELETE | `/workspaces/:id` | Yes | Delete workspace (owner only) |
| GET | `/workspaces/:id/members` | Yes | List members with roles |
| POST | `/workspaces/:id/invite` | Yes | Invite member by email/username |
| DELETE | `/workspaces/:id/members/:memberId` | Yes | Remove member |

### Pages (`/api/pages`)

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/pages` | Yes | Create page (body: title, workspaceId, parentId?) |
| GET | `/pages/workspace/:workspaceId` | Yes | List all pages in workspace |
| GET | `/pages/:id` | Yes | Get page with content |
| PUT | `/pages/:id` | Yes | Update title/content |

### Chat (`/api/chat`)

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/chat/workspace/:workspaceId/rooms` | Yes | List chat rooms |
| POST | `/chat/workspace/:workspaceId/rooms` | Yes | Create room |
| GET | `/chat/room/:roomId/messages` | Yes | Get messages |
| POST | `/chat/room/:roomId` | Yes | Send message (emits socket event) |
| PUT | `/chat/message/:messageId` | Yes | Edit message (emits socket event) |
| DELETE | `/chat/message/:messageId` | Yes | Delete message (emits socket event) |

### Kanban (`/api/kanban`)

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/kanban/workspace/:workspaceId` | Yes | List boards |
| POST | `/kanban/workspace/:workspaceId` | Yes | Create board (with default columns) |
| PUT | `/kanban/board/:boardId` | Yes | Rename board |
| GET | `/kanban/board/:boardId` | Yes | Get board with columns & cards |
| POST | `/kanban/board/:boardId/columns` | Yes | Add column |
| PUT | `/kanban/columns/:columnId` | Yes | Update column (title, color) |
| PUT | `/kanban/columns/:columnId/reorder` | Yes | Reorder columns |
| DELETE | `/kanban/columns/:columnId` | Yes | Delete column & its cards |
| POST | `/kanban/columns/:columnId/cards` | Yes | Add card |
| PUT | `/kanban/cards/:cardId` | Yes | Update card (content, description, columnId) |
| PUT | `/kanban/cards/:cardId/assign` | Yes | Toggle assignee |
| DELETE | `/kanban/cards/:cardId` | Yes | Delete card |

### Drawings (`/api/drawings`)

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/drawings/workspace/:workspaceId` | Yes | List drawings |
| POST | `/drawings/workspace/:workspaceId` | Yes | Create drawing |
| GET | `/drawings/:id` | Yes | Get drawing |
| PUT | `/drawings/:id` | Yes | Update drawing data |
| DELETE | `/drawings/:id` | Yes | Delete drawing |

### Files (`/api/files`)

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/files/workspace/:workspaceId` | Yes | List files & folders (nested) |
| POST | `/files/workspace/:workspaceId` | Yes | Upload file (multipart) |
| POST | `/files/folders/:workspaceId` | Yes | Create folder |
| PUT | `/files/:id` | Yes | Update file content (for code editing) |
| DELETE | `/files/:id` | Yes | Delete file (also from Supabase) |
| DELETE | `/files/folders/:id` | Yes | Delete folder |

### Upload (`/api/upload`)

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/upload` | Yes | Upload image (5MB limit, stores in Supabase) |

### Admin (`/api/admin`)

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/admin/stats` | Admin | Counts: users, workspaces, files, reports |
| GET | `/admin/users` | Admin | List users (paginated, sortable) |
| PUT | `/admin/users/:id` | Admin | Update user |
| GET | `/admin/users/:id` | Admin | Get user details |
| DELETE | `/admin/users/unverified` | Admin | Delete unverified users >30 days |
| GET | `/admin/workspaces` | Admin | List workspaces |
| PUT | `/admin/workspaces/:id` | Admin | Update workspace |
| GET | `/admin/workspaces/:id` | Admin | Get workspace details |
| DELETE | `/admin/workspaces/:id` | Admin | Delete workspace |
| DELETE | `/admin/workspaces/orphan` | Admin | Delete orphan workspaces |
| GET | `/admin/files` | Admin | List all files |
| DELETE | `/admin/files/:id` | Admin | Delete file |
| GET | `/admin/reports` | Admin | List reports |
| POST | `/admin/reports` | Admin | Create report |
| PUT | `/admin/reports/:id` | Admin | Update report status |

---

## Real-Time System

The application uses **Socket.io** for real-time communication. The system is organized into isolated "rooms" to ensure users only receive relevant events.

### Socket Rooms

| Room Pattern | Purpose | Events |
|---|---|---|
| `page-{pageId}` | Collaborative page editing | cursor-move, update-page, user-left |
| `drawing-{workspaceId}` | Unsaved drawing collaboration | draw-stroke, drawing-cleared, request-canvas-state, canvas-state-sent |
| `drawing-saved-{drawingId}` | Saved drawing editing | (same as above) |
| `chat-room-{roomId}` | Team chat | message-received, message-edited, message-deleted |
| `kanban-{boardId}` | Kanban board updates | kanban-updated |
| `chat-{workspaceId}` | Member updates | member-updated |

### Connection Flow

1. Client connects to Socket.io server (auto-connect via `lib/socket.ts`)
2. On entering a feature (page, drawing, etc.), client emits `join-*` event
3. Server adds client to the appropriate room
4. Client receives real-time broadcasts from other users in the same room
5. On leaving, client emits `leave-*` event and is removed from the room
6. On disconnect, all rooms are cleaned up automatically

### Collaborative Page Editing

When a user types in the markdown editor:
1. `cursor-move` event is emitted with cursor position + username
2. Other users in the page room receive the position and render a caret
3. On content change, `update-page` event broadcasts the new content
4. Other users update their preview in real-time

### Collaborative Drawing

When a user draws on the canvas:
1. `draw-stroke` event is emitted with stroke coordinates, color, width, tool
2. Other users receive `stroke-received` and render the stroke on their canvas
3. When a new user joins a drawing room, existing users send their full canvas state via `canvas-state-sent` to sync the newcomer

### Chat Real-Time

When a message is sent via the API:
1. The route handler saves the message to the database
2. It then emits `message-received` (or `message-edited` / `message-deleted`) to the `chat-room-{roomId}` room
3. All clients in the room receive the update

### Kanban Real-Time

When a card is moved, column is reordered, or any kanban change occurs:
1. The API route handler updates the database
2. It emits `kanban-updated` to the `kanban-{boardId}` room
3. All clients refetch or apply the change

---

## Authentication & Security

### JWT Authentication

- On login, the server returns a JWT token signed with `JWT_SECRET`
- The frontend stores the token in a cookie via `js-cookie`
- The Axios interceptor (`lib/api.ts`) reads the token from cookies and adds `Authorization: Bearer <token>` header to every request
- The `authenticateToken` middleware (`middleware/auth.ts`) verifies the token and attaches `req.user.userId` to the request
- Invalid/expired tokens return 401 (unauthorized)

### Admin Access

- Admin routes are protected by both `authenticateToken` and `requireAdmin` middleware
- Access is granted to users with email `admin@example.com` or `admin@gmail.com`
- Admin panel includes: stats dashboard, user/workspace/file management, report handling, CSV export

### Email Verification

- Registration creates a user with `isVerified: false` and a random `verificationToken`
- An email is sent with a verification link containing the token
- Clicking the link hits `/api/auth/verify-email`, which sets `isVerified: true`
- Unverified users are automatically cleaned up after 30 days

### Password Reset

- User requests reset via `/api/auth/forgot-password` with their email
- Server generates a random `resetToken` with a 1-hour expiry
- An email is sent with a reset link containing the token
- The reset page (`/reset-password`) reads the token from URL and allows setting a new password

### Security Measures

- Passwords are hashed with bcrypt (10 rounds)
- JWT is configured with a secret from environment variables
- File uploads are limited to 5MB and images only (via Multer)
- Request body size is limited to 50MB
- CORS is configured (currently allows all origins for development)

---

## Deployment

### Docker Compose (Local Development)

The application runs as 3 Docker services:

```yaml
services:
  db:       # PostgreSQL 16 on port 5433
  backend:  # Express API on port 8000
  frontend: # Next.js on port 3000
```

**Backend Dockerfile**:
- Base: `node:20-slim`
- Installs OpenSSL (required by Prisma)
- Runs `npm install`, `npx prisma generate`, `npm run build`
- On start: waits 5s (for DB), runs `prisma db push`, then starts the server

**Frontend Dockerfile**:
- Base: `node:20-slim`
- Build args: `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SOCKET_URL`
- Runs `npm install`, `npm run build`
- Starts with `npm start`

### Render (Cloud Deployment)

The backend can be deployed on Render as a **Web Service**:
- **Build Command**: `npm install && npx prisma generate && npm run build`
- **Start Command**: `npm start` (runs `node dist/index.js`)
- **Environment Variables**: `DATABASE_URL`, `JWT_SECRET`, `PORT`, `FRONTEND_URL`, SMTP config, Supabase config

The frontend can be deployed on Render as a **Static Site** or **Web Service**:
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `.next` (for static) or **Start Command**: `npm start` (for Node)

### Environment Variables

Copy `backend/.env.example` to `backend/.env` and configure:

```
DATABASE_URL=postgresql://user:pass@host:5432/db
JWT_SECRET=your_secret_key
PORT=8000
FRONTEND_URL=http://localhost:3000

# SMTP (Gmail app password recommended)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=Notion Clone <your-email@gmail.com>

# Supabase (for file storage)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_STORAGE_BUCKET=notion-clone-files
```

---

## Setup & Running

### Prerequisites

- Node.js 20+
- PostgreSQL (or Docker)
- npm or yarn

### Option 1: Docker (Recommended)

```bash
# Clone and enter the project
cd notion-clone-project

# Start all services
docker compose up --build

# Access:
# Frontend: http://localhost:3000
# Backend:  http://localhost:8000
# Database: localhost:5433
```

### Option 2: Manual

**Backend**:
```bash
cd backend
cp .env.example .env   # Edit with your config
npm install
npx prisma generate
npx prisma db push
npm run seed            # Optional: load demo data
npm run dev             # Starts on port 8000
```

**Frontend**:
```bash
cd frontend
cp .env.example .env   # Edit with your config
npm install
npm run dev             # Starts on port 3000
```

### Seeding Demo Data

```bash
cd backend
npm run seed
```

The seed script creates a fictional startup "DevSpark" with:
- 6 user personas (CTO, Senior Dev, PM, Designer, Junior Dev, QA)
- 1 workspace with 5 pages, 2 chat rooms, 3 drawings, 4 file folders, 2 kanban boards
- See `SEED_DATA.md` for full details

---

## Testing

### Backend Tests (54 tests — all passing)

**Framework**: Vitest + Supertest

**Test files** (in `backend/src/__tests__/`):
- `auth.test.ts` — Registration, login, profile
- `chat.test.ts` — Room creation, messages, edit/delete
- `drawing.test.ts` — CRUD operations
- `kanban.test.ts` — Board/column/card management
- `page.test.ts` — Page CRUD
- `workspace.test.ts` — Create, invite, members

**Run**:
```bash
cd backend
npx vitest run          # All tests
npx vitest              # Watch mode
npx vitest --coverage   # With coverage report
```

### Frontend Tests (6 tests — all passing)

**Framework**: Vitest + React Testing Library + jsdom

**Test files** (in `frontend/src/__tests__/components/`):
- `Avatar.test.tsx` — 100% coverage
- `Chat.test.tsx`
- `Sidebar.test.tsx`
- `FileExplorer.test.tsx`
- `DrawingCanvas.test.tsx`
- `KanbanBoard.test.tsx`

**Run**:
```bash
cd frontend
npx vitest run
```

### E2E Tests (16 tests — all passing)

**Framework**: Playwright

**Coverage**:
- Authentication (3 tests)
- Workspace Management (2 tests)
- Collaboration (5 tests)
- Navigation (2 tests)
- Multi-User Stress (4 tests)

**Run**:
```bash
cd frontend
npx playwright test
```

---

## Key Design Decisions

### Why Supabase for file storage instead of local?

Files (avatars, uploads, code files) are stored in Supabase Storage rather than locally on disk. This provides:
- **Persistence across deployments** — files survive container restarts
- **1GB free tier** — sufficient for development and small teams
- **CDN delivery** — faster image loading
- **No local disk management** — simplifies Docker setup

### Why Socket.io instead of Server-Sent Events or WebRTC?

Socket.io provides:
- **Automatic reconnection** — handles network interruptions
- **Room isolation** — users only receive relevant events (page, drawing, chat, kanban)
- **Fallback transports** — works when WebSocket is blocked
- **Mature ecosystem** — well-documented, widely used

### Why fixed-size canvas (900x600)?

The DrawingCanvas uses a fixed logical size of 900x600 pixels rather than dynamically resizing to the container. This:
- **Eliminates resize timing bugs** — no more 0x0 canvas on initial render
- **Simplifies coordinate mapping** — mouse positions are scaled from CSS pixels to canvas pixels
- **Ensures consistent save/load** — drawings always render at the same resolution
- **Prevents canvas clearing on resize** — no more lost work when window is resized

### Why `first_name` / `last_name` instead of `username`?

The registration form was changed from a single `username` field to `firstName` + `lastName` to:
- Support a more natural display name format
- Enable personalized greetings and mentions
- Keep `username` as optional for backwards compatibility

---

## Maintenance

### Automated Cleanup

A cron job runs daily at midnight (`0 0 * * *`) via `src/scripts/cleanup.ts`:

1. **Unverified Users**: Deletes users who registered but never verified their email after 30 days. Also removes their uploaded files from Supabase Storage.

2. **Orphan Workspaces**: Deletes workspaces that have no members and no valid owner. Also removes all associated files from Supabase Storage.

### Manual Admin Tools

The admin panel provides manual cleanup buttons:
- **Clean Unverified Users** — immediate deletion of all unverified users >30 days
- **Clean Orphan Workspaces** — immediate deletion of all orphan workspaces
- **CSV Export** — download reports as CSV

---

## Tech Stack Summary

```
Frontend:     Next.js 15 (App Router) + React 19 + TypeScript + Tailwind CSS 3
Backend:      Node.js + Express 4 + TypeScript + Prisma 5 + Socket.io 4
Database:     PostgreSQL 16 (Supabase)
File Storage: Supabase Storage
Auth:         JWT + bcryptjs
Email:        Nodemailer (SMTP)
Testing:      Vitest + Supertest + React Testing Library + Playwright
Deployment:   Docker Compose / Render
```
