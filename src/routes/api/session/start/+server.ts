import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { cravingSessions } from '$lib/server/db/schema';
import { ensureLevelProgress } from '$lib/server/logic/levelUnlock';

export const POST: RequestHandler = async ({ request, locals }) => {
	const user = locals.user;
	if (!user?.id) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	let body: { levelAtTime?: number; isSetback?: boolean; offlineSession?: boolean };
	try {
		body = await request.json();
	} catch {
		return json({ error: 'Invalid JSON body' }, { status: 400 });
	}

	const levelAtTime = body.levelAtTime;
	if (typeof levelAtTime !== 'number') {
		return json({ error: 'levelAtTime required (number)' }, { status: 400 });
	}

	try {
		await ensureLevelProgress(user.id, levelAtTime);
	} catch (e) {
		const msg = e instanceof Error ? e.message : String(e);
		console.error('ensureLevelProgress error:', e);
		return json({ error: `Failed to ensure progress: ${msg}` }, { status: 500 });
	}

	try {
		const inserted = await db
			.insert(cravingSessions)
			.values({
				userId: user.id,
				levelAtTime,
				isSetback: body.isSetback ?? false,
				offlineSession: body.offlineSession ?? false
			})
			.returning({ id: cravingSessions.id });

		const sessionId = inserted[0]?.id;
		if (!sessionId) {
			return json({ error: 'Insert did not return session id' }, { status: 500 });
		}
		return json({ sessionId });
	} catch (e) {
		const msg = e instanceof Error ? e.message : String(e);
		console.error('session/start insert error:', e);
		return json({ error: `Failed to start session: ${msg}` }, { status: 500 });
	}
};
