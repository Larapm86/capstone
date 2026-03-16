import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { cravingSessions } from '$lib/server/db/schema';
import { eq, desc } from 'drizzle-orm';

export const GET: RequestHandler = async ({ locals }) => {
	const user = locals.user;
	if (!user?.id) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const sessions = await db
		.select({
			id: cravingSessions.id,
			createdAt: cravingSessions.createdAt,
			completedAt: cravingSessions.completedAt,
			levelAtTime: cravingSessions.levelAtTime,
			craving: cravingSessions.craving,
			isSetback: cravingSessions.isSetback
		})
		.from(cravingSessions)
		.where(eq(cravingSessions.userId, user.id))
		.orderBy(desc(cravingSessions.createdAt))
		.limit(50);

	return json({ sessions });
};
