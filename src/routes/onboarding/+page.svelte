<script lang="ts">
	import { enhance } from '$app/forms';

	let step = $state(1);
	let startChoice = $state('where_i_am');
</script>

<div class="mx-auto max-w-md space-y-8">
	<h1 class="text-xl font-semibold text-gray-900">Onboarding</h1>

	{#if step === 1}
		<div class="space-y-4">
			<p class="text-gray-600">How do you want to start?</p>
			<div class="space-y-2">
				<label class="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 p-3">
					<input type="radio" bind:group={startChoice} value="where_i_am" />
					<span>Where I am</span>
				</label>
				<label class="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 p-3">
					<input type="radio" bind:group={startChoice} value="from_beginning" />
					<span>From the beginning</span>
				</label>
			</div>
			<button
				type="button"
				onclick={() => (step = 2)}
				class="w-full rounded-lg bg-gray-900 py-2 text-white"
			>
				Next
			</button>
		</div>
	{:else}
		<form method="post" action="?/save" use:enhance class="space-y-4">
			<input type="hidden" name="startChoice" value={startChoice} />
			<div>
				<label for="progressGoal" class="mb-1 block text-sm text-gray-700"
					>What’s one goal you have?</label
				>
				<textarea
					id="progressGoal"
					name="progressGoal"
					rows="2"
					class="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
					placeholder="e.g. feel more in control around food"
				></textarea>
			</div>
			<div class="flex gap-2">
				<button
					type="button"
					onclick={() => (step = 1)}
					class="rounded-lg border border-gray-300 px-4 py-2 text-gray-700"
				>
					Back
				</button>
				<button type="submit" class="rounded-lg bg-gray-900 px-4 py-2 text-white">
					Finish
				</button>
			</div>
		</form>
	{/if}
</div>
