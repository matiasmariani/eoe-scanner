'use client'

import { motion } from 'framer-motion'
import { ShieldCheck } from 'lucide-react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex flex-col items-center space-y-6"
      >
        <div className="relative">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-32 h-32 border-8 border-blue-100 border-t-blue-500 rounded-full"
          />
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <ShieldCheck className="w-16 h-16 text-blue-500" aria-hidden="true" />
          </motion.div>
        </div>

        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-2xl font-black text-blue-600"
        >
          Analyzing Product...
        </motion.div>
      </motion.div>
    </div>
  )
}