'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { HumanCat, HumanDinosaur, Browser } from 'react-kawaii';
import { UserPlus, Camera, ArrowRight } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
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
  const { theme } = useTheme();

  const profileColors = {
    girl: theme === 'kitty' ? '#ff69b4' : '#ff69b4',
    boy: theme === 'minecraft' ? '#79d461' : '#79d461',
  };
  const [isCreating, setIsCreating] = useState(false);
  const [showProfileGate, setShowProfileGate] = useState(false);
  const [newName, setNewName] = useState('');
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
    await createProfile(newName.trim(), '🧒', localAllergies);
    setNewName('');
    setLocalAllergies([]);
    setIsCreating(false);
  };

  // Don't flash the setup modal before the stored profile pointer resolves.
  if (!isHydrated) return null;

  if (profiles.length === 0) {
    return (
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm overflow-y-auto"
        role="dialog"
        aria-modal="true"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          className="bg-theme-bg shadow-lg p-8 max-w-xl w-full rounded-3xl text-center overflow-y-auto max-h-[90vh] my-4"
        >
          <h2 className="text-4xl font-display font-black text-theme-text uppercase tracking-tighter mb-2">
            Who are you?
          </h2>
          <p className="text-lg text-theme-text/70 font-body mb-8">
            Your snack journey starts here
          </p>
          <div className="space-y-6">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Your name"
              className="w-full bg-white border-0 p-4 rounded-2xl font-body font-bold text-theme-text placeholder:text-theme-text/40 focus:outline-none focus:ring-4 focus:ring-theme-accent shadow-lg"
            />

            <div className="bg-theme-primary/10 p-6 rounded-2xl space-y-6 shadow-lg">
              <h3 className="text-xl font-display font-black text-theme-text uppercase tracking-wide">
                🎯 Any allergies?
              </h3>
              <p className="text-sm text-theme-text/70 font-body">
                We can add more later!
              </p>
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

            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCreate}
              disabled={!newName.trim()}
              className="w-full bg-theme-primary py-4 rounded-3xl text-2xl font-display font-black shadow-lg hover:shadow-[0_12px_24px_rgba(0,0,0,0.15)] active:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3 text-theme-text"
            >
              <Camera className="w-8 h-8" aria-hidden="true" />
              <span>START SCANNING!</span>
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (profiles.length > 1 && !activeProfile) {
    return (
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm overflow-y-auto"
        role="dialog"
        aria-modal="true"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, rotate: 2 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          className="bg-theme-bg shadow-lg p-8 max-w-md w-full rounded-3xl my-4"
        >
          <h2 className="text-4xl font-display font-black text-theme-text uppercase tracking-tighter mb-8 text-center">
            Who is scanning?
          </h2>
          <div className="grid grid-cols-2 gap-4 mb-8">
            {profiles.map((p, idx) => (
              <motion.button
                key={p.id}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveProfileId(p.id)}
                className="flex flex-col items-center gap-2 p-4 bg-theme-primary rounded-2xl shadow-lg hover:shadow-[0_12px_24px_rgba(0,0,0,0.15)] transition-all"
              >
                {idx % 2 === 0 ? (
                  <HumanCat size={60} mood="happy" color={profileColors.girl} />
                ) : (
                  <HumanDinosaur
                    size={60}
                    mood="happy"
                    color={profileColors.boy}
                  />
                )}
                <span className="font-black uppercase text-center truncate text-theme-text text-sm">
                  {p.name}
                </span>
              </motion.button>
            ))}
          </div>
          <motion.button
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              if (!isPremium) {
                setShowProfileGate(true);
                return;
              }
              setIsCreating(true);
            }}
            className="w-full flex items-center justify-center gap-2 bg-theme-accent p-4 rounded-3xl font-black uppercase text-white shadow-lg hover:shadow-[0_12px_24px_rgba(0,0,0,0.15)] transition-all"
          >
            <UserPlus className="w-5 h-5" />
            Add New Person
          </motion.button>
          {showProfileGate && (
            <PremiumGate
              feature="Multiple profiles"
              onClose={() => setShowProfileGate(false)}
            />
          )}
          {isCreating && (
            <div className="mt-6 p-4 bg-white rounded-2xl space-y-4 shadow-lg">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Name"
                className="w-full bg-white border-0 p-3 rounded-2xl font-body font-bold text-theme-text placeholder:text-theme-text/40 shadow-lg focus:outline-none focus:ring-4 focus:ring-theme-accent"
              />
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCreate}
                  className="flex-1 bg-theme-primary py-3 rounded-2xl text-sm font-black uppercase text-theme-text shadow-lg hover:shadow-[0_8px_16px_rgba(0,0,0,0.15)] transition-all"
                >
                  Create
                </motion.button>
                <motion.button
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsCreating(false)}
                  className="flex-1 bg-white py-3 rounded-2xl text-sm font-black uppercase text-theme-text shadow-lg hover:shadow-[0_8px_16px_rgba(0,0,0,0.15)] transition-all"
                >
                  Cancel
                </motion.button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  return null;
}
