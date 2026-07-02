'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Backpack } from 'react-kawaii';
import { X, Trash2, CheckCircle2 } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { useSnackCollection, scoutRank } from '@/hooks/useSnackCollection';
import { useAllergySettings } from '@/contexts/AllergyContext';
import { CollectedSnack } from '@/lib/db';
import { SnackScout } from '@/components/SnackScout';
import { ConfirmationModal } from '@/components/ConfirmationModal';

interface SnackCollectionProps {
  onClose: () => void;
}

export function SnackCollection({ onClose }: SnackCollectionProps) {
  const { snacks, removeSnack } = useSnackCollection();
  const { adultMode } = useAllergySettings();
  const { theme } = useTheme();

  const backpackColor = theme === 'kitty' ? '#ff69b4' : '#79d461'; // Pink for girl, green for boy
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
    <div className="min-h-screen bg-gradient-to-br from-theme-bg via-theme-bg to-theme-bg/95 flex flex-col">
      <header className="w-full max-w-md mx-auto px-6 py-8 flex items-center justify-between gap-4">
        <SnackScout size="sm" />
        <button
          onClick={onClose}
          className="p-3 bg-theme-text rounded-full shadow-lg text-theme-primary hover:bg-theme-primary hover:text-theme-text transition-all active:scale-90"
          aria-label="Close collection"
        >
          <X className="w-6 h-6" aria-hidden="true" />
        </button>
      </header>

      <div className="flex-1 w-full max-w-md mx-auto px-4 pb-16">
        <div className="text-center mb-6">
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="mb-4 flex justify-center"
          >
            <Backpack size={80} mood="happy" color={backpackColor} />
          </motion.div>
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
            <div className="text-6xl mb-4 flex justify-center gap-2">
              <motion.span
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                role="img"
                aria-label="Shelf"
              >
                🗃️
              </motion.span>
              <motion.span
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.2 }}
                role="img"
                aria-label="Package"
              >
                📦
              </motion.span>
              <motion.span
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.4 }}
                role="img"
                aria-label="Sparkles"
              >
                ✨
              </motion.span>
            </div>
            <h3 className="text-2xl font-display font-black text-theme-text mb-2">
              No snacks yet
            </h3>
            <p className="text-lg text-theme-text/60 font-bold px-6">
              Scan a snack — if it&apos;s safe, tap{' '}
              <span className="text-theme-primary">Add to Safe</span> to start
              your collection!
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
                  whileHover={{ y: -4 }}
                  className="bg-theme-primary rounded-3xl shadow-lg hover:shadow-[0_16px_32px_rgba(0,0,0,0.15)] p-4 flex flex-col items-center text-center relative transition-shadow"
                >
                  {adultMode && (
                    <button
                      onClick={() => handleRemoveClick(snack)}
                      className="absolute -top-3 -right-3 bg-theme-bg text-redstone-red w-9 h-9 rounded-full flex items-center justify-center border-2 border-redstone-red shadow-lg hover:scale-110 transition-transform"
                      aria-label={`Remove ${snack.name} from collection`}
                    >
                      <Trash2 className="w-4 h-4" aria-hidden="true" />
                    </button>
                  )}

                  {snack.image_url ? (
                    <Image
                      src={snack.image_url}
                      alt={snack.name}
                      width={80}
                      height={80}
                      className="w-20 h-20 object-cover rounded-2xl mb-2 shadow-lg"
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
                  <h3 className="text-base font-display font-black text-theme-text leading-tight line-clamp-2">
                    {snack.name}
                  </h3>
                  <p className="text-sm font-bold text-theme-text/60 truncate w-full mt-0.5">
                    {snack.brand}
                  </p>
                  <div className="flex items-center justify-center gap-1 text-theme-primary text-sm font-black uppercase mt-2 bg-theme-primary/10 px-3 py-1 rounded-full border-2 border-theme-primary/30">
                    <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
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
