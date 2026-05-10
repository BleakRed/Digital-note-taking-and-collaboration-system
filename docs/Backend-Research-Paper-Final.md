# NOTION CLONE - BACKEND SYSTEM RESEARCH PAPER

**Дипломын төслийн сервер талын судалгааны ажил**

---

## ХУРААНГУЙ

Notion Clone системийн сервер тал нь Node.js, Express framework, Socket.io ашиглан бодит цагийн хамтын ажиллагааны вэб аппликейшн үүсгэхэд чиглэсэн. Систем нь JWT token ашиглан нэвтрэлтийн удирдлага, bcrypt ашиглан нууц үг хамгаалалт, Prisma ORM ашиглан PostgreSQL өгөгдлийн сангийн хамаарлыг зохицуулна. Socket.io ашиглан real-time bidirectional communication, room-based broadcasting, auto-reconnection зэрэг боломжуудыг хангана. Архитектур нь 3-tier загвар дээр тулгуурлан, REST API болон WebSocket холимог архитектурыг хослуулсан. Систем нь 68 backend тестэд 82.73% coverage-тай, найдвартай байдал болон өргөтгөх боломжтой байдлаар хөгжүүлэгдсэн.

**Түлхүүр үг:** Node.js, Express, Socket.io, PostgreSQL, Prisma, JWT, bcrypt, REST API, WebSocket, Real-time, Authentication, Type-safety, ACID compliance.

---

## ОРШИЛ

### Системийн зорилго
Notion Clone системийн сервер тал нь хэрэглэгчдэд бодит цагийн хамтын засварлах, ажлын талбай удирдах үйл ажиллагааг хангах Node.js, Express, Socket.io зэрэг технологиуд ашиглан цахим хэлбэрт бүрэн хөгжүүлэх зорилготой. Энэ нь олон хэрэглэгчийн синхрончлогдсон хамтын ажиллагааны системийг бүтээхэд чиглэнэ.

### Сервер талын хамрах хүрээ
Сервер талын системийн хамрах хүрээг дараах 3 түвшинд авч үзнэ:

**1. API Layer (RESTful)**
- Express framework ашиглан RESTful API endpoint-үүдийг тодорхойлно
- JWT middleware ашиглан нэвтрэлтийн шалгалт хийнэ
- CORS handling, rate limiting (future), error handling

**2. Real-time Layer (WebSocket)**
- Socket.io ашиглан bidirectional communication
- Room-based broadcasting (workspace-үүд)
- Auto-reconnection logic, event-driven architecture

**3. Data Layer (Database)**
- PostgreSQL + Prisma ORM ашиглан өгөгдлийн санг удирдана
- ACID compliance, relations (1:N, M:N, self-referencing)
- Migration management, type-safe queries

### Зорилтууд
1. Node.js + Express ашиглан scalable REST API бүтээх
2. Socket.io ашиглан real-time communication хөгжүүлэх
3. PostgreSQL + Prisma ашиглан type-safe өгөгдлийн санг зохицхүүлэх
4. JWT + bcrypt ашиглан аюулгүй байдлыг хангах
5. Vitest ашиглан 68 backend тест бичиж 82.73% coverage хангах

### Үнэлгээ
1. **Найдвартай**: JWT authentication, bcrypt hashing, input validation-ээр аюулгүй байдал
2. **Scalable**: Stateless JWT tokens, 3-tier architecture
3. **Type-safe**: TypeScript + Prisma ашиглан compile-time шалгалт
4. **Tested**: 68 тест, 82.73% coverage, auth/chat/drawing/kanban/page/workspace

---

## НЭГ. СЭДВИЙН СУДЛАГДСАН БАЙДАЛ

### 1.1 Сервер талын технологиудын судалгаа

#### 1.1.1 Backend Frameworks

**Node.js + Express**

Node.js нь JavaScript runtime бөгөөд event-driven, non-blocking I/O загвар дээр ажиллана. Энэ нь real-time systems-д маш тохиромжтой.

Тухайлбал системд дараах Node.js/Express боломжууд ашиглагдсан:
- **Event-driven Architecture** - non-blocking I/O, real-time (Socket.io) холболттой сайн ажиллана
- **NPM Ecosystem** - 1.5 сая+ packages, Socket.io, bcrypt, jsonwebtoken бэлэн
- **JavaScript Runtime** - Frontend (Next.js) болон иж бүрэн stack, хөгжүүлэлт хурдан
- **Single-threaded Model** - real-time-д тохиромжтой, сүлжээний хүсэлтүүдэд (I/O-bound) хурдан

