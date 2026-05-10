# Notion Clone - Дипломын төслийн презентаци

## Хураангуй

Дижитал тэмдэглэл, хамтын ажиллагааны систем (Notion clone) нь бодит цагийн хамтын ажиллагаатай вэб аппликейшн юм. Хэрэглэгчид олон ажлын талбай үүсгэж, имэйлээр гишүүд урих/хасах, хуудсуудыг бодит цагт хамтран засварлах боломжтой. Socket.io ашиглан шууд синхрончлол, курсорын хөдөлгөөн, Markdown рендеринг (Obsidian маягаар), toggle view (засварлах/үзэх горим), зураг upload, dark mode зэрэг онцлогтой. Ажлын талбайн эзэн л гишүүдийг удирдах эрхтэй бөгөөд хасагдсан хэрэглэгч шууд хандах эрхээ алдана. Хуудсууд давхаршсан иєрхи (infinite hierarchy), PostgreSQL + Prisma ORM-ээр хадгалагдана. Backend: Node.js, Express, JWT, Bcrypt; Frontend: Next.js, Tailwind CSS, Socket.io-client. Аюулгүй байдал, хялбар суурилуулалт (local PostgreSQL) онцлог. Төсөл нь Notion-ийн гол боломжуудыг хуулбарлаж, хөгжүүлэлтэнд тохиромжтой, өргөтгөх боломжтой архитектуртай.

Түлхүүр үг: дижитал тэмдэглэл, бодит цаг, хамтын ажиллагаа, Socket.io, Notion clone, PostgreSQL, Next.js

## ОРШИЛ

Системийн зорилго: Дижитал тэмдэглэл, хамтын ажиллагааны систем нь Notion платформын бодит цагийн хамтын засварлах, ажлын талбай удирдах үйл ажиллагааг Node.js, Next.js, Socket.io зэрэг орчин үеийн веб технологийн бүрэн стек ашиглан цахим хэлбэрт бүрэн шилжүүлэх зорилготой. Энэ нь олон хэрэглэгчийн синхрончлогдсон хамтын ажиллагааны дижитал тэмдэглэлийн цогц системийг бүтээхэд чиглэнэ.

Системийн хамрах хүрээ: системийн хамрах хүрээг дараах 3-н түшинд авч үзнэ. Үүнд:

• **Программын хамрах хүрээ**: Backend-д Node.js + Express + Socket.io + Prisma ORM + PostgreSQL, Frontend-д Next.js (App Router) + Tailwind CSS + Socket.io-client ашиглан бодит цагийн хамтын засварлах, Markdown рендеринг, зураг upload, dark mode зэрэг Notion-ийн үндсэн боломжуудыг хэрэгжүүлнэ.

• **Хэрэглэгчийн хамрах хүрээ**: Ажлын талбайн эзэн (Owner) гишүүдийг урих/хасах, хуудсуудыг удирдах; Гишүүд (Members) хамтын ажиллагаатайгаар хуудсуудыг засварлах, синхрончлон ажиллах үүрэгтэй.

• **Ижил төстэй байгууллагуудын хамрах хүрээ**: Уян хатан модульчлагдсан архитектурын ачаар ямар ч байгууллага, багуудын хамтын ажиллагааны хэрэгцээнд тохируулан өргөжүүлэх, Notion-ийн ижил төстэй үйлчилгээ ашигладаг бүх байгууллагад хэрэглэх боломжтой.

Зорилтууд, түүний үнэлгээ:

Зорилтууд:
1. Хэрэглэгчийн шаардлагыг Notion-ийн онцлог дээр суурилсан ярилцлага, ажиглалтаар тодорхойлно.
2. Объект хандалтат системийн шинжилгээгээр архитектурыг зохиомжилно.
3. Холбоост PostgreSQL өгөгдлийн санг Prisma ORM-ээр холбоно.
4. Next.js, Socket.io зэрэг дээд түвшний технологийг ашиглан кодчилно.
5. Unit, Integration, E2E тестээр системийг бүрэн шалгаж баталгаажуулна.

