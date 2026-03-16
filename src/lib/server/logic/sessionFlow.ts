export function getQuestionsForLevel(level: number) {
	return {
		q1_craving: level >= 1,
		q2_trigger: level >= 2,
		q3_emotion: level >= 3,
		urgesurfing: level >= 3,
		q4_familiar: level >= 4,
		q4_reframe: level >= 4,
		q5_bodyNeed: level >= 5,
		q5_valuesAnchor: level >= 5,
		q6_choice: level >= 6,
		q6_reward: level >= 6,
		q7_compressed: level === 7,
		q7_tracking: level === 7
	};
}

export function getAdaptiveLevel(
	userLevel: number,
	todayMood: 'overwhelmed' | 'okay' | 'ready'
): number {
	if (todayMood === 'overwhelmed') return Math.max(1, userLevel - 2);
	if (todayMood === 'okay') return Math.max(1, userLevel - 1);
	return userLevel;
}

export const SETBACK_QUESTIONS = [
	{ id: 'trigger_before', text: 'What was happening just before?' },
	{ id: 'body_need', text: 'What did your body need in that moment?' },
	{ id: 'self_compassion', text: 'What would you say to a friend who just went through this?' },
	{ id: 'lesson', text: "What's one thing this moment is teaching you?" }
];

export const COMMON_HUMANITY =
	"You're not the only one who's been here tonight.";

export const CLOSING_LINES: Record<number, string> = {
	1: 'You paused. That matters more than you know.',
	2: "Patterns aren't weakness. They're information.",
	3: 'Emotional hunger is a messenger. You just learned to read it.',
	4: 'You are not broken. You have been using a habit that no longer serves you.',
	5: "Knowing what you need is not weakness. It's the whole point.",
	6: 'Knowing why you eat makes deciding what to eat much easier.',
	7: "Food is your fuel, not your therapist. You know the difference now."
};
