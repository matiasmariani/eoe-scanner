import { SafeFood } from '@/lib/db';
import { Allergy } from '@/lib/constants';

export function generateAllergenEmail(
  profileName: string,
  allergies: Allergy[],
  safeFoods: SafeFood[],
) {
  const allergyList = allergies
    .map((a) => {
      const displayName = a.includes(':') ? a.slice(a.indexOf(':') + 1) : a;
      const icon = a.includes(':') ? a.slice(0, a.indexOf(':')) : '⚠️';
      return `${icon} ${displayName}`;
    })
    .join('\n');

  const safeFoodList = safeFoods
    .map((food) => {
      let item = `✓ ${food.name}`;
      if (food.brand) item += ` (${food.brand})`;
      if (food.notes) item += `\n  Note: ${food.notes}`;
      return item;
    })
    .join('\n');

  const text = `Here are ${profileName}'s Safe Foods & Allergens\n\n⚠️ ALLERGENS:\n${allergyList}\n\n✓ SAFE FOODS:\n${safeFoodList}`;

  return text;
}
