<script lang="ts">
	import { onMount } from 'svelte';
	import {
		getQuestionsForLevel,
		getAdaptiveLevel,
		CLOSING_LINES
	} from '$lib/sessionFlow';

	let sessionId = $state<string | null>(null);
	let userLevel = $state(1);
	let todayMood = $state<'overwhelmed' | 'okay' | 'ready'>('ready');
	let effectiveLevel = $state(1);
	let showMoodStep = $state(true);
	let loading = $state(false);
	let error = $state('');
	let done = $state(false);
	let saving = $state(false);

	// Answers keyed for API
	let craving = $state('');
	let trigger = $state('');
	let emotion = $state('');
	let isFamiliar = $state<boolean | null>(null);
	let familiarPattern = $state('');
	let cognitiveReframe = $state('');
	let bodyNeed = $state('');
	let valuesAlignment = $state('');
	let choiceMade = $state('');
	let rewardReplacement = $state('');
	let feelingBefore = $state<number | null>(null);
	let feelingDuring = $state<number | null>(null);
	let feelingAfter = $state<number | null>(null);
	let urgesurfingUsed = $state(false);

	let progressLoading = $state(true);

	onMount(async () => {
		try {
			const res = await fetch('/api/user/progress', { credentials: 'include' });
			if (res.ok) {
				const data = await res.json();
				userLevel = data.currentLevel ?? 1;
				effectiveLevel = getAdaptiveLevel(userLevel, 'ready');
			}
		} finally {
			progressLoading = false;
		}
	});

	function applyMood() {
		effectiveLevel = getAdaptiveLevel(userLevel, todayMood);
		showMoodStep = false;
	}

	const q = $derived(getQuestionsForLevel(effectiveLevel));

	async function startSession() {
		loading = true;
		error = '';
		try {
			const res = await fetch('/api/session/start', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify({
					levelAtTime: effectiveLevel,
					isSetback: false,
					offlineSession: false
				})
			});
			if (!res.ok) {
				const data = await res.json().catch(() => ({}));
				throw new Error(data.error || res.statusText);
			}
			const data = await res.json();
			sessionId = data.sessionId;
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to start session';
		} finally {
			loading = false;
		}
	}

	async function saveSession() {
		saving = true;
		error = '';
		try {
			const answers: Record<string, unknown> = {
				craving: craving || undefined,
				trigger: trigger || undefined,
				emotion: emotion || undefined,
				isFamiliar: isFamiliar ?? undefined,
				familiarPattern: familiarPattern || undefined,
				cognitiveReframe: cognitiveReframe || undefined,
				bodyNeed: bodyNeed || undefined,
				valuesAlignment: valuesAlignment || undefined,
				choiceMade: choiceMade || undefined,
				rewardReplacement: rewardReplacement || undefined,
				feelingBefore: feelingBefore ?? undefined,
				feelingDuring: feelingDuring ?? undefined,
				feelingAfter: feelingAfter ?? undefined,
				urgesurfingUsed,
				allQuestionsAnswered: true
			};
			const res = await fetch('/api/session/complete', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify({ sessionId, answers })
			});
			if (!res.ok) {
				const data = await res.json().catch(() => ({}));
				throw new Error(data.error || res.statusText);
			}
			done = true;
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to save session';
		} finally {
			saving = false;
		}
	}

	function resetSession() {
		sessionId = null;
		done = false;
		craving = '';
		trigger = '';
		emotion = '';
		isFamiliar = null;
		familiarPattern = '';
		cognitiveReframe = '';
		bodyNeed = '';
		valuesAlignment = '';
		choiceMade = '';
		rewardReplacement = '';
		feelingBefore = null;
		feelingDuring = null;
		feelingAfter = null;
		urgesurfingUsed = false;
		showMoodStep = true;
	}

	const closingLine = $derived(CLOSING_LINES[effectiveLevel] ?? CLOSING_LINES[1]);
</script>

