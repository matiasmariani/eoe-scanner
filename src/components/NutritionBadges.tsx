'use client';

import React, { useState } from 'react';
import { Info } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { Planet, MOODS } from 'react-kawaii';
import { cn } from '@/lib/utils';
import { useIsPremium } from '@/lib/premium';
import { nutriHealthPercent } from '@/lib/nutrition-utils';
import { NutritionInfoModal } from '@/components/NutritionInfoModal';

type KawaiiMood = (typeof MOODS)[number];

interface NutritionBadgesProps {
  nutriscoreGrade?: string;
  nutriscoreScore?: number;
  novaGroup?: number;
  compact?: boolean;
  align?: 'start' | 'center';
}

export function NutritionBadges({
  nutriscoreGrade,
  novaGroup,
  compact = false,
  align = 'center',
}: NutritionBadgesProps) {
  const isPremium = useIsPremium();
  const [showNutriInfo, setShowNutriInfo] = useState(false);
  const [showNovaInfo, setShowNovaInfo] = useState(false);

  // Show Nutri-Score whenever we have a valid A–E grade. (The raw OFF
  // `nutriscoreScore` is an experimental scale — negative = healthy — so it
  // can't gate validity or be shown as "/100"; we derive healthiness instead.)
  const healthPercent = nutriHealthPercent(nutriscoreGrade);
  const hasValidNutriScore = healthPercent !== null;

  // Only show NOVA if classified (1-3, skip 4 "Not classified")
  const hasValidNova = novaGroup && novaGroup >= 1 && novaGroup <= 3;

  if (!hasValidNutriScore && !hasValidNova) return null;

  // Grade A (best) -> green/blissful, grade E (worst) -> red/ko, with
  // intermediate moods/colors stepping down in between.
  const getNutriMoodAndColor = (
    grade?: string,
  ): {
    mood: KawaiiMood;
    kawaiiColor: string;
    badgeClass: string;
    label: string;
  } => {
    const g = grade?.toUpperCase();
    switch (g) {
      case 'A':
        return {
          mood: 'blissful',
          kawaiiColor: '#22c55e',
          badgeClass: 'bg-green-500 text-white',
          label: 'Excellent',
        };
      case 'B':
        return {
          mood: 'happy',
          kawaiiColor: '#a3d977',
          badgeClass: 'bg-lime-400 text-black',
          label: 'Good',
        };
      case 'C':
        return {
          mood: 'sad',
          kawaiiColor: '#f4c542',
          badgeClass: 'bg-yellow-400 text-black',
          label: 'OK',
        };
      case 'D':
        return {
          mood: 'shocked',
          kawaiiColor: '#f2994a',
          badgeClass: 'bg-orange-500 text-white',
          label: 'Poor',
        };
      case 'E':
        return {
          mood: 'ko',
          // Dark-dark red so the planet reads against the red-700 badge.
          kawaiiColor: '#4a0d0d',
          badgeClass: 'bg-red-700 text-white',
          label: 'Very Poor',
        };
      default:
        return {
          mood: 'excited',
          kawaiiColor: '#9ca3af',
          badgeClass: 'bg-gray-400 text-white',
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

  const nutri = getNutriMoodAndColor(nutriscoreGrade);

  return (
    <>
      <div
        className={cn(
          'w-full flex flex-wrap gap-4 px-2',
          align === 'center' ? 'justify-center' : 'justify-start',
        )}
      >
        {/* Nutri-Score Badge */}
        {isPremium && hasValidNutriScore && (
          <div className="relative">
            <div
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-2xl shadow-lg',
                compact && 'px-3 py-2 rounded-xl',
                nutri.badgeClass,
              )}
              role="img"
              aria-label={`Nutri-Score: ${nutri.label}`}
            >
              <Planet
                size={compact ? 32 : 56}
                mood={nutri.mood}
                color={nutri.kawaiiColor}
              />
              <div className="flex flex-col items-start gap-0">
                <div className="flex items-baseline gap-1">
                  <span
                    className={cn(
                      'font-black',
                      compact ? 'text-lg' : 'text-2xl',
                    )}
                  >
                    {nutriscoreGrade?.toUpperCase()}
                  </span>
                  {healthPercent !== null && (
                    <span
                      className={cn(
                        'font-bold',
                        compact ? 'text-[10px]' : 'text-sm',
                      )}
                    >
                      {healthPercent}/100
                    </span>
                  )}
                </div>
                <span
                  className={cn(
                    'font-bold opacity-80',
                    compact ? 'text-[10px]' : 'text-xs',
                  )}
                >
                  {nutri.label}
                </span>
              </div>
            </div>

            {/* Info Icon — Top Right Corner */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowNutriInfo(true);
              }}
              className="absolute -top-2 -right-2 bg-white text-theme-text w-6 h-6 rounded-full flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-transform z-10"
              aria-label="Learn about Nutri-Score"
              title="What does this mean?"
            >
              <Info
                className={cn('w-4 h-4', !compact && 'w-5 h-5')}
                aria-hidden="true"
              />
            </button>
          </div>
        )}

        {/* NOVA Badge */}
        {hasValidNova && (
          <div className="relative">
            <div
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-2xl bg-white shadow-lg',
                compact && 'px-3 py-2 rounded-xl',
              )}
              role="img"
              aria-label={`Processing level: ${getNovaLabel(novaGroup)}`}
            >
              <span
                className={cn(
                  'leading-none',
                  compact ? 'text-2xl' : 'text-5xl',
                )}
                aria-hidden="true"
              >
                {getNovaEmoji(novaGroup)}
              </span>
              <div className="flex flex-col items-start gap-0">
                <span
                  className={cn(
                    'font-black uppercase text-theme-text/80',
                    compact ? 'text-[10px]' : 'text-xs',
                  )}
                >
                  Processing
                </span>
                <span
                  className={cn(
                    'font-bold text-theme-text',
                    compact ? 'text-xs' : 'text-sm',
                  )}
                >
                  {getNovaLabel(novaGroup)}
                </span>
              </div>
            </div>

            {/* Info Icon — Top Right Corner */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowNovaInfo(true);
              }}
              className="absolute -top-2 -right-2 bg-white text-theme-text w-6 h-6 rounded-full flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-transform z-10"
              aria-label="Learn about processing levels"
              title="What does this mean?"
            >
              <Info
                className={cn('w-4 h-4', !compact && 'w-5 h-5')}
                aria-hidden="true"
              />
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
