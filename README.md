# Snack Scout 🛡️

A kid-friendly offline-first mobile web app for scanning product barcodes and checking for allergens. Built with Next.js, React, and Tailwind CSS.

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8?style=flat-square&logo=tailwind-css)

## Features

- 📱 **Mobile-First Design**: Optimized for touch interactions and mobile devices
- 📷 **Barcode Scanning**: Real-time barcode scanning using the BarcodeDetector API
- 🔍 **Manual Search**: Enter barcodes manually for quick lookups
- ❤️ **Favorites**: Save and manage favourite products
- 🚫 **Allergen Detection**: Checks for 10 common allergens (dairy, wheat, eggs, peanuts, tree nuts, soy, fish, shellfish, sesame, gluten)
- 🎨 **Kid-Friendly Themes**: Minecraft and Kitty themes
- 📦 **Offline-First**: All data stored locally via IndexedDB (Dexie) — no account required
- ⚡ **PWA**: Installable on Android and iOS, works offline
- 🔒 **COPPA-Friendly**: No accounts, no backend, no data leaves the device

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **UI Library**: React 19 (React Compiler enabled)
- **Styling**: Tailwind CSS 4
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Barcode Scanning**: BarcodeDetector API
- **Storage**: Dexie 4 (IndexedDB)
- **TypeScript**: Full type safety
- **Fonts**: Google Fonts (Fredoka, Nunito, Andika)

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd my-next-app
```

2. Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

3. Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
my-next-app/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout with metadata
│   │   ├── page.tsx            # Main page
│   │   ├── error.tsx           # Error boundary
│   │   ├── not-found.tsx       # 404 page
│   │   └── loading.tsx         # Loading state
│   ├── components/
│   │   ├── Scanner.tsx         # Barcode scanner component
│   │   ├── ResultCard.tsx      # Product result display
│   │   └── FavoritesList.tsx   # Favorites list component
│   ├── hooks/
│   │   └── useFavorites.ts     # Custom hook for favorites
│   ├── lib/
│   │   ├── open-food-facts.ts  # API integration
│   │   └── scanner-types.ts    # Type definitions
│   └── types/
│       └── scanner-types.ts    # TypeScript types
├── public/                      # Static assets
├── .env.local                   # Environment variables
├── next.config.js               # Next.js configuration
├── tailwind.config.js           # Tailwind CSS configuration
└── tsconfig.json                # TypeScript configuration
```

## Features in Detail

### Barcode Scanning

- Uses Quagga.js for real-time barcode detection
- Supports multiple barcode formats (EAN, UPC, Code 128)
- Anti-spam protection to prevent duplicate scans
- Camera permission handling

### Allergen Detection

- Checks for common allergens using Open Food Facts API
- Supports: Dairy, Wheat, Eggs, Peanuts, Tree Nuts, Soy, Fish, Sesame
- Clear visual indicators for safe vs. unsafe products

### Favorites System

- Saves favorite products to localStorage
- Persistent across sessions
- Easy add/remove functionality

## Development

### Available Scripts

```bash
npm run dev                    # Development server (hot reload, SW disabled)
npm run build && npm start     # Production build — use this to test the PWA,
                               # service worker, and offline behaviour
npm run generate-icons         # Generate PNG icons from SVG sources (run once
                               # after installing sharp: npm i -D sharp)
npm run lint                   # Run ESLint
npm run typecheck              # TypeScript type check
npm run format                 # Format with Prettier
```

> **Dev vs production:** `npm run dev` is for all normal feature development.
> Only use `npm run build && npm start` when you need to test the service worker,
> PWA install prompt, or offline caching — the SW is intentionally disabled in
> dev mode so it doesn't interfere with hot reload.

### Code Quality

This project follows Next.js and React best practices:

- ✅ Server Components where appropriate
- ✅ Client Components with "use client" directive
- ✅ TypeScript for type safety
- ✅ Proper error handling with error boundaries
- ✅ Accessibility (ARIA labels, keyboard navigation)
- ✅ Performance optimization (code splitting, lazy loading)
- ✅ Security headers and CSP
- ✅ SEO-friendly metadata

## Deployment

### Vercel (Recommended)

```bash
npm install -g vercel
vercel
```

### Other Platforms

See [Next.js Deployment Documentation](https://nextjs.org/docs/app/building-your-application/deploying) for detailed instructions.

## Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_OPENFOODFACTS_API_URL=https://world.openfoodfacts.org/api/v0/product
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the MIT License.

## Support

For issues and questions, please open an issue on GitHub.

---

Built with ❤️ using Next.js and React
