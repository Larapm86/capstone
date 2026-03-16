import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { cravingSessions } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import { updateProgressCounters, checkLevelUnlock } from '$lib/server/logic/levelUnlock';

export const POST: RequestHandler = async ({ request, locals }) => {
	const user = locals.user;
	if (!user?.id) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const body = await request.json();
	const { sessionId, answers } = body as {
		sessionId: string;
		answers: Record<string, unknown>;
	};

	if (!sessionId || !answers) {
		return json({ error: 'sessionId and answers required' }, { status: 400 });
	}

	const [session] = await db
		.select()
		.from(cravingSessions)
		.where(and(eq(cravingSessions.id, sessionId), eq(cravingSessions.userId, user.id)));

	if (!session) {
		return json({ error: 'Session not found' }, { status: 404 });
	}

	await db
		.update(cravingSessions)
		.set({
			completedAt: new Date(),
			craving: answers.craving as string | undefined,
			trigger: answers.trigger as string | undefined,
			emotion: answers.emotion as string | undefined,
			isFamiliar: answers.isFamiliar as boolean | undefined,
			familiarPattern: answers.familiarPattern as string | undefined,
			cognitiveReframe: answers.cognitiveReframe as string | undefined,
			bodyNeed: answers.bodyNeed as string | undefined,
			valuesAlignment: answers.valuesAlignment as string | undefined,
			choiceMade: answers.choiceMade as string | undefined,
			rewardReplacement: answers.rewardReplacement as string | undefined,
			feelingBefore: answers.feelingBefore as number | undefined,
			feelingDuring: answers.feelingDuring as number | undefined,
			feelingAfter: answers.feelingAfter as number | undefined,
			urgesurfingUsed: answers.urgesurfingUsed as boolean | undefined,
			urgesurfingDuration: answers.urgesurfingDuration as number | undefined,
			allQuestionsAnswered: answers.allQuestionsAnswered as boolean | undefined,
			skippedQuestions: answers.skippedQuestions as string[] | undefined,
			sessionDuration: answers.sessionDuration as number | undefined
		})
		.where(eq(cravingSessions.id, sessionId));

	await updateProgressCounters(user.id, {
		trigger: answers.trigger as string | undefined,
		emotion: answers.emotion as string | undefined,
		isFamiliar: answers.isFamiliar as boolean | undefined,
		allQuestionsAnswered: answers.allQuestionsAnswered as boolean | undefined,
		choiceMade: answers.choiceMade as string | undefined
	});
	await checkLevelUnlock(user.id);

	return json({ ok: true });
};
