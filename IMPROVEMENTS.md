# Implementation Plan

## Phase 1: Critical Fixes (High Priority)

### 1.1 Migrate to Open Food Facts API v3

**File**: `src/lib/open-food-facts.ts`

**Changes**:
```typescript
// Update API endpoint to v3.6
const response = await fetch(
  `https://world.openfoodfacts.org/api/v3.6/product/${barcode}`,
  {
    headers: {
      'User-Agent': 'AllergyScout/1.0 (contact@example.com)'
    }
  }
);

// Update response type
export interface OpenFoodFactsResponse {
  status: number;
  product: {
    product_name?: string;
    brands?: string;
    allergens?: string;
    allergens_labeled?: string;
    ingredients_text?: string;
    image_front_small_url?: string;
    image_front_url?: string;
  };
}

// Update allergen detection logic
const TARGET_ALLERGENS = [
  { label: "Milk", keywords: ["milk", "cheese", "lactose", "cream", "butter", "dairy"] },
  { label: "Eggs", keywords: ["egg", "albumen"] },
  { label: "Peanuts", keywords: ["peanut", "arachis"] },
  { label: "Tree Nuts", keywords: ["almond", "cashew", "walnut", "pecan", "hazelnut", "macadamia", "pistachio", "tree nut"] },
  { label: "Wheat", keywords: ["wheat", "gluten", "flour", "semolina", "durum"] },
  { label: "Soy", keywords: ["soy", "soybean", "soy milk"] },
  { label: "Fish", keywords: ["fish", "salmon", "tuna", "cod", "halibut", "tilapia"] },
  { label: "Crustacean Shellfish", keywords: ["crustacean", "shrimp", "crab", "lobster", "prawn", "crayfish"] },
  { label: "Sesame", keywords: ["sesame", "sesame oil", "sesame seeds"] }
];

// Update allergens_list to allergens_labeled
const textToScan = `${(product.allergens_labeled || []).join(" ")} ${product.ingredients_text || ""}`.toLowerCase();
```

**Testing**:
- Test with known products
- Verify API response format
- Check error handling

---

### 1.2 Add Allergy Settings Feature

**Files to Create**:
- `src/hooks/useAllergySettings.ts`
- `src/components/AllergySettings.tsx`
- `src/components/AllergySettingsModal.tsx`

**File**: `src/hooks/useAllergySettings.ts`
```typescript
'use client';

import { useState, useEffect } from 'react';

export type Allergy = 'milk' | 'eggs' | 'peanuts' | 'tree nuts' | 'wheat' | 'soy' | 'fish' | 'crustacean shellfish' | 'sesame';

export function useAllergySettings() {
  const [allergies, setAllergies] = useState<Allergy[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('allergy-scout-allergies');
    if (stored) {
      try {
        setAllergies(JSON.parse(stored));
      } catch (error) {
        console.error('Failed to parse allergies:', error);
      }
    }
  }, []);

  const toggleAllergy = (allergy: Allergy) => {
    setAllergies(prev =>
      prev.includes(allergy)
        ? prev.filter(a => a !== allergy)
        : [...prev, allergy]
    );
    localStorage.setItem('allergy-scout-allergies', JSON.stringify([...prev, allergy]));
  };

  const isAllergicTo = (allergen: string): boolean => {
    return allergies.some(allergy => allergy.toLowerCase().includes(allergen.toLowerCase()));
  };

  const clearAllergies = () => {
    setAllergies([]);
    localStorage.removeItem('allergy-scout-allergies');
  };

  return {
    allergies,
    toggleAllergy,
    isAllergicTo,
    clearAllergies,
  };
}
```

**File**: `src/components/AllergySettings.tsx`
```typescript
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { useAllergySettings } from '@/hooks/useAllergySettings';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

type Allergy = 'milk' | 'eggs' | 'peanuts' | 'tree nuts' | 'wheat' | 'soy' | 'fish' | 'crustacean shellfish' | 'sesame';

