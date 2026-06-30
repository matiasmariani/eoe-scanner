'use client';

import { motion } from 'framer-motion';
import { Search, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-theme-bg text-theme-text flex items-center justify-center p-4 app-container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-theme-text border-4 border-theme-border p-10 text-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-[3rem]">
          <div className="mb-6 inline-flex items-center justify-center w-24 h-24 bg-theme-accent/20 rounded-full">
            <Search
              className="w-12 h-12 text-theme-primary"
              aria-hidden="true"
            />
          </div>

          <h2 className="text-4xl font-display font-black text-theme-bg mb-2 uppercase tracking-tighter">
            Page Not Found
          </h2>

          <p className="text-xl text-theme-bg/60 font-body font-bold mb-6">
            This page wandered off. Let&apos;s head back home.
          </p>

          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-theme-primary border-4 border-theme-border text-theme-text px-8 py-4 rounded-full text-xl font-display font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] hover:-translate-y-[2px] transition-all"
          >
            <ArrowLeft className="w-6 h-6" aria-hidden="true" />
            Go Back Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
