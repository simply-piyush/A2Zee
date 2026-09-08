import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis;

/**
 * Singleton Prisma Client instance for Next.js.
 * Prevents multiple client instances in development HMR.
 */
let dbUrl = process.env.DATABASE_URL;
if (dbUrl && dbUrl.includes('-pooler.') && !dbUrl.includes('pgbouncer=true')) {
  const separator = dbUrl.includes('?') ? '&' : '?';
  dbUrl = `${dbUrl}${separator}pgbouncer=true&connection_limit=15`;
}

const prismaOptions = {
  log: ['error'],
};

if (dbUrl) {
  prismaOptions.datasources = {
    db: {
      url: dbUrl,
    },
  };
}

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient(prismaOptions);

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