const ALLERGY_OPTIONS: { value: Allergy; label: string; icon: string }[] = [
  { value: 'milk', label: 'Milk', icon: '🥛' },
  { value: 'eggs', label: 'Eggs', icon: '🥚' },
  { value: 'peanuts', label: 'Peanuts', icon: '🥜' },
  { value: 'tree nuts', label: 'Tree Nuts', icon: '🥜' },
  { value: 'wheat', label: 'Wheat', icon: '🌾' },
  { value: 'soy', label: 'Soy', icon: '🫘' },
  { value: 'fish', label: 'Fish', icon: '🐟' },
  { value: 'crustacean shellfish', label: 'Crustacean Shellfish', icon: '🦐' },
  { value: 'sesame', label: 'Sesame', icon: '🫒' },
];

export function AllergySettings() {
  const { allergies, toggleAllergy, clearAllergies } = useAllergySettings();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-[3rem] border-8 shadow-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-black text-gray-900">Allergy Settings</h2>
          <button
            onClick={clearAllergies}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Clear All
          </button>
        </div>

        <p className="text-gray-600 mb-6">
          Select your allergies. We'll check products against this list.
        </p>

        <div className="grid grid-cols-3 gap-3">
          {ALLERGY_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => toggleAllergy(option.value)}
              className={cn(
                "p-4 rounded-2xl border-4 transition-all active:scale-95",
                allergies.includes(option.value)
                  ? "bg-blue-500 text-white border-blue-500"
                  : "bg-gray-100 text-gray-700 border-gray-200 hover:border-blue-300"
              )}
            >
              <div className="text-2xl mb-2">{option.icon}</div>
              <div className="text-sm font-bold">{option.label}</div>
              {allergies.includes(option.value) && (
                <Check className="w-5 h-5 mt-2" />
              )}
            </button>
          ))}
        </div>

        <button
          onClick={() => window.close()}
          className="w-full mt-6 bg-blue-500 text-white py-4 rounded-full text-xl font-black hover:bg-blue-600 transition-all"
        >
          Save & Close
        </button>
      </motion.div>
    </div>
  );
}
```

**File**: `src/components/AllergySettingsModal.tsx`
```typescript
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';
import { useAllergySettings } from '@/hooks/useAllergySettings';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function AllergySettingsModal() {
  const { allergies } = useAllergySettings();

  return (
    <button
      onClick={() => document.getElementById('allergy-settings')?.showModal()}
      className="fixed bottom-6 right-6 z-40 bg-blue-500 text-white p-4 rounded-full shadow-lg hover:bg-blue-600 transition-all active:scale-95"
      aria-label="Allergy settings"
    >
      <Shield className="w-6 h-6" />
    </button>
  );
}
```

**File**: `src/app/page.tsx` (Update)
```typescript
import { AllergySettings } from '@/components/AllergySettings';
import { AllergySettingsModal } from '@/components/AllergySettingsModal';

// Add to the component
const handleOpenAllergySettings = () => {
  const dialog = document.getElementById('allergy-settings') as HTMLDialogElement;
  if (dialog) dialog.showModal();
};

// Add button in header
<button
  onClick={handleOpenAllergySettings}
  className="p-3 bg-white rounded-full shadow-md border-4 border-sky-200 text-blue-500 hover:bg-sky-50 transition-all active:scale-90"
  aria-label="Allergy settings"
>
  <Shield className="w-6 h-6" />
</button>

// Add modal at the end of the component
<dialog id="allergy-settings" className="rounded-[3rem] border-8 shadow-2xl p-0">
  <AllergySettings />
</dialog>
```

---

### 1.3 Update ResultCard with Safe Message

**File**: `src/components/ResultCard.tsx`

**Changes**:
```typescript
import { useAllergySettings } from '@/hooks/useAllergySettings';

