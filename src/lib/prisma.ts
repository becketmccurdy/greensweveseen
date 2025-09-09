import { PrismaClient } from '@prisma/client'

// Lazily create a Prisma client only when needed at runtime.
// This avoids evaluating DATABASE_URL during Next.js build time (e.g., Cloud Build),
// which can fail if env vars are not provided for the build step.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

export function getPrisma(): PrismaClient {
  if (!globalForPrisma.prisma) {
    const url = process.env.DATABASE_URL
    if (!url) {
      throw new Error('DATABASE_URL is not set for Prisma client')
    }
    globalForPrisma.prisma = new PrismaClient({
      datasources: { db: { url } },
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    })
  }
  return globalForPrisma.prisma
}

export type Prisma = PrismaClient

// Lazy initialization to avoid build-time errors
let _prisma: PrismaClient | null = null
export const prisma = new Proxy({} as PrismaClient, {
  get(_, prop) {
    if (!_prisma) {
      _prisma = getPrisma()
    }
    return (_prisma as any)[prop]
  }
})
