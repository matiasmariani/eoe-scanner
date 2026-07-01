'use client';

import { useState } from 'react';
import { ProductResult } from '@/lib/open-food-facts';
import {
  createUserErrorMessage,
  validateBarcode,
  logError,
} from '@/lib/errorHandling';
import { recomputeVerdict } from '@/lib/allergen-utils';
import { useAllergySettings } from '@/contexts/AllergyContext';
import { lookupProductAction } from '@/app/actions';
import { dbService } from '@/lib/db';
import { useHistory } from '@/hooks/useHistory';

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
        const { isSafe, allergensFound } = recomputeVerdict(
          cachedResult.result.matchText ?? cachedResult.result.ingredients,
          allergies,
        );
        const refreshed = { ...cachedResult.result, isSafe, allergensFound };
        await addHistory(code, refreshed);
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
    error,
    lookupProduct,
    handleManualSubmit,
    reset,
  };
}
