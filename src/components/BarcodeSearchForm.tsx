import React from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { validateBarcode } from '@/lib/errorHandling';

interface BarcodeSearchFormProps {
  barcode: string;
  setBarcode: (val: string) => void;
  onSearch: (code: string) => Promise<void>;
  error: string;
  errorType?: 'barcode' | 'general';
}

export function BarcodeSearchForm({
  barcode,
  setBarcode,
  onSearch,
  error,
  errorType = 'general',
}: BarcodeSearchFormProps) {
  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!barcode) return;
    const validation = validateBarcode(barcode);
    if (!validation.valid) {
      // This error will be handled by the parent via the error prop
      return;
    }
    await onSearch(barcode);
  };

  return (
    <form
      onSubmit={handleFormSubmit}
      className="flex flex-col gap-4 w-full p-6 bg-gradient-to-br from-theme-text to-theme-text/95 border-4 border-theme-border rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
    >
      <div className="relative flex-1">
        <label
          htmlFor="barcode-input"
          className="block text-sm font-body font-bold text-theme-bg mb-1 uppercase tracking-wide"
        >
          Barcode Number
        </label>
        <p className="text-xs text-theme-bg/70 mb-2 font-body">
          Type or scan any product barcode
        </p>
        <input
          id="barcode-input"
          type="text"
          pattern="[0-9]*"
          inputMode="numeric"
          placeholder="Enter barcode..."
          value={barcode}
          onChange={(e) => setBarcode(e.target.value)}
          className="w-full p-4 border-4 border-theme-border text-center text-base font-body font-bold focus:outline-none focus:ring-4 focus:ring-theme-accent bg-theme-bg text-theme-text rounded-xl"
          aria-describedby={
            error && errorType === 'barcode' ? 'barcode-error' : undefined
          }
        />
        {error && errorType === 'barcode' && (
          <p
            id="barcode-error"
            className="text-sm text-redstone-red mt-2 font-body font-bold"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
      <motion.button
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.95 }}
        type="submit"
        className="bg-gradient-to-br from-theme-primary to-theme-primary/80 border-4 border-theme-border px-4 py-3 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center justify-center gap-2 font-display font-black text-theme-border"
        aria-label="Search product"
      >
        <Search className="w-6 h-6" aria-hidden="true" />
        Search
      </motion.button>
    </form>
  );
}
