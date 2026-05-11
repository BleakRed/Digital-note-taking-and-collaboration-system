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
// Middleware to check if user is admin
const requireAdmin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.userId;
    const user = yield prisma_1.default.user.findUnique({ where: { id: userId } });
    if (!user || user.email !== 'admin@example.com') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
});
// Get all users (admin only) - with pagination and sorting
router.get('/users', auth_1.authenticateToken, requireAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const sortBy = req.query.sortBy || 'createdAt';
        const sortOrder = req.query.sortOrder === 'asc' ? 'asc' : 'desc';
        // Map sortBy to Prisma orderBy
        const orderBy = {};
        if (['username', 'email', 'isVerified', 'createdAt'].includes(sortBy)) {
            orderBy[sortBy] = sortOrder;
        }
        else {
            orderBy.createdAt = 'desc';
        }
        const [users, total] = yield Promise.all([
            prisma_1.default.user.findMany({
                select: {
                    id: true,
                    email: true,
                    username: true,
                    name: true,
                    isVerified: true,
                    createdAt: true,
                    updatedAt: true
                },
                orderBy,
                skip,
                take: limit
            }),
            prisma_1.default.user.count()
        ]);
        res.json({
            users,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
}));
// Update user (admin only)
router.put('/users/:id', auth_1.authenticateToken, requireAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, isVerified } = req.body;
        const user = yield prisma_1.default.user.update({
            where: { id: req.params.id },
            data: Object.assign(Object.assign({}, (username && { username })), (isVerified !== undefined && { isVerified })),
            select: {
                id: true,
                email: true,
                username: true,
                name: true,
                isVerified: true,
                createdAt: true,
                updatedAt: true
            }
        });
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update user' });
    }
}));
// Get user by ID (admin only)
router.get('/users/:id', auth_1.authenticateToken, requireAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield prisma_1.default.user.findUnique({
            where: { id: req.params.id },
            select: {
                id: true,
                email: true,
                username: true,
                name: true,
                isVerified: true,
                createdAt: true,
                updatedAt: true,
                memberships: {
                    include: {
                        workspace: true
                    }
                }
            }
        });
        if (!user)
            return res.status(404).json({ error: 'User not found' });
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch user' });
    }
}));
// Delete unverified users older than 1 month (admin only)
router.delete('/users/unverified', auth_1.authenticateToken, requireAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        const usersToDelete = yield prisma_1.default.user.findMany({
            where: {
                isVerified: false,
                createdAt: { lt: oneMonthAgo.toISOString() }
            }
        });
        if (usersToDelete.length === 0) {
            res.json({ message: 'No unverified users older than 1 month', deletedCount: 0 });
            return;
        }
        for (const user of usersToDelete) {
            // Delete related data first
            yield Promise.all([
                prisma_1.default.chatMessage.deleteMany({ where: { authorId: user.id } }),
                prisma_1.default.page.deleteMany({ where: { authorId: user.id } }),
                prisma_1.default.drawing.deleteMany({ where: { authorId: user.id } }),
                prisma_1.default.kanbanCard.deleteMany({ where: { authorId: user.id } }),
            ]);
            // Delete workspaces owned by user first
            yield prisma_1.default.workspace.deleteMany({ where: { ownerId: user.id } });
            // Remove user from workspace members
            yield prisma_1.default.workspaceMember.deleteMany({ where: { userId: user.id } });
            // Finally delete the user
            yield prisma_1.default.user.delete({ where: { id: user.id } });
        }
        res.json({ message: 'Unverified users deleted', deletedCount: usersToDelete.length });
    }
    catch (error) {
        console.error('Delete unverified users error:', error);
        res.status(500).json({ error: 'Failed to delete unverified users' });
    }
}));
// Delete orphan workspaces (no members, admin only)
router.delete('/workspaces/orphan', auth_1.authenticateToken, requireAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Find workspaces with no members and no owner
        const orphanWorkspaces = yield prisma_1.default.workspace.findMany({
            where: {
                members: { none: {} },
                ownerId: { not: '' }
            },
            include: {
                _count: { select: { pages: true, drawings: true, kanbanBoards: true } }
            }
        });
        // Also find workspaces where owner doesn't exist
        const allWorkspaces = yield prisma_1.default.workspace.findMany({
            include: {
                owner: true,
                _count: { select: { members: true, pages: true, drawings: true, kanbanBoards: true } }
            }
        });
        const trulyOrphan = allWorkspaces.filter(ws => ws._count.members === 0 && !ws.owner);
        const toDelete = [...orphanWorkspaces, ...trulyOrphan];
        const uniqueToDelete = Array.from(new Map(toDelete.map(w => [w.id, w])).values());
        if (uniqueToDelete.length === 0) {
            res.json({ message: 'No orphan workspaces found', deletedCount: 0 });
            return;
        }
        for (const ws of uniqueToDelete) {
            // Delete all related content
            yield Promise.all([
                prisma_1.default.page.deleteMany({ where: { workspaceId: ws.id } }),
                prisma_1.default.drawing.deleteMany({ where: { workspaceId: ws.id } }),
                prisma_1.default.kanbanBoard.deleteMany({ where: { workspaceId: ws.id } }),
                prisma_1.default.chatRoom.deleteMany({ where: { workspaceId: ws.id } }),
                prisma_1.default.file.deleteMany({ where: { workspaceId: ws.id } }),
            ]);
            // Delete the workspace
            yield prisma_1.default.workspace.delete({ where: { id: ws.id } });
        }
        res.json({ message: 'Orphan workspaces deleted', deletedCount: uniqueToDelete.length });
    }
    catch (error) {
        console.error('Delete orphan workspaces error:', error);
        res.status(500).json({ error: 'Failed to delete orphan workspaces' });
    }
}));
// Get all workspaces (admin only) - with pagination
router.get('/workspaces', auth_1.authenticateToken, requireAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const [workspaces, total] = yield Promise.all([
            prisma_1.default.workspace.findMany({
                include: {
                    owner: {
                        select: { id: true, email: true, username: true }
                    },
                    _count: {
                        select: { members: true }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit
            }),
            prisma_1.default.workspace.count()
        ]);
        res.json({
            workspaces,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch workspaces' });
    }
}));
// Update workspace (admin only)
router.put('/workspaces/:id', auth_1.authenticateToken, requireAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name } = req.body;
        const workspace = yield prisma_1.default.workspace.update({
            where: { id: req.params.id },
            data: Object.assign({}, (name && { name })),
            include: {
                owner: {
                    select: { id: true, email: true, username: true }
                },
                _count: {
                    select: { members: true }
                }
            }
        });
        res.json(workspace);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update workspace' });
    }
}));
// Get workspace by ID (admin only)
router.get('/workspaces/:id', auth_1.authenticateToken, requireAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const workspace = yield prisma_1.default.workspace.findUnique({
            where: { id: req.params.id },
            include: {
                owner: {
                    select: { id: true, email: true, username: true }
                },
                members: {
                    include: {
                        user: {
                            select: { id: true, email: true, username: true }
                        }
                    }
                },
                pages: true,
                drawings: true,
                kanbanBoards: true,
                chatRooms: true
            }
        });
        if (!workspace)
            return res.status(404).json({ error: 'Workspace not found' });
        res.json(workspace);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch workspace' });
    }
}));
// Delete workspace (admin only)
router.delete('/workspaces/:id', auth_1.authenticateToken, requireAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield prisma_1.default.workspace.delete({
            where: { id: req.params.id }
        });
        res.json({ message: 'Workspace deleted' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete workspace' });
    }
}));
// Get all files/uploads (admin only) - with pagination
router.get('/files', auth_1.authenticateToken, requireAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const [files, total] = yield Promise.all([
            prisma_1.default.file.findMany({
                include: {
                    uploader: {
                        select: { id: true, email: true, username: true }
                    },
                    workspace: {
                        select: { id: true, name: true }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit
            }),
            prisma_1.default.file.count()
        ]);
        res.json({
            files,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch files' });
    }
}));
// Delete file (admin only)
router.delete('/files/:id', auth_1.authenticateToken, requireAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield prisma_1.default.file.delete({
            where: { id: req.params.id }
        });
        res.json({ message: 'File deleted' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete file' });
    }
}));
// Get dashboard stats with historical data (admin only)
router.get('/stats', auth_1.authenticateToken, requireAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
        // Current counts
        const [userCount, workspaceCount, fileCount, pageCount, drawingCount, boardCount, chatMsgCount, chatRoomCount] = yield Promise.all([
            prisma_1.default.user.count(),
            prisma_1.default.workspace.count(),
            prisma_1.default.file.count(),
            prisma_1.default.page.count(),
            prisma_1.default.drawing.count(),
            prisma_1.default.kanbanBoard.count(),
            prisma_1.default.chatMessage.count(),
            prisma_1.default.chatRoom.count()
        ]);
        // Last 30 days counts
        const [newUsers30d, newWorkspaces30d, newFiles30d, newPages30d, newDrawings30d, newBoards30d, newMessages30d] = yield Promise.all([
            prisma_1.default.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
            prisma_1.default.workspace.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
            prisma_1.default.file.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
            prisma_1.default.page.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
            prisma_1.default.drawing.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
            prisma_1.default.kanbanBoard.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
            prisma_1.default.chatMessage.count({ where: { createdAt: { gte: thirtyDaysAgo } } })
        ]);
        // Previous 30 days (for comparison)
        const [newUsersPrev30d, newWorkspacesPrev30d, newPagesPrev30d, newDrawingsPrev30d, newBoardsPrev30d, newMessagesPrev30d] = yield Promise.all([
            prisma_1.default.user.count({ where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } } }),
            prisma_1.default.workspace.count({ where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } } }),
            prisma_1.default.page.count({ where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } } }),
            prisma_1.default.drawing.count({ where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } } }),
            prisma_1.default.kanbanBoard.count({ where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } } }),
            prisma_1.default.chatMessage.count({ where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } } })
        ]);
        // Daily data for charts (last 30 days)
        const dailyUsers = yield prisma_1.default.user.groupBy({
            by: ['createdAt'],
            where: { createdAt: { gte: thirtyDaysAgo } },
            _count: true,
            orderBy: { createdAt: 'asc' }
        });
        const dailyWorkspaces = yield prisma_1.default.workspace.groupBy({
            by: ['createdAt'],
            where: { createdAt: { gte: thirtyDaysAgo } },
            _count: true,
            orderBy: { createdAt: 'asc' }
        });
        const dailyPages = yield prisma_1.default.page.groupBy({
            by: ['createdAt'],
            where: { createdAt: { gte: thirtyDaysAgo } },
            _count: true,
            orderBy: { createdAt: 'asc' }
        });
        const dailyDrawings = yield prisma_1.default.drawing.groupBy({
            by: ['createdAt'],
            where: { createdAt: { gte: thirtyDaysAgo } },
            _count: true,
            orderBy: { createdAt: 'asc' }
        });
        const dailyMessages = yield prisma_1.default.chatMessage.groupBy({
            by: ['createdAt'],
            where: { createdAt: { gte: thirtyDaysAgo } },
            _count: true,
            orderBy: { createdAt: 'asc' }
        });
        const dailyFiles = yield prisma_1.default.file.groupBy({
            by: ['createdAt'],
            where: { createdAt: { gte: thirtyDaysAgo } },
            _count: true,
            orderBy: { createdAt: 'asc' }
        });
        res.json({
            users: userCount,
            workspaces: workspaceCount,
            files: fileCount,
            pages: pageCount,
            drawings: drawingCount,
            kanbanBoards: boardCount,
            chatMessages: chatMsgCount,
            chatRooms: chatRoomCount,
            last30Days: {
                newUsers: newUsers30d,
                newWorkspaces: newWorkspaces30d,
                newFiles: newFiles30d,
                newPages: newPages30d,
                newDrawings: newDrawings30d,
                newBoards: newBoards30d,
                newMessages: newMessages30d,
                userGrowth: newUsers30d - newUsersPrev30d,
                workspaceGrowth: newWorkspaces30d - newWorkspacesPrev30d,
                pagesGrowth: newPages30d - newPagesPrev30d,
                drawingsGrowth: newDrawings30d - newDrawingsPrev30d,
                boardsGrowth: newBoards30d - newBoardsPrev30d,
                messagesGrowth: newMessages30d - newMessagesPrev30d
            },
            charts: {
                users: dailyUsers.map(d => ({ date: d.createdAt.toISOString().split('T')[0], count: d._count })),
                workspaces: dailyWorkspaces.map(d => ({ date: d.createdAt.toISOString().split('T')[0], count: d._count })),
                pages: dailyPages.map(d => ({ date: d.createdAt.toISOString().split('T')[0], count: d._count })),
                drawings: dailyDrawings.map(d => ({ date: d.createdAt.toISOString().split('T')[0], count: d._count })),
                messages: dailyMessages.map(d => ({ date: d.createdAt.toISOString().split('T')[0], count: d._count })),
                files: dailyFiles.map(d => ({ date: d.createdAt.toISOString().split('T')[0], count: d._count }))
            }
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
}));
// Legacy report routes (keep for compatibility)
// Get all reports
router.get('/reports', auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.userId;
        const user = yield prisma_1.default.user.findUnique({ where: { id: userId } });
        if ((user === null || user === void 0 ? void 0 : user.email) !== 'admin@example.com') {
            return res.status(403).json({ error: 'Admin access required' });
        }
        const reports = yield prisma_1.default.report.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json(reports);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch reports' });
    }
}));
// Create a report
router.post('/reports', auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, description } = req.body;
        const reporterId = req.user.userId;
        const report = yield prisma_1.default.report.create({
            data: { title, description, reporterId }
        });
        res.json(report);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create report' });
    }
}));
// Update report status
router.put('/reports/:id', auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { status } = req.body;
        const { id } = req.params;
        const report = yield prisma_1.default.report.update({
            where: { id },
            data: { status }
        });
        res.json(report);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update report' });
    }
}));
exports.default = router;
