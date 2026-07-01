import React from 'react';
import { ResultCard } from './ResultCard';
import { ProductResult } from '@/lib/open-food-facts';
import { useSnackCollection } from '@/hooks/useSnackCollection';

interface ResultViewProps {
  result: ProductResult;
  onReset: () => void;
  onCollect: () => void;
}

export function ResultView({ result, onReset, onCollect }: ResultViewProps) {
  const { isCollected } = useSnackCollection();

  return (
    <ResultCard
      result={result}
      onReset={onReset}
      onCollect={onCollect}
      isCollected={isCollected(result.barcode)}
    />
  );
}
