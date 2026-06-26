import React, { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner, Html5QrcodeEvent } from "html5-qrcode";
import { ScannerEvent, ScanError } from "@/lib/scanner-types";

interface ScannerProps {
  onScan: (barcode: string) => void;
  onError?: (error: ScanError) => void;
}

export const Scanner: React.FC<ScannerProps> = ({ onScan, onError }) => {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const hasRendered = useRef(false);

  useEffect(() => {
    if (hasRendered.current) return;

    const scanner = new Html5QrcodeScanner(
      "reader",
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      },
      false, // Show audio
      (decodedText) => {
        onScan(decodedText);
      },
      (error) => {
        if (!error.message.includes("No QR code found")) {
          if (onError) onError(error as ScanError);
          console.error(error);
        }
      }
    );

    scanner.render();
    scannerRef.current = scanner;
    hasRendered.current = true;

    // Simple check to see if camera is actually available
    // The library usually handles this, but we can provide a fallback
    // if the reader div stays empty.
    const checkCamera = setTimeout(() => {
      if (!scannerRef.current || !scannerRef.current.is_scanning) {
        // This is a rough check, but helps if nothing happens
      }
    }, 2000);

    return () => {
      clearTimeout(checkCamera);
      if (scannerRef.current) {
        scannerRef.current.clear().catch((err) => {
          console.error("Failed to clear scanner:", err);
        });
        scannerRef.current = null;
      }
    };
  }, []);

  return (
    <div className="relative w-full max-w-md mx-auto overflow-hidden rounded-[3rem] border-8 border-blue-400 bg-white shadow-xl flex flex-col items-center justify-center min-h-[400px]">
      <div id="reader" className="w-full h-full flex items-center justify-center" />

      {/* Overlay for No Camera Found / Errors */}
      {errorMessage && (
        <div className="absolute inset-0 bg-white/90 flex flex-col items-center justify-center p-8 text-center">
          <AlertCircle className="w-16 h-16 text-rose-500 mb-4" />
          <h3 className="text-2xl font-black text-gray-800 mb-2">Oops!</h3>
          <p className="text-lg text-gray-600">We couldn't find a camera. You can still use the barcode entry below!</p>
        </div>
      )}

      <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none">
        <span className="bg-black/50 text-white px-4 py-1 rounded-full text-sm">
          Align barcode within the frame
        </span>
      </div>
    </div>
  );
};
