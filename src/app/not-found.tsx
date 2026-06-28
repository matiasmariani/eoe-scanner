'use client';

import { motion } from 'framer-motion';
import { Search, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="w-full max-w-md space-y-6"
      >
        <div className="bg-white rounded-[3rem] border-8 border-blue-200 p-10 text-center shadow-2xl">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-6 inline-flex items-center justify-center w-24 h-24 bg-blue-100 rounded-full"
          >
            <Search className="w-12 h-12 text-blue-500" aria-hidden="true" />
          </motion.div>

          <h2 className="text-4xl font-black text-gray-900 mb-2">
            Page Not Found
          </h2>

          <p className="text-xl text-gray-600 mb-6">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>

          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-blue-500 text-white px-8 py-4 rounded-full text-xl font-black hover:bg-blue-600 transition-all shadow-lg"
          >
            <ArrowLeft className="w-5 h-5" aria-hidden="true" />
            Go Back Home
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
