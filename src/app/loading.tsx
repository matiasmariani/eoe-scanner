'use client';

import { motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-screen bg-deep-stone text-block-white flex flex-col items-center justify-center p-4 app-container">
      <div className="relative">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-32 h-32 border-8 border-grass-green/30 border-t-ink-navy rounded-full"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <ShieldCheck
            className="w-12 h-12 text-grass-green"
            aria-hidden="true"
          />
        </div>
      </div>

      <motion.p
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="mt-8 text-3xl font-display font-black text-block-white"
      >
        Looking for clues...
      </motion.p>
    </div>
  );
}
