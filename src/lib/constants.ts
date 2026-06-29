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

// Maps each user-selectable allergy (see `Allergy` in AllergyContext) to the
// ingredient/label keywords that indicate its presence. Used by `checkAllergens`
// for word-boundary matching against product ingredients and OFF allergen tags.
//
// Note: `butter` is intentionally omitted from `milk` to avoid false positives on
// cocoa/shea butter (extremely common in candy/chocolate); dairy butter is still
// covered by milk/cream/dairy when those terms appear.
export const ALLERGEN_KEYWORDS: Record<string, string[]> = {
  'milk': ['milk', 'dairy', 'cheese', 'lactose', 'cream', 'casein', 'caseinate', 'whey', 'ghee', 'curd', 'buttermilk', 'butterfat'],
  'eggs': ['egg', 'albumen', 'albumin', 'ovalbumin', 'mayonnaise', 'meringue'],
  'peanuts': ['peanut', 'arachis', 'groundnut'],
  'tree nuts': ['tree nut', 'nut', 'almond', 'cashew', 'walnut', 'pecan', 'hazelnut', 'macadamia', 'pistachio', 'brazil nut', 'pine nut', 'chestnut', 'hickory', 'praline', 'marzipan'],
  'wheat': ['wheat', 'gluten', 'semolina', 'durum', 'spelt', 'farro', 'einkorn', 'bulgur', 'couscous', 'seitan'],
  'soy': ['soy', 'soya', 'soybean', 'soja', 'edamame', 'tofu', 'tempeh', 'miso'],
  'fish': ['fish', 'salmon', 'tuna', 'cod', 'halibut', 'tilapia', 'anchovy', 'sardine', 'herring', 'mackerel', 'pollock', 'trout'],
  'crustacean shellfish': ['crustacean', 'shellfish', 'shrimp', 'crab', 'lobster', 'prawn', 'crayfish', 'langoustine', 'krill'],
  'sesame': ['sesame', 'tahini', 'benne', 'sesamol', 'gingelly', 'simsim'],
};

// Default allergens for reference (label + keyword form, kept for display use)
export const DEFAULT_ALLERGENS = [
  { label: "Milk", keywords: ALLERGEN_KEYWORDS['milk'] },
  { label: "Eggs", keywords: ALLERGEN_KEYWORDS['eggs'] },
  { label: "Peanuts", keywords: ALLERGEN_KEYWORDS['peanuts'] },
  { label: "Tree Nuts", keywords: ALLERGEN_KEYWORDS['tree nuts'] },
  { label: "Wheat", keywords: ALLERGEN_KEYWORDS['wheat'] },
  { label: "Soy", keywords: ALLERGEN_KEYWORDS['soy'] },
  { label: "Fish", keywords: ALLERGEN_KEYWORDS['fish'] },
  { label: "Crustacean Shellfish", keywords: ALLERGEN_KEYWORDS['crustacean shellfish'] },
  { label: "Sesame", keywords: ALLERGEN_KEYWORDS['sesame'] },
] as const;