Үнэлгээ:
1. **Найдвартай**: JWT, backend validation, Socket.io reconnection-ээр 99.9% uptime хангана.
2. **Уян хатан**: REST API, Prisma migration-ээр шинэ онцлог хурдан нэмэх боломжтой.
3. **Хэрэглээтэй**: Cross-platform вэб аппликейшн тул Windows, Mac, Linux, mobile browser дээр ажиллана.
4. **Сайжруулалттай**: GitHub, Prisma migration, Docker-ээр байнга шинэчлэгдэнэ.

Систем хөгжүүлэх үндэслэл:

Өмнө огт байгаагүй Монгол хэл дээрх, орон нутгийн хэрэгцээнд тохирсон, нээлттэй эхийн бодит цагийн хамтын дижитал тэмдэглэлийн систем байхгүй байсан учир шинэ систем хөгжүүлэх шаардлага төржээ. Notion-ийн SaaS загвараас хараат бус, өөрийн сервер дээр суурилуулж ашиглах боломжтой шийдлийг бүтээх зорилготой.

---

## НЭГ. СЭДВИЙН СУДЛАГДСАН БАЙДАЛ /СУДАЛГААНЫ ОНОЛ АРГА ЗҮЙ

### 1.1 Ерөнхий судалгаа

Дижитал тэмдэглэл, хамтын ажиллагааны системүүд (Notion clone) нь 2000-аад оноос Google Docs, Etherpad зэрэг бодит цагийн хамтын засварлах платформуудаас эхлэн хөгжсөн. Notion 2016 онд гарч, Markdown, database, nested pages, real-time collaboration-ийг нэгтгэсэн all-in-one workspace болж 2020+ онд SaaS зах зээлд ноёрхсон. Дотоодын хэмжээнд ийм нээлттэй эхийн шийдэл байхгүй, зөвхөн SaaS (Notion, Coda) ашигладаг байсан нь локал хөгжүүлэлтийн хомсдолыг харуулна.

#### Зах зээлийн судалгаа - Топ компаниуд:

**1. Notion (2016-өөс хойш)**
- Ерөнхий: San Francisco-д төвтэй, 2024 онд $10B+ үнэлгээ
- Технологи: React, Node.js, WebSocket, AWS infrastructure
- Онцлог: Block-based editor, databases (tables/boards/calendars), API integration
- Бизнес загвар: Freemium SaaS, enterprise төлбөртэй төлөвлөгөө
- Хэрэглэгч: 30+ сая хэрэглэгч (2024), startup-аас Fortune 500 хүртэл

**2. Coda (2014-өөс хойш)**
- Ерөнхий: Former Google engineers үүсгэсэн, "doc as app" концепц
- Технологи: React, Firebase, Google Cloud
- Онцлог: Interactive buttons, formulas, Packs (integrations), automation
- Бизнес загвар: Team/Enterprise төлбөртэй загвар
- Хэрэглэгч: 50,000+ байгууллага ашигладаг

**3. Confluence (2004-өөс хойш)**
- Ерөнхий: Atlassian компани, enterprise төвлөрсөн
- Технологи: Java, PostgreSQL, React (сүүлийн шинэчлэл)
- Онцлог: Jira integration, enterprise permissions, compliance features
- Бизнес загвар: Per-user subscription, enterprise contracts
- Хэрэглэгч: 75,000+ байгууллага, 200+ сая хэрэглэгч

**4. Slite (2017-өөс хойш)**
- Ерөнхий: Paris-д төвтэй, team documentation төвлөрсөн
- Технологи: React, Node.js, MongoDB, Socket.io
- Онцлог: AI-powered search, lightweight UI, decision logs
- Бизнес загвар: SMB-focused pricing
- Хэрэглэгч: 100,000+ багууд

**5. Outline (2018-өөс хойш)**
- Ерөнхий: Нээлттэй эх (open-source), self-hosted боломжтой
- Технологи: React, Node.js, PostgreSQL, Realtime API
- Онцлог: Markdown-first, fast search, team knowledge base
- Бизнес загвар: Open-source + paid cloud hosting
- Хэрэглэгч: Tech companies, startups

