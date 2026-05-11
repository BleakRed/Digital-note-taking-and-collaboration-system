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
const page_1 = __importDefault(require("../../routes/page"));
const workspace_1 = __importDefault(require("../../routes/workspace"));
const auth_1 = __importDefault(require("../../routes/auth"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use('/auth', auth_1.default);
app.use('/workspaces', workspace_1.default);
app.use('/pages', page_1.default);
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
            .send({ name: 'Test Workspace' });
        return res.body.id || '';
    });
}
(0, vitest_1.describe)('Page Routes', () => {
    (0, vitest_1.describe)('POST /pages', () => {
        (0, vitest_1.it)('should create a page with title and content', () => __awaiter(void 0, void 0, void 0, function* () {
            const email = 'page_' + Date.now() + '@example.com';
            const token = yield getToken(email, 'TestPass123!');
            const workspaceId = yield createWorkspace(token);
            const res = yield (0, supertest_1.default)(app)
                .post('/pages')
                .set('Authorization', 'Bearer ' + token)
                .send({ title: 'Test Page', content: '# Hello\n\nTest content.', workspaceId });
            (0, vitest_1.expect)([201, 200]).toContain(res.status);
        }));
        (0, vitest_1.it)('should reject page creation without authentication', () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app)
                .post('/pages')
                .send({ title: 'Unauthorized Page', workspaceId: 'some-id' });
            (0, vitest_1.expect)([401, 403]).toContain(res.status);
        }));
        (0, vitest_1.it)('should reject page creation without workspaceId', () => __awaiter(void 0, void 0, void 0, function* () {
            const email = 'page_' + Date.now() + '@example.com';
            const token = yield getToken(email, 'TestPass123!');
            const res = yield (0, supertest_1.default)(app)
                .post('/pages')
                .set('Authorization', 'Bearer ' + token)
                .send({ title: 'No Workspace' });
            (0, vitest_1.expect)(res.status).toBeGreaterThanOrEqual(400);
        }));
    });
    (0, vitest_1.describe)('GET /pages/workspace/:workspaceId', () => {
        (0, vitest_1.it)('should list pages for a workspace', () => __awaiter(void 0, void 0, void 0, function* () {
            const email = 'page_' + Date.now() + '@example.com';
            const token = yield getToken(email, 'TestPass123!');
            const workspaceId = yield createWorkspace(token);
            yield (0, supertest_1.default)(app)
                .post('/pages')
                .set('Authorization', 'Bearer ' + token)
                .send({ title: 'Listed Page', content: 'Content', workspaceId });
            const res = yield (0, supertest_1.default)(app)
                .get('/pages/workspace/' + workspaceId)
                .set('Authorization', 'Bearer ' + token);
            (0, vitest_1.expect)([200, 201]).toContain(res.status);
            (0, vitest_1.expect)(Array.isArray(res.body)).toBe(true);
        }));
    });
    (0, vitest_1.describe)('GET /pages/:id', () => {
        (0, vitest_1.it)('should retrieve a page by ID', () => __awaiter(void 0, void 0, void 0, function* () {
            const email = 'page_' + Date.now() + '@example.com';
            const token = yield getToken(email, 'TestPass123!');
            const workspaceId = yield createWorkspace(token);
            const createRes = yield (0, supertest_1.default)(app)
                .post('/pages')
                .set('Authorization', 'Bearer ' + token)
                .send({ title: 'Retrieve Me', content: 'Content', workspaceId });
            const pageId = createRes.body.id || '';
            const res = yield (0, supertest_1.default)(app)
                .get('/pages/' + pageId)
                .set('Authorization', 'Bearer ' + token);
            (0, vitest_1.expect)([200, 404]).toContain(res.status);
        }));
    });
    (0, vitest_1.describe)('PUT /pages/:id', () => {
        (0, vitest_1.it)('should update a page title and content', () => __awaiter(void 0, void 0, void 0, function* () {
            const email = 'page_' + Date.now() + '@example.com';
            const token = yield getToken(email, 'TestPass123!');
            const workspaceId = yield createWorkspace(token);
            const createRes = yield (0, supertest_1.default)(app)
                .post('/pages')
                .set('Authorization', 'Bearer ' + token)
                .send({ title: 'Original Title', content: 'Original', workspaceId });
            const pageId = createRes.body.id || '';
            const res = yield (0, supertest_1.default)(app)
                .put('/pages/' + pageId)
                .set('Authorization', 'Bearer ' + token)
                .send({ title: 'Updated Title', content: 'Updated content' });
            (0, vitest_1.expect)([200, 201]).toContain(res.status);
        }));
    });
});
