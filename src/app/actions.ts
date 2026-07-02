'use server';

import {
  fetchProductFromOpenFoodFacts,
  ProductResult,
} from '@/lib/open-food-facts';
import { findFoodByBarcode } from '@/services/usdaService';
import { resolveIcon } from '@/lib/icon-utils';
import { checkAllergens } from '@/lib/allergen-utils';

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

interface OpenFoodFactsProduct {
  code?: string;
  product_name?: string;
  brands?: string;
  ingredients_text?: string;
  allergens?: string;
  allergens_tags?: string[];
  image_url?: string;
  categories_tags?: string[];
  nutriscore_grade?: string;
  nutriscore_score?: number;
  nova_group?: number;
}

interface SearchParams {
  query?: string;
  category?: string;
  page?: number;
  pageSize?: number;
}

/**
 * Server action for product search (avoids CORS issues on client).
 */
export async function searchProductsAction(
  params: SearchParams,
  allergies: string[],
): Promise<ProductResult[]> {
  try {
    const searchParams = new URLSearchParams();
    if (params.query) searchParams.append('search_terms', params.query);
    if (params.category)
      searchParams.append('tag_0', `categories_${params.category}`);
    searchParams.append('page', String(params.page || 1));
    searchParams.append('page_size', String(params.pageSize || 12));
    searchParams.append('json', '1');

    const response = await fetch(
      `https://us.openfoodfacts.org/api/v2/search?${searchParams.toString()}`,
      {
        headers: {
          'User-Agent':
            process.env.OPENFOODFACTS_USER_AGENT || 'SnackScout/1.0',
        },
        next: { revalidate: 3600 }, // Cache for 1 hour
      },
    );

    if (!response.ok) {
      throw new Error(`Search API error: ${response.status}`);
    }

    const data = await response.json();
    let products = data.products || [];

    // Client-side category filter: OFF API doesn't strictly filter by category
    if (params.category) {
      const categoryTag = `categories_${params.category}`;
      products = products.filter(
        (p: OpenFoodFactsProduct) =>
          p.categories_tags?.includes(categoryTag) ||
          p.categories_tags?.some((tag: string) =>
            tag.toLowerCase().includes(params.category!.toLowerCase()),
          ),
      );
    }

    // Map to ProductResult and check allergens
    const mapped: ProductResult[] = products
      .slice(0, 12)
      .map((p: OpenFoodFactsProduct) => {
        const ingredients = p.ingredients_text || '';
        const allergens = p.allergens || '';
        const allergensTags = p.allergens_tags || [];
        const found = checkAllergens(
          `${ingredients} ${allergens} ${allergensTags.join(' ')}`,
          allergies,
        );

        return {
          barcode: p.code || '',
          name: p.product_name || 'Unknown',
          brand: p.brands || 'Unknown',
          isSafe: found.length === 0,
          allergensFound: found,
          image_url: p.image_url,
          ingredients: ingredients,
          nutriscore_grade: p.nutriscore_grade,
          nutriscore_score: p.nutriscore_score,
          nova_group: p.nova_group,
          source: 'openfoodfacts',
        };
      });

    return mapped;
  } catch {
    return [];
  }
}
