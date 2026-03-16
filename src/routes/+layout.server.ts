import type { LayoutServerLoad } from './$types';
import { db } from '$lib/server/db';
import { user } from '$lib/server/db/auth.schema';
import { eq } from 'drizzle-orm';

export const load: LayoutServerLoad = async (event) => {
	const u = event.locals.user ?? null;
	let currentLevel: number | null = null;
	if (u?.id) {
		const [row] = await db
			.select({ currentLevel: user.currentLevel })
			.from(user)
			.where(eq(user.id, u.id));
		currentLevel = row?.currentLevel ?? 1;
	}
	return {
		user: u,
		currentLevel
	};
};
