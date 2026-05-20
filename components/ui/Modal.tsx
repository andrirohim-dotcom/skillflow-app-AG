"use client";

import { useEffect } from "react";

interface Props {
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg";
}

const widths = { sm: "max-w-sm", md: "max-w-lg", lg: "max-w-2xl" };

export default function Modal({ onClose, title, children, maxWidth = "md" }: Props) {
  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-start justify-center pt-12 px-4 pb-8 overflow-y-auto"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className={`w-full ${widths[maxWidth]} relative`}>
        {title && (
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-white font-semibold">{title}</h2>
            <button
              onClick={onClose}
              className="text-white/60 hover:text-white text-sm font-medium transition-colors"
            >
              ✕ Tutup
            </button>
          </div>
        )}
        {!title && (
          <button
            onClick={onClose}
            className="absolute -top-10 right-0 text-white/70 hover:text-white text-sm font-medium transition-colors"
          >
            ✕ Tutup
          </button>
        )}
        {children}
      </div>
    </div>
  );
}
