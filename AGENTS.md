<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Allergy Scout Project Overview

## Project Goal

A kid-friendly mobile web app for scanning product barcodes and checking for allergens. Focus on mobile-first design and "voxel/arcade" aesthetics.

## Tech Stack & Key Tools

- **Framework**: Next.js 15 (App Router)
- **UI/Styling**: React 19, Tailwind CSS 4, Framer Motion
- **Barcode Scanning**: Native `BarcodeDetector` API when available, falling back to the `barcode-detector` (zxing-wasm) ponyfill (`src/components/Scanner.tsx`)
- **Data Source**: Open Food Facts API v3.6 (primary), USDA FoodData Central (fallback) — see `src/lib/open-food-facts-shared.ts` and `src/services/usdaService.ts`
- **State**: `localStorage` for the Safe Snacks Collection (`src/hooks/useSnackCollection.ts`) and selected allergies (`src/contexts/AllergyContext.tsx`)

## Development Commands

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run start`: Start production server
- `npm run lint`: Run ESLint
- `npm run validate`: Run typecheck and lint (Primary check for CI/CD)

## Architecture & Key Files

- `src/app/`: Next.js App Router structure
- `src/components/`: UI components (Scanner, ResultCard, FavoritesList)
- `src/lib/`: API integrations (Open Food Facts) and scanner logic
- `src/hooks/`: Custom hooks (e.g., `useFavorites`)
- `src/types/`: Shared TypeScript definitions
- **Flow**: Scanner component captures barcode -> `lookupProductAction` (Server Action) -> `ResultView` displays data.

## Important Configuration & Quirks

- **Data fetching**: Product lookups are handled by the `lookupProductAction` Server Action in `src/app/actions.ts`, which calls Open Food Facts directly and falls back to USDA.
- **Permissions**: `Permissions-Policy` is configured for `camera`, `microphone`, and `geolocation`.
- **Style**: Tailwind CSS **v4**, configured CSS-first via `@theme` in `src/app/globals.css` (there is no `tailwind.config.js`). Custom "voxel" box shadows (e.g., `shadow-voxel` / `shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]`) and "arcade" animations.
- **Allergens**: Single source of truth in `src/lib/constants.ts` (`Allergy` type, `ALLERGY_OPTIONS`, `ALLERGEN_KEYWORDS`); matching logic in `src/lib/allergen-utils.ts`.
- **Storage**: The Safe Snacks Collection is persisted in `localStorage` (no accounts — COPPA-friendly).
- **Mobile-First**: Ensure all UI components are optimized for touch and mobile screens.
