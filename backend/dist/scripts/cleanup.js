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
exports.runFullCleanup = exports.cleanupOrphanedWorkspaces = exports.cleanupUnverifiedUsers = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const supabase_1 = require("../supabase");
// Helper to extract path from Supabase URL
const getFilePathFromUrl = (url) => {
    // Public URL format: https://[project].supabase.co/storage/v1/object/public/[bucket]/[path]
    const parts = url.split(`/storage/v1/object/public/${supabase_1.supabaseBucket}/`);
    return parts.length > 1 ? parts[1] : null;
};
const cleanupUnverifiedUsers = () => __awaiter(void 0, void 0, void 0, function* () {
    console.log('[Cleanup] Starting unverified users cleanup...');
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    try {
        // Find users not verified for more than a month
        const unverifiedUsers = yield prisma_1.default.user.findMany({
            where: {
                isVerified: false,
                createdAt: { lt: oneMonthAgo }
            },
            include: {
                ownedWorkspaces: {
                    include: {
                        files: true
                    }
                }
            }
        });
        console.log(`[Cleanup] Found ${unverifiedUsers.length} unverified accounts to delete.`);
        for (const user of unverifiedUsers) {
            // Collect all file paths from workspaces owned by this user
            // Because of onDelete: Cascade, the records will be gone, but we need to delete physical files
            const filesToDelete = [];
            for (const workspace of user.ownedWorkspaces) {
                for (const file of workspace.files) {
                    const filePath = getFilePathFromUrl(file.url);
                    if (filePath)
                        filesToDelete.push(filePath);
                }
            }
            if (filesToDelete.length > 0) {
                const { error } = yield supabase_1.supabase.storage
                    .from(supabase_1.supabaseBucket)
                    .remove(filesToDelete);
                if (error) {
                    console.error(`[Cleanup] Error deleting files for user ${user.id}:`, error);
                }
                else {
                    console.log(`[Cleanup] Deleted ${filesToDelete.length} files from storage.`);
                }
            }
            // Delete the user (cascades to Workspace, Page, File records, etc.)
            yield prisma_1.default.user.delete({ where: { id: user.id } });
            console.log(`[Cleanup] Deleted user: ${user.email}`);
        }
    }
    catch (error) {
        console.error('[Cleanup] Error during unverified users cleanup:', error);
    }
});
exports.cleanupUnverifiedUsers = cleanupUnverifiedUsers;
const cleanupOrphanedWorkspaces = () => __awaiter(void 0, void 0, void 0, function* () {
    console.log('[Cleanup] Starting orphaned workspaces cleanup...');
    try {
        // Find workspaces with no members
        const orphanedWorkspaces = yield prisma_1.default.workspace.findMany({
            where: {
                members: {
                    none: {}
                }
            },
            include: {
                files: true
            }
        });
        console.log(`[Cleanup] Found ${orphanedWorkspaces.length} orphaned workspaces to delete.`);
        for (const workspace of orphanedWorkspaces) {
            const filesToDelete = [];
            for (const file of workspace.files) {
                const filePath = getFilePathFromUrl(file.url);
                if (filePath)
                    filesToDelete.push(filePath);
            }
            if (filesToDelete.length > 0) {
                const { error } = yield supabase_1.supabase.storage
                    .from(supabase_1.supabaseBucket)
                    .remove(filesToDelete);
                if (error) {
                    console.error(`[Cleanup] Error deleting files for workspace ${workspace.id}:`, error);
                }
                else {
                    console.log(`[Cleanup] Deleted ${filesToDelete.length} files from storage.`);
                }
            }
            yield prisma_1.default.workspace.delete({ where: { id: workspace.id } });
            console.log(`[Cleanup] Deleted workspace: ${workspace.name}`);
        }
    }
    catch (error) {
        console.error('[Cleanup] Error during orphaned workspaces cleanup:', error);
    }
});
exports.cleanupOrphanedWorkspaces = cleanupOrphanedWorkspaces;
const runFullCleanup = () => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, exports.cleanupUnverifiedUsers)();
    yield (0, exports.cleanupOrphanedWorkspaces)();
});
exports.runFullCleanup = runFullCleanup;
