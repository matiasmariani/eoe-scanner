"use client";

import React, { useEffect, useRef, useState } from "react";
import Quagga, { QuaggaJSResultObject } from "@ericblade/quagga2";
import { ScanError } from "@/lib/scanner-types";
import { AlertCircle } from "lucide-react";

interface ScannerProps {
    onScan: (barcode: string) => void;
    onError?: (error: ScanError) => void;
}

export const Scanner: React.FC<ScannerProps> = ({ onScan, onError }) => {
    const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
    const isInitializedRef = useRef(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Tracks sequential frame outputs to eliminate misfires
    const scanHistoryRef = useRef<{ [code: string]: number }>({});
    const lastScannedCodeRef = useRef<string>("");
    const lastScanTimeRef = useRef<number>(0);

    useEffect(() => {
        if (typeof window === "undefined" || isInitializedRef.current) return;

        const initScanner = async () => {
            if (!containerRef.current) {
                setStatus("error");
                return;
            }

            try {
                Quagga.init(
                    {
                        inputStream: {
                            type: "LiveStream",
                            target: containerRef.current,
                            constraints: {
                                // Upgraded resolution for sharper line distinction
                                width: { min: 640, ideal: 1280, max: 1920 },
                                height: { min: 480, ideal: 720, max: 1080 },
                                facingMode: "environment",
                                // Helps mobile phone browsers focus sharply on close objects
                                ...({ focusMode: "continuous" } as Record<string, unknown>)
                            },
                            singleChannel: false // Set to true only if dealing strictly with black & white inputs
                        },
                        // Tells the engine to dynamically scan parts of the frame
                        locate: true,
                        locator: {
                            halfSample: true, // Speeds up calculation processing significantly
                            patchSize: "medium" // "small", "medium", "large", "x-large"
                        },
                        // Limits calculation cycles strictly to performance configurations
                        numOfWorkers: typeof navigator !== 'undefined' ? Math.min(navigator.hardwareConcurrency || 2, 4) : 2,
                        decoder: {
                            // ⚠️ REDUCED: Only look for standard retail and asset tracking items
                            readers: [
                                "ean_reader",
                                "ean_8_reader",
                                "upc_reader",
                                "upc_e_reader",
                                "code_128_reader"
                            ],
                            multiple: false // Stop checking frame after a single match is found
                        }
                    },
                    (err) => {
                        if (err) {
                            console.error("Quagga initialization error:", err);
                            setStatus("error");
                            if (onError) onError({ message: String(err) } as ScanError);
                            return;
                        }

                        isInitializedRef.current = true;
                        Quagga.start();

                        // Advanced verification filter logic
                        Quagga.onDetected((result: QuaggaJSResultObject) => {
                            const code = result.codeResult?.code;

                            if (!code) return;

                            // 1. Guardrail: Basic data integrity check
                            // Cast explicitly to include the fallback property type to satisfy ESLint
                            if ((result.codeResult as { fallback?: boolean }).fallback || !result.codeResult.format) return;
                            const now = Date.now();

                            // 2. Guardrail: Anti-spam timeout (Prevents firing multiple scans of the same item within 3 seconds)
                            if (code === lastScannedCodeRef.current && now - lastScanTimeRef.current < 3000) {
                                return;
                            }

                            // 3. Guardrail: Sequential Frame Mode Validation Check
                            // Increment how many times this specific string has been read across frames
                            scanHistoryRef.current[code] = (scanHistoryRef.current[code] || 0) + 1;

                            // REQUIREMENT: Must be verified across 3 distinct video frames to confirm accuracy
                            if (scanHistoryRef.current[code] >= 3) {
                                lastScannedCodeRef.current = code;
                                lastScanTimeRef.current = now;
                                scanHistoryRef.current = {}; // Flush the buffer cache

                                onScan(code);
                            }
                        });

                        setStatus("ready");
                    }
                );
            } catch (err) {
                console.error("Scanner start error:", err);
                setStatus("error");
                if (onError) onError({ message: String(err) } as ScanError);
            }
        };

        const timer = setTimeout(initScanner, 300);

        return () => {
            clearTimeout(timer);
            if (isInitializedRef.current) {
                try {
                    Quagga.offDetected();
                    Quagga.stop();
                } catch (err) {
                    console.error("Failed to stop scanner:", err);
                }
                isInitializedRef.current = false;
            }
        };
    }, [onScan, onError]);

    return (
        <div className="relative w-full max-w-md mx-auto overflow-hidden rounded-[3rem] border-8 border-blue-400 bg-white shadow-xl flex flex-col items-center justify-center min-h-[400px]">
            {/* Custom overlay rules for Quagga injected video element */}
            <div
                ref={containerRef}
                id="reader"
                className={`w-full h-full [&>video]:w-full [&>video]:h-full [&>video]:object-cover ${status === "ready" ? "block" : "hidden"}`}
            />

            {status === "loading" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-white z-10">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="text-xl font-bold text-blue-600">Finding your camera...</p>
                </div>
            )}

            {status === "error" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-white z-10">
                    <AlertCircle className="w-20 h-20 text-rose-500 mb-4" />
                    <h3 className="text-3xl font-black text-gray-800 mb-2">Oops!</h3>
                    <p className="text-xl text-gray-600 font-bold">
                        We couldn&apos;t find a camera. You can still type in a barcode below.
                    </p>
                </div>
            )}

            {status === "ready" && (
                <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none z-20">
                    <span className="bg-black/50 text-white px-4 py-1 rounded-full text-sm">
                        Align barcode within the frame
                    </span>
                </div>
            )}
        </div>
    );
};