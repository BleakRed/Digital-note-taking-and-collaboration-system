"use strict";
import { defineConfig } from 'vitest/config';
export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
        setupFiles: ['./src/__tests__/setup.ts'],
        include: ['src/__tests__/**/*.test.ts'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            include: ['src/routes/auth.ts', 'src/routes/chat.ts', 'src/routes/drawing.ts', 'src/routes/kanban.ts', 'src/routes/page.ts', 'src/routes/workspace.ts'],
            exclude: ['src/__tests__/**', 'src/routes/admin.ts', 'src/routes/file.ts', 'src/routes/upload.ts'],
        },
        testTimeout: 30000,
        hooks: './src/__tests__/vitest-hooks.ts',
        env: {
            DATABASE_URL: 'postgresql://notion_user:notion_pass@localhost:5433/notion_clone_test',
            DIRECT_URL: 'postgresql://notion_user:notion_pass@localhost:5433/notion_clone_test',
            JWT_SECRET: 'test-jwt-secret-for-testing',
        },
    },
});
