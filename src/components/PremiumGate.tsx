'use client';

import React, { useEffect, useState } from 'react';
import { CheckCircle2, AlertCircle, Crown, X } from 'lucide-react';
import { purchasePremium } from '@/lib/premium';

type PurchaseState = 'idle' | 'loading' | 'success' | 'error';

const FEATURES = [
  'Voice readout for every scan',
  'Custom allergens',
  'Multiple profiles',
  'Full scan history',
  'Unlimited allergens',
];

interface PremiumGateProps {
  feature: string;
  onClose: () => void;
}

export function PremiumGate({ feature, onClose }: PremiumGateProps) {
  const [state, setState] = useState<PurchaseState>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  // Auto-close 2 s after a successful purchase
  useEffect(() => {
    if (state !== 'success') return;
    const t = setTimeout(onClose, 2000);
    return () => clearTimeout(t);
  }, [state, onClose]);

  const handleSubscribe = async () => {
    setState('loading');
    setErrorMsg('');
    try {
      await purchasePremium();
      setState('success');
    } catch (err) {
      // >>> GOOGLE PLAY: surface real error codes here (user-cancelled, billing unavailable, etc.)
      setErrorMsg(
        err instanceof Error
          ? err.message
          : 'Purchase failed. Please try again.',
      );
      setState('error');
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div
        className="relative w-full max-w-sm bg-theme-bg border-4 border-theme-border shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-3xl p-6 space-y-5"
        role="dialog"
        aria-modal="true"
        aria-labelledby="premium-gate-title"
        aria-live="polite"
      >
        {/* Close — hidden during loading/success so the flow can't be interrupted */}
        {state === 'idle' || state === 'error' ? (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 text-theme-text/40 hover:text-theme-text transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        ) : null}

        {/* ── IDLE ───────────────────────────────────────────── */}
        {state === 'idle' && (
          <>
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="w-16 h-16 bg-theme-accent/20 border-4 border-theme-accent rounded-full flex items-center justify-center">
                <Crown className="w-8 h-8 text-theme-accent" />
              </div>
              <h3
                id="premium-gate-title"
                className="text-3xl font-display font-black text-theme-text uppercase tracking-tight"
              >
                Go Premium
              </h3>
              <p className="text-base font-bold text-theme-text/70 leading-snug">
                <span className="font-black text-theme-accent">{feature}</span>{' '}
                is a Premium feature. Unlock everything for $4.99/month.
              </p>
            </div>

            <ul className="space-y-2 border-t-2 border-theme-border/20 pt-4">
              {FEATURES.map((f) => (
                <li
                  key={f}
                  className="flex items-center gap-2 text-sm font-body font-bold text-theme-text/80"
                >
                  <Crown
                    className="w-4 h-4 text-theme-accent shrink-0"
                    aria-hidden="true"
                  />
                  {f}
                </li>
              ))}
            </ul>

            <button
              onClick={handleSubscribe}
              className="w-full bg-theme-accent border-4 border-theme-border py-4 rounded-2xl text-xl font-display font-black text-theme-border shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all"
            >
              Subscribe · $4.99/month
            </button>
            <button
              onClick={onClose}
              className="w-full text-center text-sm font-bold text-theme-text/40 py-1 hover:text-theme-text/60 transition-colors"
            >
              Maybe later
            </button>
          </>
        )}

        {/* ── LOADING ────────────────────────────────────────── */}
        {state === 'loading' && (
          <div className="flex flex-col items-center gap-5 py-8 text-center">
            <div
              className="w-16 h-16 rounded-full border-4 border-theme-accent/20 border-t-theme-accent animate-spin"
              aria-hidden="true"
            />
            <div>
              <p className="text-xl font-display font-black text-theme-text uppercase tracking-tight">
                Connecting to Play Store…
              </p>
              <p className="text-sm font-body font-bold text-theme-text/50 mt-1">
                Do not close this window
              </p>
            </div>
          </div>
        )}

        {/* ── SUCCESS ────────────────────────────────────────── */}
        {state === 'success' && (
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            <div className="w-20 h-20 bg-theme-primary/20 border-4 border-theme-primary rounded-full flex items-center justify-center">
              <CheckCircle2
                className="w-10 h-10 text-theme-primary"
                aria-hidden="true"
              />
            </div>
            <div>
              <p className="text-3xl font-display font-black text-theme-primary uppercase tracking-tight">
                You&apos;re Premium!
              </p>
              <p className="text-base font-body font-bold text-theme-text/60 mt-1">
                Subscription purchased. All features unlocked!
              </p>
            </div>
          </div>
        )}

        {/* ── ERROR ──────────────────────────────────────────── */}
        {state === 'error' && (
          <>
            <div className="flex flex-col items-center gap-4 py-4 text-center">
              <AlertCircle
                className="w-12 h-12 text-redstone-red"
                aria-hidden="true"
              />
              <div>
                <p className="text-xl font-display font-black text-theme-text uppercase">
                  Purchase Failed
                </p>
                <p className="text-sm font-body font-bold text-theme-text/60 mt-1">
                  {errorMsg || 'Something went wrong. Please try again.'}
                </p>
              </div>
            </div>
            <button
              onClick={handleSubscribe}
              className="w-full bg-theme-accent border-4 border-theme-border py-4 rounded-2xl text-xl font-display font-black text-theme-border shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all"
            >
              Try Again
            </button>
            <button
              onClick={onClose}
              className="w-full text-center text-sm font-bold text-theme-text/40 py-1 hover:text-theme-text/60 transition-colors"
            >
              Cancel
            </button>
          </>
        )}
      </div>
    </div>
  );
}
