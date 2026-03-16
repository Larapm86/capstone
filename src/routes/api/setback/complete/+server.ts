import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { setbacks } from '$lib/server/db/schema';

export const POST: RequestHandler = async ({ request, locals }) => {
	const user = locals.user;
	if (!user?.id) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const body = await request.json();
	const { sessionId, triggerBefore, bodyNeed, selfCompassion, lesson, valuesAnchor } = body as {
		sessionId?: string;
		triggerBefore?: string;
		bodyNeed?: string;
		selfCompassion?: string;
		lesson?: string;
		valuesAnchor?: string;
	};

	const allAnswered = [triggerBefore, bodyNeed, selfCompassion, lesson].every(Boolean);

	await db.insert(setbacks).values({
		userId: user.id,
		sessionId: sessionId ?? undefined,
		triggerBefore,
		bodyNeed,
		selfCompassion,
		lesson,
		valuesAnchor,
		consciouslyProcessed: allAnswered
	});

	return json({ ok: true });
};
