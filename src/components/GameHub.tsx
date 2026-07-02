'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Trash2 } from 'lucide-react';
import { SnackScout } from '@/components/SnackScout';
import { SpeakButton } from '@/components/SpeakButton';
import { ConfirmationModal } from '@/components/ConfirmationModal';
import { SortingGame } from '@/components/SortingGame';
import { SnackAttackGame } from '@/components/SnackAttackGame';
import { FeedMascotGame } from '@/components/FeedMascotGame';
import { ComparisonGame } from '@/components/ComparisonGame';
import { useGameStats, type GameId } from '@/hooks/useGameStats';

interface GameHubProps {
  profileId: string;
  onClose: () => void;
}

/**
 * Premium mini-game picker. Opens from the Gamepad button in the top bar;
 * each game returns here via its back button, the header X closes the hub.
 */
export function GameHub({ profileId, onClose }: GameHubProps) {
  const [activeGame, setActiveGame] = useState<GameId | null>(null);
  const [resetTarget, setResetTarget] = useState<GameId | null>(null);

  const sort = useGameStats('sort', profileId);
  const attack = useGameStats('attack', profileId);
  const feed = useGameStats('feed', profileId);
  const compare = useGameStats('compare', profileId);

  if (activeGame === 'sort') {
    return (
      <SortingGame profileId={profileId} onExit={() => setActiveGame(null)} />
    );
  }
  if (activeGame === 'attack') {
    return (
      <SnackAttackGame
        profileId={profileId}
        onExit={() => setActiveGame(null)}
      />
    );
  }
  if (activeGame === 'feed') {
    return (
      <FeedMascotGame
        profileId={profileId}
        onExit={() => setActiveGame(null)}
      />
    );
  }
  if (activeGame === 'compare') {
    return (
      <ComparisonGame
        profileId={profileId}
        onExit={() => setActiveGame(null)}
      />
    );
  }

  const games = [
    {
      id: 'sort' as const,
      emoji: '🃏',
      title: 'Snack Sort',
      desc: 'Swipe snacks into Good or Bad!',
      speak: 'Snack Sort. Swipe snacks into Good or Bad.',
      hook: sort,
    },
    {
      id: 'attack' as const,
      emoji: '🔨',
      title: 'Snack Attack',
      desc: 'Whack the safe snacks — fast!',
      speak: 'Snack Attack. Whack the safe snacks, fast!',
      hook: attack,
    },
    {
      id: 'feed' as const,
      emoji: '🍽️',
      title: 'Feed the Mascot',
      desc: 'Feed Buddy the safe snacks!',
      speak: 'Feed the Mascot. Feed Buddy the safe snacks.',
      hook: feed,
    },
    {
      id: 'compare' as const,
      emoji: '🥗',
      title: 'Which is Healthier?',
      desc: 'Pick the healthier of two snacks!',
      speak: 'Which is Healthier? Pick the healthier of two snacks.',
      hook: compare,
    },
  ];

  const targetGame = games.find((g) => g.id === resetTarget);

  const handleConfirmReset = async () => {
    if (targetGame) await targetGame.hook.resetStats();
    setResetTarget(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-theme-bg via-theme-bg to-theme-bg/95 flex flex-col">
      <header className="w-full max-w-md mx-auto px-6 py-8 flex items-center justify-between gap-4">
        <SnackScout size="sm" />
        <button
          onClick={onClose}
          className="p-3 bg-theme-text rounded-full shadow-lg text-theme-primary hover:bg-theme-primary hover:text-theme-text transition-all active:scale-90"
          aria-label="Close games"
        >
          <X className="w-6 h-6" aria-hidden="true" />
        </button>
      </header>

      <div className="flex-1 w-full max-w-md mx-auto px-6 pb-16 flex flex-col gap-6">
        <div className="text-center">
          <h2 className="text-4xl font-display font-black text-theme-text">
            Let&apos;s Play!
          </h2>
          <p className="text-lg font-bold text-theme-text/60 mt-1">
            Games made from YOUR snacks
          </p>
        </div>

        {games.map((game) => (
          <div key={game.id} className="relative">
            <motion.button
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setActiveGame(game.id)}
              className="w-full bg-white rounded-3xl shadow-lg hover:shadow-xl p-6 pr-24 flex items-center gap-5 text-left transition-all"
            >
              <span className="text-6xl" aria-hidden="true">
                {game.emoji}
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-2xl font-display font-black text-theme-text">
                  {game.title}
                </span>
                <span className="block text-sm font-bold text-theme-text/60 mt-0.5">
                  {game.desc}
                </span>
                <span className="block text-sm font-black text-theme-accent mt-2">
                  Best: {game.hook.stats?.highScore ?? 0}
                </span>
              </span>
            </motion.button>

            {/* Sibling controls (not nested in the card button) */}
            <div className="absolute top-3 right-3 flex items-center gap-2">
              <SpeakButton
                text={game.speak}
                size="sm"
                label={`Hear about ${game.title}`}
              />
              <button
                onClick={() => setResetTarget(game.id)}
                disabled={!game.hook.stats?.gamesPlayed}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-theme-bg text-redstone-red shadow-lg active:scale-90 transition-transform disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label={`Reset ${game.title} scores`}
                title="Reset scores"
              >
                <Trash2 className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <ConfirmationModal
        isOpen={resetTarget !== null}
        onClose={() => setResetTarget(null)}
        onConfirm={handleConfirmReset}
        title="Reset scores?"
        message={`This clears your best score and streak for ${targetGame?.title ?? 'this game'}. This can't be undone.`}
        confirmText="Yes, reset"
        cancelText="No, keep it"
      />
    </div>
  );
}
