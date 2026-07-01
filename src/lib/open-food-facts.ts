export interface ProductResult {
  name: string;
  brand: string;
  isSafe: boolean;
  allergensFound: string[];
  error?: string;
  warning?: boolean;
  image_url?: string;
  openfoodError?: string;
  usdaError?: string;
  source?: string;
  ingredients?: string;
  icon?: string;
}

export interface OpenFoodFactsResponse {
  status: string;
  result?: {
    id: string;
    name: string;
    lc_name: string;
  };
  warnings?: Array<{
    message: {
      id: string;
      name: string;
      lc_name: string;
      description: string;
      lc_description: string;
    };
    field: {
      id: string;
      value: string;
    };
    impact: {
      id: string;
      name: string;
      lc_name: string;
      description: string;
      lc_description: string;
    };
  }>;
  errors?: Array<{
    message: {
      id: string;
      name: string;
      lc_name: string;
      description: string;
      lc_description: string;
    };
    field: {
      id: string;
      value: string;
    };
    impact: {
      id: string;
      name: string;
      lc_name: string;
      description: string;
      lc_description: string;
    };
  }>;
  product: {
    product_type?: string;
    product_name?: string;
    abbreviated_product_name?: string;
    code?: string;
    codes_tags?: string[];
    generic_name?: string;
    id?: string;
    lc?: string;
    lang?: string;
    nova_group?: number;
    nova_groups?: string;
    obsolete?: string;
    obsolete_since_date?: string;
    product_quantity?: string;
    product_quantity_unit?: string;
    quantity?: string;
    serving_quantity?: string;
    serving_quantity_unit?: string;
    serving_size?: string;
    brands?: string;
    brands_tags?: string[];
    categories?: string;
    categories_tags?: string[];
    allergens?: string;
    allergens_lc?: string;
    allergens_hierarchy?: string[];
    allergens_tags?: string[];
    ingredients?: Array<{
      id: string;
      ingredients?: Record<string, unknown>;
      percent?: number;
      percent_estimate?: number;
      percent_max?: string;
      percent_min?: number;
      text?: string;
      vegan?: string;
      vegetarian?: string;
    }>;
    ingredients_text?: string;
    ingredients_with_specified_percent_n?: number;
    nutriment_levels?: Record<string, unknown>;
    nutriscore?: Record<string, unknown> | null;
    nutriscore_grade?: string;
    nutriscore_score?: number;
    nutriscore_version?: string;
    allergens_text?: string;
    image_url?: string;
  };
}

import { checkAllergens } from './allergen-utils';
import { resolveIcon } from './icon-utils';
import { logError } from './errorHandling';
import { OpenFoodFactsResponseSchema } from './schemas';

const ERROR_MSG = "I can't find that product. Ask a grown-up for help";

// Only the fields we actually consume — keeps the OFF response small/fast.
const OFF_FIELDS =
  'product_name,brands,ingredients_text,allergens,allergens_tags,image_url,image_front_url,image_small_url,categories_tags';

// We cache the raw product data (the expensive network result) rather than a
// computed ProductResult, so allergen matching is re-run against the current
// user allergies on every call — including cache hits.
interface RawProduct {
  notFound: boolean;
  error?: string;
  name?: string;
  brand?: string;
  ingredients?: string;
  allergensText?: string;
  allergensTags?: string[];
  categoriesTags?: string[];
  image_url?: string;
}

async function fetchRawProduct(barcode: string): Promise<RawProduct> {
  try {
    const response = await fetch(
      `https://us.openfoodfacts.org/api/v3.6/product/${barcode}?fields=${OFF_FIELDS}`,
      {
        headers: {
          'User-Agent':
            process.env.OPENFOODFACTS_USER_AGENT ||
            'AllergyScout/1.0 (contact@example.com)',
        },
        next: { revalidate: 86400 }, // Cache for 24 hours using Next.js native fetch cache
      },
    );

    if (!response.ok) {
      return {
        notFound: true,
        error: `API responded with status: ${response.status}`,
      };
    }

    const json = await response.json();
    console.log(
      'OFF API Response for barcode ' + barcode + ':',
      JSON.stringify(json, null, 2),
    );
    const data = OpenFoodFactsResponseSchema.safeParse(json);

    if (!data.success) {
      logError('open-food-facts-validation', data.error);
      return { notFound: true, error: ERROR_MSG };
    }

    const validatedData = data.data;

    if (validatedData.status === 'failure' || !validatedData.product) {
      const firstError = validatedData.errors?.[0];
      let error = ERROR_MSG;
      if (firstError?.message?.name && firstError.message.name.trim() !== '') {
        error = firstError.message.name;
      } else if (
        validatedData.result?.name &&
        validatedData.result.name.trim() !== ''
      ) {
        error = validatedData.result.name;
      }
      return { notFound: true, error };
    }

    const product = validatedData.product;
    return {
      notFound: false,
      name: product.product_name || 'Unknown Product',
      brand: product.brands || 'Unknown Brand',
      ingredients: product.ingredients_text || '',
      allergensText: product.allergens || '',
      allergensTags: product.allergens_tags || [],
      categoriesTags: product.categories_tags || [],
      image_url:
        product.image_url ??
        product.image_front_url ??
        product.image_small_url ??
        undefined,
    };
  } catch (error) {
    logError('open-food-facts-fetch', error);
    return { notFound: true, error: ERROR_MSG };
  }
}

export async function fetchProductFromOpenFoodFacts(
  barcode: string,
  userAllergies: string[] = [],
): Promise<ProductResult> {
  const raw = await fetchRawProduct(barcode);

  if (raw.notFound) {
    return {
      name: 'Unknown Product',
      brand: 'Unknown',
      isSafe: false,
      allergensFound: [],
      error: raw.error || ERROR_MSG,
      ingredients: '',
    };
  }

  // OFF allergen tags (e.g. "en:milk") are the most reliable signal; combine
  // them with the free-text ingredients and allergens label for matching.
  const haystack = `${raw.ingredients} ${raw.allergensText} ${(raw.allergensTags ?? []).join(' ')}`;
  const foundAllergens = checkAllergens(haystack, userAllergies);

  return {
    name: raw.name!,
    brand: raw.brand!,
    isSafe: foundAllergens.length === 0,
    allergensFound: foundAllergens,
    ingredients: raw.ingredients ?? '',
    image_url: raw.image_url,
    icon: resolveIcon(raw.categoriesTags, raw.name!),
  };
}

// USDA types live in `@/services/usdaService` (the single USDA implementation).
