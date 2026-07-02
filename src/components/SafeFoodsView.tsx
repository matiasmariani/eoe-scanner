'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Mail, Copy, Check, Edit2, X } from 'lucide-react';
import { useSafeFoods } from '@/hooks/useSafeFoods';
import { useAllergySettings } from '@/contexts/AllergyContext';
import { useIsPremium } from '@/lib/premium';
import { AddSafeFoodModal } from '@/components/AddSafeFoodModal';
import { ConfirmationModal } from '@/components/ConfirmationModal';
import { PremiumGate } from '@/components/PremiumGate';
import { SnackScout } from '@/components/SnackScout';
import { generateAllergenEmail } from '@/lib/email-generator';
import { SafeFood } from '@/lib/db';

interface SafeFoodsViewProps {
  profileId?: string;
  onClose: () => void;
}

export function SafeFoodsView({ profileId, onClose }: SafeFoodsViewProps) {
  const { safeFoods, deleteSafeFood, updateSafeFood } = useSafeFoods(profileId);
  const { activeProfile, allergies, adultMode } = useAllergySettings();
  const isPremium = useIsPremium();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPremiumGate, setShowPremiumGate] = useState(false);
  const [copied, setCopied] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editBrand, setEditBrand] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    foodId?: string;
    foodName?: string;
  }>({
    isOpen: false,
  });

  const handleEmail = () => {
    if (!isPremium) {
      setShowPremiumGate(true);
      return;
    }

    try {
      const text = generateAllergenEmail(
        activeProfile?.name || 'Me',
        allergies,
        safeFoods,
      );
      const subject = `${activeProfile?.name}'s Safe Foods & Allergens`;
      const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;

      // Create and click an anchor element - more reliable on Windows
      const link = document.createElement('a');
      link.href = mailtoLink;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Email error:', err);
      alert(
        'Could not open email client. Please use Copy to clipboard and compose manually.',
      );
    }
  };

  const handleCopy = async () => {
    if (!isPremium) {
      setShowPremiumGate(true);
      return;
    }

    const text = generateAllergenEmail(
      activeProfile?.name || 'Me',
      allergies,
      safeFoods,
    );
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const startEdit = (food: SafeFood) => {
    setEditingId(food.id);
    setEditName(food.name);
    setEditBrand(food.brand || '');
    setEditNotes(food.notes || '');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditBrand('');
    setEditNotes('');
  };

  const saveEdit = async (id: string) => {
    if (!editName.trim()) return;
    await updateSafeFood(id, {
      name: editName.trim(),
      brand: editBrand.trim() || undefined,
      notes: editNotes.trim() || undefined,
    });
    cancelEdit();
  };

  const confirmDelete = (food: SafeFood) => {
    setDeleteConfirm({ isOpen: true, foodId: food.id, foodName: food.name });
  };

  const handleConfirmDelete = async () => {
    if (deleteConfirm.foodId) {
      await deleteSafeFood(deleteConfirm.foodId);
    }
    setDeleteConfirm({ isOpen: false });
  };

  return (
    <div className="min-h-screen bg-theme-bg flex flex-col">
      <header className="w-full max-w-md mx-auto px-6 py-8 flex items-center justify-between gap-4">
        <SnackScout size="sm" />
        <button
          onClick={onClose}
          className="p-3 bg-theme-text rounded-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-4 border-theme-primary text-theme-primary hover:bg-theme-primary hover:text-theme-text transition-all active:scale-90"
          aria-label="Close safe foods"
        >
          <X className="w-6 h-6" aria-hidden="true" />
        </button>
      </header>

      <div className="flex-1 w-full max-w-md mx-auto px-4 pb-16 flex flex-col">
        {/* Title Section */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-display font-black text-theme-text">
            Safe Foods
          </h2>
          <p className="text-lg font-bold text-theme-primary mt-1">
            {safeFoods.length > 0
              ? `${safeFoods.length} saved · Parent approved ✓`
              : 'Create a list of trusted foods'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pb-4">
          <button
            onClick={() => setShowAddModal(true)}
            className="w-full flex items-center justify-center gap-2 bg-theme-primary text-theme-border border-4 border-theme-border px-6 py-4 rounded-2xl font-display font-black shadow-voxel active:shadow-none active:translate-y-[2px] transition-all hover:-translate-y-[2px]"
            title="Add a new safe food"
            aria-label="Add safe food"
          >
            <Plus className="w-6 h-6" aria-hidden="true" />
            Add Safe Food
          </button>
          {safeFoods.length > 0 && (
            <div className="flex gap-2">
              <button
                onClick={handleEmail}
                className="flex-1 flex items-center justify-center gap-2 bg-theme-accent text-theme-bg border-4 border-theme-border px-4 py-3 rounded-2xl font-display font-black shadow-voxel active:shadow-none active:translate-y-[2px] transition-all hover:-translate-y-[2px]"
                title="Open email client with pre-filled allergen list"
                aria-label="Email safe foods and allergens"
              >
                <Mail className="w-6 h-6" aria-hidden="true" />
                Email
              </button>
              <button
                onClick={handleCopy}
                className="flex-1 flex items-center justify-center gap-2 bg-theme-text text-theme-bg border-4 border-theme-border px-4 py-3 rounded-2xl font-display font-black shadow-voxel active:shadow-none active:translate-y-[2px] transition-all hover:-translate-y-[2px]"
                title="Copy allergen list to clipboard"
                aria-label={
                  copied ? 'Copied to clipboard' : 'Copy to clipboard'
                }
              >
                {copied ? (
                  <Check className="w-6 h-6" />
                ) : (
                  <Copy className="w-6 h-6" aria-hidden="true" />
                )}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          )}
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {safeFoods.length === 0 ? (
            <div className="flex items-center justify-center min-h-[360px] text-center">
              <div>
                <span
                  className="text-7xl mb-4 block"
                  role="img"
                  aria-label="Empty"
                >
                  📚
                </span>
                <h3 className="text-2xl font-display font-black text-theme-text mb-2">
                  No Safe Foods Yet
                </h3>
                <p className="text-lg text-theme-text/60 font-bold px-6">
                  Tap &quot;Add Safe Food&quot; to create a trusted foods list
                  parents will love.
                </p>
              </div>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              <ul className="space-y-3" role="list">
                {safeFoods.map((food) => (
                  <motion.li
                    key={food.id}
                    layout
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-theme-text border-4 border-theme-border rounded-2xl p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] list-none"
                  >
                    {editingId === food.id ? (
                      // Edit Mode
                      <div className="space-y-3">
                        <div>
                          <label
                            htmlFor={`edit-name-${food.id}`}
                            className="block text-xs font-body font-bold text-theme-bg mb-1 uppercase tracking-wide"
                          >
                            Name
                          </label>
                          <input
                            id={`edit-name-${food.id}`}
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full bg-theme-bg border-2 border-theme-border p-3 rounded-xl font-body font-bold text-theme-text placeholder:text-theme-text/40 focus:outline-none focus:ring-4 focus:ring-theme-accent"
                            autoFocus
                          />
                        </div>
                        <div>
                          <label
                            htmlFor={`edit-brand-${food.id}`}
                            className="block text-xs font-body font-bold text-theme-bg mb-1 uppercase tracking-wide"
                          >
                            Brand (optional)
                          </label>
                          <input
                            id={`edit-brand-${food.id}`}
                            type="text"
                            value={editBrand}
                            onChange={(e) => setEditBrand(e.target.value)}
                            className="w-full bg-theme-bg border-2 border-theme-border p-3 rounded-xl font-body font-bold text-theme-text placeholder:text-theme-text/40 focus:outline-none focus:ring-4 focus:ring-theme-accent"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor={`edit-notes-${food.id}`}
                            className="block text-xs font-body font-bold text-theme-bg mb-1 uppercase tracking-wide"
                          >
                            Notes (optional)
                          </label>
                          <textarea
                            id={`edit-notes-${food.id}`}
                            value={editNotes}
                            onChange={(e) => setEditNotes(e.target.value)}
                            className="w-full bg-theme-bg border-2 border-theme-border p-3 rounded-xl font-body font-bold text-theme-text placeholder:text-theme-text/40 focus:outline-none focus:ring-4 focus:ring-theme-accent resize-none"
                            rows={2}
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => saveEdit(food.id)}
                            className="flex-1 py-3 bg-theme-primary border-4 border-theme-border rounded-xl font-display font-black text-theme-border shadow-voxel active:shadow-none active:translate-y-[2px] transition-all"
                          >
                            Save
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="flex-1 py-3 bg-theme-bg border-4 border-theme-border rounded-xl font-display font-black text-theme-text active:shadow-none active:translate-y-[2px] transition-all"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      // View Mode
                      <div className="flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-black text-xl text-theme-bg truncate">
                            {food.name}
                          </h3>
                          {food.brand && (
                            <p className="text-sm text-theme-bg/80 truncate mt-0.5">
                              {food.brand}
                            </p>
                          )}
                          {food.notes && (
                            <p className="text-xs text-theme-bg/70 italic mt-1.5 line-clamp-2">
                              &quot;{food.notes}&quot;
                            </p>
                          )}
                          <p className="text-xs text-theme-bg/60 mt-2 font-bold uppercase tracking-wide">
                            {food.source === 'scanned'
                              ? '📷 Scanned'
                              : '✏️ Manual'}
                          </p>
                        </div>
                        {adultMode && (
                          <div className="flex gap-2">
                            {food.source === 'manual' && (
                              <button
                                onClick={() => startEdit(food)}
                                className="w-10 h-10 flex items-center justify-center bg-theme-bg border-2 border-theme-border text-theme-text rounded-full hover:bg-theme-accent hover:text-theme-bg transition-all active:scale-95"
                                aria-label={`Edit ${food.name}`}
                                title="Edit"
                              >
                                <Edit2 className="w-5 h-5" aria-hidden="true" />
                              </button>
                            )}
                            <button
                              onClick={() => confirmDelete(food)}
                              className="w-10 h-10 flex items-center justify-center bg-redstone-red text-white rounded-full hover:bg-redstone-red/80 transition-all active:scale-95"
                              aria-label={`Delete ${food.name}`}
                              title="Delete"
                            >
                              <Trash2 className="w-5 h-5" aria-hidden="true" />
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </motion.li>
                ))}
              </ul>
            </AnimatePresence>
          )}
        </div>

        <AddSafeFoodModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          profileId={profileId}
        />

        <ConfirmationModal
          isOpen={deleteConfirm.isOpen}
          onClose={() => setDeleteConfirm({ isOpen: false })}
          onConfirm={handleConfirmDelete}
          title="Remove Safe Food?"
          message={`Are you sure you want to remove "${deleteConfirm.foodName}"?`}
        />

        {showPremiumGate && (
          <PremiumGate
            feature="Email & Copy"
            onClose={() => setShowPremiumGate(false)}
          />
        )}
      </div>
    </div>
  );
}