**6. Google Workspace (2006-өөс хойш)**
- Ерөнхий: Google Docs → Workspace экосистем
- Технологи: Google-ийн proprietary tech stack, operational transformation
- Онцлог: Real-time collaboration standard, G Suite integration
- Бизнес загвар: Business/Enterprise subscriptions
- Хэрэглэгч: 3+ тэрбум хэрэглэгч

#### Технологийн судалгаа:

**Real-time синхрончлолын технологиуд:**
- **Operational Transformation (OT)**: Google Docs анх ашигласан, conflict resolution алгоритм
- **CRDT (Conflict-free Replicated Data Types)**: Yjs, Automerge сангууд, peer-to-peer синхрончлол
- **Socket.io**: Firebase Realtime Database-тай өрсөлдөх, event-driven архитектур
- **WebRTC**: Peer-to-peer алтернатив, serverless real-time

**Frontend технологиуд:**
- **React/Next.js**: Notion, Coda, Slite ашигладаг, component reusability
- **Vue.js**: Alternative сонголт, Outline хэсэгт ашигладаг
- **Tailwind CSS**: Utility-first, Notion-ийн modern UI загвар
- **Monaco Editor**: VS Code-ийн editor, code blocks-д ашиглана

**Backend технологиуд:**
- **Node.js + Express**: Иж бүрэн JavaScript stack, Socket.io integration
- **PostgreSQL**: Confluence, Outline ашигладаг, relational data
- **MongoDB**: Slite ашигладаг, flexible schema
- **Prisma ORM**: Type-safe database access, modern ORM standard

**Архитектурын загварууд:**
- **REST API + WebSocket**: Notion-ийн hybrid архитектур
- **Microservices**: Coda, Confluence ашигладаг, scalability
- **Serverless**: Firebase, modern JAMstack approaches
- **Self-hosted vs SaaS**: Outline (open-source) vs Notion (cloud-only)

#### Судалгааны дүгнэлт:

1. **Зах зээл**: Notion-ийн амжилт нь all-in-one workspace загвар, гэхдээ үнэ болон data privacy асуудал байсаар байна
2. **Технологи**: Socket.io + PostgreSQL + Prisma нь үнэ цэнтэй, scalable, type-safe шийдэл
3. **Нээлттэй эх**: Outline гэх мэт open-source төслүүд амжилттай, гэхдээ Монгол хэл дээр байхгүй
4. **Local deployment**: SaaS-аас илүү өөрийн сервер дээр суурилуулах боломжтой систем хэрэгтэй

---

## 1. Системийн зорилго

### Ерөнхий зорилго
Бодит цагийн хамтын ажиллагааны боломжтой веб аппликейшн бүтээх, бичиг баримт, код, төлөвлөгөөгөө нэг дор удирдахад зориулсан.

### Тодорхой зорилгууд
- **Хэрэглэгчийн удирдлага**: Бүртгэл, нэвтрэлт, профайл засах
- **Workspace удирдлага**: Хувийн болон багийн ажлын орчин үүсгэх
- **Бичиг баримт**: Markdown форматтай бичих, урьдчилан харах
- **Хамтын ажиллагаа**: Real-time ижилсүүлэлт, курсор хуваалцах
- **Task удирдлага**: Kanban самбар, карт хуваарилах
- **Файл удирдлага**: Хуулах, харах, засах, паппет үүсгэх
- **Чат систем**: Workspace дэх бодит цагийн чат өрөөнүүд
- **Зураг зурах**: Бодит цагийн canvas самбар

---

## 2. Систем хөгжүүлэх үндэслэл

### Хэрэглэгчийн хэрэгцээ
Одоогийн цагт хамтын ажиллагааны хэрэгсэл хэрэгцээ нэмэгдэж байна:
- **Notion**, **Slack**, **Trello** зэрэг хэрэгслүүд өндөр үнэтэй эсвэл хязгаарлагдмал боломжтой
- Багаар ажиллахад зориулсан нэгдмэл платформ хэрэгтэй

