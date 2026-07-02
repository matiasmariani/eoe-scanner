'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera,
  RefreshCcw,
  AlertCircle,
  ShieldCheck,
  Album,
  History,
  UserRound,
  Check,
  BookOpen,
} from 'lucide-react';
import { ThemeSelector } from '@/components/ThemeSelector';
import { Scanner } from '@/components/Scanner';
import { ScannerErrorBoundary } from '@/components/ScannerErrorBoundary';
import { AllergySettings } from '@/components/AllergySettings';
import { ProfileSetupModal } from '@/components/ProfileSetupModal';
import { SelectedAllergiesHeader } from '@/components/SelectedAllergiesHeader';
import { BarcodeSearchForm } from '@/components/BarcodeSearchForm';
import { ResultView } from '@/components/ResultView';
import { SnackScout } from '@/components/SnackScout';
import { SnackCollection } from '@/components/SnackCollection';
import { HistoryView } from '@/components/HistoryView';
import { AdultModeModal } from '@/components/AdultModeModal';
import { ProductSearchModal } from '@/components/ProductSearchModal';
import { SafeFoodsView } from '@/components/SafeFoodsView';
import { useAllergySettings } from '@/contexts/AllergyContext';
import { useProductLookup } from '@/hooks/useProductLookup';
import { useHistory } from '@/hooks/useHistory';
import { useSnackCollection } from '@/hooks/useSnackCollection';
import { PremiumGate } from '@/components/PremiumGate';
import { useIsPremium } from '@/lib/premium';
import { cn } from '@/lib/utils';

