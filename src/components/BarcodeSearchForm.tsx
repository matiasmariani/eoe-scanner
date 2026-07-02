import React from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';

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
    // Validation + error surfacing lives in the parent (handleManualSubmit).
    await onSearch(barcode);
  };

  return (
    <form
      onSubmit={handleFormSubmit}
      className="flex flex-col gap-3 w-full p-6 bg-white rounded-3xl shadow-lg"
    >
      <div className="relative flex-1">
        <label
          htmlFor="barcode-input"
          className="block text-sm font-body font-black text-theme-text mb-1 uppercase tracking-wide"
        >
          Type a Barcode
        </label>
        <p className="text-xs text-theme-text/60 mb-3 font-body font-bold">
          Enter any product barcode number
        </p>
        <input
          id="barcode-input"
          type="text"
          pattern="[0-9]*"
          inputMode="numeric"
          placeholder="e.g. 0123456789012"
          value={barcode}
          onChange={(e) => setBarcode(e.target.value)}
          className="w-full p-4 border-0 text-center text-base font-body font-bold focus:outline-none focus:ring-4 focus:ring-theme-accent bg-theme-bg text-theme-text rounded-2xl shadow-lg placeholder:text-theme-text/40"
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
        className="bg-theme-primary text-theme-text px-4 py-4 rounded-2xl shadow-lg hover:shadow-[0_12px_24px_rgba(0,0,0,0.15)] transition-all flex items-center justify-center gap-2 font-display font-black"
        aria-label="Search product by barcode"
      >
        <Search className="w-6 h-6" aria-hidden="true" />
        Check It!
      </motion.button>
    </form>
  );
}
