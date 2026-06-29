"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { BarcodeDetector as BarcodeDetectorPonyfill } from "barcode-detector/ponyfill";
import { ScanError } from "@/lib/scanner-types";
import { AlertCircle } from "lucide-react";
import { logError } from "@/lib/errorHandling";

interface ScannerProps {
    onScan: (barcode: string) => void;
    onError?: (error: ScanError) => void;
}

// Grocery barcodes are EAN/UPC; Code 128 covers some store labels.
const FORMATS = ["ean_13", "ean_8", "upc_a", "upc_e", "code_128"] as const;

// Use the platform's native BarcodeDetector (Android Chrome → ML Kit, Safari 17+)
// when present; otherwise fall back to the zxing-wasm ponyfill. Same API either way.
const BarcodeDetectorImpl: typeof BarcodeDetectorPonyfill =
    typeof window !== "undefined" && "BarcodeDetector" in window
        ? ((window as unknown as { BarcodeDetector: typeof BarcodeDetectorPonyfill }).BarcodeDetector)
        : BarcodeDetectorPonyfill;

const DETECT_INTERVAL_MS = 250;

export const Scanner: React.FC<ScannerProps> = ({ onScan, onError }) => {
    const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const detectingRef = useRef(false);
    const firedRef = useRef(false);

    useEffect(() => {
        let cancelled = false;
        const video = videoRef.current;

        const fail = (err: unknown, isPermissionError = false) => {
            logError("Scanner", err);
            console.log("camera: error", { message: String(err), isPermissionError });
            if (cancelled) return;
            setStatus("error");
            onError?.({
                message: isPermissionError
                    ? "Camera permission denied. Please allow camera access or use the manual barcode entry."
                    : String(err),
                isPermissionError,
            });
        };

        const start = async () => {
            console.log("camera: start");
            if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
                fail(new Error("Camera API unavailable in this browser"));
                return;
            }

            let stream: MediaStream;
            try {
                stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        facingMode: { ideal: "environment" },
                        width: { ideal: 1280 },
                        height: { ideal: 720 },
                    },
                    audio: false,
                });
            } catch (err) {
                const name = err instanceof DOMException ? err.name : "";
                fail(err, name === "NotAllowedError" || name === "SecurityError");
                return;
            }

            console.log("camera: stream acquired", { tracks: stream.getVideoTracks().length });
            if (cancelled) {
                stream.getTracks().forEach((t) => t.stop());
                return;
            }
            streamRef.current = stream;

            // Best-effort continuous autofocus — must be applied to the live track,
            // not via getUserMedia constraints (which ignore focusMode).
            const track = stream.getVideoTracks()[0];
            try {
                await track.applyConstraints({ advanced: [{ focusMode: "continuous" } as MediaTrackConstraintSet] });
                console.log("camera: continuous focus applied");
            } catch {
                console.log("camera: continuous focus not supported (ok)");
            }

            if (!video) {
                fail(new Error("Video element missing"));
                return;
            }
            video.srcObject = stream;
            try {
                await video.play();
            } catch (err) {
                fail(err);
                return;
            }

            const detector = new BarcodeDetectorImpl({ formats: [...FORMATS] });
            console.log("camera: detector ready", {
                native: BarcodeDetectorImpl !== BarcodeDetectorPonyfill,
                formats: FORMATS,
            });
            if (cancelled) return;
            setStatus("ready");

            intervalRef.current = setInterval(async () => {
                if (detectingRef.current || firedRef.current) return;
                if (!video || video.readyState < 2 || video.videoWidth === 0) return;

                detectingRef.current = true;
                try {
                    const codes = await detector.detect(video);
                    if (codes.length > 0) {
                        console.log("camera: detected", codes.map((c) => ({ value: c.rawValue, format: c.format })));
                        const code = codes[0].rawValue;
                        if (code && !firedRef.current) {
                            firedRef.current = true;
                            console.log("camera: ACCEPTED — firing onScan", { code });
                            onScan(code);
                        }
                    }
                } catch (err) {
                    console.log("camera: detect threw", { message: String(err) });
                } finally {
                    detectingRef.current = false;
                }
            }, DETECT_INTERVAL_MS);
        };

        start();

        return () => {
            console.log("camera: cleanup");
            cancelled = true;
            if (intervalRef.current) clearInterval(intervalRef.current);
            intervalRef.current = null;
            streamRef.current?.getTracks().forEach((t) => t.stop());
            streamRef.current = null;
            if (video) video.srcObject = null;
        };
    }, [onScan, onError]);

    return (
        <div className="relative w-full max-w-md mx-auto overflow-hidden bg-deep-stone border-4 border-ink-navy shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center justify-center min-h-[360px] rounded-[3rem] p-2">
            <video
                ref={videoRef}
                muted
                playsInline
                className={`w-full h-full object-cover rounded-[2.5rem] ${status === "ready" ? "block" : "hidden"}`}
            />

            {status === "ready" && (
                <div className="absolute inset-0 pointer-events-none z-20">
                    <div className="absolute top-8 left-8 w-20 h-20 border-8 border-ink-navy/40 rounded-2xl shadow-voxel" />
                    <div className="absolute top-8 right-8 w-20 h-20 border-8 border-ink-navy/40 rounded-2xl shadow-voxel" />
                    <div className="absolute bottom-8 left-8 w-20 h-20 border-8 border-ink-navy/40 rounded-2xl shadow-voxel" />
                    <div className="absolute bottom-8 right-8 w-20 h-20 border-8 border-ink-navy/40 rounded-2xl shadow-voxel" />

                    {/* Scanning Line */}
                    <motion.div
                        className="absolute w-full h-2 bg-pikachu-yellow/40 z-10 blur-[2px]"
                        animate={{ top: ['0%', '100%'] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    />
                </div>
            )}

            {status === "loading" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-deep-stone z-10">
                    <div className="w-24 h-24 border-8 border-grass-green/30 border-t-ink-navy rounded-full animate-spin mb-4" />
                    <p className="text-4xl font-display font-black text-block-white animate-pulse">Looking for clues...</p>
                </div>
            )}

            {status === "error" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-deep-stone z-10 border-4 border-ink-navy m-4 rounded-[2.5rem]">
                    <AlertCircle className="w-24 h-24 text-redstone-red mb-4" />
                    <h3 className="text-4xl font-display font-black text-ink-navy mb-2 uppercase tracking-tighter">Oops!</h3>
                    <p className="text-xl text-gray-600 font-body font-bold mb-8 max-w-[90%]">We couldn&apos;t find a camera. Please allow access or use the manual barcode entry.</p>
                </div>
            )}

            {status === "ready" && (
                <div className="absolute bottom-10 left-0 right-0 text-center pointer-events-none z-30">
                    <span className="bg-block-white border-4 border-ink-navy px-10 py-4 rounded-full font-display font-black text-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        Align the barcode!
                    </span>
                </div>
            )}
        </div>
    );
};
