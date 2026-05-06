import dotenv from 'dotenv';

dotenv.config();

const DEFAULT_PORT = 5000;

function parsePort(value: string | undefined) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : DEFAULT_PORT;
}

export const env = {
  PORT: parsePort(process.env.PORT),
  CLIENT_URL: process.env.CLIENT_URL ?? 'http://localhost:5173',
  DATABASE_URL: process.env.DATABASE_URL ?? '',
};
