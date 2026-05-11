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
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
process.env.DATABASE_URL = 'postgresql://notion_user:notion_pass@localhost:5433/notion_clone_test?schema=public&connection_limit=1&pool_timeout=20';
process.env.DIRECT_URL = 'postgresql://notion_user:notion_pass@localhost:5433/notion_clone_test?schema=public&connection_limit=1&pool_timeout=20';
process.env.JWT_SECRET = 'test-jwt-secret-for-testing';
const globalForPrisma = globalThis;
(0, vitest_1.beforeAll)(() => __awaiter(void 0, void 0, void 0, function* () {
    // Reduce connection pool size
    if (globalForPrisma.prisma) {
        yield globalForPrisma.prisma.$disconnect();
    }
}));
(0, vitest_1.afterAll)(() => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    // Clean up any lingering connections
    try {
        yield ((_a = globalForPrisma.prisma) === null || _a === void 0 ? void 0 : _a.$disconnect());
    }
    catch ( /* ignore */_b) { /* ignore */ }
}));
