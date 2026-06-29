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

export async function searchFood(config: USDAConfig, query: string, dataType: string[]): Promise<USDAFoodSearchResponse> {
  try {
    const response = await fetch(`${BASE_URL}/foods/search?api_key=${config.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        dataType,
      }),
    });

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}

export async function getFoodDetails(config: USDAConfig, fdcId: string): Promise<USDAFood> {
  try {
    const response = await fetch(`${BASE_URL}/food/${fdcId}?api_key=${config.apiKey}`);

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}
