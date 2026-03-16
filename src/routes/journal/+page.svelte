<script lang="ts">
	import { onMount } from 'svelte';

	let sessions = $state<Array<{
		id: string;
		createdAt: string | null;
		completedAt: string | null;
		levelAtTime: number;
		craving: string | null;
		isSetback: boolean | null;
	}>>([]);
	let loading = $state(true);
	let error = $state('');
	let deletingId = $state<string | null>(null);

	async function loadSessions() {
		try {
			const res = await fetch('/api/sessions', { credentials: 'include' });
			if (!res.ok) {
				if (res.status === 401) {
					error = 'Log in to see your journal.';
					return;
				}
				throw new Error(res.statusText);
			}
			const data = await res.json();
			sessions = data.sessions ?? [];
			error = '';
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to load journal';
		} finally {
			loading = false;
		}
	}

	onMount(loadSessions);

	async function deleteEntry(id: string) {
		deletingId = id;
		try {
			const res = await fetch(`/api/sessions/${id}`, {
				method: 'DELETE',
				credentials: 'include'
			});
			if (!res.ok) {
				const data = await res.json().catch(() => ({}));
				throw new Error(data.error || res.statusText);
			}
			sessions = sessions.filter((s) => s.id !== id);
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to delete';
		} finally {
			deletingId = null;
		}
	}

	function formatDate(d: string | null) {
		if (!d) return '—';
		const date = new Date(d);
		return date.toLocaleDateString(undefined, {
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}
</script>

<div class="mx-auto max-w-md space-y-6">
	<h1 class="text-xl font-semibold text-gray-900">Journal</h1>
	<p class="text-gray-600">Your past craving sessions.</p>

	{#if loading}
		<p class="text-gray-500">Loading…</p>
	{:else if error}
		<p class="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>
		<a href="/demo/better-auth/login" class="text-blue-600 underline">Log in</a>
	{:else if sessions.length === 0}
		<div class="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center text-gray-600">
			No sessions yet. Start one from <a href="/session" class="text-blue-600 underline">Session</a>.
		</div>
	{:else}
		<p class="text-xs text-gray-500">Provisional: delete button for testing.</p>
		<ul class="space-y-3">
			{#each sessions as s (s.id)}
				<li class="flex items-start justify-between gap-2 rounded-lg border border-gray-200 bg-white p-3">
					<div class="min-w-0 flex-1">
						<div class="flex justify-between text-sm text-gray-500">
							<span>{formatDate(s.completedAt ?? s.createdAt)}</span>
							<span>Level {s.levelAtTime}</span>
						</div>
						{#if s.craving}
							<p class="mt-1 text-gray-900">{s.craving}</p>
						{/if}
						{#if s.isSetback}
							<span class="mt-1 inline-block text-xs text-amber-600">Setback</span>
						{/if}
					</div>
					<button
						type="button"
						class="shrink-0 rounded border border-red-200 bg-red-50 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-100 disabled:opacity-50"
						disabled={deletingId === s.id}
						onclick={() => deleteEntry(s.id)}
						title="Delete (provisional)"
					>
						{deletingId === s.id ? '…' : 'Delete'}
					</button>
				</li>
			{/each}
		</ul>
	{/if}
</div>
