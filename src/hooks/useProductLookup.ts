'use client';

import { useState } from 'react';
import { ProductResult } from '@/lib/open-food-facts';
import {
  createUserErrorMessage,
  validateBarcode,
  logError,
} from '@/lib/errorHandling';
import {
  recomputeVerdict,
  recomputeVerdictStructured,
} from '@/lib/allergen-utils';
import { useAllergySettings } from '@/contexts/AllergyContext';
import { lookupProductAction } from '@/app/actions';
import { dbService } from '@/lib/db';
import { useHistory } from '@/hooks/useHistory';
import { saveProduct } from '@/lib/product-db';

export function useProductLookup() {
  const [mode, setMode] = useState<
    'idle' | 'scanning' | 'loading' | 'result' | 'error'
  >('idle');
  const [barcode, setBarcode] = useState<string>('');
  const [result, setResult] = useState<ProductResult | null>(null);
  const [error, setError] = useState<string>('');

  const { allergies } = useAllergySettings();
  const { addHistory } = useHistory();

  const lookupProduct = async (code: string) => {
    setBarcode(code);
    setMode('loading');

    try {
      // 1. Check IndexedDB first. Re-run the allergen check against the CURRENT
      //    allergies (against both ingredients and allergen tags via matchText)
      //    so a cached product reflects newly-added/custom allergens and the
      //    active profile — never a stale verdict.
      const cachedResult = await dbService.getHistoryByBarcode(code);
      if (cachedResult) {
        // Check if cached result is missing nutrition data (old cache format)
        const hasMissingNutrition =
          !cachedResult.result.nutriscore_grade &&
          !cachedResult.result.nova_group;

        // If nutrition data is missing, fetch fresh data to get it
        // But keep the cached allergen verdict and other data
        let enrichedResult = cachedResult.result;
        if (hasMissingNutrition) {
          try {
            const freshData = await lookupProductAction(code, allergies);
            // Merge: use cached allergen verdict, but get fresh nutrition data
            enrichedResult = {
              ...cachedResult.result,
              nutriscore_grade: freshData.nutriscore_grade,
              nutriscore_score: freshData.nutriscore_score,
              nova_group: freshData.nova_group,
              // Also update these in case API has newer data
              brand: freshData.brand || cachedResult.result.brand,
              image_url: freshData.image_url || cachedResult.result.image_url,
            };
          } catch (err) {
            // If API fetch fails, just use cached result as-is
            logError('fetch-nutrition-enrichment', err);
          }
        }

        // Re-compute allergen verdict against current user allergies
        const { isSafe, allergensFound } = enrichedResult.ingredientsArray
          ?.length
          ? recomputeVerdictStructured(
              enrichedResult.ingredientsArray,
              enrichedResult.matchText ?? '',
              allergies,
            )
          : recomputeVerdict(
              enrichedResult.matchText ?? enrichedResult.ingredients,
              allergies,
            );
        const refreshed = { ...enrichedResult, isSafe, allergensFound };
        await addHistory(code, refreshed);
        await saveProduct(refreshed);
        setResult(refreshed);
        setMode('result');
        return;
      }

      // 2. Hit API if not found in IndexedDB
      const result = await lookupProductAction(code, allergies);
      if (result.error) {
        setError(result.error);
        setMode('error');
      } else {
        // 3. Save to IndexedDB for future use
        await addHistory(code, result);
        await saveProduct(result);
        setResult(result);
        setMode('result');
      }
    } catch (err) {
      logError('lookupProduct', err);
      setError(createUserErrorMessage(err));
      setMode('error');
    }
  };

  const handleManualSubmit = async (code: string) => {
    if (!code) return;
    const validation = validateBarcode(code);
    if (!validation.valid) {
      setError(validation.error || 'Invalid barcode');
      setMode('error');
      return;
    }
    await lookupProduct(code);
  };

  const reset = () => {
    setBarcode('');
    setResult(null);
    setError('');
    setMode('idle');
  };

  return {
    mode,
    setMode,
    barcode,
    setBarcode,
    result,
    setResult,
    error,
    lookupProduct,
    handleManualSubmit,
    reset,
  };
}
