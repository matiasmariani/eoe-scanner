'use client';

import React, { useState } from 'react';
import { Info } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useIsPremium } from '@/lib/premium';
import { NutritionInfoModal } from '@/components/NutritionInfoModal';

interface NutritionBadgesProps {
  nutriscoreGrade?: string;
  nutriscoreScore?: number;
  novaGroup?: number;
}

export function NutritionBadges({
  nutriscoreGrade,
  nutriscoreScore,
  novaGroup,
}: NutritionBadgesProps) {
  const isPremium = useIsPremium();
  const [showNutriInfo, setShowNutriInfo] = useState(false);
  const [showNovaInfo, setShowNovaInfo] = useState(false);

  // Only show Nutri-Score if data is valid (0-100 score)
  const hasValidNutriScore =
    nutriscoreGrade &&
    nutriscoreScore !== undefined &&
    nutriscoreScore >= 0 &&
    nutriscoreScore <= 100;

  // Only show NOVA if classified (1-3, skip 4 "Not classified")
  const hasValidNova = novaGroup && novaGroup >= 1 && novaGroup <= 3;

  if (!hasValidNutriScore && !hasValidNova) return null;

  const getNutriEmojiAndColor = (grade?: string) => {
    const g = grade?.toUpperCase();
    switch (g) {
      case 'A':
        return {
          emoji: '😍',
          color: 'bg-green-500 text-white',
          label: 'Excellent',
        };
      case 'B':
        return { emoji: '😊', color: 'bg-lime-400 text-black', label: 'Good' };
      case 'C':
        return { emoji: '😐', color: 'bg-yellow-400 text-black', label: 'OK' };
      case 'D':
        return {
          emoji: '😕',
          color: 'bg-orange-500 text-white',
          label: 'Poor',
        };
      case 'E':
        return {
          emoji: '😤',
          color: 'bg-red-700 text-white',
          label: 'Very Poor',
        };
      default:
        return {
          emoji: '❓',
          color: 'bg-gray-400 text-white',
          label: 'Unknown',
        };
    }
  };

  const getNovaEmoji = (group?: number) => {
    switch (group) {
      case 1:
        return '🌿';
      case 2:
        return '⚙️';
      case 3:
        return '🏭';
      case 4:
        return '❓';
      default:
        return '❓';
    }
  };

  const getNovaLabel = (group?: number) => {
    switch (group) {
      case 1:
        return 'Unprocessed';
      case 2:
        return 'Processed';
      case 3:
        return 'Ultra-processed';
      case 4:
        return 'Not classified';
      default:
        return 'N/A';
    }
  };

  const nutri = getNutriEmojiAndColor(nutriscoreGrade);

  return (
    <>
      <div className="w-full flex flex-wrap justify-center gap-6 px-2">
        {/* Nutri-Score Badge */}
        {isPremium && hasValidNutriScore && (
          <div className="relative">
            <div
              className={cn(
                'flex items-center gap-4 px-6 py-4 rounded-2xl border-4 border-theme-border shadow-[4px_4px_0px_0px_rgba(0,0,0,0.4)]',
                nutri.color,
              )}
              role="img"
              aria-label={`Nutri-Score: ${nutri.label}`}
            >
              <span className="text-5xl" aria-hidden="true">
                {nutri.emoji}
              </span>
              <div className="flex flex-col items-start gap-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black">
                    {nutriscoreGrade.toUpperCase()}
                  </span>
                  {nutriscoreScore !== undefined && (
                    <span className="text-sm font-bold">
                      {nutriscoreScore}/100
                    </span>
                  )}
                </div>
                <span className="text-xs font-bold opacity-80">
                  {nutri.label}
                </span>
              </div>
            </div>

            {/* Info Icon — Top Right Corner */}
            <button
              onClick={() => setShowNutriInfo(true)}
              className="absolute -top-2 -right-2 bg-theme-text text-theme-bg w-8 h-8 rounded-full flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,0.4)] hover:scale-110 active:scale-95 transition-transform z-10"
              aria-label="Learn about Nutri-Score"
              title="What does this mean?"
            >
              <Info className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        )}

        {/* NOVA Badge */}
        {hasValidNova && (
          <div className="relative">
            <div
              className="flex items-center gap-4 px-6 py-4 rounded-2xl border-4 border-theme-border bg-theme-bg shadow-[4px_4px_0px_0px_rgba(0,0,0,0.4)]"
              role="img"
              aria-label={`Processing level: ${getNovaLabel(novaGroup)}`}
            >
              <span className="text-5xl" aria-hidden="true">
                {getNovaEmoji(novaGroup)}
              </span>
              <div className="flex flex-col items-start gap-0">
                <span className="text-xs font-black uppercase text-theme-text/80">
                  Processing
                </span>
                <span className="text-sm font-bold text-theme-text">
                  {getNovaLabel(novaGroup)}
                </span>
              </div>
            </div>

            {/* Info Icon — Top Right Corner */}
            <button
              onClick={() => setShowNovaInfo(true)}
              className="absolute -top-2 -right-2 bg-theme-text text-theme-bg w-8 h-8 rounded-full flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,0.4)] hover:scale-110 active:scale-95 transition-transform z-10"
              aria-label="Learn about processing levels"
              title="What does this mean?"
            >
              <Info className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>

      {/* Info Modals */}
      <AnimatePresence>
        {showNutriInfo && (
          <NutritionInfoModal
            type="nutriscore"
            isOpen={showNutriInfo}
            onClose={() => setShowNutriInfo(false)}
          />
        )}
        {showNovaInfo && (
          <NutritionInfoModal
            type="nova"
            isOpen={showNovaInfo}
            onClose={() => setShowNovaInfo(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
