import { useState, useEffect } from 'react';
import { logError } from '@/lib/errorHandling';

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    // Load favorites from localStorage on mount
    const stored = localStorage.getItem('allergy-scout-favorites');
    if (stored) {
      try {
        setFavorites(JSON.parse(stored));
      } catch (error) {
        logError('useFavorites', error);
      }
    }
  }, []);

  const toggleFavorite = (barcode: string) => {
    setFavorites(prev => {
      const newFavorites = prev.includes(barcode)
        ? prev.filter(code => code !== barcode)
        : [...prev, barcode];

      // Save to localStorage
      localStorage.setItem('allergy-scout-favorites', JSON.stringify(newFavorites));
      return newFavorites;
    });
  };

  const isFavorite = (barcode: string) => favorites.includes(barcode);

  const removeFavorite = (barcode: string) => {
    setFavorites(prev => {
      const newFavorites = prev.filter(code => code !== barcode);
      localStorage.setItem('allergy-scout-favorites', JSON.stringify(newFavorites));
      return newFavorites;
    });
  };

  return {
    favorites,
    toggleFavorite,
    isFavorite,
    removeFavorite,
  };
}