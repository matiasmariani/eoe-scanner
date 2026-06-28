'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { AlertCircle, RefreshCcw } from 'lucide-react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { logError } from '@/lib/errorHandling'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    logError('AppError', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="w-full max-w-md space-y-6"
      >
        <div className="bg-white rounded-[3rem] border-8 border-rose-200 p-10 text-center shadow-2xl">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-6 inline-flex items-center justify-center w-24 h-24 bg-rose-100 rounded-full"
          >
            <AlertCircle className="w-12 h-12 text-rose-500" aria-hidden="true" />
          </motion.div>

          <h2 className="text-4xl font-black text-gray-900 mb-2">
            Oops! Something went wrong
          </h2>

          <p className="text-xl text-gray-600 mb-6">
            We encountered an error while scanning your product. Please try again.
          </p>

          {error.message && (
            <p className="text-sm text-gray-500 mb-6">
              Error: {error.message}
            </p>
          )}

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={reset}
            className="inline-flex items-center gap-3 bg-rose-500 text-white px-8 py-4 rounded-full text-xl font-black hover:bg-rose-600 transition-all shadow-lg"
          >
            <RefreshCcw className="w-5 h-5" aria-hidden="true" />
            Try Again
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
}
