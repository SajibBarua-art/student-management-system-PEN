"use client";

import React, { useEffect, useState } from "react";
import QRCode from "qrcode";

interface DocumentQrCodeProps {
  value: string;
  size?: number;
  className?: string;
}

/**
 * Standard ISO/IEC 18004 Valid QR Code Component
 * Generates genuine, camera-scannable QR code vector SVG with Reed-Solomon error correction.
 */
export function DocumentQrCode({
  value,
  size = 90,
  className = "",
}: DocumentQrCodeProps) {
  const [svgXml, setSvgXml] = useState<string>("");

  useEffect(() => {
    if (!value) return;

    QRCode.toString(
      value,
      {
        type: "svg",
        margin: 1,
        errorCorrectionLevel: "M",
        color: {
          dark: "#0f172a",
          light: "#ffffff",
        },
      },
      (err, output) => {
        if (!err && output) {
          setSvgXml(output);
        } else if (err) {
          console.error("Failed to generate QR code:", err);
        }
      }
    );
  }, [value]);

  if (!svgXml) {
    return (
      <div
        style={{ width: size, height: size }}
        className={`border border-slate-300 dark:border-white/20 p-1.5 bg-white rounded-lg shadow-sm flex items-center justify-center animate-pulse ${className}`}
      >
        <span className="text-[8px] text-slate-400 font-mono">Generating...</span>
      </div>
    );
  }

  return (
    <div
      style={{ width: size, height: size }}
      className={`border border-slate-300 dark:border-white/20 p-1 bg-white rounded-lg shadow-sm flex items-center justify-center overflow-hidden [&>svg]:w-full [&>svg]:h-full [&>svg]:block ${className}`}
      dangerouslySetInnerHTML={{ __html: svgXml }}
    />
  );
}
