import React from 'react';
import { Shield } from 'lucide-react';

export function AllergySettingsModal() {
  return (
    <button
      onClick={() => {
        const dialog = document.getElementById('allergy-settings') as HTMLDialogElement;
        if (dialog) dialog.showModal();
      }}
      className="fixed bottom-8 right-8 z-40 bg-block-white border-4 border-ink-navy text-block-navy p-6 rounded-[2.5rem] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] hover:-translate-y-[2px] transition-all focus:outline-none focus:ring-4 focus:ring-grass-green"
      aria-label="Allergy settings"
    >
      <Shield className="w-10 h-10 text-ink-navy" aria-hidden="true" />
    </button>
  );
}
