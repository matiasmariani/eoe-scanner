'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, Loader } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSafeFoods } from '@/hooks/useSafeFoods';
import {
  fetchProductFromOpenFoodFacts,
  type ProductResult,
} from '@/lib/open-food-facts';
import { useAllergySettings } from '@/contexts/AllergyContext';
import { Scanner } from '@/components/Scanner';
import { ScannerErrorBoundary } from '@/components/ScannerErrorBoundary';

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
  const [mode, setMode] = useState<Mode>('barcode');
  const [barcode, setBarcode] = useState('');
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [scannedProduct, setScannedProduct] = useState<ProductResult | null>(
    null,
  );

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
        className="bg-theme-text border-4 border-theme-border shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-3xl w-full max-w-md p-6 space-y-4"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-display font-black text-theme-bg">
            Add Safe Food
          </h2>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center bg-theme-bg text-theme-text rounded-full"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Mode selector - always visible */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => {
              setMode('barcode');
              setScannedProduct(null);
              setError(null);
            }}
            className={cn(
              'py-3 rounded-2xl border-4 border-theme-border font-display font-black text-sm transition-all',
              mode === 'barcode'
                ? 'bg-theme-primary text-theme-border shadow-voxel'
                : 'bg-theme-bg text-theme-text/60 hover:text-theme-text',
            )}
          >
            Barcode
          </button>
          <button
            onClick={() => {
              setMode('scan');
              setScannedProduct(null);
              setError(null);
            }}
            className={cn(
              'py-3 rounded-2xl border-4 border-theme-border font-display font-black text-sm transition-all',
              mode === 'scan'
                ? 'bg-theme-primary text-theme-border shadow-voxel'
                : 'bg-theme-bg text-theme-text/60 hover:text-theme-text',
            )}
          >
            📷 Scan
          </button>
          <button
            onClick={() => {
              setMode('manual');
              setScannedProduct(null);
              setError(null);
            }}
            className={cn(
              'py-3 rounded-2xl border-4 border-theme-border font-display font-black text-sm transition-all',
              mode === 'manual'
                ? 'bg-theme-primary text-theme-border shadow-voxel'
                : 'bg-theme-bg text-theme-text/60 hover:text-theme-text',
            )}
          >
            ✏️ Manual
          </button>
        </div>

        {error && (
          <div className="p-3 bg-redstone-red/10 border-2 border-redstone-red rounded-xl text-sm text-redstone-red font-bold">
            {error}
          </div>
        )}

        {/* Barcode Entry Mode */}
        {mode === 'barcode' && !scannedProduct && (
          <div className="space-y-3">
            <input
              type="tel"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleScan()}
              placeholder="Enter barcode number"
              className="w-full bg-theme-bg border-2 border-theme-border p-3 rounded-xl font-body font-bold text-theme-text placeholder:text-theme-text/40 focus:outline-none focus:ring-4 focus:ring-theme-accent"
              autoFocus
            />
            <button
              onClick={() => handleScan()}
              disabled={isLoading || !barcode.trim()}
              className="w-full py-3 bg-theme-primary border-4 border-theme-border rounded-2xl font-display font-black text-theme-border disabled:opacity-50 flex items-center justify-center gap-2 active:shadow-none active:translate-y-[2px] shadow-voxel"
            >
              {isLoading ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : (
                <Zap className="w-5 h-5" />
              )}
              {isLoading ? 'Looking up...' : 'Lookup Product'}
            </button>
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
            <div className="p-4 bg-theme-bg border-2 border-theme-border rounded-xl">
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
              <button
                onClick={() => setScannedProduct(null)}
                className="flex-1 py-3 bg-theme-bg border-4 border-theme-border rounded-2xl font-display font-black text-theme-text active:shadow-none active:translate-y-[2px]"
              >
                Scan Again
              </button>
              <button
                onClick={handleSaveScanned}
                className="flex-1 py-3 bg-theme-primary border-4 border-theme-border rounded-2xl font-display font-black text-theme-border shadow-voxel active:shadow-none active:translate-y-[2px]"
              >
                Save
              </button>
            </div>
          </div>
        )}

        {mode === 'barcode' && scannedProduct && (
          <div className="space-y-3">
            <div className="p-4 bg-theme-bg border-2 border-theme-border rounded-xl">
              <p className="font-bold text-theme-text">
                <strong>Name:</strong> {scannedProduct.name}
              </p>
              {scannedProduct.brand && (
                <p className="text-sm text-theme-text/70">
                  <strong>Brand:</strong> {scannedProduct.brand}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setScannedProduct(null)}
                className="flex-1 py-3 bg-theme-bg border-4 border-theme-border rounded-2xl font-display font-black text-theme-text active:shadow-none active:translate-y-[2px]"
              >
                Back
              </button>
              <button
                onClick={handleSaveScanned}
                className="flex-1 py-3 bg-theme-primary border-4 border-theme-border rounded-2xl font-display font-black text-theme-border shadow-voxel active:shadow-none active:translate-y-[2px]"
              >
                Save
              </button>
            </div>
          </div>
        )}

        {/* Manual Entry Mode */}
        {mode === 'manual' && (
          <div className="space-y-4">
            <div>
              <label
                htmlFor="manual-name"
                className="block text-sm font-body font-bold text-theme-bg mb-2"
              >
                Food Name *
              </label>
              <input
                id="manual-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Apple"
                className="w-full bg-theme-bg border-2 border-theme-border p-4 rounded-2xl font-body font-bold text-theme-text placeholder:text-theme-text/40 focus:outline-none focus:ring-4 focus:ring-theme-accent"
                autoFocus
              />
            </div>
            <div>
              <label
                htmlFor="manual-brand"
                className="block text-sm font-body font-bold text-theme-bg mb-2"
              >
                Brand (optional)
              </label>
              <input
                id="manual-brand"
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="e.g., Granny Smith"
                className="w-full bg-theme-bg border-2 border-theme-border p-4 rounded-2xl font-body font-bold text-theme-text placeholder:text-theme-text/40 focus:outline-none focus:ring-4 focus:ring-theme-accent"
              />
            </div>
            <div>
              <label
                htmlFor="manual-notes"
                className="block text-sm font-body font-bold text-theme-bg mb-2"
              >
                Notes (optional)
              </label>
              <textarea
                id="manual-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g., Always washed before eating"
                className="w-full bg-theme-bg border-2 border-theme-border p-4 rounded-2xl font-body font-bold text-theme-text placeholder:text-theme-text/40 focus:outline-none focus:ring-4 focus:ring-theme-accent resize-none"
                rows={3}
              />
            </div>
            <button
              onClick={handleSaveManual}
              className="w-full py-4 bg-theme-primary border-4 border-theme-border rounded-2xl font-display font-black text-theme-border shadow-voxel active:shadow-none active:translate-y-[2px]"
            >
              Save Food
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
