import { drizzle } from 'drizzle-orm/bun-sqlite';
import { Database } from 'bun:sqlite';
import { resolve } from 'path';

import logger from 'logger';
import * as schema from './schema';

const _databasePath = process.env['DATABASE_PATH'];

if (!(typeof _databasePath == 'string')) {
  logger.error('No database path provided. Please configure database path inside .env file.');
  throw new Error('No database path provided. Please configure database path inside .env file.');
}

const dbPath = resolve(_databasePath);

const file = Bun.file(dbPath);

if (!await file.exists()) {
  logger.info(`Database does not exists at ${dbPath} and will be created...`);
}

const sqlite = new Database(dbPath, { strict: true, create: true });

export default drizzle(sqlite, { schema });
