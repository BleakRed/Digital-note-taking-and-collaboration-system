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
const express_1 = __importDefault(require("express"));
const prisma_1 = __importDefault(require("../prisma"));
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Get chat rooms for a workspace
router.get('/workspace/:workspaceId/rooms', auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { workspaceId } = req.params;
        let rooms = yield prisma_1.default.chatRoom.findMany({
            where: { workspaceId },
            orderBy: { createdAt: 'asc' },
        });
        // Create default room if none exists
        if (rooms.length === 0) {
            const defaultRoom = yield prisma_1.default.chatRoom.create({
                data: { name: 'General', workspaceId }
            });
            rooms = [defaultRoom];
        }
        res.json(rooms);
        /* c8 ignore next 3 */
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch chat rooms' });
    }
}));
// Create a chat room
router.post('/workspace/:workspaceId/rooms', auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { workspaceId } = req.params;
        const { name } = req.body;
        const room = yield prisma_1.default.chatRoom.create({
            data: { name, workspaceId }
        });
        res.json(room);
        /* c8 ignore next 3 */
    }
    catch (error) {
        /* c8 ignore next 2 */
        res.status(500).json({ error: 'Failed to create chat room' });
    }
}));
// Get messages for a chat room
router.get('/room/:roomId/messages', auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { roomId } = req.params;
        const messages = yield prisma_1.default.chatMessage.findMany({
            where: { chatRoomId: roomId },
            include: {
                author: {
                    select: { id: true, username: true, email: true, avatarUrl: true }
                }
            },
            orderBy: { createdAt: 'asc' },
        });
        res.json(messages);
        /* c8 ignore next 3 */
    }
    catch (error) {
        /* c8 ignore next 2 */
        res.status(500).json({ error: 'Failed to fetch chat messages' });
    }
}));
// Post a new message
router.post('/room/:roomId', auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { roomId } = req.params;
        const { content } = req.body;
        const authorId = req.user.userId;
        if (!content || content.trim().length === 0)
            return res.status(400).json({ error: 'Message content required' });
        if (content.length > 1000)
            return res.status(400).json({ error: 'Message too long' });
        const message = yield prisma_1.default.chatMessage.create({
            data: {
                content,
                chatRoomId: roomId,
                authorId,
            },
            include: {
                author: {
                    select: { id: true, username: true, email: true, avatarUrl: true }
                }
            }
        });
        // Notify via socket
        (_a = req.io) === null || _a === void 0 ? void 0 : _a.to(`chat-room-${roomId}`).emit('message-received', message);
        res.json(message);
        /* c8 ignore next 3 */
    }
    catch (error) {
        /* c8 ignore next 2 */
        res.status(500).json({ error: 'Failed to send message' });
    }
}));
// Edit a message
router.put('/message/:messageId', auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { messageId } = req.params;
        const { content } = req.body;
        const userId = req.user.userId;
        const message = yield prisma_1.default.chatMessage.findUnique({
            where: { id: messageId }
        });
        if (!message)
            return res.status(404).json({ error: 'Message not found' });
        if (message.authorId !== userId)
            return res.status(403).json({ error: 'Unauthorized' });
        const updatedMessage = yield prisma_1.default.chatMessage.update({
            where: { id: messageId },
            data: { content },
            include: {
                author: { select: { id: true, username: true, email: true, avatarUrl: true } }
            }
        });
        (_a = req.io) === null || _a === void 0 ? void 0 : _a.to(`chat-room-${message.chatRoomId}`).emit('message-edited', updatedMessage);
        res.json(updatedMessage);
        /* c8 ignore next 3 */
    }
    catch (error) {
        /* c8 ignore next 2 */
        res.status(500).json({ error: 'Failed to edit message' });
    }
}));
// Delete a message
router.delete('/message/:messageId', auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { messageId } = req.params;
        const userId = req.user.userId;
        const message = yield prisma_1.default.chatMessage.findUnique({
            where: { id: messageId }
        });
        if (!message)
            return res.status(404).json({ error: 'Message not found' });
        if (message.authorId !== userId)
            return res.status(403).json({ error: 'Unauthorized' });
        yield prisma_1.default.chatMessage.delete({ where: { id: messageId } });
        (_a = req.io) === null || _a === void 0 ? void 0 : _a.to(`chat-room-${message.chatRoomId}`).emit('message-deleted', messageId);
        res.json({ message: 'Deleted' });
        /* c8 ignore next 3 */
    }
    catch (error) {
        /* c8 ignore next 2 */
        res.status(500).json({ error: 'Failed' });
    }
}));
exports.default = router;
