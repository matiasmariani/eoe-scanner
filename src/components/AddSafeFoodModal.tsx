'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, Loader, Barcode, Camera, PenTool } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSafeFoods } from '@/hooks/useSafeFoods';
import { useIsPremium } from '@/lib/premium';
import {
  fetchProductFromOpenFoodFacts,
  type ProductResult,
} from '@/lib/open-food-facts';
import { useAllergySettings } from '@/contexts/AllergyContext';
import { Scanner } from '@/components/Scanner';
import { ScannerErrorBoundary } from '@/components/ScannerErrorBoundary';
import { PremiumGate } from '@/components/PremiumGate';

interface AddSafeFoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileId?: string;
}

type Mode = 'barcode' | 'scan' | 'manual';

export function AddSafeFoodModal({
  isOpen,
  onClose,
  profileId,
}: AddSafeFoodModalProps) {
  const { addSafeFood, error, setError } = useSafeFoods(profileId);
  const { activeProfile } = useAllergySettings();
  const isPremium = useIsPremium();
  const [mode, setMode] = useState<Mode>('barcode');
  const [barcode, setBarcode] = useState('');
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [scannedProduct, setScannedProduct] = useState<ProductResult | null>(
    null,
  );
  const [showPremiumGate, setShowPremiumGate] = useState(false);

  const resetForm = () => {
    setMode('barcode');
    setBarcode('');
    setName('');
    setBrand('');
    setNotes('');
    setScannedProduct(null);
    setError(null);
  };

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const handleScan = async (barcodeValue?: string) => {
    const codeToLookup = barcodeValue || barcode.trim();

    if (!codeToLookup) {
      setError('Enter a barcode');
      return;
    }

    setIsLoading(true);
    try {
      const product = await fetchProductFromOpenFoodFacts(
        codeToLookup,
        activeProfile?.allergies || [],
      );
      if (product.error) {
        setError(product.error);
        setScannedProduct(null);
      } else {
        setScannedProduct(product);
        setError(null);
        setBarcode('');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lookup failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveScanned = async () => {
    if (!scannedProduct?.name) return;
    await addSafeFood({
      name: scannedProduct.name,
      brand: scannedProduct.brand,
      notes: undefined,
      source: 'scanned',
    });
    if (!error) resetForm();
  };

  const handleSaveManual = async () => {
    if (!name.trim()) {
      setError('Food name required');
      return;
    }
    await addSafeFood({
      name: name.trim(),
      brand: brand.trim() || undefined,
      notes: notes.trim() || undefined,
      source: 'manual',
    });
    if (!error) resetForm();
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-theme-bg shadow-lg rounded-3xl w-full max-w-md p-6 space-y-4"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-display font-black text-theme-text">
            Add Safe Food
          </h2>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center bg-theme-primary text-theme-text rounded-full shadow-lg hover:shadow-[0_8px_16px_rgba(0,0,0,0.1)] transition-all"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Mode selector - all premium */}
        <div className="grid grid-cols-3 gap-2">
          <motion.button
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              if (!isPremium) {
                setShowPremiumGate(true);
                return;
              }
              setMode('barcode');
              setScannedProduct(null);
              setError(null);
            }}
            className={cn(
              'py-3 px-2 rounded-2xl font-display font-black text-sm transition-all flex flex-col items-center gap-1 shadow-lg',
              mode === 'barcode'
                ? 'bg-theme-primary text-theme-text'
                : 'bg-white text-theme-text/60 hover:text-theme-text hover:bg-theme-bg/50',
            )}
            title="Type or scan a barcode"
          >
            <Barcode className="w-5 h-5" aria-hidden="true" />
            <span className="text-xs">Barcode</span>
          </motion.button>
          <motion.button
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              if (!isPremium) {
                setShowPremiumGate(true);
                return;
              }
              setMode('scan');
              setScannedProduct(null);
              setError(null);
            }}
            className={cn(
              'py-3 px-2 rounded-2xl font-display font-black text-sm transition-all flex flex-col items-center gap-1 shadow-lg',
              mode === 'scan'
                ? 'bg-theme-primary text-theme-text'
                : 'bg-white text-theme-text/60 hover:text-theme-text hover:bg-theme-bg/50',
            )}
            title="Use camera to scan"
          >
            <Camera className="w-5 h-5" aria-hidden="true" />
            <span className="text-xs">Scan</span>
          </motion.button>
          <motion.button
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              if (!isPremium) {
                setShowPremiumGate(true);
                return;
              }
              setMode('manual');
              setScannedProduct(null);
              setError(null);
            }}
            className={cn(
              'py-3 px-2 rounded-2xl font-display font-black text-sm transition-all flex flex-col items-center gap-1 shadow-lg',
              mode === 'manual'
                ? 'bg-theme-primary text-theme-text'
                : 'bg-white text-theme-text/60 hover:text-theme-text hover:bg-theme-bg/50',
            )}
            title="Type food details"
          >
            <PenTool className="w-5 h-5" aria-hidden="true" />
            <span className="text-xs">Manual</span>
          </motion.button>
        </div>

        {error && (
          <div className="p-3 bg-redstone-red/10 border-2 border-redstone-red rounded-xl text-sm text-redstone-red font-bold">
            {error}
          </div>
        )}

        {/* Barcode Entry Mode */}
        {mode === 'barcode' && !scannedProduct && (
          <div className="space-y-3">
            <div>
              <label
                htmlFor="barcode-input"
                className="block text-sm font-body font-bold text-theme-text mb-2 uppercase tracking-wide"
              >
                Barcode Number
              </label>
              <input
                id="barcode-input"
                type="tel"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                onKeyDown={(e) =>
                  e.key === 'Enter' && !isPremium
                    ? setShowPremiumGate(true)
                    : handleScan()
                }
                placeholder="Enter barcode number"
                disabled={!isPremium}
                className={`w-full border-0 p-3 rounded-xl shadow-lg font-body font-bold focus:outline-none focus:ring-4 focus:ring-theme-accent ${
                  isPremium
                    ? 'bg-theme-bg text-theme-text placeholder:text-theme-text/40'
                    : 'bg-theme-bg/50 text-theme-text/50 placeholder:text-theme-text/20 cursor-not-allowed'
                }`}
                autoFocus
              />
            </div>
            <motion.button
              whileHover={
                !isLoading && isPremium && barcode.trim() ? { y: -2 } : {}
              }
              whileTap={
                !isLoading && isPremium && barcode.trim() ? { scale: 0.95 } : {}
              }
              onClick={() => {
                if (!isPremium) {
                  setShowPremiumGate(true);
                  return;
                }
                handleScan();
              }}
              disabled={isLoading || !barcode.trim() || !isPremium}
              className={`w-full py-3 rounded-2xl font-display font-black flex items-center justify-center gap-2 transition-all shadow-lg ${
                isPremium && !isLoading && barcode.trim()
                  ? 'bg-theme-primary text-theme-text hover:shadow-[0_12px_24px_rgba(0,0,0,0.15)]'
                  : isPremium
                    ? 'bg-theme-primary text-theme-text opacity-50 cursor-not-allowed'
                    : 'bg-theme-primary/50 text-theme-text/50 cursor-not-allowed opacity-50'
              }`}
            >
              {isLoading ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : (
                <Zap className="w-5 h-5" />
              )}
              {isLoading ? 'Looking up...' : 'Lookup'}
            </motion.button>
          </div>
        )}

        {/* Scan Mode - Camera */}
        {mode === 'scan' && !scannedProduct && (
          <div className="space-y-3">
            <ScannerErrorBoundary>
              <Scanner onScan={(code) => handleScan(code)} />
            </ScannerErrorBoundary>
          </div>
        )}

        {/* Scan Mode - Confirmation */}
        {mode === 'scan' && scannedProduct && (
          <div className="space-y-3">
            <div className="p-4 bg-theme-bg rounded-xl shadow-lg">
              <p className="font-bold text-theme-text text-lg">
                <strong>Name:</strong> {scannedProduct.name}
              </p>
              {scannedProduct.brand && (
                <p className="text-base text-theme-text/70 mt-2">
                  <strong>Brand:</strong> {scannedProduct.brand}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setScannedProduct(null)}
                className="flex-1 py-3 bg-theme-bg rounded-2xl font-display font-black text-theme-text shadow-lg"
              >
                Scan Again
              </motion.button>
              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSaveScanned}
                className="flex-1 py-3 bg-theme-primary rounded-2xl font-display font-black text-theme-text shadow-lg"
              >
                Save
              </motion.button>
            </div>
          </div>
        )}

        {mode === 'barcode' && scannedProduct && (
          <div className="space-y-3">
            <div className="p-4 bg-theme-bg rounded-xl shadow-lg">
              <p className="font-bold text-theme-text">
                <strong>Name:</strong> {scannedProduct.name}
              </p>
              {scannedProduct.brand && (
                <p className="text-sm text-theme-text/70 mt-1">
                  <strong>Brand:</strong> {scannedProduct.brand}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setScannedProduct(null)}
                className="flex-1 py-3 bg-theme-bg rounded-2xl font-display font-black text-theme-text shadow-lg"
              >
                ← Back
              </motion.button>
              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSaveScanned}
                className="flex-1 py-3 bg-theme-primary rounded-2xl font-display font-black text-theme-text shadow-lg"
              >
                Save
              </motion.button>
            </div>
          </div>
        )}

        {/* Manual Entry Mode */}
        {mode === 'manual' && (
          <div className="space-y-5">
            <div>
              <label
                htmlFor="manual-name"
                className="block text-sm font-body font-bold text-theme-text mb-2"
              >
                Food Name <span className="text-redstone-red">*</span>
              </label>
              <input
                id="manual-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Apple"
                className="w-full bg-white border-0 p-4 rounded-2xl font-body font-bold text-theme-text placeholder:text-theme-text/40 focus:outline-none focus:ring-4 focus:ring-theme-accent shadow-lg bg-white"
                autoFocus
              />
            </div>
            <div>
              <label
                htmlFor="manual-brand"
                className="block text-sm font-body font-bold text-theme-text mb-2"
              >
                Brand <span className="text-theme-text/40">(optional)</span>
              </label>
              <input
                id="manual-brand"
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="e.g., Granny Smith"
                className="w-full bg-white border-0 p-4 rounded-2xl font-body font-bold text-theme-text placeholder:text-theme-text/40 focus:outline-none focus:ring-4 focus:ring-theme-accent shadow-lg bg-white"
              />
            </div>
            <div>
              <label
                htmlFor="manual-notes"
                className="block text-sm font-body font-bold text-theme-text mb-2"
              >
                Notes <span className="text-theme-text/40">(optional)</span>
              </label>
              <textarea
                id="manual-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g., Always washed before eating"
                className="w-full bg-white border-2 border-theme-border p-4 rounded-2xl font-body font-bold text-theme-text placeholder:text-theme-text/40 focus:outline-none focus:ring-4 focus:ring-theme-accent resize-none shadow-lg"
                rows={3}
              />
            </div>
            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSaveManual}
              className="w-full py-4 bg-theme-primary rounded-2xl font-display font-black text-theme-text shadow-lg hover:shadow-[0_12px_24px_rgba(0,0,0,0.15)]"
            >
              Save Food
            </motion.button>
          </div>
        )}

        {showPremiumGate && (
          <PremiumGate
            feature="Add Safe Foods"
            onClose={() => setShowPremiumGate(false)}
          />
        )}
      </motion.div>
    </motion.div>
  );
}
