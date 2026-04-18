import { beforeAll, afterAll } from 'vitest'
import { PrismaClient } from '@prisma/client'

process.env.DATABASE_URL = 'postgresql://notion_user:notion_pass@localhost:5433/notion_clone_test?schema=public&connection_limit=1&pool_timeout=20'
process.env.DIRECT_URL = 'postgresql://notion_user:notion_pass@localhost:5433/notion_clone_test?schema=public&connection_limit=1&pool_timeout=20'
process.env.JWT_SECRET = 'test-jwt-secret-for-testing'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

beforeAll(async () => {
  // Reduce connection pool size
  if (globalForPrisma.prisma) {
    await globalForPrisma.prisma.$disconnect()
  }
})

afterAll(async () => {
  // Clean up any lingering connections
  try {
    await globalForPrisma.prisma?.$disconnect()
  } catch { /* ignore */ }
})