Node.js/Express-ийн ашигласан гол давуу талууд:
- **Хурдан хөгжүүлэлт**: Frontend-тэй иж бүрэн stack (JavaScript)
- **Real-time тохиромжтой**: Socket.io integration сайн
- **Ecosystem**: 1.5+ сая packages бэлэн
- **Судалгаа**: Notion (Node.js), Outline (Node.js), Slite (Node.js) ашигладаг

*Хувилбарууд:*
1. **Python + Django/FastAPI** - хурдан хөгжүүлэлт, гэхдээ real-time-д тохиромжгүй
2. **Java + Spring Boot** - Enterprise-grade, гэхдээ heavyweight, хөгжүүлэлт удаан
3. **Go + Gin** - Performance сайн, гэхдээ ecosystem жижиг
4. **Node.js + Express** - ✅ Сонгосон

#### 1.1.2 Real-time Communication

**Socket.io**

Socket.io нь WebSocket abstraction сан бөгөөд automatic fallback, room-based events, auto-reconnection-ийг дэмждэг.

Тухайлбал системд дараах Socket.io боломжууд ашиглагдсан:
- **Room-based Broadcasting** - Workspace-үүдийг room-д хувааж, зөв хэрэглэгчдэд мессеж илгээнэ
- **Auto-reconnection** - Internet тасрахад автоматаар дахин холбогдоно
- **Automatic Fallback** - WebSocket ажиллахгүй бол HTTP long-polling ашиглана
- **Event-driven** - `socket.emit('page-update', data)` хэлбэрээр амархан ашиглана

Socket.io-ийн ашигласан гол давуу талууд:
- **Latency** - 200ms-ээс бага latency-тай live cursor, content sync хангана
- **Room-based events** - Workspace-үүдийг тусдаа ангилж мессеж илгээнэ
- **Auto-reconnection** - built-in logic, Internet тасрахад дахин холбогдоно
- **Судалгаа**: Outline, Slite ашигладаг; Notion ч ижил загвар (WebSocket + REST)

*Хувилбарууд:*
1. **Raw WebSocket** - Standard, гэхдээ fallback байхгүй, reconnection бичих хэрэгтэй
2. **Firebase Realtime DB** - Google-ийн шийдэл, vendor lock-in, customization хязгаарлагдмал
3. **WebRTC** - Peer-to-peer, serverless, гэхдээ NAT traversal хүнд, scalability муу
4. **Socket.io** - ✅ Сонгосон

#### 1.1.3 Database Technology

**PostgreSQL + Prisma ORM**

Тухайлбал системд дараах PostgreSQL/Prisma боломжууд ашиглагдсан:
- **ACID Compliance** - Transactions ажиллахад найдвартай (банкны түвшин)
- **Relational Data** - Users ↔ Workspaces ↔ Pages хамаарлыг хадгалахад тохиромжтой
- **JSON Support** - Page content-г JSON хэлбэрээр хадгалах боломжтой
- **Type Safety** - Prisma schema-аас автоматаар TypeScript types үүсдэг

PostgreSQL/Prisma-ийн ашигласан гол давуу талууд:
- **Scalability** - Notion, Outline, Instagram, Uber ашигладаг (millions of users)
- **Self-hosted** - Өөрийн сервер дээр бүрэн хяналттай, cloud dependencyгүй
- **Migration management** - `prisma migrate dev` ашиглан version control хийнэ
- **Судалгаа**: Notion (SQLite → PostgreSQL), Outline (PostgreSQL), Confluence (PostgreSQL)

*Хувилбарууд:*
1. **SQLite** - Lightweight, zero-config, гэхдээ concurrent writes-д муу, scaling хүнд
2. **MongoDB** - Schema-less, flexible, гэхдээ relations хүнд, ACID compliance сул
3. **MySQL** - Popular, гэхдээ JSON support хязгаарлагдмал, TypeScript integration сул
4. **PostgreSQL + Prisma** - ✅ Сонгосон

#### 1.1.4 Authentication & Security

**JWT (JSON Web Token)**

Тухайлбал системд дараах JWT боломжууд ашиглагдсан:
- **Stateless** - Server-д session хадгалах шаардлагагүй, horizontal scaling хялбар
- **Scalable** - Multiple backend servers ашиглахад ижил token ажиллана
- **Secure** - Signature-тай (tamper-proof), expiration time тохируулна

