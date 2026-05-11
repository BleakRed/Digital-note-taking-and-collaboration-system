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
const drawing_1 = __importDefault(require("../../routes/drawing"));
const workspace_1 = __importDefault(require("../../routes/workspace"));
const auth_1 = __importDefault(require("../../routes/auth"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use('/auth', auth_1.default);
app.use('/workspaces', workspace_1.default);
app.use('/drawings', drawing_1.default);
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
            .send({ name: 'Drawing Test Workspace' });
        return res.body.id || '';
    });
}
(0, vitest_1.describe)('Drawing Routes', () => {
    (0, vitest_1.describe)('POST /drawings/workspace/:workspaceId', () => {
        (0, vitest_1.it)('should create a new drawing', () => __awaiter(void 0, void 0, void 0, function* () {
            const email = 'draw_' + Date.now() + '@example.com';
            const token = yield getToken(email, 'TestPass123!');
            const workspaceId = yield createWorkspace(token);
            const res = yield (0, supertest_1.default)(app)
                .post('/drawings/workspace/' + workspaceId)
                .set('Authorization', 'Bearer ' + token)
                .send({ title: 'My Drawing', data: '{"strokes":[]}' });
            (0, vitest_1.expect)([201, 200]).toContain(res.status);
            (0, vitest_1.expect)(res.body.title).toBe('My Drawing');
        }));
        (0, vitest_1.it)('should create a drawing with default title if none provided', () => __awaiter(void 0, void 0, void 0, function* () {
            const email = 'draw_' + Date.now() + '@example.com';
            const token = yield getToken(email, 'TestPass123!');
            const workspaceId = yield createWorkspace(token);
            const res = yield (0, supertest_1.default)(app)
                .post('/drawings/workspace/' + workspaceId)
                .set('Authorization', 'Bearer ' + token)
                .send({ data: '{"strokes":[]}' });
            (0, vitest_1.expect)([201, 200]).toContain(res.status);
        }));
        (0, vitest_1.it)('should reject drawing creation without authentication', () => __awaiter(void 0, void 0, void 0, function* () {
            const email = 'draw_' + Date.now() + '@example.com';
            const token = yield getToken(email, 'TestPass123!');
            const workspaceId = yield createWorkspace(token);
            const res = yield (0, supertest_1.default)(app)
                .post('/drawings/workspace/' + workspaceId)
                .send({ title: 'Unauthorized Drawing', data: '{}' });
            (0, vitest_1.expect)([401, 403]).toContain(res.status);
        }));
    });
    (0, vitest_1.describe)('GET /drawings/workspace/:workspaceId', () => {
        (0, vitest_1.it)('should list all drawings in a workspace', () => __awaiter(void 0, void 0, void 0, function* () {
            const email = 'draw_' + Date.now() + '@example.com';
            const token = yield getToken(email, 'TestPass123!');
            const workspaceId = yield createWorkspace(token);
            yield (0, supertest_1.default)(app)
                .post('/drawings/workspace/' + workspaceId)
                .set('Authorization', 'Bearer ' + token)
                .send({ title: 'Listed Drawing', data: '{}' });
            const res = yield (0, supertest_1.default)(app)
                .get('/drawings/workspace/' + workspaceId)
                .set('Authorization', 'Bearer ' + token);
            (0, vitest_1.expect)([200, 201]).toContain(res.status);
            (0, vitest_1.expect)(Array.isArray(res.body)).toBe(true);
        }));
    });
    (0, vitest_1.describe)('PUT /drawings/:id', () => {
        (0, vitest_1.it)('should update a drawing title and data', () => __awaiter(void 0, void 0, void 0, function* () {
            const email = 'draw_' + Date.now() + '@example.com';
            const token = yield getToken(email, 'TestPass123!');
            const workspaceId = yield createWorkspace(token);
            const createRes = yield (0, supertest_1.default)(app)
                .post('/drawings/workspace/' + workspaceId)
                .set('Authorization', 'Bearer ' + token)
                .send({ title: 'Original Title', data: '{"original":true}' });
            const drawingId = createRes.body.id || '';
            const res = yield (0, supertest_1.default)(app)
                .put('/drawings/' + drawingId)
                .set('Authorization', 'Bearer ' + token)
                .send({ title: 'Updated Title', data: '{"updated":true}' });
            (0, vitest_1.expect)([200, 201]).toContain(res.status);
        }));
    });
});
(0, vitest_1.describe)('Drawing Get/Delete Routes', () => {
    (0, vitest_1.describe)('GET /drawings/:id', () => {
        (0, vitest_1.it)('should get a single drawing by id', () => __awaiter(void 0, void 0, void 0, function* () {
            const email = 'draw2_' + Date.now() + '@example.com';
            const token = yield getToken(email, 'TestPass123!');
            const workspaceId = yield createWorkspace(token);
            const createRes = yield (0, supertest_1.default)(app)
                .post('/drawings/workspace/' + workspaceId)
                .set('Authorization', 'Bearer ' + token)
                .send({ title: 'Get Test Drawing', data: '{"test":true}' });
            const drawingId = createRes.body.id || '';
            const res = yield (0, supertest_1.default)(app)
                .get('/drawings/' + drawingId)
                .set('Authorization', 'Bearer ' + token);
            (0, vitest_1.expect)([200, 201]).toContain(res.status);
            (0, vitest_1.expect)(res.body.id).toBe(drawingId);
        }));
        (0, vitest_1.it)('should return 404 for non-existent drawing', () => __awaiter(void 0, void 0, void 0, function* () {
            const email = 'draw3_' + Date.now() + '@example.com';
            const token = yield getToken(email, 'TestPass123!');
            const res = yield (0, supertest_1.default)(app)
                .get('/drawings/00000000-0000-0000-0000-000000000000')
                .set('Authorization', 'Bearer ' + token);
            (0, vitest_1.expect)([404]).toContain(res.status);
        }));
    });
    (0, vitest_1.describe)('DELETE /drawings/:id', () => {
        (0, vitest_1.it)('should delete a drawing', () => __awaiter(void 0, void 0, void 0, function* () {
            const email = 'draw4_' + Date.now() + '@example.com';
            const token = yield getToken(email, 'TestPass123!');
            const workspaceId = yield createWorkspace(token);
            const createRes = yield (0, supertest_1.default)(app)
                .post('/drawings/workspace/' + workspaceId)
                .set('Authorization', 'Bearer ' + token)
                .send({ title: 'Delete Me', data: '{}' });
            const drawingId = createRes.body.id || '';
            const res = yield (0, supertest_1.default)(app)
                .delete('/drawings/' + drawingId)
                .set('Authorization', 'Bearer ' + token);
            (0, vitest_1.expect)([200, 201]).toContain(res.status);
        }));
    });
});
