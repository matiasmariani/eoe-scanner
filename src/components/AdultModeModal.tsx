'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Key, HelpCircle, Check } from 'lucide-react';
import { OTPInput } from 'input-otp';
import { dbService } from '@/lib/db';
import { useAllergySettings } from '@/contexts/AllergyContext';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={cn(
          'w-full max-w-md p-8 bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-2xl',
          'data-[theme=kitty]:bg-pink-50 data-[theme=kitty]:border-[#2C2C2C] data-[theme=kitty]:shadow-[8px_8px_0px_0px_rgba(44,44,44,1)] data-[theme=kitty]:rounded-3xl',
        )}
      >
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-100 border-2 border-black rounded-lg">
              <Lock className="w-6 h-6 text-amber-600" />
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tight">
              Adult Gate
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-black font-bold"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6">
          {error && (
            <p className="text-sm font-bold text-red-600 bg-red-50 p-2 border-2 border-red-600 rounded-lg text-center">
              {error}
            </p>
          )}

          {view === 'pin-entry' && (
            <div className="space-y-4">
              <p className="text-sm font-medium text-gray-600 text-center">
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
                          className="w-14 h-14 text-center text-2xl font-black border-4 border-black bg-white text-black rounded-xl flex items-center justify-center"
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
                className="w-full py-4 bg-green-500 text-white font-black uppercase border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all"
              >
                {adultMode ? 'Lock Adult Mode' : 'Unlock Now'}
              </button>

              <button
                onClick={() => {
                  setView('pin-recovery');
                  setError('');
                }}
                className="w-full py-2 text-sm font-bold text-gray-500 hover:text-black transition-colors"
              >
                Forgot PIN?
              </button>
            </div>
          )}

          {view === 'pin-setup' && (
            <div className="space-y-4">
              <p className="text-sm font-medium text-gray-600 text-center">
                Set up your adult access credentials
              </p>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-black uppercase text-gray-500 mb-1 block">
                    4-Digit PIN
                  </label>
                  <input
                    type="text"
                    maxLength={4}
                    placeholder="1234"
                    className="w-full p-3 border-4 border-black bg-white text-black rounded-xl font-black text-xl"
                    value={setupPin}
                    onChange={(e) => setSetupPin(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-black uppercase text-gray-500 mb-1 block">
                    Security Question
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. First pet's name?"
                    className="w-full p-3 border-4 border-black bg-white text-black rounded-xl font-bold"
                    value={setupQuestion}
                    onChange={(e) => setSetupQuestion(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-black uppercase text-gray-500 mb-1 block">
                    Answer
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Buddy"
                    className="w-full p-3 border-4 border-black bg-white text-black rounded-xl font-bold"
                    value={setupAnswer}
                    onChange={(e) => setSetupAnswer(e.target.value)}
                  />
                </div>
              </div>
              <button
                onClick={handleCompleteSetup}
                className="w-full py-4 bg-green-500 text-white font-black uppercase border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all"
              >
                Save & Unlock
              </button>
            </div>
          )}

          {view === 'pin-recovery' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 justify-center mb-2">
                <HelpCircle className="w-5 h-5 text-amber-600" />
                <p className="text-sm font-medium text-gray-600">
                  Verify your identity
                </p>
              </div>
              <div className="space-y-3">
                <div className="p-3 bg-amber-50 border-2 border-amber-200 rounded-lg text-center italic font-medium text-amber-800">
                  {recoveryQuestion || 'Loading question...'}
                </div>
                <input
                  type="text"
                  placeholder="Your answer"
                  className="w-full p-3 border-4 border-black bg-white text-black rounded-xl font-bold"
                  value={recoveryAnswer}
                  onChange={(e) => setRecoveryAnswer(e.target.value)}
                />
              </div>
              <button
                onClick={handleRecoverPin}
                className="w-full py-4 bg-amber-500 text-white font-black uppercase border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all"
              >
                Verify Answer
              </button>
              <button
                onClick={() => {
                  setView('pin-entry');
                  setError('');
                }}
                className="w-full py-2 text-sm font-bold text-gray-500 hover:text-black transition-colors"
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
