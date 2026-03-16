<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
</script>

<div class="mx-auto max-w-sm space-y-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
	<h1 class="text-xl font-semibold text-gray-900">Login</h1>
	<form method="post" action="?/signInEmail" use:enhance class="space-y-4">
		<div>
			<label for="email" class="mb-1 block text-sm font-medium text-gray-700">Email</label>
			<input
				id="email"
				type="email"
				name="email"
				required
				class="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
				placeholder="you@example.com"
			/>
		</div>
		<div>
			<label for="password" class="mb-1 block text-sm font-medium text-gray-700">Password</label>
			<input
				id="password"
				type="password"
				name="password"
				required
				class="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
			/>
		</div>
		<div>
			<label for="name" class="mb-1 block text-sm font-medium text-gray-700">
				Name <span class="text-gray-500">(for registration)</span>
			</label>
			<input
				id="name"
				type="text"
				name="name"
				class="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
				placeholder="Your name"
			/>
		</div>
		<div class="flex gap-3 pt-2">
			<button
				type="submit"
				class="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
			>
				Login
			</button>
			<button
				type="submit"
				formaction="?/signUpEmail"
				class="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
			>
				Register
			</button>
		</div>
	</form>
	{#if form?.message}
		<p class="text-sm text-red-600">{form.message}</p>
	{/if}
</div>
