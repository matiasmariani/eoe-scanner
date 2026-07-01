import React from 'react';
import { ResultCard } from './ResultCard';
import { ProductResult } from '@/lib/open-food-facts';

interface ResultViewProps {
  result: ProductResult;
  onReset: () => void;
  onCollect: () => void;
  isCollected: boolean;
}

export function ResultView({
  result,
  onReset,
  onCollect,
  isCollected,
}: ResultViewProps) {
  return (
    <ResultCard
      result={result}
      onReset={onReset}
      onCollect={onCollect}
      isCollected={isCollected}
    />
  );
}
