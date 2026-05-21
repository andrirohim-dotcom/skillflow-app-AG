"use client";

import React, { useEffect, useState, useRef } from "react";

interface TourStep {
  targetId: string;
  title: string;
  content: string;
  position: "bottom" | "top" | "center";
}

const TOUR_STEPS: TourStep[] = [
  {
    targetId: "tour-briefing",
    title: "🌅 Briefing Harian & Log Cepat",
    content: "Di sini Anda dapat melihat target harian dan mencatat sesi belajar secara instan menggunakan tombol Quick Log (+15m, +30m, dst). Di sini juga Anda bisa membeli 🛡️ Streak Shield menggunakan XP mingguan Anda!",
    position: "bottom",
  },
  {
    targetId: "tour-heatmap",
    title: "🔥 Heatmap Konsistensi",
    content: "Setiap kotak mewakili keaktifan belajar harian Anda. Pertahankan konsistensi Anda! Jika Anda terpaksa absen, Streak Shield otomatis aktif untuk menjaga streak agar tidak patah dan mewarnai kotak hari itu dengan simbol 🛡️.",
    position: "top",
  },
  {
    targetId: "tour-skills",
    title: "📈 Tingkat Keahlian",
    content: "Lihat level dari keahlian yang sedang Anda kembangkan. Grafik garis kecil (sparkline) menunjukkan keaktifan sesi belajar Anda di setiap bidang keahlian.",
    position: "top",
  },
  {
    targetId: "tour-quests",
    title: "🎯 Bounty Quests",
    content: "Selesaikan quest mingguan seperti menulis ringkasan insight atau menyelesaikan action items untuk mempercepat progres level belajar Anda!",
    position: "top",
  },
];

interface Props {
  onComplete: () => void;
}

export default function DashboardTour({ onComplete }: Props) {
  const [currentStep, setCurrentStep] = useState(0);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const step = TOUR_STEPS[currentStep];

  useEffect(() => {
    // Remove highlight class from all possible targets
    TOUR_STEPS.forEach((s) => {
      const el = document.getElementById(s.targetId);
      if (el) el.classList.remove("tour-highlight");
    });

    const targetEl = document.getElementById(step.targetId);
    if (targetEl) {
      targetEl.classList.add("tour-highlight");
      targetEl.scrollIntoView({ behavior: "smooth", block: "center" });

      // Calculate coordinates for floating popover after scroll
      const updatePosition = () => {
        const rect = targetEl.getBoundingClientRect();
        const popoverHeight = popoverRef.current?.offsetHeight || 150;
        const popoverWidth = popoverRef.current?.offsetWidth || 320;
        
        let top = rect.bottom + window.scrollY + 16;
        let left = rect.left + window.scrollX + (rect.width - popoverWidth) / 2;

        if (step.position === "top") {
          top = rect.top + window.scrollY - popoverHeight - 16;
        }

        // Keep inside bounds
        left = Math.max(16, Math.min(left, window.innerWidth - popoverWidth - 16));
        top = Math.max(16, top);

        setCoords({ top, left });
      };

      // Delay slightly for scroll to settle
      const timer = setTimeout(updatePosition, 300);
      window.addEventListener("resize", updatePosition);
      return () => {
        clearTimeout(timer);
        window.removeEventListener("resize", updatePosition);
        targetEl.classList.remove("tour-highlight");
      };
    } else {
      // Fallback to center screen
      setCoords(null);
    }
  }, [currentStep, step]);

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClose = () => {
    // Clean up classes
    TOUR_STEPS.forEach((s) => {
      const el = document.getElementById(s.targetId);
      if (el) el.classList.remove("tour-highlight");
    });
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none">
      {/* Dimmed backdrop background (driven by the .tour-highlight box-shadow outline) */}
      <div 
        className="absolute inset-0 pointer-events-auto bg-black/35 z-[49]" 
        onClick={handleClose}
      />

      <div
        ref={popoverRef}
        style={
          coords
            ? {
                position: "absolute",
                top: `${coords.top}px`,
                left: `${coords.left}px`,
              }
            : {
                position: "fixed",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
              }
        }
        className="w-[320px] bg-bg-2/90 border border-cyan-500/30 p-5 rounded-2xl shadow-[0_10px_35px_rgba(0,0,0,0.8),0_0_20px_rgba(34,211,238,0.15)] text-text backdrop-blur-md pointer-events-auto z-[101] transition-all duration-300 animate-fade-in"
      >
        <div className="flex justify-between items-center mb-3">
          <span className="mono text-[9px] text-cyan-2 uppercase tracking-widest font-bold">
            Pemandu Fitur ({currentStep + 1}/{TOUR_STEPS.length})
          </span>
          <button
            onClick={handleClose}
            className="text-text-mute hover:text-text transition-colors text-xs"
          >
            ✕ Skip
          </button>
        </div>

        <h3 className="text-base font-semibold text-text mb-2">
          {step.title}
        </h3>
        
        <p className="text-xs text-text-dim leading-relaxed mb-5">
          {step.content}
        </p>

        <div className="flex items-center justify-between pt-3 border-t border-white/5">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="mono text-[10px] text-text-mute hover:text-text disabled:opacity-30 disabled:hover:text-text-mute transition-colors uppercase tracking-wider font-bold"
          >
            ← Kembali
          </button>
          
          <button
            onClick={handleNext}
            className="px-3.5 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/35 border border-cyan-500/40 text-cyan-2 mono text-[10px] font-bold uppercase tracking-wider active:scale-95 transition-all"
          >
            {currentStep === TOUR_STEPS.length - 1 ? "Selesai" : "Lanjut →"}
          </button>
        </div>
      </div>
    </div>
  );
}
