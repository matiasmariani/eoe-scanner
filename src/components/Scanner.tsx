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

    useEffect(() => {
        // Ensure execution only happens on the client side
        if (typeof window === "undefined" || isInitializedRef.current) return;

        const initScanner = async () => {
            // Guarantee the DOM node is fully mounted and available
            if (!containerRef.current) {
                setStatus("error");
                return;
            }

            try {
                Quagga.init(
                    {
                        inputStream: {
                            type: "LiveStream",
                            // Pass the direct element reference instead of a query string
                            target: containerRef.current,
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
                            if (onError) onError({ message: String(err) } as ScanError);
                            return;
                        }

                        isInitializedRef.current = true;
                        Quagga.start();

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
                if (onError) onError({ message: String(err) } as ScanError);
            }
        };

        // Execution delay to allow React DOM paint cycles to complete
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
            {/* The Target Node must stay permanently in the DOM so Quagga can inject the stream */}
            <div
                ref={containerRef}
                id="reader"
                className={`w-full h-full ${status === "ready" ? "block" : "hidden"}`}
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
