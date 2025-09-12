import { PrismaClient } from '@prisma/client'

// Lazily create a Prisma client only when needed at runtime.
// This avoids evaluating DATABASE_URL during Next.js build time (e.g., Cloud Build),
// which can fail if env vars are not provided for the build step.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

export function getPrisma(): PrismaClient {
  if (!globalForPrisma.prisma) {
    // Prefer Vercel-provided Prisma URL if available, otherwise fall back.
    const url =
      process.env.DATABASE_URL ||
      process.env.POSTGRES_PRISMA_URL ||
      process.env.POSTGRES_URL ||
      process.env.POSTGRES_URL_NON_POOLING ||
      process.env.PRISMA_DATABASE_URL

    if (!url) {
      const tried = [
        'DATABASE_URL',
        'POSTGRES_PRISMA_URL',
        'POSTGRES_URL',
        'POSTGRES_URL_NON_POOLING',
        'PRISMA_DATABASE_URL',
      ]
      throw new Error(
        `No database URL found for Prisma client. Tried: ${tried
          .filter((k) => !process.env[k as keyof NodeJS.ProcessEnv])
          .join(', ')}.\n` +
          'Set DATABASE_URL to your Supabase pooled connection string, or use Vercel Postgres integration envs.'
      )
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

