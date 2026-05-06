import { PrismaClient } from '@prisma/client';
import { env } from './utils/env';

const { PrismaPg } = require('@prisma/adapter-pg');

declare global {
  // eslint-disable-next-line no-var
  var __prisma__: PrismaClient | undefined;
}

if (!env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required to start the backend.');
}

if (env.DATABASE_URL.startsWith('prisma+postgres://')) {
  throw new Error(
    'DATABASE_URL must be a direct PostgreSQL connection string like postgresql://user:password@host:5432/dbname. prisma+postgres:// URLs are not supported by this backend runtime.',
  );
}

const adapter = new PrismaPg({
  connectionString: env.DATABASE_URL,
});

export const prisma =
  global.__prisma__ ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.__prisma__ = prisma;
}
