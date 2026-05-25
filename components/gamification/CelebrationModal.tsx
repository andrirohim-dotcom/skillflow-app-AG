"use client";

/**
 * CelebrationModal — Full-screen celebration overlay with canvas-confetti burst.
 * Lazy loads canvas-confetti so it doesn't block initial render.
 * Respects prefers-reduced-motion.
 */

import React, { useEffect, useRef, useState } from "react";
import { useCelebration } from "@/context/CelebrationContext";

export default function CelebrationModal() {
  const { isVisible, celebrationData, dismissCelebration } = useCelebration();
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const hasReducedMotion =
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false;

  // Trigger confetti when modal becomes visible
  useEffect(() => {
    if (!isVisible || !celebrationData || hasReducedMotion) return;

    let cancelled = false;

    // Lazy load canvas-confetti
    import("canvas-confetti").then((module) => {
      if (cancelled) return;
      const confetti = module.default;

      const colors = celebrationData.confettiColors;

      // Initial burst
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.55, x: 0.5 },
        colors,
        ticks: 200,
        gravity: 0.8,
        scalar: 1.1,
        shapes: ["circle", "square"],
      });

      // Side bursts
      setTimeout(() => {
        if (cancelled) return;
        confetti({
          particleCount: 60,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.6 },
          colors,
          ticks: 150,
        });
        confetti({
          particleCount: 60,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.6 },
          colors,
          ticks: 150,
        });
      }, 300);

      // Final sparkle
      setTimeout(() => {
        if (cancelled) return;
        confetti({
          particleCount: 40,
          spread: 120,
          origin: { y: 0.45, x: 0.5 },
          colors,
          ticks: 100,
          gravity: 0.5,
          scalar: 0.8,
        });
      }, 800);
    });

    return () => {
      cancelled = true;
    };
  }, [isVisible, celebrationData, hasReducedMotion]);

  const handleDismiss = () => {
    setIsAnimatingOut(true);
    setTimeout(() => {
      setIsAnimatingOut(false);
      dismissCelebration();
    }, 350);
  };

  if (!celebrationData) return null;
  if (!isVisible && !isAnimatingOut) return null;

  const { emoji, title, subtitle, xpReward, goldReward, extraLabel } = celebrationData;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 transition-all duration-300 ${
        isAnimatingOut ? "opacity-0" : "opacity-100"
      }`}
      onClick={handleDismiss}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/75 backdrop-blur-md" />

      {/* Modal Card */}
      <div
        className={`relative z-10 w-full max-w-sm bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 border border-white/15 rounded-3xl p-8 shadow-2xl text-center transition-all duration-300 ${
          isAnimatingOut
            ? "scale-95 opacity-0"
            : "scale-100 opacity-100"
        }`}
        style={{
          animation: !isAnimatingOut
            ? "celebrationScaleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards"
            : undefined,
          boxShadow: "0 0 60px rgba(124, 58, 237, 0.25), 0 0 120px rgba(124, 58, 237, 0.1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top glow */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-48 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Emoji */}
        <div
          className="text-6xl mb-4 select-none leading-none"
          style={{
            animation: hasReducedMotion
              ? undefined
              : "celebrationBounce 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s both",
          }}
        >
          {emoji}
        </div>

        {/* Extra label pill */}
        {extraLabel && (
          <div className="inline-block text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-violet-500/15 border border-violet-500/25 text-violet-300 mb-3">
            {extraLabel}
          </div>
        )}

        {/* Title */}
        <h2 className="text-2xl font-extrabold text-white mb-2 leading-tight">{title}</h2>

        {/* Subtitle */}
        <p className="text-sm text-slate-400 leading-relaxed mb-6 max-w-xs mx-auto">{subtitle}</p>

        {/* Rewards */}
        {(xpReward !== undefined && xpReward > 0) || (goldReward !== undefined && goldReward > 0) ? (
          <div className="flex items-center justify-center gap-3 mb-6">
            {xpReward !== undefined && xpReward > 0 && (
              <div className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-indigo-500/15 border border-indigo-500/25">
                <span className="text-base">🏆</span>
                <span className="text-sm font-bold text-indigo-300">+{xpReward} XP</span>
              </div>
            )}
            {goldReward !== undefined && goldReward > 0 && (
              <div className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-amber-500/15 border border-amber-500/25">
                <span className="text-base">🪙</span>
                <span className="text-sm font-bold text-amber-300">+{goldReward} Gold</span>
              </div>
            )}
          </div>
        ) : null}

        {/* Dismiss button */}
        <button
          onClick={handleDismiss}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-sm tracking-wider transition-all duration-200 shadow-lg shadow-violet-600/20 active:scale-[0.98] cursor-pointer"
        >
          Lanjutkan! ⚡
        </button>

        {/* Auto-dismiss hint */}
        <p className="text-[10px] text-slate-600 mt-3">Atau klik di mana saja untuk melanjutkan</p>
      </div>

      {/* Keyframe animations injected inline */}
      <style>{`
        @keyframes celebrationScaleIn {
          0% { transform: scale(0.8); opacity: 0; }
          60% { transform: scale(1.03); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes celebrationBounce {
          0% { transform: scale(0) rotate(-15deg); }
          60% { transform: scale(1.2) rotate(5deg); }
          100% { transform: scale(1) rotate(0deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          @keyframes celebrationScaleIn {
            0% { opacity: 0; }
            100% { opacity: 1; }
          }
          @keyframes celebrationBounce {
            0% { opacity: 0; }
            100% { opacity: 1; }
          }
        }
      `}</style>
    </div>
  );
}
