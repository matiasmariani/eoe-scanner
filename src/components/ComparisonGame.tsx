'use client';

import React, { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Planet } from 'react-kawaii';
import { ArrowLeft, Check } from 'lucide-react';
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
  shuffle,
  streakMultiplier,
  type GameCard,
} from '@/lib/game-utils';
import { nutriHealthPercent, healthBarColor } from '@/lib/nutrition-utils';

const MAX_LIVES = 3;
const ROUNDS = 8;
const MIN_GRADED = 4;

type Phase = 'intro' | 'playing' | 'reveal' | 'gameOver';
type Pair = [GameCard, GameCard];

function health(card: GameCard): number {
  return nutriHealthPercent(card.nutriscoreGrade) ?? 0;
}

/** Builds up to ROUNDS pairs, preferring two foods with different health. */
function buildRounds(pool: GameCard[]): Pair[] {
  if (pool.length < 2) return [];
  const rounds: Pair[] = [];
  for (let r = 0; r < ROUNDS; r++) {
    const shuffled = shuffle(pool);
    const a = shuffled[0]!;
    let b = shuffled[1]!;
    // Prefer a partner with a different health score so there's a clear
    // "healthier" answer; fall back to any distinct item.
    const better = shuffled.find(
      (c) => c.barcode !== a.barcode && health(c) !== health(a),
    );
    if (better) b = better;
    rounds.push([a, b]);
  }
  return rounds;
}

interface GameState {
  phase: Phase;
  rounds: Pair[];
  round: number;
  selected: 0 | 1 | null;
  lives: number;
  score: number;
  streak: number;
  bestStreakRound: number;
  correctCount: number;
  burstId: number;
  lastPoints: number;
  feedbackMood: KawaiiMood | null;
}

type GameAction =
  | { type: 'START'; rounds: Pair[] }
  | { type: 'SELECT'; index: 0 | 1 }
  | { type: 'NEXT' }
  | { type: 'PLAY_AGAIN'; rounds: Pair[] };

const initialState: GameState = {
  phase: 'intro',
  rounds: [],
  round: 0,
  selected: null,
  lives: MAX_LIVES,
  score: 0,
  streak: 0,
  bestStreakRound: 0,
  correctCount: 0,
  burstId: 0,
  lastPoints: 0,
  feedbackMood: null,
};

function freshRound(rounds: Pair[]): GameState {
  return { ...initialState, phase: 'playing', rounds };
}

function reducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START':
    case 'PLAY_AGAIN':
      return freshRound(action.rounds);

    case 'SELECT': {
      if (state.phase !== 'playing') return state;
      const pair = state.rounds[state.round];
      if (!pair) return state;
      const pickedHealth = health(pair[action.index]);
      const otherHealth = health(pair[action.index === 0 ? 1 : 0]);
      // Ties count as correct — either choice is equally healthy.
      const correct = pickedHealth >= otherHealth;

      if (correct) {
        const points = 10 * streakMultiplier(state.streak);
        const streak = state.streak + 1;
        return {
          ...state,
          phase: 'reveal',
          selected: action.index,
          score: state.score + points,
          streak,
          bestStreakRound: Math.max(state.bestStreakRound, streak),
          correctCount: state.correctCount + 1,
          burstId: state.burstId + 1,
          lastPoints: points,
          feedbackMood: 'blissful',
        };
      }
      return {
        ...state,
        phase: 'reveal',
        selected: action.index,
        lives: state.lives - 1,
        streak: 0,
        feedbackMood: 'ko',
      };
    }

    case 'NEXT': {
      if (state.phase !== 'reveal') return state;
      const over = state.lives <= 0 || state.round + 1 >= state.rounds.length;
      return {
        ...state,
        phase: over ? 'gameOver' : 'playing',
        round: over ? state.round : state.round + 1,
        selected: null,
        feedbackMood: null,
      };
    }

    default:
      return state;
  }
}

