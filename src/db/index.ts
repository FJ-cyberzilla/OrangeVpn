import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
const { Pool } = pkg;
import * as schema from './schema.ts';

let poolInstance: pkg.Pool | null = null;
let dbInstance: NodePgDatabase<typeof schema> | null = null;

export const getSqlDb = () => {
  if (dbInstance) return dbInstance;
  if (!process.env.SQL_HOST || !process.env.SQL_USER || !process.env.SQL_DB_NAME) {
    return null;
  }
  try {
    poolInstance = new Pool({
      host: process.env.SQL_HOST,
      user: process.env.SQL_USER,
      password: process.env.SQL_PASSWORD,
      database: process.env.SQL_DB_NAME,
      connectionTimeoutMillis: 10000,
    });

    poolInstance.on('error', (err) => {
      console.error('Unexpected error on idle SQL pool client:', err);
    });

    dbInstance = drizzle(poolInstance, { schema });
    return dbInstance;
  } catch (err) {
    console.error('Failed to initialize Cloud SQL pool:', err);
    return null;
  }
};

// Proxy export for backward compatibility
export const db = new Proxy({} as NodePgDatabase<typeof schema>, {
  get(_target, prop) {
    const instance = getSqlDb();
    if (!instance) {
      throw new Error('Cloud SQL database is not initialized or missing configuration.');
    }
    return (instance as any)[prop];
  },
});

