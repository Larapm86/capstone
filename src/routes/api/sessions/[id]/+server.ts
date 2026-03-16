import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { cravingSessions } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';

/**
 * DELETE a craving session. Provisional — for testing.
 * Only allows deleting the current user's sessions.
 */
export const DELETE: RequestHandler = async ({ params, locals }) => {
	const user = locals.user;
	if (!user?.id) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const id = params.id;
	if (!id) {
		return json({ error: 'Session id required' }, { status: 400 });
	}

	const [existing] = await db
		.select({ id: cravingSessions.id })
		.from(cravingSessions)
		.where(and(eq(cravingSessions.id, id), eq(cravingSessions.userId, user.id)));

	if (!existing) {
		return json({ error: 'Session not found or not yours' }, { status: 404 });
	}

	await db
		.delete(cravingSessions)
		.where(eq(cravingSessions.id, id));

	return json({ ok: true });
};