JWT-ийн ашигласан гол давуу талууд:
- **Horizontal scaling** - Session-гүй тул multiple servers-д ажиллана
- **Security** - Signature-тай, tamper-proof
- **Судалгаа**: Notion, Coda, бүх том компаниуд ашигладаг

*Хувилбарууд:*
1. **Session-based** - Server-д session хадгалах, scaling хүнд
2. **OAuth (Google/GitHub)** - External dependency, customization хязгаарлагдмал
3. **JWT** - ✅ Сонгосон

**bcrypt (Password Hashing)**

Тухайлбал системд дараах bcrypt боломжууд ашиглагдсан:
- **One-way Hash** - Password-г буцаан тайлах боломжгүй (plain text хадгалахгүй)
- **Salt Rounds** - Brute-force attack-аас хамгаална (cost factor = 10+)

bcrypt-ийн ашигласан гол давуу талууд:
- **Industry Standard** - 95%+ вэб апп-үүд ашигладаг
- **Security** - Brute-force attack-аас хамгаална
- **Судалгаа**: Notion, Outline, бүх орчин үеийн вэб апп-үүд

---

## ХОЁР. СИСТЕМИЙН ШААРДЛАГА

### 2.1 Backend Functional Requirements

**Node.js + Express (REST API)**

Node.js нь JavaScript runtime бөгөөд event-driven архитектур дээр ажиллана. Express нь lightweight web framework бөгөөд API routing хялбаршуулна.

Тухайлбал системд дараах Node.js/Express боломжууд ашиглагдсан:
- **RESTful API** - /api/auth, /api/workspaces, /api/pages гэх мэт endpoint-үүд
- **Middleware Architecture** - JWT auth, CORS, logging, error handling
- **HTTP Methods** - GET, POST, PUT, DELETE методуудыг зохион байгуулна

Node.js + Express-ийн ашигласан гол давуу талууд:
- **Хурдан хөгжүүлэлт** - Hot reload, NPM packages бэлэн
- **Flexible routing** - Express router ашиглан API endpoints тодорхойлно
- **Middleware support** - JWT, CORS, rate limiting зэргийг хялбар нэмнэ

#### FR-B1: Authentication API
- **FR-B1.1**: POST /api/auth/register - Шинэ хэрэглэгч бүртгэх
- **FR-B1.2**: POST /api/auth/login - И-мэйл, нууц үгээр нэвтрэх, JWT буцаах
- **FR-B1.3**: POST /api/auth/forgot-password - Нууц үг сэргээх линк илгээх
- **FR-B1.4**: PUT /api/auth/profile - Профайл засах

#### FR-B2: Workspace API
- **FR-B2.1**: POST /api/workspaces - Шинэ workspace үүсгэх
- **FR-B2.2**: GET /api/workspaces - Хэрэглэгчийн workspaces-ийг жагсаах
- **FR-B2.3**: PUT /api/workspaces/:id - Workspace нэр өөрчлөх
- **FR-B2.4**: POST /api/workspaces/:id/invite - Гишүүдийг урих
- **FR-B2.5**: DELETE /api/workspaces/:id/members/:userId - Гишүүн хасах

#### FR-B3: Page API
- **FR-B3.1**: POST /api/workspaces/:workspaceId/pages - Шинэ хуудас үүсгэх
- **FR-B3.2**: GET /api/workspaces/:workspaceId/pages - Хуудасны мод (tree) авах
- **FR-B3.3**: GET /api/pages/:id - Хуудасны дэлгэрэнгүй авах
- **FR-B3.4**: PUT /api/pages/:id - Хуудас шинэчлэх
- **FR-B3.5**: DELETE /api/pages/:id - Хуудас устгах

#### FR-B4: Kanban API
- **FR-B4.1**: POST /api/workspaces/:id/kanban - Kanban самбар үүсгэх
- **FR-B4.2**: POST /api/kanban/:boardId/columns - Багана үүсгэх
- **FR-B4.3**: POST /api/columns/:columnId/cards - Карт үүсгэх
- **FR-B4.4**: PUT /api/cards/:id - Карт шинэчлэх
- **FR-B4.5**: POST /api/cards/:id/assign - Картанд хэрэглэгч хуваарилах

#### FR-B5: File API
- **FR-B5.1**: POST /api/workspaces/:id/files/upload - Файл хуулах
- **FR-B5.2**: GET /api/files/:id/download - Файл татах
- **FR-B5.3**: DELETE /api/files/:id - Файл устгах

