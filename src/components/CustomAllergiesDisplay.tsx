'use client';

import React from 'react';
import { X } from 'lucide-react';
import { Allergy } from '@/lib/constants';

interface CustomAllergiesDisplayProps {
  allergies: Allergy[];
  removeAllergy: (allergy: Allergy) => void;
}

export function CustomAllergiesDisplay({
  allergies,
  removeAllergy,
}: CustomAllergiesDisplayProps) {
  const customAllergies = allergies.filter((a) => a.includes(':'));

  if (customAllergies.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-3 mt-6">
      {customAllergies.map((allergy) => {
        const [emoji, value] = allergy.split(':');
        return (
          <button
            key={allergy}
            onClick={() => removeAllergy(allergy)}
            className="flex items-center gap-2 px-4 py-2 bg-theme-bg border-2 border-theme-border rounded-2xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] transition-all"
          >
            <span className="text-lg">{emoji}</span>
            <span className="text-xs font-black uppercase">{value}</span>
            <X className="w-3 h-3 text-redstone-red" />
          </button>
        );
      })}
    </div>
  );
}
