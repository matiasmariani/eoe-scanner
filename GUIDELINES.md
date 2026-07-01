# Allergy Scout — Project Guidelines

House law for agents and reviewers. A pattern endorsed here is **intentional** — do not flag it as a violation.

---

## Stack (exact versions)

| Package           | Version                                                              |
| ----------------- | -------------------------------------------------------------------- |
| Next.js           | 15.1 (App Router)                                                    |
| React             | 19.2.4                                                               |
| TypeScript        | 5.x (strict + `noUncheckedIndexedAccess`)                            |
| Tailwind CSS      | 4.3                                                                  |
| Framer Motion     | 12.42                                                                |
| Dexie (IndexedDB) | 4.4                                                                  |
| Zod               | 4.4                                                                  |
| Sentry            | 10.63                                                                |
| React Compiler    | **ENABLED** (`experimental.reactCompiler: true` in `next.config.js`) |

---

## React Compiler is ON

**Do NOT flag missing `useMemo`, `useCallback`, or `memo`.** The React Compiler (`babel-plugin-react-compiler`) handles memoization automatically. Adding manual memoization is redundant noise, not a fix.

---

## Architecture

```
src/app/          Next.js App Router — pages, layouts, Server Actions
src/components/   UI components (all are Client Components — see below)
src/lib/          Pure utilities, types, API clients, DB schema — NO React hooks
src/hooks/        Custom React hooks
src/contexts/     React contexts (AllergyContext, ThemeContext)
src/services/     External API wrappers (USDA FoodData Central)
__tests__/        Jest unit tests
```

**Rule:** `src/lib/` files must never import React hooks. Hooks belong in `src/hooks/` or components. Types shared across lib + components go in `src/lib/` (not a separate `src/types/`).

---

## Data Layer

- **Product lookups**: `lookupProductAction` Server Action (`src/app/actions.ts`) → Open Food Facts v3 → USDA FoodData Central fallback. No Apollo, no tRPC, no SWR, no React Query.
- **Persistence**: **Dexie (IndexedDB)** for everything — scan history (`db.scans`), Safe Snacks Collection (`db.collection`), allergy settings (`db.settings`), history (`db.history`). The DB schema lives in `src/lib/db.ts`.
- **Legacy migration**: `AllergyContext` reads from `localStorage` once on first load and migrates to Dexie. After migration, `localStorage` is cleared. Do not add new `localStorage` usage.
- **No server-side state**: no sessions, no database, no auth. Intentional — COPPA-friendly offline-first design.

---

## All Components Are Client Components

Every file in `src/components/` is `'use client'`. This is intentional: the app requires camera access (BarcodeDetector), IndexedDB (Dexie), and browser event handlers throughout. Do not flag `'use client'` on these files or suggest moving logic to Server Components.

The only Server Component in the app is `src/app/page.tsx`, which is a thin shell that renders `<HomeClient />`.

---

## Intentional Patterns — Do Not Flag

| Pattern                                                               | Why it's intentional                                                                                            |
| --------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| No `tailwind.config.js`                                               | Tailwind v4 uses CSS-first config via `@theme` in `globals.css`                                                 |
| Hardcoded shadow values like `shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]` | Voxel/arcade design language; `--shadow-voxel` token also available                                             |
| `BarcodeDetector` feature-detect + ponyfill fallback                  | Native API (Android Chrome ML Kit, Safari 17+) with `barcode-detector` (zxing-wasm) fallback — same API surface |
| Emoji in UI labels (`🥜`, `🥛`, etc.)                                 | Kid-friendly UX, intentional in `ALLERGY_OPTIONS`                                                               |
| All components `'use client'`                                         | Browser APIs required throughout (camera, IndexedDB)                                                            |
| No auth, no accounts                                                  | COPPA-friendly design; data stays on-device                                                                     |
| Dexie for all persistence                                             | Offline-first; chosen over `localStorage` for structured queries and IndexedDB reliability                      |
| `data-theme` attribute on root + CSS custom property theming          | Multi-theme system (minecraft, kitty); themes defined in `globals.css`                                          |
| `CONFIG` / `UI` / `CAMERA` constant aliases in `src/lib/constants.ts` | `UI` and `CAMERA` are backward-compat aliases for `CONFIG`; do not remove                                       |

---

## Styling

- **Tailwind v4, CSS-first.** Theme tokens live in `@theme {}` in `src/app/globals.css`. Custom utilities use `@utility` blocks (also in `globals.css`). Do not create a `tailwind.config.js`.
- **Design tokens**: Use `bg-theme-bg`, `text-theme-text`, `text-theme-primary`, `border-theme-border`, etc. — not raw hex values. Raw hex is only acceptable inside `globals.css` theme definitions.
- **Fonts**: Loaded via `next/font` in `src/app/layout.tsx`. Do not `@import` fonts in CSS.
- **className utility**: Use `clsx` or `tailwind-merge` for conditional classes, not string concatenation.
- **Voxel shadows**: Use `shadow-voxel` (token) or `shadow-[NpxNpx0px0px_rgba(0,0,0,1)]` for the hard-shadow aesthetic.

---

## TypeScript

- `strict: true` + `noUncheckedIndexedAccess: true`. Array index access returns `T | undefined` — always guard with `?? fallback` or explicit checks.
- Path alias `@/` maps to `src/`. Use it; do not use relative `../../` paths across feature boundaries.
- No `any`. Use `unknown` + narrowing, or a precise type.

---

## Testing

- **Jest 30** + `jest-environment-jsdom` + `@testing-library/react`
- Tests live in `__tests__/` at the project root, named `*.test.ts(x)`
- Run with `npm test` (via `next/jest` wrapper for proper Next.js integration)
- No Playwright, no Vitest, no Storybook

---

## Code Style

Enforced by Prettier + ESLint on every commit (husky + lint-staged):

- Single quotes, semicolons, 2-space indent, trailing commas everywhere, 80-char print width
- ESLint: `eslint-config-next` (includes `@typescript-eslint`, `react-hooks`, `@next/next` rules)
- Run `npm run validate` (typecheck + lint) before pushing; CI fails on errors

---

## Allergen Logic

- **Single source of truth**: `src/lib/constants.ts` — `Allergy` type, `ALLERGY_OPTIONS`, `ALLERGEN_KEYWORDS`
- **Matching**: `src/lib/allergen-utils.ts` — `checkAllergens()` is the canonical function; do not duplicate keyword matching logic elsewhere
- `isSafe: false` is the **safe default** — unknown products must never be marked safe

---

## Error Monitoring

Sentry is integrated via `@sentry/nextjs`. Client config in `src/instrumentation-client.ts`, server in `sentry.server.config.ts`, edge in `sentry.edge.config.ts`. Use `logError(context, error)` from `src/lib/errorHandling.ts` for structured error reporting in hooks and components.

**COPPA privacy rules (do not regress):** `sendDefaultPii` must stay `false`, Session Replay must NOT be enabled (no `replayIntegration()`), and all init sites route events through `scrubEvent`/`scrubTransaction` from `src/lib/sentry-scrub.ts`, which strips IPs, request metadata, barcodes, and console breadcrumbs.
