import React from 'react';
import { motion } from 'framer-motion';
import { Check, X, AlertCircle, CheckCircle2, Heart, Trash2, Settings } from 'lucide-react'; // Restore all needed icons
import { useAllergySettings } from '@/contexts/AllergyContext';
import { cn } from '@/lib/utils';
import { logError } from '@/lib/errorHandling';

export type Allergy = 'milk' | 'eggs' | 'peanuts' | 'tree nuts' | 'wheat' | 'soy' | 'fish' | 'crustacean shellfish' | 'sesame';

export const ALLERGY_OPTIONS: { value: Allergy; label: string; icon: string }[] = [
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

// Exported as a named export to match page.tsx expectations
export function AllergySettings({ onClose }: { onClose: () => void }) {
  const { allergies, toggleAllergy, clearAllergies } = useAllergySettings();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="allergy-settings-title"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        exit={{ opacity: 0, scale: 0.9, rotate: 2 }}
        className="bg-paper-cream rounded-[3rem] border-8 border-detective-blue shadow-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto wobbly-border-lg"
        role="document"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 id="allergy-settings-title" className="text-3xl font-display font-black text-ink-navy">
            Allergies
          </h2>
          <button
            onClick={clearAllergies}
            className="text-sm font-bold text-watermelon-red hover:scale-110 transition-transform"
            aria-label="Clear all allergies"
          >
            Clear All
          </button>
        </div>

        <p className="text-ink-navy/70 font-body font-bold mb-6">
          Pick the food clues to watch out for!
        </p>

        <div className="grid grid-cols-3 gap-4 mb-8" role="group" aria-label="Allergy options">
          {ALLERGY_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => toggleAllergy(option.value)}
              className={cn(
                "flex flex-col items-center justify-center gap-2 p-4 wobbly-border transition-all active:scale-90 focus:outline-none",
                allergies.includes(option.value)
                  ? "bg-sunshine-yellow border-4 border-sunshine-yellow text-ink-navy shadow-[0_4px_0_0_rgba(253,224,71,1)]"
                  : "bg-white border-4 border-gray-100 text-gray-400 shadow-[0_4px_0_0_rgba(0,0,0,0.05)] hover:border-sky-200"
              )}
              aria-pressed={allergies.includes(option.value)}
            >
              <span className="text-3xl" aria-hidden="true">{option.icon}</span>
              <span className="text-xs font-black uppercase tracking-tighter text-center" aria-hidden="true">{option.label}</span>
              {allergies.includes(option.value) && (
                <Check className="w-4 h-4 absolute top-1 right-1 text-detective-blue" aria-hidden="true" />
              )}
            </button>
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-full bg-detective-blue text-white py-4 rounded-full text-2xl font-display font-black shadow-[0_6px_0_0_rgba(30,58,138,0.3)] active:shadow-none active:translate-y-1 transition-all"
          aria-label="Save and close allergy settings"
        >
          Got It!
        </button>
      </motion.div>
    </div>
  );
}
