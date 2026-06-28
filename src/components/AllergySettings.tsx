'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { useAllergySettings } from '@/contexts/AllergyContext';
import { cn } from '@/lib/utils';


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

interface AllergySettingsProps {
  onClose: () => void;
}

export function AllergySettings({ onClose }: AllergySettingsProps) {
  const { allergies, toggleAllergy, clearAllergies } = useAllergySettings();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="allergy-settings-title"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-[3rem] border-8 shadow-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto"
        role="document"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 id="allergy-settings-title" className="text-3xl font-black text-gray-900">
            Allergy Settings
          </h2>
          <button
            onClick={clearAllergies}
            className="text-sm text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label="Clear all allergies"
          >
            Clear All
          </button>
        </div>

        <p className="text-gray-600 mb-6">
          Select your allergies. We'll check products against this list.
        </p>

        <div className="grid grid-cols-3 gap-3" role="group" aria-label="Allergy options">
          {ALLERGY_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => toggleAllergy(option.value)}
              className={cn(
                "p-4 rounded-2xl border-4 transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                allergies.includes(option.value)
                  ? "bg-blue-500 text-white border-blue-500"
                  : "bg-gray-100 text-gray-700 border-gray-200 hover:border-blue-300"
              )}
              aria-pressed={allergies.includes(option.value)}
              aria-label={`${option.label} ${allergies.includes(option.value) ? 'selected' : 'not selected'}`}
            >
              <div className="text-2xl mb-2" aria-hidden="true">{option.icon}</div>
              <div className="text-sm font-bold" aria-hidden="true">{option.label}</div>
              {allergies.includes(option.value) && (
                <Check className="w-5 h-5 mt-2" aria-hidden="true" />
              )}
            </button>
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-full mt-6 bg-blue-500 text-white py-4 rounded-full text-xl font-black hover:bg-blue-600 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label="Save and close allergy settings"
        >
          Save & Close
        </button>
      </motion.div>
    </div>
  );
}