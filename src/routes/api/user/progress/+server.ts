import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { user } from '$lib/server/db/auth.schema';
import { levelProgress } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const GET: RequestHandler = async ({ locals }) => {
	const u = locals.user;
	if (!u?.id) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const [profile] = await db.select().from(user).where(eq(user.id, u.id));
	const [progress] = await db
		.select()
		.from(levelProgress)
		.where(eq(levelProgress.userId, u.id));

	return json({
		currentLevel: profile?.currentLevel ?? 1,
		startingLevel: profile?.startingLevel ?? 1,
		paceProfile: profile?.paceProfile ?? 'steady',
		sessionsCompleted: progress?.sessionsCompleted ?? 0,
		// Expose only what the UI needs; do not expose raw thresholds
		progress: progress
			? {
					level: progress.level,
					unlockedAt: progress.unlockedAt,
					sessionsCompleted: progress.sessionsCompleted,
					fullSessionsCompleted: progress.fullSessionsCompleted,
					consciousChoicesMade: progress.consciousChoicesMade
				}
			: null
	});
};
