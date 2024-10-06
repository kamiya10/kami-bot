import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'sqlite',
  schema: './src/database/schema/index.ts',
  out: './drizzle',
  dbCredentials: {
    url: process.env['DATABASE_PATH'],
  },
});
