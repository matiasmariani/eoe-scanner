'use client';

import { motion, AnimatePresence } from 'framer-motion';
import React from 'react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Yes, do it!',
  cancelText = 'No, keep it',
}: ConfirmationModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-gradient-to-b from-theme-bg to-theme-bg/98 border-4 border-theme-border shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] rounded-3xl w-full max-w-md max-h-[90vh] flex flex-col p-6 space-y-5 overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            onKeyDown={(e) => e.key === 'Escape' && onClose()}
          >
            <div className="flex items-center justify-between">
              <h2
                id="modal-title"
                className="text-3xl font-display font-black text-theme-text"
              >
                {title}
              </h2>
              <button
                onClick={onClose}
                className="w-10 h-10 flex items-center justify-center bg-theme-text text-theme-bg rounded-full font-black text-lg"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            <p className="text-xl font-body font-bold text-theme-text text-center py-4">
              {message}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="bg-gradient-to-br from-theme-text to-theme-text/90 border-4 border-theme-border px-6 py-4 rounded-2xl font-display font-black text-lg text-theme-bg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all min-w-[140px] min-h-[64px]"
              >
                {cancelText}
              </motion.button>
              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={onConfirm}
                className="bg-gradient-to-br from-theme-primary to-theme-primary/80 border-4 border-theme-border px-6 py-4 rounded-2xl font-display font-black text-lg text-theme-border shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all min-w-[140px] min-h-[64px]"
              >
                {confirmText}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