### Технологийн үндэс
- **Next.js 14**: React фреймворк, server-side rendering
- **Node.js + Express**: Backend API
- **PostgreSQL**: Холбоотой өгөгдлийн сан
- **Prisma ORM**: Типээр хамгаалагдсан өгөгдлийн сангийн хамаарлын удирдлага
- **Socket.io**: Бодит цагийн холбоос
- **Tailwind CSS**: Utility-first CSS framework
- **TypeScript**: Типээр хамгаалагдсан JavaScript

### Архитектурын сонголтын шалтгаан
1. **Component-based**: React/Next.js ашиглан дахин хэрэглэгдэхүйц компонентүүд
2. **Real-time**: Socket.io ашиглан instant синхрончлол
3. **Type safety**: TypeScript ашиглан алдааг compile хийхээс өмнө олно
4. **Scalability**: PostgreSQL + Prisma ашиглан том өгөгдлийн сангийн даац

---

## 3. Системийн хамрах хүрээ

### Хэрэглэгчийн төрөл
1. **Guest (Зочин)**: Нүүр хуудас үзэх, бүртгүүлэх/нэвтрэх
2. **Member (Гишүүн)**: Workspace-д уригдсан хэрэглэгч, хандах эрхтэй
3. **Owner (Эзэмшигч)**: Workspace үүсгэсэн хэрэглэгч, бүх эрхтэй
4. **Admin (Админ)**: Системийн админ, бүх workspace-үүдийг хардаг

### Үндсэн функцүүд

#### 3.1 Нэвтрэлт ба бүртгэл
- И-мейл, нууц үгээр нэвтрэх
- Шинэ хэрэглэгч бүртгүүлэх (нэр, овог, и-мейл, нууц үг)
- Нууц үг сэргээх (и-мейлээр link илгээх)
- Профайл засах (аватар, хэрэглэгчийн нэр)

#### 3.2 Workspace удирдлага
- Workspace үүсгэх, нэр өөрчлөх
- Гишүүдийг урих (и-мейлээр)
- Гишүүдийн жагсаалт харах
- Гишүүн хасах (зөвхөн эзэмшигч)

#### 3.3 Хуудас удирдлага (Pages)
- Markdown форматтай хуудас бичих
- Урьдчилан харах (Preview)
- Бодит цагийн ижилсүүлэлт (cursor tracking)
- Автоматаар хадгалах (1 секундын debounce)
- Хуудас устгах, нэр өөрчлөх

#### 3.4 Kanban самбар
- Самбар үүсгэх, нэр өөрчлөх
- Багана (Columns) үүсгэх, устгах, өнгөлөх
- Карт (Cards) үүсгэх, засах, устгах
- Drag-and-drop ашиглан карт шилжүүлэх
- Картанд хэрэглэгч хуваарилах

#### 3.5 Файл удирдлага
- Файл хуулах (image, code, documents)
- Паппет үүсгэх, устгах (nesting дэмжлэгтэй)
- Файл татах, устгах
- Код файл засах (syntax highlighting-тай)
- Зураг урьдчилан харах

#### 3.6 Чат систем
- Чат өрөө үүсгэх
- Бодит цагийн мессеж илгээх
- Мессеж засах, устгах (зөвхөн өөрийнх)
- 1000 тэмдэгт хязгаартай

#### 3.7 Зураг зурах самбар (Canvas)
- Pen ашиглан зурах
- Eraser ашиглан арилгах
- Өнгө сонгох (7 өнгө)
- Шугамны зузаан тохируулах
- Бодит цагийн зураг зурах (бусад хэрэглэгчидтэй)
- Undo (20 түүх хадгална)
- Зураг хадгалах, ачаалах

### Системийн хязгаарлал
- Гар утасны хувьд бичих орчин хязгаарлагдмал
- Интернет холболт шаардлагатай (offline дэмжлэггүй)
- Зураг зурах үед том өгөгдөл дамждаг тул удаан интернетэд хүндрэлтэй

---

## 4. Хэрэглэгчийн шаардлага

### Функциональ шаардлага

#### FR-1: Нэвтрэлт ба бүртгэл
- **FR-1.1**: Хэрэглэгч и-мейл, нууц үгээр нэвтэрч чадна
- **FR-1.2**: Хэрэглэгч шинэ бүртгэл үүсгэж чадна
- **FR-1.3**: Нууц үг мартсан тохиолдолд и-мейлээр сэргээх линк авах
- **FR-1.4**: Профайл (аватар, хэрэглэгчийн нэр) засах

