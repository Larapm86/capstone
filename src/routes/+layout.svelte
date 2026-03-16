<script lang="ts">
	import '$lib/app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { page } from '$app/stores';

	let { data, children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<nav class="border-b border-gray-300 bg-gray-50 px-4 py-3 shadow-sm">
	<div class="mx-auto flex max-w-4xl items-center gap-6">
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
