'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { logError } from '@/lib/errorHandling';
import { checkAllergens } from '@/lib/allergen-utils';
import type { Allergy } from '@/lib/constants';
import { dbService, AllergySettings } from '@/lib/db';

export type { Allergy };

interface AllergyContextType {
  allergies: Allergy[];
  toggleAllergy: (allergy: Allergy) => void;
  /**
   * Check if a single allergen string matches any of the user's allergies.
   * Returns true if the allergen is in the user's allergy list.
   */
  isAllergicTo: (allergen: string) => boolean;
  /**
   * Check if an ingredient list contains any allergens the user is allergic to.
   * Useful for checking full ingredient strings from product data.
   */
  isAllergicToText: (text: string) => boolean;
  clearAllergies: () => void;
}

const AllergyContext = createContext<AllergyContextType | undefined>(undefined);

export function AllergyProvider({ children }: { children: ReactNode }) {
  const [allergies, setAllergies] = useState<Allergy[]>([]);

  // Load from IndexedDB on mount (with localStorage migration)
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const storedSettings = await dbService.getSettings();

        if (storedSettings && storedSettings.allergies) {
          setAllergies(storedSettings.allergies);
        } else {
          // Migration from localStorage
          const legacy = localStorage.getItem('allergy-scout-allergies');
          if (legacy) {
            const parsed = JSON.parse(legacy);
            if (Array.isArray(parsed)) {
              await dbService.saveSettings({
                id: 'current',
                allergies: parsed,
              });
              setAllergies(parsed as Allergy[]);
              // Clear legacy to avoid re-migration
              localStorage.removeItem('allergy-scout-allergies');
            }
          }
        }
      } catch (error) {
        logError('AllergyContext-load', error);
      }
    };
    loadSettings();
  }, []);

  const toggleAllergy = async (allergy: Allergy) => {
    setAllergies((prev) => {
      const nextAllergies = prev.includes(allergy)
        ? prev.filter((item) => item !== allergy)
        : [...prev, allergy];

      // Persist to IndexedDB
      dbService
        .saveSettings({ id: 'current', allergies: nextAllergies })
        .catch((err) => logError('AllergyContext-save', err));

      return nextAllergies;
    });
  };

  const isAllergicTo = (allergen: string): boolean => {
    return checkAllergens(allergen, allergies).length > 0;
  };

  const isAllergicToText = (text: string): boolean => {
    // Split text by common allergen separators and check each part
    const parts = text.split(/[,;\/]/).map((p) => p.trim());
    return parts.some((part) => isAllergicTo(part));
  };

  const clearAllergies = async () => {
    setAllergies([]);
    await dbService.clearSettings();
  };

  return (
    <AllergyContext.Provider
      value={{
        allergies,
        toggleAllergy,
        isAllergicTo,
        isAllergicToText,
        clearAllergies,
      }}
    >
      {children}
    </AllergyContext.Provider>
  );
}

// Custom hook for easier access
export function useAllergySettings() {
  const context = useContext(AllergyContext);
  if (context === undefined) {
    throw new Error(
      'useAllergySettings must be used within an AllergyProvider',
    );
  }
  return context;
}
