'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAllergySettings } from '@/contexts/AllergyContext';
import { ALLERGY_OPTIONS } from '@/lib/constants';

export function SelectedAllergiesHeader() {
  const { allergies } = useAllergySettings();

  if (allergies.length === 0) return null;

  return (
    <div className="w-full px-4 py-6 flex flex-col items-center justify-center">
      <h2 className="text-3xl font-display font-black text-theme-accent mb-4">
        Your Allergies
      </h2>
      <ul className="flex flex-wrap justify-center gap-3 max-w-md" role="list">
        <AnimatePresence mode="popLayout">
          {allergies.map((allergy) => {
            const option = ALLERGY_OPTIONS.find((o) => o.value === allergy);
            if (!option) return null;
            return (
              <motion.li
                key={allergy}
                layout
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="flex items-center justify-center bg-theme-text border-4 border-theme-border p-3 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              >
                <span className="text-3xl" aria-label={option.label}>
                  {option.emoji}
                </span>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>
    </div>
  );
}