function gameOverMood(state: GameState): KawaiiMood {
  if (state.lives <= 0) return 'ko';
  const total = state.rounds.length || 1;
  const ratio = state.correctCount / total;
  if (ratio >= 0.8) return 'lovestruck';
  if (ratio >= 0.5) return 'happy';
  return 'sad';
}

interface FoodCardProps {
  card: GameCard;
  fromLeft: boolean;
  reveal: boolean;
  picked: boolean;
  healthier: boolean;
  onPick: () => void;
}

function FoodCard({
  card,
  fromLeft,
  reveal,
  picked,
  healthier,
  onPick,
}: FoodCardProps) {
  const pct = nutriHealthPercent(card.nutriscoreGrade) ?? 0;
  return (
    <motion.button
      initial={{ x: fromLeft ? -320 : 320, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      whileTap={reveal ? undefined : { scale: 0.95 }}
      onClick={onPick}
      disabled={reveal}
      className={cardClass(reveal, picked, healthier)}
      aria-label={`Choose ${card.name}`}
    >
      {card.image_url ? (
        <Image
          src={card.image_url}
          alt={card.name}
          width={120}
          height={120}
          draggable={false}
          className="w-24 h-24 object-cover rounded-2xl shadow-lg pointer-events-none"
        />
      ) : (
        <span className="text-6xl" aria-hidden="true">
          {card.icon || '📦'}
        </span>
      )}
      <span className="font-display font-black text-base text-theme-text text-center leading-tight line-clamp-2">
        {card.name}
      </span>

      {/* Health score stays hidden until the reveal. */}
      {reveal ? (
        <div className="flex flex-col items-center gap-1 w-full">
          <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{ width: `${pct}%`, backgroundColor: healthBarColor(pct) }}
            />
          </div>
          <span className="font-display font-black text-lg text-theme-text">
            {pct}/100
          </span>
          {healthier && (
            <span className="text-xs font-black uppercase text-[#2f9e44]">
              Healthier!
            </span>
          )}
        </div>
      ) : (
        <span className="text-3xl" aria-hidden="true">
          ❓
        </span>
      )}
    </motion.button>
  );
}

function cardClass(reveal: boolean, picked: boolean, healthier: boolean) {
  const base =
    'flex-1 bg-white rounded-3xl shadow-lg p-4 flex flex-col items-center gap-3 min-h-[15rem] justify-center transition-all';
  if (!reveal) return `${base} active:scale-95`;
  if (healthier) return `${base} ring-4 ring-[#2f9e44]`;
  if (picked) return `${base} ring-4 ring-redstone-red opacity-80`;
  return `${base} opacity-60`;
}

interface ComparisonGameProps {
  profileId: string;
  onExit: () => void;
}

export function ComparisonGame({ profileId, onExit }: ComparisonGameProps) {
  const { history } = useHistory();
  const { allergies } = useAllergySettings();
  const { stats, recordGame } = useGameStats('compare', profileId);
  const [state, dispatch] = useReducer(reducer, initialState);
  const [isNewHighScore, setIsNewHighScore] = useState(false);
  const recordedRef = useRef(false);
  const revealTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Only foods with a known Nutri-Score grade can be compared.
  const gradedPool = useMemo(
    () =>
      history
        ? buildDeck(history, allergies).filter(
            (c) => nutriHealthPercent(c.nutriscoreGrade) !== null,
          )
        : [],
    [history, allergies],
  );

  const startRound = (type: 'START' | 'PLAY_AGAIN') => {
    recordedRef.current = false;
    setIsNewHighScore(false);
    dispatch({ type, rounds: buildRounds(gradedPool) });
  };

  // Auto-advance a short beat after the reveal so kids can see the scores.
  useEffect(() => {
    if (state.phase !== 'reveal') return;
    revealTimer.current = setTimeout(() => dispatch({ type: 'NEXT' }), 2200);
    return () => {
      if (revealTimer.current) clearTimeout(revealTimer.current);
    };
  }, [state.phase, state.round]);

  useEffect(() => {
    if (state.phase !== 'gameOver' || recordedRef.current) return;
    recordedRef.current = true;
    recordGame(state.score, state.bestStreakRound).then(
      ({ isNewHighScore: fresh }) => setIsNewHighScore(fresh),
    );
  }, [state.phase, state.score, state.bestStreakRound, recordGame]);

  const pair = state.rounds[state.round];
  const reveal = state.phase === 'reveal';
  const healthierIndex = pair
    ? health(pair[0]) >= health(pair[1])
      ? 0
      : 1
    : 0;
  const displayMood: KawaiiMood = state.feedbackMood ?? 'happy';
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
      ) : gradedPool.length < MIN_GRADED ? (
        <GameEmptyState
          onClose={onExit}
          title="Need more snacks with scores!"
          message="Scan or browse at least 4 snacks that have a health score to play this game."
        />
      ) : state.phase === 'intro' ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-5 px-8 text-center max-w-md mx-auto w-full">
          <Planet size={100} mood="excited" color="#79d461" />
          <h2 className="text-4xl font-display font-black text-theme-text">
            Which is Healthier?
          </h2>
          <div className="flex items-center gap-3">
            <p className="text-lg font-bold text-theme-text/70 leading-snug">
              Two snacks, side by side. Tap the one you think is HEALTHIER. The
              scores are hidden until you pick!
            </p>
            <SpeakButton
              text="Which is Healthier? Two snacks appear side by side. Tap the one you think is healthier. The scores are hidden until you pick!"
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
          title={state.lives <= 0 ? 'Out of hearts!' : 'All done!'}
          score={state.score}
          bestStreak={state.bestStreakRound}
          mood={gameOverMood(state)}
          stats={stats}
          isNewHighScore={isNewHighScore}
          onPlayAgain={() => startRound('PLAY_AGAIN')}
          onClose={onExit}
        />
      ) : (
        pair && (
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

            {/* Mascot + prompt */}
            <div className="relative flex flex-col items-center">
              <motion.div
                key={displayMood}
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 0.4 }}
              >
                <Planet size={70} mood={displayMood} color="#79d461" />
              </motion.div>
              <p className="font-display font-black text-lg text-theme-text mt-1">
                {reveal
                  ? state.feedbackMood === 'blissful'
                    ? 'Correct! 🎉'
                    : 'Not quite! 💡'
                  : 'Tap the healthier one!'}
              </p>
              {state.burstId > 0 && (
                <EmojiBurst key={state.burstId} points={state.lastPoints} />
              )}
            </div>

            {/* The two foods, flying in from each side */}
            <div className="flex items-stretch gap-3 mt-2" key={state.round}>
              <FoodCard
                card={pair[0]}
                fromLeft
                reveal={reveal}
                picked={state.selected === 0}
                healthier={reveal && healthierIndex === 0}
                onPick={() => dispatch({ type: 'SELECT', index: 0 })}
              />
              <div className="flex items-center">
                <span className="font-display font-black text-2xl text-theme-text/50">
                  VS
                </span>
              </div>
              <FoodCard
                card={pair[1]}
                fromLeft={false}
                reveal={reveal}
                picked={state.selected === 1}
                healthier={reveal && healthierIndex === 1}
                onPick={() => dispatch({ type: 'SELECT', index: 1 })}
              />
            </div>

            {reveal && (
              <button
                onClick={() => dispatch({ type: 'NEXT' })}
                className="mt-2 w-full flex items-center justify-center gap-2 py-4 bg-theme-primary text-theme-text font-display font-black rounded-3xl shadow-lg active:scale-95 transition-transform"
              >
                <Check className="w-5 h-5" aria-hidden="true" />
                Next
              </button>
            )}

            <p className="text-center text-sm font-bold text-theme-text/50">
              Round {Math.min(state.round + 1, state.rounds.length)} of{' '}
              {state.rounds.length}
            </p>
          </div>
        )
      )}
    </div>
  );
}