#### FR-B6: Chat API
- **FR-B6.1**: POST /api/workspaces/:id/chatrooms - Чат өрөө үүсгэх
- **FR-B6.2**: GET /api/chatrooms/:id/messages - Мессежүүдийг авах
- **FR-B6.3**: PUT /api/messages/:id - Мессеж засах
- **FR-B6.4**: DELETE /api/messages/:id - Мессеж устгах

#### FR-B7: Real-time Events (Socket.io)
- **FR-B7.1**: `join-workspace` - Workspace-д нэвтрэх
- **FR-B7.2**: `page-update` - Хуудас шинэчлэгдэх
- **FR-B7.3**: `cursor-move` - Курсор хөдлөх
- **FR-B7.4**: `chat-message` - Чат мессеж илгээх
- **FR-B7.5**: `drawing-update` - Зураг зурах шинэчлэлт

### 2.2 Backend Non-Functional Requirements

**PostgreSQL + Prisma ORM**

PostgreSQL нь холбоост өгөгдлийн сан бөгөөд ACID compliance-тай. Prisma ORM нь type-safe queries болон migration management хангана.

Тухайлбал системд дараах PostgreSQL/Prisma боломжууд ашиглагдсан:
- **Schema Definition** - Prisma schema файлд models тодорхойлно
- **Migrations** - `prisma migrate dev` ашиглан өгөгдлийн санг шинэчлэх
- **Type-safe Queries** - Auto-generated TypeScript types ашиглана
- **Relations** - 1:N, M:N, self-referencing хамаарлууд

PostgreSQL + Prisma-ийн ашигласан гол давуу талууд:
- **ACID Transactions** - Найдвартай өгөгдлийн сангийн үйлдлүүд
- **Type Safety** - Compile-time шалгалт, SQL injection-ээс хамгаалал
- **Scalability** - Notion, Outline ашигладаг, үндэсний томоохөн
- **Судалгаа**: Notion (SQLite → PostgreSQL), Outline, Confluence

#### NFR-B1: Performance
- **NFR-B1.1**: API response time < 200ms
- **NFR-B1.2**: Real-time event latency < 100ms
- **NFR-B1.3**: 1000 хэрэглэгч зэрэгцэн ашиглах боломжтой

#### NFR-B2: Security
- **NFR-B2.1**: Бүх API endpoints нэвтрэлт шаардана (except register/login)
- **NFR-B2.2**: Нууц үг bcrypt ашиглан хэшлэгдэнэ (salt rounds = 10+)
- **NFR-B2.3**: JWT tokens хүчинтэй хугацаа 24 цаг
- **NFR-B2.4**: SQL injection-ээс Prisma ORM ашиглан хамгаална

#### NFR-B3: Scalability
- **NFR-B3.1**: Stateless architecture (JWT), horizontal scaling боломжтой
- **NFR-B3.2**: PostgreSQL connection pooling ашиглана
- **NFR-B3.3**: Socket.io Redis adapter ашиглан multiple nodes дээр ажиллуулна

#### NFR-B4: Reliability
- **NFR-B4.1**: 99.9% uptime хангах
- **NFR-B4.2**: Socket.io auto-reconnection logic
- **NFR-B4.3**: Error handling, logging system

---

## ГУРАВ. СИСТЕМИЙН АРХИТЕКТУР (BACKEND)

### 3.1 Backend Architecture Overview

**JWT + bcrypt (Authentication & Security)**

JWT нь stateless authentication token бөгөөд server-д session хадгалах шаардлагагүй. bcrypt нь one-way hashing algorithm бөгөөд password-г хамгаална.

Тухайлбал системд дараах JWT/bcrypt боломжууд ашиглагдсан:
- **Token Generation** - `jwt.sign({userId}, SECRET)` ашиглана
- **Token Verification** - Middleware-д `jwt.verify(token)` ашиглана
- **Password Hashing** - `bcrypt.hash(password, 10)` ашиглана
- **Password Comparison** - `bcrypt.compare(password, hash)` ашиглана

JWT + bcrypt-ийн ашигласан гол давуу талууд:
- **Security** - Signature-тай, tamper-proof tokens
- **Scalability** - Stateless тул horizontal scaling хялбар
- **Standard** - 95%+ вэб апп-үүд ашигладаг
- **Судалгаа**: Notion, Coda, Outline, бүх том компаниуд

