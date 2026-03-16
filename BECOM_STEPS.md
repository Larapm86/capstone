# BECOM implementation – step-by-step

Use this as a checklist. Each step builds on the previous.

---

## Step 1: Stack (Tailwind + PWA) — DONE

- **Done:** Added to `package.json`: `tailwindcss`, `postcss`, `autoprefixer`, `vite-plugin-pwa`.
- **Done:** Created `postcss.config.js`, `tailwind.config.js`, `src/lib/app.css`; layout imports `$lib/app.css`.
- **Done:** Added `VitePWA` to `vite.config.ts` (manifest + workbox for `/session` and `/api/session`).
- **You do:** Run `pnpm install`. Optional: add `/icon-192.png` and `/icon-512.png` to `static/` for PWA icons.

---

## Step 2: Extend auth user table with BECOM fields — DONE

- **Done:** Added `currentLevel`, `startingLevel`, `onboardingAnswers`, `paceProfile`, `preferredDepth` to `user` in `auth.schema.ts`.

## Step 3: Add BECOM app tables — DONE

- **Done:** Added `cravingSessions`, `setbacks`, `levelProgress`, `offlineQueue` in `schema.ts`; removed `task`.

## Step 4: Drizzle config — DONE

- **Done:** `drizzle.config.ts` now includes both `schema.ts` and `auth.schema.ts`.

## Step 5: Run migration — YOU DO THIS

- Run: `pnpm install` (to get new deps from Step 1).
- Then: `pnpm db:generate` (creates a new migration for BECOM tables and user columns).
- Then: `pnpm db:push` (apply to Neon; or use `pnpm db:migrate` if you prefer migration files).
- If you already ran migrations before, you may need to resolve existing vs new tables (e.g. push will add new columns/tables).

## Step 6: Logic layer — DONE

- **Done:** `src/lib/server/logic/levelUnlock.ts` (checkLevelUnlock, updateProgressCounters, ensureLevelProgress), `src/lib/server/logic/sessionFlow.ts` (getQuestionsForLevel, getAdaptiveLevel, SETBACK_QUESTIONS, CLOSING_LINES).

## Step 7: API routes — DONE

- **Done:** `POST /api/session/start`, `POST /api/session/complete`, `POST /api/setback/complete`, `GET /api/user/progress`, `POST /api/offline/sync`. All require auth via `locals.user`.

## Step 8: UI — PLACEHOLDERS DONE

- **Done:** Placeholder pages at `/onboarding`, `/session`, `/journal`, `/progress` (Tailwind-ready). Replace with full CravingSession, SetbackFlow, UrgeSurfing, ValuesAnchor components and wire to the APIs when you build the real UI.

---

**Next actions for you**

1. Run `pnpm install` (Tailwind, PostCSS, PWA deps).
2. Run `pnpm db:generate` then `pnpm db:push` (or `pnpm db:migrate`) to apply schema changes to Neon.
3. Run `pnpm dev` and open `/onboarding`, `/session`, `/journal`, `/progress` to confirm routes load.
4. Optionally add PWA icons under `static/`: `icon-192.png`, `icon-512.png`.
5. Build out the real UI (forms, level-gated questions, setback flow, journal list, progress view) using the logic and API routes above.
