import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis;

/**
 * Singleton Prisma Client instance for Next.js.
 * Prevents multiple client instances in development HMR.
 */
const prismaOptions = {
  log: ['error'],
};

if (process.env.DATABASE_URL) {
  prismaOptions.datasources = {
    db: {
      url: process.env.DATABASE_URL,
    },
  };
}

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient(prismaOptions);

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
