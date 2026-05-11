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
exports.getRlsClient = void 0;
const client_1 = require("@prisma/client");
const prismaClient = new client_1.PrismaClient();
/**
 * Custom Prisma client that supports Row Level Security (RLS)
 * by setting the current user ID in the PostgreSQL session.
 */
const getRlsClient = (userId) => {
    return prismaClient.$extends({
        query: {
            $allModels: {
                $allOperations(_a) {
                    return __awaiter(this, arguments, void 0, function* ({ args, query }) {
                        // Use a transaction to ensure SET LOCAL and the query run on the same connection
                        return prismaClient.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                            yield tx.$executeRawUnsafe(`SET LOCAL app.current_user_id = '${userId}';`);
                            return query(args);
                        }));
                    });
                },
            },
        },
    });
};
exports.getRlsClient = getRlsClient;
exports.default = prismaClient;
