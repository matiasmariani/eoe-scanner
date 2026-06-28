/**
 * Application constants
 */

// Camera settings
export const CAMERA = {
  MIN_WIDTH: 640,
  IDEAL_WIDTH: 1280,
  MAX_WIDTH: 1920,
  MIN_HEIGHT: 480,
  IDEAL_HEIGHT: 720,
  MAX_HEIGHT: 1080,
  FOCUS_MODE: 'continuous' as const,
} as const;

// Scanner settings
export const SCANNER = {
  SCAN_DELAY: 3000, // milliseconds
  SCAN_HISTORY_THRESHOLD: 3, // number of scans before confirming
  SCAN_HISTORY_WINDOW: 3000, // milliseconds
} as const;

// Cache settings
export const CACHE = {
  TTL: 5 * 60 * 1000, // 5 minutes in milliseconds
} as const;

// UI settings
export const UI = {
  ROUNDS: {
    MIN: 640,
    IDEAL: 1280,
    MAX: 1920,
  } as const,
  SCAN_DELAY: 3000, // milliseconds
  CACHE_TTL: 5 * 60 * 1000, // 5 minutes
} as const;

// Allergy settings
export const ALLERGY = {
  OPTIONS: [
    { value: 'milk', label: 'Milk', icon: '🥛' },
    { value: 'eggs', label: 'Eggs', icon: '🥚' },
    { value: 'peanuts', label: 'Peanuts', icon: '🥜' },
    { value: 'tree nuts', label: 'Tree Nuts', icon: '🥜' },
    { value: 'wheat', label: 'Wheat', icon: '🌾' },
    { value: 'soy', label: 'Soy', icon: '🫘' },
    { value: 'fish', label: 'Fish', icon: '🐟' },
    { value: 'crustacean shellfish', label: 'Crustacean Shellfish', icon: '🦐' },
    { value: 'sesame', label: 'Sesame', icon: '🫒' },
  ] as const,
} as const;

// Default allergens for reference
export const DEFAULT_ALLERGENS = [
  { label: "Milk", keywords: ["milk", "cheese", "lactose", "cream", "butter", "dairy"] },
  { label: "Eggs", keywords: ["egg", "albumen"] },
  { label: "Peanuts", keywords: ["peanut", "arachis"] },
  { label: "Tree Nuts", keywords: ["almond", "cashew", "walnut", "pecan", "hazelnut", "macadamia", "pistachio", "tree nut"] },
  { label: "Wheat", keywords: ["wheat", "gluten", "flour", "semolina", "durum"] },
  { label: "Soy", keywords: ["soy", "soybean", "soy milk"] },
  { label: "Fish", keywords: ["fish", "salmon", "tuna", "cod", "halibut", "tilapia"] },
  { label: "Crustacean Shellfish", keywords: ["crustacean", "shrimp", "crab", "lobster", "prawn", "crayfish"] },
  { label: "Sesame", keywords: ["sesame", "sesame oil", "sesame seeds"] },
] as const;