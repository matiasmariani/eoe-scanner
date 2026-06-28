import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, X, Search, AlertCircle, CheckCircle2, Trash2 } from 'lucide-react'; // Restore all needed icons
import { fetchProductByBarcode } from '@/lib/open-food-facts';
import { ProductResult } from '@/lib/open-food-facts';
import { useAllergySettings } from '@/contexts/AllergyContext';
import { cn } from '@/lib/utils';
import { logError } from '@/lib/errorHandling'; // Corrected import

interface FavoritesListProps {
  onClose: () => void;
}

export const FavoritesList: React.FC<FavoritesListProps> = ({ onClose }) => {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [products, setProducts] = useState<ProductResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const { allergies } = useAllergySettings();

  useEffect(() => {
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
    if (favorites.length > 0) {
      setLoading(true);
      setError('');
      const fetchProducts = async () => {
        try {
          const productResults = await Promise.all(
            favorites.map(async (barcode: string) => {
              try {
                return await fetchProductByBarcode(barcode, allergies);
              } catch (err) {
                logError('FavoritesList', err);
                return null;
              }
            })
          );
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
      const newFavorites = prev.filter((code: string) => code !== barcode);
      localStorage.setItem('allergy-scout-favorites', JSON.stringify(newFavorites));
      return newFavorites;
    });
    setProducts(prev => prev.filter(p => p.name !== barcode));
  };

  return (
    <div className="min-h-screen bg-paper-cream flex flex-col">
      <header className="w-full max-w-md mx-auto px-4 py-8 flex items-center justify-between">
        <div className="flex items-center gap-3 bg-sky-blue px-6 py-3 rounded-[2.5rem] shadow-md border-4 border-white">
          <span className="text-2xl" aria-hidden="true">❤️</span>
          <h1 className="text-2xl font-display font-black text-white tracking-tight">My Favorites</h1>
        </div>
        <button
          onClick={onClose}
          className="p-3 bg-white rounded-full shadow-md border-4 border-sky-blue text-sky-blue hover:bg-sky-50 transition-all active:scale-90"
          aria-label="Close favorites"
        >
          <X className="w-6 h-6" aria-hidden="true" />
        </button>
      </header>

      <div className="flex-1 w-full max-w-md mx-auto px-4 pb-16">
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <div className="w-20 h-20 border-8 border-sky-blue/20 border-t-sky-blue rounded-full animate-spin" />
            <p className="text-xl font-display font-bold text-sky-600 mt-6">Looking for your treats...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] text-center" role="alert">
            <AlertCircle className="w-20 h-20 text-watermelon-red mb-4" />
            <p className="text-xl text-gray-600 font-bold">{error}</p>
          </div>
        ) : favorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
            <Heart className="w-20 h-20 text-rose-200 mb-6" />
            <h2 className="text-3xl font-display font-black text-gray-800 mb-2">No Favorites Yet</h2>
            <p className="text-xl text-gray-600">Scan items and tap ❤️ to save them!</p>
          </div>
        ) : (
          <div className="space-y-6">
            <AnimatePresence mode="popLayout">
              {products.map((product, index: number) => (
                <motion.div
                  key={product.name}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-[2rem] border-4 shadow-lg p-4 flex items-center gap-4 relative"
                >
                  <div className="w-20 h-20 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0 flex items-center justify-center border-2 border-gray-100">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <span className="text-3xl">📦</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-display font-black text-ink-navy truncate">
                      {product.name}
                    </h3>
                    <p className="text-sm font-bold text-gray-500 truncate">{product.brand}</p>
                    {product.isSafe && allergies.length === 0 ? (
                      <div className="flex items-center gap-1 text-leaf-green text-xs font-bold uppercase">
                        <CheckCircle2 className="w-3 h-3" />
                        Safe!
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {product.allergensFound.map((a: string) => (
                          <span key={a} className="text-[10px] font-bold px-2 py-0.5 bg-watermelon-red/10 text-watermelon-red rounded-md">
                            {a}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => removeFromFavorites(product.name)}
                    className="p-2 text-rose-400 hover:text-rose-600 transition-colors"
                    aria-label="Remove from favorites"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};
