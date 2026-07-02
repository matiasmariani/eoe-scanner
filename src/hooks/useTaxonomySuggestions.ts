'use client';

import { useState, useEffect } from 'react';
import { fetchTaxonomySuggestions } from '@/lib/open-food-facts';

export interface TaxonomySuggestion {
  name: string;
  id: string;
}

export function useTaxonomySuggestions(query: string, enabled: boolean = true) {
  const [suggestions, setSuggestions] = useState<TaxonomySuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!enabled || !query || query.length < 2) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    // Debounce: wait 300ms after user stops typing before fetching
    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const results = await fetchTaxonomySuggestions(query);
        setSuggestions(results);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, enabled]);

  return { suggestions, isLoading };
}
