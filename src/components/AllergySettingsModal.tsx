'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';
import { useAllergySettings } from '@/contexts/AllergyContext';
import { cn } from '@/lib/utils';

export function AllergySettingsModal() {
  const { allergies } = useAllergySettings();

  return (
    <button
      onClick={() => {
        const dialog = document.getElementById('allergy-settings') as HTMLDialogElement;
        if (dialog) dialog.showModal();
      }}
      className="fixed bottom-6 right-6 z-40 bg-blue-500 text-white p-4 rounded-full shadow-lg hover:bg-blue-600 transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      aria-label="Allergy settings"
    >
      <Shield className="w-6 h-6" aria-hidden="true" />
    </button>
  );
}