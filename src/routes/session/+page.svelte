<script lang="ts">
	let sessionId = $state<string | null>(null);
	let level = $state(1);
	let loading = $state(false);
	let error = $state('');
	let done = $state(false);
	let craving = $state('');
	let trigger = $state('');
	let saving = $state(false);

	async function startSession() {
		loading = true;
		error = '';
		try {
			const res = await fetch('/api/session/start', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify({
					levelAtTime: level,
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
			const res = await fetch('/api/session/complete', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify({
					sessionId,
					answers: {
						craving: craving || undefined,
						trigger: trigger || undefined,
						allQuestionsAnswered: true
					}
				})
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
</script>

<div class="mx-auto max-w-md space-y-8">
	<h1 class="text-xl font-semibold text-gray-900">Craving session</h1>

	{#if done}
		<p class="rounded-lg bg-gray-100 p-4 text-gray-700">Session saved.</p>
		<button
			type="button"
			onclick={() => {
				sessionId = null;
				done = false;
				craving = '';
				trigger = '';
			}}
			class="rounded-lg bg-gray-900 px-4 py-2 text-white"
		>
			Start another
		</button>
	{:else if !sessionId}
		<p class="text-gray-600">Start a short reflection when you notice a craving.</p>
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
			<div>
				<label for="craving-input" class="mb-1 block text-sm text-gray-700"
					>What is your body asking for?</label
				>
				<input
					id="craving-input"
					type="text"
					bind:value={craving}
					class="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
					placeholder="e.g. something sweet"
				/>
			</div>
			<div>
				<label for="trigger" class="mb-1 block text-sm text-gray-700"
					>What arrived before this feeling? (optional)</label
				>
				<input
					id="trigger"
					type="text"
					bind:value={trigger}
					class="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
					placeholder="e.g. stress, boredom"
				/>
			</div>
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
