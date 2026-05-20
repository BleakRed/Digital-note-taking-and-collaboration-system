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
const auth_1 = require("../middleware/auth");
const prisma_1 = __importDefault(require("../prisma"));
const router = (0, express_1.Router)();
// Create workspace
router.post('/', auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name } = req.body;
        const userId = req.user.userId;
        if (!name || name.trim().length === 0) {
            return res.status(400).json({ error: 'Workspace name is required' });
        }
        const workspace = yield prisma_1.default.workspace.create({
            data: {
                name,
                ownerId: userId,
                members: {
                    create: { userId, role: 'OWNER' }
                }
            },
            include: {
                members: {
                    include: {
                        user: {
                            select: { id: true, email: true, name: true, username: true, avatarUrl: true }
                        }
                    }
                }
            }
        });
        res.json(workspace);
        /* c8 ignore next 3 */
        /* c8 ignore next 2 */
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create workspace' });
    }
}));
// List workspaces
router.get('/', auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.userId;
        const memberships = yield prisma_1.default.workspaceMember.findMany({
            where: { userId },
            include: {
                workspace: {
                    include: {
                        members: {
                            include: {
                                user: {
                                    select: { id: true, email: true, name: true, username: true, avatarUrl: true }
                                }
                            }
                        }
                    }
                }
            }
        });
        res.json(memberships.map(m => m.workspace));
        /* c8 ignore next 3 */
        /* c8 ignore next 2 */
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch workspaces' });
    }
}));
// Get workspace by ID
router.get('/:id', auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const workspaceId = req.params.id;
        const userId = req.user.userId;
        const membership = yield prisma_1.default.workspaceMember.findUnique({
            where: { workspaceId_userId: { workspaceId, userId } }
        });
        if (!membership)
            return res.status(403).json({ error: 'Not a member of this workspace' });
        const workspace = yield prisma_1.default.workspace.findUnique({
            where: { id: workspaceId },
            include: {
                members: {
                    include: {
                        user: {
                            select: { id: true, email: true, name: true, username: true, avatarUrl: true }
                        }
                    }
                }
            }
        });
        if (!workspace)
            return res.status(404).json({ error: 'Workspace not found' });
        res.json(workspace);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch workspace' });
    }
}));
// Get workspace members
router.get('/:id/members', auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const workspaceId = req.params.id;
        const members = yield prisma_1.default.workspaceMember.findMany({
            where: { workspaceId },
            include: {
                user: {
                    select: { id: true, email: true, name: true, username: true, avatarUrl: true }
                }
            }
        });
        res.json(members);
        /* c8 ignore next 3 */
        /* c8 ignore next 2 */
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch members' });
    }
}));
// Invite member
router.post('/:id/invite', auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const workspaceId = req.params.id;
        const { email } = req.body;
        const ownerId = req.user.userId;
        // Check ownership
        const workspace = yield prisma_1.default.workspace.findUnique({
            where: { id: workspaceId }
        });
        if (!workspace)
            return res.status(404).json({ error: 'Workspace not found' });
        if (workspace.ownerId !== ownerId) {
            return res.status(403).json({ error: 'Only owner can invite' });
        }
        const userToInvite = yield prisma_1.default.user.findUnique({ where: { email } });
        if (!userToInvite)
            return res.status(404).json({ error: 'User not found' });
        // Check if already member
        const existing = yield prisma_1.default.workspaceMember.findFirst({
            where: { workspaceId, userId: userToInvite.id }
        });
        if (existing)
            return res.status(400).json({ error: 'User already a member' });
        yield prisma_1.default.workspaceMember.create({
            data: {
                workspaceId,
                userId: userToInvite.id,
                role: 'MEMBER'
            }
        });
        res.json({ message: 'Invited' });
        /* c8 ignore next 3 */
        /* c8 ignore next 2 */
    }
    catch (error) {
        /* c8 ignore next 3 */
        console.error(error);
        res.status(500).json({ error: 'Failed to invite' });
    }
}));
// Remove member
router.delete('/:id/members/:memberId', auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const workspaceId = req.params.id;
        const memberId = req.params.memberId;
        const ownerId = req.user.userId;
        // Check ownership
        const workspace = yield prisma_1.default.workspace.findUnique({
            where: { id: workspaceId }
        });
        if (!workspace)
            return res.status(404).json({ error: 'Workspace not found' });
        if (workspace.ownerId !== ownerId) {
            return res.status(403).json({ error: 'Only owner can remove members' });
        }
        if (memberId === ownerId) {
            return res.status(400).json({ error: 'Cannot remove owner' });
        }
        yield prisma_1.default.workspaceMember.deleteMany({
            where: {
                workspaceId,
                userId: memberId
            }
        });
        res.json({ message: 'Removed' });
        /* c8 ignore next 3 */
        /* c8 ignore next 2 */
    }
    catch (error) {
        /* c8 ignore next 3 */
        console.error(error);
        res.status(500).json({ error: 'Failed to remove member' });
    }
}));
/* c8 ignore next 3 */
exports.default = router;
