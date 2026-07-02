'use client';

import React from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { File } from 'react-kawaii';
import {
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  ListFilter,
  Check,
  AlertTriangle,
} from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { useHistory } from '@/hooks/useHistory';
import { useAllergySettings } from '@/contexts/AllergyContext';
import { SnackScout } from '@/components/SnackScout';
import { ConfirmationModal } from '@/components/ConfirmationModal';
import { ProductDetailModal } from '@/components/ProductDetailModal';
import { getAllergenDisplay } from '@/lib/allergen-utils';
import { type ProductResult } from '@/lib/open-food-facts';
import { cn } from '@/lib/utils';

export function HistoryView({ onClose }: { onClose: () => void }) {
  const { history, removeHistory } = useHistory();
  const { adultMode } = useAllergySettings();
  const { theme } = useTheme();
  const [filter, setFilter] = React.useState<'all' | 'good' | 'bad'>('all');

  const fileColor = theme === 'kitty' ? '#ff69b4' : '#79d461';
  const [modalConfig, setModalConfig] = React.useState<{
    isOpen: boolean;
    item?: { barcode: string; name: string };
  }>({ isOpen: false });
  const [detailProduct, setDetailProduct] =
    React.useState<ProductResult | null>(null);

  const handleRemoveClick = (item: { barcode: string; name: string }) => {
    setModalConfig({ isOpen: true, item });
  };

  const handleConfirmRemove = () => {
    if (modalConfig.item?.barcode) {
      removeHistory(modalConfig.item.barcode);
    }
    setModalConfig({ isOpen: false });
  };

  const handleCloseModal = () => {
    setModalConfig({ isOpen: false });
  };

  if (history === undefined) {
    return (
      <div
        className="flex items-center justify-center p-12"
        role="status"
        aria-live="polite"
      >
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-theme-primary"></div>
        <span className="sr-only">Loading history...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-theme-bg via-theme-bg to-theme-bg/95 flex flex-col">
      <header className="w-full max-w-md mx-auto px-6 py-8 flex items-center justify-between gap-4">
        <SnackScout size="sm" />
        <button
          onClick={onClose}
          className="p-3 bg-theme-text rounded-full shadow-lg text-theme-primary hover:bg-theme-primary hover:text-theme-text transition-all active:scale-90"
          aria-label="Close history"
        >
          <X className="w-6 h-6" aria-hidden="true" />
        </button>
      </header>

      <div className="flex-1 w-full max-w-md mx-auto px-4 pb-16">
        <div className="text-center mb-6">
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 2.5, repeat: Infinity }}
            className="mb-4 flex justify-center"
          >
            <File size={80} mood="happy" color={fileColor} />
          </motion.div>
          <h2 className="text-3xl font-display font-black text-theme-text">
            History
          </h2>
          <p className="text-lg font-bold text-theme-primary mt-1">
            Your scanning journey
          </p>
        </div>

        <div className="flex justify-center gap-3 mb-6">
          {(['all', 'good', 'bad'] as const).map((f) => {
            const Icon =
              f === 'good' ? Check : f === 'bad' ? AlertTriangle : ListFilter;
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                aria-pressed={filter === f}
                className={`px-5 py-3 rounded-2xl font-display font-black uppercase text-sm transition-all flex items-center gap-2 shadow-lg ${
                  filter === f
                    ? 'bg-theme-accent text-white'
                    : 'bg-white text-theme-text hover:bg-theme-bg/50'
                }`}
                title={
                  f === 'good'
                    ? 'Show safe foods'
                    : f === 'bad'
                      ? 'Show unsafe foods'
                      : 'Show all scans'
                }
              >
                <Icon className="w-5 h-5" aria-hidden="true" />
                <span className="hidden sm:inline">{f}</span>
              </button>
            );
          })}
        </div>

        <ul className="space-y-5">
          <AnimatePresence mode="popLayout">
            {history
              .filter((item) => {
                if (filter === 'good') return item.result.isSafe;
                if (filter === 'bad') return !item.result.isSafe;
                return true;
              })
              .map((item) => (
                <motion.li
                  key={item.barcode}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="relative"
                >
                  <div
                    onClick={() => setDetailProduct(item.result)}
                    className={cn(
                      'w-full bg-theme-primary shadow-lg p-4 flex items-center gap-4 rounded-2xl text-left transition-all active:scale-95 cursor-pointer',
                      item.result.isSafe ? '' : 'ring-2 ring-redstone-red/30',
                    )}
                  >
                    <div
                      className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl shrink-0 overflow-hidden bg-white shadow-lg"
                      aria-hidden="true"
                    >
                      {item.result.image_url ? (
                        <Image
                          src={item.result.image_url}
                          alt={item.result.name}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        item.result.icon || '📦'
                      )}
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col gap-1">
                      <h3 className="font-black text-xl text-theme-text truncate">
                        {item.result.name}
                      </h3>
                      <p className="text-base text-theme-text/80 truncate font-bold">
                        {item.result.brand}
                      </p>
                      {!item.result.isSafe &&
                        item.result.allergensFound.length > 0 && (
                          <p className="text-base font-black text-redstone-red truncate">
                            Contains:{' '}
                            {item.result.allergensFound
                              .map((a) => getAllergenDisplay(a).label)
                              .join(', ')}
                          </p>
                        )}
                      <p className="text-base text-theme-text/70 mt-auto font-bold">
                        {new Date(item.timestamp).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {item.result.isSafe ? (
                        <div className="w-8 h-8 rounded-full bg-theme-primary/20 flex items-center justify-center">
                          <CheckCircle2 className="w-5 h-5 text-theme-primary" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-redstone-red/20 flex items-center justify-center">
                          <AlertCircle className="w-5 h-5 text-redstone-red" />
                        </div>
                      )}
                      {adultMode && (
                        <button
                          onClick={() =>
                            handleRemoveClick({
                              barcode: item.barcode,
                              name: item.result.name,
                            })
                          }
                          className="w-8 h-8 flex items-center justify-center text-redstone-red hover:bg-redstone-red/10 rounded-lg transition-colors"
                          aria-label="Remove from history"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                </motion.li>
              ))}
          </AnimatePresence>
        </ul>
      </div>
      <ConfirmationModal
        isOpen={modalConfig.isOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmRemove}
        title="Remove Item?"
        message={`Are you sure you want to remove ${modalConfig.item?.name || 'this item'} from your history?`}
      />

      {detailProduct && (
        <ProductDetailModal
          product={detailProduct}
          isOpen={!!detailProduct}
          onClose={() => setDetailProduct(null)}
        />
      )}
    </div>
  );
}
