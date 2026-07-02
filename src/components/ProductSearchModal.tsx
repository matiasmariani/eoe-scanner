'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Browser } from 'react-kawaii';
import { Search, Loader } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/utils';
import { useProductSearch } from '@/hooks/useProductSearch';
import { useAllergySettings } from '@/contexts/AllergyContext';
import { ProductResult } from '@/lib/open-food-facts';

const CATEGORIES = [
  { value: 'fruits', label: 'Fruits' },
  { value: 'vegetables', label: 'Vegetables' },
  { value: 'snacks', label: 'Snacks' },
  { value: 'cereals', label: 'Cereals' },
  { value: 'dairy', label: 'Dairy' },
  { value: 'yogurt', label: 'Yogurt' },
  { value: 'nuts', label: 'Nuts & Seeds' },
  { value: 'cookies', label: 'Cookies' },
  { value: 'chocolate', label: 'Chocolate' },
  { value: 'bread', label: 'Bread' },
  { value: 'meat', label: 'Meat' },
  { value: 'beverages', label: 'Drinks' },
  { value: 'desserts', label: 'Desserts' },
];

interface ProductSearchModalProps {
  onClose: () => void;
  onSelect: (product: ProductResult) => void;
}

export function ProductSearchModal({
  onClose,
  onSelect,
}: ProductSearchModalProps) {
  const { allergies } = useAllergySettings();
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<
    string | undefined
  >();
  const { results, isLoading, hasMore, error, search, loadMore } =
    useProductSearch(allergies);

  const browserColor = theme === 'kitty' ? '#ff69b4' : '#4dfff3';

  const handleSearch = async () => {
    await search({
      query: searchQuery,
      category: selectedCategory,
      page: 1,
      pageSize: 12,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-theme-bg shadow-[0_20px_40px_rgba(0,0,0,0.15)] rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col p-6 space-y-4 overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Browser size={60} mood="happy" color={browserColor} />
            </motion.div>
            <h2 className="text-3xl font-display font-black text-theme-text">
              Browse
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center bg-theme-text text-theme-bg rounded-full font-black text-lg hover:scale-110 transition-transform"
            aria-label="Close search"
          >
            ✕
          </button>
        </div>

        {/* Info Description */}
        <div className="bg-theme-text/5 border-2 border-theme-border/40 rounded-2xl p-4 mb-4 shadow-lg">
          <p className="text-xs font-body font-bold text-theme-text/80 leading-relaxed">
            Powered by <strong>Open Food Facts</strong>, a community database.
            Not all U.S. products may be available—if you don&apos;t find
            something, use the barcode scanner or manual entry.
          </p>
        </div>

        {/* Search Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search products..."
            className="flex-1 bg-white border-2 border-theme-border p-3 rounded-xl font-body font-bold text-theme-text placeholder:text-theme-text/40 focus:outline-none focus:ring-4 focus:ring-theme-accent shadow-lg"
          />
          <motion.button
            whileHover={!isLoading ? { y: -1 } : {}}
            whileTap={!isLoading ? { scale: 0.95 } : {}}
            onClick={handleSearch}
            disabled={isLoading}
            className="px-6 py-3 bg-theme-primary rounded-xl font-black text-theme-text active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg"
          >
            {isLoading ? (
              <Loader className="w-5 h-5 animate-spin" aria-hidden="true" />
            ) : (
              <Search className="w-5 h-5" aria-hidden="true" />
            )}
            Search
          </motion.button>
        </div>

        {/* Category Filter */}
        <div className="space-y-2">
          <label className="text-sm font-black uppercase text-theme-text/60">
            Category
          </label>
          <div className="grid grid-cols-2 gap-2">
            {CATEGORIES.map((cat) => (
              <motion.button
                key={cat.value}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() =>
                  setSelectedCategory(
                    selectedCategory === cat.value ? undefined : cat.value,
                  )
                }
                className={cn(
                  'px-4 py-2 rounded-2xl border-2 font-body font-bold transition-all shadow-lg',
                  selectedCategory === cat.value
                    ? 'bg-theme-accent text-white border-theme-accent'
                    : 'bg-theme-text/5 text-theme-text border-theme-border/40 hover:border-theme-border/80',
                )}
                aria-pressed={selectedCategory === cat.value}
              >
                {cat.label}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Results */}
        {error && (
          <div className="bg-redstone-red/10 border-2 border-redstone-red p-4 rounded-xl text-redstone-red font-bold">
            {error}
          </div>
        )}

        <AnimatePresence>
          {isLoading && results.length === 0 ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center gap-4 py-12"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              >
                <Loader className="w-8 h-8 text-theme-accent" />
              </motion.div>
              <motion.span
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="font-black text-theme-text uppercase tracking-wide"
              >
                Searching...
              </motion.span>
            </motion.div>
          ) : results.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12 bg-theme-text/5 rounded-2xl border-2 border-theme-border/20 p-6 shadow-lg"
            >
              <Search className="w-12 h-12 text-theme-text/30 mx-auto mb-4" />
              <p className="text-lg font-display font-black text-theme-text mb-1">
                No products found
              </p>
              <p className="text-sm text-theme-text/60 font-body">
                Try a different search or category
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-2 gap-3"
            >
              {results.map((product) => (
                <motion.button
                  key={product.barcode}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onSelect(product)}
                  className={cn(
                    'p-3 rounded-xl border-2 text-left transition-all active:scale-95 shadow-lg',
                    product.isSafe
                      ? 'bg-theme-primary/10 border-theme-primary/30 hover:bg-theme-primary/15'
                      : 'bg-redstone-red/10 border-redstone-red/30 hover:bg-redstone-red/15',
                  )}
                >
                  <div className="flex items-start gap-2">
                    {product.image_url ? (
                      <Image
                        src={product.image_url}
                        alt={product.name}
                        width={48}
                        height={48}
                        className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-theme-text/10 flex items-center justify-center flex-shrink-0 text-xl">
                        {product.icon || '📦'}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black uppercase text-theme-text truncate">
                        {product.name}
                      </p>
                      <p className="text-[10px] text-theme-text/60 truncate">
                        {product.brand}
                      </p>
                      <span
                        className={cn(
                          'inline-block text-[10px] font-black uppercase mt-1 px-2 py-0.5 rounded-full border-1',
                          product.isSafe
                            ? 'bg-theme-primary text-theme-border'
                            : 'bg-redstone-red text-white',
                        )}
                      >
                        {product.isSafe ? 'Safe' : 'Unsafe'}
                      </span>
                    </div>
                  </div>
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Load More Button */}
        {hasMore && results.length > 0 && (
          <motion.button
            whileHover={!isLoading ? { y: -2 } : {}}
            whileTap={!isLoading ? { scale: 0.95 } : {}}
            onClick={loadMore}
            disabled={isLoading}
            className="w-full py-3 bg-theme-text/5 border-2 border-theme-border rounded-xl font-black text-theme-text hover:bg-theme-text/10 active:scale-95 transition-all disabled:opacity-50 shadow-lg"
          >
            {isLoading ? 'Loading...' : 'Load More'}
          </motion.button>
        )}
      </motion.div>
    </motion.div>
  );
}
