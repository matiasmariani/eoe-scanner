'use client';

import React, { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import Image from 'next/image';
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  type PanInfo,
} from 'framer-motion';
import { Planet } from 'react-kawaii';
import { ArrowLeft, Check, X } from 'lucide-react';
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
  SORT_DECK_SIZE,
} from '@/lib/game-utils';
import { getAllergenDisplay } from '@/lib/allergen-utils';
import { cn } from '@/lib/utils';

const MAX_LIVES = 3;

type Phase = 'intro' | 'playing' | 'wrongFeedback' | 'gameOver';
type Guess = 'good' | 'bad';

interface GameState {
  phase: Phase;
  deck: GameCard[];
  index: number;
  lives: number;
  score: number;
  streak: number;
  bestStreakRound: number;
  correctCount: number;
  exitDir: 1 | -1;
  wrongCard: GameCard | null;
  wrongGuess: Guess | null;
  burstId: number;
  lastPoints: number;
}

type GameAction =
  | { type: 'START'; deck: GameCard[] }
  | { type: 'ANSWER'; guess: Guess }
  | { type: 'DISMISS_WRONG' }
  | { type: 'PLAY_AGAIN'; deck: GameCard[] };

const initialState: GameState = {
  phase: 'intro',
  deck: [],
  index: 0,
  lives: MAX_LIVES,
  score: 0,
  streak: 0,
  bestStreakRound: 0,
  correctCount: 0,
  exitDir: 1,
  wrongCard: null,
  wrongGuess: null,
  burstId: 0,
  lastPoints: 0,
};

function freshRound(deck: GameCard[]): GameState {
  return { ...initialState, phase: 'playing', deck };
}

function reducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START':
    case 'PLAY_AGAIN':
      return freshRound(action.deck);

    case 'ANSWER': {
      // Double-input guard: swipes/taps only count mid-round.
      if (state.phase !== 'playing') return state;
      const card = state.deck[state.index];
      if (!card) return state;

      const correct = (action.guess === 'good') === card.isSafe;
      const exitDir: 1 | -1 = action.guess === 'good' ? 1 : -1;
      const nextIndex = state.index + 1;
      const deckDone = nextIndex >= state.deck.length;

      if (correct) {
        const points = 10 * streakMultiplier(state.streak);
        const streak = state.streak + 1;
        return {
          ...state,
          phase: deckDone ? 'gameOver' : 'playing',
          index: nextIndex,
          score: state.score + points,
          streak,
          bestStreakRound: Math.max(state.bestStreakRound, streak),
          correctCount: state.correctCount + 1,
          exitDir,
          burstId: state.burstId + 1,
          lastPoints: points,
        };
      }

      // Wrong: always show the teaching overlay first, even on the last
      // heart — DISMISS_WRONG routes to gameOver when appropriate.
      return {
        ...state,
        phase: 'wrongFeedback',
        index: nextIndex,
        lives: state.lives - 1,
        streak: 0,
        exitDir,
        wrongCard: card,
        wrongGuess: action.guess,
      };
    }

    case 'DISMISS_WRONG': {
      if (state.phase !== 'wrongFeedback') return state;
      const over = state.lives <= 0 || state.index >= state.deck.length;
      return {
        ...state,
        phase: over ? 'gameOver' : 'playing',
        wrongCard: null,
        wrongGuess: null,
      };
    }

    default:
      return state;
  }
}

function planetMood(state: GameState): KawaiiMood {
  if (state.phase === 'wrongFeedback') {
    return state.lives <= 0 ? 'ko' : 'shocked';
  }
  if (state.streak >= 6) return 'lovestruck';
  if (state.streak >= 4) return 'excited';
  if (state.streak >= 2) return 'blissful';
  return 'happy';
}

function gameOverMood(state: GameState): KawaiiMood {
  if (state.lives <= 0) return 'ko';
  const ratio = state.deck.length ? state.correctCount / state.deck.length : 0;
  if (ratio >= 0.8) return 'lovestruck';
  if (ratio >= 0.5) return 'happy';
  return 'sad';
}

