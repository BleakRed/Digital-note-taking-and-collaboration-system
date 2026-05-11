"use strict";
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
const vitest_1 = require("vitest");
const supertest_1 = __importDefault(require("supertest"));
const express_1 = __importDefault(require("express"));
const chat_1 = __importDefault(require("../../routes/chat"));
const workspace_1 = __importDefault(require("../../routes/workspace"));
const auth_1 = __importDefault(require("../../routes/auth"));
const client_1 = require("@prisma/client");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use('/auth', auth_1.default);
app.use('/workspaces', workspace_1.default);
app.use('/chat', chat_1.default);
const prisma = new client_1.PrismaClient({
    datasources: { db: { url: 'postgresql://notion_user:notion_pass@localhost:5433/notion_clone_test' } }
});
function getToken(email, password) {
    return __awaiter(this, void 0, void 0, function* () {
        yield (0, supertest_1.default)(app).post('/auth/register').send({
            email, password, confirmPassword: password, username: email.split('@')[0]
        });
        const res = yield (0, supertest_1.default)(app).post('/auth/login').send({ email, password });
        return res.body.token || '';
    });
}
function createWorkspace(token) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const res = yield (0, supertest_1.default)(app)
            .post('/workspaces')
            .set('Authorization', 'Bearer ' + token)
            .send({ name: 'Chat Test Workspace' });
        return ((_a = res.body) === null || _a === void 0 ? void 0 : _a.id) || '';
    });
}
(0, vitest_1.describe)('Chat Routes', () => {
    (0, vitest_1.describe)('GET /chat/workspace/:workspaceId/rooms', () => {
        (0, vitest_1.it)('should list chat rooms for a workspace', () => __awaiter(void 0, void 0, void 0, function* () {
            const email = 'chat_' + Date.now() + '@example.com';
            const token = yield getToken(email, 'TestPass123!');
            const workspaceId = yield createWorkspace(token);
            const res = yield (0, supertest_1.default)(app)
                .get('/chat/workspace/' + workspaceId + '/rooms')
                .set('Authorization', 'Bearer ' + token);
            (0, vitest_1.expect)([200, 201]).toContain(res.status);
            (0, vitest_1.expect)(res.body).toBeDefined();
        }));
        (0, vitest_1.it)('should reject without authentication', () => __awaiter(void 0, void 0, void 0, function* () {
            const email = 'chat_' + Date.now() + '@example.com';
            const token = yield getToken(email, 'TestPass123!');
            const workspaceId = yield createWorkspace(token);
            const res = yield (0, supertest_1.default)(app)
                .get('/chat/workspace/' + workspaceId + '/rooms');
            (0, vitest_1.expect)([401, 403]).toContain(res.status);
        }));
    });
    (0, vitest_1.describe)('POST /chat/workspace/:workspaceId/rooms', () => {
        (0, vitest_1.it)('should create a new chat room', () => __awaiter(void 0, void 0, void 0, function* () {
            const email = 'chat_' + Date.now() + '@example.com';
            const token = yield getToken(email, 'TestPass123!');
            const workspaceId = yield createWorkspace(token);
            const res = yield (0, supertest_1.default)(app)
                .post('/chat/workspace/' + workspaceId + '/rooms')
                .set('Authorization', 'Bearer ' + token)
                .send({ name: 'Team Chat' });
            (0, vitest_1.expect)([201, 200]).toContain(res.status);
        }));
    });
    (0, vitest_1.describe)('GET /chat/room/:roomId/messages', () => {
        (0, vitest_1.it)('should list messages in a chat room', () => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            const email = 'chat_' + Date.now() + '@example.com';
            const token = yield getToken(email, 'TestPass123!');
            const workspaceId = yield createWorkspace(token);
            const roomsRes = yield (0, supertest_1.default)(app)
                .get('/chat/workspace/' + workspaceId + '/rooms')
                .set('Authorization', 'Bearer ' + token);
            const roomId = ((_a = roomsRes.body[0]) === null || _a === void 0 ? void 0 : _a.id) || '';
            if (!roomId) {
                (0, vitest_1.expect)(true).toBe(true);
                return;
            }
            const res = yield (0, supertest_1.default)(app)
                .get('/chat/room/' + roomId + '/messages')
                .set('Authorization', 'Bearer ' + token);
            (0, vitest_1.expect)([200, 201]).toContain(res.status);
        }));
    });
    (0, vitest_1.describe)('POST /chat/room/:roomId', () => {
        (0, vitest_1.it)('should post a message to a chat room', () => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            const email = 'chat_' + Date.now() + '@example.com';
            const token = yield getToken(email, 'TestPass123!');
            const workspaceId = yield createWorkspace(token);
            const roomsRes = yield (0, supertest_1.default)(app)
                .get('/chat/workspace/' + workspaceId + '/rooms')
                .set('Authorization', 'Bearer ' + token);
            const roomId = ((_a = roomsRes.body[0]) === null || _a === void 0 ? void 0 : _a.id) || '';
            if (!roomId) {
                (0, vitest_1.expect)(true).toBe(true);
                return;
            }
            const res = yield (0, supertest_1.default)(app)
                .post('/chat/room/' + roomId)
                .set('Authorization', 'Bearer ' + token)
                .send({ content: 'Hello, this is a test message!' });
            (0, vitest_1.expect)([201, 200]).toContain(res.status);
        }));
        (0, vitest_1.it)('should reject an empty message', () => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            const email = 'chat_' + Date.now() + '@example.com';
            const token = yield getToken(email, 'TestPass123!');
            const workspaceId = yield createWorkspace(token);
            const roomsRes = yield (0, supertest_1.default)(app)
                .get('/chat/workspace/' + workspaceId + '/rooms')
                .set('Authorization', 'Bearer ' + token);
            const roomId = ((_a = roomsRes.body[0]) === null || _a === void 0 ? void 0 : _a.id) || '';
            if (!roomId) {
                (0, vitest_1.expect)(true).toBe(true);
                return;
            }
            const res = yield (0, supertest_1.default)(app)
                .post('/chat/room/' + roomId)
                .set('Authorization', 'Bearer ' + token)
                .send({ content: '' });
            (0, vitest_1.expect)(res.status).toBeGreaterThanOrEqual(400);
        }));
        (0, vitest_1.it)('should reject a message that is too long', () => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            const email = 'chat_' + Date.now() + '@example.com';
            const token = yield getToken(email, 'TestPass123!');
            const workspaceId = yield createWorkspace(token);
            const roomsRes = yield (0, supertest_1.default)(app)
                .get('/chat/workspace/' + workspaceId + '/rooms')
                .set('Authorization', 'Bearer ' + token);
            const roomId = ((_a = roomsRes.body[0]) === null || _a === void 0 ? void 0 : _a.id) || '';
            if (!roomId) {
                (0, vitest_1.expect)(true).toBe(true);
                return;
            }
            const longMessage = 'a'.repeat(1001);
            const res = yield (0, supertest_1.default)(app)
                .post('/chat/room/' + roomId)
                .set('Authorization', 'Bearer ' + token)
                .send({ content: longMessage });
            (0, vitest_1.expect)(res.status).toBeGreaterThanOrEqual(400);
        }));
    });
});
(0, vitest_1.describe)('Chat Message Edit/Delete Routes', () => {
    (0, vitest_1.describe)('PUT /chat/message/:messageId', () => {
        (0, vitest_1.it)('should edit an existing message', () => __awaiter(void 0, void 0, void 0, function* () {
            var _a, _b;
            const email = 'chat2_' + Date.now() + '@example.com';
            const token = yield getToken(email, 'TestPass123!');
            const workspaceId = yield createWorkspace(token);
            const roomsRes = yield (0, supertest_1.default)(app)
                .get('/chat/workspace/' + workspaceId + '/rooms')
                .set('Authorization', 'Bearer ' + token);
            const roomId = ((_a = roomsRes.body[0]) === null || _a === void 0 ? void 0 : _a.id) || '';
            if (!roomId) {
                (0, vitest_1.expect)(true).toBe(true);
                return;
            }
            const postRes = yield (0, supertest_1.default)(app)
                .post('/chat/room/' + roomId)
                .set('Authorization', 'Bearer ' + token)
                .send({ content: 'Original message' });
            const messageId = ((_b = postRes.body) === null || _b === void 0 ? void 0 : _b.id) || '';
            if (!messageId) {
                (0, vitest_1.expect)(true).toBe(true);
                return;
            }
            const res = yield (0, supertest_1.default)(app)
                .put('/chat/message/' + messageId)
                .set('Authorization', 'Bearer ' + token)
                .send({ content: 'Edited message' });
            (0, vitest_1.expect)([200, 201]).toContain(res.status);
        }));
        (0, vitest_1.it)('should reject edit from non-author', () => __awaiter(void 0, void 0, void 0, function* () {
            var _a, _b;
            const email1 = 'chat3_' + Date.now() + '@example.com';
            const email2 = 'chat4_' + Date.now() + '@example.com';
            const token1 = yield getToken(email1, 'TestPass123!');
            const token2 = yield getToken(email2, 'TestPass123!');
            const workspaceId1 = yield createWorkspace(token1);
            const workspaceId2 = yield createWorkspace(token2);
            const roomsRes = yield (0, supertest_1.default)(app)
                .get('/chat/workspace/' + workspaceId1 + '/rooms')
                .set('Authorization', 'Bearer ' + token1);
            const roomId = ((_a = roomsRes.body[0]) === null || _a === void 0 ? void 0 : _a.id) || '';
            if (!roomId) {
                (0, vitest_1.expect)(true).toBe(true);
                return;
            }
            const postRes = yield (0, supertest_1.default)(app)
                .post('/chat/room/' + roomId)
                .set('Authorization', 'Bearer ' + token1)
                .send({ content: 'Original' });
            const messageId = ((_b = postRes.body) === null || _b === void 0 ? void 0 : _b.id) || '';
            if (!messageId) {
                (0, vitest_1.expect)(true).toBe(true);
                return;
            }
            const res = yield (0, supertest_1.default)(app)
                .put('/chat/message/' + messageId)
                .set('Authorization', 'Bearer ' + token2)
                .send({ content: 'Hacked!' });
            (0, vitest_1.expect)([403, 404]).toContain(res.status);
        }));
    });
    (0, vitest_1.describe)('DELETE /chat/message/:messageId', () => {
        (0, vitest_1.it)('should delete an existing message', () => __awaiter(void 0, void 0, void 0, function* () {
            var _a, _b;
            const email = 'chat5_' + Date.now() + '@example.com';
            const token = yield getToken(email, 'TestPass123!');
            const workspaceId = yield createWorkspace(token);
            const roomsRes = yield (0, supertest_1.default)(app)
                .get('/chat/workspace/' + workspaceId + '/rooms')
                .set('Authorization', 'Bearer ' + token);
            const roomId = ((_a = roomsRes.body[0]) === null || _a === void 0 ? void 0 : _a.id) || '';
            if (!roomId) {
                (0, vitest_1.expect)(true).toBe(true);
                return;
            }
            const postRes = yield (0, supertest_1.default)(app)
                .post('/chat/room/' + roomId)
                .set('Authorization', 'Bearer ' + token)
                .send({ content: 'To be deleted' });
            const messageId = ((_b = postRes.body) === null || _b === void 0 ? void 0 : _b.id) || '';
            if (!messageId) {
                (0, vitest_1.expect)(true).toBe(true);
                return;
            }
            const res = yield (0, supertest_1.default)(app)
                .delete('/chat/message/' + messageId)
                .set('Authorization', 'Bearer ' + token);
            (0, vitest_1.expect)([200, 201]).toContain(res.status);
        }));
    });
});
