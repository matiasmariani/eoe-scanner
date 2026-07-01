# Allergy Scout — Project Guidelines

> This file is the source of truth for agent tools (opencode, etc.). It mirrors the conventions in `AGENTS.md` and `CLAUDE.md` and adds detail needed for automated audits.

---

## Project Identity

**Allergy Scout** — a kid-friendly mobile web app for scanning product barcodes and checking for allergens. Focus on mobile-first design and "voxel/arcade" aesthetics.

---

## Tech Stack

| Layer            | Choice                                                                  |
| ---------------- | ----------------------------------------------------------------------- |
| Framework        | Next.js 15 (App Router)                                                 |
| UI               | React 19, Tailwind CSS **v4** (CSS-first)                               |
| Animation        | Framer Motion                                                           |
| Barcode scanning | Native `BarcodeDetector` API + `barcode-detector` ponyfill (zxing-wasm) |
| Data             | Open Food Facts API v3.6 (primary), USDA FoodData Central (fallback)    |
| State            | `localStorage` only — no accounts (COPPA-friendly)                      |
| Error tracking   | Sentry                                                                  |
| Testing          | Jest + Testing Library                                                  |

---

## Versions (for audit tools)

- **Next.js**: 15.x — `params`/`searchParams`/`cookies()`/`headers()` are Promises and must be `await`ed
- **React**: 19.x — `ref` is a plain prop (no `forwardRef`); `use()`, `useActionState`, `useFormStatus`, `useOptimistic` available
- **React Compiler**: **ENABLED** (`reactCompiler: true` in `next.config.js`) — do NOT flag `useMemo`/`useCallback` as missing; the compiler handles memoization automatically
- **Tailwind CSS**: v4 — configured CSS-first via `@theme` in `src/app/globals.css`; there is **no** `tailwind.config.js`

---

## Data Fetching Pattern

This project uses **Server Actions**, not Apollo/GraphQL and not raw `fetch` from client components.

- Product lookups go through `lookupProductAction` in `src/app/actions.ts` (Server Action)
- The Server Action calls Open Food Facts directly and falls back to USDA
- Do NOT recommend Apollo patterns, GraphQL, or `useQuery`/`useMutation` — they are not used here
- Client components call Server Actions via `useTransition` or form `action` props

---

## Architecture

```
src/app/           Next.js App Router (layout, page, loading, error, not-found)
src/components/    UI components (Scanner, ResultCard, HistoryView, etc.)
src/lib/           Pure utilities and API clients (no React hooks)
src/hooks/         Custom React hooks (always 'use client')
src/contexts/      React context providers (always 'use client')
src/services/      External service clients (USDA, etc.)
```

**Key rule:** `src/lib/` files must never import React hooks. If a utility is needed by both server and client code, it belongs in `src/lib/` as a pure function. Hook-dependent logic goes in `src/hooks/`.

---

## Important Configuration & Intentional Patterns

- **Tailwind v4 CSS-first**: Custom design tokens (`shadow-voxel`, arcade animations) are defined in `src/app/globals.css` under `@theme`. There is no `tailwind.config.js` — this is intentional, not a missing file.
- **`clsx` + `tailwind-merge`**: Use `cn()` from `src/lib/utils.ts` for conditional class composition. Raw string concatenation in `className` is a code smell.
- **Allergen single source of truth**: `Allergy` type, `ALLERGY_OPTIONS`, and `ALLERGEN_KEYWORDS` all live in `src/lib/constants.ts`. Do not redefine allergen data elsewhere.
- **Allergen matching**: Logic lives in `src/lib/allergen-utils.ts`. Do not duplicate matching logic in components.
- **Permissions policy**: `camera`, `microphone`, and `geolocation` are configured in `next.config.js` headers. This is intentional for barcode scanning.
- **No server-side auth**: This is a public app with no user accounts — `localStorage` only. Do not flag the absence of auth middleware as a violation.
- **`src/lib/db.ts` and `src/lib/history-db.ts`**: Use Dexie (IndexedDB) for scan history. These are client-only — they must only be imported from `'use client'` components or hooks.
- **`BarcodeDetector` ponyfill**: `src/components/Scanner.tsx` conditionally loads the ponyfill. The feature-detection pattern (checking for native API then falling back) is intentional.

---

## Development Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run validate     # Primary CI check: tsc --noEmit && eslint .
npm run lint         # ESLint only
npm run typecheck    # tsc --noEmit only
npm test             # Jest
```

---

## Code Style Rules

1. **TypeScript strict** — no `any`. Validate only at real boundaries (API responses, form input). Do not add defensive type guards for states the type system already prevents.
2. **Mobile-first** — all UI must be optimized for touch and small screens. Desktop is secondary.
3. **Semantic HTML** — `<button>` for actions, `<a href>` for navigation. `<div onClick>` is never correct.
4. **No unnecessary comments** — keep only non-obvious WHY (workarounds, hidden constraints). Delete comments that explain what the code does.
5. **Error handling in Server Actions** — every Server Action must have try/catch and return a typed result (not throw to the client).

---

## File Naming

- Components: `PascalCase.tsx`
- Hooks: `camelCase.ts` prefixed with `use`
- Utilities: `kebab-case.ts`
- Types: colocated in the file that owns them, or `types.ts` if shared across 2+ files
