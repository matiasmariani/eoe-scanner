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
      <h2 className="text-3xl font-display font-black text-theme-text mb-4">
        Your Allergies
      </h2>
      <ul className="flex flex-wrap justify-center gap-3 max-w-md" role="list">
        <AnimatePresence mode="popLayout">
          {allergies.map((allergy) => {
            const isCustom = allergy.includes(':');
            const emoji = isCustom
              ? allergy.slice(0, allergy.indexOf(':'))
              : (ALLERGY_OPTIONS.find((o) => o.value === allergy)?.emoji ??
                null);
            const label = isCustom
              ? allergy.slice(allergy.indexOf(':') + 1)
              : (ALLERGY_OPTIONS.find((o) => o.value === allergy)?.label ??
                allergy);
            if (!emoji) return null;
            return (
              <motion.li
                key={allergy}
                layout
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="flex items-center justify-center bg-white p-3 rounded-2xl shadow-lg"
              >
                <span className="text-3xl" aria-label={label}>
                  {emoji}
                </span>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>
    </div>
  );
}
