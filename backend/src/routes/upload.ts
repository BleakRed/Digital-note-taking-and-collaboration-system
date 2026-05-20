import { Router, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { supabase, supabaseBucket, USE_SUPABASE } from '../supabase';

const router = Router();

// Use memory storage for Multer to avoid ephemeral disk issues
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) return cb(null, true);
    cb(new Error('Only images are allowed'));
  }
});

// Ensure uploads directory exists for local storage
const UPLOADS_DIR = path.join(process.cwd(), 'uploads');
if (!USE_SUPABASE && !fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const getBaseUrl = (req: AuthRequest) => {
  return process.env.BACKEND_URL || `${req.protocol}://${req.get('host')}`;
};

router.post('/', authenticateToken, upload.single('image'), async (req: AuthRequest, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Please upload a file' });
  }

  try {
    const file = req.file;
    const fileExt = path.extname(file.originalname);
    const fileName = `uploads/${Date.now()}-${Math.round(Math.random() * 1E9)}${fileExt}`;
    const relativePath = `${Date.now()}-${Math.round(Math.random() * 1E9)}${fileExt}`;

    if (USE_SUPABASE) {
      // Supabase storage
      const { data, error } = await supabase.storage
        .from(supabaseBucket)
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
          upsert: true
        });

      if (error) {
        console.error('Supabase upload error:', error);
        return res.status(500).json({ error: 'Failed to upload image to storage' });
      }

      const { data: { publicUrl } } = supabase.storage
        .from(supabaseBucket)
        .getPublicUrl(fileName);

      res.json({ url: publicUrl });
    } else {
      // Local storage fallback
      const localPath = path.join(UPLOADS_DIR, relativePath);
      fs.writeFileSync(localPath, file.buffer);

      const baseUrl = getBaseUrl(req);
      const publicUrl = `${baseUrl}/uploads/${relativePath}`;
      res.json({ url: publicUrl });
    }
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;