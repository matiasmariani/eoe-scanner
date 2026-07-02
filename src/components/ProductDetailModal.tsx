'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { X, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { ProductResult } from '@/lib/open-food-facts';
import { getAllergenDisplay } from '@/lib/allergen-utils';
import { cn } from '@/lib/utils';

interface ProductDetailModalProps {
  product: ProductResult;
  isOpen: boolean;
  onClose: () => void;
}

export function ProductDetailModal({
  product,
  isOpen,
  onClose,
}: ProductDetailModalProps) {
  if (!isOpen) return null;

  const getNutriscoreColor = (grade?: string) => {
    switch (grade?.toUpperCase()) {
      case 'A':
        return 'bg-green-500 text-white';
      case 'B':
        return 'bg-yellow-400 text-black';
      case 'C':
        return 'bg-orange-400 text-black';
      case 'D':
        return 'bg-orange-600 text-white';
      case 'E':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-400 text-white';
    }
  };

  const getNovaGroupLabel = (group?: number) => {
    switch (group) {
      case 1:
        return 'Unprocessed';
      case 2:
        return 'Minimally Processed';
      case 3:
        return 'Processed';
      case 4:
        return 'Ultra-Processed';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm">
      <div className="flex min-h-full items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-md bg-theme-bg shadow-lg rounded-3xl p-6 my-8"
        >
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-3xl font-display font-black text-theme-text flex-1 pr-4">
              {product.name}
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-theme-text/60 hover:text-theme-text transition-colors"
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Image Section */}
          {product.image_url && (
            <div className="mb-6 rounded-2xl overflow-hidden shadow-lg bg-white">
              <Image
                src={product.image_url}
                alt={product.name}
                width={320}
                height={240}
                className="w-full h-48 object-cover"
              />
            </div>
          )}

          {/* Basic Info */}
          <div className="space-y-3 mb-6">
            {product.brand && (
              <div>
                <p className="text-sm font-black uppercase text-theme-text mb-2">
                  Brand
                </p>
                <p className="text-lg font-bold text-theme-text">
                  {product.brand}
                </p>
              </div>
            )}
            {product.barcode && (
              <div>
                <p className="text-sm font-black uppercase text-theme-text mb-2">
                  Barcode
                </p>
                <p className="text-base font-mono text-theme-text/80">
                  {product.barcode}
                </p>
              </div>
            )}
          </div>

          {/* Safety Status Card */}
          <div
            className={cn(
              'mb-6 p-4 rounded-2xl shadow-lg flex items-start gap-3',
              product.isSafe
                ? 'bg-green-100 border-2 border-green-300'
                : 'bg-red-100 border-2 border-red-300',
            )}
          >
            {product.isSafe ? (
              <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-black text-lg text-theme-text">
                {product.isSafe ? 'Safe to Eat' : 'Not Safe'}
              </p>
              {!product.isSafe && product.allergensFound.length > 0 && (
                <p className="text-sm font-bold text-theme-text/80 mt-1">
                  Contains:{' '}
                  {product.allergensFound
                    .map((a) => getAllergenDisplay(a).label)
                    .join(', ')}
                </p>
              )}
            </div>
          </div>

          {/* Allergens Section - Product's Listed Allergens */}
          {product.allergensTags && product.allergensTags.length > 0 && (
            <div className="mb-6">
              <p className="text-sm font-black uppercase text-theme-text mb-2">
                Product Allergens
              </p>
              <div className="flex flex-wrap gap-2">
                {product.allergensTags.map((allergen) => (
                  <span
                    key={allergen}
                    className="px-3 py-1 bg-yellow-100 text-yellow-800 font-bold text-sm rounded-full"
                  >
                    {allergen.replace('en:', '')}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Allergens Found - Matched to User's Allergies */}
          {product.allergensFound && product.allergensFound.length > 0 && (
            <div className="mb-6">
              <p className="text-sm font-black uppercase text-theme-text mb-2">
                ⚠️ Contains Your Allergens
              </p>
              <div className="flex flex-wrap gap-2">
                {product.allergensFound.map((allergen) => {
                  const { emoji, label } = getAllergenDisplay(allergen);
                  return (
                    <span
                      key={allergen}
                      className="px-3 py-1 bg-red-100 text-red-700 font-bold text-sm rounded-full"
                    >
                      {emoji} {label}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Nutrition Scores */}
          {(() => {
            const nutriscoreGrade =
              product.nutriscore_grade &&
              product.nutriscore_grade.trim().toLowerCase() !== 'not available'
                ? product.nutriscore_grade
                : undefined;
            const hasNova = product.nova_group !== undefined;

            if (!nutriscoreGrade && !hasNova) return null;

            return (
              <div className="mb-6 space-y-3">
                <p className="text-sm font-black uppercase text-theme-text mb-2">
                  Nutrition Info
                </p>
                <div className="grid grid-cols-2 gap-4">
                  {nutriscoreGrade && (
                    <div className="flex flex-col items-center p-4 bg-white rounded-3xl shadow-lg">
                      <p className="text-xs font-bold text-theme-text/70 mb-3">
                        Nutri-Score
                      </p>
                      <div
                        className={cn(
                          'w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg',
                          getNutriscoreColor(nutriscoreGrade),
                        )}
                      >
                        {nutriscoreGrade.toUpperCase()}
                      </div>
                    </div>
                  )}
                  {hasNova && (
                    <div className="flex flex-col items-center p-4 bg-white rounded-3xl shadow-lg">
                      <p className="text-xs font-bold text-theme-text/70 mb-3">
                        Processing
                      </p>
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 text-white rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg">
                        {product.nova_group}
                      </div>
                      <p className="text-xs font-bold text-theme-text/60 text-center mt-3">
                        {getNovaGroupLabel(product.nova_group)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {/* Nutriscore Score */}
          {product.nutriscore_score !== undefined && (
            <div className="mb-6 p-4 bg-theme-primary/10 rounded-2xl">
              <p className="text-sm font-black uppercase text-theme-text mb-2">
                Health Score
              </p>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-3 bg-gray-300 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-red-500"
                    style={{
                      width: `${(product.nutriscore_score / 100) * 100}%`,
                    }}
                  />
                </div>
                <p className="font-bold text-lg text-theme-text">
                  {product.nutriscore_score}/100
                </p>
              </div>
            </div>
          )}

          {/* Ingredients */}
          {product.ingredients && (
            <div className="mb-6">
              <p className="text-sm font-black uppercase text-theme-text mb-2">
                Ingredients
              </p>
              <p className="text-sm font-bold text-theme-text/80 leading-relaxed p-3 bg-white rounded-2xl shadow-lg">
                {product.ingredients}
              </p>
            </div>
          )}

          {/* Vegan/Vegetarian Status from Ingredients */}
          {product.ingredientsArray &&
            product.ingredientsArray.length > 0 &&
            (() => {
              const hasVegetarianInfo = product.ingredientsArray.some(
                (ing) => ing.vegetarian,
              );
              const hasVeganInfo = product.ingredientsArray.some(
                (ing) => ing.vegan,
              );
              const allVegetarian = product.ingredientsArray.every(
                (ing) => ing.vegetarian === 'yes',
              );
              const allVegan = product.ingredientsArray.every(
                (ing) => ing.vegan === 'yes',
              );
              const hasNonVegetarian = product.ingredientsArray.some(
                (ing) => ing.vegetarian === 'no',
              );
              const hasNonVegan = product.ingredientsArray.some(
                (ing) => ing.vegan === 'no',
              );

              if (!hasVegetarianInfo && !hasVeganInfo) return null;

              return (
                <div className="mb-6">
                  <p className="text-sm font-black uppercase text-theme-text mb-2">
                    Dietary Info
                  </p>
                  <div className="space-y-2">
                    {hasNonVegetarian && (
                      <div className="p-3 bg-orange-100 rounded-2xl">
                        <p className="text-sm font-bold text-orange-800">
                          May contain non-vegetarian ingredients
                        </p>
                      </div>
                    )}
                    {hasNonVegan && (
                      <div className="p-3 bg-orange-100 rounded-2xl">
                        <p className="text-sm font-bold text-orange-800">
                          May contain non-vegan ingredients
                        </p>
                      </div>
                    )}
                    {allVegetarian && hasVegetarianInfo && (
                      <div className="p-3 bg-green-100 rounded-2xl">
                        <p className="text-sm font-bold text-green-800">
                          ✓ Vegetarian
                        </p>
                      </div>
                    )}
                    {allVegan && hasVeganInfo && (
                      <div className="p-3 bg-green-100 rounded-2xl">
                        <p className="text-sm font-bold text-green-800">
                          ✓ Vegan
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

          {/* Close Button */}
          <motion.button
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="w-full py-4 bg-theme-primary text-theme-text font-display font-black rounded-3xl shadow-lg hover:shadow-[0_12px_24px_rgba(0,0,0,0.15)] transition-all"
          >
            Got It!
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
