import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { createPool } from '@vercel/postgres';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: ReturnType<typeof createPool> | undefined;
};

// Create connection pool using Vercel's postgres package (handles SSL properly)
if (!globalForPrisma.pool) {
  globalForPrisma.pool = createPool({
    connectionString: process.env.POSTGRES_PRISMA_URL,
  });
}

const pool = globalForPrisma.pool;
const adapter = new PrismaPg(pool);

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
