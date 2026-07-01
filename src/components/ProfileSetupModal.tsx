'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { UserPlus } from 'lucide-react';
import { useAllergySettings } from '@/contexts/AllergyContext';
import { Allergy, PROFILE_EMOJIS } from '@/lib/constants';
import { AllergyList } from '@/components/AllergyList';
import { CustomAllergyInput } from '@/components/CustomAllergyInput';
import { CustomAllergiesDisplay } from '@/components/CustomAllergiesDisplay';
import { PremiumGate } from '@/components/PremiumGate';
import { useIsPremium } from '@/lib/premium';
import { cn } from '@/lib/utils';

export function ProfileSetupModal() {
  const {
    profiles,
    activeProfile,
    setActiveProfileId,
    createProfile,
    isHydrated,
  } = useAllergySettings();
  const isPremium = useIsPremium();
  const [isCreating, setIsCreating] = useState(false);
  const [showProfileGate, setShowProfileGate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmoji, setNewEmoji] = useState('🧒');
  const [localAllergies, setLocalAllergies] = useState<Allergy[]>([]);

  const toggleLocalAllergy = (allergy: Allergy) => {
    setLocalAllergies((prev) =>
      prev.includes(allergy)
        ? prev.filter((a) => a !== allergy)
        : [...prev, allergy],
    );
  };

  const handleCreate = async () => {
    if (!newName.trim()) return;
    await createProfile(newName.trim(), newEmoji, localAllergies);
    setNewName('');
    setNewEmoji('🧒');
    setLocalAllergies([]);
    setIsCreating(false);
  };

  // Don't flash the setup modal before the stored profile pointer resolves.
  if (!isHydrated) return null;

  if (profiles.length === 0) {
    return (
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
        role="dialog"
        aria-modal="true"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          className="bg-theme-text border-4 border-theme-border shadow-voxel p-8 max-w-xl w-full rounded-[3rem] text-center overflow-y-auto max-h-[90vh]"
        >
          <h2 className="text-4xl font-display font-black text-theme-bg uppercase tracking-tighter mb-8">
            Who are you?
          </h2>
          <div className="space-y-6">
            <div className="flex flex-col gap-4">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Your name"
                className="w-full bg-theme-bg border-2 border-theme-border p-4 rounded-2xl font-body font-bold text-theme-text placeholder:text-theme-text/40 focus:outline-none focus:ring-4 focus:ring-theme-accent"
              />
              <div className="flex flex-wrap justify-center gap-2">
                {PROFILE_EMOJIS.map((e) => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => setNewEmoji(e)}
                    className={cn(
                      'text-3xl p-3 rounded-2xl border-2 transition-all active:scale-95',
                      newEmoji === e
                        ? 'bg-theme-accent border-theme-border scale-110'
                        : 'bg-theme-bg border-theme-border/30 hover:border-theme-border/60',
                    )}
                    aria-label={e}
                    aria-pressed={newEmoji === e}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-theme-bg/50 border-2 border-theme-border/50 p-6 rounded-[2rem] space-y-6">
              <h3 className="text-xl font-display font-black text-theme-bg uppercase tracking-wide">
                Any allergies?
              </h3>
              <AllergyList
                allergies={localAllergies}
                toggleAllergy={toggleLocalAllergy}
              />
              <CustomAllergiesDisplay
                allergies={localAllergies}
                removeAllergy={toggleLocalAllergy}
              />
              <CustomAllergyInput
                onAdd={(value, emoji) =>
                  toggleLocalAllergy(`${emoji}:${value}`)
                }
              />
            </div>

            <button
              onClick={handleCreate}
              disabled={!newName.trim()}
              className="w-full bg-theme-primary border-4 border-theme-border py-4 rounded-[2.5rem] text-2xl font-display font-black shadow-[0_4px_0_0_rgba(0,170,0,0.5)] active:shadow-none disabled:opacity-50 transition-all hover:-translate-y-[2px]"
            >
              START SCANNING!
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (profiles.length > 1 && !activeProfile) {
    return (
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
        role="dialog"
        aria-modal="true"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, rotate: 2 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          className="bg-theme-text border-4 border-theme-border shadow-voxel p-8 max-w-md w-full rounded-[3rem]"
        >
          <h2 className="text-4xl font-display font-black text-theme-bg uppercase tracking-tighter mb-8 text-center">
            Who is scanning?
          </h2>
          <div className="grid grid-cols-2 gap-4 mb-8">
            {profiles.map((p) => (
              <button
                key={p.id}
                onClick={() => setActiveProfileId(p.id)}
                className="flex items-center gap-3 p-4 bg-theme-bg border-4 border-theme-border rounded-2xl shadow-voxel active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all hover:-translate-y-[1px]"
              >
                <span className="text-2xl">{p.emoji}</span>
                <span className="font-black uppercase truncate text-theme-text">
                  {p.name}
                </span>
              </button>
            ))}
          </div>
          <button
            onClick={() => {
              if (!isPremium) {
                setShowProfileGate(true);
                return;
              }
              setIsCreating(true);
            }}
            className="w-full flex items-center justify-center gap-2 bg-theme-accent border-4 border-theme-border p-4 rounded-2xl font-black uppercase text-theme-border shadow-voxel active:translate-y-[1px] transition-all"
          >
            <UserPlus className="w-5 h-5" />
            Add New Person
          </button>
          {showProfileGate && (
            <PremiumGate
              feature="Multiple profiles"
              onClose={() => setShowProfileGate(false)}
            />
          )}
          {isCreating && (
            <div className="mt-6 p-4 bg-theme-bg border-4 border-theme-border rounded-2xl space-y-4">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Name"
                className="w-full bg-theme-bg border-2 border-theme-border p-2 rounded-xl font-body font-bold text-theme-text placeholder:text-theme-text/40"
              />
              <div className="overflow-x-auto -mx-1 px-1">
                <div className="flex gap-1.5 pb-0.5">
                  {PROFILE_EMOJIS.map((e) => (
                    <button
                      key={e}
                      type="button"
                      onClick={() => setNewEmoji(e)}
                      className={cn(
                        'text-xl p-1.5 rounded-lg border-2 transition-all shrink-0 active:scale-95',
                        newEmoji === e
                          ? 'bg-theme-accent border-theme-border scale-110'
                          : 'border-transparent hover:border-theme-border/40',
                      )}
                      aria-label={e}
                      aria-pressed={newEmoji === e}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleCreate}
                  className="flex-1 bg-theme-primary border-2 border-theme-border py-2 rounded-xl text-sm font-black uppercase text-theme-text shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]"
                >
                  Create
                </button>
                <button
                  onClick={() => setIsCreating(false)}
                  className="flex-1 bg-theme-bg border-2 border-theme-border py-2 rounded-xl text-sm font-black uppercase text-theme-text shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  return null;
}
