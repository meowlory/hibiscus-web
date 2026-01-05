import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
};

// Create connection pool
if (!globalForPrisma.pool) {
  let connectionString = process.env.NODE_ENV === 'production'
    ? process.env.POSTGRES_PRISMA_URL
    : process.env.POSTGRES_URL_NON_POOLING;

  // Remove sslmode parameter from connection string and handle it with pool config
  if (connectionString) {
    connectionString = connectionString.replace(/[?&]sslmode=require/g, '');
  }

  globalForPrisma.pool = new Pool({
    connectionString,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  // Set connection error handling
  globalForPrisma.pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
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
