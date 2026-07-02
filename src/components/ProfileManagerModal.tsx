'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Trash2 } from 'lucide-react';
import { useAllergySettings } from '@/contexts/AllergyContext';
import { ConfirmationModal } from '@/components/ConfirmationModal';

/**
 * Adult-only manager for deleting individual users. Each profile is listed
 * with a trash button; confirming removes that profile and its data (safe
 * foods, game stats). Opened from the delete button in the home top bar.
 */
export function ProfileManagerModal({ onClose }: { onClose: () => void }) {
  const { profiles, activeProfile, deleteProfile } = useAllergySettings();
  const [target, setTarget] = useState<{ id: string; name: string } | null>(
    null,
  );

  const handleConfirm = async () => {
    if (target) await deleteProfile(target.id);
    setTarget(null);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-manager-title"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-theme-bg shadow-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto rounded-3xl"
      >
        <div className="flex items-center justify-between mb-6">
          <h2
            id="profile-manager-title"
            className="text-3xl font-display font-black text-theme-text"
          >
            Manage Users
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-theme-text/60 hover:text-theme-text transition-colors"
            aria-label="Close"
          >
            <X className="w-6 h-6" aria-hidden="true" />
          </button>
        </div>

        <p className="text-sm font-bold text-theme-text/60 mb-4">
          Delete a user to remove their profile, allergies, safe foods, and game
          scores.
        </p>

        <ul className="space-y-3">
          {profiles.map((profile) => (
            <li
              key={profile.id}
              className="flex items-center gap-3 bg-white rounded-2xl shadow-lg p-4"
            >
              <span className="text-3xl" aria-hidden="true">
                {profile.emoji}
              </span>
              <span className="flex-1 min-w-0">
                <span className="block font-display font-black text-lg text-theme-text truncate">
                  {profile.name}
                </span>
                {activeProfile?.id === profile.id && (
                  <span className="text-xs font-black uppercase text-theme-accent">
                    Active
                  </span>
                )}
              </span>
              <button
                onClick={() =>
                  setTarget({ id: profile.id, name: profile.name })
                }
                className="w-10 h-10 flex items-center justify-center bg-redstone-red text-white rounded-full shadow-lg active:scale-90 transition-transform"
                aria-label={`Delete ${profile.name}`}
                title="Delete user"
              >
                <Trash2 className="w-5 h-5" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>

        <button
          onClick={onClose}
          className="mt-6 w-full py-4 bg-theme-primary text-theme-text font-display font-black rounded-3xl shadow-lg hover:shadow-xl active:scale-95 transition-all"
        >
          Done
        </button>
      </motion.div>

      <ConfirmationModal
        isOpen={target !== null}
        onClose={() => setTarget(null)}
        onConfirm={handleConfirm}
        title="Delete this user?"
        message={`This permanently removes ${target?.name ?? 'this user'} and all their data — allergies, safe foods, and game scores. This can't be undone.`}
        confirmText="Yes, delete"
        cancelText="No, keep"
      />
    </div>
  );
}
