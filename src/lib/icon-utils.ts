const ICON_MAP: Record<string, string> = {
  chocolate: '🍫',
  cookie: '🍪',
  biscuit: '🍪',
  fruit: '🍎',
  apple: '🍎',
  banana: '🍌',
  berry: '🍓',
  candy: '🍬',
  sweet: '🍬',
  drink: '🧃',
  juice: '🧃',
  water: '💧',
  chip: '🍿',
  salty: '🍿',
  nut: '🥜',
  bread: '🍞',
  cake: '🍰',
  yogurt: '🥛',
  milk: '🥛',
  cheese: '🧀',
  vegetable: '🥦',
  carrot: '🥕',
  corn: '🌽',
};

export function resolveIcon(
  categories: string[] | string | undefined,
  name: string = '',
): string {
  const searchTerms = [];
  if (Array.isArray(categories)) {
    searchTerms.push(...categories);
  } else if (typeof categories === 'string') {
    searchTerms.push(categories);
  }
  searchTerms.push(name.toLowerCase());

  for (const term of searchTerms) {
    const lowerTerm = term.toLowerCase();
    for (const [keyword, icon] of Object.entries(ICON_MAP)) {
      if (lowerTerm.includes(keyword)) {
        return icon;
      }
    }
  }

  // Deterministic fallback
  const seed = (name || 'unknown')
    .split('')
    .reduce((sum, c) => sum + c.charCodeAt(0), 0);
  const FALLBACKS = ['🍪', '🍎', '🍿', '🍬', '🍫', '🥨', '🍓', '🥛'];
  return FALLBACKS[seed % FALLBACKS.length] ?? '📦';
}
