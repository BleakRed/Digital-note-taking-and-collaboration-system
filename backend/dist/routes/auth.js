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
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const auth_1 = require("../middleware/auth");
const crypto_1 = __importDefault(require("crypto"));
const mailer_1 = require("../utils/mailer");
const prisma = new client_1.PrismaClient();
const router = (0, express_1.Router)();
const JWT_SECRET = process.env.JWT_SECRET || 'secret';
router.post('/register', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password, confirmPassword, firstName, lastName } = req.body;
        if (!email || !password)
            return res.status(400).json({ error: 'Email and password required' });
        if (password !== confirmPassword)
            return res.status(400).json({ error: 'Passwords do not match' });
        const existingEmail = yield prisma.user.findUnique({ where: { email } });
        if (existingEmail)
            return res.status(400).json({ error: 'Email already exists' });
        const verificationToken = crypto_1.default.randomBytes(32).toString('hex');
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        const user = yield prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name: `${firstName || ''} ${lastName || ''}`.trim(),
                verificationToken
            }
        });
        try {
            yield (0, mailer_1.sendVerificationEmail)(user.email, verificationToken);
        }
        catch (mailError) {
            console.error('Failed to send verification email:', mailError);
            // We don't fail registration if email fails, but maybe we should or at least inform the user
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1d' });
        res.json({ token, user: { id: user.id, email: user.email, name: user.name, username: user.username, avatarUrl: user.avatarUrl, isVerified: user.isVerified } });
        /* c8 ignore next 3 */
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
}));
router.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        if (!email || !password)
            return res.status(400).json({ error: 'Email and password required' });
        const user = yield prisma.user.findUnique({ where: { email } });
        if (!user)
            return res.status(400).json({ error: 'Invalid credentials' });
        const valid = yield bcryptjs_1.default.compare(password, user.password);
        if (!valid)
            return res.status(400).json({ error: 'Invalid credentials' });
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1d' });
        res.json({ token, user: { id: user.id, email: user.email, name: user.name, username: user.username, avatarUrl: user.avatarUrl, isVerified: user.isVerified } });
        /* c8 ignore next 3 */
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
}));
router.post('/forgot-password', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        const user = yield prisma.user.findUnique({ where: { email } });
        if (!user)
            return res.status(404).json({ error: 'User not found' });
        const resetToken = crypto_1.default.randomBytes(32).toString('hex');
        const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour
        yield prisma.user.update({
            where: { id: user.id },
            data: { resetToken, resetTokenExpiry }
        });
        try {
            yield (0, mailer_1.sendPasswordResetEmail)(user.email, resetToken);
        }
        catch (mailError) {
            console.error('Failed to send reset email:', mailError);
            return res.status(500).json({ error: 'Failed to send reset email. Please try again later.' });
        }
        res.json({ message: 'Password reset link sent to your email' });
        /* c8 ignore next 3 */
    }
    catch (error) {
        /* c8 ignore next 3 */
        console.error('Reset email error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}));
router.post('/reset-password', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token, password } = req.body;
        const user = yield prisma.user.findFirst({
            where: {
                resetToken: token,
                resetTokenExpiry: { gt: new Date() }
            }
        });
        if (!user)
            return res.status(400).json({ error: 'Invalid or expired token' });
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        yield prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetToken: null,
                resetTokenExpiry: null
            }
        });
        res.json({ message: 'Password reset successful' });
        /* c8 ignore next 3 */
    }
    catch (error) {
        /* c8 ignore next 2 */
        res.status(500).json({ error: 'Internal server error' });
    }
}));
router.get('/verify-email', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token } = req.query;
        const user = yield prisma.user.findFirst({
            where: { verificationToken: token }
        });
        if (!user)
            return res.status(400).json({ error: 'Invalid verification token' });
        yield prisma.user.update({
            where: { id: user.id },
            data: {
                isVerified: true,
                verificationToken: null
            }
        });
        res.json({ message: 'Email verified successfully' });
        /* c8 ignore next 3 */
    }
    catch (error) {
        /* c8 ignore next 2 */
        res.status(500).json({ error: 'Internal server error' });
    }
}));
router.put('/profile', auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.userId;
        const { username, avatarUrl, name, removeAvatar } = req.body;
        if (username) {
            const existingUser = yield prisma.user.findUnique({ where: { username } });
            if (existingUser && existingUser.id !== userId) {
                return res.status(400).json({ error: 'Username already exists' });
            }
        }
        const user = yield prisma.user.update({
            where: { id: userId },
            data: {
                username,
                avatarUrl: removeAvatar ? null : avatarUrl,
                name
            },
            include: { memberships: true }
        });
        const updatedData = {
            id: user.id,
            email: user.email,
            name: user.name,
            username: user.username,
            avatarUrl: user.avatarUrl,
            isVerified: user.isVerified
        };
        // Notify all workspaces the user belongs to
        user.memberships.forEach(m => {
            req.io.to(`chat-${m.workspaceId}`).emit('member-updated', updatedData);
        });
        res.json(updatedData);
        /* c8 ignore next 3 */
    }
    catch (error) {
        /* c8 ignore next 3 */
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
}));
exports.default = router;
