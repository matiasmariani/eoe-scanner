'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, CheckCircle2 } from 'lucide-react';
import {
  useSnackCollection,
  scoutRank,
  CollectedSnack,
} from '@/hooks/useSnackCollection';
import { SnackScout } from '@/components/SnackScout';

interface SnackCollectionProps {
  onClose: () => void;
}

// A spread of treat stickers; chosen deterministically per snack so each card
// keeps the same sticker across renders without needing stored state.
const STICKERS = [
  '🍪',
  '🍫',
  '🍬',
  '🍭',
  '🧃',
  '🍿',
  '🍎',
  '🥨',
  '🧀',
  '🍩',
  '🍓',
  '🍌',
];

function stickerFor(snack: CollectedSnack): string {
  const seed = (snack.barcode || snack.name)
    .split('')
    .reduce((sum, c) => sum + c.charCodeAt(0), 0);
  return STICKERS[seed % STICKERS.length] ?? '🍪';
}

export function SnackCollection({ onClose }: SnackCollectionProps) {
  const { snacks, removeSnack } = useSnackCollection();

  return (
    <div className="min-h-screen bg-deep-stone flex flex-col">
      <header className="w-full max-w-md mx-auto px-6 py-8 flex items-center justify-between gap-4">
        <SnackScout size="sm" />
        <button
          onClick={onClose}
          className="p-3 bg-block-white rounded-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-4 border-grass-green text-grass-green hover:bg-grass-green hover:text-white transition-all active:scale-90"
          aria-label="Close collection"
        >
          <X className="w-6 h-6" aria-hidden="true" />
        </button>
      </header>

      <div className="flex-1 w-full max-w-md mx-auto px-4 pb-16">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-display font-black text-block-white">
            My Safe Snacks
          </h2>
          <p className="text-lg font-bold text-grass-green mt-1">
            {snacks.length > 0
              ? `${snacks.length} collected · ${scoutRank(snacks.length)} 🎖️`
              : 'Start your collection!'}
          </p>
        </div>

        {snacks.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[360px] text-center">
            <span className="text-7xl mb-6" role="img" aria-label="Empty shelf">
              🗃️
            </span>
            <h3 className="text-2xl font-display font-black text-block-white mb-2">
              No snacks yet
            </h3>
            <p className="text-lg text-gray-300 font-bold px-6">
              Scan a snack — if it&apos;s safe, tap{' '}
              <span className="text-grass-green">Collect</span> to add a sticker
              here!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <AnimatePresence mode="popLayout">
              {snacks.map((snack) => (
                <motion.div
                  key={snack.barcode || snack.name}
                  layout
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.7, opacity: 0 }}
                  className="bg-block-white rounded-[2rem] border-4 border-ink-navy shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-4 flex flex-col items-center text-center relative"
                >
                  <button
                    onClick={() => removeSnack(snack.barcode)}
                    className="absolute -top-3 -right-3 bg-block-white text-redstone-red w-9 h-9 rounded-full flex items-center justify-center border-2 border-redstone-red shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:scale-110 transition-transform"
                    aria-label={`Remove ${snack.name} from collection`}
                  >
                    <Trash2 className="w-4 h-4" aria-hidden="true" />
                  </button>

                  <span className="text-5xl mb-2" role="img" aria-hidden="true">
                    {stickerFor(snack)}
                  </span>
                  <h3 className="text-base font-display font-black text-ink-navy leading-tight line-clamp-2">
                    {snack.name}
                  </h3>
                  <p className="text-xs font-bold text-gray-500 truncate w-full mt-0.5">
                    {snack.brand}
                  </p>
                  <div className="flex items-center gap-1 text-grass-green text-xs font-black uppercase mt-2">
                    <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                    Safe
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
