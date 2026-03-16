<script lang="ts">
	import '$lib/app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { page } from '$app/stores';
	import { invalidateAll } from '$app/navigation';

	let { data, children } = $props();
	let settingLevel = $state(false);

	async function setLevelForTesting(level: number) {
		settingLevel = true;
		try {
			const res = await fetch('/api/dev/set-level', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify({ level })
			});
			if (res.ok) await invalidateAll();
		} finally {
			settingLevel = false;
		}
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<nav class="border-b border-gray-300 bg-gray-50 px-4 py-3 shadow-sm">
	<div class="mx-auto flex max-w-4xl flex-wrap items-center gap-4">
		<div class="flex items-center gap-6">
			<a href="/" class="font-semibold text-gray-900">Becom</a>
			<a
				href="/onboarding"
				class="text-gray-700 hover:text-gray-900 hover:underline"
				class:font-semibold={$page.url.pathname === '/onboarding'}
			>
				Onboarding
			</a>
			<a
				href="/session"
				class="text-gray-700 hover:text-gray-900 hover:underline"
				class:font-semibold={$page.url.pathname === '/session'}
			>
				Session
			</a>
			<a
				href="/journal"
				class="text-gray-700 hover:text-gray-900 hover:underline"
				class:font-semibold={$page.url.pathname === '/journal'}
			>
				Journal
			</a>
			<a
				href="/progress"
				class="text-gray-700 hover:text-gray-900 hover:underline"
				class:font-semibold={$page.url.pathname === '/progress'}
			>
				Progress
			</a>
		</div>
		{#if import.meta.env.DEV && data.user}
			<div class="flex items-center gap-2 border-l border-gray-200 pl-4">
				<span class="text-xs text-amber-700">Level:</span>
				{#each [1, 2, 3, 4, 5, 6, 7] as lvl}
					<button
						type="button"
						disabled={settingLevel}
						class="rounded px-2 py-0.5 text-xs font-medium disabled:opacity-50 {data.currentLevel === lvl
							? 'bg-amber-600 text-white'
							: 'bg-amber-100 text-amber-800 hover:bg-amber-200'}"
						onclick={() => setLevelForTesting(lvl)}
						title="Set level to {lvl}"
					>
						{lvl}
					</button>
				{/each}
			</div>
		{/if}
		{#if data.user}
			<a
				href="/auth/signout"
				class="ml-auto text-gray-700 hover:text-gray-900 hover:underline"
			>
				Sign out
			</a>
		{:else}
			<a
				href="/demo/better-auth/login"
				class="ml-auto text-gray-700 hover:text-gray-900 hover:underline"
			>
				Log in
			</a>
		{/if}
	</div>
</nav>

<main class="mx-auto max-w-4xl px-4 py-8">
	{@render children()}
</main>
