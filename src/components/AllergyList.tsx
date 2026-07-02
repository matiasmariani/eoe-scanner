'use client';

import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { Allergy, ALLERGY_OPTIONS } from '@/lib/constants';
import { useIsPremium } from '@/lib/premium';
import { PremiumGate } from '@/components/PremiumGate';
import { cn } from '@/lib/utils';

interface AllergyListProps {
  allergies: Allergy[];
  toggleAllergy: (allergy: Allergy) => void;
}

export function AllergyList({ allergies, toggleAllergy }: AllergyListProps) {
  const isPremium = useIsPremium();
  const [showGate, setShowGate] = useState(false);

  const handleToggle = (allergy: Allergy) => {
    const isSelected = allergies.includes(allergy);
    if (!isSelected && !isPremium && allergies.length >= 3) {
      setShowGate(true);
      return;
    }
    toggleAllergy(allergy);
  };

  return (
    <>
      <div
        className="grid grid-cols-2 gap-6"
        role="group"
        aria-label="Allergy options"
      >
        {ALLERGY_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => handleToggle(option.value)}
            className={cn(
              'flex flex-col items-center justify-center gap-2 p-8 border-4 transition-all active:translate-x-[2px] active:translate-y-[2px] focus:ring-4 focus:ring-theme-accent rounded-[2.5rem] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-[1px] relative',
              allergies.includes(option.value)
                ? 'bg-theme-accent border-theme-border text-white'
                : 'bg-theme-bg border-theme-border/30 text-theme-text hover:border-theme-primary shadow-[0_4px_0_0_rgba(0,0,0,0.1)]',
            )}
            aria-pressed={allergies.includes(option.value)}
          >
            <span className="text-5xl block animate-pop">{option.emoji}</span>
            <span className="text-xs font-black uppercase tracking-widest text-center">
              {option.label}
            </span>
            {allergies.includes(option.value) && (
              <Check
                className="w-6 h-6 absolute top-2 right-2 text-theme-bg"
                aria-hidden="true"
              />
            )}
          </button>
        ))}
      </div>
      {showGate && (
        <PremiumGate
          feature="More than 3 allergens"
          onClose={() => setShowGate(false)}
        />
      )}
    </>
  );
}
