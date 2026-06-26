"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Camera,
    RefreshCcw,
    AlertCircle,
    Search,
    ShieldCheck
} from "lucide-react";
import { fetchProductByBarcode } from "@/lib/open-food-facts";
import { ProductResult } from "@/lib/open-food-facts";
import { Scanner } from "@/components/Scanner";
import { ResultCard } from "@/components/ResultCard";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export default function Home() {
    const [mode, setMode] = useState<"idle" | "scanning" | "loading" | "result" | "error">("idle");
    const [barcode, setBarcode] = useState<string>("");
    const [result, setResult] = useState<ProductResult | null>(null);
    const [error, setError] = useState<string>("");

    const handleScan = async (code: string) => {
        if (mode !== "scanning") return;

        setBarcode(code);
        setMode("loading");

        const product = await fetchProductByBarcode(code);

        if (product.error) {
            setError(product.error || "Product not found");
            setMode("error");
        } else {
            setResult(product);
            setMode("result");
        }
    };

    const handleManualSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!barcode) return;

        setMode("loading");
        const product = await fetchProductByBarcode(barcode);

        if (product.error) {
            setError(product.error || "Product not found");
            setMode("error");
        } else {
            setResult(product);
            setMode("result");
        }
    };

    const reset = () => {
        setBarcode("");
        setResult(null);
        setError("");
        setMode("idle");
    };

    return (
        <main className="min-h-screen bg-sky-50 text-gray-900 font-sans overflow-x-hidden">
            {/* App Header */}
            <header className="w-full max-w-md mx-auto px-4 py-8 flex items-center justify-between">
                <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-[2.5rem] shadow-md border-4 border-sky-200">
                    <span className="text-3xl">🛡️</span>
                    <h1 className="text-2xl font-black text-blue-600 tracking-tight">Allergy Scout</h1>
                </div>
                <button
                    onClick={reset}
                    className="p-3 bg-white rounded-full shadow-md border-4 border-sky-200 text-blue-500 hover:bg-sky-50 transition-all active:scale-90"
                >
                    <RefreshCcw className="w-6 h-6" />
                </button>
            </header>

            <div className="w-full max-w-md mx-auto px-4 pb-16 flex flex-col items-center min-h-[calc(100vh-200px)] justify-center">
                <AnimatePresence mode="wait">
                    {mode === "idle" && (
                        <motion.div
                            key="idle"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="w-full space-y-10 text-center"
                        >
                            <div className="space-y-4">
                                <h2 className="text-6xl font-black text-gray-800 leading-tight">
                                    Safe Snacking <br />
                                    <span className="text-blue-500">Made Easy!</span>
                                </h2>
                                <p className="text-2xl text-gray-600 font-bold">
                                    Scan a barcode to see if it&apos;s safe!
                                </p>
                            </div>

                            <div className="flex flex-col gap-8 w-full">
                                <button
                                    onClick={() => setMode("scanning")}
                                    className="group relative flex items-center justify-center gap-5 w-full bg-blue-500 text-white p-10 rounded-[3rem] text-4xl font-black shadow-[0_12px_0_0_rgba(37,99,235,1)] active:shadow-none active:translate-y-[8px] transition-all"
                                >
                                    <Camera className="w-14 h-14 group-hover:scale-110 transition-transform" />
                                    Scan Now&apos;
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
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="bg-blue-500 text-white p-8 rounded-[3rem] shadow-[0_8px_0_0_rgba(37,99,235,1)] active:shadow-none active:translate-y-[8px] transition-all"
                                    >
                                        <Search className="w-10 h-10" />
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
                            className="w-full space-y-8"
                        >
                            <div className="relative group">
                                <div className="absolute -inset-6 bg-blue-400/20 rounded-[4rem] blur-2xl group-hover:bg-blue-400/30 transition-all" />
                                <Scanner onScan={handleScan} />
                            </div>
                        </motion.div>
                    )}

                    {mode === "loading" && (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center"
                        >
                            <div className="relative">
                                <div className="w-32 h-32 border-8 border-blue-100 border-t-blue-500 rounded-full animate-spin" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <ShieldCheck className="w-12 h-12 text-blue-500" />
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {mode === "result" && result && (
                        <ResultCard key="result" result={result} onReset={reset} />
                    )}

                    {mode === "error" && (
                        <motion.div
                            key="error"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="w-full max-w-md space-y-8"
                        >
                            <div className="bg-rose-50 p-10 rounded-[4rem] border-8 border-rose-500 text-center shadow-2xl">
                                <AlertCircle className="w-24 h-24 text-rose-500 mb-6" />
                                <h3 className="text-4xl font-black text-rose-600 uppercase tracking-tighter">Oops!</h3>
                                <p className="text-2xl text-rose-800 font-bold mt-4">{error}</p>
                            </div>
                            <button
                                onClick={reset}
                                className="w-full bg-gray-800 text-white py-8 rounded-[3rem] text-3xl font-black shadow-xl transition-transform active:scale-95"
                            >
                                Try Again
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </main>
    );
}
