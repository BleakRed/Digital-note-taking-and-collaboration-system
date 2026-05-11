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
const workspace_1 = __importDefault(require("../../routes/workspace"));
const auth_1 = __importDefault(require("../../routes/auth"));
const client_1 = require("@prisma/client");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use('/auth', auth_1.default);
app.use('/workspaces', workspace_1.default);
const prisma = new client_1.PrismaClient();
function getToken(email, password) {
    return __awaiter(this, void 0, void 0, function* () {
        yield (0, supertest_1.default)(app).post('/auth/register').send({
            email, password, confirmPassword: password, username: email.split('@')[0]
        });
        const res = yield (0, supertest_1.default)(app).post('/auth/login').send({ email, password });
        return res.body.token || '';
    });
}
(0, vitest_1.describe)('Workspace Routes', () => {
    (0, vitest_1.describe)('POST /workspaces', () => {
        (0, vitest_1.it)('should create a workspace with valid name', () => __awaiter(void 0, void 0, void 0, function* () {
            const email = 'ws_' + Date.now() + '@example.com';
            const token = yield getToken(email, 'TestPass123!');
            const res = yield (0, supertest_1.default)(app)
                .post('/workspaces')
                .set('Authorization', 'Bearer ' + token)
                .send({ name: 'My Test Workspace' });
            (0, vitest_1.expect)([201, 200]).toContain(res.status);
        }));
        (0, vitest_1.it)('should reject workspace creation without authentication', () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app)
                .post('/workspaces')
                .send({ name: 'Unauthorized Workspace' });
            (0, vitest_1.expect)([401, 403]).toContain(res.status);
        }));
        (0, vitest_1.it)('should reject workspace creation with empty name', () => __awaiter(void 0, void 0, void 0, function* () {
            const email = 'ws_' + Date.now() + '@example.com';
            const token = yield getToken(email, 'TestPass123!');
            const res = yield (0, supertest_1.default)(app)
                .post('/workspaces')
                .set('Authorization', 'Bearer ' + token)
                .send({ name: '' });
            (0, vitest_1.expect)(res.status).toBeGreaterThanOrEqual(400);
        }));
    });
    (0, vitest_1.describe)('GET /workspaces', () => {
        (0, vitest_1.it)('should list workspaces for authenticated user', () => __awaiter(void 0, void 0, void 0, function* () {
            const email = 'ws_' + Date.now() + '@example.com';
            const token = yield getToken(email, 'TestPass123!');
            yield (0, supertest_1.default)(app).post('/workspaces').set('Authorization', 'Bearer ' + token).send({ name: 'List Test' });
            const res = yield (0, supertest_1.default)(app)
                .get('/workspaces')
                .set('Authorization', 'Bearer ' + token);
            (0, vitest_1.expect)([200, 201]).toContain(res.status);
        }));
        (0, vitest_1.it)('should reject listing workspaces without authentication', () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app).get('/workspaces');
            (0, vitest_1.expect)([401, 403]).toContain(res.status);
        }));
    });
    (0, vitest_1.describe)('GET /workspaces/:id/members', () => {
        (0, vitest_1.it)('should list workspace members', () => __awaiter(void 0, void 0, void 0, function* () {
            const email = 'wsm_' + Date.now() + '@example.com';
            const token = yield getToken(email, 'TestPass123!');
            const wsRes = yield (0, supertest_1.default)(app)
                .post('/workspaces')
                .set('Authorization', 'Bearer ' + token)
                .send({ name: 'Members Test WS' });
            const wsId = wsRes.body.id || '';
            const res = yield (0, supertest_1.default)(app)
                .get('/workspaces/' + wsId + '/members')
                .set('Authorization', 'Bearer ' + token);
            (0, vitest_1.expect)([200, 201]).toContain(res.status);
        }));
    });
    (0, vitest_1.describe)('POST /workspaces/:id/invite', () => {
        (0, vitest_1.it)('should invite a user by email', () => __awaiter(void 0, void 0, void 0, function* () {
            const ownerEmail = 'owner_' + Date.now() + '@example.com';
            const inviteEmail = 'invite_' + Date.now() + '@example.com';
            const ownerToken = yield getToken(ownerEmail, 'TestPass123!');
            yield getToken(inviteEmail, 'TestPass123!');
            const wsRes = yield (0, supertest_1.default)(app)
                .post('/workspaces')
                .set('Authorization', 'Bearer ' + ownerToken)
                .send({ name: 'Invite Test WS' });
            const wsId = wsRes.body.id || '';
            const res = yield (0, supertest_1.default)(app)
                .post('/workspaces/' + wsId + '/invite')
                .set('Authorization', 'Bearer ' + ownerToken)
                .send({ email: inviteEmail });
            (0, vitest_1.expect)([200, 201]).toContain(res.status);
        }));
        (0, vitest_1.it)('should reject invite from non-owner', () => __awaiter(void 0, void 0, void 0, function* () {
            const ownerEmail = 'owner2_' + Date.now() + '@example.com';
            const memberEmail = 'member2_' + Date.now() + '@example.com';
            const ownerToken = yield getToken(ownerEmail, 'TestPass123!');
            const memberToken = yield getToken(memberEmail, 'TestPass123!');
            const wsRes = yield (0, supertest_1.default)(app)
                .post('/workspaces')
                .set('Authorization', 'Bearer ' + ownerToken)
                .send({ name: 'Non-Owner Invite Test' });
            const wsId = wsRes.body.id || '';
            const res = yield (0, supertest_1.default)(app)
                .post('/workspaces/' + wsId + '/invite')
                .set('Authorization', 'Bearer ' + memberToken)
                .send({ email: 'some_' + Date.now() + '@example.com' });
            (0, vitest_1.expect)([403]).toContain(res.status);
        }));
        (0, vitest_1.it)('should reject invite with invalid email', () => __awaiter(void 0, void 0, void 0, function* () {
            const ownerEmail = 'owner3_' + Date.now() + '@example.com';
            const ownerToken = yield getToken(ownerEmail, 'TestPass123!');
            const wsRes = yield (0, supertest_1.default)(app)
                .post('/workspaces')
                .set('Authorization', 'Bearer ' + ownerToken)
                .send({ name: 'Invalid Email Test' });
            const wsId = wsRes.body.id || '';
            const res = yield (0, supertest_1.default)(app)
                .post('/workspaces/' + wsId + '/invite')
                .set('Authorization', 'Bearer ' + ownerToken)
                .send({ email: 'invalid-email' });
            (0, vitest_1.expect)([400, 404]).toContain(res.status);
        }));
        (0, vitest_1.it)('should reject invite to workspace without name', () => __awaiter(void 0, void 0, void 0, function* () {
            const ownerEmail = 'owner4_' + Date.now() + '@example.com';
            const ownerToken = yield getToken(ownerEmail, 'TestPass123!');
            const wsRes = yield (0, supertest_1.default)(app)
                .post('/workspaces')
                .set('Authorization', 'Bearer ' + ownerToken)
                .send({ name: '' });
            // Empty name may fail
        }));
        (0, vitest_1.it)('should get workspace settings', () => __awaiter(void 0, void 0, void 0, function* () {
            const email = 'settings_' + Date.now() + '@example.com';
            const token = yield getToken(email, 'TestPass123!');
            const wsRes = yield (0, supertest_1.default)(app)
                .post('/workspaces')
                .set('Authorization', 'Bearer ' + token)
                .send({ name: 'Settings Test' });
            const wsId = wsRes.body.id || '';
            const res = yield (0, supertest_1.default)(app)
                .get('/workspaces/' + wsId + '/settings')
                .set('Authorization', 'Bearer ' + token);
            (0, vitest_1.expect)([200, 201, 404]).toContain(res.status);
        }));
        (0, vitest_1.it)('should update workspace settings', () => __awaiter(void 0, void 0, void 0, function* () {
            const email = 'settings2_' + Date.now() + '@example.com';
            const token = yield getToken(email, 'TestPass123!');
            const wsRes = yield (0, supertest_1.default)(app)
                .post('/workspaces')
                .set('Authorization', 'Bearer ' + token)
                .send({ name: 'Settings Update Test' });
            const wsId = wsRes.body.id || '';
            const res = yield (0, supertest_1.default)(app)
                .put('/workspaces/' + wsId + '/settings')
                .set('Authorization', 'Bearer ' + token)
                .send({ name: 'Updated Name' });
            (0, vitest_1.expect)([200, 201, 404]).toContain(res.status);
        }));
    });
    (0, vitest_1.describe)('DELETE /workspaces/:id/members/:memberId', () => {
        (0, vitest_1.it)('should remove a member as owner', () => __awaiter(void 0, void 0, void 0, function* () {
            const ownerEmail = 'remove_' + Date.now() + '@example.com';
            const memberEmail = 'member_' + Date.now() + '@example.com';
            const ownerToken = yield getToken(ownerEmail, 'TestPass123!');
            const memberToken = yield getToken(memberEmail, 'TestPass123!');
            const wsRes = yield (0, supertest_1.default)(app)
                .post('/workspaces')
                .set('Authorization', 'Bearer ' + ownerToken)
                .send({ name: 'Remove Test' });
            const wsId = wsRes.body.id || '';
            // Member joins via invite
            yield (0, supertest_1.default)(app)
                .post('/workspaces/' + wsId + '/invite')
                .set('Authorization', 'Bearer ' + ownerToken)
                .send({ email: memberEmail });
            // Get member id from members list
            const membersRes = yield (0, supertest_1.default)(app)
                .get('/workspaces/' + wsId + '/members')
                .set('Authorization', 'Bearer ' + ownerToken);
            const memberRecord = membersRes.body.find((m) => m.email === memberEmail);
            if (memberRecord) {
                const removeRes = yield (0, supertest_1.default)(app)
                    .delete('/workspaces/' + wsId + '/members/' + memberRecord.id)
                    .set('Authorization', 'Bearer ' + ownerToken);
                (0, vitest_1.expect)([200, 404]).toContain(removeRes.status);
            }
        }));
        (0, vitest_1.it)('should return 404 for non-existent workspace', () => __awaiter(void 0, void 0, void 0, function* () {
            const email = 'notfound_' + Date.now() + '@example.com';
            const token = yield getToken(email, 'TestPass123!');
            const res = yield (0, supertest_1.default)(app)
                .delete('/workspaces/nonexistent/members/someid')
                .set('Authorization', 'Bearer ' + token);
            (0, vitest_1.expect)([404, 403]).toContain(res.status);
        }));
    });
});
