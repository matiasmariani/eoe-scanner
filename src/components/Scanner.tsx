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

    useEffect(() => {
        // Prevent double-initialization in Next.js Strict Mode
        if (isInitializedRef.current) return;

        const initScanner = async () => {
            try {
                Quagga.init(
                    {
                        inputStream: {
                            type: "LiveStream",
                            target: document.querySelector('#reader') || undefined,
                            constraints: {
                                width: 640,
                                height: 480,
                                facingMode: "environment"
                            }
                        },
                        decoder: {
                            readers: [
                                "code_128_reader",
                                "ean_reader",
                                "ean_8_reader",
                                "code_39_reader",
                                "code_39_vin_reader",
                                "codabar_reader",
                                "upc_reader",
                                "upc_e_reader",
                                "i2of5_reader"
                            ]
                        },
                        locate: true
                    },
                    (err) => {
                        if (err) {
                            console.error("Quagga initialization error:", err);
                            setStatus("error");
                            return;
                        }

                        isInitializedRef.current = true;
                        Quagga.start();

                        // Set up barcode detection callback
                        Quagga.onDetected((result: QuaggaJSResultObject) => {
                            if (result.codeResult && result.codeResult.code) {
                                onScan(result.codeResult.code);
                            }
                        });

                        setStatus("ready");
                    }
                );
            } catch (err) {
                console.error("Scanner start error:", err);
                setStatus("error");
            }
        };

        const timer = setTimeout(initScanner, 100);

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
            {status === "loading" && (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="text-xl font-bold text-blue-600">Finding your camera...</p>
                </div>
            )}

            {status === "error" && (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                    <AlertCircle className="w-20 h-20 text-rose-500 mb-4" />
                    <h3 className="text-3xl font-black text-gray-800 mb-2">Oops!</h3>
                    <p className="text-xl text-gray-600 font-bold">
                        We couldn&apos;t find a camera. You can still type in a barcode below&apos;
                    </p>
                </div>
            )}

            {status === "ready" && (
                <div id="reader" className="w-full h-full" />
            )}

            <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none">
                <span className="bg-black/50 text-white px-4 py-1 rounded-full text-sm">
                    Align barcode within the frame
                </span>
            </div>
        </div>
    );
};
