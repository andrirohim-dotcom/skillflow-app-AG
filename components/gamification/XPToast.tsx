"use client";

/**
 * XPToast — Floating micro-feedback notification for quick log sessions.
 * Queue system supports multiple simultaneous toasts.
 * Slide-in from right → pause → fade-out up.
 * Respects prefers-reduced-motion.
 */

import React, { createContext, useCallback, useContext, useRef, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ToastItem {
  id: string;
  message: string;
  icon: string;
  color: "indigo" | "emerald" | "amber" | "violet" | "sky";
  phase: "entering" | "visible" | "leaving";
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface XPToastContextValue {
  toasts: ToastItem[];
  showToast: (message: string, icon?: string, color?: ToastItem["color"]) => void;
}

const XPToastContext = createContext<XPToastContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function XPToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const showToast = useCallback(
    (message: string, icon = "🔥", color: ToastItem["color"] = "indigo") => {
      const id = crypto.randomUUID();

      // Add toast in "entering" phase
      const newToast: ToastItem = { id, message, icon, color, phase: "entering" };
      setToasts((prev) => [...prev.slice(-4), newToast]); // Max 5 toasts

      // Switch to "visible" after 50ms (trigger slide-in)
      const t1 = setTimeout(() => {
        setToasts((prev) =>
          prev.map((t) => (t.id === id ? { ...t, phase: "visible" } : t))
        );
      }, 50);

      // Start leaving after 1.8s
      const t2 = setTimeout(() => {
        setToasts((prev) =>
          prev.map((t) => (t.id === id ? { ...t, phase: "leaving" } : t))
        );
      }, 1800);

      // Remove after leave animation (400ms)
      const t3 = setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
        timersRef.current.delete(id);
      }, 2200);

      timersRef.current.set(id, t3);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
        timersRef.current.delete(id);
      };
    },
    []
  );

  return (
    <XPToastContext.Provider value={{ toasts, showToast }}>
      {children}
      <XPToastContainer toasts={toasts} />
    </XPToastContext.Provider>
  );
}

// ─── Toast Container (renders in corner) ─────────────────────────────────────

const COLOR_MAP: Record<
  ToastItem["color"],
  { bg: string; border: string; text: string; iconBg: string }
> = {
  indigo: {
    bg: "bg-[#1E1B4B]/95",
    border: "border-indigo-500/40",
    text: "text-indigo-200",
    iconBg: "bg-indigo-500/20",
  },
  violet: {
    bg: "bg-[#1E1B4B]/95",
    border: "border-violet-500/40",
    text: "text-violet-200",
    iconBg: "bg-violet-500/20",
  },
  emerald: {
    bg: "bg-emerald-950/95",
    border: "border-emerald-500/40",
    text: "text-emerald-200",
    iconBg: "bg-emerald-500/20",
  },
  amber: {
    bg: "bg-amber-950/95",
    border: "border-amber-500/40",
    text: "text-amber-200",
    iconBg: "bg-amber-500/20",
  },
  sky: {
    bg: "bg-sky-950/95",
    border: "border-sky-500/40",
    text: "text-sky-200",
    iconBg: "bg-sky-500/20",
  },
};

function XPToastContainer({ toasts }: { toasts: ToastItem[] }) {
  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed top-4 right-4 z-[9998] flex flex-col gap-2 items-end pointer-events-none"
      aria-live="polite"
      aria-atomic="false"
    >
      {toasts.map((toast) => (
        <XPToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
}

function XPToastItem({ toast }: { toast: ToastItem }) {
  const colors = COLOR_MAP[toast.color];

  const slideClass =
    toast.phase === "entering"
      ? "translate-x-full opacity-0"
      : toast.phase === "leaving"
      ? "-translate-y-3 opacity-0 scale-95"
      : "translate-x-0 opacity-100 scale-100";

  return (
    <div
      className={`
        flex items-center gap-3 px-4 py-3 rounded-2xl border backdrop-blur-xl shadow-xl
        transition-all duration-300 ease-out
        ${colors.bg} ${colors.border} ${colors.text}
        ${slideClass}
        @media (prefers-reduced-motion: reduce) { transition-none }
      `}
      style={{ minWidth: "220px", maxWidth: "300px" }}
      role="status"
    >
      <div className={`w-8 h-8 rounded-xl ${colors.iconBg} flex items-center justify-center shrink-0 text-base`}>
        {toast.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold leading-tight text-white">{toast.message}</p>
      </div>
    </div>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useXPToast(): XPToastContextValue {
  const ctx = useContext(XPToastContext);
  if (!ctx) throw new Error("useXPToast must be used inside <XPToastProvider>");
  return ctx;
}
