import { ALLERGEN_KEYWORDS } from '@/lib/constants';

// Escape a string so it can be embedded literally in a RegExp.
function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// A keyword matches on a word boundary, tolerating a trailing plural
// (e.g. "almond" matches "almonds", "tree nut" matches "tree nuts").
// The leading boundary prevents false positives like "fish" in "shellfish"
// or "egg" in "eggplant".
function keywordRegex(keyword: string): RegExp {
  return new RegExp(`\\b${escapeRegExp(keyword)}(?:s|es)?\\b`, 'i');
}

/**
 * Checks a text block against a list of user allergies.
 *
 * For each allergy we expand to a set of indicator keywords (see
 * ALLERGEN_KEYWORDS) and match each with word boundaries. The text may include
 * free-text ingredients as well as Open Food Facts allergen tags (e.g.
 * "en:milk"), both of which this handles.
 *
 * @param text The text to check (ingredients, allergen labels, and/or tags).
 * @param userAllergies The list of user-defined allergies.
 * @returns The subset of `userAllergies` found in the text (original casing).
 */
export function checkAllergens(
  text: string | undefined,
  userAllergies: string[] = [],
): string[] {
  if (!text || userAllergies.length === 0) return [];

  return userAllergies.filter((allergy) => {
    // Custom allergens are stored as "emoji:value" — extract the value part.
    const raw = allergy.includes(':')
      ? allergy.slice(allergy.indexOf(':') + 1)
      : allergy;
    const key = raw.toLowerCase().trim();
    // Fall back to the allergy term itself if we have no keyword mapping.
    // `userAllergies` is loosely-typed string[], so index via a string view.
    const keywords = (ALLERGEN_KEYWORDS as Record<string, string[]>)[key] ?? [
      key,
    ];
    return keywords.some((keyword) => keywordRegex(keyword).test(text));
  });
}

/**
 * Re-evaluates a product's safety verdict against a (possibly changed) allergy
 * list. Used on cache hits so a product scanned before an allergen was added —
 * or by a different profile — is re-checked against BOTH the ingredients and
 * the allergen tags (persisted together in `matchText`), never a stale verdict.
 */
export function recomputeVerdict(
  matchText: string | undefined,
  userAllergies: string[],
): { isSafe: boolean; allergensFound: string[] } {
  const allergensFound = checkAllergens(matchText, userAllergies);
  return { isSafe: allergensFound.length === 0, allergensFound };
}
