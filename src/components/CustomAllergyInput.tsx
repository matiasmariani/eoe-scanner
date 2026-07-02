'use client';

import React, { useState } from 'react';
import { Plus, Crown, Loader } from 'lucide-react';
import { ALLERGY_OPTIONS, CUSTOM_ALLERGEN_EMOJIS } from '@/lib/constants';
import { useIsPremium } from '@/lib/premium';
// import { useTaxonomySuggestions } from '@/hooks/useTaxonomySuggestions'; // TODO: implement this feature
import { TaxonomySuggestion } from '@/hooks/useTaxonomySuggestions';
import { PremiumGate } from '@/components/PremiumGate';
import { cn } from '@/lib/utils';

interface CustomAllergyInputProps {
  onAdd: (value: string, emoji: string) => void;
}

export function CustomAllergyInput({ onAdd }: CustomAllergyInputProps) {
  const [value, setValue] = useState('');
  const [emoji, setEmoji] = useState('⚠️');
  const [showGate, setShowGate] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const isPremium = useIsPremium();

  // TODO: const { suggestions, isLoading } = useTaxonomySuggestions(value, !isBuiltIn);
  const suggestions: TaxonomySuggestion[] = []; // Placeholder until feature is implemented
  const isLoading = false;

  const handleAdd = (text: string = value) => {
    if (!text.trim()) return;
    onAdd(text.trim(), emoji);
    setValue('');
    setEmoji('⚠️');
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setValue(suggestion);
    setShowSuggestions(false);
  };

  if (!isPremium) {
    return (
      <>
        <button
          onClick={() => setShowGate(true)}
          className="w-full flex items-center justify-center gap-2 bg-theme-primary p-4 rounded-2xl text-theme-text shadow-lg hover:shadow-[0_8px_16px_rgba(0,0,0,0.1)] transition-all font-display font-black text-base uppercase tracking-tight"
          aria-label="Unlock custom allergens with Premium"
        >
          <Crown className="w-5 h-5" />
          Custom Allergens
          <span className="flex items-center gap-1 px-2 py-0.5 bg-theme-accent text-white text-[10px] rounded-full shadow-lg">
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
    <div className="bg-white p-6 rounded-3xl shadow-lg space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-theme-text font-display font-black text-lg uppercase tracking-tight flex items-center gap-2">
          Custom Allergen
          <span className="flex items-center gap-1 px-2 py-0.5 bg-theme-accent text-white text-[10px] rounded-full shadow-lg">
            <Crown className="w-3 h-3" />
            PREMIUM
          </span>
        </span>
      </div>

      {/* Input — top */}
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setShowSuggestions(e.target.value.length >= 2);
          }}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          onFocus={() => value.length >= 2 && setShowSuggestions(true)}
          placeholder="e.g. Szechuan Pepper or Cider"
          className="w-full bg-theme-bg border-0 p-4 rounded-2xl font-body font-bold text-theme-text placeholder:text-theme-text/40 focus:outline-none focus:ring-4 focus:ring-theme-accent shadow-lg"
          aria-label="Enter custom allergen name"
          aria-autocomplete="list"
        />

        {/* Suggestions Dropdown */}
        {showSuggestions && value.length >= 2 && (
          <div
            className="absolute z-10 top-full mt-2 left-0 right-0 bg-white rounded-2xl shadow-lg overflow-hidden"
            role="listbox"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2 px-4 py-3 text-theme-text">
                <Loader className="w-4 h-4 animate-spin" aria-hidden="true" />
                <span className="text-sm font-bold">Searching...</span>
              </div>
            ) : suggestions.length > 0 ? (
              <ul className="divide-y divide-theme-border/20">
                {suggestions.map((s, idx) => (
                  <li key={s.id || idx}>
                    <button
                      onClick={() => handleSuggestionClick(s.name)}
                      className="w-full text-left px-4 py-3 font-body font-bold text-theme-text hover:bg-theme-primary/10 active:bg-theme-primary/20 transition-colors"
                      role="option"
                      aria-selected={value === s.name}
                    >
                      {s.name}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-4 py-3 text-sm font-body font-bold text-theme-text/60">
                No suggestions found
              </div>
            )}
          </div>
        )}
      </div>

      {/* Emoji picker — middle */}
      <div className="overflow-x-auto p-4 bg-theme-bg rounded-2xl shadow-lg">
        <div className="flex gap-2 pb-1">
          {[
            ...CUSTOM_ALLERGEN_EMOJIS,
            ...ALLERGY_OPTIONS.map((o) => o.emoji),
          ].map((e) => (
            <button
              key={e}
              onClick={() => setEmoji(e)}
              className={cn(
                'text-2xl p-2 rounded-lg transition-all shrink-0 active:scale-95 shadow-lg',
                emoji === e
                  ? 'bg-theme-accent scale-110'
                  : 'bg-white hover:bg-theme-primary/10',
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
        onClick={() => handleAdd()}
        disabled={!value.trim()}
        className="w-full flex items-center justify-center gap-2 bg-theme-primary p-4 rounded-2xl font-display font-black text-lg text-theme-text shadow-lg hover:shadow-[0_8px_16px_rgba(0,0,0,0.1)] active:scale-95 transition-all disabled:opacity-40"
      >
        <Plus className="w-5 h-5" aria-hidden="true" />
        Add {emoji}
      </button>

      <p className="text-xs font-body font-bold text-theme-text/50 leading-tight">
        Suggestions appear as you type. Enter the allergen exactly as it appears
        on the ingredients list.
      </p>
    </div>
  );
}
