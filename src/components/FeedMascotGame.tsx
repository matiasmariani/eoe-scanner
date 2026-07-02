'use client';

import React, { useEffect, useMemo, useReducer, useRef, useState } from 'react';
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
const FEED_DECK_SIZE = 12;

type Phase = 'intro' | 'playing' | 'gameOver';
type FeedAction = 'feed' | 'shoo';

interface Feedback {
  text: string;
  mood: KawaiiMood;
}

interface GameState {
  phase: Phase;
  deck: GameCard[];
  index: number;
  lives: number;
  score: number;
  streak: number;
  bestStreakRound: number;
  correctCount: number;
  exitAction: FeedAction | null;
  feedback: Feedback | null;
  burstId: number;
  lastPoints: number;
}

type GameAction =
  | { type: 'START'; deck: GameCard[] }
  | { type: 'DECIDE'; action: FeedAction }
  | { type: 'CLEAR_FEEDBACK' }
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
  exitAction: null,
  feedback: null,
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

    case 'CLEAR_FEEDBACK':
      return state.feedback ? { ...state, feedback: null } : state;

    case 'DECIDE': {
      if (state.phase !== 'playing') return state;
      const card = state.deck[state.index];
      if (!card) return state;

      const nextIndex = state.index + 1;
      const deckDone = nextIndex >= state.deck.length;
      const correct = (action.action === 'feed') === card.isSafe;
      // Only feeding an allergen actually hurts the mascot (kid-friendly).
      const fedAllergen = action.action === 'feed' && !card.isSafe;

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
          exitAction: action.action,
          feedback:
            action.action === 'feed'
              ? { text: 'Yum! 😋', mood: 'blissful' }
              : { text: 'Phew, good call! 😅', mood: 'blissful' },
          burstId: state.burstId + 1,
          lastPoints: points,
        };
      }

      // Incorrect
      if (fedAllergen) {
        const lives = state.lives - 1;
        const why = card.allergensFound
          .map((a) => getAllergenDisplay(a).label)
          .join(' and ');
        return {
          ...state,
          phase: lives <= 0 || deckDone ? 'gameOver' : 'playing',
          index: nextIndex,
          lives,
          streak: 0,
          exitAction: 'feed',
          feedback: {
            text: why
              ? `Ugh! That's not safe because you're allergic to ${why}! 🤢`
              : 'Ugh, not safe! 🤢',
            mood: 'ko',
          },
        };
      }

      // Shooed a safe snack — no harm, just a missed treat.
      return {
        ...state,
        phase: deckDone ? 'gameOver' : 'playing',
        index: nextIndex,
        streak: 0,
        exitAction: 'shoo',
        feedback: { text: 'Aww, that one was yummy! 🥺', mood: 'ko' },
      };
    }

    default:
      return state;
  }
}

function gameOverMood(state: GameState): KawaiiMood {
  if (state.lives <= 0) return 'ko';
  const ratio = state.deck.length ? state.correctCount / state.deck.length : 0;
  if (ratio >= 0.8) return 'lovestruck';
  if (ratio >= 0.5) return 'happy';
  return 'sad';
}

// Snack rockets up into the mascot's mouth (feed) or flies off the left of
// the screen (shoo).
const snackVariants = {
  exit: (action: FeedAction | null) =>
    action === 'feed'
      ? {
          // Travel all the way up to the mascot; stay fully visible until the
          // very end so it doesn't appear to vanish halfway.
          y: -460,
          scale: 0.15,
          opacity: [1, 1, 0],
          transition: {
            duration: 0.45,
            ease: 'easeIn' as const,
            opacity: { duration: 0.45, times: [0, 0.85, 1] },
          },
        }
      : {
          x: -500,
          rotate: -35,
          opacity: 0,
          transition: { duration: 0.35, ease: 'easeOut' as const },
        },
};

interface FeedMascotGameProps {
  profileId: string;
  onExit: () => void;
}

