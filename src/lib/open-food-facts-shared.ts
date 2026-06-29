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

import { checkAllergens } from "./allergen-utils";

const ERROR_MSG = "I can't find that product. Ask a grown-up for help";

// Only the fields we actually consume — keeps the OFF response small/fast.
const OFF_FIELDS = "product_name,brands,ingredients_text,allergens,allergens_tags,image_url";

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
    image_url?: string;
}

const CACHE = new Map<string, { data: RawProduct; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000;

async function fetchRawProduct(barcode: string): Promise<RawProduct> {
    try {
        const response = await fetch(
            `https://world.openfoodfacts.org/api/v3.6/product/${barcode}?fields=${OFF_FIELDS}`,
            {
                headers: {
                    'User-Agent': process.env.NEXT_PUBLIC_OPENFOODFACTS_USER_AGENT || 'AllergyScout/1.0 (contact@example.com)'
                }
            }
        );

        const data: OpenFoodFactsResponse = await response.json();

        if (!response.ok || data.status === "failure" || !data.product) {
            const firstError = data.errors?.[0];
            let error = ERROR_MSG;
            if (firstError?.message?.name && firstError.message.name.trim() !== "") {
                error = firstError.message.name;
            } else if (data.result?.name && data.result.name.trim() !== "") {
                error = data.result.name;
            }
            return { notFound: true, error };
        }

        const product = data.product;
        return {
            notFound: false,
            name: product.product_name || "Unknown Product",
            brand: product.brands || "Unknown Brand",
            ingredients: product.ingredients_text || "",
            allergensText: product.allergens || "",
            allergensTags: product.allergens_tags || [],
            image_url: product.image_url,
        };
    } catch (error) {
        console.error(`[fetchProductFromOpenFoodFacts] error:`, error);
        return { notFound: true, error: ERROR_MSG };
    }
}

export async function fetchProductFromOpenFoodFacts(barcode: string, userAllergies: string[] = []): Promise<ProductResult> {
    let raw: RawProduct;
    const cached = CACHE.get(barcode);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        raw = cached.data;
    } else {
        raw = await fetchRawProduct(barcode);
        CACHE.set(barcode, { data: raw, timestamp: Date.now() });
    }

    if (raw.notFound) {
        return {
            name: "Unknown Product",
            brand: "Unknown",
            isSafe: false,
            allergensFound: [],
            error: raw.error || ERROR_MSG,
            ingredients: "",
        };
    }

    // OFF allergen tags (e.g. "en:milk") are the most reliable signal; combine
    // them with the free-text ingredients and allergens label for matching.
    const haystack = `${raw.ingredients} ${raw.allergensText} ${(raw.allergensTags ?? []).join(" ")}`;
    const foundAllergens = checkAllergens(haystack, userAllergies);

    return {
        name: raw.name!,
        brand: raw.brand!,
        isSafe: foundAllergens.length === 0,
        allergensFound: foundAllergens,
        ingredients: raw.ingredients ?? "",
        image_url: raw.image_url,
    };
}

// USDA types live in `@/services/usdaService` (the single USDA implementation).
