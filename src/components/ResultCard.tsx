'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Planet, IceCream } from 'react-kawaii';
import {
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Star,
  RefreshCcw,
  Volume2,
  Lock,
} from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useAllergySettings } from '@/contexts/AllergyContext';
import { useIsPremium } from '@/lib/premium';
import { useTheme } from '@/hooks/useTheme';
import { useSpeakResult } from '@/hooks/useSpeakResult';
import { PremiumGate } from '@/components/PremiumGate';
import { NutritionBadges } from '@/components/NutritionBadges';
import { getAllergenDisplay } from '@/lib/allergen-utils';
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
  const { theme } = useTheme();
  const { speak } = useSpeakResult();
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  const planetColor = '#79d461'; // Always green (happy safe planet)

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
        'w-full max-w-md bg-theme-bg shadow-lg flex flex-col items-center relative p-6 space-y-4 rounded-3xl',
        isSafe && 'ring-2 ring-theme-primary/30',
      )}
    >
      {/* Close/Reset Button */}
      <button
        onClick={onReset}
        className="absolute -top-4 -right-4 bg-white text-theme-text w-12 h-12 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform z-10"
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
          <Image
            src={result.image_url}
            alt={result.name}
            width={256}
            height={256}
            className="w-64 h-64 object-cover rounded-3xl shadow-lg"
          />
        ) : (
          <div className="text-8xl">{result.icon || '📦'}</div>
        )}
      </div>

      {/* Product Name + Voice Button */}
      <div className="flex items-start justify-between gap-3 w-full">
        <h2 className="text-4xl font-display font-black text-theme-text text-center leading-tight p-2 flex-1">
          {result.name}
        </h2>
        <button
          onClick={handleSpeak}
          className={cn(
            'mt-2 w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-full shadow-lg active:scale-95 transition-transform',
            isPremium
              ? 'bg-white text-theme-text hover:bg-theme-primary/10'
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

      {/* Status Badge with Planet Buddy & IceCream Celebration */}
      <motion.div
        animate={isSafe ? { scale: [1, 1.05, 1] } : {}}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="flex flex-col items-center gap-4"
        role="status"
      >
        <div className="flex items-center justify-center gap-4">
          <Planet
            size={90}
            mood={isSafe ? 'happy' : 'sad'}
            color={isSafe ? planetColor : '#d81b00'}
          />
          {isSafe && (
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <IceCream size={90} mood="happy" color="#ffde00" />
            </motion.div>
          )}
        </div>
        <div
          className={cn(
            'px-8 py-3 rounded-full font-black text-2xl border-0 shadow-lg',
            isSafe
              ? 'bg-theme-primary text-theme-text'
              : 'bg-redstone-red text-white',
          )}
        >
          {isSafe ? 'O.K - Enjoy!' : 'STOP'}
        </div>
      </motion.div>

      {/* Allergens List */}
      <ul className="w-full flex flex-wrap justify-center gap-3 mb-2">
        {isSafe ? (
          <li
            className="text-theme-text/60 font-bold text-xl"
            aria-hidden="true"
          >
            No allergens found!
          </li>
        ) : (
          result.allergensFound?.map((allergen: string) => {
            const { emoji, label } = getAllergenDisplay(allergen);
            return (
              <li
                key={allergen}
                className="flex flex-col items-center gap-2 bg-redstone-red/10 p-4 rounded-3xl shadow-lg"
              >
                <span className="text-4xl" role="img" aria-label={label}>
                  {emoji}
                </span>
                <span className="text-xs font-black uppercase text-redstone-red tracking-tighter">
                  {label}
                </span>
              </li>
            );
          })
        )}
      </ul>

      {/* Nutrition Badges (Nutri-Score + NOVA) */}
      <NutritionBadges
        nutriscoreGrade={result.nutriscore_grade}
        nutriscoreScore={result.nutriscore_score}
        novaGroup={result.nova_group}
      />

      {/* Action Buttons — only safe snacks can join the collection */}
      <div
        className={cn(
          'grid gap-4 w-full px-2 pt-4',
          isSafe ? 'grid-cols-2' : 'grid-cols-1',
        )}
      >
        {isSafe && (
          <motion.button
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={onCollect}
            className={cn(
              'flex items-center justify-center gap-3 p-6 rounded-3xl text-xl font-black transition-all',
              isCollected
                ? 'bg-theme-accent text-white shadow-lg hover:shadow-[0_12px_24px_rgba(0,0,0,0.15)]'
                : 'bg-white text-theme-text shadow-lg hover:shadow-[0_12px_24px_rgba(0,0,0,0.15)]',
            )}
            aria-pressed={isCollected}
          >
            <Star
              className={cn(
                'w-8 h-8',
                isCollected ? 'fill-white text-white' : '',
              )}
              aria-hidden="true"
            />
            {isCollected ? 'Saved' : 'Add to Safe'}
          </motion.button>
        )}

        <motion.button
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={onReset}
          className="flex items-center justify-center gap-3 p-6 bg-white text-theme-text rounded-3xl font-black shadow-lg hover:shadow-[0_12px_24px_rgba(0,0,0,0.15)] transition-all"
        >
          <RefreshCcw className="w-8 h-8" aria-hidden="true" />
          Scan Again
        </motion.button>
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
