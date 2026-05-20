"use client";

import { useEffect } from "react";

interface Props {
  message: string;
  onDismiss: () => void;
}

export default function Toast({ message, onDismiss }: Props) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 3000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <div className="fixed top-4 right-4 z-50 bg-emerald-600 text-white text-sm font-semibold px-4 py-3 rounded-xl shadow-lg max-w-sm animate-slide-up flex items-start gap-2.5">
      <span className="leading-snug">{message}</span>
      <button
        onClick={onDismiss}
        className="shrink-0 text-white/70 hover:text-white text-xs mt-0.5 transition-colors"
        aria-label="Tutup"
      >
        ✕
      </button>
    </div>
  );
}