#### FR-2: Workspace удирдлага
- **FR-2.1**: Workspace үүсгэх, нэр өөрчлөх
- **FR-2.2**: Гишүүдийг и-мейлээр урих
- **FR-2.3**: Гишүүдийн жагсаалт харах
- **FR-2.4**: Гишүүн хасах (зөвхөн эзэмшигч)

#### FR-3: Хуудас удирдлага
- **FR-3.1**: Markdown форматтай хуудас бичих
- **FR-3.2**: Урьдчилан харах (Preview)
- **FR-3.3**: Бодит цагийн ижилсүүлэлт (cursor tracking)
- **FR-3.4**: Автоматаар хадгалах

#### FR-4: Kanban самбар
- **FR-4.1**: Самбар, багана, карт үүсгэх
- **FR-4.2**: Drag-and-drop ашиглан карт шилжүүлэх
- **FR-4.3**: Картанд хэрэглэгч хуваарилах
- **FR-4.4**: Карт засах, устгах

#### FR-5: Файл удирдлага
- **FR-5.1**: Файл хуулах (image, code, documents)
- **FR-5.2**: Паппет үүсгэх, устгах
- **FR-5.3**: Файл татах, устгах
- **FR-5.4**: Код файл засах, урьдчилан харах

#### FR-6: Чат систем
- **FR-6.1**: Чат өрөө үүсгэх
- **FR-6.2**: Бодит цагийн мессеж илгээх
- **FR-6.3**: Мессеж засах, устгах

#### FR-7: Зураг зурах самбар
- **FR-7.1**: Pen/Eraser ашиглан зурах
- **FR-7.2**: Өнгө, шугамны зузаан тохируулах
- **FR-7.3**: Бодит цагийн зурах
- **FR-7.4**: Undo, хадгалах

### Техникийн шаардлага

#### NFR-1: Гүйцэтгэл
- **NFR-1.1**: Хуудас ачаалах хугацаа < 2 секунд
- **NFR-1.2**: Бодит цагийн шинэчлэл < 100ms
- **NFR-1.3**: 1000 хэрэглэгч зэрэгцэн ашиглах боломжтой

#### NFR-2: Аюулгүй байдал
- **NFR-2.1**: JWT token ашиглан нэвтрэлт хамгаалах
- **NFR-2.2**: Нууц үг bcrypt ашиглан хэшлэх
- **NFR-2.3**: API endpoint-үүд нэвтрэлт шаардана (except register/login)

#### NFR-3: Хамтөөршил
- **NFR-3.1**: Responsive дизайн (mobile, tablet, desktop)
- **NFR-3.2**: Dark mode дэмжлэг
- **NFR-3.3**: Modern browser-үүдийг дэмжнэ (Chrome, Firefox, Safari, Edge)

---

## 5. Архитектурын сонголт

### 5.1 Системийн архитектур (3-tier architecture)

```
┌─────────────────────────────────────────────┐
│           Client (Browser)                  │
│    Next.js 14, React, Tailwind CSS         │
│    State: React hooks, Context API          │
│    Real-time: Socket.io client             │
└──────────────────┬──────────────────────────┘
                   │ HTTP/WebSocket
┌──────────────────▼──────────────────────────┐
│           Backend API Server                │
│    Node.js, Express, TypeScript            │
│    Auth: JWT middleware                    │
│    Real-time: Socket.io server             │
└──────────────────┬──────────────────────────┘
                   │ Prisma ORM
┌──────────────────▼──────────────────────────┐
│         Database (PostgreSQL)               │
│    13 tables, Relations, Constraints       │
└─────────────────────────────────────────────┘
```

### 5.2 Сонгосон технологиуд

#### Frontend
- **Next.js 14**: App Router, Server Components, SEO optimization
- **React 18**: Component-based UI, Hooks
- **Tailwind CSS**: Utility-first styling, responsive design
- **Socket.io-client**: Real-time bidirectional communication
- **ReactMarkdown**: Markdown rendering
- **Lucide React**: Icon library

