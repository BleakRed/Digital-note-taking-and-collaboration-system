# Notion Clone Project - Database Tables

This document lists all database tables (Prisma models) defined in the project's Prisma schema (`prisma/schema.prisma`), with no tables omitted.

---

## 1. User
Stores user account information and authentication details.

### Fields
| Field Name       | Type      | Attributes                                                                 |
|------------------|-----------|---------------------------------------------------------------------------|
| id               | String    | @id @default(uuid())                                                      |
| email            | String    | @unique                                                                   |
| password         | String    | -                                                                         |
| firstName        | String?   | Optional                                                                  |
| lastName         | String?   | Optional                                                                  |
| name             | String?   | Optional                                                                  |
| username         | String?   | @unique                                                                   |
| avatarUrl        | String?   | Optional                                                                  |
| isVerified       | Boolean   | @default(false)                                                           |
| verificationToken| String?   | Optional                                                                  |
| resetToken       | String?   | Optional                                                                  |
| resetTokenExpiry | DateTime? | Optional                                                                  |
| createdAt        | DateTime  | @default(now())                                                           |
| updatedAt        | DateTime  | @updatedAt                                                                |

### Relations
- `ownedWorkspaces`: Workspace[] (relation: "Owner")
- `memberships`: WorkspaceMember[]
- `createdPages`: Page[]
- `uploadedFiles`: File[]
- `createdDrawings`: Drawing[] (relation: "DrawingAuthor")
- `chatMessages`: ChatMessage[] (relation: "ChatAuthor")
- `kanbanCards`: KanbanCard[] (relation: "Author")
- `assignedCards`: KanbanCard[] (relation: "CardAssignees")

### Mongolian Translations (Баганын нэр)
| Баганын нэр       | ӨС нэр       | Түлхүүр | Төрөл    | Тайлбар |
|---------------------|-----------------|-----------|----------|----------|
| Хэрэглэгчийн ID    | id              | PK        | uuid     | цор ганц код |
| И-мэйл             | email           |           | varchar  | @unique, цаашид давтагдахгүй |
| Нууц үг            | password        |           | varchar  | Нууц үг |
| Нэр (эцэг)         | firstName       |           | varchar  | Сонголтой, эцэг нэр |
| Нэр (овог)         | lastName        |           | varchar  | Сонголтой, овог нэр |
| Нэр                 | name            |           | varchar  | Сонголтой, хэрэглэгчийн нэр |
| Хэрэглэгчийн нэр   | username        |           | varchar  | Сонголтой, @unique, цаашид давтагдахгүй |
| Аватар холбоос      | avatarUrl       |           | varchar  | Сонголтой, аватар зурагны холбоос |
| Баталгаажсан эсэх  | isVerified      |           | boolean  | @default(false), анхдагч утга: худал |
| Баталгаажуулах токен | verificationToken |           | varchar  | Сонголтой, баталгаажуулах токен |
| Нууц үг сэргэх токен | resetToken   |           | varchar  | Сонголтой, нууц үг сэргэх токен |
| Токен дуусах хугацаа | resetTokenExpiry |           | datetime | Сонголтой, токен дуусах огноо |
| Үүсгэсэн огноо      | createdAt       |           | datetime | @default(now()), анхдагч утга: одоогийн огноо |
| Шинэчилсэн огноо    | updatedAt       |           | datetime | @updatedAt, шинэчлэгдсэн огноо |

---

## 2. Workspace
Stores workspace information, owned by a user.

### Fields
| Field Name | Type      | Attributes                                                                 |
|------------|-----------|---------------------------------------------------------------------------|
| id         | String    | @id @default(uuid())                                                      |
| name       | String    | -                                                                         |
| ownerId    | String    | -                                                                         |
| createdAt  | DateTime  | @default(now())                                                           |
| updatedAt  | DateTime  | @updatedAt                                                                |

