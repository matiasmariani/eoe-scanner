import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { ScanError } from "@/lib/scanner-types";
import { AlertCircle } from "lucide-react";

interface ScannerProps {
  onScan: (barcode: string) => void;
  onError?: (error: ScanError) => void;
}

export const Scanner: React.FC<ScannerProps> = ({ onScan, onError }) => {
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    let scanner: Html5Qrcode | null = null;

    const initScanner = () => {
      try {
        scanner = new Html5Qrcode("reader");
        scannerRef.current = scanner;

        // Correct API for the base Html5Qrcode class:
        // .start(config, onScanSuccess, onScanError)
        scanner.start(
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
          },
          (decodedText) => {
            onScan(decodedText);
          },
          (error) => {
            if (!error.message.includes("No QR code found")) {
              if (onError) onError(error as ScanError);
              console.error(error);
            }
          }
        ).then(() => {
          setStatus("ready");
        }).catch((err) => {
          console.error("Scanner start error:", err);
          setStatus("error");
        });
      } catch (e) {
        console.error("Failed to initialize scanner:", e);
        setStatus("error");
      }
    };

    const timer = setTimeout(initScanner, 100);

    return () => {
      clearTimeout(timer);
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
            We couldn't find a camera. You can still type in a barcode below!
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
