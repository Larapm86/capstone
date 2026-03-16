import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { user } from '$lib/server/db/auth.schema';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async (event) => {
	if (!event.locals.user) {
		return redirect(302, '/demo/better-auth/login');
	}
	return {};
};

export const actions: Actions = {
	save: async (event) => {
		const u = event.locals.user;
		if (!u?.id) return fail(401, { message: 'Not logged in' });

		const formData = await event.request.formData();
		const startChoice = formData.get('startChoice')?.toString() ?? 'where_i_am';
		const progressGoal = formData.get('progressGoal')?.toString() ?? '';

		const startingLevel = startChoice === 'from_beginning' ? 1 : 2;
		await db
			.update(user)
			.set({
				onboardingAnswers: {
					startChoice,
					progressGoal
				},
				startingLevel
			})
			.where(eq(user.id, u.id));

		return redirect(302, '/session');
	}
};
