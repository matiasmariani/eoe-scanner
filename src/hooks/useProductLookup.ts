import { useState } from 'react';
import { ProductResult } from '@/lib/open-food-facts-shared';
import {
  createUserErrorMessage,
  validateBarcode,
  logError,
} from '@/lib/errorHandling';
import { useAllergySettings } from '@/contexts/AllergyContext';
import { lookupProductAction } from '@/app/actions';

export function useProductLookup() {
  const [mode, setMode] = useState<
    'idle' | 'scanning' | 'loading' | 'result' | 'error'
  >('idle');
  const [barcode, setBarcode] = useState<string>('');
  const [result, setResult] = useState<ProductResult | null>(null);
  const [error, setError] = useState<string>('');

  const { allergies } = useAllergySettings();

  const lookupProduct = async (code: string) => {
    setBarcode(code);
    setMode('loading');
    try {
      const result = await lookupProductAction(code, allergies);
      if (result.error) {
        setError(result.error);
        setMode('error');
      } else {
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
