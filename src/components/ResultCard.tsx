'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Star,
  RefreshCcw,
  Volume2,
  Lock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAllergySettings } from '@/contexts/AllergyContext';
import { useIsPremium } from '@/lib/premium';
import { useSpeakResult } from '@/hooks/useSpeakResult';
import { PremiumGate } from '@/components/PremiumGate';
import { type ProductResult } from '@/lib/open-food-facts';

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
  const { activeProfile } = useAllergySettings();
  const isPremium = useIsPremium();
  const { speak } = useSpeakResult();
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  const isSafe = result.isSafe !== undefined ? result.isSafe : true;

  // Auto-speak result when premium
  useEffect(() => {
    if (isPremium && result.name && result.name !== 'Unknown Product') {
      speak(
        activeProfile?.name || 'Me',
        result.name,
        isSafe,
        result.allergensFound,
      );
    }
  }, [result, isPremium, speak, activeProfile, isSafe]);

  const handleSpeak = () => {
    if (!isPremium) {
      setShowPremiumModal(true);
      return;
    }
    speak(
      activeProfile?.name || 'Me',
      result.name,
      isSafe,
      result.allergensFound,
    );
  };

  const getStatusIcon = () => {
    if (isSafe)
      return (
        <CheckCircle2
          className="w-10 h-10 text-theme-primary"
          aria-hidden="true"
        />
      );
    if (result.warning)
      return (
        <AlertTriangle
          className="w-10 h-10 text-theme-accent"
          aria-hidden="true"
        />
      );
    return (
      <AlertCircle className="w-10 h-10 text-redstone-red" aria-hidden="true" />
    );
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

      {/* Product Image / Icon */}
      <div
        className="mb-2 flex justify-center"
        role="img"
        aria-label={result.name}
      >
        {result.image_url ? (
          <img
            src={result.image_url}
            alt={result.name}
            className="w-64 h-64 object-cover rounded-3xl border-4 border-theme-border shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          />
        ) : (
          <div className="text-8xl">{result.icon || '📦'}</div>
        )}
      </div>

      {/* Product Name + Voice Button */}
      <div className="flex items-start justify-between gap-3 w-full">
        <h2 className="text-4xl font-display font-black text-theme-bg text-center leading-tight p-2 flex-1">
          {result.name}
        </h2>
        <button
          onClick={handleSpeak}
          className={cn(
            'mt-2 w-12 h-12 flex-shrink-0 flex items-center justify-center border-4 border-theme-border rounded-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:scale-95 transition-transform',
            isPremium
              ? 'bg-theme-bg text-theme-text hover:bg-theme-bg/80'
              : 'bg-theme-accent/10 text-theme-accent',
          )}
          aria-label="Read result aloud"
        >
          {isPremium ? (
            <Volume2 className="w-6 h-6" />
          ) : (
            <Lock className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Status Badge */}
      <div
        className={cn(
          'flex items-center justify-center gap-3 px-8 py-4 rounded-full font-black text-2xl border-4 border-theme-border shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]',
          isSafe
            ? 'bg-theme-primary/10 text-theme-primary'
            : 'bg-redstone-red/10 text-redstone-red',
        )}
        role="status"
      >
        {getStatusIcon()}
        <span>{isSafe ? 'O.K' : 'STOP'}</span>
      </div>

      {/* Allergens List */}
      <ul className="w-full flex flex-wrap justify-center gap-3 mb-2">
        {isSafe ? (
          <li className="text-theme-bg/60 font-bold text-xl" aria-hidden="true">
            No allergens found!
          </li>
        ) : (
          result.allergensFound?.map((allergen: string) => (
            <li
              key={allergen}
              className="flex flex-col items-center gap-1 bg-redstone-red/5 p-3 rounded-2xl border-2 border-redstone-red/20"
            >
              <span className="text-3xl" role="img" aria-label={allergen}>
                {getAllergenIcon(allergen)}
              </span>
              <span className="text-xs font-black uppercase text-redstone-red tracking-tighter">
                {allergen}
              </span>
            </li>
          ))
        )}
      </ul>

      {/* Action Buttons — only safe snacks can join the collection */}
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
              aria-hidden="true"
            />
            {isCollected ? 'Collected' : 'Collect'}
          </button>
        )}

        <button
          onClick={onReset}
          className="flex items-center justify-center gap-3 p-6 border-4 border-theme-border bg-theme-bg text-theme-text rounded-3xl font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:scale-95 hover:translate-y-[-2px] transition-transform"
        >
          <RefreshCcw className="w-8 h-8" aria-hidden="true" />
          Scan
        </button>
      </div>

      {showPremiumModal && (
        <PremiumGate
          feature="Voice readout"
          onClose={() => setShowPremiumModal(false)}
        />
      )}
    </motion.div>
  );
};

function getAllergenIcon(allergen: string) {
  if (allergen.includes(':')) return allergen.slice(0, allergen.indexOf(':'));
  const map: Record<string, string> = {
    milk: '🥛',
    egg: '🥚',
    peanuts: '🥜',
    tree_nuts: '🌰',
    wheat: '🌾',
    soy: '🫘',
    fish: '🐟',
    shellfish: '🦐',
    sesame: '🫛',
    gluten: '🍞',
  };
  return map[allergen.toLowerCase()] ?? '⚠️';
}
