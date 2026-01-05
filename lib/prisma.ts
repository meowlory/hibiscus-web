import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
};

// Create connection pool
if (!globalForPrisma.pool) {
  // Get connection string and remove SSL mode parameter
  let connectionString = process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL;
  if (connectionString) {
    // Remove sslmode parameter
    connectionString = connectionString.split('?')[0];
  }

  globalForPrisma.pool = new Pool({
    connectionString,
    ssl: false, // Disable SSL completely
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
