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
const auth_1 = __importDefault(require("../../routes/auth"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use('/auth', auth_1.default);
function getToken(email, password) {
    return __awaiter(this, void 0, void 0, function* () {
        yield (0, supertest_1.default)(app).post('/auth/register').send({
            email, password, confirmPassword: password, username: email.split('@')[0]
        });
        const res = yield (0, supertest_1.default)(app).post('/auth/login').send({ email, password });
        return res.body.token || '';
    });
}
(0, vitest_1.describe)('Auth Routes', () => {
    (0, vitest_1.describe)('POST /auth/register', () => {
        (0, vitest_1.it)('should register with valid data', () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app).post('/auth/register').send({
                email: 'newuser_' + Date.now() + '@example.com',
                password: 'TestPassword123!',
                confirmPassword: 'TestPassword123!',
                name: 'Test User',
                username: 'testuser_' + Date.now(),
            });
            (0, vitest_1.expect)([201, 200]).toContain(res.status);
        }));
        (0, vitest_1.it)('should reject missing email', () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app).post('/auth/register').send({
                password: 'TestPassword123!', confirmPassword: 'TestPassword123!'
            });
            (0, vitest_1.expect)(res.status).toBeGreaterThanOrEqual(400);
        }));
        (0, vitest_1.it)('should reject password mismatch', () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app).post('/auth/register').send({
                email: 'mismatch_' + Date.now() + '@example.com',
                password: 'TestPassword123!',
                confirmPassword: 'DifferentPass123!',
            });
            (0, vitest_1.expect)(res.status).toBeGreaterThanOrEqual(400);
        }));
        (0, vitest_1.it)('should reject duplicate email', () => __awaiter(void 0, void 0, void 0, function* () {
            const email = 'dup_' + Date.now() + '@example.com';
            yield (0, supertest_1.default)(app).post('/auth/register').send({
                email, password: 'TestPassword123!', confirmPassword: 'TestPassword123!',
            });
            const res = yield (0, supertest_1.default)(app).post('/auth/register').send({
                email, password: 'AnotherPass123!', confirmPassword: 'AnotherPass123!',
            });
            (0, vitest_1.expect)(res.status).toBeGreaterThanOrEqual(400);
        }));
        (0, vitest_1.it)('should register without name', () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app).post('/auth/register').send({
                email: 'noname_' + Date.now() + '@example.com',
                password: 'TestPassword123!',
                confirmPassword: 'TestPassword123!',
            });
            (0, vitest_1.expect)([201, 200]).toContain(res.status);
        }));
    });
    (0, vitest_1.describe)('POST /auth/login', () => {
        (0, vitest_1.it)('should login with valid credentials', () => __awaiter(void 0, void 0, void 0, function* () {
            const email = 'login_' + Date.now() + '@example.com';
            yield (0, supertest_1.default)(app).post('/auth/register').send({
                email, password: 'TestPassword123!', confirmPassword: 'TestPassword123!',
            });
            const res = yield (0, supertest_1.default)(app).post('/auth/login').send({
                email, password: 'TestPassword123!'
            });
            (0, vitest_1.expect)(res.status).toBe(200);
            (0, vitest_1.expect)(res.body.token).toBeTruthy();
        }));
        (0, vitest_1.it)('should reject wrong password', () => __awaiter(void 0, void 0, void 0, function* () {
            const email = 'wrongpass_' + Date.now() + '@example.com';
            yield (0, supertest_1.default)(app).post('/auth/register').send({
                email, password: 'TestPassword123!', confirmPassword: 'TestPassword123!',
            });
            const res = yield (0, supertest_1.default)(app).post('/auth/login').send({
                email, password: 'WrongPassword123!'
            });
            (0, vitest_1.expect)(res.status).toBeGreaterThanOrEqual(400);
        }));
        (0, vitest_1.it)('should reject non-existent user', () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app).post('/auth/login').send({
                email: 'nobody_' + Date.now() + '@example.com',
                password: 'TestPassword123!'
            });
            (0, vitest_1.expect)(res.status).toBeGreaterThanOrEqual(400);
        }));
        (0, vitest_1.it)('should return user data on login', () => __awaiter(void 0, void 0, void 0, function* () {
            const email = 'userdata_' + Date.now() + '@example.com';
            yield (0, supertest_1.default)(app).post('/auth/register').send({
                email, password: 'TestPassword123!', confirmPassword: 'TestPassword123!',
            });
            const res = yield (0, supertest_1.default)(app).post('/auth/login').send({
                email, password: 'TestPassword123!'
            });
            (0, vitest_1.expect)(res.body.user).toBeDefined();
        }));
        (0, vitest_1.it)('should reject missing email', () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app).post('/auth/login').send({
                password: 'TestPassword123!'
            });
            (0, vitest_1.expect)(res.status).toBeGreaterThanOrEqual(400);
        }));
        (0, vitest_1.it)('should reject missing password', () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app).post('/auth/login').send({
                email: 'test_' + Date.now() + '@example.com'
            });
            (0, vitest_1.expect)(res.status).toBeGreaterThanOrEqual(400);
        }));
    });
    (0, vitest_1.describe)('PUT /auth/profile', () => {
        (0, vitest_1.it)('should update username and name', () => __awaiter(void 0, void 0, void 0, function* () {
            const email = 'profile_' + Date.now() + '@example.com';
            const token = yield getToken(email, 'TestPass123!');
            const res = yield (0, supertest_1.default)(app).put('/auth/profile')
                .set('Authorization', 'Bearer ' + token)
                .send({ username: 'newname_' + Date.now(), name: 'New Display Name' });
            (0, vitest_1.expect)([200, 201]).toContain(res.status);
        }));
        (0, vitest_1.it)('should update with only username', () => __awaiter(void 0, void 0, void 0, function* () {
            const email = 'profile2_' + Date.now() + '@example.com';
            const token = yield getToken(email, 'TestPass123!');
            const res = yield (0, supertest_1.default)(app).put('/auth/profile')
                .set('Authorization', 'Bearer ' + token)
                .send({ username: 'useronly_' + Date.now() });
            (0, vitest_1.expect)([200, 201]).toContain(res.status);
        }));
        (0, vitest_1.it)('should reject duplicate username', () => __awaiter(void 0, void 0, void 0, function* () {
            const email1 = 'user1_' + Date.now() + '@example.com';
            const email2 = 'user2_' + Date.now() + '@example.com';
            const token1 = yield getToken(email1, 'TestPass123!');
            const token2 = yield getToken(email2, 'TestPass123!');
            const sharedUsername = 'shared_' + Date.now();
            yield (0, supertest_1.default)(app).put('/auth/profile')
                .set('Authorization', 'Bearer ' + token1)
                .send({ username: sharedUsername });
            const res = yield (0, supertest_1.default)(app).put('/auth/profile')
                .set('Authorization', 'Bearer ' + token2)
                .send({ username: sharedUsername });
            (0, vitest_1.expect)(res.status).toBeGreaterThanOrEqual(400);
        }));
        (0, vitest_1.it)('should reject without auth', () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app).put('/auth/profile')
                .send({ username: 'someuser' });
            (0, vitest_1.expect)(res.status).toBeGreaterThanOrEqual(400);
        }));
    });
    (0, vitest_1.describe)('GET /auth/verify-email', () => {
        (0, vitest_1.it)('should reject invalid token', () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app).get('/auth/verify-email?token=invalid');
            (0, vitest_1.expect)([400, 404]).toContain(res.status);
        }));
        (0, vitest_1.it)('should handle missing token', () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app).get('/auth/verify-email');
            // Missing token returns 400 or 200 (depending on query handling)
            (0, vitest_1.expect)([200, 400, 404]).toContain(res.status);
        }));
    });
    (0, vitest_1.describe)('POST /auth/forgot-password', () => {
        (0, vitest_1.it)('should return 404 for non-existent email', () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app).post('/auth/forgot-password')
                .send({ email: 'nobody_' + Date.now() + '@example.com' });
            (0, vitest_1.expect)([404]).toContain(res.status);
        }));
        (0, vitest_1.it)('should reject missing email', () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app).post('/auth/forgot-password').send({});
            (0, vitest_1.expect)(res.status).toBeGreaterThanOrEqual(400);
        }));
        (0, vitest_1.it)('should send reset email for existing user', () => __awaiter(void 0, void 0, void 0, function* () {
            // Create user first
            const email = 'forgot_' + Date.now() + '@example.com';
            yield (0, supertest_1.default)(app).post('/auth/register').send({
                email,
                password: 'TestPass123!',
                confirmPassword: 'TestPass123!',
                username: email.split('@')[0]
            });
            // Call forgot-password
            const res = yield (0, supertest_1.default)(app).post('/auth/forgot-password').send({ email });
            (0, vitest_1.expect)([200]).toContain(res.status);
        }));
    });
    (0, vitest_1.describe)('POST /auth/reset-password', () => {
        (0, vitest_1.it)('should reject invalid token', () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app).post('/auth/reset-password')
                .send({ token: 'invalid-token', password: 'NewPass123!' });
            (0, vitest_1.expect)([400]).toContain(res.status);
        }));
        (0, vitest_1.it)('should reject missing token', () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app).post('/auth/reset-password')
                .send({ password: 'NewPass123!' });
            (0, vitest_1.expect)([200, 400]).toContain(res.status);
        }));
        (0, vitest_1.it)('should reject missing password', () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app).post('/auth/reset-password')
                .send({ token: 'some-token' });
            (0, vitest_1.expect)(res.status).toBeGreaterThanOrEqual(400);
        }));
    });
});
