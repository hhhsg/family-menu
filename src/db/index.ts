import Database from 'better-sqlite3';
import * as schema from './schema';

const DB_PATH = process.env.DATABASE_PATH || './data/family-menu.db';

const sqlite = new Database(DB_PATH);

// Enable WAL mode for better concurrent read performance
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('foreign_keys = ON');

export const db = sqlite;
export { schema };
