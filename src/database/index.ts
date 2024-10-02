import { drizzle } from 'drizzle-orm/bun-sqlite';
import { Database } from 'bun:sqlite';

import * as schema from './schema';

const sqlite = new Database(process.env['DATABASE'], { strict: true });

export default drizzle(sqlite, { schema });
