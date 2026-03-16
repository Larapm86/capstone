import { defineConfig } from 'drizzle-kit';

const PLACEHOLDER = 'postgres://user:password@host:port/db-name';
const url = process.env.DATABASE_URL?.trim();

if (!url || url === PLACEHOLDER) {
	throw new Error(
		'DATABASE_URL is not set or still the placeholder. Set your real Neon URL in .env and run with: pnpm db:migrate'
	);
}

try {
	new URL(url);
} catch {
	throw new Error(
		'DATABASE_URL is not a valid URL. Check .env — use the connection string from Neon dashboard (starts with postgresql://). If the password has special chars (@, #, etc.), URL-encode them.'
	);
}

export default defineConfig({
	schema: './src/lib/server/db/schema.ts',
	dialect: 'postgresql',
	dbCredentials: { url },
	verbose: true,
	strict: true
});
