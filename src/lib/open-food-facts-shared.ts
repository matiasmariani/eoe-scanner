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
    };
}

const CACHE = new Map<string, { data: ProductResult; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000;

export async function fetchProductFromOpenFoodFacts(barcode: string, userAllergies: string[] = []): Promise<ProductResult> {
    const errorMsg = "I can't find that product. Ask a grown-up for help";

    // Cache check
    if (userAllergies.length === 0) {
        const cached = CACHE.get(barcode);
        if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
            return cached.data;
        }
    }

    try {
        const response = await fetch(
            `https://world.openfoodfacts.org/api/v3.6/product/${barcode}`,
            {
                headers: {
                    'User-Agent': process.env.NEXT_PUBLIC_OPENFOODFACTS_USER_AGENT || 'AllergyScout/1.0 (contact@example.com)'
                }
            }
        );

        console.log("SHIT", response)
        const data: OpenFoodFactsResponse = await response.json();
        console.log("RESPONSE data", data)

        // 1. Check if product was found or status is failure, or if response is not ok
        if (!response.ok || data.status === "failure" || !data.product) {
            console.log('GATO>>>', data)
            let errorMsgFromApi = errorMsg;
            const firstError = data.errors?.[0];
            
            if (firstError?.message?.name && firstError.message.name.trim() !== "") {
                errorMsgFromApi = firstError.message.name;
            } else if (data.result?.name && data.result.name.trim() !== "") {
                errorMsgFromApi = data.result.name;
            } else if (firstError?.message && typeof firstError.message === 'string') {
                errorMsgFromApi = firstError.message;
            }
            
            const result: ProductResult = {
                name: "Unknown Product",
                brand: "Unknown",
                isSafe: false,
                allergensFound: [],
                error: errorMsgFromApi,
            };
            CACHE.set(barcode, { data: result, timestamp: Date.now() });
            return result;
        }
        const product = data.product;
        const productName = product.product_name || "Unknown Product";
        const brandName = product.brands || "Unknown Brand";

        const foundAllergens: string[] = [];
        const labeledText = product.allergens_lc || "";
        const ingredientsText = product.ingredients_text || "";
        const rawAllergensText = product.allergens || "";
        const textToScan = `${labeledText} ${ingredientsText} ${rawAllergensText}`.toLowerCase();

        for (const allergy of userAllergies) {
            if (textToScan.includes(allergy.toLowerCase())) {
                foundAllergens.push(allergy);
            }
        }

        const result: ProductResult = {
            name: productName,
            brand: brandName,
            isSafe: foundAllergens.length === 0,
            allergensFound: foundAllergens,
        };

        CACHE.set(barcode, { data: result, timestamp: Date.now() });
        return result;

    } catch (error) {
        console.error(`[fetchProductFromOpenFoodFacts] error:`, error);
        return {
            name: "Error",
            brand: "Error",
            isSafe: false,
            allergensFound: [],
            error: errorMsg,
        };
    }
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
