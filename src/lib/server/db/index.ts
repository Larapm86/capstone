import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';
import * as authSchema from './auth.schema';
import { env } from '$env/dynamic/private';

const PLACEHOLDER_URL = 'postgres://user:password@host:port/db-name';

// Get DATABASE_URL from env helper or fallback to process.env (e.g. for CLI)
const databaseUrl = env.DATABASE_URL ?? process.env.DATABASE_URL;

if (!databaseUrl?.trim() || databaseUrl === PLACEHOLDER_URL) {
	throw new Error(
		'DATABASE_URL is not set or still the placeholder. Set it in .env'
	);
}

const client = neon(databaseUrl.trim());

// Optional: wake serverless compute to reduce first-query latency
function wakeUpDb() {
	client.query('SELECT 1').catch((err) => {
		console.error('Neon DB wake-up failed:', err);
	});
}
wakeUpDb();

export const db = drizzle(client, { schema: { ...schema, ...authSchema } });
export { authSchema };
