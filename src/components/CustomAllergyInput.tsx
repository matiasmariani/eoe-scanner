'use client';

import React, { useState } from 'react';
import { Plus, Crown } from 'lucide-react';
import { ALLERGY_OPTIONS, CUSTOM_ALLERGEN_EMOJIS } from '@/lib/constants';
import { useIsPremium } from '@/lib/premium';
import { PremiumGate } from '@/components/PremiumGate';
import { cn } from '@/lib/utils';

interface CustomAllergyInputProps {
  onAdd: (value: string, emoji: string) => void;
}

export function CustomAllergyInput({ onAdd }: CustomAllergyInputProps) {
  const [value, setValue] = useState('');
  const [emoji, setEmoji] = useState('⚠️');
  const [showGate, setShowGate] = useState(false);
  const isPremium = useIsPremium();

  const handleAdd = () => {
    if (!value.trim()) return;
    onAdd(value.trim(), emoji);
    setValue('');
    setEmoji('⚠️');
  };

  if (!isPremium) {
    return (
      <>
        <button
          onClick={() => setShowGate(true)}
          className="w-full flex items-center justify-center gap-2 bg-theme-bg border-4 border-theme-border p-4 rounded-[2rem] shadow-voxel text-theme-text/60 hover:-translate-y-[1px] transition-all"
          aria-label="Unlock custom allergens with Premium"
        >
          <Crown className="w-5 h-5 text-theme-accent" />
          <span className="font-display font-black text-base uppercase tracking-tight">
            Custom Allergens
          </span>
          <span className="flex items-center gap-1 px-2 py-0.5 bg-theme-accent text-theme-border text-[10px] rounded-full border-2 border-theme-border shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
            PREMIUM
          </span>
        </button>
        {showGate && (
          <PremiumGate
            feature="Custom Allergens"
            onClose={() => setShowGate(false)}
          />
        )}
      </>
    );
  }

  return (
    <div className="bg-theme-bg border-4 border-theme-border p-6 rounded-[2.5rem] shadow-voxel space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-theme-text font-display font-black text-lg uppercase tracking-tight flex items-center gap-2">
          Custom Allergen
          <span className="flex items-center gap-1 px-2 py-0.5 bg-theme-accent text-theme-border text-[10px] rounded-full border-2 border-theme-border shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
            <Crown className="w-3 h-3" />
            PREMIUM
          </span>
        </span>
      </div>

      {/* Input — top */}
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        placeholder="e.g. Szechuan Pepper"
        className="w-full bg-theme-bg border-2 border-theme-border p-4 rounded-2xl font-body font-bold text-theme-text placeholder:text-theme-text/40 focus:outline-none focus:ring-4 focus:ring-theme-accent"
      />

      {/* Emoji picker — middle */}
      <div className="overflow-x-auto p-3 bg-theme-text border-2 border-theme-border rounded-2xl">
        <div className="flex gap-1.5 pb-0.5">
          {[
            ...CUSTOM_ALLERGEN_EMOJIS,
            ...ALLERGY_OPTIONS.map((o) => o.emoji),
          ].map((e) => (
            <button
              key={e}
              onClick={() => setEmoji(e)}
              className={cn(
                'text-2xl p-1.5 rounded-lg transition-all shrink-0 active:scale-95',
                emoji === e
                  ? 'bg-theme-accent scale-110 shadow-[1px_1px_0px_0px_rgba(0,0,0,0.4)]'
                  : 'hover:bg-theme-bg/20',
              )}
              aria-label={e}
              aria-pressed={emoji === e}
            >
              {e}
            </button>
          ))}
        </div>
      </div>

      {/* Add button — bottom */}
      <button
        onClick={handleAdd}
        disabled={!value.trim()}
        className="w-full flex items-center justify-center gap-2 bg-theme-primary border-4 border-theme-border p-4 rounded-2xl font-display font-black text-lg text-theme-border shadow-voxel active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all disabled:opacity-40"
      >
        <Plus className="w-5 h-5" aria-hidden="true" />
        Add {emoji}
      </button>

      <p className="text-xs font-body font-bold text-theme-text/50 leading-tight">
        Enter the allergen exactly as it appears on the ingredients list.
      </p>
    </div>
  );
}