### Relations
- `owner`: User (relation: "Owner", fields: [ownerId], references: [id])
- `members`: WorkspaceMember[]
- `pages`: Page[]
- `files`: File[]
- `folders`: Folder[]
- `drawings`: Drawing[]
- `chatRooms`: ChatRoom[]
- `kanbanBoards`: KanbanBoard[]

### Foreign Keys
- `ownerId` references `User.id`

### Mongolian Translations (Баганын нэр)
| Баганын нэр   | ӨС нэр   | Түлхүүр | Төрөл    | Тайлбар |
|-----------------|------------|-----------|----------|----------|
| Ажлын талбарын ID | id         | PK        | uuid     | цор ганц код |
| Нэр              | name       |           | varchar  | Ажлын талбарын нэр |
| Эзэмшигчийн ID | ownerId    | FK        | uuid     | харьяалагдах хэрэглэгч |
| Үүсгэсэн огноо    | createdAt  |           | datetime | @default(now()), анхдагч утга: одоогийн огноо |
| Шинэчилсэн огноо  | updatedAt  |           | datetime | @updatedAt, шинэчлэгдсэн огноо |

---

## 3. WorkspaceMember
Links users to workspaces with assigned roles.

### Fields
| Field Name   | Type      | Attributes                                                                 |
|--------------|-----------|---------------------------------------------------------------------------|
| id           | String    | @id @default(uuid())                                                      |
| workspaceId  | String    | -                                                                         |
| userId       | String    | -                                                                         |
| role         | String    | @default("MEMBER") (valid values: OWNER, ADMIN, MEMBER)                   |
| joinedAt     | DateTime  | @default(now())                                                           |

### Unique Constraints
- `@@unique([workspaceId, userId])`

### Relations
- `workspace`: Workspace (fields: [workspaceId], references: [id], onDelete: Cascade)
- `user`: User (fields: [userId], references: [id], onDelete: Cascade)

### Foreign Keys
- `workspaceId` references `Workspace.id`
- `userId` references `User.id`

### Mongolian Translations (Баганын нэр)
| Баганын нэр   | ӨС нэр   | Түлхүүр | Төрөл    | Тайлбар |
|--------------|------------|-----------|----------|----------|
| Гишүүний ID    | id           | PK        | uuid     | цор ганц код |
| Талбарын ID    | workspaceId  | FK        | uuid     | харьяалагдах ажлын талбар |
| Хэрэглэгчийн ID | userId       | FK        | uuid     | харьяалагдах хэрэглэгч |
| Эрх             | role         |           | varchar  | @default("MEMBER"), утгууд: OWNER, ADMIN, MEMBER |
| Элсэн огноо     | joinedAt     |           | datetime | @default(now()), анхдагч утга: одоогийн огноо |

---

## 4. Page
Stores Notion-like pages with nested hierarchy support.

### Fields
| Field Name   | Type      | Attributes                                                                 |
|--------------|-----------|---------------------------------------------------------------------------|
| id           | String    | @id @default(uuid())                                                      |
| title        | String    | -                                                                         |
| content      | String    | @default("")                                                              |
| workspaceId  | String    | -                                                                         |
| authorId     | String    | -                                                                         |
| parentId     | String?   | For nesting (references Page.id)                                            |
| createdAt    | DateTime  | @default(now())                                                           |
| updatedAt    | DateTime  | @updatedAt                                                                |

### Relations
- `workspace`: Workspace (fields: [workspaceId], references: [id], onDelete: Cascade)
- `author`: User (fields: [authorId], references: [id], onDelete: Cascade)
- `parent`: Page? (relation: "PageHierarchy", fields: [parentId], references: [id], onDelete: Cascade)
- `children`: Page[] (relation: "PageHierarchy")

### Foreign Keys
- `workspaceId` references `Workspace.id`
- `authorId` references `User.id`
- `parentId` references `Page.id`

