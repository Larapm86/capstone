// Re-export from shared $lib so server and client use the same logic
export {
	getQuestionsForLevel,
	getAdaptiveLevel,
	SETBACK_QUESTIONS,
	COMMON_HUMANITY,
	CLOSING_LINES
} from '$lib/sessionFlow';
