<script lang="ts">
	import { onMount } from 'svelte';

	let progress = $state<{
		currentLevel: number;
		startingLevel: number;
		paceProfile: string;
		sessionsCompleted: number;
		progress: { level: number; fullSessionsCompleted: number; consciousChoicesMade: number } | null;
	} | null>(null);
	let loading = $state(true);
	let error = $state('');

	onMount(async () => {
		try {
			const res = await fetch('/api/user/progress', { credentials: 'include' });
			if (!res.ok) {
				if (res.status === 401) {
					error = 'Log in to see your progress.';
					return;
				}
				throw new Error(res.statusText);
			}
			progress = await res.json();
			error = '';
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to load progress';
		} finally {
			loading = false;
		}
	});
</script>

<div class="mx-auto max-w-md space-y-6">
	<h1 class="text-xl font-semibold text-gray-900">Progress</h1>
	<p class="text-gray-600">Your level and activity.</p>

	{#if loading}
		<p class="text-gray-500">Loading…</p>
	{:else if error}
		<p class="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>
		<a href="/demo/better-auth/login" class="text-blue-600 underline">Log in</a>
	{:else if progress}
		<div class="space-y-4">
			<div class="rounded-lg border border-gray-200 bg-white p-4">
				<p class="text-sm text-gray-500">Current level</p>
				<p class="text-2xl font-semibold text-gray-900">{progress.currentLevel} / 7</p>
			</div>
			<div class="rounded-lg border border-gray-200 bg-white p-4">
				<p class="text-sm text-gray-500">Pace</p>
				<p class="font-medium text-gray-900">{progress.paceProfile}</p>
			</div>
			{#if progress.progress}
				<div class="rounded-lg border border-gray-200 bg-white p-4">
					<p class="text-sm text-gray-500">Session stats</p>
					<ul class="mt-2 space-y-1 text-gray-700">
						<li>Sessions completed: {progress.progress.fullSessionsCompleted ?? progress.sessionsCompleted}</li>
						<li>Conscious choices: {progress.progress.consciousChoicesMade ?? 0}</li>
					</ul>
				</div>
			{/if}
		</div>
	{/if}
</div>