### Mongolian Translations (Баганын нэр)
| Баганын нэр   | ӨС нэр   | Түлхүүр | Төрөл    | Тайлбар |
|--------------|------------|-----------|----------|----------|
| Хуудасны ID    | id           | PK        | uuid     | цор ганц код |
| Гарчиг          | title        |           | varchar  | хуудасны гарчиг |
| Агуулга         | content      |           | text     | @default(""), хуудасны агуулга |
| Талбарын ID    | workspaceId  | FK        | uuid     | харьяалагдах ажлын талбар |
| Зохиогчийн ID  | authorId     | FK        | uuid     | харьяалагдах хэрэглэгч |
| Эх хуудасны ID | parentId     | FK        | uuid     | шаталсан бүтэц (Page.id) |
| Үүсгэсэн огноо  | createdAt    |           | datetime | @default(now()), анхдагч утга: одоогийн огноо |
| Шинэчилсэн огноо | updatedAt    |           | datetime | @updatedAt, шинэчлэгдсэн огноо |

---

## 5. Folder
Stores file folders with nested hierarchy support.

### Fields
| Field Name   | Type      | Attributes                                                                 |
|--------------|-----------|---------------------------------------------------------------------------|
| id           | String    | @id @default(uuid())                                                      |
| name         | String    | -                                                                         |
| workspaceId  | String    | -                                                                         |
| parentId     | String?   | For nesting (references Folder.id)                                         |
| createdAt    | DateTime  | @default(now())                                                           |
| updatedAt    | DateTime  | @updatedAt                                                                |

### Relations
- `workspace`: Workspace (fields: [workspaceId], references: [id], onDelete: Cascade)
- `parent`: Folder? (relation: "FolderHierarchy", fields: [parentId], references: [id], onDelete: Cascade)
- `children`: Folder[] (relation: "FolderHierarchy")
- `files`: File[]

### Foreign Keys
- `workspaceId` references `Workspace.id`
- `parentId` references `Folder.id`

### Mongolian Translations (Баганын нэр)
| Баганын нэр       | ӨС нэр       | Түлхүүр | Төрөл    | Тайлбар |
|---------------------|-----------------|-----------|----------|----------|
| Хавтасны ID              | id                | PK        | uuid     | цор ганц код |
| Хавтасны нэр              | name              |           | varchar  | Хавтасны нэр |
| Талбарын ID               | workspaceId       | FK        | uuid     | харьяалагдах ажлын талбар |
| Эх хавтасны ID            | parentId          | FK        | uuid     | шаталсан бүтэц (Folder.id) |

---

## 6. File
Stores file metadata, linked to folders and workspaces.

### Fields
| Field Name   | Type      | Attributes                                                                 |
|--------------|-----------|---------------------------------------------------------------------------|
| id           | String    | @id @default(uuid())                                                      |
| name         | String    | -                                                                         |
| url          | String    | -                                                                         |
| size         | Int       | -                                                                         |
| type         | String    | -                                                                         |
| description  | String?   | Optional (GitHub-like feel)                                                |
| workspaceId  | String    | -                                                                         |
| uploaderId   | String    | -                                                                         |
| folderId     | String?   | Linked to Folder                                                          |
| createdAt    | DateTime  | @default(now())                                                           |

### Relations
- `workspace`: Workspace (fields: [workspaceId], references: [id], onDelete: Cascade)
- `uploader`: User (fields: [uploaderId], references: [id], onDelete: Cascade)
- `folder`: Folder? (fields: [folderId], references: [id], onDelete: Cascade)

### Foreign Keys
- `workspaceId` references `Workspace.id`
- `uploaderId` references `User.id`
- `folderId` references `Folder.id`

### Mongolian Translations (Баганын нэр)
| Баганын нэр   | ӨС нэр   | Түлхүүр | Төрөл    | Тайлбар |
|--------------|------------|-----------|----------|----------|
| Файлын ID    | id           | PK        | uuid     | цор ганц код |
| Нэр           | name         |           | varchar  | Файлын нэр |
| Холбоос       | url          |           | varchar  | Файлын холбоос |
| Хэмжээ        | size         |           | int      | файлын хэмжээ |
| Төрөл         | type         |           | varchar  | файлын төрөл |
| Тайлбар       | description  |           | varchar  | Сонголтой, GitHub шиг мэдээлэл |
| Талбарын ID    | workspaceId  | FK        | uuid     | харьяалагдах ажлын талбар |
| Оруулагчийн ID | uploaderId   | FK        | uuid     | харьяалагдах хэрэглэгч |
| Хавтасны ID    | folderId     | FK        | uuid     | харьяалагдах хавтас |
| Үүсгэсэн огноо  | createdAt    |           | datetime | @default(now()), анхдагч утга: одоогийн огноо |

