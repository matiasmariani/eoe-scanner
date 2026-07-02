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
  Search,
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

      <header className="w-full px-6 py-4 flex items-center justify-between border-b border-theme-border/20">
        <ThemeSelector />
        <div className="flex items-center gap-3">
          <button
            onClick={reset}
            className="p-2.5 bg-theme-primary text-theme-text hover:bg-theme-primary/90 rounded-full transition-all shadow-lg"
            aria-label="Reset scanner"
            title="Reset"
          >
            <RefreshCcw className="w-5 h-5" aria-hidden="true" />
          </button>
          <button
            onClick={() => setIsAdultModalOpen(true)}
            className="p-2.5 bg-theme-primary text-theme-text hover:bg-theme-primary/90 rounded-full transition-all shadow-lg"
            aria-label="Adult settings"
            title="Adult Mode"
          >
            <UserRound className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>
      </header>

      {mode !== 'idle' && <SelectedAllergiesHeader />}

      <div
        id="main-content"
        className="w-full space-y-8 flex flex-col items-center"
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
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full flex flex-col items-center"
            >
              {/* Hero Section with Large Buddy */}
              <div className="w-full flex flex-col items-center justify-center mb-8">
                <SnackScout size="lg" />
                <h2 className="text-4xl font-display font-black text-theme-text mt-4 leading-tight max-w-xs text-center">
                  {activeProfile?.name ? (
                    <>
                      <span className="text-theme-primary">
                        {activeProfile.name}
                      </span>
                      <span>&apos;s</span>
                    </>
                  ) : (
                    'Your'
                  )}{' '}
                  snack explorer
                </h2>
              </div>

              {/* Action Buttons - Floating */}
              <div className="w-full px-4 flex flex-col gap-3 mb-8">
                <button
                  onClick={() => setMode('scanning')}
                  className="group w-full bg-theme-accent hover:bg-theme-accent/90 text-white border-0 py-5 px-6 rounded-3xl font-display font-black text-lg transition-all shadow-lg hover:shadow-xl active:scale-95"
                  aria-label="Start scanning"
                >
                  <Camera className="w-6 h-6 inline mr-2" aria-hidden="true" />
                  Scan Snack
                </button>

                <button
                  onClick={() => setShowSearchModal(true)}
                  className="w-full bg-theme-primary hover:bg-theme-primary/90 text-theme-text border-0 py-5 px-6 rounded-3xl font-display font-black text-lg transition-all shadow-lg hover:shadow-xl active:scale-95"
                  aria-label="Browse safe snacks"
                >
                  <Search className="w-6 h-6 inline mr-2" aria-hidden="true" />
                  Browse
                </button>
              </div>

              {/* Category Cards Grid */}
              <div className="w-full px-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  {/* Safe Foods Card */}
                  <button
                    onClick={() => setShowSafeFoods(true)}
                    className="bg-theme-primary text-theme-text p-6 rounded-3xl shadow-lg hover:shadow-xl transition-all active:scale-95 flex flex-col items-center gap-3"
                  >
                    <ShieldCheck className="w-12 h-12" aria-hidden="true" />
                    <span className="font-display font-black text-center text-sm">
                      Safe Foods
                    </span>
                  </button>

                  {/* Collection Card */}
                  <button
                    onClick={() => setIsCollectionOpen(true)}
                    className="bg-theme-accent text-white p-6 rounded-3xl shadow-lg hover:shadow-xl transition-all active:scale-95 flex flex-col items-center gap-3"
                  >
                    <Album className="w-12 h-12" aria-hidden="true" />
                    <span className="font-display font-black text-center text-sm">
                      Collection
                    </span>
                  </button>

                  {/* Allergy Settings Card */}
                  <button
                    onClick={() => setIsSettingsOpen(true)}
                    className="bg-redstone-red text-white p-6 rounded-3xl shadow-lg hover:shadow-xl transition-all active:scale-95 flex flex-col items-center gap-3"
                  >
                    <BookOpen className="w-12 h-12" aria-hidden="true" />
                    <span className="font-display font-black text-center text-sm">
                      Allergies
                    </span>
                  </button>

                  {/* History Card */}
                  <button
                    onClick={() => {
                      if (!isPremium) {
                        setShowHistoryGate(true);
                        return;
                      }
                      setIsHistoryOpen(true);
                    }}
                    disabled={!history || history.length === 0}
                    className={`p-6 rounded-3xl shadow-lg hover:shadow-xl transition-all active:scale-95 flex flex-col items-center gap-3 ${!history || history.length === 0 ? 'bg-theme-bg/60 text-theme-text/40 cursor-not-allowed' : 'bg-theme-primary text-theme-text hover:bg-theme-primary/90'}`}
                  >
                    <History className="w-12 h-12" aria-hidden="true" />
                    <span className="font-display font-black text-center text-sm">
                      History
                    </span>
                  </button>
                </div>
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
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="relative mb-6"
              >
                <div className="w-32 h-32 bg-gradient-to-br from-theme-primary/20 to-theme-accent/10 border-4 border-theme-primary rounded-full" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <ShieldCheck
                    className="w-14 h-14 text-theme-primary"
                    aria-hidden="true"
                  />
                </div>
              </motion.div>
              <motion.p
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-2xl font-display font-bold text-theme-text"
              >
                Investigating...
              </motion.p>
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
              className="w-full max-w-md space-y-6 flex flex-col items-center"
              role="alert"
            >
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="bg-gradient-to-br from-redstone-red/15 to-redstone-red/5 p-8 border-4 border-redstone-red/40 text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] w-full rounded-3xl"
              >
                <AlertCircle
                  className="w-20 h-20 text-redstone-red mb-4 mx-auto"
                  aria-hidden="true"
                />
                <h3 className="text-4xl font-display font-black text-redstone-red uppercase tracking-tight">
                  Not Found
                </h3>
                <p className="text-base text-redstone-red/80 font-body font-bold mt-3">
                  {error}
                </p>
              </motion.div>
              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={reset}
                className="w-full bg-gradient-to-br from-theme-bg to-theme-bg/90 border-4 border-theme-border text-theme-text py-4 rounded-2xl text-xl font-display font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.2)]"
                aria-label="Try again"
              >
                Try Another Scan
              </motion.button>
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
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <SafeFoodsView
            profileId={activeProfile.id}
            onClose={() => setShowSafeFoods(false)}
          />
        </div>
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

      {/* Disclaimer footer — always visible */}
      <footer className="fixed bottom-0 left-0 right-0 z-30 flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5 px-4 py-3 bg-theme-bg/95 backdrop-blur-sm border-t border-theme-border/10 text-center">
        <p className="text-sm font-body font-bold text-theme-text/80 leading-tight">
          Not medical advice · Data from Open Food Facts (may contain errors)
        </p>
        <a
          href="/privacy"
          className="text-sm font-black text-theme-primary underline underline-offset-2 shrink-0 hover:opacity-80 transition-opacity"
        >
          Privacy Policy
        </a>
      </footer>
    </main>
  );
}