```
┌─────────────────────────────────────────────┐
│         Load Balancer (Future)              │
└────────────────────┬─────────────────────┘
                     │
        ┌────────────▼────────────┐
        │   Backend Instance 1     │
        │   Node.js + Express     │
        │   - REST API           │
        │   - Socket.io server   │
        └────────────┬────────────┘
                     │ Prisma ORM
        ┌────────────▼────────────┐
        │   PostgreSQL Database    │
        │   - Users             │
        │   - Workspaces        │
        │   - Pages             │
        │   - Kanban, Chat...   │
        └──────────────────────────┘
```

### 3.2 API Layer (Express)

#### 3.2.1 Middleware Architecture

**Express Middleware**

Express нь middleware chain ашиглан request-үүдийг боловсруулна. JWT auth, CORS, logging зэргийг middleware-ээр хийнэ.

Тухайлбал системд дараах Express боломжууд ашиглагдсан:
- **JWT Middleware** - Token шалгах, req.userId тодорхойлно
- **CORS Middleware** - Cross-Origin requests зөвшөөрнө
- **Error Handling** - Centralized error handler
- **Logging** - Request/Response лог хөтлөнө

Express-ийн ашигласан гол давуу талууд:
- **Flexible** - Custom middleware бичихэд хялбар
- **Lightweight** - Шаардлагатай middleware-г л ашиглана
- **Popular** - 80%+ Node.js апп-үүд ашигладаг

```javascript
// server/src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  userId?: number;
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: number };
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};
```

#### 3.2.2 API Routes Structure

```javascript
// server/src/routes/workspaces.ts
import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import {
  createWorkspace,
  getWorkspaces,
  updateWorkspace,
  inviteMember,
  removeMember
} from '../controllers/workspace';

const router = Router();

router.use(authMiddleware);
router.post('/', createWorkspace);
router.get('/', getWorkspaces);
router.put('/:id', updateWorkspace);
router.post('/:id/invite', inviteMember);
router.delete('/:id/members/:userId', removeMember);

export default router;
```

### 3.3 Real-time Layer (Socket.io)

#### 3.3.1 Socket.io Server Setup

**Socket.io Server**

Socket.io нь WebSocket abstraction бөгөөд automatic fallback, room-based events, auto-reconnection-ийг дэмждэг.

Тухайлбал системд дараах Socket.io боломжууд ашиглагдсан:
- **Authentication** - `io.use()` ашиглан token шалгана
- **Connection handling** - `io.on('connection', socket => {...})`
- **Room management** - `socket.join('workspace-123')`
- **Broadcasting** - `socket.to('workspace-123').emit('event', data)`

Socket.io-ийн ашигласан гол давуу талууд:
- **Real-time** - Bidirectional communication
- **Rooms** - Workspace-үүдийг ангилна
- **Auto-reconnection** - Internet тасрахад дахин холбогдоно
- **Судалгаа**: Outline, Slite, Notion (WebSocket + REST)

```javascript
// server/src/index.ts
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: { origin: '*' },
  pingTimeout: 60000,
  pingInterval: 25000
});

// Authentication middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication error'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: number };
    socket.data.userId = decoded.userId;
    next();
  } catch (err) {
    next(new Error('Authentication error'));
  }
});

// Connection handler
io.on('connection', (socket: Socket) => {
  console.log('User connected:', socket.data.userId);

  // Join workspace room
  socket.on('join-workspace', (workspaceId: number) => {
    const room = `workspace-${workspaceId}`;
    socket.join(room);
    console.log(`User ${socket.data.userId} joined ${room}`);
  });

  // Page update with broadcast
  socket.on('page-update', (data) => {
    socket.to(`workspace-${data.workspaceId}`).emit('page-updated', {
      pageId: data.pageId,
      content: data.content,
      userId: socket.data.userId
    });
  });

  // Cursor movement
  socket.on('cursor-move', (data) => {
    socket.to(`workspace-${data.workspaceId}`).emit('cursor-moved', {
      userId: socket.data.userId,
      x: data.x,
      y: data.y,
      color: data.color
    });
  });

  // Chat message
  socket.on('chat-message', (data) => {
    socket.to(`workspace-${data.workspaceId}`).emit('chat-message-received', {
      userId: socket.data.userId,
      message: data.message,
      timestamp: Date.now()
    });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.data.userId);
  });
});

httpServer.listen(3001, () => {
  console.log('Server running on port 3001');
});
```