<div class="mx-auto max-w-md space-y-8">
	<h1 class="text-xl font-semibold text-gray-900">Craving session</h1>

	{#if progressLoading}
		<p class="text-gray-500">Loading…</p>
	{:else if done}
		<div class="space-y-4">
			<p class="rounded-lg bg-gray-100 p-4 text-gray-700">{closingLine}</p>
			<p class="text-sm text-gray-500">Session saved.</p>
			<button
				type="button"
				onclick={resetSession}
				class="rounded-lg bg-gray-900 px-4 py-2 text-white"
			>
				Start another
			</button>
		</div>
	{:else if showMoodStep && !sessionId}
		<div class="space-y-4">
			<p class="text-gray-600">How are you today? This adjusts which questions you see.</p>
			<div class="space-y-2">
				<label class="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 p-3">
					<input type="radio" bind:group={todayMood} value="overwhelmed" />
					<span>Overwhelmed</span>
				</label>
				<label class="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 p-3">
					<input type="radio" bind:group={todayMood} value="okay" />
					<span>Okay</span>
				</label>
				<label class="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 p-3">
					<input type="radio" bind:group={todayMood} value="ready" />
					<span>Ready</span>
				</label>
			</div>
			<button
				type="button"
				class="w-full rounded-lg bg-gray-900 py-2 text-white"
				onclick={applyMood}
			>
				Continue
			</button>
		</div>
	{:else if !sessionId}
		<p class="text-gray-600">
			Starting at level {effectiveLevel}. Start a short reflection when you notice a craving.
		</p>
		<button
			type="button"
			class="w-full rounded-lg bg-gray-900 py-2 text-white disabled:opacity-50"
			disabled={loading}
			onclick={startSession}
		>
			{loading ? 'Starting…' : 'Start session'}
		</button>
		{#if error}
			<p class="text-sm text-red-600">{error}</p>
		{/if}
	{:else}
		<div class="space-y-4">
			{#if q.q1_craving}
				<div>
					<label for="craving" class="mb-1 block text-sm text-gray-700"
						>What is your body asking for?</label
					>
					<input
						id="craving"
						type="text"
						bind:value={craving}
						class="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
						placeholder="e.g. something sweet"
					/>
				</div>
			{/if}
			{#if q.q2_trigger}
				<div>
					<label for="trigger" class="mb-1 block text-sm text-gray-700"
						>What arrived before this feeling?</label
					>
					<input
						id="trigger"
						type="text"
						bind:value={trigger}
						class="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
						placeholder="e.g. stress, boredom"
					/>
				</div>
			{/if}
			{#if q.q3_emotion}
				<div>
					<label for="emotion" class="mb-1 block text-sm text-gray-700"
						>What is this craving trying to tell you?</label
					>
					<input
						id="emotion"
						type="text"
						bind:value={emotion}
						class="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
						placeholder="e.g. I need a break"
					/>
				</div>
			{/if}
			{#if q.urgesurfing}
				<div class="flex items-center gap-2">
					<input
						id="urgesurfing"
						type="checkbox"
						bind:checked={urgesurfingUsed}
						class="rounded border-gray-300"
					/>
					<label for="urgesurfing" class="text-sm text-gray-700">I used urge surfing</label>
				</div>
			{/if}
			{#if q.q4_familiar}
				<div>
					<label class="mb-1 block text-sm text-gray-700">Does this feel familiar?</label>
					<div class="flex gap-4">
						<label class="flex items-center gap-2">
							<input type="radio" bind:group={isFamiliar} value={true} />
							Yes
						</label>
						<label class="flex items-center gap-2">
							<input type="radio" bind:group={isFamiliar} value={false} />
							No
						</label>
					</div>
				</div>
			{/if}
			{#if q.q4_reframe}
				<div>
					<label for="reframe" class="mb-1 block text-sm text-gray-700"
						>What story are you telling yourself?</label
					>
					<input
						id="reframe"
						type="text"
						bind:value={cognitiveReframe}
						class="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
					/>
				</div>
				{#if isFamiliar}
					<div>
						<label for="familiarPattern" class="mb-1 block text-sm text-gray-700"
							>What emotion usually asks for this?</label
						>
						<input
							id="familiarPattern"
							type="text"
							bind:value={familiarPattern}
							class="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
						/>
					</div>
				{/if}
			{/if}
			{#if q.q5_bodyNeed}
				<div>
					<label for="bodyNeed" class="mb-1 block text-sm text-gray-700"
						>What does your body actually need?</label
					>
					<input
						id="bodyNeed"
						type="text"
						bind:value={bodyNeed}
						class="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
					/>
				</div>
			{/if}
			{#if q.q5_valuesAnchor}
				<div>
					<label for="valuesAlignment" class="mb-1 block text-sm text-gray-700"
						>Is this toward or away from what matters to you?</label
					>
					<input
						id="valuesAlignment"
						type="text"
						bind:value={valuesAlignment}
						class="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
						placeholder="toward / away"
					/>
				</div>
			{/if}
			{#if q.q6_choice}
				<div>
					<label for="choiceMade" class="mb-1 block text-sm text-gray-700"
						>What do you want to do with it?</label
					>
					<select
						id="choiceMade"
						bind:value={choiceMade}
						class="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
					>
						<option value="">—</option>
						<option value="redirect">Redirect</option>
						<option value="sit_with_it">Sit with it</option>
						<option value="honor_consciously">Honor consciously</option>
					</select>
				</div>
			{/if}
			{#if q.q6_reward}
				<div>
					<label for="rewardReplacement" class="mb-1 block text-sm text-gray-700"
						>What satisfied the real need? (reward replacement)</label
					>
					<input
						id="rewardReplacement"
						type="text"
						bind:value={rewardReplacement}
						class="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
					/>
				</div>
			{/if}
			{#if q.q7_tracking}
				<div class="space-y-2">
					<p class="text-sm text-gray-700">How did you feel (1–5)?</p>
					<div class="flex gap-4">
						<div>
							<label for="fb" class="text-xs text-gray-500">Before</label>
							<input
								id="fb"
								type="number"
								min="1"
								max="5"
								bind:value={feelingBefore}
								class="w-14 rounded border border-gray-300 px-2 py-1"
							/>
						</div>
						<div>
							<label for="fd" class="text-xs text-gray-500">During</label>
							<input
								id="fd"
								type="number"
								min="1"
								max="5"
								bind:value={feelingDuring}
								class="w-14 rounded border border-gray-300 px-2 py-1"
							/>
						</div>
						<div>
							<label for="fa" class="text-xs text-gray-500">After</label>
							<input
								id="fa"
								type="number"
								min="1"
								max="5"
								bind:value={feelingAfter}
								class="w-14 rounded border border-gray-300 px-2 py-1"
							/>
						</div>
					</div>
				</div>
			{/if}

			<button
				type="button"
				class="w-full rounded-lg bg-gray-900 py-2 text-white disabled:opacity-50"
				disabled={saving}
				onclick={saveSession}
			>
				{saving ? 'Saving…' : 'Save session'}
			</button>
		</div>
		{#if error}
			<p class="text-sm text-red-600">{error}</p>
		{/if}
	{/if}
</div>
