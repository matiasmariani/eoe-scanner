'use client';

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Planet, MOODS } from 'react-kawaii';
import { Heart, RefreshCcw, X } from 'lucide-react';
import { type GameStats } from '@/hooks/useGameStats';

export type KawaiiMood = (typeof MOODS)[number];

/** Three hearts with a pop-out animation on loss and a shake on the rest. */
export function HeartsBar({ lives, max = 3 }: { lives: number; max?: number }) {
  return (
    <motion.div
      key={`hearts-${lives}`}
      animate={lives < max ? { x: [0, -6, 6, -4, 4, 0] } : {}}
      transition={{ duration: 0.4 }}
      className="flex items-center gap-1"
      role="status"
      aria-label={`${lives} of ${max} hearts left`}
    >
      <AnimatePresence>
        {Array.from({ length: max }).map((_, i) =>
          i < lives ? (
            <motion.span
              key={i}
              exit={{ scale: 1.6, opacity: 0, y: -12 }}
              transition={{ duration: 0.35 }}
            >
              <Heart
                className="w-7 h-7 fill-redstone-red text-redstone-red"
                aria-hidden="true"
              />
            </motion.span>
          ) : (
            <span key={i}>
              <Heart
                className="w-7 h-7 text-theme-text/20"
                aria-hidden="true"
              />
            </span>
          ),
        )}
      </AnimatePresence>
    </motion.div>
  );
}

const BURST_EMOJIS = ['⭐', '✨', '🎉', '💚', '⭐', '✨', '🎉', '💚'];

/**
 * Celebration burst: 8 emoji radiate out from the center plus a floating
 * "+points" pip. Mount with a changing `key` to replay; parent should wrap
 * in AnimatePresence or simply re-key per correct answer.
 */
export function EmojiBurst({ points }: { points?: number }) {
  // Jittered angles computed once per mount (client-only component).
  const particles = useMemo(
    () =>
      BURST_EMOJIS.map((emoji, i) => {
        const angle =
          (i / BURST_EMOJIS.length) * Math.PI * 2 + Math.random() * 0.5;
        return {
          emoji,
          x: Math.cos(angle) * (80 + Math.random() * 30),
          y: Math.sin(angle) * (80 + Math.random() * 30) - 40,
          rotate: Math.random() * 90 - 45,
        };
      }),
    [],
  );

  return (
    <div
      className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
      aria-hidden="true"
    >
      {particles.map((p, i) => (
        <motion.span
          key={i}
          className="absolute text-3xl"
          initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
          animate={{
            x: p.x,
            y: p.y,
            scale: [0, 1.3, 0.8],
            opacity: [1, 1, 0],
            rotate: p.rotate,
          }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          {p.emoji}
        </motion.span>
      ))}
      {points !== undefined && (
        <motion.div
          className="absolute font-display font-black text-theme-accent text-4xl"
          initial={{ y: 0, opacity: 1, scale: 0.6 }}
          animate={{ y: -60, opacity: 0, scale: 1.2 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          +{points}
        </motion.div>
      )}
    </div>
  );
}

interface GameOverScreenProps {
  title: string;
  score: number;
  bestStreak: number;
  mood: KawaiiMood;
  stats?: GameStats;
  isNewHighScore: boolean;
  onPlayAgain: () => void;
  onClose: () => void;
}

export function GameOverScreen({
  title,
  score,
  bestStreak,
  mood,
  stats,
  isNewHighScore,
  onPlayAgain,
  onClose,
}: GameOverScreenProps) {
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="w-full max-w-md mx-auto flex flex-col items-center gap-5 px-6 py-8 text-center"
    >
      <Planet size={110} mood={mood} color="#79d461" />
      <h2 className="text-3xl font-display font-black text-theme-text">
        {title}
      </h2>

      {isNewHighScore && (
        <motion.div
          initial={{ scale: 0, rotate: -6 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 15 }}
          className="px-5 py-2 bg-theme-accent text-white font-display font-black rounded-full shadow-lg"
        >
          🏆 New High Score!
        </motion.div>
      )}

      <p className="text-6xl font-display font-black text-theme-text">
        {score}
      </p>

      <div className="w-full bg-white rounded-3xl shadow-lg p-4 space-y-1">
        <p className="text-base font-bold text-theme-text">
          Best score: {Math.max(stats?.highScore ?? 0, score)}
        </p>
        <p className="text-base font-bold text-theme-text/70">
          Best streak this round: {bestStreak}
        </p>
      </div>

      <div className="w-full flex flex-col gap-3">
        <button
          onClick={onPlayAgain}
          className="w-full flex items-center justify-center gap-2 py-5 bg-theme-accent text-white font-display font-black text-lg rounded-3xl shadow-lg hover:shadow-xl active:scale-95 transition-all"
        >
          <RefreshCcw className="w-6 h-6" aria-hidden="true" />
          Play Again
        </button>
        <button
          onClick={onClose}
          className="w-full flex items-center justify-center gap-2 py-4 bg-white text-theme-text font-display font-black rounded-3xl shadow-lg hover:shadow-xl active:scale-95 transition-all"
        >
          <X className="w-5 h-5" aria-hidden="true" />
          Close
        </button>
      </div>
    </motion.div>
  );
}

export function GameEmptyState({
  onClose,
  title = 'Scan more snacks to play!',
  message = 'You need at least 4 snacks in your history. Go scan or browse some yummy things first.',
}: {
  onClose: () => void;
  title?: string;
  message?: string;
}) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 px-8 text-center">
      <Planet size={100} mood="sad" color="#79d461" />
      <h2 className="text-3xl font-display font-black text-theme-text">
        {title}
      </h2>
      <p className="text-lg font-bold text-theme-text/60">{message}</p>
      <button
        onClick={onClose}
        className="mt-2 px-8 py-4 bg-theme-primary text-theme-text font-display font-black rounded-3xl shadow-lg hover:shadow-xl active:scale-95 transition-all"
      >
        Got it!
      </button>
    </div>
  );
}