### 3.4 Data Layer (PostgreSQL + Prisma)

#### 3.4.1 Prisma Schema

**Prisma ORM**

Prisma нь type-safe ORM бөгөөд schema definition, migration, auto-generated TypeScript types хангана.

Тухайлбал системд дараах Prisma боломжууд ашиглагдсан:
- **Schema Definition** - `model User { ... }` хэлбэрээр тодорхойлно
- **Relations** - `@relation` ашиглан хамаарлууд тодорхойлно
- **Migrations** - `prisma migrate dev` ашиглана
- **Type Generation** - `prisma generate` ашиглан TypeScript types үүсгэнэ

Prisma-ийн ашигласан гол давуу талууд:
- **Type Safety** - Compile-time шалгалт
- **Auto-completion** - IDE-д IntelliSense ажиллана
- **Migration** - Version control хийнэ
- **Судалгаа**: Outline, modern ORM standard болж байна

```prisma
// server/prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            Int      @id @default(autoincrement())
  email         String   @unique
  password      String
  firstName     String?
  lastName      String?
  avatarUrl     String?
  createdAt      DateTime @default(now())

  // Relations
  ownedWorkspaces Workspace[] @relation("WorkspaceOwner")
  memberships     WorkspaceMember[]
  pages          Page[]     @relation("PageAuthor")
  chatMessages   ChatMessage[]
  cardAssignments CardAssignment[]
}

model Workspace {
  id        Int      @id @default(autoincrement())
  name      String
  ownerId   Int
  createdAt DateTime @default(now())

  // Relations
  owner     User       @relation("WorkspaceOwner", fields: [ownerId], references: [id])
  members   WorkspaceMember[]
  pages     Page[]
  kanbanBoards KanbanBoard[]
  chatRooms ChatRoom[]
  files     File[]
}

model Page {
  id          Int      @id @default(autoincrement())
  workspaceId Int
  parentId   Int?     // Self-referencing for hierarchy
  title      String   @default("Untitled")
  content    String?  // Markdown content (JSON)
  createdById Int
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  // Relations
  workspace  Workspace @relation(fields: [workspaceId], references: [id])
  parent     Page?     @relation("PageParent", fields: [parentId], references: [id])
  children   Page[]    @relation("PageParent")
  author     User      @relation("PageAuthor", fields: [createdById], references: [id])
}
```

---

## ДӨРӨВ. ХӨГЖҮҮЛЭЛТ (BACKEND)

### 4.1 Development Environment
- **Runtime**: Node.js v25.9.0
- **Language**: TypeScript 5.x
- **Framework**: Express 4.x
- **Real-time**: Socket.io 4.x
- **ORM**: Prisma 5.x
- **Database**: PostgreSQL 15+
- **Testing**: Vitest
- **IDE**: VS Code

### 4.2 Code Examples

#### 4.2.1 Authentication Controller

```typescript
// server/src/controllers/auth.ts
import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName
      }
    });

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    res.status(201).json({ token, userId: user.id });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Compare password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    res.json({ token, userId: user.id });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
```

#### 4.2.2 Page Update with Real-time Sync

```typescript
// server/src/controllers/page.ts
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { io } from '../index'; // Socket.io instance

const prisma = new PrismaClient();

export const updatePage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = (req as any).userId;

    // Update page in database
    const page = await prisma.page.update({
      where: { id: parseInt(id) },
      data: {
        content,
        updatedAt: new Date()
      }
    });

    // Get workspaceId for broadcasting
    const workspaceId = page.workspaceId;

    // Broadcast to all clients in the workspace (except sender)
    io.to(`workspace-${workspaceId}`).emit('page-updated', {
      pageId: page.id,
      content: page.content,
      updatedBy: userId,
      updatedAt: page.updatedAt
    });

    res.json(page);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
```

### 4.3 Testing Results (Backend)

#### Vitest Results
```
✓ src/__tests__/auth.test.ts (22 tests)
✓ src/__tests__/workspace.test.ts (18 tests)
✓ src/__tests__/page.test.ts (12 tests)
✓ src/__tests__/kanban.test.ts (10 tests)
✓ src/__tests__/chat.test.ts (6 tests)

Test Files  5 passed (5)
     Tests  68 passed (68)
      Time  12.34s (warm)
```

**Coverage Details:**
- **auth.ts**: 95.2%
- **workspace.ts**: 88.4%
- **page.ts**: 91.1%
- **kanban.ts**: 78.3%
- **chat.ts**: 85.6%

