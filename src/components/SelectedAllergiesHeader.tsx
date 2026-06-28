'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAllergySettings } from '@/contexts/AllergyContext';

type Allergy = 'milk' | 'eggs' | 'peanuts' | 'tree nuts' | 'wheat' | 'soy' | 'fish' | 'crustacean shellfish' | 'sesame';

const ALLERGY_OPTIONS: { value: Allergy; label: string; icon: string }[] = [
  { value: 'milk', label: 'Milk', icon: '🥛' },
  { value: 'eggs', label: 'Eggs', icon: '🥚' },
  { value: 'peanuts', label: 'Peanuts', icon: '🥜' },
  { value: 'tree nuts', label: 'Tree Nuts', icon: '🥜' },
  { value: 'wheat', label: 'Wheat', icon: '🌾' },
  { value: 'soy', label: 'Soy', icon: '🫘' },
  { value: 'fish', label: 'Fish', icon: '🐟' },
  { value: 'crustacean shellfish', label: 'Crustacean Shellfish', icon: '🦐' },
  { value: 'sesame', label: 'Sesame', icon: '🫒' },
];

export function SelectedAllergiesHeader() {
  const { allergies } = useAllergySettings();

  if (allergies.length === 0) return null;

  return (
    <div className="w-full px-4 py-4 flex flex-row items-start">
      <motion.h2
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="text-2xl font-black text-blue-600 drop-shadow-sm mb-3 flex items-center gap-2"
      >
        Your Allergies
      </motion.h2>

      <div className="flex gap-2 max-w-md">
        <AnimatePresence mode="popLayout">
          {allergies.map((allergy) => {
            const option = ALLERGY_OPTIONS.find((o) => o.value === allergy);
            if (!option) return null;
            return (
              <motion.div
                key={allergy}
                layout
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="flex items-center gap-2 bg-white border-4 border-blue-400 px-4 py-2 rounded-2xl shadow-[4px_4px_0_0_rgba(96,165,252,1)]"
              >
                <span className="text-xl">{option.icon}</span>
                <span className="text-blue-700 font-black text-sm uppercase tracking-wide">
                  {option.label}
                </span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
