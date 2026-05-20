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
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const auth_1 = require("../middleware/auth");
const prisma_1 = __importDefault(require("../prisma"));
const supabase_1 = require("../supabase");
const router = (0, express_1.Router)();
// Use memory storage for Multer
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});
// Ensure uploads directory exists for local storage
const UPLOADS_DIR = path_1.default.join(process.cwd(), 'uploads');
if (!supabase_1.USE_SUPABASE && !fs_1.default.existsSync(UPLOADS_DIR)) {
    fs_1.default.mkdirSync(UPLOADS_DIR, { recursive: true });
}
// Helper to extract path from Supabase URL
const getFilePathFromUrl = (url) => {
    const parts = url.split(`/storage/v1/object/public/${supabase_1.supabaseBucket}/`);
    return parts.length > 1 ? parts[1] : null;
};
const getBaseUrl = (req) => {
    return process.env.BACKEND_URL || `${req.protocol}://${req.get('host')}`;
};
// Upload a file to a workspace
router.post('/workspace/:workspaceId', auth_1.authenticateToken, upload.single('file'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { workspaceId } = req.params;
    const { folderId, description } = req.body;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    if (!req.file || !userId) {
        return res.status(400).json({ error: 'Please upload a file' });
    }
    try {
        const file = req.file;
        const fileExt = path_1.default.extname(file.originalname);
        const relativePath = `files/${workspaceId}/${Date.now()}-${Math.round(Math.random() * 1E9)}${fileExt}`;
        const fileName = relativePath;
        let publicUrl;
        if (supabase_1.USE_SUPABASE) {
            const { data, error } = yield supabase_1.supabase.storage
                .from(supabase_1.supabaseBucket)
                .upload(fileName, file.buffer, {
                contentType: file.mimetype,
                upsert: true
            });
            if (error) {
                console.error('Supabase upload error:', error);
                return res.status(500).json({ error: 'Failed to upload file to storage' });
            }
            const { data: { publicUrl: url } } = supabase_1.supabase.storage
                .from(supabase_1.supabaseBucket)
                .getPublicUrl(fileName);
            publicUrl = url;
        }
        else {
            const localDir = path_1.default.join(UPLOADS_DIR, `files/${workspaceId}`);
            if (!fs_1.default.existsSync(localDir))
                fs_1.default.mkdirSync(localDir, { recursive: true });
            const localFilename = `${Date.now()}-${Math.round(Math.random() * 1E9)}${fileExt}`;
            const localPath = path_1.default.join(localDir, localFilename);
            fs_1.default.writeFileSync(localPath, file.buffer);
            const baseUrl = getBaseUrl(req);
            publicUrl = `${baseUrl}/uploads/files/${workspaceId}/${localFilename}`;
        }
        const fileRecord = yield prisma_1.default.file.create({
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
    }
    catch (err) {
        console.error('File upload error:', err);
        res.status(500).json({ error: 'Failed to save file info' });
    }
}));
// Create a folder in a workspace
router.post('/folders/:workspaceId', auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { workspaceId } = req.params;
    const { name, parentId } = req.body;
    try {
        const folder = yield prisma_1.default.folder.create({
            data: { name, workspaceId, parentId: parentId || null }
        });
        res.json(folder);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to create folder' });
    }
}));
// Get all files and folders in a workspace
router.get('/workspace/:workspaceId', auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { workspaceId } = req.params;
    try {
        const files = yield prisma_1.default.file.findMany({
            where: { workspaceId },
            include: { uploader: { select: { id: true, username: true, email: true, avatarUrl: true } } },
            orderBy: { createdAt: 'desc' }
        });
        const folders = yield prisma_1.default.folder.findMany({
            where: { workspaceId },
            orderBy: { name: 'asc' }
        });
        res.json({ files, folders });
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch files and folders' });
    }
}));
// Delete a folder
router.delete('/folders/:id', auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield prisma_1.default.folder.delete({ where: { id: req.params.id } });
        res.json({ message: 'Folder deleted' });
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to delete folder' });
    }
}));
// Delete a file
router.delete('/:id', auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    try {
        const file = yield prisma_1.default.file.findUnique({ where: { id: req.params.id } });
        if (!file)
            return res.status(404).json({ error: 'File not found' });
        if (file.uploaderId !== userId)
            return res.status(403).json({ error: 'Unauthorized' });
        if (supabase_1.USE_SUPABASE) {
            const filePath = getFilePathFromUrl(file.url);
            if (filePath) {
                yield supabase_1.supabase.storage.from(supabase_1.supabaseBucket).remove([filePath]);
            }
        }
        else {
            // Try to delete local file
            const uploadsPath = path_1.default.join(UPLOADS_DIR, 'files');
            const relative = file.url.split('/uploads/files/')[1];
            if (relative) {
                const localPath = path_1.default.join(uploadsPath, relative);
                try {
                    fs_1.default.unlinkSync(localPath);
                }
                catch ( /* ignore if not found */_b) { /* ignore if not found */ }
            }
        }
        yield prisma_1.default.file.delete({ where: { id: req.params.id } });
        res.json({ message: 'File deleted' });
    }
    catch (err) {
        console.error('Delete error:', err);
        res.status(500).json({ error: 'Failed to delete file' });
    }
}));
// Update file content
router.put('/:id', auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { content } = req.body;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    try {
        const file = yield prisma_1.default.file.findUnique({ where: { id: req.params.id } });
        if (!file)
            return res.status(404).json({ error: 'File not found' });
        const membership = yield prisma_1.default.workspaceMember.findUnique({
            where: { workspaceId_userId: { workspaceId: file.workspaceId, userId: userId } }
        });
        if (!membership)
            return res.status(403).json({ error: 'Unauthorized' });
        if (supabase_1.USE_SUPABASE) {
            const filePath = getFilePathFromUrl(file.url);
            if (!filePath)
                return res.status(400).json({ error: 'Invalid file URL for update' });
            const { error } = yield supabase_1.supabase.storage
                .from(supabase_1.supabaseBucket)
                .upload(filePath, Buffer.from(content), {
                contentType: file.type,
                upsert: true
            });
            if (error)
                return res.status(500).json({ error: 'Failed to update file in storage' });
        }
        else {
            // Find and update local file
            const relative = file.url.split('/uploads/files/')[1];
            if (!relative)
                return res.status(400).json({ error: 'Invalid file URL for update' });
            const localPath = path_1.default.join(UPLOADS_DIR, 'files', relative);
            try {
                fs_1.default.writeFileSync(localPath, Buffer.from(content));
            }
            catch (err) {
                console.error('Local file update error:', err);
                return res.status(500).json({ error: 'Failed to update file locally' });
            }
        }
        yield prisma_1.default.file.update({
            where: { id: req.params.id },
            data: { size: Buffer.byteLength(content) }
        });
        res.json({ message: 'File updated successfully' });
    }
    catch (err) {
        console.error('Update error:', err);
        res.status(500).json({ error: 'Failed to update file' });
    }
}));
exports.default = router;
