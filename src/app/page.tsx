"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Camera,
    RefreshCcw,
    AlertCircle,
    Search,
    ShieldCheck,
    Heart
} from "lucide-react";
import { fetchProductByBarcode } from "@/lib/open-food-facts";
import { ProductResult } from "@/lib/open-food-facts";
import { Scanner } from "@/components/Scanner";
import { ScannerErrorBoundary } from "@/components/ScannerErrorBoundary";
import { ResultCard } from "@/components/ResultCard";
import { FavoritesList } from "@/components/FavoritesList";
import { AllergySettings } from "@/components/AllergySettings";
import { AllergySettingsModal } from "@/components/AllergySettingsModal";
import { useAllergySettings } from "@/contexts/AllergyContext";
import { useFavorites } from "@/hooks/useFavorites";
import { cn } from "@/lib/utils";
import { createUserErrorMessage, validateBarcode, logError } from "@/lib/errorHandling";
import { SelectedAllergiesHeader } from "@/components/SelectedAllergiesHeader";

export default function Home() {
    const [mode, setMode] = useState<"idle" | "scanning" | "loading" | "result" | "error">("idle");
    const [barcode, setBarcode] = useState<string>("");
    const [result, setResult] = useState<ProductResult | null>(null);
    const [error, setError] = useState<string>("");
    const { allergies } = useAllergySettings();
    const { favorites, toggleFavorite, isFavorite } = useFavorites();
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    const handleScan = async (code: string) => {
        if (mode !== "scanning") return;

        setBarcode(code);
        setMode("loading");

        try {
            const product = await fetchProductByBarcode(code, allergies);

            if (product.error) {
                setError(product.error || "Product not found");
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
                setError(product.error || "Product not found");
                setMode("error");
            } else {
                setResult(product);
                setMode("result");
            }
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
        <main className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 text-gray-900 font-sans overflow-x-hidden">
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 bg-blue-500 text-white focus:rounded"
            >
                Skip to main content
            </a>

            {/* App Header */}
            <header className="w-full px-4 py-8 flex flex-col items-center justify-between gap-4">
                {mode !== "idle" ? <SelectedAllergiesHeader /> : null}
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setIsSettingsOpen(true)}
                        className="p-3 bg-white rounded-full shadow-md border-4 border-sky-200 text-blue-500 hover:bg-sky-50 transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        aria-label="Allergy settings"
                    >
                        <ShieldCheck className="w-6 h-6" aria-hidden="true" />
                    </button>
                    <button
                        onClick={reset}
                        className="p-3 bg-white rounded-full shadow-md border-4 border-sky-200 text-blue-500 hover:bg-sky-50 transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        aria-label="Reset scanner"
                    >
                        <RefreshCcw className="w-6 h-6" aria-hidden="true" />
                    </button>
                </div>
                <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-[2.5rem] shadow-md border-4 border-sky-200">
                    <span className="text-3xl" aria-hidden="true">🛡️</span>
                    <h1 className="text-2xl font-black text-blue-600 tracking-tight">Can I eat it?</h1>
                </div>
            </header>

            <div id="main-content" className="w-full max-w-md mx-auto px-4 pb-16 flex flex-col items-center min-h-[calc(100vh-200px)] justify-center">
                <AnimatePresence mode="wait">
                    {mode === "idle" && (
                        <motion.div
                            key="idle"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="w-full space-y-10 text-center"
                            style={{
                                animation: 'none',
                                transition: 'none',
                            }}
                        >
                            <div className="space-y-4">
                                <h2 className="text-6xl font-black text-gray-800 leading-tight">
                                    Snacking <br />
                                    <span className="text-blue-500">Made Easy!</span>
                                </h2>
                                <p className="text-2xl text-gray-600 font-bold">
                                    Scan a barcode to see if you can have it!
                                </p>
                                <p className="sr-only">Scan a barcode to see if if you can have it!</p>
                            </div>

                            <div className="flex flex-col gap-8 w-full">
                                <button
                                    onClick={() => setMode("scanning")}
                                    className="group relative flex items-center justify-center gap-5 w-full bg-blue-500 text-white p-10 rounded-[3rem] text-4xl font-black shadow-[0_12px_0_0_rgba(37,99,235,1)] active:shadow-none active:translate-y-[8px] transition-all hover:shadow-[0_16px_0_0_rgba(37,99,235,1)] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                    aria-label="Start scanning"
                                >
                                    <Camera className="w-14 h-14 group-hover:scale-110 transition-transform" aria-hidden="true" />
                                    Scan Now
                                </button>

                                <div className="flex items-center gap-4">
                                    <div className="h-2 flex-1 bg-blue-200 rounded-full" />
                                    <span className="text-blue-500 font-black text-2xl">OR</span>
                                    <div className="h-2 flex-1 bg-blue-200 rounded-full" />
                                </div>

                                <form onSubmit={handleManualSubmit} className="flex gap-4">
                                    <div className="relative flex-1">
                                        <input
                                            type="number"
                                            pattern="[0-9]*"
                                            inputMode="numeric"
                                            placeholder="Enter barcode..."
                                            value={barcode}
                                            onChange={(e) => setBarcode(e.target.value)}
                                            className="w-full p-8 rounded-[3rem] border-8 border-blue-100 text-2xl font-bold focus:border-blue-500 focus:outline-none bg-white text-gray-800 transition-all shadow-inner"
                                            aria-label="Barcode input"
                                            aria-invalid={error && error.includes('barcode') ? 'true' : undefined}
                                            aria-describedby={error && error.includes('barcode') ? 'barcode-error' : undefined}
                                        />
                                        {error && error.includes('barcode') && (
                                            <p id="barcode-error" className="text-sm text-rose-500 mt-2" role="alert">
                                                {error}
                                            </p>
                                        )}
                                    </div>
                                    <button
                                        type="submit"
                                        className="bg-blue-500 text-white p-8 rounded-[3rem] shadow-[0_8px_0_0_rgba(37,99,235,1)] active:shadow-none active:translate-y-[8px] transition-all hover:shadow-[0_16px_0_0_rgba(37,99,235,1)] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
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
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="w-full space-y-8 flex flex-col items-center"
                            style={{
                                animation: 'none',
                                transition: 'none',
                            }}
                        >
                            <div className="relative group w-full flex justify-center">
                                <div className="absolute -inset-6 bg-blue-400/20 rounded-[4rem] blur-2xl group-hover:bg-blue-400/30 transition-all" />
                                <ScannerErrorBoundary>
                                    <Scanner onScan={handleScan} />
                                </ScannerErrorBoundary>
                            </div>
                        </motion.div>
                    )}

                    {mode === "loading" && (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="flex flex-col items-center"
                            role="status"
                            aria-live="polite"
                            aria-label="Loading"
                            style={{
                                animation: 'none',
                                transition: 'none',
                            }}
                        >
                            <div className="relative">
                                <div className="w-32 h-32 border-8 border-blue-100 border-t-blue-500 rounded-full animate-spin" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <ShieldCheck className="w-12 h-12 text-blue-500" aria-hidden="true" />
                                </div>
                            </div>
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
                            aria-live="assertive"
                            aria-label={error}
                            style={{
                                animation: 'none',
                                transition: 'none',
                            }}
                        >
                            <div className="bg-rose-50 p-10 rounded-[4rem] border-8 border-rose-500 text-center shadow-2xl w-full">
                                <AlertCircle className="w-24 h-24 text-rose-500 mb-6 mx-auto" aria-hidden="true" />
                                <h3 className="text-4xl font-black text-rose-600 uppercase tracking-tighter">Oops!</h3>
                                <p className="text-2xl text-rose-800 font-bold mt-4">{error}</p>
                            </div>
                            <button
                                onClick={reset}
                                className="w-full bg-gray-800 text-white py-8 rounded-[3rem] text-3xl font-black shadow-xl transition-transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-offset-2"
                                aria-label="Try again"
                            >
                                Try Again
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Allergy Settings Modal */}
                <dialog
                  id="allergy-settings"
                  open={isSettingsOpen}
                  className="rounded-[3rem] border-8 shadow-2xl p-0"
                  onClose={() => setIsSettingsOpen(false)}
                >
                    <AllergySettings onClose={() => setIsSettingsOpen(false)} />
                </dialog>

                {/* Allergy Settings Modal Button */}
                <AllergySettingsModal />
            </div>
        </main>
    );
}
