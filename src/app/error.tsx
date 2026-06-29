'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, RefreshCcw } from 'lucide-react';
import { logError } from '@/lib/errorHandling';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logError('AppError', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-deep-stone text-block-white flex items-center justify-center p-4 app-container">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <div className="bg-block-white border-4 border-ink-navy p-10 text-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-[3rem]">
          <div className="mb-6 inline-flex items-center justify-center w-24 h-24 bg-redstone-red/10 rounded-full">
            <AlertCircle
              className="w-12 h-12 text-redstone-red"
              aria-hidden="true"
            />
          </div>

          <h2 className="text-4xl font-display font-black text-ink-navy mb-2 uppercase tracking-tighter">
            Oops! Something broke
          </h2>

          <p className="text-xl text-gray-600 font-body font-bold mb-6">
            Ask a grown-up for help, or try again.
          </p>

          <button
            onClick={reset}
            className="inline-flex items-center gap-3 bg-grass-green border-4 border-ink-navy text-block-white px-8 py-4 rounded-full text-xl font-display font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] hover:-translate-y-[2px] transition-all"
          >
            <RefreshCcw className="w-6 h-6" aria-hidden="true" />
            Try Again
          </button>
        </div>
      </motion.div>
    </div>
  );
}
