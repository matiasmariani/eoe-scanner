'use server';

import {
  fetchProductFromOpenFoodFacts,
  ProductResult,
} from '@/lib/open-food-facts';
import { findFoodByBarcode } from '@/services/usdaService';
import { resolveIcon } from '@/lib/icon-utils';

const NOT_FOUND_MSG = "I can't find that product. Ask a grown-up for help";

/**
 * Server action to lookup a product by barcode across multiple sources.
 * Replaces the /api/product/[barcode] route.
 */
export async function lookupProductAction(
  barcode: string,
  allergies: string[],
): Promise<ProductResult> {
  // Server actions are public endpoints — validate here, not just in the client.
  // EAN/UPC/GTIN barcodes are 8–14 digits; reject anything else outright.
  if (!/^\d{8,14}$/.test(barcode)) {
    return {
      barcode: '',
      name: 'Unknown Product',
      brand: 'Unknown',
      isSafe: false,
      allergensFound: [],
      error: NOT_FOUND_MSG,
      source: 'none',
      ingredients: '',
    };
  }

  let openfoodError: string | undefined;
  let usdaError: string | undefined;

  // 1. Try Open Food Facts.
  let result: ProductResult = await fetchProductFromOpenFoodFacts(
    barcode,
    allergies,
  );
  const offFound = !result.error;
  if (offFound) {
    result.source = 'openfooddata';
  } else {
    openfoodError = result.error;
  }

  // 2. Fall back to USDA FoodData Central.
  if (!offFound) {
    try {
      const apiKey = process.env.USDA_API_KEY || '';
      const food = await findFoodByBarcode({ apiKey }, barcode, allergies);

      if (food) {
        const foundAllergens = food.foundAllergens ?? [];
        result = {
          barcode,
          name: food.description?.trim() || 'Unknown Product',
          brand: food.brandName || food.brandOwner || 'Unknown Brand',
          isSafe: foundAllergens.length === 0,
          allergensFound: foundAllergens,
          openfoodError,
          source: 'usda',
          ingredients: food.ingredients || '',
          matchText: food.ingredients || '',
          icon: resolveIcon(food.foodCategory, food.description),
          nutriscore_grade: undefined, // USDA doesn't provide
          nutriscore_score: undefined,
          nova_group: undefined,
        };
      } else {
        usdaError = 'USDA returned no results';
      }
    } catch (error) {
      usdaError = error instanceof Error ? error.message : 'USDA Service Error';
    }
  }

  // 3. Neither source found the product. Surface "unknown" — never "safe".
  if (result.error || result.name === 'Unknown Product') {
    return {
      barcode,
      name: 'Unknown Product',
      brand: 'Unknown',
      isSafe: false,
      allergensFound: [],
      error: result.error || NOT_FOUND_MSG,
      openfoodError,
      usdaError,
      source: 'none',
      ingredients: result.ingredients || '',
    };
  }

  return result;
}
