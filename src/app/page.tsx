'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera,
  RefreshCcw,
  AlertCircle,
  ShieldCheck,
  Album,
} from 'lucide-react';
import { fetchProductByBarcode } from '@/lib/open-food-facts';
import { ProductResult } from '@/lib/open-food-facts';
import { Scanner } from '@/components/Scanner';
import { ScannerErrorBoundary } from '@/components/ScannerErrorBoundary';
import { AllergySettings } from '@/components/AllergySettings';
import { useAllergySettings } from '@/contexts/AllergyContext'; // Corrected hook name
import { SelectedAllergiesHeader } from '@/components/SelectedAllergiesHeader';
import {
  createUserErrorMessage,
  validateBarcode,
  logError,
} from '@/lib/errorHandling';
import { BarcodeSearchForm } from '@/components/BarcodeSearchForm';
import { ResultView } from '@/components/ResultView';
import { SnackScout } from '@/components/SnackScout';
import { SnackCollection } from '@/components/SnackCollection';
import { useSnackCollection } from '@/hooks/useSnackCollection';

export default function Home() {
  const [mode, setMode] = useState<
    'idle' | 'scanning' | 'loading' | 'result' | 'error'
  >('idle');
  const [barcode, setBarcode] = useState<string>('');
  const [result, setResult] = useState<ProductResult | null>(null);
  const [error, setError] = useState<string>('');
  // Added proper state for settings modal
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCollectionOpen, setIsCollectionOpen] = useState(false);
  const { allergies } = useAllergySettings();
  const { isCollected, toggleSnack } = useSnackCollection();

  // Shared lookup: fetch a barcode and route into result/error state.
  const lookupProduct = async (code: string) => {
    setBarcode(code);
    setMode('loading');
    try {
      const response = await fetchProductByBarcode(code, allergies);
      if (response.data) {
        setResult(response.data);
        setMode('result');
      } else {
        setError(response.error || 'Food not found');
        setMode('error');
      }
    } catch (err) {
      logError('lookupProduct', err);
      setError(createUserErrorMessage(err));
      setMode('error');
    }
  };

  const handleScan = (code: string) => {
    if (mode !== 'scanning') return;
    return lookupProduct(code);
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

  return (
    <main className="relative w-full max-w-md mx-auto px-6 pb-20 flex flex-col items-center min-h-screen justify-center overflow-x-hidden bg-deep-stone text-block-white app-container">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 bg-diamond-blue text-ink-navy focus:rounded"
      >
        Skip to main content
      </a>

      <header className="w-full px-6 py-4 flex flex-col items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-3 bg-block-white border-4 border-ink-navy rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all hover:-translate-y-[2px]"
            aria-label="Allergy settings"
          >
            <ShieldCheck
              className="w-8 h-8 text-grass-green"
              aria-hidden="true"
            />
          </button>
          <button
            onClick={reset}
            className="p-3 bg-block-white border-4 border-ink-navy rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all hover:-translate-y-[2px]"
            aria-label="Reset scanner"
          >
            <RefreshCcw
              className="w-8 h-8 text-redstone-red"
              aria-hidden="true"
            />
          </button>
          <button
            onClick={() => setIsCollectionOpen(true)}
            className="p-3 bg-block-white border-4 border-ink-navy rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all hover:-translate-y-[2px]"
            aria-label="My safe snacks collection"
          >
            <Album className="w-8 h-8 text-diamond-blue" aria-hidden="true" />
          </button>
        </div>

        <SnackScout />
        {mode !== 'idle' && <SelectedAllergiesHeader />}
      </header>

      <div
        id="main-content"
        className="w-full space-y-6 flex flex-col items-center"
      >
        <AnimatePresence mode="wait">
          {mode === 'idle' && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              className="w-full space-y-5 text-center"
            >
              <div className="space-y-3">
                <h2 className="text-5xl font-display font-black leading-tight">
                  Scan your{' '}
                  <span className="text-redstone-red italic underline decoration-ink-navy">
                    snack!
                  </span>
                </h2>
                <p className="text-lg text-grass-green font-body font-bold p-4 bg-block-white border-4 border-ink-navy rounded-[2rem] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] max-w-[95%] mx-auto">
                  Let&apos;s investigate if it&apos;s O.K to eat 🔍
                </p>
              </div>

              <div className="flex flex-col gap-4 w-full px-4">
                <button
                  onClick={() => setMode('scanning')}
                  className="group relative flex items-center justify-center gap-0 w-full bg-yellow-400 border-4 border-ink-navy p-6 rounded-[2.5rem] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[4px] active:translate-y-[4px] transition-all hover:-translate-y-[2px]"
                  aria-label="Start scanning"
                >
                  <Camera
                    className="w-20 h-20 group-hover:scale-110 transition-transform drop-shadow-[4px_4px_0px_rgba(0,0,0,0.8)]"
                    aria-hidden="true"
                  />
                </button>

                <div className="flex items-center gap-4">
                  <div className="h-2 flex-1 bg-gray-300 rounded-full border-4 border-ink-navy" />
                  <span className="text-block-white font-display font-black text-xl uppercase tracking-widest">
                    OR
                  </span>
                  <div className="h-2 flex-1 bg-gray-300 rounded-full border-4 border-ink-navy" />
                </div>

                <BarcodeSearchForm
                  barcode={barcode}
                  setBarcode={setBarcode}
                  onSearch={handleManualSubmit}
                  error={error}
                  errorType={error.includes('barcode') ? 'barcode' : 'general'}
                />
              </div>
            </motion.div>
          )}

          {mode === 'scanning' && (
            <motion.div
              key="scanning"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full space-y-10 flex flex-col items-center"
            >
              <div className="relative w-full flex justify-center">
                <div className="absolute -inset-4 bg-grass-green/20 rounded-[3rem] blur-2xl animate-pulse" />
                <ScannerErrorBoundary>
                  <Scanner onScan={handleScan} />
                </ScannerErrorBoundary>
              </div>
            </motion.div>
          )}

          {mode === 'loading' && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center"
              role="status"
              aria-live="polite"
            >
              <div className="relative">
                <div className="w-32 h-32 border-8 border-grass-green/20 border-t-ink-navy rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <ShieldCheck
                    className="w-12 h-12 text-ink-navy"
                    aria-hidden="true"
                  />
                </div>
              </div>
              <p className="mt-8 text-4xl font-display font-bold text-block-white animate-pulse">
                Looking for clues...
              </p>
            </motion.div>
          )}

          {mode === 'result' && result && (
            <ResultView
              key="result"
              result={result}
              onReset={reset}
              onCollect={() =>
                toggleSnack({ barcode, name: result.name, brand: result.brand })
              }
              isCollected={isCollected(barcode)}
            />
          )}

          {mode === 'error' && (
            <motion.div
              key="error"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full max-w-md space-y-10 flex flex-col items-center"
              role="alert"
            >
              <div className="bg-redstone-red p-12 border-4 border-ink-navy text-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] w-full">
                <AlertCircle
                  className="w-28 h-28 text-block-white mb-8 mx-auto"
                  aria-hidden="true"
                />
                <h3 className="text-6xl font-display font-black text-block-white uppercase tracking-tighter">
                  Oops!
                </h3>
                <p className="text-3xl text-block-white font-body font-bold mt-6">
                  {error}
                </p>
              </div>
              <button
                onClick={reset}
                className="w-full bg-ink-navy border-4 border-ink-navy text-block-white py-12 rounded-[3rem] text-4xl font-display font-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] transition-transform active:shadow-none active:translate-x-[4px] active:translate-y-[4px]"
                aria-label="Try again"
              >
                Try Again
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {isSettingsOpen && (
          <AllergySettings onClose={() => setIsSettingsOpen(false)} />
        )}
      </div>

      {isCollectionOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <SnackCollection onClose={() => setIsCollectionOpen(false)} />
        </div>
      )}
    </main>
  );
}
