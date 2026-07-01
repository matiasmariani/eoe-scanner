// Application Configuration
export const CONFIG = {
  // UI Colors
  COLORS: {
    PRIMARY: '#4CAF50',
    ACCENT: '#FFC107',
    TEXT: '#212121',
    BG: '#FFF8E1',
    BORDER: '#000000',
    RED: '#D32F2F',
  } as const,

  // Typography
  TYPOGRAPHY: {
    FONT_DISPLAY: 'var(--font-display)',
    FONT_BODY: 'var(--font-body)',
  } as const,

  // Spacing
  SPACING: {
    XS: '0.25rem',
    SM: '0.5rem',
    MD: '1rem',
    LG: '1.5rem',
    XL: '2rem',
  } as const,

  // Border Radius
  BORDER_RADIUS: {
    SM: '0.5rem',
    MD: '1rem',
    LG: '1.5rem',
    XL: '2rem',
    FULL: '9999px',
  } as const,

  // Shadows
  SHADOW: {
    SM: '2px 2px 0px 0px rgba(0,0,0,1)',
    MD: '4px 4px 0px 0px rgba(0,0,0,1)',
    LG: '6px 6px 0px 0px rgba(0,0,0,1)',
  } as const,

  // Camera Configuration
  CAMERA: {
    // Barcode formats to detect
    FORMATS: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128'] as const,

    // Detection interval in milliseconds
    DETECT_INTERVAL_MS: 250,

    // Camera constraints
    VIDEO: {
      FACING_MODE: 'environment',
      WIDTH: 1280,
      HEIGHT: 720,
    } as const,

    // Scanner UI
    SCANNER: {
      BORDER_COLOR: '#000000',
      BORDER_WIDTH: 8,
      CORNER_SIZE: 80,
      LINE_COLOR: '#FFC107',
      LINE_BLUR: 2,
    } as const,
  } as const,
} as const;

// Backwards compatibility aliases
export const UI = CONFIG;
export const CAMERA = CONFIG.CAMERA;

// Allergen types — the kid's allergies
export type Allergy = string;

export const ALLERGY_OPTIONS: {
  value: Allergy;
  label: string;
  emoji: string;
}[] = [
  { value: 'peanuts', label: 'Peanuts', emoji: '🥜' },
  { value: 'tree_nuts', label: 'Tree Nuts', emoji: '🌰' },
  { value: 'milk', label: 'Milk', emoji: '🥛' },
  { value: 'egg', label: 'Egg', emoji: '🥚' },
  { value: 'wheat', label: 'Wheat', emoji: '🌾' },
  { value: 'soy', label: 'Soy', emoji: '🫘' },
  { value: 'fish', label: 'Fish', emoji: '🐟' },
  { value: 'shellfish', label: 'Shellfish', emoji: '🦐' },
  { value: 'sesame', label: 'Sesame', emoji: '🫛' },
  { value: 'gluten', label: 'Gluten', emoji: '🍞' },
];

// Emojis for custom allergen entries — covers common allergens beyond the built-in 10.
// Shown in CustomAllergyInput alongside the built-in allergen emojis.
export const CUSTOM_ALLERGEN_EMOJIS = [
  '⚠️', // generic / unknown
  '🌽',
  '🍓',
  '🍋',
  '🍊',
  '🍑',
  '🥝',
  '🍌',
  '🫐', // fruits & corn
  '🍅',
  '🥑',
  '🧄',
  '🧅',
  '🌶️', // vegetables & spice
  '🍫',
  '🍷',
  '🍄',
  '🌿', // cocoa, sulfites, mushroom, herbs
  '🐷',
  '🦑',
  '🥩', // pork, molluscs, red meat
] as const;

// Profile avatar emojis for kids aged 5–10.
// Ordered loosely: children → animals → fantasy/characters → activities.
export const PROFILE_EMOJIS = [
  '🧒',
  '👦',
  '👧',
  '🦖',
  '🦄',
  '🦁',
  '🐯',
  '🐼',
  '🦊',
  '🐸',
  '🐨',
  '🐺',
  '🐰',
  '🦈',
  '🐉',
  '🦸',
  '🧚',
  '👸',
  '🤴',
  '🚀',
  '🤠',
  '🦋',
  '🧸',
  '⚽',
] as const;

// Keywords used to match allergens in Open Food Facts data
export const ALLERGEN_KEYWORDS: Record<Allergy, string[]> = {
  peanuts: ['peanut', 'peanuts', 'groundnut', 'groundnuts'],
  tree_nuts: [
    'almond',
    'cashew',
    'hazelnut',
    'pecan',
    'pine nut',
    'pistachio',
    'walnut',
    'macadamia',
    'Brazil nut',
    'coconut',
  ],
  milk: ['milk', 'lactose', 'casein', 'whey', 'cheese', 'yogurt', 'butter'],
  egg: ['egg', 'egg white', 'egg yolk', 'albumin'],
  wheat: ['wheat', 'flour', 'semolina', 'spelt', 'durum', 'bread', 'pastry'],
  soy: ['soy', 'soya', 'soybean', 'soybean', 'tofu', 'edamame'],
  fish: ['fish', 'cod', 'tuna', 'salmon', 'anchovy', 'fish sauce'],
  shellfish: [
    'shellfish',
    'crab',
    'lobster',
    'shrimp',
    'prawn',
    'clam',
    'mussel',
  ],
  sesame: ['sesame', 'sesame seed', 'tahini', 'halva'],
  gluten: ['gluten'],
};
