'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { logError } from '@/lib/errorHandling';

export type Allergy =
  | 'milk'
  | 'eggs'
  | 'peanuts'
  | 'tree nuts'
  | 'wheat'
  | 'soy'
  | 'fish'
  | 'crustacean shellfish'
  | 'sesame';

interface AllergyContextType {
  allergies: Allergy[];
  toggleAllergy: (allergy: Allergy) => void;
  isAllergicTo: (allergen: string) => boolean;
  clearAllergies: () => void;
}

const AllergyContext = createContext<AllergyContextType | undefined>(undefined);

export function AllergyProvider({ children }: { children: ReactNode }) {
  const [allergies, setAllergies] = useState<Allergy[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('allergy-scout-allergies');
    if (stored) {
      try {
        setAllergies(JSON.parse(stored));
      } catch (error) {
        logError('AllergyContext', error);
      }
    }
  }, []);

  const toggleAllergy = (allergy: Allergy) => {
    setAllergies(prev => {
      const nextAllergies = prev.includes(allergy)
        ? prev.filter(item => item !== allergy)
        : [...prev, allergy];
      localStorage.setItem('allergy-scout-allergies', JSON.stringify(nextAllergies));
      return nextAllergies;
    });
  };

  const isAllergicTo = (allergen: string): boolean => {
    return allergies.some(allergy => allergy.toLowerCase().includes(allergen.toLowerCase()));
  };

  const clearAllergies = () => {
    setAllergies([]);
    localStorage.removeItem('allergy-scout-allergies');
  };

  return (
    <AllergyContext.Provider
      value={{
        allergies,
        toggleAllergy,
        isAllergicTo,
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
  console.log('test-3 context', context)
  if (context === undefined) {
    throw new Error('useAllergySettings must be used within an AllergyProvider');
  }
  return context;
}