'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { useHistory } from '@/hooks/useHistory';
import { SnackScout } from '@/components/SnackScout';

export function HistoryView({ onClose }: { onClose: () => void }) {
  const { history, removeHistory } = useHistory();
  const [filter, setFilter] = React.useState<'all' | 'good' | 'bad'>('all');

  if (history === undefined) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-theme-primary"></div>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center space-y-4">
        <div className="text-6xl opacity-20">📜</div>
        <p className="text-2xl font-black text-theme-text/40">
          No history yet!
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-theme-bg flex flex-col">
      <header className="w-full max-w-md mx-auto px-6 py-8 flex items-center justify-between gap-4">
        <SnackScout size="sm" />
        <button
          onClick={onClose}
          className="p-3 bg-theme-text rounded-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-4 border-theme-primary text-theme-primary hover:bg-theme-primary hover:text-theme-text transition-all active:scale-90"
          aria-label="Close history"
        >
          <X className="w-6 h-6" aria-hidden="true" />
        </button>
      </header>

      <div className="flex-1 w-full max-w-md mx-auto px-4 pb-16">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-display font-black text-theme-text">
            History
          </h2>
          <p className="text-lg font-bold text-theme-primary mt-1">
            Your scanning journey 📜
          </p>
        </div>

        <div className="flex justify-center gap-2 mb-6">
          {(['all', 'good', 'bad'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl border-4 border-theme-border font-display font-black uppercase transition-all ${
                filter === f
                  ? 'bg-theme-accent text-theme-bg shadow-voxel'
                  : 'bg-theme-bg text-theme-text hover:bg-theme-bg/80'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {history
              .filter((item) => {
                if (filter === 'good') return item.result.isSafe;
                if (filter === 'bad') return !item.result.isSafe;
                return true;
              })
              .map((item) => (
                <motion.div
                  key={item.id ?? `no-id-${item.timestamp}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="relative"
                >
                  <div className="bg-theme-text border-4 border-theme-border shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4 flex items-center gap-4 rounded-2xl">
                    <div className="w-16 h-16 bg-theme-bg/10 rounded-xl flex items-center justify-center text-3xl shrink-0">
                      {item.result.icon || '📦'}
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col gap-1">
                      <h3 className="font-black text-xl text-theme-bg truncate">
                        {item.result.name}
                      </h3>
                      <p className="text-xs text-theme-bg/60 truncate">
                        {item.result.brand}
                      </p>
                      {!item.result.isSafe &&
                        item.result.allergensFound.length > 0 && (
                          <p className="text-xs font-bold text-redstone-red truncate">
                            Contains: {item.result.allergensFound.join(', ')}
                          </p>
                        )}
                      <p className="text-[10px] text-theme-bg/40 mt-auto">
                        {new Date(item.timestamp).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.result.isSafe ? (
                        <div className="w-8 h-8 rounded-full bg-theme-primary/20 flex items-center justify-center">
                          <CheckCircle2 className="w-5 h-5 text-theme-primary" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-redstone-red/20 flex items-center justify-center">
                          <AlertCircle className="w-5 h-5 text-redstone-red" />
                        </div>
                      )}
                      <button
                        onClick={() =>
                          item.id !== undefined && removeHistory(item.id)
                        }
                        className="w-8 h-8 flex items-center justify-center text-redstone-red hover:bg-redstone-red/10 rounded-lg transition-colors"
                        aria-label="Remove from history"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
