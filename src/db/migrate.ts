// Programmatic migration runner for production (runs at Docker startup)
import Database from 'better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { drizzle } from 'drizzle-orm/better-sqlite3';

const DB_PATH = process.env.DATABASE_PATH || './data/family-menu.db';

const sqlite = new Database(DB_PATH);
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('foreign_keys = ON');

const db = drizzle(sqlite);

console.log('Running database migrations...');
migrate(db, { migrationsFolder: './drizzle' });
console.log('Migrations complete.');

sqlite.close();
