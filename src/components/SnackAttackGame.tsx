'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Planet } from 'react-kawaii';
import { ArrowLeft } from 'lucide-react';
import { SnackScout } from '@/components/SnackScout';
import { SpeakButton } from '@/components/SpeakButton';
import {
  HeartsBar,
  EmojiBurst,
  GameOverScreen,
  GameEmptyState,
  type KawaiiMood,
} from '@/components/GameShared';
import { useHistory } from '@/hooks/useHistory';
import { useAllergySettings } from '@/contexts/AllergyContext';
import { useGameStats } from '@/hooks/useGameStats';
import {
  buildDeck,
  streakMultiplier,
  type GameCard,
  MIN_CARDS,
} from '@/lib/game-utils';
import { getAllergenDisplay } from '@/lib/allergen-utils';

const MAX_LIVES = 3;
const LEVEL_SECONDS = 22;
const GRID_CELLS = 9;

// Per-level difficulty. Levels get faster and busier, bottoming/topping out
// around level 8 so it stays hard but playable. `levelIndex` is 0-based.
function levelDifficulty(levelIndex: number) {
  return {
    maxConcurrent: Math.min(2 + Math.floor(levelIndex / 2), 5), // 2 → 5
    baseLifetime: Math.max(1900 - levelIndex * 180, 650), // 1900 → 650ms
    baseInterval: Math.max(1150 - levelIndex * 110, 470), // 1150 → 470ms
    unsafeBias: Math.min(0.3 + levelIndex * 0.06, 0.65), // more decoys later
  };
}

type Phase = 'intro' | 'playing' | 'gameOver';

interface ActiveSnack {
  id: number;
  cell: number;
  card: GameCard;
}

interface Burst {
  id: number;
  cell: number;
  points: number;
}

interface SnackAttackGameProps {
  profileId: string;
  onExit: () => void;
}

