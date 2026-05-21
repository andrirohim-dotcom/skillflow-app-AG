"use client";

import React, { useEffect } from "react";
import { Icon } from "./SleekPrimitives";

interface LevelUpModalProps {
  level: number;
  title: string;
  onClose: () => void;
}

export default function LevelUpModal({ level, title, onClose }: LevelUpModalProps) {
  // Prevent scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Generate 30 random confetti properties
  const confettiParticles = Array.from({ length: 35 }).map((_, i) => {
    const colors = ["#8b5cf6", "#3b82f6", "#06b6d4", "#10b981", "#f59e0b", "#ec4899"];
    const shapes = ["circle", "square", "triangle"];
    const color = colors[i % colors.length];
    const shape = shapes[i % shapes.length];
    
    const left = Math.random() * 100; // 0% to 100% width
    const delay = Math.random() * 3.5; // 0s to 3.5s delay
    const duration = 2.5 + Math.random() * 2.5; // 2.5s to 5s duration
    const scale = 0.5 + Math.random() * 0.8; // size scale
    const rotation = Math.random() * 360;

    return { id: i, left, delay, duration, color, shape, scale, rotation };
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/75 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Confetti Container */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
        {confettiParticles.map((p) => {
          let shapeSvg = null;
          if (p.shape === "circle") {
            shapeSvg = <circle cx="10" cy="10" r="8" fill={p.color} />;
          } else if (p.shape === "square") {
            shapeSvg = <rect x="2" y="2" width="16" height="16" fill={p.color} rx="2" />;
          } else {
            // Triangle
            shapeSvg = <polygon points="10,2 2,18 18,18" fill={p.color} />;
          }

          return (
            <svg
              key={p.id}
              className="absolute confetti-particle"
              style={{
                left: `${p.left}%`,
                animationDelay: `${p.delay}s`,
                animationDuration: `${p.duration}s`,
                transform: `scale(${p.scale}) rotate(${p.rotation}deg)`,
                top: "-20px",
                width: "20px",
                height: "20px"
              }}
              viewBox="0 0 20 20"
            >
              {shapeSvg}
            </svg>
          );
        })}
      </div>

      {/* Celebration Card */}
      <div className="relative w-full max-w-md bg-surface/85 border border-indigo-500/30 rounded-[2.5rem] p-8 md:p-10 shadow-2xl shadow-indigo-500/20 backdrop-blur-xl text-center transform scale-up-bounce z-20 overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none" />

        {/* Level Emblem with Ring Animation */}
        <div className="relative inline-flex items-center justify-center mb-6">
          {/* Animated rotating border */}
          <div className="absolute inset-0 w-32 h-32 rounded-full border-2 border-dashed border-indigo-500/40 animate-[spin_20s_linear_infinite]" />
          
          {/* Pulsing Outer Glow */}
          <div className="absolute w-28 h-28 bg-indigo-500/20 rounded-full blur-xl animate-pulse" />
          
          {/* Main Circle */}
          <div className="relative w-28 h-28 rounded-full bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-500 p-[3px] shadow-[0_0_30px_rgba(99,102,241,0.4)]">
            <div className="w-full h-full rounded-full bg-bg-1 flex flex-col items-center justify-center">
              <span className="text-[11px] font-bold text-text-mute uppercase tracking-[0.2em] -mb-1">Level</span>
              <span className="text-4xl font-display font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-100 to-cyan-2">
                {level}
              </span>
            </div>
          </div>
        </div>

        {/* Level Up Title */}
        <div className="mono text-[10px] text-cyan-2 uppercase tracking-[0.25em] mb-2.5">
          Level Up Achieved!
        </div>
        <h2 className="text-3xl font-display font-bold text-text mb-3 leading-tight">
          Kenaikan Level Baru!
        </h2>
        <p className="text-sm text-text-dim max-w-xs mx-auto leading-relaxed mb-6">
          Selamat! Kamu telah naik ke level berikutnya. Gelar belajarmu sekarang adalah:
        </p>

        {/* Title Badge */}
        <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-500/15 to-purple-500/15 border border-indigo-500/25 shadow-inner mb-8 animate-pulse">
          <span className="text-base">🔮</span>
          <span className="font-display font-bold text-indigo-2 text-sm tracking-wide">
            {title}
          </span>
        </div>

        {/* Interactive Close Button */}
        <button
          onClick={onClose}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm tracking-wider uppercase transition-all duration-200 shadow-lg shadow-indigo-600/20 active:scale-[0.98] flex items-center justify-center gap-2 group"
        >
          <span>Lanjutkan Perjalanan</span>
          <Icon name="arrow-right" size={14} className="transition-transform group-hover:translate-x-1" />
        </button>
      </div>

      {/* Self-contained CSS for custom animations */}
      <style jsx global>{`
        @keyframes confetti-fall-down {
          0% {
            transform: translateY(-20px) rotate(0deg);
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        
        .confetti-particle {
          animation: confetti-fall-down 4s linear infinite;
        }

        @keyframes scale-up-bounce {
          0% {
            transform: scale(0.9);
            opacity: 0;
          }
          60% {
            transform: scale(1.03);
            opacity: 0.9;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        .scale-up-bounce {
          animation: scale-up-bounce 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `}</style>
    </div>
  );
}