export function HomeClient() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCollectionOpen, setIsCollectionOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isAdultModalOpen, setIsAdultModalOpen] = useState(false);
  const [showHistoryGate, setShowHistoryGate] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showSafeFoods, setShowSafeFoods] = useState(false);
  const isPremium = useIsPremium();
  const { adultMode, activeProfile } = useAllergySettings();

  const {
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
  } = useProductLookup();

  const { history, addHistory } = useHistory();
  const { toggleSnack } = useSnackCollection();

  const handleScan = (code: string) => {
    if (mode !== 'scanning') return;
    return lookupProduct(code);
  };

  return (
    <main className="relative w-full max-w-md mx-auto px-6 pb-28 flex flex-col items-center min-h-screen justify-center overflow-x-hidden bg-theme-bg text-theme-text app-container">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 bg-theme-accent text-theme-bg focus:rounded"
      >
        Skip to main content
      </a>

      <header className="w-full px-4 py-4 flex flex-col items-center justify-between gap-4">
        <div className="w-full flex items-center justify-between gap-2">
          {/* Left buttons cluster */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 bg-theme-bg border-4 border-theme-border rounded-2xl shadow-voxel active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all hover:-translate-y-[2px]"
              aria-label="Allergy settings"
              title="Settings"
            >
              <ShieldCheck
                className="w-6 h-6 text-theme-primary"
                aria-hidden="true"
              />
            </button>
            <button
              onClick={() => setShowSafeFoods(true)}
              className="p-2 bg-theme-bg border-4 border-theme-border rounded-2xl shadow-voxel active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all hover:-translate-y-[2px]"
              aria-label="Safe foods list"
              title="Safe Foods"
            >
              <BookOpen
                className="w-6 h-6 text-theme-accent"
                aria-hidden="true"
              />
            </button>
            <button
              onClick={() => setIsCollectionOpen(true)}
              className="p-2 bg-theme-bg border-4 border-theme-border rounded-2xl shadow-voxel active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all hover:-translate-y-[2px]"
              aria-label="My safe snacks collection"
              title="Collection"
            >
              <Album className="w-6 h-6 text-theme-accent" aria-hidden="true" />
            </button>
            <button
              onClick={() => {
                if (!isPremium) {
                  setShowHistoryGate(true);
                  return;
                }
                setIsHistoryOpen(true);
              }}
              disabled={!history || history.length === 0}
              className={`p-2 bg-theme-bg border-4 border-theme-border rounded-2xl shadow-voxel active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all hover:-translate-y-[2px] ${!history || history.length === 0 ? 'opacity-40 grayscale cursor-not-allowed hover:translate-y-0' : ''}`}
              aria-label="Scan history"
              title="History"
            >
              <History
                className="w-6 h-6 text-theme-primary"
                aria-hidden="true"
              />
            </button>
          </div>

          {/* Right buttons cluster */}
          <div className="flex items-center gap-2">
            <ThemeSelector />
            <button
              onClick={reset}
              className="p-2 bg-theme-bg border-4 border-theme-border rounded-2xl shadow-voxel active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all hover:-translate-y-[2px]"
              aria-label="Reset scanner"
              title="Reset"
            >
              <RefreshCcw
                className="w-6 h-6 text-redstone-red"
                aria-hidden="true"
              />
            </button>
          </div>
        </div>

        <SnackScout />
        {mode !== 'idle' && <SelectedAllergiesHeader />}
      </header>

      <div
        id="main-content"
        className="w-full space-y-6 flex flex-col items-center"
      >
        {showSearchModal && (
          <ProductSearchModal
            onClose={() => setShowSearchModal(false)}
            onSelect={(product) => {
              // Display search result directly (already has fresh allergen check)
              setBarcode(product.barcode);
              setResult(product);
              setMode('result');
              setShowSearchModal(false);
              // Save to history
              addHistory(product.barcode, product);
            }}
          />
        )}
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
                  <span className="text-redstone-red italic underline decoration-theme-bg">
                    snack!
                  </span>
                </h2>
                <p className="text-lg text-theme-bg font-body font-bold p-4 bg-theme-text border-4 border-theme-border rounded-[2rem] shadow-voxel max-w-[95%] mx-auto">
                  Let&apos;s investigate if it&apos;s O.K to eat 🔍
                </p>
              </div>

              <div className="flex flex-col gap-4 w-full px-4">
                <button
                  onClick={() => setMode('scanning')}
                  className="group relative flex items-center justify-center gap-0 w-full bg-theme-accent border-4 border-theme-border p-6 rounded-[2.5rem] shadow-voxel active:shadow-none active:translate-x-[4px] active:translate-y-[4px] transition-all hover:-translate-y-[2px]"
                  aria-label="Start scanning"
                >
                  <Camera
                    className="w-20 h-20 group-hover:scale-110 transition-transform drop-shadow-[4px_4px_0px_rgba(0,0,0,0.8)]"
                    aria-hidden="true"
                  />
                </button>

                <button
                  onClick={() => setShowSearchModal(true)}
                  className={cn(
                    'w-full flex items-center justify-center gap-3 py-4 px-6 rounded-3xl border-4 border-theme-border font-display font-black text-lg transition-all',
                    isPremium
                      ? 'bg-theme-accent text-theme-border shadow-voxel hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]'
                      : 'bg-theme-bg text-theme-text/40 border-theme-text/20 cursor-not-allowed opacity-60',
                  )}
                  disabled={!isPremium}
                  aria-label={
                    isPremium ? 'Browse safe snacks' : 'Browse (Premium)'
                  }
                >
                  <span>🔍</span>
                  <span>Browse Safe Snacks</span>
                  {!isPremium && (
                    <span className="text-xs bg-theme-text/20 px-2 py-1 rounded-full">
                      Premium
                    </span>
                  )}
                </button>

                <div className="flex items-center gap-4">
                  <div className="h-2 flex-1 bg-theme-border/40 rounded-full border-4 border-theme-border" />
                  <span className="text-theme-text font-display font-black text-xl uppercase tracking-widest">
                    OR
                  </span>
                  <div className="h-2 flex-1 bg-theme-border/40 rounded-full border-4 border-theme-border" />
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
                <div className="absolute -inset-4 bg-theme-primary/20 rounded-[3rem] blur-2xl animate-pulse" />
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
                <div className="w-32 h-32 border-8 border-theme-primary/20 border-t-theme-bg rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <ShieldCheck
                    className="w-12 h-12 text-theme-bg"
                    aria-hidden="true"
                  />
                </div>
              </div>
              <p className="mt-8 text-4xl font-display font-bold text-theme-text animate-pulse">
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
                toggleSnack({
                  barcode,
                  name: result.name,
                  brand: result.brand,
                  icon: result.icon ?? '📦',
                  image_url: result.image_url,
                })
              }
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
              <div className="bg-redstone-red p-12 border-4 border-theme-border text-center shadow-voxel w-full">
                <AlertCircle
                  className="w-28 h-28 text-theme-text mb-8 mx-auto"
                  aria-hidden="true"
                />
                <h3 className="text-6xl font-display font-black text-theme-text uppercase tracking-tighter">
                  Oops!
                </h3>
                <p className="text-3xl text-theme-text font-body font-bold mt-6">
                  {error}
                </p>
              </div>
              <button
                onClick={reset}
                className="w-full bg-theme-bg border-4 border-theme-border text-theme-text py-12 rounded-[3rem] text-4xl font-display font-black shadow-voxel hover:translate-y-[-2px] transition-transform active:shadow-none active:translate-x-[4px] active:translate-y-[4px]"
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

      {isHistoryOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <HistoryView onClose={() => setIsHistoryOpen(false)} />
        </div>
      )}

      {showSafeFoods && activeProfile && (
        <SafeFoodsView
          profileId={activeProfile.id}
          onClose={() => setShowSafeFoods(false)}
        />
      )}

      {showHistoryGate && (
        <PremiumGate
          feature="Scan history"
          onClose={() => setShowHistoryGate(false)}
        />
      )}

      <ProfileSetupModal />

      <AdultModeModal
        isOpen={isAdultModalOpen}
        onClose={() => setIsAdultModalOpen(false)}
      />

      <motion.button
        onClick={() => setIsAdultModalOpen(true)}
        className={cn(
          'fixed bottom-24 right-6 w-16 h-16 z-40 rounded-full border-4 border-black shadow-voxel flex items-center justify-center active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all hover:-translate-y-[2px]',
          'bg-theme-primary text-theme-bg',
          'data-[theme=kitty]:bg-bow-red data-[theme=kitty]:text-white',
        )}
        aria-label="Adult settings"
      >
        {adultMode ? (
          <Check className="w-8 h-8" aria-hidden="true" />
        ) : (
          <UserRound className="w-8 h-8" aria-hidden="true" />
        )}
      </motion.button>

      {/* Disclaimer footer — always visible */}
      <footer className="fixed bottom-0 left-0 right-0 z-30 flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5 px-4 py-2 bg-theme-bg/95 backdrop-blur-sm border-t border-theme-border/10 text-center">
        <p className="text-xs font-body font-bold text-theme-text/70 leading-tight">
          Not medical advice · Data from Open Food Facts (may contain errors)
        </p>
        <a
          href="/privacy"
          className="text-xs font-black text-theme-text underline underline-offset-2 shrink-0"
        >
          Privacy Policy
        </a>
      </footer>
    </main>
  );
}
