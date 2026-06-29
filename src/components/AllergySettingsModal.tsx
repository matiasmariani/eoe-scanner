import React from 'react';
import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';

export function AllergySettingsModal() {
  // Allergies are now correctly imported via useAllergySettings hook in the parent or context
  return (
    <button
      onClick={() => {
        const dialog = document.getElementById('allergy-settings') as HTMLDialogElement;
        if (dialog) dialog.showModal();
      }}
      className="fixed bottom-6 right-6 z-40 bg-emerald-green border-4 border-ink-navy text-white p-6 rounded-full shadow-voxel active:shadow-press hover:-translate-y-[2px] transition-all focus:outline-none focus:ring-2 focus:ring-offset-2"
      aria-label="Allergy settings"
    >
      <Shield className="w-10 h-10 text-white" aria-hidden="true" />
    </button>
  );
}