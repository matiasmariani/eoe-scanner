# Allergy Scout 🛡️

A modern, kid-friendly mobile web app for scanning product barcodes and checking for allergens. Built with Next.js, React, and Tailwind CSS.

![Allergy Scout](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-18-blue?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8?style=flat-square&logo=tailwind-css)

## Features

- 📱 **Mobile-First Design**: Optimized for touch interactions and mobile devices
- 📷 **Barcode Scanning**: Real-time barcode scanning using camera
- 🔍 **Manual Search**: Enter barcodes manually for quick lookups
- ❤️ **Favorites**: Save and manage favorite products
- 🚫 **Allergen Detection**: Checks for common allergens (dairy, wheat, eggs, peanuts, tree nuts, soy, fish, sesame)
- 🎨 **Kid-Friendly UI**: Colorful, engaging design perfect for children
- ⚡ **Fast & Responsive**: Optimized performance with Next.js 16
- 🔒 **Secure**: Built with security best practices

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI Library**: React 18
- **Styling**: Tailwind CSS 4
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Barcode Scanning**: Quagga.js
- **TypeScript**: Full type safety
- **Fonts**: Google Fonts (Geist)

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
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

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