export function SnackAttackGame({ profileId, onExit }: SnackAttackGameProps) {
  const { history } = useHistory();
  const { allergies } = useAllergySettings();
  const { stats, recordGame } = useGameStats('attack', profileId);

  const [phase, setPhase] = useState<Phase>('intro');
  const [snacks, setSnacks] = useState<ActiveSnack[]>([]);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [lives, setLives] = useState(MAX_LIVES);
  const [level, setLevel] = useState(1);
  const [timeLeft, setTimeLeft] = useState(LEVEL_SECONDS);
  const [toast, setToast] = useState<string | null>(null);
  const [levelBanner, setLevelBanner] = useState<string | null>(null);
  const [burst, setBurst] = useState<Burst | null>(null);
  const [isNewHighScore, setIsNewHighScore] = useState(false);

  // Timer/loop reads happen in async callbacks, so the values they need live
  // in refs to avoid stale closures. Every timer ID is tracked so a single
  // cleanup() reliably stops the game on unmount, close, or game-over.
  const deckRef = useRef<GameCard[]>([]);
  const snacksRef = useRef<ActiveSnack[]>([]);
  const timeLeftRef = useRef(LEVEL_SECONDS);
  const streakRef = useRef(0);
  const livesRef = useRef(MAX_LIVES);
  const levelRef = useRef(1);
  const phaseRef = useRef<Phase>('intro');
  const snackIdRef = useRef(0);
  const burstIdRef = useRef(0);
  const removalTimers = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());
  const spawnTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdown = useRef<ReturnType<typeof setInterval> | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bannerTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const recordedRef = useRef(false);

  useEffect(() => {
    snacksRef.current = snacks;
  }, [snacks]);
  useEffect(() => {
    streakRef.current = streak;
  }, [streak]);
  useEffect(() => {
    livesRef.current = lives;
  }, [lives]);
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);
  useEffect(() => {
    levelRef.current = level;
  }, [level]);

  const availableCards = useMemo(
    () => (history ? buildDeck(history, allergies) : []),
    [history, allergies],
  );

  const clearAllTimers = () => {
    if (spawnTimer.current) clearTimeout(spawnTimer.current);
    if (countdown.current) clearInterval(countdown.current);
    if (bannerTimer.current) clearTimeout(bannerTimer.current);
    removalTimers.current.forEach((t) => clearTimeout(t));
    removalTimers.current.clear();
    spawnTimer.current = null;
    countdown.current = null;
  };

  // Advance to the next (faster, busier) level, carrying hearts and score.
  const nextLevel = () => {
    removalTimers.current.forEach((t) => clearTimeout(t));
    removalTimers.current.clear();
    setSnacks([]);
    const newLevel = levelRef.current + 1;
    levelRef.current = newLevel;
    setLevel(newLevel);
    timeLeftRef.current = LEVEL_SECONDS;
    setTimeLeft(LEVEL_SECONDS);
    setLevelBanner(`Level ${newLevel}!`);
    if (bannerTimer.current) clearTimeout(bannerTimer.current);
    bannerTimer.current = setTimeout(() => setLevelBanner(null), 1300);
  };

  const endGame = () => {
    clearAllTimers();
    setSnacks([]);
    setPhase('gameOver');
  };

  const spawnOne = () => {
    if (phaseRef.current !== 'playing') return;
    const diff = levelDifficulty(levelRef.current - 1);
    // Within-level ramp shaves a little more off speed as the level's clock
    // runs down, layered on top of the per-level base.
    const progress = Math.min(
      (LEVEL_SECONDS - timeLeftRef.current) / LEVEL_SECONDS,
      1,
    );
    const lifetime = diff.baseLifetime * (1 - progress * 0.15);
    const current = snacksRef.current;
    if (current.length < diff.maxConcurrent) {
      const occupied = new Set(current.map((s) => s.cell));
      const free: number[] = [];
      for (let i = 0; i < GRID_CELLS; i++) {
        if (!occupied.has(i)) free.push(i);
      }
      const deck = deckRef.current;
      // Bias toward unsafe "decoy" snacks at higher levels so the player has
      // to read faster, not just tap faster. Falls back to any snack.
      const unsafe = deck.filter((c) => !c.isSafe);
      const pool =
        unsafe.length && Math.random() < diff.unsafeBias ? unsafe : deck;
      const cell = free[Math.floor(Math.random() * free.length)];
      const card = pool[Math.floor(Math.random() * pool.length)];
      if (cell !== undefined && card) {
        const id = ++snackIdRef.current;
        const removal = setTimeout(() => {
          setSnacks((s) => s.filter((x) => x.id !== id));
          removalTimers.current.delete(removal);
        }, lifetime);
        removalTimers.current.add(removal);
        setSnacks((s) => [...s, { id, cell, card }]);
      }
    }
    // Reschedule with a difficulty-adjusted interval.
    const interval = diff.baseInterval * (1 - progress * 0.15);
    spawnTimer.current = setTimeout(spawnOne, interval);
  };

  // Drive the round while playing; the cleanup stops every timer.
  useEffect(() => {
    if (phase !== 'playing') return;
    timeLeftRef.current = LEVEL_SECONDS;
    setTimeLeft(LEVEL_SECONDS);
    spawnTimer.current = setTimeout(spawnOne, 700);
    countdown.current = setInterval(() => {
      setTimeLeft((t) => {
        const next = Math.max(t - 1, 0);
        timeLeftRef.current = next;
        return next;
      });
    }, 1000);
    return clearAllTimers;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Surviving the level's clock (with hearts left) advances to the next,
  // faster level. Running out of hearts ends the game (handled in `whack`).
  useEffect(() => {
    if (phase === 'playing' && timeLeft <= 0) nextLevel();
  }, [timeLeft, phase]);

  // Record stats once per finished round (no mid-game save by design).
  useEffect(() => {
    if (phase !== 'gameOver' || recordedRef.current) return;
    recordedRef.current = true;
    recordGame(score, bestStreak).then(({ isNewHighScore: fresh }) =>
      setIsNewHighScore(fresh),
    );
  }, [phase, score, bestStreak, recordGame]);

  // Safety net: clear timers if the component unmounts mid-round.
  useEffect(() => clearAllTimers, []);

  const startRound = () => {
    clearAllTimers();
    recordedRef.current = false;
    setIsNewHighScore(false);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setLives(MAX_LIVES);
    setLevel(1);
    levelRef.current = 1;
    setSnacks([]);
    setToast(null);
    setLevelBanner(null);
    setBurst(null);
    deckRef.current = buildDeck(history ?? [], allergies);
    setPhase('playing');
  };

  const whack = (snack: ActiveSnack) => {
    if (phaseRef.current !== 'playing') return;
    setSnacks((s) => s.filter((x) => x.id !== snack.id));

    if (snack.card.isSafe) {
      const points = 10 * streakMultiplier(streakRef.current);
      setScore((s) => s + points);
      setStreak((s) => {
        const next = s + 1;
        setBestStreak((b) => Math.max(b, next));
        return next;
      });
      setBurst({ id: ++burstIdRef.current, cell: snack.cell, points });
    } else {
      setStreak(0);
      const allergenLabel = snack.card.allergensFound[0]
        ? getAllergenDisplay(snack.card.allergensFound[0])
        : null;
      setToast(
        allergenLabel
          ? `😱 That has ${allergenLabel.emoji} ${allergenLabel.label}!`
          : '😱 Not safe for you!',
      );
      if (toastTimer.current) clearTimeout(toastTimer.current);
      toastTimer.current = setTimeout(() => setToast(null), 1500);
      setLives((l) => {
        const next = l - 1;
        if (next <= 0) endGame();
        return next;
      });
    }
  };

  // The run always ends by running out of hearts, so reflect how FAR they got
  // rather than always showing a knocked-out mascot.
  const gameOverMood: KawaiiMood =
    level >= 6 ? 'lovestruck' : level >= 3 ? 'happy' : 'ko';
  const multiplier = streakMultiplier(streak);

  return (
    <div className="min-h-screen bg-gradient-to-br from-theme-bg via-theme-bg to-theme-bg/95 flex flex-col">
      <header className="w-full max-w-md mx-auto px-6 py-6 flex items-center justify-between gap-4">
        <SnackScout size="sm" />
        <button
          onClick={onExit}
          className="p-3 bg-theme-text rounded-full shadow-lg text-theme-primary hover:bg-theme-primary hover:text-theme-text transition-all active:scale-90"
          aria-label="Back to games"
        >
          <ArrowLeft className="w-6 h-6" aria-hidden="true" />
        </button>
      </header>

      {history === undefined ? (
        <div
          className="flex-1 flex items-center justify-center"
          role="status"
          aria-live="polite"
        >
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-theme-primary" />
          <span className="sr-only">Loading snacks...</span>
        </div>
      ) : availableCards.length < MIN_CARDS ? (
        <GameEmptyState onClose={onExit} />
      ) : phase === 'intro' ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-5 px-8 text-center max-w-md mx-auto w-full">
          <Planet size={100} mood="excited" color="#79d461" />
          <h2 className="text-4xl font-display font-black text-theme-text">
            Snack Attack!
          </h2>
          <div className="flex items-center gap-3">
            <p className="text-lg font-bold text-theme-text/70 leading-snug">
              Tap ONLY the snacks that are safe for you before they hide. Tap a
              bad one and you lose a ❤️. Survive each level and it gets faster!
            </p>
            <SpeakButton
              text="Snack Attack! Tap only the snacks that are safe for you before they hide. Tap a bad one and you lose a heart. Survive each level and it gets faster!"
              label="Hear how to play"
            />
          </div>
          <p className="text-base font-black text-theme-accent">
            Best score: {stats?.highScore ?? 0}
          </p>
          <button
            onClick={startRound}
            className="w-full py-5 bg-theme-accent text-white font-display font-black text-xl rounded-3xl shadow-lg hover:shadow-xl active:scale-95 transition-all"
          >
            Start!
          </button>
        </div>
      ) : phase === 'gameOver' ? (
        <GameOverScreen
          title={`Reached Level ${level}!`}
          score={score}
          bestStreak={bestStreak}
          mood={gameOverMood}
          stats={stats}
          isNewHighScore={isNewHighScore}
          onPlayAgain={startRound}
          onClose={onExit}
        />
      ) : (
        <div className="flex-1 w-full max-w-md mx-auto px-6 pb-10 flex flex-col gap-4">
          {/* HUD */}
          <div className="flex items-center justify-between">
            <HeartsBar lives={lives} max={MAX_LIVES} />
            <div
              className="flex items-center gap-2"
              role="status"
              aria-live="polite"
            >
              <motion.span
                key={level}
                animate={{ scale: [1, 1.2, 1] }}
                className="px-3 py-1 bg-theme-primary text-theme-text font-display font-black text-sm rounded-full shadow-lg"
              >
                Lvl {level}
              </motion.span>
              {multiplier > 1 && (
                <motion.span
                  key={multiplier}
                  animate={{ scale: [1, 1.3, 1] }}
                  className="px-3 py-1 bg-theme-accent text-white font-display font-black text-sm rounded-full shadow-lg"
                >
                  x{multiplier}
                </motion.span>
              )}
              <span className="font-display font-black text-2xl text-theme-text">
                {score}
              </span>
            </div>
          </div>

          {/* Countdown bar */}
          <div className="w-full h-3 bg-white rounded-full overflow-hidden shadow-inner">
            <motion.div
              className="h-full bg-theme-accent"
              animate={{ width: `${(timeLeft / LEVEL_SECONDS) * 100}%` }}
              transition={{ ease: 'linear', duration: 1 }}
            />
          </div>

          {/* Board */}
          <div className="grid grid-cols-3 gap-3 mt-2">
            {Array.from({ length: GRID_CELLS }).map((_, cell) => {
              const snack = snacks.find((s) => s.cell === cell);
              return (
                <div
                  key={cell}
                  className="relative aspect-square bg-white rounded-2xl shadow-lg overflow-hidden flex items-center justify-center"
                >
                  <AnimatePresence>
                    {snack && (
                      <motion.button
                        key={snack.id}
                        initial={{ scale: 0, y: 30 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0, y: 20, opacity: 0 }}
                        transition={{
                          type: 'spring',
                          stiffness: 400,
                          damping: 22,
                        }}
                        onClick={() => whack(snack)}
                        className="absolute inset-0 flex flex-col items-center justify-center gap-1 p-1 active:scale-90 transition-transform"
                        aria-label={`Snack: ${snack.card.name}`}
                      >
                        {snack.card.image_url ? (
                          <Image
                            src={snack.card.image_url}
                            alt={snack.card.name}
                            width={72}
                            height={72}
                            draggable={false}
                            className="w-16 h-16 object-cover rounded-xl pointer-events-none"
                          />
                        ) : (
                          <span className="text-4xl" aria-hidden="true">
                            {snack.card.icon || '📦'}
                          </span>
                        )}
                        <span className="text-[10px] font-black text-theme-text/70 leading-none text-center line-clamp-1 px-0.5">
                          {snack.card.name}
                        </span>
                      </motion.button>
                    )}
                  </AnimatePresence>

                  {burst && burst.cell === cell && (
                    <EmojiBurst key={burst.id} points={burst.points} />
                  )}
                </div>
              );
            })}
          </div>

          <p className="text-center text-sm font-bold text-theme-text/50">
            Tap the safe snacks!
          </p>
        </div>
      )}

      {/* Non-blocking wrong-tap toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="fixed bottom-10 inset-x-0 z-[60] flex justify-center px-6 pointer-events-none"
          >
            <span className="px-5 py-3 bg-redstone-red text-white font-display font-black rounded-2xl shadow-lg text-center">
              {toast}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Level-up celebration banner */}
      <AnimatePresence>
        {levelBanner && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center pointer-events-none"
          >
            <span className="px-8 py-4 bg-theme-accent text-white font-display font-black text-3xl rounded-3xl shadow-lg">
              🚀 {levelBanner}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
