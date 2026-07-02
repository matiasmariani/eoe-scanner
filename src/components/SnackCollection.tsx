'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, CheckCircle2 } from 'lucide-react';
import { useSnackCollection, scoutRank } from '@/hooks/useSnackCollection';
import { CollectedSnack } from '@/lib/db';
import { SnackScout } from '@/components/SnackScout';
import { ConfirmationModal } from '@/components/ConfirmationModal';

interface SnackCollectionProps {
  onClose: () => void;
}

export function SnackCollection({ onClose }: SnackCollectionProps) {
  const { snacks, removeSnack } = useSnackCollection();
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    snack?: CollectedSnack;
  }>({ isOpen: false });

  const handleRemoveClick = (snack: CollectedSnack) => {
    setModalConfig({ isOpen: true, snack });
  };

  const handleConfirmRemove = () => {
    if (modalConfig.snack?.barcode) {
      removeSnack(modalConfig.snack.barcode);
    }
    setModalConfig({ isOpen: false });
  };

  const handleCloseModal = () => {
    setModalConfig({ isOpen: false });
  };

  return (
    <div className="min-h-screen bg-theme-bg flex flex-col">
      <header className="w-full max-w-md mx-auto px-6 py-8 flex items-center justify-between gap-4">
        <SnackScout size="sm" />
        <button
          onClick={onClose}
          className="p-3 bg-theme-text rounded-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-4 border-theme-primary text-theme-primary hover:bg-theme-primary hover:text-theme-text transition-all active:scale-90"
          aria-label="Close collection"
        >
          <X className="w-6 h-6" aria-hidden="true" />
        </button>
      </header>

      <div className="flex-1 w-full max-w-md mx-auto px-4 pb-16">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-display font-black text-theme-text">
            My Safe Snacks
          </h2>
          <p className="text-lg font-bold text-theme-primary mt-1">
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
            <h3 className="text-2xl font-display font-black text-theme-text mb-2">
              No snacks yet
            </h3>
            <p className="text-lg text-theme-text/60 font-bold px-6">
              Scan a snack — if it&apos;s safe, tap{' '}
              <span className="text-theme-primary">Collect</span> to add a
              sticker here!
            </p>
          </div>
        ) : (
          <ul className="grid grid-cols-2 gap-4" role="list">
            <AnimatePresence mode="popLayout">
              {snacks.map((snack) => (
                <motion.li
                  key={snack.barcode || snack.name}
                  layout
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.7, opacity: 0 }}
                  className="bg-theme-text rounded-[2rem] border-4 border-theme-border shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-4 flex flex-col items-center text-center relative"
                >
                  <button
                    onClick={() => handleRemoveClick(snack)}
                    className="absolute -top-3 -right-3 bg-theme-bg text-redstone-red w-9 h-9 rounded-full flex items-center justify-center border-2 border-redstone-red shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:scale-110 transition-transform"
                    aria-label={`Remove ${snack.name} from collection`}
                  >
                    <Trash2 className="w-4 h-4" aria-hidden="true" />
                  </button>

                  {snack.image_url ? (
                    <Image
                      src={snack.image_url}
                      alt={snack.name}
                      width={80}
                      height={80}
                      className="w-20 h-20 object-cover rounded-2xl border-2 border-theme-border mb-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                    />
                  ) : (
                    <span
                      className="text-5xl mb-2"
                      role="img"
                      aria-label={`${snack.name} icon`}
                    >
                      {snack.icon || '🍪'}
                    </span>
                  )}
                  <h3 className="text-base font-display font-black text-theme-bg leading-tight line-clamp-2">
                    {snack.name}
                  </h3>
                  <p className="text-sm font-bold text-theme-bg/60 truncate w-full mt-0.5">
                    {snack.brand}
                  </p>
                  <div className="flex items-center gap-1 text-theme-primary text-sm font-black uppercase mt-2">
                    <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                    Safe
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>
      <ConfirmationModal
        isOpen={modalConfig.isOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmRemove}
        title="Remove Snack?"
        message={`Are you sure you want to remove ${modalConfig.snack?.name || 'this snack'} from your collection?`}
      />
    </div>
  );
}
