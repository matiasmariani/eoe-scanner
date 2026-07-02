'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, HelpCircle, X } from 'lucide-react';
import { OTPInput } from 'input-otp';
import { dbService } from '@/lib/db';
import { useAllergySettings } from '@/contexts/AllergyContext';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/utils';

type ModalView = 'pin-entry' | 'pin-setup' | 'pin-recovery';

export function AdultModeModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { setAdultMode, adultMode } = useAllergySettings();
  const { theme } = useTheme();
  const [view, setView] = useState<ModalView>('pin-entry');
  const [pin, setPin] = useState('');
  const [setupPin, setSetupPin] = useState('');
  const [setupQuestion, setSetupQuestion] = useState('');
  const [setupAnswer, setSetupAnswer] = useState('');
  const [recoveryAnswer, setRecoveryAnswer] = useState('');
  const [recoveryQuestion, setRecoveryQuestion] = useState('');
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (isOpen) {
      // Determine if first-time setup is needed
      dbService.getAdultPin().then((storedPin) => {
        if (!storedPin) {
          setView('pin-setup');
        } else {
          setView('pin-entry');
        }
      });
    }
    setError('');
    setPin('');
    setRecoveryAnswer('');
  }, [isOpen]);

  React.useEffect(() => {
    if (view === 'pin-recovery') {
      dbService
        .getAdultSecurityQuestion()
        .then((q) => setRecoveryQuestion(q || 'No question set.'));
    }
  }, [view]);

  const handleVerifyPin = async () => {
    const storedPin = await dbService.getAdultPin();
    if (storedPin && storedPin === pin) {
      setAdultMode(!adultMode);
      onClose();
    } else {
      setError('Incorrect PIN. Please try again.');
    }
  };

  const handleCompleteSetup = async () => {
    if (setupPin.length !== 4) {
      setError('PIN must be exactly 4 digits.');
      return;
    }
    if (!setupQuestion || !setupAnswer) {
      setError('Please provide both a security question and answer.');
      return;
    }
    await dbService.saveAdultPin(setupPin);
    await dbService.saveAdultSecurityQuestion(setupQuestion);
    await dbService.saveAdultSecurityAnswer(setupAnswer.toLowerCase().trim());
    setAdultMode(true);
    onClose();
  };

  const handleRecoverPin = async () => {
    const storedAnswer = await dbService.getAdultSecurityAnswer();
    if (storedAnswer && storedAnswer === recoveryAnswer.toLowerCase().trim()) {
      // Reset PIN flow - let them set a new one
      setView('pin-setup');
      setError('Answer correct! Please set a new PIN.');
    } else {
      setError('Incorrect answer. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md p-8 bg-theme-bg shadow-lg rounded-3xl"
      >
        <div className="flex justify-between items-start mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-theme-primary rounded-full shadow-lg">
              <Lock className="w-6 h-6 text-theme-text" />
            </div>
            <h2 className="text-3xl font-display font-black uppercase tracking-tight text-theme-text">
              Adult Mode
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-theme-text/60 hover:text-theme-text transition-colors"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6">
          {error && (
            <p className="text-sm font-bold text-redstone-red bg-redstone-red/10 p-3 rounded-2xl text-center shadow-lg">
              {error}
            </p>
          )}

          {view === 'pin-entry' && (
            <div className="space-y-4">
              <p className="text-sm font-body font-bold text-theme-text/70 text-center">
                Enter your 4-digit PIN to unlock adult settings
              </p>
              <div className="flex justify-center">
                <OTPInput
                  maxLength={4}
                  value={pin}
                  onChange={setPin}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleVerifyPin();
                  }}
                  render={({ slots }) => (
                    <div className="flex gap-2">
                      {slots.map((slot, i) => (
                        <div
                          key={i}
                          className="w-14 h-14 text-center text-2xl font-black border-0 bg-white text-theme-text rounded-2xl flex items-center justify-center shadow-lg"
                        >
                          {slot.char}
                        </div>
                      ))}
                    </div>
                  )}
                />
              </div>
              <button
                onClick={handleVerifyPin}
                className="w-full py-4 bg-theme-primary text-theme-text font-display font-black uppercase rounded-3xl shadow-lg hover:shadow-[0_8px_16px_rgba(0,0,0,0.1)] active:scale-95 transition-all"
              >
                {adultMode ? 'Lock Adult Mode' : 'Unlock Now'}
              </button>

              <button
                onClick={() => {
                  setView('pin-recovery');
                  setError('');
                }}
                className="w-full py-2 text-sm font-bold text-theme-text/60 hover:text-theme-text transition-colors"
              >
                Forgot PIN?
              </button>
            </div>
          )}

          {view === 'pin-setup' && (
            <div className="space-y-4">
              <p className="text-sm font-body font-bold text-theme-text/70 text-center">
                Set up your adult access credentials
              </p>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-body font-bold uppercase text-theme-text/60 mb-2 block">
                    4-Digit PIN
                  </label>
                  <input
                    type="text"
                    maxLength={4}
                    placeholder="1234"
                    className="w-full p-4 border-0 bg-white text-theme-text rounded-2xl font-black text-xl shadow-lg placeholder:text-theme-text/40 focus:outline-none focus:ring-4 focus:ring-theme-accent"
                    value={setupPin}
                    onChange={(e) => setSetupPin(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-body font-bold uppercase text-theme-text/60 mb-2 block">
                    Security Question
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. First pet's name?"
                    className="w-full p-4 border-0 bg-white text-theme-text rounded-2xl font-bold shadow-lg placeholder:text-theme-text/40 focus:outline-none focus:ring-4 focus:ring-theme-accent"
                    value={setupQuestion}
                    onChange={(e) => setSetupQuestion(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-body font-bold uppercase text-theme-text/60 mb-2 block">
                    Answer
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Buddy"
                    className="w-full p-4 border-0 bg-white text-theme-text rounded-2xl font-bold shadow-lg placeholder:text-theme-text/40 focus:outline-none focus:ring-4 focus:ring-theme-accent"
                    value={setupAnswer}
                    onChange={(e) => setSetupAnswer(e.target.value)}
                  />
                </div>
              </div>
              <button
                onClick={handleCompleteSetup}
                className="w-full py-4 bg-theme-primary text-theme-text font-display font-black uppercase rounded-3xl shadow-lg hover:shadow-[0_8px_16px_rgba(0,0,0,0.1)] active:scale-95 transition-all"
              >
                Save & Unlock
              </button>
            </div>
          )}

          {view === 'pin-recovery' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 justify-center mb-2">
                <HelpCircle className="w-5 h-5 text-theme-primary" />
                <p className="text-sm font-body font-bold text-theme-text/70">
                  Verify your identity
                </p>
              </div>
              <div className="space-y-3">
                <div className="p-4 bg-theme-primary/10 rounded-2xl text-center italic font-body font-bold text-theme-text shadow-lg">
                  {recoveryQuestion || 'Loading question...'}
                </div>
                <input
                  type="text"
                  placeholder="Your answer"
                  className="w-full p-4 border-0 bg-white text-theme-text rounded-2xl font-bold shadow-lg placeholder:text-theme-text/40 focus:outline-none focus:ring-4 focus:ring-theme-accent"
                  value={recoveryAnswer}
                  onChange={(e) => setRecoveryAnswer(e.target.value)}
                />
              </div>
              <button
                onClick={handleRecoverPin}
                className="w-full py-4 bg-theme-accent text-white font-display font-black uppercase rounded-3xl shadow-lg hover:shadow-[0_8px_16px_rgba(0,0,0,0.1)] active:scale-95 transition-all"
              >
                Verify Answer
              </button>
              <button
                onClick={() => {
                  setView('pin-entry');
                  setError('');
                }}
                className="w-full py-2 text-sm font-bold text-theme-text/60 hover:text-theme-text transition-colors"
              >
                Back to PIN
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
