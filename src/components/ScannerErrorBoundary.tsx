'use client';

import React, { Component, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, RefreshCcw } from 'lucide-react';
import { logError } from '@/lib/errorHandling';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ScannerErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    logError('ScannerErrorBoundary', error);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-deep-stone flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="w-full max-w-md space-y-6"
          >
            <div className="bg-block-white border-4 border-ink-navy p-10 text-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-[3rem]">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
                className="mb-6 inline-flex items-center justify-center w-24 h-24 bg-redstone-red/10 rounded-full"
              >
                <AlertCircle
                  className="w-12 h-12 text-redstone-red"
                  aria-hidden="true"
                />
              </motion.div>

              <h2 className="text-4xl font-display font-black text-ink-navy mb-2">
                Oops! Camera Error
              </h2>

              <p className="text-xl text-gray-600 mb-6">
                We encountered an error while accessing your camera. Please try
                again.
              </p>

              {this.state.error && (
                <p className="text-sm text-gray-500 mb-6">
                  Error: {this.state.error.message}
                </p>
              )}

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={this.handleReset}
                className="inline-flex items-center gap-3 bg-ink-navy text-block-white px-8 py-4 rounded-full text-xl font-black hover:bg-redstone-red transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              >
                <RefreshCcw className="w-5 h-5" aria-hidden="true" />
                Try Again
              </motion.button>
            </div>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}
