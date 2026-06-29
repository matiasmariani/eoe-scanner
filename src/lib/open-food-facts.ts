import { ProductResult } from './open-food-facts-shared';

export * from './open-food-facts-shared';

export type ApiResponse<T> = {
  data: T | null;
  error: string | null;
};

/**
 * Client-side wrapper to fetch product data via our API route.
 * This ensures the request is made from the server (avoiding CORS/secrets exposure).
 * @param barcode The barcode to search
 * @param userAllergies List of allergies to check against product info
 */
export async function fetchProductByBarcode(
  barcode: string,
  userAllergies: string[] = [],
): Promise<ApiResponse<ProductResult>> {
  try {
    const allergyQuery =
      userAllergies.length > 0
        ? `?allergies=${encodeURIComponent(userAllergies.join(','))}`
        : '';
    const response = await fetch(`/api/product/${barcode}${allergyQuery}`);

    if (!response.ok) {
      return {
        data: null,
        error: "I can't find that product. Ask a grown-up for help",
      };
    }

    const data = await response.json();

    // If the API returns an object with an error property (like in some failure cases)
    if (data.error) {
      return {
        data: null,
        error: data.error,
      };
    }

    return {
      data,
      error: null,
    };
  } catch (error) {
    console.error('Error in fetchProductByBarcode (client side):', error);
    return {
      data: null,
      error: 'An unexpected error occurred. Please try again.',
    };
  }
}
