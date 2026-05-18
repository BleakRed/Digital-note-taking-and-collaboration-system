# Database Migration History

All schema changes applied to the PostgreSQL database throughout development.
Migrations use `prisma db push` (no formal migration files — schema-as-source-of-truth).

---

## Migration 001 — Initial Schema

**Date:** March 2026
**Models:** User, Workspace, WorkspaceMember, Page

### User
- `id` UUID primary key
- `email` unique, required
- `password` hashed string
- `username` optional, unique
- `name` optional display name
- `avatarUrl` optional
- `createdAt`, `updatedAt` timestamps

### Workspace
- `id` UUID primary key
- `name` string
- `ownerId` FK → User
- Basic team container with owner

### WorkspaceMember
- Join table: User ↔ Workspace
- `role` string: OWNER | ADMIN | MEMBER
- Unique constraint on (workspaceId, userId)
- Cascade deletes from both sides

### Page
- `id` UUID primary key
- `title`, `content` (markdown)
- `workspaceId` FK → Workspace
- `authorId` FK → User
- `parentId` self-referencing FK for page nesting
- Cascade deletes from Workspace and User

---

## Migration 002 — Chat & Kanban

**Date:** March 26, 2026
**Commit:** `32f94dbf`
**Models added:** ChatRoom, ChatMessage, KanbanBoard, KanbanColumn, KanbanCard

### ChatRoom
- `id` UUID primary key
- `name` string
- `workspaceId` FK → Workspace

### ChatMessage
- `id` UUID primary key
- `content` text
- `chatRoomId` FK → ChatRoom
- `authorId` FK → User
- `updatedAt` for "(edited)" detection

### KanbanBoard
- `id` UUID primary key
- `title` string
- `workspaceId` FK → Workspace

### KanbanColumn
- `id` UUID primary key
- `title`, `color` (default #3b82f6)
- `boardId` FK → KanbanBoard
- `order` integer for column reordering

### KanbanCard
- `id` UUID primary key
- `content`, `description`
- `columnId` FK → KanbanColumn
- `authorId` FK → User
- `order` integer
- Implicit many-to-many with User via `assignees`

---

## Migration 003 — Email Verification & Cleanup

**Date:** March 29, 2026
**Commit:** `acc8dc3a`
**Changes:** User model additions

### User — added fields
- `isVerified` boolean, default false
- `verificationToken` string
- `resetToken` string
- `resetTokenExpiry` datetime

Enables email verification flow and password reset.
Cleanup cron job depends on `createdAt` to delete unverified accounts > 30 days.

---

## Migration 004 — Supabase Storage & File Management

**Date:** April 14, 2026
**Commit:** `ae507454`
**Models added:** Folder, File

### Folder
- `id` UUID primary key
- `name`, `workspaceId`
- `parentId` self-referencing FK for nested folders
- Cascade deletes from Workspace

### File
- `id` UUID primary key
- `name`, `url` (Supabase Storage URL), `size` (bytes), `type` (MIME)
- `description` optional (commit-style)
- `workspaceId` FK → Workspace
- `uploaderId` FK → User
- `folderId` FK → Folder
- Cascade deletes from all relations

**Migration details:**
- Local file storage replaced with Supabase Storage
- `multer` uploads → Supabase `upload()` API
- File URLs now point to `https://vrtuiyslioecqwdfcttk.supabase.co/storage/v1/object/public/notion-clone-files/`
- Existing local uploads not migrated (schema-only change)

---

## Migration 005 — Drawing Persistence

**Date:** Between March–April 2026
**Commit:** (incremental, no dedicated commit)
**Model added:** Drawing

### Drawing
- `id` UUID primary key
- `title` string, default "Untitled Drawing"
- `data` string (Base64 data URL or JSON stroke array)
- `workspaceId` FK → Workspace
- `authorId` FK → User
- Cascade deletes from Workspace and User

**Data format evolution:**
- Initially stored as Base64 PNG data URLs only
- Later extended to support JSON stroke format for smaller payloads

---

## Migration 006 — Reports & Admin

**Date:** May 10, 2026
**Commit:** `66848850`
**Model added:** Report

### Report
- `id` UUID primary key
- `title`, `description`
- `status` string: OPEN | RESOLVED (default OPEN)
- `reporterId` string (references User, no formal FK)
- Standard timestamps

### User — renamed fields
- `username` → kept but deprecated in forms
- Added `firstName`, `lastName` optional
- `name` kept as computed `firstName + lastName`

**Why:**
Frontend registration changed from single username field to first/last name.
Username kept for backwards compatibility with existing members and avatars.

---

## Migration 007 — Admin Panel & Cleanup Routes

**Date:** May 10, 2026
**Commit:** `66848850`
**Changes:** No schema changes — new API routes only

### New endpoints (no schema impact):
- `DELETE /api/admin/users/unverified` — bulk delete unverified users
- `DELETE /api/admin/workspaces/orphan` — bulk delete orphan workspaces

### Seed script:
- `prisma/seed.ts` with `ts-node --project tsconfig-seed.json`
- Creates "DevSpark" demo dataset (6 users, 1 workspace, sample data)

---

## Schema Summary

| # | Model | Migrated In | FKs | Notes |
|---|---|---|---|---|
| 1 | User | 001, 003, 006 | — | Central entity |
| 2 | Workspace | 001 | User | |
| 3 | WorkspaceMember | 001 | Workspace, User | Unique pair |
| 4 | Page | 001 | Workspace, User, Page(self) | Nested |
| 5 | Folder | 004 | Workspace, Folder(self) | Nested |
| 6 | File | 004 | Workspace, User, Folder | Supabase-backed |
| 7 | Drawing | 005 | Workspace, User | JSON/Base64 |
| 8 | ChatRoom | 002 | Workspace | |
| 9 | ChatMessage | 002 | ChatRoom, User | |
| 10 | KanbanBoard | 002 | Workspace | |
| 11 | KanbanColumn | 002 | KanbanBoard | Ordered |
| 12 | KanbanCard | 002 | KanbanColumn, User | Assignees M:N |
| 13 | Report | 006 | User (implicit) | No formal FK |

---

## Migration Strategy

All migrations use `prisma db push --accept-data-loss` because:

1. **Development-only project** — no production data to preserve
2. **Schema-as-source-of-truth** — Prisma schema file is the single source, not migration files
3. **Rapid iteration** — adding/removing fields during active development without migration file overhead
4. **Render deployment** — Docker CMD runs `prisma db push` on container start

For production, the recommended approach would be `prisma migrate dev` with proper migration files and rollback planning.