---

## 7. Drawing
Stores whiteboard/drawing data as JSON.

### Fields
| Field Name   | Type      | Attributes                                                                 |
|--------------|-----------|---------------------------------------------------------------------------|
| id           | String    | @id @default(uuid())                                                      |
| title        | String    | @default("Untitled Drawing")                                               |
| data         | String    | JSON string of drawing paths/actions                                       |
| workspaceId  | String    | -                                                                         |
| authorId     | String    | -                                                                         |
| createdAt    | DateTime  | @default(now())                                                           |
| updatedAt    | DateTime  | @updatedAt                                                                |

### Relations
- `workspace`: Workspace (fields: [workspaceId], references: [id], onDelete: Cascade)
- `author`: User (relation: "DrawingAuthor", fields: [authorId], references: [id], onDelete: Cascade)

### Foreign Keys
- `workspaceId` references `Workspace.id`
- `authorId` references `User.id`

### Mongolian Translations (Баганын нэр)
| Баганын нэр   | ӨС нэр   | Түлхүүр | Төрөл    | Тайлбар |
|----------------|------------|-----------|----------|----------|
| Зурагны ID    | id           | PK        | uuid     | цор ганц код |
| Гарчиг        | title        |           | varchar  | @default("Untitled Drawing"), зурагны гарчиг |
| Өгөгдөл       | data         |           | text     | JSON, зургийн зам/үйлдлийн мэдээлэл |
| Талбарын ID    | workspaceId  | FK        | uuid     | харьяалагдах ажлын талбар |
| Зохиогчийн ID  | authorId     | FK        | uuid     | харьяалагдах хэрэглэгч |
| Үүсгэсэн огноо  | createdAt    |           | datetime | @default(now()), анхдагч утга: одоогийн огноо |
| Шинэчилсэн огноо | updatedAt    |           | datetime | @updatedAt, шинэчлэгдсэн огноо |

---

## 8. ChatRoom
Stores chat rooms within workspaces.

### Fields
| Field Name   | Type      | Attributes                                                                 |
|--------------|-----------|---------------------------------------------------------------------------|
| id           | String    | @id @default(uuid())                                                      |
| name         | String    | -                                                                         |
| workspaceId  | String    | -                                                                         |
| createdAt    | DateTime  | @default(now())                                                           |

### Relations
- `workspace`: Workspace (fields: [workspaceId], references: [id], onDelete: Cascade)
- `messages`: ChatMessage[]

### Foreign Keys
- `workspaceId` references `Workspace.id`

### Mongolian Translations (Баганын нэр)
| Баганын нэр   | ӨС нэр   | Түлхүүр | Төрөл    | Тайлбар |
|----------------|------------|-----------|----------|----------|
| Чат өрөөний ID | id           | PK        | uuid     | цор ганц код |
| Нэр             | name         |           | varchar  | Чат өрөөний нэр |
| Талбарын ID    | workspaceId  | FK        | uuid     | харьяалагдах ажлын талбар |
| Үүсгэсэн огноо  | createdAt    |           | datetime | @default(now()), анхдагч утга: одоогийн огноо |

---

## 9. ChatMessage
Stores individual chat messages within chat rooms.

### Fields
| Field Name   | Type      | Attributes                                                                 |
|--------------|-----------|---------------------------------------------------------------------------|
| id           | String    | @id @default(uuid())                                                      |
| content      | String    | -                                                                         |
| chatRoomId   | String    | -                                                                         |
| authorId     | String    | -                                                                         |
| createdAt    | DateTime  | @default(now())                                                           |
| updatedAt    | DateTime  | @updatedAt                                                                |

