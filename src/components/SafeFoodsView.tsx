'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Mail, Copy, Check, Edit2 } from 'lucide-react';
import { useSafeFoods } from '@/hooks/useSafeFoods';
import { useAllergySettings } from '@/contexts/AllergyContext';
import { useIsPremium } from '@/lib/premium';
import { AddSafeFoodModal } from '@/components/AddSafeFoodModal';
import { ConfirmationModal } from '@/components/ConfirmationModal';
import { PremiumGate } from '@/components/PremiumGate';
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
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      className="fixed inset-0 z-40 bg-theme-bg flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b-4 border-theme-border">
        <h1 className="text-2xl font-display font-black text-theme-text">
          Safe Foods
        </h1>
        <button
          onClick={onClose}
          className="w-12 h-12 flex items-center justify-center bg-theme-text text-theme-bg rounded-full font-black"
          aria-label="Close"
        >
          ←
        </button>
      </div>

      {/* Action Buttons */}
      <div className="p-4 border-b-4 border-theme-border space-y-3">
        <button
          onClick={() => setShowAddModal(true)}
          disabled={!adultMode}
          className={`w-full flex items-center justify-center gap-2 border-4 border-theme-border px-6 py-4 rounded-2xl font-display font-black transition-all ${adultMode ? 'bg-theme-primary text-theme-border shadow-voxel active:shadow-none active:translate-y-[2px] cursor-pointer' : 'bg-theme-primary/40 text-theme-border/40 opacity-50 cursor-not-allowed'}`}
          title={adultMode ? 'Add a new safe food' : 'Parent mode required'}
          aria-disabled={!adultMode}
        >
          <Plus className="w-6 h-6" aria-hidden="true" />
          Add Safe Food
        </button>
        <div className="flex gap-2">
          <button
            onClick={handleEmail}
            disabled={!isPremium}
            className={`flex-1 flex items-center justify-center gap-2 border-4 border-theme-border px-4 py-3 rounded-2xl font-display font-black transition-all ${
              isPremium
                ? 'bg-theme-accent text-theme-bg shadow-voxel active:shadow-none active:translate-y-[2px] hover:-translate-y-[2px] cursor-pointer'
                : 'bg-theme-accent/50 text-theme-bg/50 opacity-50 cursor-not-allowed'
            }`}
            title={
              isPremium
                ? 'Open email client with pre-filled allergen list'
                : 'Premium feature'
            }
            aria-label="Email safe foods and allergens"
          >
            <Mail className="w-6 h-6" aria-hidden="true" />
            Email
          </button>
          <button
            onClick={handleCopy}
            disabled={!isPremium}
            className={`flex-1 flex items-center justify-center gap-2 border-4 border-theme-border px-4 py-3 rounded-2xl font-display font-black transition-all ${
              isPremium
                ? 'bg-theme-text text-theme-bg shadow-voxel active:shadow-none active:translate-y-[2px] hover:-translate-y-[2px] cursor-pointer'
                : 'bg-theme-text/50 text-theme-bg/50 opacity-50 cursor-not-allowed'
            }`}
            title={
              isPremium ? 'Copy allergen list to clipboard' : 'Premium feature'
            }
            aria-label={
              copied && isPremium ? 'Copied to clipboard' : 'Copy to clipboard'
            }
          >
            {copied && isPremium ? (
              <Check className="w-6 h-6" />
            ) : (
              <Copy className="w-6 h-6" aria-hidden="true" />
            )}
            {copied && isPremium ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <AnimatePresence mode="popLayout">
          {safeFoods.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12"
            >
              <p className="text-2xl font-display font-black text-theme-text/40">
                No Safe Foods Yet
              </p>
            </motion.div>
          ) : (
            safeFoods.map((food) => (
              <motion.div
                key={food.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-theme-text border-4 border-theme-border rounded-2xl p-4 shadow-voxel"
              >
                {editingId === food.id ? (
                  // Edit Mode
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full bg-theme-bg border-2 border-theme-border p-3 rounded-xl font-body font-bold text-theme-text placeholder:text-theme-text/40 focus:outline-none focus:ring-4 focus:ring-theme-accent"
                      autoFocus
                    />
                    <input
                      type="text"
                      value={editBrand}
                      onChange={(e) => setEditBrand(e.target.value)}
                      placeholder="Brand"
                      className="w-full bg-theme-bg border-2 border-theme-border p-3 rounded-xl font-body font-bold text-theme-text placeholder:text-theme-text/40 focus:outline-none focus:ring-4 focus:ring-theme-accent"
                    />
                    <textarea
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      placeholder="Notes"
                      className="w-full bg-theme-bg border-2 border-theme-border p-3 rounded-xl font-body font-bold text-theme-text placeholder:text-theme-text/40 focus:outline-none focus:ring-4 focus:ring-theme-accent resize-none"
                      rows={2}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => saveEdit(food.id)}
                        className="flex-1 py-2 bg-theme-primary border-4 border-theme-border rounded-xl font-display font-black text-theme-border shadow-voxel active:shadow-none active:translate-y-[2px]"
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="flex-1 py-2 bg-theme-bg border-4 border-theme-border rounded-xl font-display font-black text-theme-text active:shadow-none active:translate-y-[2px]"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <h3 className="text-2xl font-display font-black text-theme-bg">
                        {food.name}
                      </h3>
                      {food.brand && (
                        <p className="text-lg font-body font-bold text-theme-bg/80 mt-1">
                          {food.brand}
                        </p>
                      )}
                      {food.notes && (
                        <p className="text-base font-body text-theme-bg/70 italic mt-2">
                          &quot;{food.notes}&quot;
                        </p>
                      )}
                      <p className="text-sm font-body text-theme-bg/60 mt-3 font-bold">
                        {food.source === 'scanned' ? '📷 Scanned' : '✏️ Manual'}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {food.source === 'manual' && adultMode && (
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
                  </div>
                )}
              </motion.div>
            ))
          )}
        </AnimatePresence>
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
    </motion.div>
  );
}
