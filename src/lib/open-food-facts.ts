import {
  fetchProductFromOpenFoodFacts,
  type ProductResult,
} from './open-food-facts-shared';

export { fetchProductFromOpenFoodFacts, type ProductResult };

export const fetchProductByBarcode = fetchProductFromOpenFoodFacts;