### Relations
- `chatRoom`: ChatRoom (fields: [chatRoomId], references: [id], onDelete: Cascade)
- `author`: User (relation: "ChatAuthor", fields: [authorId], references: [id], onDelete: Cascade)

### Foreign Keys
- `chatRoomId` references `ChatRoom.id`
- `authorId` references `User.id`

### Mongolian Translations (Баганын нэр)
| Баганын нэр   | ӨС нэр   | Түлхүүр | Төрөл    | Тайлбар |
|--------------|------------|-----------|----------|----------|
| Мессежний ID    | id           | PK        | uuid     | цор ганц код |
| Агуулга         | content      |           | text     | Чат мессежний агуулга |
| Чат өрөөний ID  | chatRoomId   | FK        | uuid     | харьяалагдах чат өрөө |
| Зохиогчийн ID  | authorId     | FK        | uuid     | харьяалагдах хэрэглэгч |
| Үүсгэсэн огноо  | createdAt    |           | datetime | @default(now()), анхдагч утга: одоогийн огноо |
| Шинэчилсэн огноо | updatedAt    |           | datetime | @updatedAt, шинэчлэгдсэн огноо |

---

## 10. KanbanBoard
Stores Kanban boards within workspaces.

### Fields
| Field Name   | Type      | Attributes                                                                 |
|--------------|-----------|---------------------------------------------------------------------------|
| id           | String    | @id @default(uuid())                                                      |
| title        | String    | -                                                                         |
| workspaceId  | String    | -                                                                         |
| createdAt    | DateTime  | @default(now())                                                           |
| updatedAt    | DateTime  | @updatedAt                                                                |

### Relations
- `workspace`: Workspace (fields: [workspaceId], references: [id], onDelete: Cascade)
- `columns`: KanbanColumn[]

### Foreign Keys
- `workspaceId` references `Workspace.id`

### Mongolian Translations (Баганын нэр)
| Баганын нэр       | ӨС нэр       | Түлхүүр | Төрөл    | Тайлбар |
|---------------------|-----------------|-----------|----------|----------|
| Канбан самбарын ID | id              | PK        | uuid     | цор ганц код |
| Гарчиг              | title           |           | varchar  | Канбан самбарын гарчиг |
| Талбарын ID        | workspaceId     | FK        | uuid     | харьяалагдах ажлын талбар |
| Үүсгэсэн огноо      | createdAt       |           | datetime | @default(now()), анхдагч утга: одоогийн огноо |
| Шинэчилсэн огноо    | updatedAt       |           | datetime | @updatedAt, шинэчлэгдсэн огноо |

---

## 11. KanbanColumn
Stores columns within Kanban boards.

### Fields
| Field Name   | Type      | Attributes                                                                 |
|--------------|-----------|---------------------------------------------------------------------------|
| id        | String    | @id @default(uuid())                                                      |
| title     | String    | -                                                                         |
| color     | String?   | @default("#3b82f6")                                                       |
| boardId   | String    | -                                                                         |
| order     | Int       | @default(0)                                                               |
| createdAt | DateTime  | @default(now())                                                           |
| updatedAt | DateTime  | @updatedAt                                                                |

### Relations
- `board`: KanbanBoard (fields: [boardId], references: [id], onDelete: Cascade)
- `cards`: KanbanCard[]

### Foreign Keys
- `boardId` references `KanbanBoard.id`

### Mongolian Translations (Баганын нэр)
| Баганын нэр   | ӨС нэр   | Түлхүүр | Төрөл    | Тайлбар |
|--------------|------------|-----------|----------|----------|
| Баганы ID    | id        | PK        | uuid     | цор ганц код |
| Гарчиг        | title     |           | varchar  | Канбан баганы гарчиг |
| Өнгө          | color     |           | varchar  | @default("#3b82f6"), баганы өнгө |
| Самбарын ID    | boardId   | FK        | uuid     | харьяалагдах канбан самбар |
| Дараалал       | order     |           | int      | @default(0), баганы дараалал |
| Үүсгэсэн огноо  | createdAt |           | datetime | @default(now()), анхдагч утга: одоогийн огноо |
| Шинэчилсэн огноо | updatedAt |           | datetime | @updatedAt, шинэчлэгдсэн огноо |

