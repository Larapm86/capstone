import { db } from '$lib/server/db';
import { user } from '$lib/server/db/auth.schema';
import { levelProgress } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

const THRESHOLDS = {
	fast: {
		L1_sessions: 4,
		L2_triggers: 2,
		L3_emotions: 6,
		L4_patterns: 3,
		L5_fullSessions: 3,
		L6_choices: 6,
		L7_days: 20
	},
	steady: {
		L1_sessions: 7,
		L2_triggers: 3,
		L3_emotions: 10,
		L4_patterns: 3,
		L5_fullSessions: 5,
		L6_choices: 10,
		L7_days: 30
	},
	slow: {
		L1_sessions: 10,
		L2_triggers: 4,
		L3_emotions: 14,
		L4_patterns: 4,
		L5_fullSessions: 7,
		L6_choices: 14,
		L7_days: 45
	}
} as const;

export async function checkLevelUnlock(userId: string) {
	const [u] = await db.select().from(user).where(eq(user.id, userId));
	if (!u) return;

	const pace = (u.paceProfile ?? 'steady') as keyof typeof THRESHOLDS;
	const t = THRESHOLDS[pace] ?? THRESHOLDS.steady;
	const current = u.currentLevel ?? 1;
	if (current >= 7) return;

	const [progress] = await db
		.select()
		.from(levelProgress)
		.where(eq(levelProgress.userId, userId));

	let shouldUnlock = false;
	switch (current) {
		case 1:
			shouldUnlock = (progress?.sessionsCompleted ?? 0) >= t.L1_sessions;
			break;
		case 2:
			shouldUnlock = ((progress?.uniqueTriggers as string[]) ?? []).length >= t.L2_triggers;
			break;
		case 3:
			shouldUnlock = (progress?.emotionsNamed ?? 0) >= t.L3_emotions;
			break;
		case 4:
			shouldUnlock = (progress?.familiarPatternsMarked ?? 0) >= t.L4_patterns;
			break;
		case 5:
			shouldUnlock = (progress?.fullSessionsCompleted ?? 0) >= t.L5_fullSessions;
			break;
		case 6:
			shouldUnlock = (progress?.consciousChoicesMade ?? 0) >= t.L6_choices;
			break;
		case 7:
			break;
	}

	if (shouldUnlock && current < 7) {
		const nextLevel = current + 1;
		await db.update(user).set({ currentLevel: nextLevel }).where(eq(user.id, userId));
		await db
			.update(levelProgress)
			.set({ unlockedAt: new Date(), level: nextLevel })
			.where(eq(levelProgress.userId, userId));
	}
}

export async function ensureLevelProgress(userId: string, level: number) {
	const [existing] = await db
		.select()
		.from(levelProgress)
		.where(eq(levelProgress.userId, userId));
	if (!existing) {
		await db.insert(levelProgress).values({
			userId,
			level
		});
	}
}

export async function updateProgressCounters(
	userId: string,
	session: {
		trigger?: string;
		emotion?: string;
		isFamiliar?: boolean;
		allQuestionsAnswered?: boolean;
		choiceMade?: string;
	}
) {
	const [progress] = await db
		.select()
		.from(levelProgress)
		.where(eq(levelProgress.userId, userId));

	// Ensure a row exists for new users (e.g. first session)
	if (!progress) {
		await db.insert(levelProgress).values({
			userId,
			level: 1
		});
	}

	const [current] = await db
		.select()
		.from(levelProgress)
		.where(eq(levelProgress.userId, userId));
	const uniqueTriggers = (current?.uniqueTriggers as string[]) ?? [];
	if (session.trigger && !uniqueTriggers.includes(session.trigger)) {
		uniqueTriggers.push(session.trigger);
	}

	await db
		.update(levelProgress)
		.set({
			sessionsCompleted: (current?.sessionsCompleted ?? 0) + 1,
			uniqueTriggers,
			emotionsNamed: session.emotion
				? (current?.emotionsNamed ?? 0) + 1
				: current?.emotionsNamed,
			familiarPatternsMarked: session.isFamiliar
				? (current?.familiarPatternsMarked ?? 0) + 1
				: current?.familiarPatternsMarked,
			fullSessionsCompleted: session.allQuestionsAnswered
				? (current?.fullSessionsCompleted ?? 0) + 1
				: current?.fullSessionsCompleted,
			consciousChoicesMade: session.choiceMade
				? (current?.consciousChoicesMade ?? 0) + 1
				: current?.consciousChoicesMade
		})
		.where(eq(levelProgress.userId, userId));
}
