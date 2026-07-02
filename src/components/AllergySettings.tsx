'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Trash2 } from 'lucide-react';
import { AllergyList } from '@/components/AllergyList';
import { CustomAllergyInput } from '@/components/CustomAllergyInput';
import { CustomAllergiesDisplay } from '@/components/CustomAllergiesDisplay';
import { ConfirmationModal } from '@/components/ConfirmationModal';
import { PremiumGate } from '@/components/PremiumGate';

import { useAllergySettings } from '@/contexts/AllergyContext';
import { useIsPremium } from '@/lib/premium';
import { PROFILE_EMOJIS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { dbService } from '@/lib/db';

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
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    type: 'RESET_ALLERGIES' | 'DELETE_PROFILE' | null;
    profile?: { id: string; name: string };
  }>({ isOpen: false, type: null });
  const [newName, setNewName] = useState('');
  const [newEmoji, setNewEmoji] = useState('🧒');

  const handleCreate = async () => {
    if (!newName.trim()) return;
    const profile = await createProfile(newName.trim(), newEmoji);
    if (profile) {
      await dbService.saveProfile({ ...profile, isAdult: true });
    }
    setNewName('');
    setNewEmoji('🧒');
    setIsCreatingProfile(false);
  };

  const handleConfirmReset = async () => {
    await clearAllergies();
    setModalConfig({ isOpen: false, type: null });
  };

  const handleConfirmDeleteProfile = async () => {
    if (modalConfig.profile?.id) {
      await deleteProfile(modalConfig.profile.id);
    }
    setModalConfig({ isOpen: false, type: null });
  };

  const handleCloseModal = () => {
    setModalConfig({ isOpen: false, type: null });
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
        className="bg-theme-bg shadow-lg p-8 max-w-md w-full max-h-[90vh] overflow-y-auto rounded-3xl"
        role="document"
      >
        <div className="flex items-center justify-between mb-8">
          <h2
            id="allergy-settings-title"
            className="text-4xl font-display font-black text-theme-text leading-tight uppercase tracking-tighter"
          >
            My Allergies
          </h2>
          <button
            onClick={() =>
              setModalConfig({ isOpen: true, type: 'RESET_ALLERGIES' })
            }
            className="bg-theme-primary px-6 py-2 rounded-full shadow-lg hover:shadow-[0_8px_16px_rgba(0,0,0,0.1)] active:shadow-md transition-all text-theme-text font-black text-xs uppercase"
            aria-label="Reset all allergies"
            title="Reset"
          >
            RESET
          </button>
        </div>

        {/* Profile Switcher */}
        <div className="mb-10 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-theme-text font-display font-black text-xl uppercase tracking-wide">
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
                className="p-3 bg-theme-primary rounded-lg shadow-lg hover:shadow-[0_8px_16px_rgba(0,0,0,0.1)] active:shadow-md transition-all"
                aria-label="Add new person"
              >
                <UserPlus className="w-6 h-6 text-theme-text" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            {profiles.map((profile) => (
              <div key={profile.id} className="relative group">
                <button
                  onClick={() => setActiveProfileId(profile.id)}
                  className={cn(
                    'flex items-center gap-2 px-5 py-3 rounded-2xl transition-all shadow-lg',
                    activeProfile?.id === profile.id
                      ? 'bg-theme-primary text-theme-text'
                      : 'bg-white text-theme-text hover:bg-theme-bg/50',
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
                      setModalConfig({
                        isOpen: true,
                        type: 'DELETE_PROFILE',
                        profile: { id: profile.id, name: profile.name },
                      });
                    }}
                    className="absolute -top-2 -right-2 p-2 bg-redstone-red text-white rounded-full border-2 border-theme-border shadow-lg"
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
                <div className="bg-white p-4 rounded-2xl space-y-3 shadow-lg">
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Name"
                    className="w-full bg-theme-bg border-0 p-4 rounded-xl font-body font-bold text-theme-text placeholder:text-theme-text/40 shadow-lg"
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
                            'text-xl p-1.5 rounded-lg transition-all shrink-0 active:scale-95 shadow-lg',
                            newEmoji === e
                              ? 'bg-theme-accent scale-110'
                              : 'bg-theme-bg/50 hover:bg-theme-bg',
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
                      className="flex-1 bg-theme-primary py-2 rounded-xl text-sm font-black uppercase text-theme-text shadow-lg hover:shadow-[0_8px_16px_rgba(0,0,0,0.1)] transition-all"
                    >
                      Create
                    </button>
                    <button
                      onClick={() => setIsCreatingProfile(false)}
                      className="flex-1 bg-theme-bg py-2 rounded-xl text-sm font-black uppercase text-theme-text shadow-lg hover:shadow-[0_8px_16px_rgba(0,0,0,0.1)] transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="border-t-2 border-theme-border/30 pt-8 mb-8">
          <div className="text-theme-text font-body font-bold mb-8 leading-relaxed text-lg px-4 py-3 border-l-4 border-theme-accent bg-theme-primary/20 rounded-xl">
            Pick the allergen you need to watch out for!
          </div>

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
          className="w-full bg-theme-primary py-7 rounded-3xl text-3xl font-display font-black shadow-lg active:shadow-md hover:shadow-[0_12px_24px_rgba(0,0,0,0.15)] transition-all text-theme-text"
          aria-label="Save and close allergy settings"
        >
          DONE!
        </button>
      </motion.div>
      {showProfileGate && (
        <PremiumGate
          feature="Multiple profiles"
          onClose={() => setShowProfileGate(false)}
        />
      )}
      <ConfirmationModal
        isOpen={modalConfig.isOpen}
        onClose={handleCloseModal}
        onConfirm={
          modalConfig.type === 'RESET_ALLERGIES'
            ? handleConfirmReset
            : handleConfirmDeleteProfile
        }
        title={
          modalConfig.type === 'RESET_ALLERGIES'
            ? 'Clear All?'
            : 'Delete Profile?'
        }
        message={
          modalConfig.type === 'RESET_ALLERGIES'
            ? 'Are you sure you want to reset all your allergen settings?'
            : `Are you sure you want to remove ${modalConfig.profile?.name || 'this profile'}?`
        }
      />
    </div>
  );
}
