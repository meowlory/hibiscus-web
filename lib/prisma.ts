import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
};

// Create connection pool
if (!globalForPrisma.pool) {
  const connectionString = process.env.NODE_ENV === 'production'
    ? process.env.POSTGRES_PRISMA_URL
    : process.env.POSTGRES_URL_NON_POOLING;

  globalForPrisma.pool = new Pool({
    connectionString,
    ssl: {
      rejectUnauthorized: false, // Required for Supabase
    },
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
