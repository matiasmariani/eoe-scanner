"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Quagga, { QuaggaJSResultObject } from "@ericblade/quagga2";
import { ScanError } from "@/lib/scanner-types";
import { AlertCircle } from "lucide-react";
import { logError } from "@/lib/errorHandling";

interface ScannerProps {
    onScan: (barcode: string) => void;
    onError?: (error: ScanError) => void;
}

export const Scanner: React.FC<ScannerProps> = ({ onScan, onError }) => {
    const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
    const isInitializedRef = useRef(false);
    const isActiveRef = useRef(true);
    const containerRef = useRef<HTMLDivElement>(null);

    const scanHistoryRef = useRef<{ [code: string]: number }>({});
    const lastScannedCodeRef = useRef<string>("");
    const lastScanTimeRef = useRef<number>(0);

    useEffect(() => {
        isActiveRef.current = true;

        if (typeof window === "undefined" || isInitializedRef.current) return;

        const initScanner = async () => {
            if (!containerRef.current || !isActiveRef.current) {
                return;
            }

            try {
                Quagga.init(
                    {
                        inputStream: {
                            type: "LiveStream",
                            target: containerRef.current,
                            constraints: {
                                width: { min: 640, ideal: 1280, max: 1920 },
                                height: { min: 480, ideal: 720, max: 1080 },
                                facingMode: "environment",
                                ...({ focusMode: "continuous" } as Record<string, unknown>)
                            },
                            singleChannel: false
                        },
                        locate: true,
                        locator: {
                            halfSample: true,
                            patchSize: "medium"
                        },
                        numOfWorkers: typeof navigator !== 'undefined' ? Math.min(navigator.hardwareConcurrency || 2, 4) : 2,
                        decoder: {
                            readers: [
                                "ean_reader",
                                "ean_8_reader",
                                "upc_reader",
                                "upc_e_reader",
                                "code_128_reader"
                            ],
                            multiple: false
                        }
                    },
                    (err) => {
                        if (!isActiveRef.current) {
                            try { Quagga.stop(); } catch (e) { }
                            return;
                        }

                        if (err) {
                            logError('Scanner', err);
                            const errorMessage = String(err);
                            const isPermissionError =
                                errorMessage.includes("NotAllowedError") ||
                                errorMessage.includes("Permission denied") ||
                                errorMessage.includes("camera");

                            setStatus("error");
                            if (onError) {
                                onError({
                                    message: isPermissionError
                                        ? "Camera permission denied. Please allow camera access or use the manual barcode entry."
                                        : errorMessage,
                                    isPermissionError
                                } as ScanError);
                            }
                            return;
                        }

                        isInitializedRef.current = true;
                        Quagga.start();
                        setStatus("ready");

                        Quagga.onDetected((result: QuaggaJSResultObject) => {
                            const code = result.codeResult?.code;
                            if (!code) return;

                            if ((result.codeResult as { fallback?: boolean }).fallback || !result.codeResult.format) return;

                            const now = Date.now();
                            if (code === lastScannedCodeRef.current && now - lastScanTimeRef.current < 3000) {
                                return;
                            }

                            scanHistoryRef.current[code] = (scanHistoryRef.current[code] || 0) + 1;
                            if (scanHistoryRef.current[code] >= 3) {
                                lastScannedCodeRef.current = code;
                                lastScanTimeRef.current = now;
                                scanHistoryRef.current = {};
                                onScan(code);
                            }
                        });
                    }
                );
            } catch (err) {
                logError('Scanner', err);
                setStatus("error");
                if (onError) onError({ message: String(err) } as ScanError);
            }
        };

        const timer = setTimeout(initScanner, 300);

        return () => {
            clearTimeout(timer);
            isActiveRef.current = false;

            if (isInitializedRef.current) {
                try {
                    Quagga.offDetected();
                    Quagga.stop();
                } catch (err) {
                    logError('Scanner', err);
                }
                isInitializedRef.current = false;
            }
        };
    }, [onScan, onError]);

    return (
        <div className="relative w-full max-w-md mx-auto overflow-hidden bg-voxel-bg border-4 border-ink-navy shadow-voxel flex flex-col items-center justify-center min-h-[400px] rounded-3xl">
            <div
                ref={containerRef}
                id="reader"
                className={`w-full h-full [&>video]:w-full [&>video]:h-full [&>video]:object-cover ${status === "ready" ? "block" : "hidden"}`}
            />

            {/* Voxel Viewfinder Overlay */}
            {status === "ready" && (
                <div className="absolute inset-0 pointer-events-none z-20">
                    <div className="absolute top-8 left-8 w-16 h-16 border-8 border-ink-navy/50 rounded-xl shadow-voxel" />
                    <div className="absolute top-8 right-8 w-16 h-16 border-8 border-ink-navy/50 rounded-xl shadow-voxel" />
                    <div className="absolute bottom-8 left-8 w-16 h-16 border-8 border-ink-navy/50 rounded-xl shadow-voxel" />
                    <div className="absolute bottom-8 right-8 w-16 h-16 border-8 border-ink-navy/50 rounded-xl shadow-voxel" />

                    {/* Scanning Line */}
                    <motion.div
                        className="absolute w-full h-2 bg-pikachu-yellow/40 z-10 blur-[2px]"
                        animate={{ top: ['0%', '100%'] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    />
                </div>
            )}

            {status === "loading" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-voxel-bg z-10">
                    <div className="w-20 h-20 border-8 border-emerald-green/30 border-t-ink-navy rounded-full animate-spin mb-4" />
                    <p className="text-3xl font-display font-black text-ink-navy animate-pulse">Looking for clues...</p>
                </div>
            )}

            {status === "error" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-voxel-bg z-10 border-4 border-ink-navy m-2 rounded-3xl">
                    <AlertCircle className="w-20 h-20 text-pokeball-red mb-4" />
                    <h3 className="text-4xl font-display font-black text-ink-navy mb-2 uppercase tracking-tighter">Oops!</h3>
                    <p className="text-xl text-gray-600 font-body font-bold mb-8 max-w-[90%]">We couldn&apos;t find a camera. Please allow access or use the manual barcode entry.</p>
                </div>
            )}

            {status === "ready" && (
                <div className="absolute bottom-12 left-0 right-0 text-center pointer-events-none z-30">
                    <span className="bg-white border-4 border-ink-navy px-8 py-3 rounded-full font-display font-black text-xl shadow-voxel">
                        Align the barcode!
                    </span>
                </div>
            )}
        </div>
    );
};