export const ResultCard: React.FC<ResultCardProps> = ({ result, onReset, onFavorite, isFavorite = false }) => {
  const { allergies, isAllergicTo } = useAllergySettings();

  // Check if product is safe based on user's allergies
  const isSafe = result.isSafe && allergies.length === 0;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={result.name}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className={cn(
          "w-full max-w-md mx-auto overflow-hidden rounded-[4rem] border-8 shadow-2xl transition-all duration-500",
          isSafe ? "border-emerald-500 bg-emerald-50" : "border-rose-500 bg-rose-50"
        )}
      >
        <div className="p-10 flex flex-col items-center text-center">
          {/* ... existing code ... */}

          <div className="w-full space-y-6 mb-10">
            {isSafe ? (
              <div className="flex items-center justify-center gap-3 text-emerald-700 font-black text-3xl py-4">
                <CheckCircle2 className="w-10 h-10" />
                No allergies found. Ask a grown up if you can have it.
              </div>
            ) : (
              <div className="flex flex-col gap-4 w-full">
                <p className="text-rose-600 font-black text-2xl uppercase tracking-widest">
                  Watch out!
                </p>
                <div className="grid grid-cols-1 gap-3">
                  {allergensFound.map((allergen) => (
                    <div
                      key={allergen}
                      className="flex items-center justify-center gap-5 bg-white border-4 border-rose-100 rounded-[2rem] p-6 shadow-md"
                    >
                      {ALLERGEN_ICONS[allergen] || <Info className="w-10 h-10 text-rose-500" />}
                      <span className="text-3xl font-black text-rose-900">
                        {allergen}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ... existing code ... */}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
```

---

### 1.4 Extract `cn` Utility

**File**: `src/lib/utils.ts` (Create)
```typescript
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

**Update all components** to import from `@/lib/utils` instead of defining `cn` locally.

---

### 1.5 Add `.env.example`

**File**: `.env.example`
```env
# Open Food Facts API
NEXT_PUBLIC_OPENFOODFACTS_USER_AGENT=AllergyScout/1.0 (contact@example.com)

# Analytics (optional)
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=
```

---

## Phase 2: Code Quality (Medium Priority)

### 2.1 Implement API Caching

**File**: `src/lib/open-food-facts.ts`

**Changes**:
```typescript
// Add caching
const cache = new Map<string, { data: ProductResult; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function fetchProductByBarcode(barcode: string): Promise<ProductResult> {
  // Check cache
  const cached = cache.get(barcode);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  // Fetch from API
  const response = await fetch(
    `https://world.openfoodfacts.org/api/v3.6/product/${barcode}`,
    {
      headers: {
        'User-Agent': process.env.NEXT_PUBLIC_OPENFOODFACTS_USER_AGENT || 'AllergyScout/1.0 (contact@example.com)'
      }
    }
  );

  // ... rest of the code

  // Cache the result
  cache.set(barcode, { data: result, timestamp: Date.now() });

  return result;
}
```

---

### 2.2 Add Error Monitoring (Sentry)

**File**: `src/app/error.tsx`

**Changes**:
```typescript
'use client';

import { useEffect } from 'react';
import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      {/* ... existing error UI ... */}
    </div>
  );
}
```

**Install**:
```bash
npm install @sentry/nextjs
```

---

### 2.3 Add Testing

**File**: `__tests__/open-food-facts.test.ts`
```typescript
import { fetchProductByBarcode } from '@/lib/open-food-facts';

describe('fetchProductByBarcode', () => {
  it('should fetch product data', async () => {
    const result = await fetchProductByBarcode('1234567890123');
    expect(result).toBeDefined();
    expect(result.name).toBeDefined();
  });

  it('should handle invalid barcode', async () => {
    const result = await fetchProductByBarcode('0000000000000');
    expect(result.error).toBeDefined();
  });
});
```

**Install**:
```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom
```

---

### 2.4 Update Styling

**File**: `src/app/globals.css`

**Changes**:
```css
@import "tailwindcss";

@theme {
  --color-brand-primary: #0070f3;
  --color-brand-secondary: #6366f1;
  --color-brand-accent: #0ea5e9;
  --color-brand-success: #10b981;
  --color-brand-danger: #ef4444;
}

/* Add more custom styles based on design inspiration */
```

---

## Phase 3: Documentation (Low Priority)

### 3.1 Update README

**File**: `README.md`

**Changes**:
```markdown
# Allergy Scout

A React/Next.js application for scanning product barcodes and checking for allergens.

## Features

- 📷 Barcode scanning
- 🔍 Manual barcode entry
- 🚫 Allergen detection
- ❤️ Favorites system
- ⚙️ Customizable allergy settings

## Getting Started

### Prerequisites

- Node.js 18.18.0 or higher
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Deployment

Deploy to Vercel with:

```bash
npm run build
vercel deploy
```

## API

Uses Open Food Facts API v3.6.

## License

MIT
```

---

## Summary

This implementation plan covers all critical and recommended improvements for the Allergy Scout application. Follow this plan systematically to ensure a high-quality, production-ready application.

**Estimated Time**:
- Phase 1: 4-6 hours
- Phase 2: 6-8 hours
- Phase 3: 2-3 hours

**Total**: 12-17 hours