---

## 12. KanbanCard
Stores cards within Kanban columns, with authors and assignees.

### Fields
| Field Name   | Type      | Attributes                                                                 |
|--------------|-----------|---------------------------------------------------------------------------|
| id          | String    | @id @default(uuid())                                                      |
| content     | String    | -                                                                         |
| description  | String?   | Optional                                                                  |
| columnId    | String    | -                                                                         |
| authorId    | String    | -                                                                         |
| order       | Int       | @default(0)                                                               |
| createdAt   | DateTime  | @default(now())                                                           |
| updatedAt   | DateTime  | @updatedAt                                                                |

### Relations
- `column`: KanbanColumn (fields: [columnId], references: [id], onDelete: Cascade)
- `author`: User (relation: "Author", fields: [authorId], references: [id], onDelete: Cascade)
- `assignees`: User[] (relation: "CardAssignees")

### Foreign Keys
- `columnId` references `KanbanColumn.id`
- `authorId` references `User.id`

### Mongolian Translations (Баганын нэр)
| Баганын нэр   | ӨС нэр   | Түлхүүр | Төрөл    | Тайлбар |
|--------------|------------|-----------|----------|----------|
| Картын ID    | id          | PK        | uuid     | цор ганц код |
| Агуулга       | content     |           | text     | Канбан картын агуулга |
| Тайлбар       | description  |           | varchar  | Сонголтой, картын тайлбар |
| Баганы ID    | columnId    | FK        | uuid     | харьяалагдах канбан багана |
| Зохиогчийн ID  | authorId    | FK        | uuid     | харьяалагдах хэрэглэгч |
| Дараалал       | order       |           | int      | @default(0), картын дараалал |
| Үүсгэсэн огноо  | createdAt   |           | datetime | @default(now()), анхдагч утга: одоогийн огноо |
| Шинэчилсэн огноо | updatedAt   |           | datetime | @updatedAt, шинэчлэгдсэн огноо |

---

## 13. Report
Stores user reports/feedback.

### Fields
| Field Name   | Type      | Attributes                                                                 |
|--------------|-----------|---------------------------------------------------------------------------|
| id           | String    | @id @default(uuid())                                                      |
| title        | String    | -                                                                         |
| description  | String    | -                                                                         |
| status       | String    | @default("OPEN") (valid values: OPEN, RESOLVED)                           |
| reporterId   | String    | -                                                                         |
| createdAt    | DateTime  | @default(now())                                                           |
| updatedAt    | DateTime  | @updatedAt                                                                |

### Notes
- `reporterId` references `User.id` but no formal Prisma relation is defined.

### Mongolian Translations (Баганын нэр)
| Баганын нэр   | ӨС нэр   | Түлхүүр | Төрөл    | Тайлбар |
|--------------|------------|-----------|----------|----------|
| Тайлангийн ID | id           | PK        | uuid     | цор ганц код |
| Гарчиг        | title        |           | varchar  | Тайлангийн гарчиг |
| Тайлбар       | description  |           | text     | Тайлангийн тайлбар |
| Төлөв          | status       |           | varchar  | @default("OPEN"), утгууд: OPEN (Нээлт), RESOLVED (Шийдвэрлэгдсэн) |
| Мэдээлэгчийн ID | reporterId   | FK        | uuid     | харьяалагдах хэрэглэгч |
| Үүсгэсэн огноо  | createdAt    |           | datetime | @default(now()), анхдагч утга: одоогийн огноо |
| Шинэчилсэн огноо | updatedAt    |           | datetime | @updatedAt, шинэчлэгдсэн огноо |

---

*Total tables: 13 (all models from schema included)*
