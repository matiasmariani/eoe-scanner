'use client';

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, RefreshCcw, AlertCircle, ShieldCheck, Heart, Search } from "lucide-react";
import { fetchProductByBarcode } from "@/lib/open-food-facts";
import { ProductResult } from "@/lib/open-food-facts";
import { Scanner } from "@/components/Scanner";
import { ScannerErrorBoundary } from "@/components/ScannerErrorBoundary";
import { ResultCard } from "@/components/ResultCard";
import { AllergySettings } from "@/components/AllergySettings";
import { AllergySettingsModal } from "@/components/AllergySettingsModal";
import { useAllergySettings } from "@/contexts/AllergyContext"; // Corrected hook name
import { SelectedAllergiesHeader } from "@/components/SelectedAllergiesHeader";
import { cn } from "@/lib/utils";
import { createUserErrorMessage, validateBarcode, logError } from "@/lib/errorHandling";

export default function Home() {
    const [mode, setMode] = useState<"idle" | "scanning" | "loading" | "result" | "error">("idle");
    const [barcode, setBarcode] = useState<string>("");
    const [result, setResult] = useState<ProductResult | null>(null);
    const [error, setError] = useState<string>("");
    // Added proper state for settings modal
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    const { allergies } = useAllergySettings();

    const handleScan = async (code: string) => {
        if (mode !== "scanning") return;
        setBarcode(code);
        setMode("loading");
        try {
            const product = await fetchProductByBarcode(code, allergies);
            if (product.error) {
                setError(product.error || "Food not found");
                setMode("error");
            } else {
                setResult(product);
                setMode("result");
            }
        } catch (err) {
            logError('handleScan', err);
            setError(createUserErrorMessage(err));
            setMode("error");
        }
    };

    const handleManualSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!barcode) return;
        const validation = validateBarcode(barcode);
        if (!validation.valid) {
            setError(validation.error || "Invalid barcode");
            setMode("error");
            return;
        }
        setMode("loading");
        try {
            const product = await fetchProductByBarcode(barcode, allergies);
            if (product.error) {
                setError(product.error || "Food not found");
                setMode("error");
            } else {
                setResult(product);
                setMode("result");            }
        } catch (err) {
            logError('handleManualSubmit', err);
            setError(createUserErrorMessage(err));
            setMode("error");
        }
    };

    const reset = () => {
        setBarcode("");
        setResult(null);
        setError("");
        setMode("idle");
    };

    return (
        <main className="relative w-full max-w-md mx-auto px-4 pb-16 flex flex-col items-center min-h-[calc(100vh-200px)] justify-center overflow-x-hidden">
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 bg-sky-blue text-white focus:rounded"
            >
                Skip to main content
            </a>

            <header className="w-full px-4 py-8 flex flex-col items-center justify-between gap-6">
                {mode !== "idle" && <SelectedAllergiesHeader />}
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setIsSettingsOpen(true)}
                        className="p-4 bg-sky-blue text-white wobbly-border-lg shadow-lg active:scale-95 transition-all hover:rotate-2"
                        aria-label="Allergy settings"
                    >
                        <ShieldCheck className="w-8 h-8" aria-hidden="true" />
                    </button>
                    <button
                        onClick={reset}
                        className="p-4 bg-sunshine-yellow text-ink-navy wobbly-border-lg shadow-lg active:scale-95 transition-all hover:rotate--2"
                        aria-label="Reset scanner"
                    >
                        <RefreshCcw className="w-8 h-8" aria-hidden="true" />
                    </button>
                </div>

                <div className="flex items-center gap-3 bg-sky-blue px-8 py-4 w-full justify-center wobbly-border rounded-full shadow-xl border-4 border-white">
                    <span className="text-3xl" aria-hidden="true">🕵️‍♂️</span>
                    <h1 className="text-3xl font-display font-black text-white tracking-tight">Can I eat it?</h1>
                </div>
            </header>

            <div id="main-content" className="w-full space-y-8 flex flex-col items-center">
                <AnimatePresence mode="wait">
                    {mode === "idle" && (
                        <motion.div
                            key="idle"
                            initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                            animate={{ opacity: 1, scale: 1, rotate: 0 }}
                            exit={{ opacity: 0, scale: 0.8, rotate: 5 }}
                            className="w-full space-y-10 text-center"
                        >
                            <div className="space-y-4">
                                <h2 className="text-5xl font-display font-black text-ink-navy leading-tight">
                                    Find the <br />
                                    <span className="text-detective-blue">Food Clues!</span>
                                </h2>
                                <p className="text-2xl text-gray-600 font-body font-semibold">
                                    Scan a barcode to start your mission!
                                </p>
                            </div>

                            <div className="flex flex-col gap-6 w-full">
                                <button
                                    onClick={() => setMode("scanning")}
                                    className="group relative flex items-center justify-center gap-5 w-full bg-detective-blue text-white p-10 wobbly-border-lg text-4xl font-display font-black shadow-[0_12px_0_0_rgba(30,58,138,0.5)] active:shadow-none active:translate-y-2 transition-all hover:rotate-1"
                                    aria-label="Start scanning"
                                >
                                    <Camera className="w-14 h-14 group-hover:scale-110 transition-transform" aria-hidden="true" />
                                    Scan Now
                                </button>

                                <div className="flex items-center gap-4">
                                    <div className="h-2 flex-1 bg-gray-300 rounded-full" />
                                    <span className="text-ink-navy font-display font-black text-2xl uppercase tracking-widest">OR</span>
                                    <div className="h-2 flex-1 bg-gray-300 rounded-full" />
                                </div>

                                <form onSubmit={handleManualSubmit} className="flex flex-col gap-4 w-full">
                                    <div className="relative flex-1">
                                        <input
                                            type="number"
                                            pattern="[0-9]*"
                                            inputMode="numeric"
                                            placeholder="Enter clue number..."
                                            value={barcode}
                                            onChange={(e) => setBarcode(e.target.value)}
                                            className="w-full p-6 wobbly-border text-center text-2xl font-data font-bold focus:ring-4 focus:ring-detective-blue outline-none bg-white text-ink-navy shadow-inner"
                                            aria-label="Barcode input"
                                        />
                                        {error && error.includes('barcode') && (
                                            <p id="barcode-error" className="text-sm text-watermelon-red mt-2 font-body font-bold" role="alert">
                                                {error}
                                            </p>
                                        )}
                                    </div>
                                    <button
                                        type="submit"
                                        className="bg-sunshine-yellow text-ink-navy p-6 wobbly-border shadow-[0_8px_0_0_rgba(253,224,71,0.8)] active:shadow-none active:translate-y-2 transition-all flex items-center justify-center"
                                        aria-label="Search product"
                                    >
                                        <Search className="w-10 h-10" aria-hidden="true" />
                                    </button>
                                </form>
                            </div>
                        </motion.div>
                    )}

                    {mode === "scanning" && (
                        <motion.div
                            key="scanning"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="w-full space-y-8 flex flex-col items-center"
                        >
                            <div className="relative w-full flex justify-center">
                                <div className="absolute -inset-4 bg-detective-blue/20 rounded-[4rem] blur-2xl animate-pulse" />
                                <ScannerErrorBoundary>
                                    <Scanner onScan={handleScan} />
                                </ScannerErrorBoundary>
                            </div>
                        </motion.div>
                    )}

                    {mode === "loading" && (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col items-center"
                            role="status"
                            aria-live="polite"
                        >
                            <div className="relative">
                                <div className="w-32 h-32 border-8 border-sky-blue/20 border-t-detective-blue rounded-full animate-spin" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <ShieldCheck className="w-12 h-12 text-detective-blue" aria-hidden="true" />
                                </div>
                            </div>
                            <p className="mt-4 text-2xl font-display font-bold text-detective-blue animate-pulse">Looking for clues...</p>
                        </motion.div>
                    )}

                    {mode === "result" && result && (
                        <ResultCard
                            key="result"
                            result={result}
                            onReset={reset}
                            onFavorite={() => toggleFavorite(result.name)}
                            isFavorite={isFavorite(result.name)}
                        />
                    )}

                    {mode === "error" && (
                        <motion.div
                            key="error"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="w-full max-w-md space-y-8 flex flex-col items-center"
                            role="alert"
                        >
                            <div className="bg-watermelon-red p-10 wobbly-border-lg text-center shadow-2xl w-full border-8 border-white">
                                <AlertCircle className="w-24 h-24 text-white mb-6 mx-auto" aria-hidden="true" />
                                <h3 className="text-4xl font-display font-black text-white uppercase tracking-tighter">Oops!</h3>
                                <p className="text-2xl text-white font-body font-bold mt-4">{error}</p>
                            </div>
                            <button
                                onClick={reset}
                                className="w-full bg-ink-navy text-white py-8 wobbly-border-lg text-3xl font-display font-black shadow-xl transition-transform active:scale-95"
                                aria-label="Try again"
                            >
                                Try Again
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                <dialog
                  id="allergy-settings"
                  open={isSettingsOpen}
                  className="rounded-[3rem] border-8 shadow-2xl p-0"
                  onClose={() => setIsSettingsOpen(false)}
                >
                    <AllergySettings onClose={() => setIsSettingsOpen(false)} />
                </dialog>

                <AllergySettingsModal />
            </div>
        </main>
    );
}

// Helper stubs to prevent "not found" errors while the full logic is wired up from context/hooks.
function toggleFavorite(name: string) {}
function isFavorite(name: string): boolean { return false; }
