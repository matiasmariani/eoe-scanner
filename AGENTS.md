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
- **Barcode Scanning**: Quagga.js / html5-qrcode
- **Data Source**: Open Food Facts API (via local rewrites)
- **State**: `localStorage` for Favorites

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
- **Flow**: Scanner component captures barcode -> `fetchProductByBarcode` (lib) -> `ResultView` displays data.

## Important Configuration & Quirks
- **API Rewrites**: All calls to `https://world.openfoodfacts.org/api/v0/` are handled via `next.config.js` rewrites at `/api/openfoodfacts/:path*`.
- **Permissions**: `Permissions-Policy` is configured for `camera`, `microphone`, and `geolocation`.
- **Style**: Custom Tailwind theme uses "voxel" box shadows (e.g., `shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]`) and "arcade" animations.
- **Storage**: Favorites are persisted in `localStorage`.
- **Mobile-First**: Ensure all UI components are optimized for touch and mobile screens.
