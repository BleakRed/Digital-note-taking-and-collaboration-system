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
const auth_1 = require("../middleware/auth");
const prisma_1 = __importDefault(require("../prisma"));
const supabase_1 = require("../supabase");
const router = (0, express_1.Router)();
// Use memory storage for Multer to avoid ephemeral disk issues
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});
// Helper to extract path from Supabase URL
const getFilePathFromUrl = (url) => {
    // Public URL format: https://[project].supabase.co/storage/v1/object/public/[bucket]/[path]
    const parts = url.split(`/storage/v1/object/public/${supabase_1.supabaseBucket}/`);
    return parts.length > 1 ? parts[1] : null;
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
        const fileName = `files/${workspaceId}/${Date.now()}-${Math.round(Math.random() * 1E9)}${fileExt}`;
        // Upload to Supabase
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
        // Get public URL
        const { data: { publicUrl } } = supabase_1.supabase.storage
            .from(supabase_1.supabaseBucket)
            .getPublicUrl(fileName);
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
            data: {
                name,
                workspaceId,
                parentId: parentId || null,
            }
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
    const { id } = req.params;
    try {
        // Note: This won't delete files in the folder unless we do it recursively or Cascade
        // Prisma Cascade delete would be better, but we'll do it manually for simplicity if needed
        // In schema we didn't add Cascade. 
        // Let's just delete the folder for now.
        yield prisma_1.default.folder.delete({ where: { id } });
        res.json({ message: 'Folder deleted' });
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to delete folder' });
    }
}));
// Delete a file
router.delete('/:id', auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { id } = req.params;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    try {
        const file = yield prisma_1.default.file.findUnique({ where: { id } });
        if (!file)
            return res.status(404).json({ error: 'File not found' });
        // Check if user is uploader or workspace owner (simplified: just uploader for now)
        if (file.uploaderId !== userId) {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        // Delete from Supabase
        const filePath = getFilePathFromUrl(file.url);
        if (filePath) {
            const { error } = yield supabase_1.supabase.storage
                .from(supabase_1.supabaseBucket)
                .remove([filePath]);
            if (error) {
                console.error('Supabase delete error:', error);
                // We continue to delete from DB even if Supabase fails (maybe it was already gone)
            }
        }
        yield prisma_1.default.file.delete({ where: { id } });
        res.json({ message: 'File deleted' });
    }
    catch (err) {
        console.error('Delete error:', err);
        res.status(500).json({ error: 'Failed to delete file' });
    }
}));
// Update file content in Supabase
router.put('/:id', auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { id } = req.params;
    const { content } = req.body;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    try {
        const file = yield prisma_1.default.file.findUnique({ where: { id } });
        if (!file)
            return res.status(404).json({ error: 'File not found' });
        // Check if user is in workspace
        const membership = yield prisma_1.default.workspaceMember.findUnique({
            where: { workspaceId_userId: { workspaceId: file.workspaceId, userId: userId } }
        });
        if (!membership)
            return res.status(403).json({ error: 'Unauthorized' });
        // Update in Supabase
        const filePath = getFilePathFromUrl(file.url);
        if (!filePath) {
            return res.status(400).json({ error: 'Invalid file URL for update' });
        }
        const { error } = yield supabase_1.supabase.storage
            .from(supabase_1.supabaseBucket)
            .upload(filePath, Buffer.from(content), {
            contentType: file.type,
            upsert: true
        });
        if (error) {
            console.error('Supabase update error:', error);
            return res.status(500).json({ error: 'Failed to update file in storage' });
        }
        // Update file size in DB
        yield prisma_1.default.file.update({
            where: { id },
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
