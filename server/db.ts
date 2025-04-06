import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from '@shared/schema';
import dotenv from 'dotenv';
dotenv.config();

// Use DATABASE_URL from environment or fallback
const DATABASE_URL = process.env.DATABASE_URL || '';

if (!DATABASE_URL) {
  console.error('DATABASE_URL environment variable not set');
  process.exit(1);
}

// Create database client
const sql = neon(DATABASE_URL);
export const db = drizzle(sql, { schema });