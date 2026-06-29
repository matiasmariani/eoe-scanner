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
      className="flex flex-col gap-6 w-full p-10 bg-block-white border-4 border-ink-navy rounded-[3rem] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
    >
      <div className="relative flex-1">
        <input
          type="text"
          pattern="[0-9]*"
          inputMode="numeric"
          placeholder="Enter barcode..."
          value={barcode}
          onChange={(e) => setBarcode(e.target.value)}
          className="w-full p-8 border-4 border-ink-navy text-center text-xl font-data font-bold focus:ring-4 focus:ring-grass-green outline-none bg-deep-stone text-block-white shadow-inner rounded-3xl"
          aria-label="Barcode input"
        />
        {error && errorType === 'barcode' && (
          <p
            id="barcode-error"
            className="text-lg text-redstone-red mt-4 font-body font-bold"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
      <button
        type="submit"
        className="bg-grass-green border-4 border-ink-navy p-8 rounded-[3rem] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[4px] active:translate-y-[4px] hover:-translate-y-[2px] transition-all flex items-center justify-center"
        aria-label="Search product"
      >
        <Search className="w-14 h-14 text-block-white" aria-hidden="true" />
      </button>
    </form>
  );
}
