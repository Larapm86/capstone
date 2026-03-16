import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { cravingSessions, setbacks } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import { updateProgressCounters, checkLevelUnlock } from '$lib/server/logic/levelUnlock';

export const POST: RequestHandler = async ({ request, locals }) => {
	const user = locals.user;
	if (!user?.id) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const body = await request.json();
	const { sessions = [], setbacks: setbackPayloads = [] } = body as {
		sessions?: Array<{ sessionId: string; answers: Record<string, unknown> }>;
		setbacks?: Array<{
			sessionId?: string;
			triggerBefore?: string;
			bodyNeed?: string;
			selfCompassion?: string;
			lesson?: string;
			valuesAnchor?: string;
		}>;
	};

	for (const s of sessions) {
		const [existing] = await db
			.select()
			.from(cravingSessions)
			.where(and(eq(cravingSessions.id, s.sessionId), eq(cravingSessions.userId, user.id)));
		if (existing && !existing.completedAt) {
			await db
				.update(cravingSessions)
				.set({
					completedAt: new Date(),
					craving: s.answers.craving as string | undefined,
					trigger: s.answers.trigger as string | undefined,
					emotion: s.answers.emotion as string | undefined,
					isFamiliar: s.answers.isFamiliar as boolean | undefined,
					familiarPattern: s.answers.familiarPattern as string | undefined,
					cognitiveReframe: s.answers.cognitiveReframe as string | undefined,
					bodyNeed: s.answers.bodyNeed as string | undefined,
					valuesAlignment: s.answers.valuesAlignment as string | undefined,
					choiceMade: s.answers.choiceMade as string | undefined,
					rewardReplacement: s.answers.rewardReplacement as string | undefined,
					allQuestionsAnswered: s.answers.allQuestionsAnswered as boolean | undefined,
					skippedQuestions: s.answers.skippedQuestions as string[] | undefined,
					sessionDuration: s.answers.sessionDuration as number | undefined
				})
				.where(eq(cravingSessions.id, s.sessionId));
			await updateProgressCounters(user.id, {
				trigger: s.answers.trigger as string | undefined,
				emotion: s.answers.emotion as string | undefined,
				isFamiliar: s.answers.isFamiliar as boolean | undefined,
				allQuestionsAnswered: s.answers.allQuestionsAnswered as boolean | undefined,
				choiceMade: s.answers.choiceMade as string | undefined
			});
		}
	}
	await checkLevelUnlock(user.id);

	for (const sb of setbackPayloads) {
		await db.insert(setbacks).values({
			userId: user.id,
			sessionId: sb.sessionId,
			triggerBefore: sb.triggerBefore,
			bodyNeed: sb.bodyNeed,
			selfCompassion: sb.selfCompassion,
			lesson: sb.lesson,
			valuesAnchor: sb.valuesAnchor,
			consciouslyProcessed: [sb.triggerBefore, sb.bodyNeed, sb.selfCompassion, sb.lesson].every(
				Boolean
			)
		});
	}

	return json({ ok: true, synced: { sessions: sessions.length, setbacks: setbackPayloads.length } });
};
