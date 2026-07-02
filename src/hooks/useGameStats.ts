'use client';

import { useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';

export type GameId = 'sort' | 'attack' | 'feed' | 'compare';

export interface GameStats {
  highScore: number;
  bestStreak: number;
  gamesPlayed: number;
}

const DEFAULT_STATS: GameStats = {
  highScore: 0,
  bestStreak: 0,
  gamesPlayed: 0,
};

function parseStats(value: string | undefined): GameStats {
  if (!value) return DEFAULT_STATS;
  try {
    return { ...DEFAULT_STATS, ...JSON.parse(value) };
  } catch {
    return DEFAULT_STATS;
  }
}

/**
 * Persisted mini-game stats, kept per game per profile in the existing
 * Dexie `settings` table (no schema change: SettingsRecord already carries
 * an optional string `value`). `stats` is undefined while loading.
 */
export function useGameStats(gameId: GameId, profileId: string) {
  const key = `gameStats:${gameId}:${profileId}`;

  const stats = useLiveQuery(async () => {
    const record = await db.settings.get(key);
    return parseStats(record?.value);
  }, [key]);

  const recordGame = useCallback(
    async (score: number, streak: number) => {
      const record = await db.settings.get(key);
      const prev = parseStats(record?.value);
      const next: GameStats = {
        highScore: Math.max(prev.highScore, score),
        bestStreak: Math.max(prev.bestStreak, streak),
        gamesPlayed: prev.gamesPlayed + 1,
      };
      await db.settings.put({ id: key, value: JSON.stringify(next) });
      return {
        next,
        isNewHighScore: score > prev.highScore && score > 0,
      };
    },
    [key],
  );

  const resetStats = useCallback(async () => {
    await db.settings.delete(key);
  }, [key]);

  return { stats, recordGame, resetStats };
}
