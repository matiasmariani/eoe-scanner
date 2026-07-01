import { checkAllergens } from '../lib/allergen-utils';
import { USDAFoodSearchResponseSchema } from '../lib/schemas';

export interface USDAConfig {
  apiKey: string;
}

export interface USDAFood {
  fdcId: number;
  description: string;
  lowercaseDescription: string;
  dataType: string;
  gtinUpc?: string;
  publishedDate?: string;
  brandOwner?: string;
  brandName?: string;
  ingredients?: string;
  marketCountry?: string;
  foodCategory?: string;
  modifiedDate?: string;
  dataSource?: string;
  packageWeight?: string;
  servingSizeUnit?: string;
  servingSize?: number;
  tradeChannels?: string[];
  allHighlightFields?: string;
  score?: number;
  foodNutrients?: Array<{
    nutrientId: number;
    nutrientName: string;
    nutrientNumber: string;
    unitName: string;
    derivationCode: string;
    derivationDescription: string;
    derivationId: number;
    value: number;
    foodNutrientSourceId: number;
    foodNutrientSourceCode: string;
    foodNutrientSourceDescription: string;
    rank: number;
    indentLevel: number;
    foodNutrientId: number;
  }>;
  foundAllergens?: string[];
}

export interface USDAFoodSearchResponse {
  totalHits: number;
  currentPage: number;
  totalPages: number;
  pageList: number[];
  foodSearchCriteria: Record<string, unknown>;
  foods: USDAFood[];
}

export interface USDAErrorResponse {
  error?: {
    code?: string;
    message?: string;
  };
  timestamp?: string;
  status?: number;
  message?: string;
  path?: string;
}

const BASE_URL = 'https://api.nal.usda.gov/fdc/v1';

export async function searchFood(
  config: USDAConfig,
  query: string,
  dataType: string[],
  userAllergies: string[] = [],
): Promise<USDAFoodSearchResponse> {
  const response = await fetch(
    `${BASE_URL}/foods/search?api_key=${config.apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        dataType,
      }),
      signal: AbortSignal.timeout(8000), // Don't hang forever on flaky networks
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`USDA API error: ${response.status} - ${errorText}`);
  }

  const json = await response.json();
  const result = USDAFoodSearchResponseSchema.safeParse(json);

  if (!result.success) {
    throw new Error(`USDA API validation error: ${result.error.message}`);
  }

  const data = result.data;

  if (data.foods && Array.isArray(data.foods)) {
    data.foods = data.foods.map((food) => ({
      ...food,
      foundAllergens: checkAllergens(food.ingredients, userAllergies),
    }));
  }

  return data;
}

/**
 * Looks up a single branded food by its barcode (UPC/GTIN).
 * Search results are ranked by relevance, not exactness, so we prefer the food
 * whose `gtinUpc` exactly matches the barcode and only fall back to the top hit.
 * Returns null when nothing is found.
 */
export async function findFoodByBarcode(
  config: USDAConfig,
  barcode: string,
  userAllergies: string[] = [],
): Promise<USDAFood | null> {
  const data = await searchFood(config, barcode, ['Branded'], userAllergies);
  if (!data.foods || data.foods.length === 0) return null;
  return (
    data.foods.find((food) => food.gtinUpc === barcode) ?? data.foods[0] ?? null
  );
}
