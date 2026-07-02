'use client';

import React, { useState } from 'react';
import { useAllergySettings } from '@/contexts/AllergyContext';
import { useIsPremium } from '@/lib/premium';
import { cn } from '@/lib/utils';
import { Plus, X, Trash2, Lock } from 'lucide-react';
import { ConfirmationModal } from '@/components/ConfirmationModal';

const KID_EMOJIS = ['🐱', '🐶', '🐻', '🦊', '🐼', '🐨', '🐯', '🦁', '🐸', '🐵'];

interface ProfileSelectorProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileSelector({ isOpen, onClose }: ProfileSelectorProps) {
  const {
    profiles,
    activeProfile,
    setActiveProfileId,
    createProfile,
    deleteProfile,
  } = useAllergySettings();
  const isPremium = useIsPremium();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('🐱');
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    profile?: { id: string; name: string };
  }>({ isOpen: false });

  if (!isOpen) return null;

  const handleAddProfile = async () => {
    if (!newName.trim()) return;
    await createProfile(newName.trim(), selectedEmoji);
    setNewName('');
    setShowAddForm(false);
  };

  const handleDeleteProfile = async (id: string) => {
    if (id === activeProfile?.id) return; // Can't delete active profile
    await deleteProfile(id);
  };

  const handleRemoveClick = (profile: { id: string; name: string }) => {
    setModalConfig({ isOpen: true, profile });
  };

  const handleConfirmDelete = async () => {
    if (modalConfig.profile?.id) {
      await handleDeleteProfile(modalConfig.profile.id);
    }
    setModalConfig({ isOpen: false });
  };

  const handleCloseModal = () => {
    setModalConfig({ isOpen: false });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-theme-bg border-4 border-theme-border shadow-voxel rounded-t-3xl sm:rounded-3xl p-6 space-y-6 animate-pop">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-display font-black text-theme-bg">
            Profiles
          </h2>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center border-4 border-theme-border rounded-full bg-theme-text shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:scale-95 transition-transform"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile List */}
        <div className="space-y-3">
          {profiles.map((profile) => (
            <div
              key={profile.id}
              className={cn(
                'flex items-center gap-4 p-4 border-4 rounded-2xl transition-all',
                profile.id === activeProfile?.id
                  ? 'border-theme-primary bg-theme-primary/10'
                  : 'border-theme-border bg-theme-text',
              )}
            >
              <button
                onClick={() => setActiveProfileId(profile.id)}
                className="flex items-center gap-4 flex-1"
              >
                <span className="text-4xl">{profile.emoji}</span>
                <div>
                  <p className="font-display font-black text-xl text-theme-bg">
                    {profile.name}
                  </p>
                  <p className="text-sm text-theme-bg/60 font-bold">
                    {profile.allergies.length > 0
                      ? `${profile.allergies.length} allergy${profile.allergies.length > 1 ? 'ies' : ''}`
                      : 'No allergies'}
                  </p>
                </div>
              </button>

              {profile.id !== activeProfile?.id && (
                <button
                  onClick={() =>
                    handleRemoveClick({ id: profile.id, name: profile.name })
                  }
                  className="w-10 h-10 flex items-center justify-center border-4 border-theme-border rounded-full bg-redstone-red/10 text-redstone-red shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:scale-95 transition-transform"
                  aria-label={`Delete ${profile.name}`}
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}

          {/* Add Profile Button */}
          {!showAddForm ? (
            <button
              onClick={() => {
                if (!isPremium && profiles.length >= 1) {
                  setShowPremiumModal(true);
                  return;
                }
                setShowAddForm(true);
              }}
              className={cn(
                'w-full flex items-center justify-center gap-3 p-4 border-4 border-dashed border-theme-border rounded-2xl text-xl font-black transition-all active:scale-95',
                !isPremium && profiles.length >= 1
                  ? 'bg-theme-accent/10 text-theme-accent'
                  : 'bg-theme-text text-theme-bg/60 hover:bg-theme-bg/50',
              )}
            >
              <Plus className="w-6 h-6" />
              Add Profile
              {!isPremium && profiles.length >= 1 && (
                <Lock className="w-5 h-5" />
              )}
            </button>
          ) : (
            <div className="p-4 border-4 border-theme-primary rounded-2xl bg-theme-primary/10 space-y-4">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Profile name"
                className="w-full p-3 border-4 border-theme-border rounded-xl font-bold text-xl text-theme-bg bg-theme-text"
                autoFocus
              />

              <div className="flex flex-wrap gap-2">
                {KID_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => setSelectedEmoji(emoji)}
                    className={cn(
                      'w-12 h-12 flex items-center justify-center text-2xl border-4 rounded-xl transition-all',
                      selectedEmoji === emoji
                        ? 'border-theme-primary bg-theme-primary/20'
                        : 'border-theme-border bg-theme-text hover:bg-theme-bg/50',
                    )}
                  >
                    {emoji}
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 p-3 border-4 border-theme-border rounded-xl font-black text-lg bg-theme-text text-theme-bg/60 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:scale-95 transition-transform"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddProfile}
                  className="flex-1 p-3 border-4 border-theme-border rounded-xl font-black text-lg bg-theme-primary text-theme-bg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:scale-95 transition-transform"
                >
                  Save
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Premium Modal */}
        {showPremiumModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setShowPremiumModal(false)}
            />
            <div className="relative w-full max-w-sm bg-theme-bg border-4 border-theme-border shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-3xl p-6 space-y-4 animate-pop">
              <div className="flex items-center justify-center gap-3 p-4 bg-theme-accent/10 border-4 border-theme-accent rounded-2xl">
                <Lock className="w-8 h-8 text-theme-accent" />
                <span className="text-2xl font-display font-black text-theme-accent">
                  Premium Feature
                </span>
              </div>
              <p className="text-center text-xl font-bold text-theme-bg/80">
                Unlock Premium to create multiple profiles!
              </p>
              <button
                onClick={() => setShowPremiumModal(false)}
                className="w-full p-4 border-4 border-theme-border rounded-xl font-black text-xl bg-theme-primary text-theme-bg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:scale-95 transition-transform"
              >
                Got it!
              </button>
            </div>
          </div>
        )}
      </div>
      <ConfirmationModal
        isOpen={modalConfig.isOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmDelete}
        title="Delete Profile?"
        message={`Are you sure you want to remove ${modalConfig.profile?.name || 'this profile'}?`}
      />
    </div>
  );
}
