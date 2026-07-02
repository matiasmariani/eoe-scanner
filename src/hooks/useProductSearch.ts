'use client';

import { useState, useCallback } from 'react';
import { ProductResult } from '@/lib/open-food-facts';
import { checkAllergens } from '@/lib/allergen-utils';

interface SearchProduct {
  code?: string;
  product_name?: string;
  brands?: string;
  ingredients_text?: string;
  allergens?: string;
  allergens_tags?: string[];
  image_url?: string;
  categories_tags?: string[];
  count?: number;
}

interface SearchParams {
  query: string;
  category?: string;
  page?: number;
  pageSize?: number;
}

export function useProductSearch(userAllergies: string[] = []) {
  const [results, setResults] = useState<ProductResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const search = useCallback(
    async (params: SearchParams) => {
      setIsLoading(true);
      setError(null);

      const MAX_RETRIES = 3;
      let lastError: Error | null = null;

      for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
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
                  process.env.NEXT_PUBLIC_OPENFOODFACTS_USER_AGENT ||
                  'SnackScout/1.0 (hi@matiasmariani.io)',
              },
              signal: AbortSignal.timeout(8000),
            },
          );

          if (!response.ok) {
            // Retry on 503 (rate limit/server error), give up on others
            if (response.status === 503 && attempt < MAX_RETRIES) {
              const delay = Math.pow(2, attempt - 1) * 1000; // 1s, 2s, 4s
              await new Promise((resolve) => setTimeout(resolve, delay));
              continue;
            }
            throw new Error(`Search API error: ${response.status}`);
          }

          const data = await response.json();
          let products = data.products || [];

          // Client-side category filter: OFF API doesn't strictly filter by category
          if (params.category) {
            const categoryTag = `categories_${params.category}`;
            products = products.filter(
              (p: SearchProduct) =>
                p.categories_tags?.includes(categoryTag) ||
                p.categories_tags?.some((tag: string) =>
                  tag.toLowerCase().includes(params.category!.toLowerCase()),
                ),
            );
          }

          // Map to ProductResult and check allergens
          const mapped: ProductResult[] = products
            .slice(0, 12)
            .map((p: SearchProduct) => {
              const ingredients = p.ingredients_text || '';
              const allergens = p.allergens || '';
              const allergensTags = p.allergens_tags || [];
              const haystack = `${ingredients} ${allergens} ${allergensTags.join(' ')}`;
              const found = checkAllergens(haystack, userAllergies);

              return {
                barcode: p.code || '',
                name: p.product_name || 'Unknown',
                brand: p.brands || 'Unknown',
                isSafe: found.length === 0,
                allergensFound: found,
                image_url: p.image_url,
                ingredients: ingredients,
                source: 'openfoodfacts',
              };
            });

          setResults(params.page === 1 ? mapped : [...results, ...mapped]);
          setCurrentPage(params.page || 1);
          setHasMore(
            (data.count || 0) > (params.page || 1) * (params.pageSize || 12),
          );
          return; // Success, exit retry loop
        } catch (err) {
          lastError = err instanceof Error ? err : new Error('Unknown error');
          // Continue to next retry attempt
        }
      }

      // All retries exhausted
      if (lastError) {
        setError(lastError.message);
      }
      setResults([]);
      setIsLoading(false);
    },
    [userAllergies, results],
  );

  const loadMore = useCallback(() => {
    search({ query: '', page: currentPage + 1, pageSize: 12 });
  }, [currentPage, search]);

  return {
    results,
    isLoading,
    hasMore,
    error,
    search,
    loadMore,
  };
}
