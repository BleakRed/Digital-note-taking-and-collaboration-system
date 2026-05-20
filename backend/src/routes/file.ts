import { Router, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import prisma from '../prisma';
import { supabase, supabaseBucket, USE_SUPABASE } from '../supabase';

const router = Router();

// Use memory storage for Multer
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// Ensure uploads directory exists for local storage
const UPLOADS_DIR = path.join(process.cwd(), 'uploads');
if (!USE_SUPABASE && !fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Helper to extract path from Supabase URL
const getFilePathFromUrl = (url: string) => {
  const parts = url.split(`/storage/v1/object/public/${supabaseBucket}/`);
  return parts.length > 1 ? parts[1] : null;
};

const getBaseUrl = (req: AuthRequest) => {
  return process.env.BACKEND_URL || `${req.protocol}://${req.get('host')}`;
};

// Upload a file to a workspace
router.post('/workspace/:workspaceId', authenticateToken, upload.single('file'), async (req: AuthRequest, res: Response) => {
  const { workspaceId } = req.params;
  const { folderId, description } = req.body;
  const userId = req.user?.userId;

  if (!req.file || !userId) {
    return res.status(400).json({ error: 'Please upload a file' });
  }

  try {
    const file = req.file;
    const fileExt = path.extname(file.originalname);
    const relativePath = `files/${workspaceId}/${Date.now()}-${Math.round(Math.random() * 1E9)}${fileExt}`;
    const fileName = relativePath;

    let publicUrl: string;

    if (USE_SUPABASE) {
      const { data, error } = await supabase.storage
        .from(supabaseBucket)
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
          upsert: true
        });

      if (error) {
        console.error('Supabase upload error:', error);
        return res.status(500).json({ error: 'Failed to upload file to storage' });
      }

      const { data: { publicUrl: url } } = supabase.storage
        .from(supabaseBucket)
        .getPublicUrl(fileName);
      publicUrl = url;
    } else {
      const localDir = path.join(UPLOADS_DIR, `files/${workspaceId}`);
      if (!fs.existsSync(localDir)) fs.mkdirSync(localDir, { recursive: true });
      const localFilename = `${Date.now()}-${Math.round(Math.random() * 1E9)}${fileExt}`;
      const localPath = path.join(localDir, localFilename);
      fs.writeFileSync(localPath, file.buffer);
      const baseUrl = getBaseUrl(req);
      publicUrl = `${baseUrl}/uploads/files/${workspaceId}/${localFilename}`;
    }

    const fileRecord = await prisma.file.create({
      data: {
        name: req.file.originalname,
        url: publicUrl,
        size: req.file.size,
        type: req.file.mimetype,
        description,
        workspaceId,
        uploaderId: userId,
        folderId: folderId || null,
      },
      include: { uploader: { select: { id: true, username: true, email: true, avatarUrl: true } } },
    });

    res.json(fileRecord);
  } catch (err) {
    console.error('File upload error:', err);
    res.status(500).json({ error: 'Failed to save file info' });
  }
});

// Create a folder in a workspace
router.post('/folders/:workspaceId', authenticateToken, async (req: AuthRequest, res: Response) => {
  const { workspaceId } = req.params;
  const { name, parentId } = req.body;

  try {
    const folder = await prisma.folder.create({
      data: { name, workspaceId, parentId: parentId || null }
    });
    res.json(folder);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create folder' });
  }
});

// Get all files and folders in a workspace
router.get('/workspace/:workspaceId', authenticateToken, async (req: AuthRequest, res: Response) => {
  const { workspaceId } = req.params;

  try {
    const files = await prisma.file.findMany({
      where: { workspaceId },
      include: { uploader: { select: { id: true, username: true, email: true, avatarUrl: true } } },
      orderBy: { createdAt: 'desc' }
    });
    const folders = await prisma.folder.findMany({
      where: { workspaceId },
      orderBy: { name: 'asc' }
    });
    res.json({ files, folders });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch files and folders' });
  }
});

// Delete a folder
router.delete('/folders/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    await prisma.folder.delete({ where: { id: req.params.id } });
    res.json({ message: 'Folder deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete folder' });
  }
});

// Delete a file
router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;

  try {
    const file = await prisma.file.findUnique({ where: { id: req.params.id } });
    if (!file) return res.status(404).json({ error: 'File not found' });
    if (file.uploaderId !== userId) return res.status(403).json({ error: 'Unauthorized' });

    if (USE_SUPABASE) {
      const filePath = getFilePathFromUrl(file.url);
      if (filePath) {
        await supabase.storage.from(supabaseBucket).remove([filePath]);
      }
    } else {
      // Try to delete local file
      const uploadsPath = path.join(UPLOADS_DIR, 'files');
      const relative = file.url.split('/uploads/files/')[1];
      if (relative) {
        const localPath = path.join(uploadsPath, relative);
        try { fs.unlinkSync(localPath); } catch { /* ignore if not found */ }
      }
    }

    await prisma.file.delete({ where: { id: req.params.id } });
    res.json({ message: 'File deleted' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

// Update file content
router.put('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  const { content } = req.body;
  const userId = req.user?.userId;

  try {
    const file = await prisma.file.findUnique({ where: { id: req.params.id } });
    if (!file) return res.status(404).json({ error: 'File not found' });

    const membership = await prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId: file.workspaceId, userId: userId! } }
    });
    if (!membership) return res.status(403).json({ error: 'Unauthorized' });

    if (USE_SUPABASE) {
      const filePath = getFilePathFromUrl(file.url);
      if (!filePath) return res.status(400).json({ error: 'Invalid file URL for update' });

      const { error } = await supabase.storage
        .from(supabaseBucket)
        .upload(filePath, Buffer.from(content), {
          contentType: file.type,
          upsert: true
        });

      if (error) return res.status(500).json({ error: 'Failed to update file in storage' });
    } else {
      // Find and update local file
      const relative = file.url.split('/uploads/files/')[1];
      if (!relative) return res.status(400).json({ error: 'Invalid file URL for update' });
      const localPath = path.join(UPLOADS_DIR, 'files', relative);
      try {
        fs.writeFileSync(localPath, Buffer.from(content));
      } catch (err) {
        console.error('Local file update error:', err);
        return res.status(500).json({ error: 'Failed to update file locally' });
      }
    }

    await prisma.file.update({
      where: { id: req.params.id },
      data: { size: Buffer.byteLength(content) }
    });

    res.json({ message: 'File updated successfully' });
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ error: 'Failed to update file' });
  }
});

export default router;