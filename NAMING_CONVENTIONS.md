# Naming Conventions

## Overview

This document defines the naming conventions used in the Allergy Scout application.

## General Rules

1. **Consistency**: Use consistent naming patterns throughout the codebase
2. **Readability**: Names should be descriptive and clear
3. **Meaningful**: Avoid abbreviations and acronyms unless they're well-known
4. **TypeScript**: Use TypeScript types for better type safety

## Component Naming

### Components
- **Components**: PascalCase (e.g., `ResultCard`, `Scanner`, `AllergySettings`)
- **Component files**: PascalCase (e.g., `ResultCard.tsx`, `Scanner.tsx`)
- **Component exports**: Default export for components (e.g., `export default function ComponentName()`)

### Hooks
- **Hooks**: camelCase (e.g., `useAllergySettings`, `useFavorites`)
- **Hook files**: camelCase (e.g., `useAllergySettings.ts`, `useFavorites.ts`)
- **Hook exports**: Default export (e.g., `export function useAllergySettings()`)

### Types/Interfaces
- **Types**: PascalCase (e.g., `ProductResult`, `ScanError`)
- **Type files**: PascalCase (e.g., `scanner-types.ts`, `open-food-facts.ts`)
- **Type exports**: Named export for types (e.g., `export type ProductResult`)

### Constants
- **Constants**: UPPER_SNAKE_CASE (e.g., `DEFAULT_ALLERGENS`, `CACHE_TTL`)
- **Constant files**: camelCase (e.g., `constants.ts`, `errorHandling.ts`)
- **Constant exports**: Named export (e.g., `export const DEFAULT_ALLERGENS`)

### Functions
- **Functions**: camelCase (e.g., `toggleAllergy`, `handleScan`)
- **Event handlers**: camelCase with "handle" prefix (e.g., `handleScan`, `handleManualSubmit`)
- **Helper functions**: camelCase (e.g., `validateBarcode`, `createUserErrorMessage`)

### Variables
- **Variables**: camelCase (e.g., `allergies`, `favorites`, `barcode`)
- **Boolean variables**: camelCase with "is" or "has" prefix (e.g., `isSafe`, `isFavorite`, `hasError`)
- **Array variables**: camelCase (e.g., `allergies`, `favorites`, `products`)
- **Object variables**: camelCase (e.g., `result`, `settings`, `error`)

### Classes
- **Classes**: PascalCase (e.g., `ScannerErrorBoundary`)
- **Class files**: PascalCase (e.g., `ScannerErrorBoundary.tsx`)
- **Class exports**: Named export (e.g., `export class ScannerErrorBoundary`)

## File Organization

### Component Files
```
src/
  components/
    ResultCard.tsx
    Scanner.tsx
    AllergySettings.tsx
    AllergySettingsModal.tsx
    FavoritesList.tsx
    ScannerErrorBoundary.tsx
```

### Hook Files
```
src/
  hooks/
    useAllergySettings.ts
    useFavorites.ts
```

### Context Files
```
src/
  contexts/
    AllergyContext.tsx
```

### Utility Files
```
src/
  lib/
    constants.ts
    errorHandling.ts
    open-food-facts.ts
    scanner-types.ts
    utils.ts
```

### Page Files
```
src/
  app/
    page.tsx
    layout.tsx
    error.tsx
    not-found.tsx
    loading.tsx
    globals.css
```

## Import Organization

### Grouped Imports
1. External libraries (e.g., `react`, 'framer-motion', 'lucide-react')
2. Next.js imports (e.g., `next/link`, `next/font/google`)
3. Internal components (e.g., `@/components/ResultCard`)
4. Internal hooks (e.g., `@/hooks/useFavorites`)
5. Internal contexts (e.g., `@/contexts/AllergyContext`)
6. Internal utilities (e.g., `@/lib/utils`, `@/lib/constants`)

### Alphabetical Order
Within each group, imports should be alphabetically sorted.

## Examples

### Good Examples
```typescript
// Component
export default function ResultCard({ result, onReset, onFavorite, isFavorite }: ResultCardProps) {
  // ...
}

// Hook
export function useAllergySettings() {
  // ...
}

// Type
export interface ProductResult {
  name: string;
  brand: string;
  isSafe: boolean;
  allergensFound: string[];
  error?: string;
}

// Constant
export const DEFAULT_ALLERGENS = [
  { label: "Milk", keywords: ["milk", "cheese"] },
  // ...
];

// Function
export function validateBarcode(barcode: string) {
  // ...
}

// Variable
const allergies = useAllergySettings();
const favorites = useFavorites();
const barcode = "1234567890123";
const isSafe = true;
const hasError = false;
```

### Bad Examples
```typescript
// ❌ Inconsistent component naming
export default function resultCard({ result, onReset }: Props) { } // camelCase
export default function ResultCard({ result, onReset }: Props) { } // PascalCase

// ❌ Inconsistent hook naming
export function useAllergySettings() { } // camelCase
export function UseAllergySettings() { } // PascalCase

// ❌ Inconsistent variable naming
const allergies = useAllergySettings(); // camelCase
const Allergies = useAllergySettings(); // PascalCase

// ❌ Inconsistent constant naming
export const defaultAllergens = [ ... ]; // camelCase
export const DEFAULT_ALLERGENS = [ ... ]; // UPPER_SNAKE_CASE
```

## TypeScript Best Practices

1. **Use explicit types**: Don't rely on `any`
2. **Use interfaces for objects**: Use `interface` for object shapes
3. **Use types for unions**: Use `type` for union types
4. **Use generics**: Use generics for reusable components
5. **Avoid type assertions**: Use proper typing instead of `as`

## Accessibility

1. **ARIA labels**: Use descriptive ARIA labels
2. **Keyboard navigation**: Ensure all interactive elements are keyboard accessible
3. **Focus management**: Manage focus when opening/closing dialogs

## Testing

1. **Test files**: Match component names (e.g., `ResultCard.test.tsx`)
2. **Test hooks**: Match hook names (e.g., `useAllergySettings.test.ts`)
3. **Test utilities**: Match utility names (e.g., `validateBarcode.test.ts`)

## Migration Guide

If you're adding new code to the project, follow these conventions:

1. **Components**: Use PascalCase for components and files
2. **Hooks**: Use camelCase for hooks and files
3. **Types**: Use PascalCase for types and files
4. **Constants**: Use UPPER_SNAKE_CASE for constants
5. **Variables**: Use camelCase for variables
6. **Functions**: Use camelCase for functions
7. **Classes**: Use PascalCase for classes and files

## Resources

- [TypeScript Style Guide](https://typescript-eslint.io/rules/)
- [React Style Guide](https://github.com/airbnb/javascript)
- [Next.js Best Practices](https://nextjs.org/docs/app/building-your-application)

---

**Last Updated**: 2026-06-27
**Status**: Active
**Maintained By**: Development Team