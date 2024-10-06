import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

if (!process.env['DATABASE_PATH']) {
  throw new Error('DATABASE_PATH is not set.');
}

export default defineConfig({
  dialect: 'sqlite',
  schema: './src/database/schema/index.ts',
  out: './drizzle',
  dbCredentials: {
    url: process.env['DATABASE_PATH'],
  },
});
