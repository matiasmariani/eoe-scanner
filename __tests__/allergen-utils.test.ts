import { checkAllergens } from '@/lib/allergen-utils';

describe('checkAllergens', () => {
  it('returns nothing when no allergies are selected', () => {
    expect(checkAllergens('milk, wheat, egg', [])).toEqual([]);
  });

  it('returns nothing for empty/undefined text', () => {
    expect(checkAllergens('', ['milk'])).toEqual([]);
    expect(checkAllergens(undefined, ['milk'])).toEqual([]);
  });

  it('matches direct keywords case-insensitively', () => {
    expect(checkAllergens('NONFAT MILK, SUGAR', ['milk'])).toEqual(['milk']);
  });

  it('expands to indicator keywords (almonds → tree nuts, gluten → wheat, whey → milk)', () => {
    expect(checkAllergens('roasted almonds', ['tree nuts'])).toEqual([
      'tree nuts',
    ]);
    expect(checkAllergens('wheat gluten', ['wheat'])).toEqual(['wheat']);
    expect(checkAllergens('whey protein', ['milk'])).toEqual(['milk']);
  });

  it('matches plural forms', () => {
    expect(checkAllergens('contains walnuts', ['tree nuts'])).toEqual([
      'tree nuts',
    ]);
  });

  it('matches Open Food Facts allergen tags (en:milk, en:gluten)', () => {
    expect(
      checkAllergens('en:milk en:gluten en:soybeans', ['milk', 'wheat', 'soy']),
    ).toEqual(['milk', 'wheat', 'soy']);
  });

  it('does NOT flag fish for shellfish (no false substring match)', () => {
    expect(checkAllergens('shellfish extract', ['fish'])).toEqual([]);
  });

  it('does NOT flag milk for cocoa butter', () => {
    expect(checkAllergens('cocoa butter, sugar', ['milk'])).toEqual([]);
  });

  it('does NOT flag eggs for eggplant (word boundary)', () => {
    expect(checkAllergens('eggplant, salt', ['eggs'])).toEqual([]);
  });

  it('finds multiple allergens and preserves the input casing/order', () => {
    const ingredients =
      'WHEAT FLOUR, EGG WHITE, SOYBEAN OIL, NONFAT MILK, SOY FLOUR, BUTTER';
    expect(
      checkAllergens(ingredients, [
        'eggs',
        'soy',
        'fish',
        'peanuts',
        'milk',
        'tree nuts',
        'wheat',
      ]),
    ).toEqual(['eggs', 'soy', 'milk', 'wheat']);
  });
});
