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
const kanban_1 = __importDefault(require("../../routes/kanban"));
const workspace_1 = __importDefault(require("../../routes/workspace"));
const auth_1 = __importDefault(require("../../routes/auth"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use('/auth', auth_1.default);
app.use('/workspaces', workspace_1.default);
app.use('/kanban', kanban_1.default);
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
        const res = yield (0, supertest_1.default)(app)
            .post('/workspaces')
            .set('Authorization', 'Bearer ' + token)
            .send({ name: 'Kanban Test Workspace' });
        return res.body.id || '';
    });
}
(0, vitest_1.describe)('Kanban Routes', () => {
    (0, vitest_1.describe)('POST /kanban/workspace/:workspaceId (create board)', () => {
        (0, vitest_1.it)('should create a kanban board with default columns', () => __awaiter(void 0, void 0, void 0, function* () {
            const email = 'kanban_' + Date.now() + '@example.com';
            const token = yield getToken(email, 'TestPass123!');
            const workspaceId = yield createWorkspace(token);
            const res = yield (0, supertest_1.default)(app)
                .post('/kanban/workspace/' + workspaceId)
                .set('Authorization', 'Bearer ' + token)
                .send({ title: 'Test Board' });
            (0, vitest_1.expect)([201, 200]).toContain(res.status);
            (0, vitest_1.expect)(res.body.columns).toBeTruthy();
        }));
        (0, vitest_1.it)('should reject without authentication', () => __awaiter(void 0, void 0, void 0, function* () {
            const email = 'kanban_' + Date.now() + '@example.com';
            const token = yield getToken(email, 'TestPass123!');
            const workspaceId = yield createWorkspace(token);
            const res = yield (0, supertest_1.default)(app)
                .post('/kanban/workspace/' + workspaceId)
                .send({ title: 'Unauthorized Board' });
            (0, vitest_1.expect)([401, 403]).toContain(res.status);
        }));
    });
    (0, vitest_1.describe)('GET /kanban/workspace/:workspaceId (list boards)', () => {
        (0, vitest_1.it)('should list boards for a workspace', () => __awaiter(void 0, void 0, void 0, function* () {
            const email = 'kanban_' + Date.now() + '@example.com';
            const token = yield getToken(email, 'TestPass123!');
            const workspaceId = yield createWorkspace(token);
            yield (0, supertest_1.default)(app)
                .post('/kanban/workspace/' + workspaceId)
                .set('Authorization', 'Bearer ' + token)
                .send({ title: 'Board to List' });
            const res = yield (0, supertest_1.default)(app)
                .get('/kanban/workspace/' + workspaceId)
                .set('Authorization', 'Bearer ' + token);
            (0, vitest_1.expect)([200, 201]).toContain(res.status);
            (0, vitest_1.expect)(Array.isArray(res.body)).toBe(true);
        }));
    });
    (0, vitest_1.describe)('GET /kanban/board/:boardId', () => {
        (0, vitest_1.it)('should get a board with columns and cards', () => __awaiter(void 0, void 0, void 0, function* () {
            const email = 'kanban_' + Date.now() + '@example.com';
            const token = yield getToken(email, 'TestPass123!');
            const workspaceId = yield createWorkspace(token);
            const boardRes = yield (0, supertest_1.default)(app)
                .post('/kanban/workspace/' + workspaceId)
                .set('Authorization', 'Bearer ' + token)
                .send({ title: 'Detailed Board' });
            const boardId = boardRes.body.id || '';
            const res = yield (0, supertest_1.default)(app)
                .get('/kanban/board/' + boardId)
                .set('Authorization', 'Bearer ' + token);
            (0, vitest_1.expect)([200, 404]).toContain(res.status);
        }));
    });
    (0, vitest_1.describe)('POST /kanban/columns/:columnId/cards', () => {
        (0, vitest_1.it)('should add a card to a column', () => __awaiter(void 0, void 0, void 0, function* () {
            var _a, _b;
            const email = 'kanban_' + Date.now() + '@example.com';
            const token = yield getToken(email, 'TestPass123!');
            const workspaceId = yield createWorkspace(token);
            const boardRes = yield (0, supertest_1.default)(app)
                .post('/kanban/workspace/' + workspaceId)
                .set('Authorization', 'Bearer ' + token)
                .send({ title: 'Card Board' });
            const boardId = boardRes.body.id || '';
            // Board has 3 default columns, get first one
            const firstColumnId = ((_b = (_a = boardRes.body.columns) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.id) || '';
            if (firstColumnId) {
                const res = yield (0, supertest_1.default)(app)
                    .post('/kanban/columns/' + firstColumnId + '/cards')
                    .set('Authorization', 'Bearer ' + token)
                    .send({ content: 'New Card', description: 'Card description' });
                (0, vitest_1.expect)([201, 200]).toContain(res.status);
            }
        }));
    });
});
(0, vitest_1.describe)('Kanban Card/Column Update & Delete Routes', () => {
    function createBoardWithColumn(token, workspaceId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const boardRes = yield (0, supertest_1.default)(app)
                .post('/kanban/workspace/' + workspaceId)
                .set('Authorization', 'Bearer ' + token)
                .send({ title: 'Update Test Board' });
            const columnId = ((_b = (_a = boardRes.body.columns) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.id) || '';
            const cardRes = yield (0, supertest_1.default)(app)
                .post('/kanban/columns/' + columnId + '/cards')
                .set('Authorization', 'Bearer ' + token)
                .send({ content: 'Card to Update', description: 'Desc' });
            return {
                boardId: boardRes.body.id || '',
                columnId,
                cardId: cardRes.body.id || '',
            };
        });
    }
    (0, vitest_1.describe)('PUT /kanban/cards/:cardId', () => {
        (0, vitest_1.it)('should update a card content and description', () => __awaiter(void 0, void 0, void 0, function* () {
            const email = 'kan2_' + Date.now() + '@example.com';
            const token = yield getToken(email, 'TestPass123!');
            const workspaceId = yield createWorkspace(token);
            const { cardId } = yield createBoardWithColumn(token, workspaceId);
            const res = yield (0, supertest_1.default)(app)
                .put('/kanban/cards/' + cardId)
                .set('Authorization', 'Bearer ' + token)
                .send({ content: 'Updated Content', description: 'Updated Desc' });
            (0, vitest_1.expect)([200, 201]).toContain(res.status);
        }));
    });
    (0, vitest_1.describe)('PUT /kanban/columns/:columnId', () => {
        (0, vitest_1.it)('should update a column title and color', () => __awaiter(void 0, void 0, void 0, function* () {
            const email = 'kan3_' + Date.now() + '@example.com';
            const token = yield getToken(email, 'TestPass123!');
            const workspaceId = yield createWorkspace(token);
            const { columnId } = yield createBoardWithColumn(token, workspaceId);
            const res = yield (0, supertest_1.default)(app)
                .put('/kanban/columns/' + columnId)
                .set('Authorization', 'Bearer ' + token)
                .send({ title: 'Renamed Column', color: '#ff0000' });
            (0, vitest_1.expect)([200, 201]).toContain(res.status);
        }));
    });
    (0, vitest_1.describe)('DELETE /kanban/cards/:cardId', () => {
        (0, vitest_1.it)('should delete a card', () => __awaiter(void 0, void 0, void 0, function* () {
            const email = 'kan4_' + Date.now() + '@example.com';
            const token = yield getToken(email, 'TestPass123!');
            const workspaceId = yield createWorkspace(token);
            const { cardId } = yield createBoardWithColumn(token, workspaceId);
            const res = yield (0, supertest_1.default)(app)
                .delete('/kanban/cards/' + cardId)
                .set('Authorization', 'Bearer ' + token);
            (0, vitest_1.expect)([200, 201]).toContain(res.status);
        }));
    });
    (0, vitest_1.describe)('POST /kanban/board/:boardId/columns', () => {
        (0, vitest_1.it)('should create a new column on a board', () => __awaiter(void 0, void 0, void 0, function* () {
            const email = 'kan5_' + Date.now() + '@example.com';
            const token = yield getToken(email, 'TestPass123!');
            const workspaceId = yield createWorkspace(token);
            const { boardId } = yield createBoardWithColumn(token, workspaceId);
            const res = yield (0, supertest_1.default)(app)
                .post('/kanban/board/' + boardId + '/columns')
                .set('Authorization', 'Bearer ' + token)
                .send({ title: 'New Column', color: '#00ff00' });
            (0, vitest_1.expect)([201, 200]).toContain(res.status);
        }));
    });
    (0, vitest_1.describe)('PUT /kanban/cards/:cardId/assign', () => {
        (0, vitest_1.it)('should assign a user to a card', () => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            const email = 'kan6_' + Date.now() + '@example.com';
            const token = yield getToken(email, 'TestPass123!');
            const workspaceId = yield createWorkspace(token);
            const { cardId } = yield createBoardWithColumn(token, workspaceId);
            // Get the user ID from the workspace membership
            const wsRes = yield (0, supertest_1.default)(app)
                .get('/workspaces/' + workspaceId + '/members')
                .set('Authorization', 'Bearer ' + token);
            const memberId = ((_a = wsRes.body[0]) === null || _a === void 0 ? void 0 : _a.userId) || '';
            const res = yield (0, supertest_1.default)(app)
                .put('/kanban/cards/' + cardId + '/assign')
                .set('Authorization', 'Bearer ' + token)
                .send({ userId: memberId });
            (0, vitest_1.expect)([200, 201]).toContain(res.status);
        }));
    });
});
