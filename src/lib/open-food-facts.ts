import { ProductResult } from './open-food-facts-shared';
 
export * from './open-food-facts-shared';
 
/**
 * Client-side wrapper to fetch product data via our API route.
 * This ensures the request is made from the server (avoiding CORS/secrets exposure).
 * @param barcode The barcode to search
 * @param userAllergies List of allergies to check against product info
 */
export async function fetchProductByBarcode(barcode: string, userAllergies: string[] = []): Promise<ProductResult> {
    try {
        // Join allergies with commas for the query parameter
        const allergyQuery = userAllergies.length > 0 ? `?allergies=${userAllergies.join(',')}` : '';
        const response = await fetch(`/api/product/${barcode}${allergyQuery}`);
 
        if (!response.ok) {
            return {
                name: "Error",
                brand: "Error",
                isSafe: false,
                allergensFound: [],
                error: "I can't find that product. Ask a grown-up for help",
            };
        }
 
        return await response.json();
    } catch (error) {
        console.error("Error in fetchProductByBarcode (client side):", error);
        return {
            name: "Error",
            brand: "Error",
            isSafe: false,
            allergensFound: [],
            error: "I can't find that product. Ask a grown-up for help",
        };
    }
}