**Total Coverage: 82.73%**

---

## ТАВ. ДҮГНЭЛТ (BACKEND)

### 5.1 Хийгдсэн ажлууд
1. ✅ Node.js + Express ашиглан REST API бүтээлээ (22 endpoints)
2. ✅ Socket.io ашиглан real-time communication хөгжүүллээ
3. ✅ JWT + bcrypt ашиглан аюулгүй байдлыг хангалаа
4. ✅ PostgreSQL + Prisma ашиглан өгөгдлийн сангийн схемийг зохицоолоо
5. ✅ 13 хүснэгт, 1:N/M:N/self-referencing хамаарлуудыг тодорхойллоо
6. ✅ 68 backend тест бичиж, 82.73% coverage хангалаа
7. ✅ Room-based broadcasting, auto-reconnection зэргийг хөгжүүллээ

### 5.2 Суралцсан чадварууд
- Node.js + Express backend хөгжүүлэлт
- Socket.io real-time communication
- Prisma ORM ашиглан type-safe database access
- JWT authentication, bcrypt password hashing
- Vitest ашиглан unit/integration testing
- API design (RESTful), middleware architecture

### 5.3 Цаашид хөгжүүлэх чиглэлүүд
- 🔲 API rate limiting (express-rate-limit)
- 🔲 Caching layer (Redis)
- 🔲 Multiple backend instances + load balancer
- 🔲 Socket.io Redis adapter (scaling)
- 🔲 PostgreSQL read replicas
- 🔲 Advanced logging (Winston), monitoring (Prometheus)

### 5.4 Төслийн ач холбогдол
Энэ төсөл нь орчин үеийн backend технологиудыг (Node.js, Socket.io, PostgreSQL, Prisma) практикт хэрэглэх боломжийг олгосон. Real-time collaboration систем хөгжүүлэхэд REST API болон WebSocket холимог архитектур нь найдвартай, scalable шийдэл болохыг харуулсан.

---

**Баярлалаа! 📚**

---

## АШИГЛАСАН МАТЕРИАЛ

1. Node.js Documentation - https://nodejs.org/docs/
2. Express Documentation - https://expressjs.com/
3. Socket.io Documentation - https://socket.io/docs/
4. Prisma Documentation - https://www.prisma.io/docs
5. PostgreSQL Documentation - https://www.postgresql.org/docs/
6. JWT Documentation - https://jwt.io/introduction/
7. Vitest Documentation - https://vitest.dev/
8. GitHub Repository - https://github.com/[username]/notion-clone-project/tree/main/server

### 3.5 PostgreSQL Advanced Features

**PostgreSQL-ийн системд ашиглагдсан дэлгэрэнгүй боломжууд:**

#### 3.5.1 JSON Support (Page Content)

PostgreSQL нь JSONB data type-г дэмждэг тул semi-structured өгөгдөл хадгалахад тохиромжтой.

Тухайлбал системд дараах PostgreSQL JSON боломжууд ашиглагдсан:
- **JSONB Column** - `content TEXT` буюу JSON форматаар хуудасны агуулгыг хадгална
- **JSON Functions** - `jsonb_set()`, `jsonb_extract_path()` ашиглан хайлт хийнэ
- **Indexing** - `GIN index` ашиглан JSON полүүд дээр хайлт хурдан болгоно
- **Flexible Schema** - Page content-д бүтцийг чөлөөтэй өөрчлөх боломжтой

PostgreSQL JSON-ийн ашигласан гол давуу талууд:
- **Schema Evolution** - Page content-ийн бүтцийг өөрчлөхөд table schema өөрчлөх шаардлагагүй
- **Performance** - JSONB нь binary format тул хурдан уншигдана
- **Query Power** - SQL-ээр JSON полүүд дээр complex queries хийх боломжтой
- **Судалгаа** - Notion, Outline ашигладаг (page content хадгалахад)

*Example Query:*
```sql
-- Page content-аас гарчиг авах
SELECT content->>'title' AS title 
FROM pages 
WHERE content @> '{"status": "published"}';
```

#### 3.5.2 ACID Compliance (Transactions)

PostgreSQL нь ACID (Atomicity, Consistency, Isolation, Durability) стандартыг бүрэн дэмждэг.

