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
// Get boards for a workspace
router.get('/workspace/:workspaceId', auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { workspaceId } = req.params;
        const boards = yield prisma_1.default.kanbanBoard.findMany({
            where: { workspaceId },
            orderBy: { createdAt: 'desc' },
        });
        res.json(boards);
        /* c8 ignore next 3 */
        /* c8 ignore next 2 */
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch boards' });
    }
}));
// Create a board
router.post('/workspace/:workspaceId', auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { workspaceId } = req.params;
        const { title } = req.body;
        const board = yield prisma_1.default.kanbanBoard.create({
            data: {
                title,
                workspaceId,
                columns: {
                    create: [
                        { title: 'To Do', order: 0, color: '#ef4444' }, // Red
                        { title: 'In Progress', order: 1, color: '#f59e0b' }, // Yellow
                        { title: 'Done', order: 2, color: '#10b981' }, // Green
                    ]
                }
            },
            include: {
                columns: {
                    include: {
                        cards: true
                    }
                }
            }
        });
        res.json(board);
        /* c8 ignore next 3 */
        /* c8 ignore next 2 */
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create board' });
    }
}));
// Update a board title
router.put('/board/:boardId', auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { boardId } = req.params;
        const { title } = req.body;
        if (!(title === null || title === void 0 ? void 0 : title.trim()))
            return res.status(400).json({ error: 'Title required' });
        // Check workspace ownership
        const board = yield prisma_1.default.kanbanBoard.findUnique({ where: { id: boardId }, include: { workspace: true } });
        if (!board)
            return res.status(404).json({ error: 'Board not found' });
        if (board.workspace.ownerId !== ((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId))
            return res.status(403).json({ error: 'Only workspace owner can rename boards' });
        const updated = yield prisma_1.default.kanbanBoard.update({
            where: { id: boardId },
            data: { title: title.trim() }
        });
        res.json(updated);
        /* c8 ignore next 2 */
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to update board' });
    }
}));
// Get a board with columns and cards
router.get('/board/:boardId', auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { boardId } = req.params;
        const board = yield prisma_1.default.kanbanBoard.findUnique({
            where: { id: boardId },
            include: {
                columns: {
                    orderBy: { order: 'asc' },
                    include: {
                        cards: {
                            orderBy: { order: 'asc' },
                            include: {
                                author: {
                                    select: { id: true, username: true, email: true, avatarUrl: true }
                                },
                                assignees: {
                                    select: { id: true, username: true, email: true, avatarUrl: true }
                                }
                            }
                        }
                    }
                }
            }
        });
        res.json(board);
        /* c8 ignore next 3 */
        /* c8 ignore next 2 */
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch board details' });
    }
}));
// Toggle a card assignment for a user
router.put('/cards/:cardId/assign', auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { cardId } = req.params;
        const { userId } = req.body;
        // Find current assignees
        const currentCard = yield prisma_1.default.kanbanCard.findUnique({
            where: { id: cardId },
            include: { assignees: true }
        });
        if (!currentCard)
            return res.status(404).json({ error: 'Card not found' });
        const isAssigned = currentCard.assignees.some(u => u.id === userId);
        const card = yield prisma_1.default.kanbanCard.update({
            where: { id: cardId },
            data: {
                assignees: isAssigned
                    ? { disconnect: { id: userId } }
                    : { connect: { id: userId } }
            },
            include: {
                assignees: {
                    select: { id: true, username: true, email: true, avatarUrl: true }
                }
            }
        });
        res.json(card);
        /* c8 ignore next 3 */
        /* c8 ignore next 2 */
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to assign card' });
    }
}));
// Create a card
router.post('/columns/:columnId/cards', auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { columnId } = req.params;
        const { content, description } = req.body;
        const authorId = req.user.userId;
        // Get max order
        const lastCard = yield prisma_1.default.kanbanCard.findFirst({
            where: { columnId },
            orderBy: { order: 'desc' }
        });
        const order = lastCard ? lastCard.order + 1 : 0;
        const card = yield prisma_1.default.kanbanCard.create({
            data: {
                content,
                description,
                columnId,
                authorId,
                order
            },
            include: {
                author: {
                    select: { id: true, username: true, email: true, avatarUrl: true }
                },
                assignees: {
                    select: { id: true, username: true, email: true, avatarUrl: true }
                }
            }
        });
        res.json(card);
        /* c8 ignore next 3 */
        /* c8 ignore next 2 */
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create card' });
    }
}));
// Update a card (content, description, column, or order)
router.put('/cards/:cardId', auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { cardId } = req.params;
        const { content, description, columnId, order } = req.body;
        const card = yield prisma_1.default.kanbanCard.update({
            where: { id: cardId },
            data: {
                content,
                description,
                columnId,
                order
            }
        });
        res.json(card);
        /* c8 ignore next 3 */
        /* c8 ignore next 2 */
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update card' });
    }
}));
// Update column (title or color)
router.put('/columns/:columnId', auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { columnId } = req.params;
        const { title, color } = req.body;
        const userId = req.user.userId;
        const column = yield prisma_1.default.kanbanColumn.findUnique({
            where: { id: columnId },
            include: { board: { include: { workspace: true } } }
        });
        if (!column)
            return res.status(404).json({ error: 'Column not found' });
        if (column.board.workspace.ownerId !== userId) {
            return res.status(403).json({ error: 'Only the workspace owner can edit columns' });
        }
        const updatedColumn = yield prisma_1.default.kanbanColumn.update({
            where: { id: columnId },
            data: { title, color }
        });
        res.json(updatedColumn);
        /* c8 ignore next 3 */
        /* c8 ignore next 2 */
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update column' });
    }
}));
// Delete a column (owner only)
router.delete('/columns/:columnId', auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { columnId } = req.params;
        const userId = req.user.userId;
        const column = yield prisma_1.default.kanbanColumn.findUnique({
            where: { id: columnId },
            include: { board: { include: { workspace: true } } }
        });
        if (!column)
            return res.status(404).json({ error: 'Column not found' });
        if (column.board.workspace.ownerId !== userId)
            return res.status(403).json({ error: 'Only the workspace owner can delete columns' });
        yield prisma_1.default.kanbanColumn.delete({ where: { id: columnId } });
        res.json({ message: 'Column deleted' });
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to delete column' });
    }
}));
// Delete a card
router.delete('/cards/:cardId', auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { cardId } = req.params;
        yield prisma_1.default.kanbanCard.delete({
            where: { id: cardId }
        });
        res.json({ message: 'Card deleted' });
        /* c8 ignore next 3 */
        /* c8 ignore next 2 */
    }
    catch (error) {
        /* c8 ignore next 2 */
        res.status(500).json({ error: 'Failed to delete card' });
    }
}));
// Create a column
router.post('/board/:boardId/columns', auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { boardId } = req.params;
        const { title, color } = req.body;
        const lastColumn = yield prisma_1.default.kanbanColumn.findFirst({
            where: { boardId },
            orderBy: { order: 'desc' }
        });
        const order = lastColumn ? lastColumn.order + 1 : 0;
        const column = yield prisma_1.default.kanbanColumn.create({
            data: {
                title,
                boardId,
                order,
                color: color || '#3b82f6'
            }
        });
        res.json(column);
        /* c8 ignore next 3 */
        /* c8 ignore next 2 */
    }
    catch (error) {
        /* c8 ignore next 2 */
        res.status(500).json({ error: 'Failed to create column' });
    }
}));
// Reorder a column within a board (owner only)
router.put('/columns/:columnId/reorder', auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { columnId } = req.params;
        const { targetColumnId } = req.body;
        const userId = req.user.userId;
        const column = yield prisma_1.default.kanbanColumn.findUnique({
            where: { id: columnId },
            include: { board: { include: { workspace: true } } }
        });
        if (!column)
            return res.status(404).json({ error: 'Column not found' });
        if (column.board.workspace.ownerId !== userId)
            return res.status(403).json({ error: 'Only the workspace owner can reorder columns' });
        const cols = yield prisma_1.default.kanbanColumn.findMany({
            where: { boardId: column.boardId },
            orderBy: { order: 'asc' }
        });
        const srcIdx = cols.findIndex(c => c.id === columnId);
        const tgtIdx = cols.findIndex(c => c.id === targetColumnId);
        if (srcIdx < 0 || tgtIdx < 0)
            return res.status(400).json({ error: 'Invalid column ids' });
        const [moved] = cols.splice(srcIdx, 1);
        cols.splice(tgtIdx, 0, moved);
        yield Promise.all(cols.map((c, i) => prisma_1.default.kanbanColumn.update({ where: { id: c.id }, data: { order: i } })));
        res.json({ message: 'Column reordered' });
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to reorder column' });
    }
}));
exports.default = router;
