import React from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Star,
  RefreshCcw,
} from 'lucide-react';
import { ProductResult } from '@/lib/open-food-facts';
import { cn } from '@/lib/utils';

interface ResultCardProps {
  result: ProductResult;
  onReset: () => void;
  onCollect: () => void;
  isCollected: boolean;
}

export const ResultCard: React.FC<ResultCardProps> = ({
  result,
  onReset,
  onCollect,
  isCollected,
}) => {
  const isSafe = result.isSafe !== undefined ? result.isSafe : true;

  const getStatusIcon = () => {
    if (isSafe)
      return <CheckCircle2 className="w-10 h-10 text-theme-primary" />;
    if (result.warning)
      return <AlertTriangle className="w-10 h-10 text-theme-accent" />;
    return <AlertCircle className="w-10 h-10 text-redstone-red" />;
  };

  return (
    <motion.div
      initial={{ scale: 0.5, rotate: -10, opacity: 0 }}
      animate={{ scale: 1, rotate: 0, opacity: 1 }}
      exit={{ scale: 0.5, opacity: 0, rotate: 10 }}
      className={cn(
        'w-full max-w-md bg-theme-text border-4 border-theme-border shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center relative animate-pop p-6 space-y-4',
      )}
    >
      {/* Close/Reset Button */}
      <button
        onClick={onReset}
        className="absolute -top-4 -right-4 bg-theme-bg text-theme-text w-12 h-12 rounded-full flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:scale-110 transition-transform z-10"
        aria-label="Close result"
      >
        ✕
      </button>

      {/* Product Icon */}
      <div className="text-8xl mb-2" role="img" aria-label={result.name}>
        {result.icon || '📦'}
      </div>

      {/* Product Name */}
      <h2 className="text-4xl font-display font-black text-theme-bg text-center leading-tight p-2 w-full">
        {result.name}
      </h2>

      {/* Status Badge */}

      <div
        className={cn(
          'flex items-center justify-center gap-3 px-8 py-4 rounded-full font-black text-2xl border-4 border-theme-border shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]',
          isSafe
            ? 'bg-theme-primary/10 text-theme-primary'
            : 'bg-redstone-red/10 text-redstone-red',
        )}
      >
        {getStatusIcon()}
        <span>{isSafe ? 'O.K' : 'STOP'}</span>
      </div>

      {/* Allergens List */}
      <div className="w-full flex flex-wrap justify-center gap-3 mb-2">
        {isSafe ? (
          <div
            className="text-theme-bg/60 font-bold text-xl"
            aria-hidden="true"
          >
            No allergens found!
          </div>
        ) : (
          result.allergensFound?.map((allergen) => (
            <div
              key={allergen}
              className="flex flex-col items-center gap-1 bg-redstone-red/5 p-3 rounded-2xl border-2 border-redstone-red/20"
            >
              <span className="text-3xl" role="img" aria-label={allergen}>
                {getAllergenIcon(allergen)}
              </span>
              <span className="text-[10px] font-black uppercase text-redstone-red tracking-tighter">
                {allergen}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Action Buttons — only safe snacks can join the collection. */}
      <div
        className={cn(
          'grid gap-4 w-full px-2 pt-4',
          isSafe ? 'grid-cols-2' : 'grid-cols-1',
        )}
      >
        {isSafe && (
          <button
            onClick={onCollect}
            className={cn(
              'flex items-center justify-center gap-3 p-6 border-4 border-theme-border rounded-3xl text-xl font-black transition-all active:scale-95',
              isCollected
                ? 'bg-theme-accent text-theme-bg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                : 'bg-theme-text text-theme-bg/60 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]',
            )}
            aria-pressed={isCollected}
          >
            <Star
              className={cn(
                'w-8 h-8',
                isCollected ? 'fill-theme-accent text-theme-accent' : '',
              )}
            />
            {isCollected ? 'Collected' : 'Collect'}
          </button>
        )}

        <button
          onClick={onReset}
          className="flex items-center justify-center gap-3 p-6 border-4 border-theme-border bg-theme-bg text-theme-text rounded-3xl font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:scale-95 hover:translate-y-[-2px] transition-transform"
        >
          <RefreshCcw className="w-8 h-8" />
          Scan
        </button>
      </div>
    </motion.div>
  );
};

function getAllergenIcon(allergen: string) {
  const map: Record<string, string> = {
    milk: '🥛',
    eggs: '🥚',
    peanuts: '🥜',
    'tree nuts': '🌰',
    wheat: '🌾',
    soy: '🫘',
    fish: '🐟',
    'crustacean shellfish': '🦐',
    sesame: '🫒',
  };
  return map[allergen.toLowerCase()] || '⚠️';
}
