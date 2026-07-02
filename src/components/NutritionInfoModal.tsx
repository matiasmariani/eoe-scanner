'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface NutritionInfoModalProps {
  type: 'nutriscore' | 'nova';
  isOpen: boolean;
  onClose: () => void;
}

export function NutritionInfoModal({
  type,
  isOpen,
  onClose,
}: NutritionInfoModalProps) {
  if (!isOpen) return null;

  const nutriscoreContent = {
    title: "What's a Nutri-Score?",
    emoji: '📊',
    grades: [
      {
        grade: 'A',
        color: 'bg-green-500',
        description: 'Super healthy! Eat lots of these. 🥗🥬',
      },
      {
        grade: 'B',
        color: 'bg-yellow-400',
        description: 'Pretty healthy. Great choice! 🍎',
      },
      {
        grade: 'C',
        color: 'bg-orange-400',
        description: 'Okay sometimes. Balance it with healthier foods. 🥕',
      },
      {
        grade: 'D',
        color: 'bg-red-500',
        description: 'Eat this just once in a while. 🍕',
      },
      {
        grade: 'E',
        color: 'bg-red-800',
        description: 'This is a treat food! Enjoy rarely. 🍭',
      },
    ],
  };

  const novaContent = {
    title: 'How Processed Is This?',
    emoji: '🏭',
    levels: [
      {
        level: 1,
        label: 'Unprocessed',
        color: 'bg-green-500',
        description: 'Natural! Like an apple or carrot from the farm. 🌱',
      },
      {
        level: 2,
        label: 'Processed',
        color: 'bg-yellow-400',
        description:
          'Gently made safer. Like pasteurized milk or canned beans. 🥛',
      },
      {
        level: 3,
        label: 'Ultra-Processed',
        color: 'bg-orange-400',
        description:
          'Made in a factory with lots of stuff added. Like chips or sodas. 🍟',
      },
    ],
  };

  const isNutriscore = type === 'nutriscore';
  const content = isNutriscore ? nutriscoreContent : novaContent;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-theme-bg border-4 border-theme-border shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-3xl w-full max-w-md max-h-[90vh] flex flex-col p-6 space-y-4 overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onKeyDown={(e) => e.key === 'Escape' && onClose()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-4xl" aria-hidden="true">
              {content.emoji}
            </span>
            <h2
              id="modal-title"
              className="text-2xl font-display font-black text-theme-text"
            >
              {content.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center bg-theme-text text-theme-bg rounded-full font-black text-lg hover:scale-110 transition-transform active:scale-95"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        {isNutriscore ? (
          // Nutri-Score Grades
          <div className="space-y-3">
            <p className="text-sm font-body font-bold text-theme-text/80">
              Nutri-Score shows how healthy a food is:
            </p>
            {nutriscoreContent.grades.map((item) => (
              <div
                key={item.grade}
                className="flex items-center gap-3 p-3 bg-theme-bg rounded-2xl border-2 border-theme-border/20"
              >
                <div
                  className={cn(
                    'w-12 h-12 rounded-2xl flex items-center justify-center border-2 border-theme-border shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]',
                    item.color,
                  )}
                >
                  <span className="text-2xl font-black text-white">
                    {item.grade}
                  </span>
                </div>
                <p className="text-sm font-body font-bold text-theme-text">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        ) : (
          // NOVA Processing Levels
          <div className="space-y-3">
            <p className="text-sm font-body font-bold text-theme-text/80">
              NOVA shows how much a food was changed in a factory:
            </p>
            {novaContent.levels.map((item) => (
              <div
                key={item.level}
                className="flex items-center gap-3 p-3 bg-theme-bg rounded-2xl border-2 border-theme-border/20"
              >
                <div
                  className={cn(
                    'w-12 h-12 rounded-2xl flex items-center justify-center border-2 border-theme-border shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]',
                    item.color,
                  )}
                >
                  <span className="text-xl font-black text-white">
                    {item.level}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-black uppercase text-theme-text/70">
                    {item.label}
                  </p>
                  <p className="text-sm font-body font-bold text-theme-text">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full py-3 mt-4 bg-theme-primary border-4 border-theme-border rounded-2xl font-display font-black text-lg text-theme-border shadow-voxel active:shadow-none active:translate-y-[2px] transition-all"
        >
          Got it!
        </button>
      </motion.div>
    </motion.div>
  );
}
