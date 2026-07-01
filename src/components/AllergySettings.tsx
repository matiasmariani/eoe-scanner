'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Trash2 } from 'lucide-react';
import { useAllergySettings } from '@/contexts/AllergyContext';
import { AllergyList } from '@/components/AllergyList';
import { CustomAllergyInput } from '@/components/CustomAllergyInput';
import { CustomAllergiesDisplay } from '@/components/CustomAllergiesDisplay';
import { PremiumGate } from '@/components/PremiumGate';
import { useIsPremium } from '@/lib/premium';
import { PROFILE_EMOJIS } from '@/lib/constants';
import { cn } from '@/lib/utils';

export function AllergySettings({ onClose }: { onClose: () => void }) {
  const {
    allergies,
    toggleAllergy,
    clearAllergies,
    profiles,
    activeProfile,
    setActiveProfileId,
    createProfile,
    deleteProfile,
  } = useAllergySettings();

  const isPremium = useIsPremium();
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);
  const [showProfileGate, setShowProfileGate] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmoji, setNewEmoji] = useState('🧒');

  const handleCreate = async () => {
    if (!newName.trim()) return;
    await createProfile(newName.trim(), newEmoji);
    setNewName('');
    setNewEmoji('🧒');
    setIsCreatingProfile(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="allergy-settings-title"
    >
      <motion.div
        initial={{ opacity: 1, scale: 0.9, rotate: -2 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        exit={{ opacity: 0, scale: 0.9, rotate: 2 }}
        className="bg-theme-text border-4 border-theme-border shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-8 max-w-md w-full max-h-[90vh] overflow-y-auto rounded-[3rem]"
        role="document"
      >
        <div className="flex items-center justify-between mb-8">
          <h2
            id="allergy-settings-title"
            className="text-4xl font-display font-black text-theme-bg leading-tight uppercase tracking-tighter"
          >
            My Allergies
          </h2>
          {confirmReset ? (
            <div className="flex gap-2">
              <button
                onClick={async () => {
                  await clearAllergies();
                  setConfirmReset(false);
                }}
                className="bg-redstone-red border-4 border-theme-border px-4 py-2 rounded-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none transition-all"
                aria-label="Confirm — clear all allergies"
              >
                <span className="text-xs font-black uppercase text-theme-text">
                  Clear all?
                </span>
              </button>
              <button
                onClick={() => setConfirmReset(false)}
                className="bg-theme-bg border-4 border-theme-border px-4 py-2 rounded-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none transition-all"
                aria-label="Cancel reset"
              >
                <span className="text-xs font-black uppercase text-theme-text">
                  Cancel
                </span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmReset(true)}
              className="bg-theme-bg border-4 border-theme-border px-6 py-2 rounded-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-[1px] active:shadow-none transition-all"
              aria-label="Reset all allergies"
            >
              <span className="text-xs font-black uppercase text-redstone-red">
                RESET
              </span>
            </button>
          )}
        </div>

        {/* Profile Switcher */}
        <div className="mb-10 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-theme-bg font-display font-black text-xl uppercase tracking-wide">
              Who is scanning?
            </span>
            {!isCreatingProfile && (
              <button
                onClick={() => {
                  if (!isPremium && profiles.length >= 1) {
                    setShowProfileGate(true);
                    return;
                  }
                  setIsCreatingProfile(true);
                }}
                className="p-2 bg-theme-accent border-2 border-theme-border rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-[1px] active:translate-y-[1px] transition-all"
                aria-label="Add new person"
              >
                <UserPlus className="w-5 h-5 text-theme-border" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            {profiles.map((profile) => (
              <div key={profile.id} className="relative group">
                <button
                  onClick={() => setActiveProfileId(profile.id)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 border-2 rounded-2xl transition-all active:translate-x-[1px] active:translate-y-[1px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]',
                    activeProfile?.id === profile.id
                      ? 'bg-theme-bg text-theme-text border-theme-border'
                      : 'bg-theme-bg/40 text-theme-bg border-theme-border/40 hover:border-theme-border/60',
                  )}
                >
                  <span className="text-xl">{profile.emoji}</span>
                  <span className="text-sm font-black uppercase">
                    {profile.name}
                  </span>
                </button>
                {profiles.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Delete ${profile.name}?`)) {
                        deleteProfile(profile.id);
                      }
                    }}
                    className="absolute -top-2 -right-2 p-2 bg-redstone-red text-theme-text rounded-full border-2 border-theme-border shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
                    aria-label={`Delete ${profile.name}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <AnimatePresence>
            {isCreatingProfile && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-theme-bg border-4 border-theme-border p-4 rounded-2xl space-y-3">
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Name"
                    className="w-full bg-theme-bg border-2 border-theme-border p-2 rounded-xl font-body font-bold text-theme-text placeholder:text-theme-text/40"
                    autoFocus
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
                      className="flex-1 bg-theme-accent border-2 border-theme-border py-2 rounded-xl text-sm font-black uppercase text-theme-border shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-[1px] active:translate-y-[1px] transition-all"
                    >
                      Create
                    </button>
                    <button
                      onClick={() => setIsCreatingProfile(false)}
                      className="flex-1 bg-theme-bg border-2 border-theme-border py-2 rounded-xl text-sm font-black uppercase text-theme-text shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-[1px] active:translate-y-[1px] transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="border-t-4 border-theme-border/30 pt-8 mb-8">
          <p className="text-theme-bg/80 font-body font-bold mb-8 leading-relaxed text-xl px-2 border-l-4 border-theme-accent pl-4">
            Pick the allergen you need to watch out for!
          </p>

          <div
            className="space-y-8 mb-10"
            role="group"
            aria-label="Allergy options"
          >
            <AllergyList allergies={allergies} toggleAllergy={toggleAllergy} />

            <CustomAllergiesDisplay
              allergies={allergies}
              removeAllergy={toggleAllergy}
            />

            <CustomAllergyInput
              onAdd={(value, emoji) => toggleAllergy(`${emoji}:${value}`)}
            />
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full bg-theme-primary border-4 border-theme-border py-7 rounded-[2.5rem] text-3xl font-display font-black shadow-[0_8px_0_0_rgba(0,170,0,0.5)] active:shadow-none hover:-translate-y-[2px] transition-all"
          aria-label="Save and close allergy settings"
        >
          GOT IT!
        </button>
      </motion.div>
      {showProfileGate && (
        <PremiumGate
          feature="Multiple profiles"
          onClose={() => setShowProfileGate(false)}
        />
      )}
    </div>
  );
}
