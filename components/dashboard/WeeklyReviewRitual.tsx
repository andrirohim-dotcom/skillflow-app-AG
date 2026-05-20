"use client";

import { useState, useMemo, useEffect } from "react";
import { useWorkspace } from "@/lib/contexts/WorkspaceContext";
import { saveWsInsight } from "@/lib/storageV2";
import { 
  getWeeklyMinutes, 
  getInsightsThisWeek, 
  getCompletedActionItemsThisWeek 
} from "@/lib/utils/analytics";
import type { LearningSession, KeyInsight, SkillProgress, WeeklyReport } from "@/lib/types";
import Modal from "@/components/ui/Modal";

interface Props {
  sessions: LearningSession[];
  insights: KeyInsight[];
  skillProgress: SkillProgress[];
  onRefresh: () => void;
}

export default function WeeklyReviewRitual({ sessions, insights, skillProgress, onRefresh }: Props) {
  const { currentUser: user, currentWorkspace: workspace } = useWorkspace();
  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState(1);
  const [isDismissed, setIsDismissed] = useState(false);

  // Form states
  const [wins, setWins] = useState("");
  const [challenges, setChallenges] = useState("");
  const [focusArea, setFocusArea] = useState("");
  const [goal, setGoal] = useState("");

  const stats = useMemo(() => ({
    minutes: getWeeklyMinutes(sessions),
    insights: getInsightsThisWeek(insights),
    actions: getCompletedActionItemsThisWeek(skillProgress),
    sessions: sessions.filter(s => new Date(s.date) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length,
  }), [sessions, insights, skillProgress]);

  useEffect(() => {
    // Only show if today is Sunday (0) or Saturday (6) and not yet dismissed for this week
    const today = new Date().getDay();
    const isWeekend = today === 0 || today === 6;
    const lastDismissed = localStorage.getItem("skillflow:weekly_review_dismissed");
    const thisWeek = getWeekNumber(new Date());
    
    if (!isWeekend || lastDismissed === String(thisWeek)) {
      setIsDismissed(true);
    }
  }, []);

  if (isDismissed) return null;

  async function handleSave() {
    if (!user || !workspace) return;
    
    const report: WeeklyReport = {
      id: crypto.randomUUID(),
      workspaceId: workspace.id,
      userId: user.id,
      weekStarting: new Date().toISOString(), // Simplified
      stats: {
        minutesSpent: stats.minutes,
        insightsCount: stats.insights,
        sessionsCount: stats.sessions,
        tasksCompleted: stats.actions,
      },
      reflections: { wins, challenges },
      nextWeekPlan: { focusArea, goal },
      createdAt: new Date().toISOString(),
    };

    // Save as a special insight
    const insight: KeyInsight = {
      id: report.id,
      workspaceId: workspace.id,
      userId: user.id,
      type: "weekly_report",
      quote: `Review Mingguan: ${new Date().toLocaleDateString("id-ID", { month: "long", day: "numeric" })}`,
      reflection: JSON.stringify(report),
      tags: ["weekly-review"],
      createdAt: report.createdAt,
    };

    await saveWsInsight(workspace.id, user.id, insight);
    
    localStorage.setItem("skillflow:weekly_review_dismissed", String(getWeekNumber(new Date())));
    setIsDismissed(true);
    setShowModal(false);
    onRefresh();
  }

  return (
    <>
      <div className="bg-gradient-to-br from-violet-600 to-indigo-700 rounded-3xl p-6 text-white shadow-xl shadow-indigo-200 animate-slide-up">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-white/20 p-2 rounded-xl text-xl">🗓️</div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-widest opacity-80">Ritual Mingguan</h3>
            <p className="text-lg font-bold">Waktunya Evaluasi!</p>
          </div>
        </div>
        <p className="text-xs text-indigo-100 leading-relaxed mb-6 opacity-90">
          Ambil waktu 5 menit untuk melihat progres belajarmu minggu ini dan rencanakan langkah berikutnya.
        </p>
        <button
          onClick={() => setShowModal(true)}
          className="w-full bg-white text-indigo-600 font-black text-xs py-3 rounded-xl shadow-lg hover:shadow-white/20 active:scale-95 transition-all"
        >
          Mulai Review Ritual →
        </button>
      </div>

      {showModal && (
        <Modal onClose={() => setShowModal(false)} maxWidth="lg">
          <div className="bg-white rounded-3xl overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="bg-indigo-600 p-6 text-white">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70">Langkah {step} dari 3</p>
              <h2 className="text-xl font-black mt-1">
                {step === 1 ? "Capaian Minggu Ini" : step === 2 ? "Refleksi & Insight" : "Rencana Minggu Depan"}
              </h2>
            </div>

            <div className="p-8">
              {step === 1 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <StatCard label="Menit Belajar" value={stats.minutes} icon="⏱️" />
                    <StatCard label="Insight Baru" value={stats.insights} icon="💡" />
                    <StatCard label="Sesi Selesai" value={stats.sessions} icon="📝" />
                    <StatCard label="Action Item" value={stats.actions} icon="✅" />
                  </div>
                  <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100 text-center">
                    <p className="text-xs text-indigo-600 font-medium italic">
                      "Progres kecil setiap hari akan membuahkan hasil besar di akhir."
                    </p>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-5">
                  <div>
                    <label className={LABEL_CLS}>Apa yang berjalan lancar minggu ini?</label>
                    <textarea
                      value={wins}
                      onChange={(e) => setWins(e.target.value)}
                      placeholder="e.g. Berhasil konsisten baca 30 menit, paham konsep X..."
                      className={INPUT_CLS}
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className={LABEL_CLS}>Apa tantangan/hambatan yang dihadapi?</label>
                    <textarea
                      value={challenges}
                      onChange={(e) => setChallenges(e.target.value)}
                      placeholder="e.g. Terdistraksi HP, kurang fokus di pagi hari..."
                      className={INPUT_CLS}
                      rows={3}
                    />
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-5">
                  <div>
                    <label className={LABEL_CLS}>Fokus Utama Minggu Depan</label>
                    <input
                      type="text"
                      value={focusArea}
                      onChange={(e) => setFocusArea(e.target.value)}
                      placeholder="e.g. Skill Leadership, Selesaikan Buku Atomic Habits"
                      className={INPUT_CLS}
                    />
                  </div>
                  <div>
                    <label className={LABEL_CLS}>Target Spesifik</label>
                    <input
                      type="text"
                      value={goal}
                      onChange={(e) => setGoal(e.target.value)}
                      placeholder="e.g. Selesaikan Bab 4 & 5, Terapkan teknik Time Blocking"
                      className={INPUT_CLS}
                    />
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="mt-8 flex gap-3">
                {step > 1 && (
                  <button
                    onClick={() => setStep(step - 1)}
                    className="flex-1 py-3 border border-gray-200 text-gray-500 font-bold rounded-2xl hover:bg-gray-50"
                  >
                    Kembali
                  </button>
                )}
                <button
                  onClick={() => step < 3 ? setStep(step + 1) : handleSave()}
                  className="flex-[2] py-3 bg-indigo-600 text-white font-black rounded-2xl shadow-lg hover:bg-indigo-700 active:scale-95 transition-all"
                >
                  {step === 3 ? "Selesaikan Review ✨" : "Lanjut →"}
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: string }) {
  return (
    <div className="bg-gray-50 border border-gray-100 p-4 rounded-2xl text-center">
      <div className="text-xl mb-1">{icon}</div>
      <div className="text-2xl font-black text-gray-900">{value}</div>
      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</div>
    </div>
  );
}

function getWeekNumber(d: Date) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

const INPUT_CLS = "w-full border border-gray-100 rounded-2xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all";
const LABEL_CLS = "block text-[10px] font-black text-gray-400 uppercase tracking-[0.1em] mb-2 ml-1";
