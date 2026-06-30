import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { useAllergySettings } from '@/contexts/AllergyContext';
import { ALLERGY_OPTIONS } from '@/lib/constants';
import { cn } from '@/lib/utils';

export function AllergySettings({ onClose }: { onClose: () => void }) {
  const { allergies, toggleAllergy, clearAllergies } = useAllergySettings();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="allergy-settings-title"
    >
      <motion.div
        initial={{ opacity: 1, scale: 0.9, rotate: -2 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        exit={{ opacity: 0, scale: 0.9, rotate: 2 }}
        className="bg-theme-text border-4 border-theme-border shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-8 max-w-md w-full max-h-[90vh] overflow-y-auto rounded-[3rem]"
        role="document"
      >
        <div className="flex items-center justify-between mb-8">
          <h2
            id="allergy-settings-title"
            className="text-4xl font-display font-black text-theme-bg leading-tight uppercase tracking-tighter"
          >
            My Allergies
          </h2>
          <button
            onClick={clearAllergies}
            className="bg-theme-bg border-4 border-theme-border px-6 py-2 rounded-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-[1px] active:shadow-none transition-all"
            aria-label="Reset all allergies"
          >
            <span className="text-xs font-black uppercase text-redstone-red">
              RESET
            </span>
          </button>
        </div>

        <p className="text-theme-bg/80 font-body font-bold mb-8 leading-relaxed text-xl px-2 border-l-4 border-theme-accent pl-4">
          Pick the special food you need to watch out for!
        </p>

        <div
          className="grid grid-cols-2 gap-6 mb-10"
          role="group"
          aria-label="Allergy options"
        >
          {ALLERGY_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => toggleAllergy(option.value)}
              className={cn(
                'flex flex-col items-center justify-center gap-2 p-8 border-4 transition-all active:translate-x-[2px] active:translate-y-[2px] focus:outline-none rounded-[2.5rem] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-[1px]',
                allergies.includes(option.value)
                  ? 'bg-theme-accent border-theme-border text-theme-border'
                  : 'bg-theme-bg border-theme-border/30 text-theme-text hover:border-theme-primary shadow-[0_4px_0_0_rgba(0,0,0,0.1)]',
              )}
              aria-pressed={allergies.includes(option.value)}
            >
              <span className="text-5xl block animate-pop">{option.icon}</span>
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

        <button
          onClick={onClose}
          className="w-full bg-theme-primary border-4 border-theme-border py-7 rounded-[2.5rem] text-3xl font-display font-black shadow-[0_8px_0_0_rgba(0,170,0,0.5)] active:shadow-none hover:-translate-y-[2px] transition-all"
          aria-label="Save and close allergy settings"
        >
          GOT IT!
        </button>
      </motion.div>
    </div>
  );
}
