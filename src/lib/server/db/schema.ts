import { pgTable, text, integer, boolean, timestamp, jsonb, uuid } from 'drizzle-orm/pg-core';
import { user } from './auth.schema';

// ── CRAVING SESSIONS ─────────────────────────────────────
export const cravingSessions = pgTable('craving_sessions', {
	id: uuid('id').primaryKey().defaultRandom(),
	userId: text('userId')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	createdAt: timestamp('created_at').defaultNow(),
	completedAt: timestamp('completed_at'),
	levelAtTime: integer('level_at_time').notNull(),

	craving: text('craving'),
	trigger: text('trigger'),
	emotion: text('emotion'),
	isFamiliar: boolean('is_familiar'),
	familiarPattern: text('familiar_pattern'),
	cognitiveReframe: text('cognitive_reframe'),
	bodyNeed: text('body_need'),
	valuesAlignment: text('values_alignment'),

	choiceMade: text('choice_made'),
	rewardReplacement: text('reward_replacement'),

	feelingBefore: integer('feeling_before'),
	feelingDuring: integer('feeling_during'),
	feelingAfter: integer('feeling_after'),

	urgesurfingUsed: boolean('urgesurfing_used').default(false),
	urgesurfingDuration: integer('urgesurfing_duration'),

	allQuestionsAnswered: boolean('all_questions_answered').default(false),
	isSetback: boolean('is_setback').default(false),
	skippedQuestions: jsonb('skipped_questions'),
	sessionDuration: integer('session_duration'),
	offlineSession: boolean('offline_session').default(false)
});

// ── SETBACKS ─────────────────────────────────────────────
export const setbacks = pgTable('setbacks', {
	id: uuid('id').primaryKey().defaultRandom(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	sessionId: uuid('session_id').references(() => cravingSessions.id),
	createdAt: timestamp('created_at').defaultNow(),

	triggerBefore: text('trigger_before'),
	bodyNeed: text('body_need'),
	selfCompassion: text('self_compassion'),
	lesson: text('lesson'),
	valuesAnchor: text('values_anchor'),
	consciouslyProcessed: boolean('consciously_processed').default(false)
});

// ── LEVEL PROGRESS ───────────────────────────────────────
export const levelProgress = pgTable('level_progress', {
	id: uuid('id').primaryKey().defaultRandom(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	level: integer('level').notNull(),
	unlockedAt: timestamp('unlocked_at'),

	sessionsCompleted: integer('sessions_completed').default(0),
	triggersIdentified: integer('triggers_identified').default(0),
	uniqueTriggers: jsonb('unique_triggers'),
	emotionsNamed: integer('emotions_named').default(0),
	familiarPatternsMarked: integer('familiar_patterns_marked').default(0),
	fullSessionsCompleted: integer('full_sessions_completed').default(0),
	consciousChoicesMade: integer('conscious_choices_made').default(0),
	consciousResponseDays: integer('conscious_response_days').default(0),
	totalDaysTracked: integer('total_days_tracked').default(0)
});

// ── OFFLINE QUEUE (PWA) ───────────────────────────────────
export const offlineQueue = pgTable('offline_queue', {
	id: uuid('id').primaryKey().defaultRandom(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	payload: jsonb('payload').notNull(),
	createdOfflineAt: timestamp('created_offline_at').notNull(),
	syncedAt: timestamp('synced_at'),
	syncFailed: boolean('sync_failed').default(false)
});
