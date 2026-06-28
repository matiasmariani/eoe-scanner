'use client'

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, X, Search, AlertCircle, CheckCircle2 } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { fetchProductByBarcode } from '@/lib/open-food-facts';
import { ProductResult } from '@/lib/open-food-facts';
import { useAllergySettings } from '@/contexts/AllergyContext';
import { cn } from '@/lib/utils';
import { logError } from '@/lib/errorHandling';

interface FavoritesListProps {
  onClose: () => void;
}

export const FavoritesList: React.FC<FavoritesListProps> = ({ onClose }) => {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [products, setProducts] = useState<ProductResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const { allergies, isAllergicTo } = useAllergySettings();

  useEffect(() => {
    // Load favorites from localStorage
    const stored = localStorage.getItem('allergy-scout-favorites');
    if (stored) {
      try {
        setFavorites(JSON.parse(stored));
      } catch (error) {
        logError('FavoritesList', error);
      }
    }
  }, []);

  useEffect(() => {
    // Fetch product details for each favorite
    if (favorites.length > 0) {
      setLoading(true);
      setError('');

      const fetchProducts = async () => {
        try {
          // Use Promise.all for parallel API calls
          const productResults = await Promise.all(
            favorites.map(async (barcode) => {
              try {
                return await fetchProductByBarcode(barcode, allergies);
              } catch (err) {
                logError('FavoritesList', err);
                return null;
              }
            })
          );

          // Filter out null results
          const validProducts = productResults.filter((product): product is ProductResult => product !== null);

          setProducts(validProducts);
        } catch (err) {
          logError('FavoritesList', err);
          setError('Failed to load favorites');
        } finally {
          setLoading(false);
        }
      };

      fetchProducts();
    }
  }, [favorites, allergies]);

  const removeFromFavorites = (barcode: string) => {
    setFavorites(prev => {
      const newFavorites = prev.filter(code => code !== barcode);
      localStorage.setItem('allergy-scout-favorites', JSON.stringify(newFavorites));
      return newFavorites;
    });

    setProducts(prev => prev.filter(p => p.name !== barcode));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 flex flex-col">
      {/* Header */}
      <header className="w-full max-w-md mx-auto px-4 py-8 flex items-center justify-between">
        <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-[2.5rem] shadow-md border-4 border-sky-200">
          <span className="text-3xl" aria-hidden="true">❤️</span>
          <h1 className="text-2xl font-black text-blue-600 tracking-tight">My Favorites</h1>
        </div>
        <button
          onClick={onClose}
          className="p-3 bg-white rounded-full shadow-md border-4 border-sky-200 text-blue-500 hover:bg-sky-50 transition-all active:scale-90 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label="Close favorites"
        >
          <X className="w-6 h-6" aria-hidden="true" />
        </button>
      </header>

      {/* Content */}
      <div className="flex-1 w-full max-w-md mx-auto px-4 pb-16">
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <div className="w-32 h-32 border-8 border-blue-100 border-t-blue-500 rounded-full animate-spin" />
            <p className="text-xl font-bold text-blue-600 mt-6">Loading favorites...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center min-h-[400px]" role="alert" aria-live="assertive" aria-label={error}>
            <AlertCircle className="w-24 h-24 text-rose-500 mb-6" aria-hidden="true" />
            <p className="text-xl text-gray-600 font-bold">{error}</p>
          </div>
        ) : favorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] text-center" role="status" aria-live="polite" aria-label="No favorites yet">
            <Heart className="w-24 h-24 text-rose-200 mb-6" aria-hidden="true" />
            <h2 className="text-3xl font-black text-gray-800 mb-2">No Favorites Yet</h2>
            <p className="text-xl text-gray-600 mb-6">
              Start scanning products and add them to your favorites!
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <AnimatePresence mode="popLayout">
              {products.map((product, index) => (
                <motion.div
                  key={product.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.1 }}
                  className={cn(
                    "bg-white rounded-[2rem] border-4 shadow-lg p-6",
                    product.isSafe && allergies.length === 0 ? "border-emerald-200" : "border-rose-200"
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-2xl font-black text-gray-900 mb-1">
                        {product.name}
                      </h3>
                      <p className="text-lg font-bold text-gray-500 mb-3">
                        {product.brand}
                      </p>

                      {product.isSafe && allergies.length === 0 ? (
                        <div className="flex items-center gap-2 text-emerald-700 font-black text-xl" role="status" aria-live="polite" aria-label="No allergies found">
                          <CheckCircle2 className="w-6 h-6" aria-hidden="true" />
                          No allergies found. Ask a grown up if you can have it.
                        </div>
                      ) : (
                        <div className="flex flex-col gap-2">
                          <p className="text-rose-600 font-black text-lg uppercase tracking-widest">
                            Contains Allergens
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {product.allergensFound.map((allergen) => (
                              <span
                                key={allergen}
                                className="px-4 py-2 bg-rose-100 text-rose-700 font-bold rounded-full text-sm"
                              >
                                {allergen}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => removeFromFavorites(product.name)}
                      className="p-3 bg-rose-100 text-rose-500 rounded-full hover:bg-rose-200 transition-all active:scale-90 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2"
                      aria-label={`Remove ${product.name} from favorites`}
                    >
                      <X className="w-5 h-5" aria-hidden="true" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};