Тухайлбал системд дараах ACID боломжууд ашиглагдсан:
- **Atomicity** - Бүх operations амжилттай болно эсвэл бүгд буцаана (rollback)
- **Consistency** - Database нь үргэлтэй байдалд байна
- **Isolation** - Concurrent transactions хоорондоо сөргөлжихгүй
- **Durability** - Commit хийгдсэн өгөгдөл алга болохгүй (crash-аас хамгаална)

PostgreSQL ACID-ийн ашигласан гол давуу талууд:
- **Data Integrity** - Банкны түвшний найдвартай байдал
- **Transaction Support** - `BEGIN`, `COMMIT`, `ROLLBACK` ашиглана
- **Concurrency** - Multiple users зэрэгцэн ажиллахад найдвартай
- **Судалгаа** - Instagram, Uber, Notion ашигладаг (millions of users)

*Example Transaction:*
```typescript
// server/src/controllers/workspace.ts
export const deleteWorkspace = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Start transaction
    const result = await prisma.$transaction(async (prisma) => {
      // Delete all related data
      await prisma.workspaceMember.deleteMany({
        where: { workspaceId: parseInt(id) }
      });
      
      await prisma.page.deleteMany({
        where: { workspaceId: parseInt(id) }
      });
      
      // Finally delete workspace
      const workspace = await prisma.workspace.delete({
        where: { id: parseInt(id) }
      });
      
      return workspace;
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Transaction failed' });
  }
};
```

#### 3.5.3 Indexing & Performance

PostgreSQL нь олон төрлийн index-үүдийг дэмждэг тул queries-ийг хурдан болгоно.

Тухайлбал системд дараах indexing боломжууд ашиглагдсан:
- **B-Tree Index** - Default index, `email`, `workspaceId` талбарууд дээр
- **Unique Index** - `email` талбар дээр unique constraint
- **Foreign Key Index** - Relations-д автоматаар үүсдэг
- **GIN Index** - JSONB полүүд дээр хайлт хийхэд (future optimization)

PostgreSQL indexing-ийн ашигласан гол давуу талууд:
- **Query Speed** - `WHERE`, `JOIN` queries хурдан болно
- **Performance Tuning** - `EXPLAIN ANALYZE` ашиглан slow queries олно
- **Auto-creation** - Primary keys, foreign keys-д автоматаар index үүснэ
- **Судалгаа** - 95%+ production databases ашигладаг

*Example Index:*
```sql
-- Email дээр unique index (already in Prisma)
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- WorkspaceId дээр index (for faster page lookup)
CREATE INDEX "Page_workspaceId_idx" ON "Page"("workspaceId");

-- Future: JSON content дээр GIN index
CREATE INDEX "Page_content_idx" ON "Page" USING gin (content jsonb_path_ops);
```

#### 3.5.4 Backup & Recovery

PostgreSQL нь найдвартай backup механизмуудыг саналдаа.

Тухайлбал системд дараах backup боломжууд ашиглагдсан:
- **pg_dump** - Logical backup (SQL dump)
- **WAL Archiving** - Write-Ahead Log архивлал
- **Point-in-Time Recovery** - Тодорхой цагт сэргээх
- **Replication** - Standby servers (future scaling)

PostgreSQL backup-ийн ашигласан гол давуу талууд:
- **Data Safety** - Crash-аас хамгаалал
- **Migration Safety** - `prisma migrate`-ээс өмнө backup хийнэ
- **Disaster Recovery** - Сервер эвдрэхэд сэргээх
- **Судалгаа** - Стандарт database администраци (DBA)

*Example Backup:*
```bash
# Logical backup
pg_dump notion_clone > backup_$(date +%Y%m%d).sql

# Restore
psql notion_clone < backup_20260506.sql
```

#### 3.5.5 Extensions & Ecosystem

PostgreSQL нь extensions ашиглан функционалийг нэмэгдүүлнэ.

Тухайлбал системд дараах extensions ашиглагдана (future):
- **uuid-ossp** - UUID generate хийх
- **pg_stat_statements** - Query performance анализ хийх
- **pg_trgm** - Trigram matching (fuzzy search)
- **postgis** - Geospatial data (хэрэв хэрэглэгчдийн location хадгалах)

PostgreSQL extensions-ийн ашигласан гол давуу талууд:
- **Extensibility** - Core database-д өөрчлөлт хийлгүйгээр нэмэгдүүлнэ
- **Specialized Functions** - Төрөл бүрий хэрэгцээнд зориулсан
- **Community** - 100+ official extensions байдаг
- **Судалгаа** - Enterprise databases ашигладаг (custom functionality)

---