#### Backend
- **Node.js**: JavaScript runtime
- **Express**: Web framework
- **TypeScript**: Type-safe JavaScript
- **Socket.io**: WebSocket abstraction
- **JWT**: JSON Web Token authentication
- **bcrypt**: Password hashing
- **Prisma**: Type-safe ORM

#### Database
- **PostgreSQL**: Relational database
- **13 хүснэгт**: User, Workspace, Page, Folder, File, г.м
- **Relations**: One-to-many, Many-to-many, Self-referencing

### 5.3 Архитектурын давуу тал

1. **Separation of Concerns**: Frontend, Backend, Database тусдаа
2. **Scalability**: PostgreSQL ашиглан том өгөгдлийн сангийн даац
3. **Real-time**: Socket.io ашиглан instant communication
4. **Type Safety**: TypeScript + Prisma ашиглан алдааг compile хийхээс өмнө олно
5. **Developer Experience**: Hot reload, type hints, auto-completion

### 5.4 Өгөгдлийн сангийн ERD

**[ERD.puml файлд 13 хүснэгтий дэлгэрэнгүй diagram байна]**

Үндсэн хүснэгтүүд:
- **User**: Хэрэглэгчийн мэдээлэл
- **Workspace**: Ажлын орчин
- **WorkspaceMember**: Workspace-ийн гишүүд
- **Page**: Бичиг баримт (self-referencing)
- **Folder**: Хавтас (self-referencing)
- **File**: Файл
- **Drawing**: Зураг зурах
- **ChatRoom**: Чат өрөө
- **ChatMessage**: Чат мессеж
- **KanbanBoard**: Kanban самбар
- **KanbanColumn**: Kanban багана
- **KanbanCard**: Kanban карт

---

## 6. Дүгнэлт

### Хийгдсэн ажлууд
1. ✅ Бодит цагийн хамтын ажиллагаатай веб аппликейшн бүтээлээ
2. ✅ 13 хүснэгтээс бүрдсэн өгөгдлийн сангийн загвар гаргалаа
3. ✅ JWT token ашиглан нэвтрэлтийн систем хэрэгжүүллээ
4. ✅ Markdown редактор, урьдчилан харах, автоматаар хадгалах
5. ✅ Kanban самбар, drag-and-drop, карт хуваарилалт
6. ✅ Файл хуулах, паппет удирдлага, код засварлагч
7. ✅ Бодит цагийн чат систем, мессеж засах/устгах
8. ✅ Canvas зураг зурах, бодит цагийн ижилсүүлэлт
9. ✅ Dark mode, responsive дизайн, modern UI
10. ✅ 68 backend тест, 110 frontend тест бичигдлээ

### Суралцсан чадварууд
- Full-stack веб хөгжүүлэлт (Next.js + Node.js + PostgreSQL)
- Real-time communication (Socket.io)
- TypeScript ашиглан type-safe код бичих
- Prisma ORM ашиглан өгөгдлийн сангийн хамаарлыг удирдах
- Component-based UI development
- API design (RESTful + WebSocket)
- Authentication & Authorization (JWT, bcrypt)
- Testing (Vitest, Playwright)

### Цаашид хөгжүүлэх чиглэлүүд
- 🔲 Offline дэмжлэг (Service Workers, IndexedDB)
- 🔲 WebRTC ашиглан video/audio call
- 🔲 AI ашиглан текст санал болгох (AI integration)
- 🔲 Mobile app (React Native эсвэл Flutter)
- 🔲 API rate limiting, caching (Redis)
- 🔲 Advanced permissions (read-only, comment-only)

### Төслийн ач холбогдол
Энэ төсөл нь орчин үеийн веб хөгжүүлэлтийн гол технологиудыг (React, Node.js, PostgreSQL, Real-time communication) практикт хэрэглэх боломжийг олгосон. Хамтын ажиллагааны хэрэгсэл бүтээхдээр веб аппликейшн хөгжүүлэлтийн бүх үе шатыг (Design → Development → Testing → Deployment) дамжсан.

---

**Баярлалаа! 📚**
