import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  AlertTriangle,
  RefreshCcw,
  Info,
  Milk,
  Wheat,
  Egg,
  Heart
} from "lucide-react";
import { ProductResult } from "@/lib/open-food-facts";
import { useAllergySettings } from "@/contexts/AllergyContext";
import { cn } from "@/lib/utils";

const ALLERGEN_ICONS: Record<string, React.ReactNode> = {
  "Milk": <Milk className="w-10 h-10 text-orange-500" />,
  "Wheat": <Wheat className="w-10 h-10 text-amber-600" />,
  "Egg": <Egg className="w-10 h-10 text-yellow-500" />,
  "Peanuts": <Milk className="w-10 h-10 text-orange-500" />,
  "Tree Nuts": <Milk className="w-10 h-10 text-orange-500" />,
  "Soy": <Milk className="w-10 h-10 text-orange-500" />,
  "Fish": <Milk className="w-10 h-10 text-orange-500" />,
  "Crustacean Shellfish": <Milk className="w-10 h-10 text-orange-500" />,
  "Sesame": <Milk className="w-10 h-10 text-orange-500" />,
};

interface ResultCardProps {
  result: ProductResult;
  onReset: () => void;
  onFavorite?: () => void;
  isFavorite?: boolean;
}

export const ResultCard: React.FC<ResultCardProps> = ({ result, onReset, onFavorite, isFavorite = false }) => {
    const { allergies, isAllergicTo } = useAllergySettings();
    const { isSafe } = result;
    console.log('test-1', {allergies, isAllergicTo, result})
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={result.name}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className={cn(
          "w-full max-w-md mx-auto overflow-hidden rounded-[4rem] border-8 shadow-2xl transition-all duration-500",
          isSafe ? "border-emerald-500 bg-emerald-50" : "border-rose-500 bg-rose-50"
        )}
      >
        <div className="p-10 flex flex-col items-center text-center">
          <motion.div
            initial={{ y: -30 }}
            animate={{ y: 0 }}
            className={cn(
              "mb-6 p-6 rounded-full shadow-lg",
              isSafe ? "bg-emerald-500 text-white" : "bg-rose-500 text-white"
            )}
          >
            {isSafe ? (
              <CheckCircle2 className="w-16 h-16" aria-hidden="true" />
            ) : (
              <AlertTriangle className="w-16 h-16" aria-hidden="true" />
            )}
          </motion.div>

          <h2 className="text-4xl font-black text-gray-900 mb-2 leading-tight">
            {result.name}
          </h2>
          <p className="text-xl font-bold text-gray-500 mb-8">
            {result.brand}
          </p>

          <div className="w-full space-y-6 mb-10">
            {isSafe ? (
              <div className="flex items-center justify-center gap-3 text-emerald-700 font-black text-3xl py-4" role="status" aria-live="polite" aria-label="No allergies found">
                <CheckCircle2 className="w-10 h-10" aria-hidden="true" />
                No allergies found. Ask a grown up if you can have it.
              </div>
            ) : (
              <div className="flex flex-col gap-4 w-full" role="alert" aria-live="assertive" aria-label={`Contains allergens: ${result.allergensFound.join(', ')}`}>
                <p className="text-rose-600 font-black text-2xl uppercase tracking-widest">
                  Watch out!
                </p>
                <div className="grid grid-cols-1 gap-3">
                  {result.allergensFound.map((allergen) => (
                    <div
                      key={allergen}
                      className="flex items-center justify-center gap-5 bg-white border-4 border-rose-100 rounded-[2rem] p-6 shadow-md"
                    >
                      {ALLERGEN_ICONS[allergen] || <Info className="w-10 h-10 text-rose-500" aria-hidden="true" />}
                      <span className="text-3xl font-black text-rose-900">
                        {allergen}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="w-full space-y-4 flex flex-col">
            <button
              onClick={onReset}
              className="flex items-center justify-center gap-3 bg-gray-800 text-white px-10 py-6 rounded-full text-2xl font-black hover:bg-gray-700 transition-all active:scale-95 shadow-xl"
              aria-label="Scan another product"
            >
              <RefreshCcw className="w-8 h-8" />
              Scan Again
            </button>

            {onFavorite && (
              <button
                onClick={onFavorite}
                className={cn(
                  "flex items-center justify-center gap-3 px-10 py-6 rounded-full text-2xl font-black transition-all active:scale-95 shadow-lg",
                  isFavorite
                    ? "bg-rose-500 text-white hover:bg-rose-600"
                    : "bg-white text-rose-500 hover:bg-rose-50 border-4 border-rose-200"
                )}
                aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
              >
                <Heart className={cn("w-8 h-8", isFavorite && "fill-current")} />
                {isFavorite ? "Remove Favorite" : "Add to Favorites"}
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
