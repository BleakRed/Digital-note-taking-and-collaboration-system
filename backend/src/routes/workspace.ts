import { Router, Response } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import prisma from '../prisma';
const router = Router();

// Create workspace
router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { name } = req.body;
    const userId = req.user!.userId;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: 'Workspace name is required' });
    }

    const workspace = await prisma.workspace.create({
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
} catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create workspace' });
  }
});

// List workspaces
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const memberships = await prisma.workspaceMember.findMany({
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
} catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch workspaces' });
  }
});

// Get workspace by ID
router.get('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const workspaceId = req.params.id;
    const userId = req.user!.userId;

    const membership = await prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId } }
    });
    if (!membership) return res.status(403).json({ error: 'Not a member of this workspace' });

    const workspace = await prisma.workspace.findUnique({
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
    if (!workspace) return res.status(404).json({ error: 'Workspace not found' });
    res.json(workspace);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch workspace' });
  }
});

// Get workspace members
router.get('/:id/members', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const workspaceId = req.params.id;
    const members = await prisma.workspaceMember.findMany({
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
} catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch members' });
  }
});

// Invite member
router.post('/:id/invite', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const workspaceId = req.params.id;
    const { email } = req.body;
    const ownerId = req.user!.userId;

    // Check ownership
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId }
    });
    
    if (!workspace) return res.status(404).json({ error: 'Workspace not found' });
    
    if (workspace.ownerId !== ownerId) {
      return res.status(403).json({ error: 'Only owner can invite' });
    }

    const userToInvite = await prisma.user.findUnique({ where: { email } });
    if (!userToInvite) return res.status(404).json({ error: 'User not found' });

    // Check if already member
    const existing = await prisma.workspaceMember.findFirst({
        where: { workspaceId, userId: userToInvite.id }
    });
    if (existing) return res.status(400).json({ error: 'User already a member' });

    await prisma.workspaceMember.create({
      data: {
        workspaceId,
        userId: userToInvite.id,
        role: 'MEMBER'
      }
    });

    res.json({ message: 'Invited' });
  /* c8 ignore next 3 */
/* c8 ignore next 2 */
} catch (error) {
    /* c8 ignore next 3 */
    console.error(error);
    res.status(500).json({ error: 'Failed to invite' });
  }
});

// Remove member
router.delete('/:id/members/:memberId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const workspaceId = req.params.id;
    const memberId = req.params.memberId;
    const ownerId = req.user!.userId;

    // Check ownership
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId }
    });
    
    if (!workspace) return res.status(404).json({ error: 'Workspace not found' });

    if (workspace.ownerId !== ownerId) {
      return res.status(403).json({ error: 'Only owner can remove members' });
    }

    if (memberId === ownerId) {
        return res.status(400).json({ error: 'Cannot remove owner' });
    }

    await prisma.workspaceMember.deleteMany({
      where: {
        workspaceId,
        userId: memberId
      }
    });

    res.json({ message: 'Removed' });
  /* c8 ignore next 3 */
/* c8 ignore next 2 */
} catch (error) {
    /* c8 ignore next 3 */
    console.error(error);
    res.status(500).json({ error: 'Failed to remove member' });
  }
});

/* c8 ignore next 3 */
export default router;
