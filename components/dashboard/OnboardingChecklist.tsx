"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { LearningSource, LearningSession, KeyInsight } from "@/lib/types";

interface Props {
  sources: LearningSource[];
  sessions: LearningSession[];
  insights: KeyInsight[];
  onAddSource: () => void;
}

export default function OnboardingChecklist({ sources, sessions, insights, onAddSource }: Props) {
  const router = useRouter();
  const [isDismissed, setIsDismissed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem("skillflow:onboarding_checklist_dismissed");
    if (dismissed === "true") setIsDismissed(true);
    setMounted(true);
  }, []);

  if (!mounted || isDismissed) return null;

  const steps = [
    {
      id: "account",
      label: "Akun dibuat",
      completed: true,
      description: "Profil kamu sudah siap digunakan.",
    },
    {
      id: "source",
      label: "Tambah sumber belajar pertama",
      completed: sources.length > 0,
      description: "Buku, kursus, atau video YouTube yang ingin kamu pelajari.",
      cta: "Tambah Sekarang",
      action: onAddSource,
    },
    {
      id: "session",
      label: "Catat sesi belajar pertama",
      completed: sessions.length > 0,
      description: "Mulai pelajari sumber dan catat berapa menit kamu fokus.",
      cta: "Buka Sumber",
      action: () => sources[0] ? router.push(`/dashboard/item/${sources[0].id}`) : onAddSource(),
    },
    {
      id: "insight",
      label: "Simpan 1 insight dari bacaan",
      completed: insights.length > 0,
      description: "Catat kutipan atau pelajaran berharga untuk diingat.",
      cta: "Tulis Insight",
      action: () => sources[0] ? router.push(`/dashboard/item/${sources[0].id}?tab=insights`) : onAddSource(),
    },
  ];

  const allCompleted = steps.every((s) => s.completed);

  const handleDismiss = () => {
    localStorage.setItem("skillflow:onboarding_checklist_dismissed", "true");
    setIsDismissed(true);
  };

  if (allCompleted) {
    return (
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-8 text-center text-white shadow-lg animate-bounce-subtle relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
          <div className="absolute top-4 left-10 text-2xl animate-float">✨</div>
          <div className="absolute bottom-10 right-20 text-3xl animate-float-delayed">🚀</div>
          <div className="absolute top-20 right-10 text-xl animate-float">🎉</div>
        </div>

        <div className="relative z-10">
          <div className="text-5xl mb-4">🥳</div>
          <h2 className="text-2xl font-black mb-2 font-display">Selamat! Learning OS kamu sudah aktif</h2>
          <p className="text-emerald-50 max-w-md mx-auto mb-6 text-sm opacity-90">
            Kamu telah menyelesaikan langkah dasar untuk mulai menguasai skill baru secara terstruktur.
          </p>
          <button
            onClick={handleDismiss}
            className="bg-white text-emerald-600 font-bold px-8 py-3 rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition-all"
          >
            Mulai Journey 🚀
          </button>
        </div>

        <style jsx>{`
          @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-20px); }
          }
          @keyframes float-delayed {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-15px); }
          }
          .animate-float { animation: float 3s ease-in-out infinite; }
          .animate-float-delayed { animation: float-delayed 4s ease-in-out infinite; }
          .animate-bounce-subtle { animation: bounce-subtle 2s ease-in-out infinite; }
          @keyframes bounce-subtle {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-5px); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="bg-white border-2 border-sky-100 rounded-3xl p-6 shadow-sm shadow-sky-100/50">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-black text-gray-900 font-display">🚀 Langkah Awal Belajarmu</h2>
          <p className="text-xs text-gray-400 mt-1">Selesaikan checklist ini untuk mengaktifkan Learning OS kamu.</p>
        </div>
        <div className="bg-sky-50 text-sky-600 px-3 py-1.5 rounded-full text-xs font-bold">
          {steps.filter(s => s.completed).length} / {steps.length} Selesai
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {steps.map((step, idx) => (
          <div
            key={step.id}
            className={`relative p-4 rounded-2xl border-2 transition-all ${
              step.completed
                ? "bg-emerald-50/50 border-emerald-100 opacity-80"
                : "bg-white border-gray-100 hover:border-sky-200 hover:shadow-md"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                step.completed ? "bg-emerald-500 text-white" : "bg-gray-100 text-gray-400"
              }`}>
                {step.completed ? "✓" : idx + 1}
              </div>
              {!step.completed && step.cta && (
                <button
                  onClick={step.action}
                  className="text-[10px] font-bold text-sky-600 hover:underline uppercase tracking-tight"
                >
                  {step.cta} →
                </button>
              )}
            </div>
            <h3 className={`text-sm font-bold leading-tight ${step.completed ? "text-emerald-900" : "text-gray-900"}`}>
              {step.label}
            </h3>
            <p className="text-[11px] text-gray-400 mt-1.5 leading-relaxed">{step.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