export function FeedMascotGame({ profileId, onExit }: FeedMascotGameProps) {
  const { history } = useHistory();
  const { allergies } = useAllergySettings();
  const { stats, recordGame } = useGameStats('feed', profileId);
  const [state, dispatch] = useReducer(reducer, initialState);
  const [isNewHighScore, setIsNewHighScore] = useState(false);
  const recordedRef = useRef(false);
  const feedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const availableCards = useMemo(
    () => (history ? buildDeck(history, allergies) : []),
    [history, allergies],
  );

  const startRound = (type: 'START' | 'PLAY_AGAIN') => {
    recordedRef.current = false;
    setIsNewHighScore(false);
    dispatch({
      type,
      deck: buildDeck(history ?? [], allergies, FEED_DECK_SIZE),
    });
  };

  // Auto-clear the transient feedback line.
  useEffect(() => {
    if (!state.feedback) return;
    feedbackTimer.current = setTimeout(
      () => dispatch({ type: 'CLEAR_FEEDBACK' }),
      1600,
    );
    return () => {
      if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
    };
  }, [state.feedback]);

  useEffect(() => {
    if (state.phase !== 'gameOver' || recordedRef.current) return;
    recordedRef.current = true;
    recordGame(state.score, state.bestStreakRound).then(
      ({ isNewHighScore: fresh }) => setIsNewHighScore(fresh),
    );
  }, [state.phase, state.score, state.bestStreakRound, recordGame]);

  const card = state.deck[state.index];
  // Buddy is sad/hungry by default; correct answers make him blissful and
  // wrong answers knock him out (ko), both shown briefly via feedback.
  const displayMood: KawaiiMood = state.feedback?.mood ?? 'sad';
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
            Feed the Mascot!
          </h2>
          <div className="flex items-center gap-3">
            <p className="text-lg font-bold text-theme-text/70 leading-snug">
              Buddy is hungry! Feed 😋 the snacks that are safe for you and shoo
              🙅 the ones that aren&apos;t. Feed a bad one and Buddy gets sick!
            </p>
            <SpeakButton
              text="Feed the Mascot! Buddy is hungry. Feed the snacks that are safe for you, and shoo away the ones that are not. Feed a bad one and Buddy gets sick!"
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
          title={state.lives <= 0 ? 'Buddy is stuffed!' : 'All fed!'}
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
          <div className="relative flex flex-col items-center justify-center pt-2">
            <motion.div
              key={displayMood}
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 0.4 }}
            >
              <Planet size={240} mood={displayMood} color="#79d461" />
            </motion.div>
            <div className="h-8 mt-1">
              <AnimatePresence mode="wait">
                {state.feedback && (
                  <motion.p
                    key={state.feedback.text}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="font-display font-black text-lg text-theme-text text-center"
                  >
                    {state.feedback.text}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
            {state.burstId > 0 && (
              <EmojiBurst key={state.burstId} points={state.lastPoints} />
            )}
          </div>

          {/* Snack on the plate */}
          <div className="relative flex-1 flex items-center justify-center min-h-[10rem]">
            <AnimatePresence custom={state.exitAction} mode="popLayout">
              {card && (
                <motion.div
                  key={card.barcode}
                  initial={{ scale: 0.8, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  variants={snackVariants}
                  exit="exit"
                  transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                  className="bg-white rounded-3xl shadow-lg p-5 flex flex-col items-center gap-2 w-52"
                >
                  {card.image_url ? (
                    <Image
                      src={card.image_url}
                      alt={card.name}
                      width={120}
                      height={120}
                      draggable={false}
                      className="w-28 h-28 object-cover rounded-2xl shadow-lg pointer-events-none"
                    />
                  ) : (
                    <span className="text-6xl" aria-hidden="true">
                      {card.icon || '📦'}
                    </span>
                  )}
                  <h3 className="font-display font-black text-lg text-theme-text text-center leading-tight line-clamp-2">
                    {card.name}
                  </h3>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Feed / Shoo buttons */}
          <div className="flex justify-center gap-4">
            <button
              onClick={() => dispatch({ type: 'DECIDE', action: 'shoo' })}
              className="flex-1 flex items-center justify-center gap-2 py-5 bg-white text-theme-text font-display font-black text-lg rounded-3xl shadow-lg active:scale-95 transition-transform"
              aria-label="Shoo it away"
            >
              🙅 Shoo
            </button>
            <button
              onClick={() => dispatch({ type: 'DECIDE', action: 'feed' })}
              className="flex-1 flex items-center justify-center gap-2 py-5 bg-[#79d461] text-white font-display font-black text-lg rounded-3xl shadow-lg active:scale-95 transition-transform"
              aria-label="Feed it to Buddy"
            >
              😋 Feed
            </button>
          </div>

          <p className="text-center text-sm font-bold text-theme-text/50">
            Snack {Math.min(state.index + 1, state.deck.length)} of{' '}
            {state.deck.length}
          </p>
        </div>
      )}
    </div>
  );
}
