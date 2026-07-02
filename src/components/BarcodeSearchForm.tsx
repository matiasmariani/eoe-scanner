import React from 'react';
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
      className="flex flex-col gap-4 w-full p-6 bg-theme-text border-4 border-theme-border rounded-2xl shadow-voxel"
    >
      <div className="relative flex-1">
        <label
          htmlFor="barcode-input"
          className="block text-sm font-body font-bold text-theme-bg mb-2 uppercase tracking-wide"
        >
          Barcode Number
        </label>
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
      <button
        type="submit"
        className="bg-theme-primary border-4 border-theme-border px-4 py-3 rounded-xl shadow-voxel active:shadow-none active:translate-y-[2px] transition-all flex items-center justify-center gap-2 font-display font-black text-theme-border hover:-translate-y-[2px]"
        aria-label="Search product"
      >
        <Search className="w-6 h-6" aria-hidden="true" />
        Search
      </button>
    </form>
  );
}