const MILESTONES: Record<number, string> = {
  3: '🔥 On fire!',
  5: '⚡ Super sorter!',
  8: '🌟 Snack master!',
};

// Exit must be a variant (not a plain prop) so it can read `custom` at
// removal time — this lets the tap buttons fly the card out the same way
// a swipe does.
const cardVariants = {
  exit: (dir: 1 | -1) => ({
    x: dir * 420,
    rotate: dir * 22,
    opacity: 0,
    transition: { duration: 0.3, ease: 'easeOut' as const },
  }),
};

interface SwipeCardProps {
  card: GameCard;
  stackPos: number;
  isTop: boolean;
  onAnswer: (guess: Guess) => void;
}

function SwipeCard({ card, stackPos, isTop, onAnswer }: SwipeCardProps) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-14, 14]);
  const goodStampOpacity = useTransform(x, [30, 110], [0, 1]);
  const badStampOpacity = useTransform(x, [-110, -30], [1, 0]);

  const SWIPE_OFFSET = 100;
  const SWIPE_VELOCITY = 500;

  function handleDragEnd(_: unknown, info: PanInfo) {
    const byOffset = Math.abs(info.offset.x) > SWIPE_OFFSET;
    const byVelocity = Math.abs(info.velocity.x) > SWIPE_VELOCITY;
    if (!byOffset && !byVelocity) return; // dragConstraints spring it back
    const dir = byOffset
      ? Math.sign(info.offset.x)
      : Math.sign(info.velocity.x);
    onAnswer(dir > 0 ? 'good' : 'bad');
  }

  return (
    <motion.div
      className={cn(
        'absolute inset-x-2 top-0 bg-white rounded-3xl shadow-lg p-6',
        'flex flex-col items-center gap-3 select-none',
        isTop ? 'cursor-grab active:cursor-grabbing' : 'pointer-events-none',
      )}
      // The exit variant animates this same `x` MotionValue, so a dragged
      // card flies out from wherever the finger released it — no snap.
      style={{ x, rotate, zIndex: 10 - stackPos }}
      initial={{ scale: 0.9, y: 40, opacity: 0 }}
      animate={{ scale: 1 - stackPos * 0.05, y: stackPos * 14, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      variants={cardVariants}
      exit="exit"
      drag={isTop ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.8}
      onDragEnd={isTop ? handleDragEnd : undefined}
    >
      {/* Live swipe hint stamps */}
      <motion.div
        style={{ opacity: goodStampOpacity }}
        className="absolute top-4 left-4 px-3 py-1 -rotate-12 bg-[#79d461] text-white font-display font-black rounded-xl shadow-lg"
        aria-hidden="true"
      >
        GOOD ✓
      </motion.div>
      <motion.div
        style={{ opacity: badStampOpacity }}
        className="absolute top-4 right-4 px-3 py-1 rotate-12 bg-redstone-red text-white font-display font-black rounded-xl shadow-lg"
        aria-hidden="true"
      >
        BAD ✗
      </motion.div>

      {card.image_url ? (
        <Image
          src={card.image_url}
          alt={card.name}
          width={160}
          height={160}
          draggable={false}
          className="w-40 h-40 object-cover rounded-2xl shadow-lg pointer-events-none"
        />
      ) : (
        <span className="text-7xl" aria-hidden="true">
          {card.icon || '📦'}
        </span>
      )}
      <h3 className="font-display font-black text-2xl text-theme-text text-center leading-tight line-clamp-2">
        {card.name}
      </h3>
      <p className="text-sm font-bold text-theme-text/60 truncate max-w-full">
        {card.brand}
      </p>
      <p className="text-base font-black text-theme-text/40 mt-1">
        Safe for you?
      </p>
    </motion.div>
  );
}

interface SortingGameProps {
  profileId: string;
  onExit: () => void;
}

export function SortingGame({ profileId, onExit }: SortingGameProps) {
  const { history } = useHistory();
  const { allergies } = useAllergySettings();
  const { stats, recordGame } = useGameStats('sort', profileId);
  const [state, dispatch] = useReducer(reducer, initialState);
  const [milestone, setMilestone] = useState<string | null>(null);
  const [isNewHighScore, setIsNewHighScore] = useState(false);
  const recordedRef = useRef(false);
  const milestoneTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Uncapped deck just to know whether there's enough to play.
  const availableCards = useMemo(
    () => (history ? buildDeck(history, allergies) : []),
    [history, allergies],
  );

  const startRound = (type: 'START' | 'PLAY_AGAIN') => {
    recordedRef.current = false;
    setIsNewHighScore(false);
    dispatch({
      type,
      deck: buildDeck(history ?? [], allergies, SORT_DECK_SIZE),
    });
  };

  // Streak milestone banner (1s, self-clearing).
  useEffect(() => {
    const text = MILESTONES[state.streak];
    if (!text) return;
    setMilestone(text);
    milestoneTimer.current = setTimeout(() => setMilestone(null), 1200);
    return () => {
      if (milestoneTimer.current) clearTimeout(milestoneTimer.current);
    };
  }, [state.streak]);

  // Record stats exactly once per finished round. No mid-game save by
  // design: rounds last 1–2 minutes, so closing early simply discards.
  useEffect(() => {
    if (state.phase !== 'gameOver' || recordedRef.current) return;
    recordedRef.current = true;
    recordGame(state.score, state.bestStreakRound).then(
      ({ isNewHighScore: fresh }) => setIsNewHighScore(fresh),
    );
  }, [state.phase, state.score, state.bestStreakRound, recordGame]);

  const visible = state.deck.slice(state.index, state.index + 3);
  const multiplier = streakMultiplier(state.streak);

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
      ) : state.phase === 'intro' ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-5 px-8 text-center max-w-md mx-auto w-full">
          <Planet size={100} mood="excited" color="#79d461" />
          <h2 className="text-4xl font-display font-black text-theme-text">
            Snack Sort!
          </h2>
          <div className="flex items-center gap-3">
            <p className="text-lg font-bold text-theme-text/70 leading-snug">
              Swipe right ✓ if the snack is safe for YOU, left ✗ if it&apos;s
              not. You have {MAX_LIVES} ❤️ — good luck!
            </p>
            <SpeakButton
              text={`Snack Sort! Swipe right if the snack is safe for you, left if it is not. You have ${MAX_LIVES} hearts. Good luck!`}
              label="Hear how to play"
            />
          </div>
          <p className="text-base font-black text-theme-accent">
            Best score: {stats?.highScore ?? 0}
          </p>
          <button
            onClick={() => startRound('START')}
            className="w-full py-5 bg-theme-accent text-white font-display font-black text-xl rounded-3xl shadow-lg hover:shadow-xl active:scale-95 transition-all"
          >
            Start!
          </button>
        </div>
      ) : state.phase === 'gameOver' ? (
        <GameOverScreen
          title={state.lives <= 0 ? 'Out of hearts!' : 'Deck sorted!'}
          score={state.score}
          bestStreak={state.bestStreakRound}
          mood={gameOverMood(state)}
          stats={stats}
          isNewHighScore={isNewHighScore}
          onPlayAgain={() => startRound('PLAY_AGAIN')}
          onClose={onExit}
        />
      ) : (
        <div className="flex-1 w-full max-w-md mx-auto px-6 pb-10 flex flex-col gap-4">
          {/* HUD */}
          <div className="flex items-center justify-between">
            <HeartsBar lives={state.lives} max={MAX_LIVES} />
            <div
              className="flex items-center gap-2"
              role="status"
              aria-live="polite"
            >
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
                {state.score}
              </span>
            </div>
          </div>

          {/* Mascot */}
          <div className="flex justify-center">
            <Planet size={60} mood={planetMood(state)} color="#79d461" />
          </div>

          {/* Card stack */}
          <div className="relative w-full h-[22rem]">
            <AnimatePresence custom={state.exitDir} mode="popLayout">
              {visible.map((card, i) => (
                <SwipeCard
                  key={card.barcode}
                  card={card}
                  stackPos={i}
                  isTop={i === 0 && state.phase === 'playing'}
                  onAnswer={(guess) => dispatch({ type: 'ANSWER', guess })}
                />
              ))}
            </AnimatePresence>

            {state.burstId > 0 && (
              <EmojiBurst key={state.burstId} points={state.lastPoints} />
            )}

            <AnimatePresence>
              {milestone && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="absolute inset-x-0 top-1/3 flex justify-center pointer-events-none z-30"
                >
                  <span className="px-6 py-3 bg-theme-accent text-white font-display font-black text-xl rounded-full shadow-lg">
                    {milestone}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Tap buttons for younger kids — same ANSWER path as swipes */}
          <div className="flex justify-center gap-8">
            <button
              onClick={() => dispatch({ type: 'ANSWER', guess: 'bad' })}
              aria-label="Not safe for me"
              className="w-20 h-20 rounded-full bg-redstone-red text-white shadow-lg active:scale-90 transition-transform flex items-center justify-center"
            >
              <X className="w-10 h-10" aria-hidden="true" />
            </button>
            <button
              onClick={() => dispatch({ type: 'ANSWER', guess: 'good' })}
              aria-label="Safe for me"
              className="w-20 h-20 rounded-full bg-[#79d461] text-white shadow-lg active:scale-90 transition-transform flex items-center justify-center"
            >
              <Check className="w-10 h-10" aria-hidden="true" />
            </button>
          </div>

          <p className="text-center text-sm font-bold text-theme-text/50">
            Snack {Math.min(state.index + 1, state.deck.length)} of{' '}
            {state.deck.length}
          </p>
        </div>
      )}

      {/* Wrong-answer teaching overlay */}
      <AnimatePresence>
        {state.phase === 'wrongFeedback' && state.wrongCard && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.8, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 22 }}
              className="w-full max-w-sm bg-white rounded-3xl shadow-lg p-6 flex flex-col items-center gap-4 text-center"
            >
              <Planet
                size={80}
                mood={
                  state.lives <= 0
                    ? 'ko'
                    : state.wrongGuess === 'good'
                      ? 'shocked'
                      : 'sad'
                }
                color={state.wrongGuess === 'good' ? '#d81b00' : '#79d461'}
              />
              {state.wrongGuess === 'good' ? (
                <>
                  <h3 className="text-2xl font-display font-black text-theme-text">
                    Oops! {state.wrongCard.name} has:
                  </h3>
                  <ul className="flex flex-wrap justify-center gap-3">
                    {state.wrongCard.allergensFound.map((allergen) => {
                      const { emoji, label } = getAllergenDisplay(allergen);
                      return (
                        <li
                          key={allergen}
                          className="flex flex-col items-center gap-1 bg-redstone-red/10 p-3 rounded-2xl"
                        >
                          <span
                            className="text-3xl"
                            role="img"
                            aria-label={label}
                          >
                            {emoji}
                          </span>
                          <span className="text-xs font-black uppercase text-redstone-red">
                            {label}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </>
              ) : (
                <h3 className="text-2xl font-display font-black text-theme-text">
                  Actually, {state.wrongCard.name} is safe for you! No allergens
                  inside.
                </h3>
              )}
              <SpeakButton
                text={
                  state.wrongGuess === 'good'
                    ? `Oops! ${state.wrongCard.name} has ${state.wrongCard.allergensFound
                        .map((a) => getAllergenDisplay(a).label)
                        .join(' and ')}.`
                    : `Actually, ${state.wrongCard.name} is safe for you! No allergens inside.`
                }
                label="Hear why"
              />
              <HeartsBar lives={state.lives} max={MAX_LIVES} />
              <button
                onClick={() => dispatch({ type: 'DISMISS_WRONG' })}
                className="w-full py-4 bg-theme-primary text-theme-text font-display font-black text-lg rounded-3xl shadow-lg hover:shadow-xl active:scale-95 transition-all"
              >
                Got it!
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
