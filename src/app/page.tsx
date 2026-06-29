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
    console.log("MODE", mode)
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
        <main className="relative w-full max-w-md mx-auto px-4 pb-16 flex flex-col items-center min-h-[calc(100vh-200px)] justify-center overflow-x-hidden bg-voxel-bg text-ink-navy">
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
                        className="p-4 bg-white border-4 border-ink-navy rounded-full shadow-voxel active:shadow-press transition-all hover:-translate-y-[2px]"
                        aria-label="Allergy settings"
                    >
                        <ShieldCheck className="w-8 h-8 text-emerald-green" aria-hidden="true" />
                    </button>
                    <button
                        onClick={reset}
                        className="p-4 bg-white border-4 border-ink-navy rounded-full shadow-voxel active:shadow-press transition-all hover:-translate-y-[2px]"
                        aria-label="Reset scanner"
                    >
                        <RefreshCcw className="w-8 h-8 text-pokeball-red" aria-hidden="true" />
                    </button>
                </div>

                <div className="flex items-center gap-3 bg-emerald-green px-8 py-4 w-full justify-center border-4 border-ink-navy rounded-full shadow-voxel">
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
                                <h2 className="text-6xl font-display font-black leading-tight">
                                    Find the <br />
                                    <span className="text-pokeball-red italic underline decoration-ink-navy">Food Clues!</span>
                                </h2>
                                <p className="text-2xl text-gray-700 font-body font-semibold p-4 bg-white border-4 border-ink-navy rounded-3xl shadow-voxel max-w-[90%] mx-auto">
                                    Scan a barcode to start your mission!
                                </p>
                            </div>

                            <div className="flex flex-col gap-6 w-full px-4">
                                <button
                                    onClick={() => setMode("scanning")}
                                    className="group relative flex items-center justify-center gap-5 w-full bg-pikachu-yellow border-4 border-ink-navy p-10 rounded-3xl text-4xl font-display font-black shadow-voxel active:shadow-press hover:-translate-y-[2px] transition-all"
                                    aria-label="Start scanning"
                                >
                                    <Camera className="w-14 h-14 group-hover:scale-110 transition-transform" aria-hidden="true" />
                                    Scan Now
                                </button>

                                <div className="flex items-center gap-4">
                                    <div className="h-3 flex-1 bg-gray-200 rounded-full border-2 border-ink-navy" />
                                    <span className="text-ink-navy font-display font-black text-xl uppercase tracking-widest">OR</span>
                                    <div className="h-3 flex-1 bg-gray-200 rounded-full border-2 border-ink-navy" />
                                </div>

                                <form onSubmit={handleManualSubmit} className="flex flex-col gap-4 w-full p-6 bg-white border-4 border-ink-navy rounded-3xl shadow-voxel">
                                    <div className="relative flex-1">
                                        <input
                                            type="number"
                                            pattern="[0-9]*"
                                            inputMode="numeric"
                                            placeholder="Enter clue number..."
                                            value={barcode}
                                            onChange={(e) => setBarcode(e.target.value)}
                                            className="w-full p-6 border-4 border-ink-navy text-center text-3xl font-data font-bold focus:ring-4 focus:ring-emerald-green outline-none bg-voxel-bg text-ink-navy shadow-inner rounded-2xl"
                                            aria-label="Barcode input"
                                        />
                                        {error && error.includes('barcode') && (
                                            <p id="barcode-error" className="text-sm text-pokeball-red mt-2 font-body font-bold" role="alert">
                                                {error}
                                            </p>
                                        )}
                                    </div>
                                    <button
                                        type="submit"
                                        className="bg-emerald-green border-4 border-ink-navy p-6 rounded-3xl shadow-voxel active:shadow-press hover:-translate-y-[2px] transition-all flex items-center justify-center"
                                        aria-label="Search product"
                                    >
                                        <Search className="w-10 h-10 text-white" aria-hidden="true" />
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
                                <div className="absolute -inset-4 bg-emerald-green/20 rounded-[3rem] blur-2xl animate-pulse" />
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
                                <div className="w-32 h-32 border-8 border-emerald-green/20 border-t-ink-navy rounded-full animate-spin" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <ShieldCheck className="w-12 h-12 text-ink-navy" aria-hidden="true" />
                                </div>
                            </div>
                            <p className="mt-4 text-3xl font-display font-bold text-ink-navy animate-pulse">Looking for clues...</p>
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
                            <div className="bg-pokeball-red p-10 border-4 border-ink-navy text-center shadow-voxel w-full">
                                <AlertCircle className="w-24 h-24 text-white mb-6 mx-auto" aria-hidden="true" />
                                <h3 className="text-5xl font-display font-black text-white uppercase tracking-tighter">Oops!</h3>
                                <p className="text-3xl text-white font-body font-bold mt-4">{error}</p>
                            </div>
                            <button
                                onClick={reset}
                                className="w-full bg-ink-navy border-4 border-ink-navy text-white py-8 rounded-3xl text-3xl font-display font-black shadow-voxel hover:translate-y-[-2px] transition-transform active:shadow-press"
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
                  className="rounded-[3rem] border-8 shadow-voxel p-0 bg-white max-w-lg w-full"
                  onClose={() => setIsSettingsOpen(false)}
                >
                    <AllergySettings onClose={() => setIsSettingsOpen(false)} />
                </dialog>

                <AllergySettingsModal />
            </div>
        </main>
    );
}

function toggleFavorite(name: string) {}
function isFavorite(name: string): boolean { return false; }
