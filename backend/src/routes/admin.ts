import express from 'express';
import prisma from '../prisma';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { Response } from 'express';

const router = express.Router();

// Middleware to check if user is admin
const requireAdmin = async (req: AuthRequest, res: Response, next: Function) => {
    const userId = req.user!.userId;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    
    if (!user || user.email !== 'admin@example.com') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
};

// Get all users (admin only) - with pagination and sorting
router.get('/users', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const skip = (page - 1) * limit;
        const sortBy = (req.query.sortBy as string) || 'createdAt';
        const sortOrder = (req.query.sortOrder as string) === 'asc' ? 'asc' : 'desc';

        // Map sortBy to Prisma orderBy
        const orderBy: any = {};
        if (['username', 'email', 'isVerified', 'createdAt'].includes(sortBy)) {
            orderBy[sortBy] = sortOrder;
        } else {
            orderBy.createdAt = 'desc';
        }

        const [users, total] = await Promise.all([
            prisma.user.findMany({
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
            prisma.user.count()
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
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// Update user (admin only)
router.put('/users/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
    try {
        const { username, isVerified } = req.body;
        
        const user = await prisma.user.update({
            where: { id: req.params.id },
            data: {
                ...(username && { username }),
                ...(isVerified !== undefined && { isVerified })
            },
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
    } catch (error) {
        res.status(500).json({ error: 'Failed to update user' });
    }
});

// Get user by ID (admin only)
router.get('/users/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
    try {
        const user = await prisma.user.findUnique({
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
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

// Delete user (admin only)
router.delete('/users/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
    try {
        await prisma.user.delete({
            where: { id: req.params.id }
        });
        res.json({ message: 'User deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

// Get all workspaces (admin only) - with pagination
router.get('/workspaces', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const skip = (page - 1) * limit;

        const [workspaces, total] = await Promise.all([
            prisma.workspace.findMany({
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
            prisma.workspace.count()
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
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch workspaces' });
    }
});

// Update workspace (admin only)
router.put('/workspaces/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
    try {
        const { name } = req.body;
        
        const workspace = await prisma.workspace.update({
            where: { id: req.params.id },
            data: {
                ...(name && { name })
            },
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
    } catch (error) {
        res.status(500).json({ error: 'Failed to update workspace' });
    }
});

// Get workspace by ID (admin only)
router.get('/workspaces/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
    try {
        const workspace = await prisma.workspace.findUnique({
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
        if (!workspace) return res.status(404).json({ error: 'Workspace not found' });
        res.json(workspace);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch workspace' });
    }
});

// Delete workspace (admin only)
router.delete('/workspaces/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
    try {
        await prisma.workspace.delete({
            where: { id: req.params.id }
        });
        res.json({ message: 'Workspace deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete workspace' });
    }
});

// Get all files/uploads (admin only) - with pagination
router.get('/files', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const skip = (page - 1) * limit;

        const [files, total] = await Promise.all([
            prisma.file.findMany({
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
            prisma.file.count()
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
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch files' });
    }
});

// Delete file (admin only)
router.delete('/files/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
    try {
        await prisma.file.delete({
            where: { id: req.params.id }
        });
        res.json({ message: 'File deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete file' });
    }
});

// Get dashboard stats with historical data (admin only)
router.get('/stats', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
    try {
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

        // Current counts
        const [userCount, workspaceCount, fileCount, pageCount, drawingCount, boardCount, chatMsgCount, chatRoomCount] = await Promise.all([
            prisma.user.count(),
            prisma.workspace.count(),
            prisma.file.count(),
            prisma.page.count(),
            prisma.drawing.count(),
            prisma.kanbanBoard.count(),
            prisma.chatMessage.count(),
            prisma.chatRoom.count()
        ]);

        // Last 30 days counts
        const [newUsers30d, newWorkspaces30d, newFiles30d, newPages30d, newDrawings30d, newBoards30d, newMessages30d] = await Promise.all([
            prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
            prisma.workspace.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
            prisma.file.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
            prisma.page.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
            prisma.drawing.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
            prisma.kanbanBoard.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
            prisma.chatMessage.count({ where: { createdAt: { gte: thirtyDaysAgo } } })
        ]);

        // Previous 30 days (for comparison)
        const [newUsersPrev30d, newWorkspacesPrev30d, newPagesPrev30d, newDrawingsPrev30d, newBoardsPrev30d, newMessagesPrev30d] = await Promise.all([
            prisma.user.count({ where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } } }),
            prisma.workspace.count({ where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } } }),
            prisma.page.count({ where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } } }),
            prisma.drawing.count({ where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } } }),
            prisma.kanbanBoard.count({ where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } } }),
            prisma.chatMessage.count({ where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } } })
        ]);

        // Daily data for charts (last 30 days)
        const dailyUsers = await prisma.user.groupBy({
            by: ['createdAt'],
            where: { createdAt: { gte: thirtyDaysAgo } },
            _count: true,
            orderBy: { createdAt: 'asc' }
        });

        const dailyWorkspaces = await prisma.workspace.groupBy({
            by: ['createdAt'],
            where: { createdAt: { gte: thirtyDaysAgo } },
            _count: true,
            orderBy: { createdAt: 'asc' }
        });

        const dailyPages = await prisma.page.groupBy({
            by: ['createdAt'],
            where: { createdAt: { gte: thirtyDaysAgo } },
            _count: true,
            orderBy: { createdAt: 'asc' }
        });

        const dailyDrawings = await prisma.drawing.groupBy({
            by: ['createdAt'],
            where: { createdAt: { gte: thirtyDaysAgo } },
            _count: true,
            orderBy: { createdAt: 'asc' }
        });

        const dailyMessages = await prisma.chatMessage.groupBy({
            by: ['createdAt'],
            where: { createdAt: { gte: thirtyDaysAgo } },
            _count: true,
            orderBy: { createdAt: 'asc' }
        });

        const dailyFiles = await prisma.file.groupBy({
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
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

// Legacy report routes (keep for compatibility)
// Get all reports
router.get('/reports', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!.userId;
        const user = await prisma.user.findUnique({ where: { id: userId } });
        
        if (user?.email !== 'admin@example.com') {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const reports = await prisma.report.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json(reports);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch reports' });
    }
});

// Create a report
router.post('/reports', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const { title, description } = req.body;
        const reporterId = req.user!.userId;

        const report = await prisma.report.create({
            data: { title, description, reporterId }
        });
        res.json(report);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create report' });
    }
});

// Update report status
router.put('/reports/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const { status } = req.body;
        const { id } = req.params;

        const report = await prisma.report.update({
            where: { id },
            data: { status }
        });
        res.json(report);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update report' });
    }
});

export default router;