import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Chỉ log query ở môi trường development để tránh spam log ở production
const logOptions = process.env.NODE_ENV === 'development' ? ['query'] : []

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: logOptions as any,
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db