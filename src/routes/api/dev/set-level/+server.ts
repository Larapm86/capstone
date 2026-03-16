import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { building } from '$app/environment';
import { db } from '$lib/server/db';
import { user } from '$lib/server/db/auth.schema';
import { levelProgress } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

/**
 * Dev-only: set current level for testing (1–7).
 * Disabled in production (when building).
 */
export const POST: RequestHandler = async ({ request, locals }) => {
	if (building) {
		return json({ error: 'Not available in production' }, { status: 403 });
	}

	const u = locals.user;
	if (!u?.id) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	let body: { level?: number };
	try {
		body = await request.json();
	} catch {
		return json({ error: 'Invalid JSON' }, { status: 400 });
	}

	const level = body.level;
	if (typeof level !== 'number' || level < 1 || level > 7) {
		return json({ error: 'level must be a number between 1 and 7' }, { status: 400 });
	}

	await db.update(user).set({ currentLevel: level }).where(eq(user.id, u.id));

	// Keep level_progress in sync so unlock logic doesn’t get confused
	const [existing] = await db
		.select()
		.from(levelProgress)
		.where(eq(levelProgress.userId, u.id));
	if (existing) {
		await db.update(levelProgress).set({ level }).where(eq(levelProgress.userId, u.id));
	} else {
		await db.insert(levelProgress).values({ userId: u.id, level });
	}

	return json({ ok: true, currentLevel: level });
};
