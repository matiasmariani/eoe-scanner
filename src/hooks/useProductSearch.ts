'use client';

import { useState, useCallback } from 'react';
import { ProductResult } from '@/lib/open-food-facts';
import { searchProductsAction } from '@/app/actions';

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

      try {
        // Call server action (avoids CORS issues)
        const mapped = await searchProductsAction(params, userAllergies);

        setResults(params.page === 1 ? mapped : [...results, ...mapped]);
        setCurrentPage(params.page || 1);
        setHasMore(mapped.length >= (params.pageSize || 12));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Search failed');
        setResults([]);
      } finally {
        setIsLoading(false);
      }
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
