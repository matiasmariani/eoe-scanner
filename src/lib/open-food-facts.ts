export interface ProductResult {
  name: string;
  brand: string;
  isSafe: boolean;
  allergensFound: string[];
  error?: string;
}

export interface OpenFoodFactsResponse {
  status: number;
  product: {
    product_name?: string;
    brands?: string;
    allergens_list?: string[];
    ingredients_text?: string;
    allergens?: string;
  };
}

export async function fetchProductByBarcode(barcode: string): Promise<ProductResult> {
  try {
    const response = await fetch(
      `https://world.openfoodfacts.org/api/v0/product/${barcode}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch product data");
    }

    const data: OpenFoodFactsResponse = await response.json();

    if (data.status === 0) {
      return {
        name: "Unknown Product",
        brand: "Unknown",
        isSafe: true,
        allergensFound: [],
        error: "Product not found",
      };
    }

    const product = data.product;
    const productName = product.product_name || "Unknown Product";
    const brandName = product.brands || "Unknown Brand";

    // Target allergens
    const TARGET_ALLERGENS = [
      { label: "Dairy", keywords: ["milk", "cheese", "lactose", "cream", "butter", "dairy"] },
      { label: "Wheat", keywords: ["wheat", "gluten", "flour"] },
      { label: "Egg", keywords: ["egg", "albumen"] },
    ];

    const foundAllergens: string[] = [];

    // Check allergens_list (if available) and ingredients_text
    const textToScan = `${(product.allergens_list || []).join(" ")} ${product.ingredients_text || ""}`.toLowerCase();

    for (const allergen of TARGET_ALLERGENS) {
      if (allergen.keywords.some((keyword) => textToScan.includes(keyword))) {
        foundAllergens.push(allergen.label);
      }
    }

    const isSafe = foundAllergens.length === 0;

    return {
      name: productName,
      brand: brandName,
      isSafe,
      allergensFound: foundAllergens,
    };
  } catch (error) {
    console.error("Error fetching product:", error);
    return {
      name: "Error",
      brand: "Error",
      isSafe: false,
      allergensFound: [],
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
