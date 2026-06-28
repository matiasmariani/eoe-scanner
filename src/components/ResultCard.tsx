import React from 'react';
import { motion, AnimatePresence } from 'framer-motion'; // Removed unused
import { CheckCircle2, AlertTriangle, XCircle, AlertCircle } from 'lucide-react'; // Removed unused XCircle
import { ProductResult } from '@/lib/open-food-facts';
import { cn } from '@/lib/utils';
import { Heart, RefreshCcw } from "lucide-react";
interface ResultCardProps {
  result: ProductResult;
  onReset: () => void;
  onFavorite: () => void;
  isFavorite: boolean;
}

export const ResultCard: React.FC<ResultCardProps> = ({
  result,
  onReset,
  onFavorite,
  isFavorite,
}) => {
  const isSafe = result.isSafe !== undefined ? result.isSafe : true;

  // Removed unused getStatusColor helper

  const getStatusIcon = () => {
    if (isSafe) return <CheckCircle2 className="w-10 h-10 text-leaf-green" />;
    if (result.warning) return <AlertTriangle className="w-10 h-10 text-sunshine-yellow" />;
    return <AlertCircle className="w-10 h-10 text-watermelon-red" />;
  };

  return (
    <motion.div
      initial={{ scale: 0.5, rotate: -10, opacity: 0 }}
      animate={{ scale: 1, rotate: 0, opacity: 1 }}
      exit={{ scale: 0.5, opacity: 0, rotate: 10 }}
      className={cn(
        "w-full max-w-sm bg-white sticker-effect wobbly-border-lg shadow-2xl flex flex-col items-center relative animate-pop-in"
      )}
    >
      {/* Close/Reset Button */}
      <button
        onClick={onReset}
        className="absolute -top-3 -right-3 bg-ink-navy text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform z-10"
        aria-label="Close result"
      >
        ✕
      </button>

      {/* Product Image Container */}
      <div className="w-40 h-40 rounded-full overflow-hidden bg-gray-100 border-4 border-sky-blue mb-4 flex items-center justify-center shadow-inner">
        {result.image_url ? (
          /* Use Next Image for optimization - since we don't have a static domain, we use unoptimized as fallback */
          <img
            src={result.image_url}
            alt={result.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="text-5xl">📦</div>
        )}
      </div>

      {/* Product Name */}
      <h2 className="text-2xl font-display font-black text-ink-navy text-center mb-2 leading-tight">
        {result.name}
      </h2>

      {/* Status Badge */}
      <div
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-full mb-6 font-bold text-lg",
          isSafe ? "bg-leaf-green/10 text-leaf-green" : "bg-watermelon-red/10 text-watermelon-red"
        )}
      >
        {getStatusIcon()}
        <span>{isSafe ? "Safe to eat!" : "Not Safe!"}</span>
      </div>

      {/* Allergens List (Icons Only) */}
      <div className="w-full flex flex-wrap justify-center gap-4 mb-6">
        {isSafe ? (
          <div className="flex items-center gap-2 text-gray-400 font-bold" aria-hidden="true">
            No clues found!
          </div>
        ) : (
          result.allergensFound.map((allergen) => (
            <div
              key={allergen}
              className="flex flex-col items-center gap-1 bg-watermelon-red/5 p-3 rounded-xl border-2 border-watermelon-red/20"
            >
               {/* Using Emoji/Icon placeholder for allergens */}
               <span className="text-3xl" role="img" aria-label={allergen}>{getAllergenIcon(allergen)}</span>
               <span className="text-[10px] font-black uppercase text-watermelon-red tracking-tighter">{allergen}</span>
            </div>
          ))
        )}
      </div>

      {/* Action Buttons */}
      <div className="grid gridcols-2 gap-3 w-full">
        <button
          onClick={onFavorite}
          className={cn(
            "flex items-center justify-center gap-2 p-3 wobbly-border text-sm font-bold transition-all active:scale-95",
            isFavorite
              ? "bg-sunshine-yellow text-ink-navy shadow-[0_4px_0_0_rgba(253,224,71,0.8)]"
              : "bg-gray-100 text-gray-600 shadow-[0_4px_0_0_rgba(0,0,0,0.1)]"
          )}
        >
          <Heart
            className={cn(
              "w-5 h-5",
              isFavorite ? "fill-red-500 text-red-500" : ""
            )}
          />
          {isFavorite ? "Saved" : "Favorite"}
        </button>

        <button
          onClick={onReset}
          className="flex items-center justify-center gap-2 p-3 wobbly-border bg-ink-navy text-white text-sm font-bold shadow-[0_4px_0_0_rgba(30,58,138,0.5)] active:scale-95"
        >
          <RefreshCcw className="w-5 h-5" />
          Scan Again
        </button>
      </div>
    </motion.div>
  );
};

// Helper to map allergen names to icons/emojis
function getAllergenIcon(allergen: string) {
    const map: Record<string, string> = {
        'milk': '🥛',
        'eggs': '🥚',
        'peanuts': '🥜',
        'tree nuts': '🌰',
        'wheat': '🌾',
        'soy': '🫘',
        'fish': '🐟',
        'crustacean shellfish': '🦐',
        'sesame': '🫒',
    };
    return map[allergen.toLowerCase()] || '⚠️';
}
