"use client";

import React, { useEffect, useRef, useState } from "react";
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
    const isActiveRef = useRef(true); // Track if the current effect cycle is still active
    const containerRef = useRef<HTMLDivElement>(null);

    const scanHistoryRef = useRef<{ [code: string]: number }>({});
    const lastScannedCodeRef = useRef<string>("");
    const lastScanTimeRef = useRef<number>(0);

    useEffect(() => {
        // Set to true when the effect mounts
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
                        // CRITICAL CHECK: If React unmounted this instance during initialization, stop immediately!
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
            isActiveRef.current = false; // Mark this specific hook sequence cycle as dead

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
        <div className="relative w-full max-w-md mx-auto overflow-hidden rounded-[3rem] border-8 border-blue-400 bg-white shadow-xl flex flex-col items-center justify-center min-h-[400px]">
            <div
                ref={containerRef}
                id="reader"
                className={`w-full h-full [&>video]:w-full [&>video]:h-full [&>video]:object-cover ${status === "ready" ? "block" : "hidden"}`}
            />

            {status === "loading" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-white z-10" role="status" aria-live="polite" aria-label="Loading">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="text-xl font-bold text-blue-600">Finding your camera...</p>
                </div>
            )}

            {status === "error" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-white z-10" role="alert" aria-live="assertive">
                    <AlertCircle className="w-20 h-20 text-rose-500 mb-4" />
                    <h3 className="text-3xl font-black text-gray-800 mb-2">Oops!</h3>
                    <p className="text-xl text-gray-600 font-bold mb-4"> We couldn&apos;t find a camera. </p>
                    <p className="text-sm text-gray-500 mb-6"> Please allow camera access or use the manual barcode entry below. </p>
                    <p className="text-sm text-gray-400"> Tip: Camera access requires HTTPS or localhost </p>
                </div>
            )}

            {status === "ready" && (
                <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none z-20">
                    <span className="bg-black/50 text-white px-4 py-1 rounded-full text-sm"> Align barcode within the frame </span>
                </div>
            )}
        </div>
    );
};
