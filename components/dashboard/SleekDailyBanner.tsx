"use client";

import React, { useState } from "react";
import Link from "next/link";
import { getSourceProgress } from "@/lib/utils/sourceProgress";
import type { LearningSource, LearningSession, KeyInsight, SkillProgress } from "@/lib/types";
import { Card, Icon, ProgressBar } from "./SleekPrimitives";
import { getLevelFromXP } from "@/lib/utils/gamification";

interface Props {
  sources: LearningSource[];
  sessions: LearningSession[];
  insights: KeyInsight[];
  skillProgress: SkillProgress[];
  totalXP: number;
  currentGold: number;
  currentStreak: number;
  onAddSource: () => void;
  onQuickLog?: (minutes: number, sourceId: string) => Promise<void>;
  shieldsCount: number;
  onBuyShield: () => Promise<void>;
  isBuyingShield: boolean;
}

export default function SleekDailyBanner({
  sources,
  sessions,
  insights,
  skillProgress,
  totalXP,
  currentGold,
  currentStreak,
  onAddSource,
  onQuickLog,
  shieldsCount,
  onBuyShield,
  isBuyingShield,
}: Props) {
  const [manualFocusId, setManualFocusId] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLogging, setIsLogging] = useState(false);

  const todayStr = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const todayISO = new Date().toISOString().slice(0, 10);
  const todaySessions = sessions.filter((s) => s.date && s.date.slice(0, 10) === todayISO);
  const todayInsights = insights.filter((i) => i.createdAt && i.createdAt.slice(0, 10) === todayISO);

  // Compute Today's Stats
  const deepWorkMins = todaySessions.reduce((sum, s) => sum + (s.durationMinutes || 0), 0);
  const pagesRead = todaySessions.reduce((sum, s) => sum + (s.unitsConsumed || 0), 0);
  const reviewsDone = todayInsights.length;

  // Targets
  const targetDeepWork = 60; // 60 minutes
  const targetPages = 30; // 30 pages/units
  const targetReviews = 3; // 3 cards/insights

  // Pick Focus Source
  const inProgress = sources.filter((s) => s.status === "in_progress");
  let focusSource = inProgress.find((s) => s.id === manualFocusId) || null;
  if (!focusSource && inProgress.length > 0) {
    // Pick the one with daily page target or most recently studied
    const withTarget = inProgress.find((s) => s.dailyPageTarget != null);
    focusSource = withTarget || inProgress[0];
  }

  const handleQuickLog = async (minutes: number) => {
    if (!focusSource || !onQuickLog) return;
    setIsLogging(true);
    try {
      await onQuickLog(minutes, focusSource.id);
    } catch (e) {
      console.error("Gagal melakukan log cepat:", e);
    } finally {
      setIsLogging(false);
    }
  };

  // Dynamic Level system based on totalXP
  const levelInfo = getLevelFromXP(totalXP);
  const currentLevel = levelInfo.level;
  const nextLevel = currentLevel + 1;
  const xpIntoCurrentLevel = levelInfo.currentLevelXP;
  const xpNeeded = levelInfo.nextLevelXP - levelInfo.currentLevelXP;

  return (
    <Card className="ring-indigo relative overflow-hidden p-6 lg:p-7 mb-6" accent="indigo" id="tour-briefing">
      {/* Absolute Radial Gradients */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(380px 220px at 88% -10%, rgba(34, 211, 238, 0.15), transparent 70%)," +
            "radial-gradient(420px 280px at 0% 110%, rgba(139, 92, 246, 0.18), transparent 70%)",
        }}
      />

      {/* Constellation dots SVG */}
      <svg
        className="absolute right-3 top-3 opacity-50 pointer-events-none hidden sm:block"
        width="240"
        height="160"
        viewBox="0 0 240 160"
      >
        <g fill="#a78bfa">
          <circle cx="40" cy="40" r="1.5" />
          <circle cx="100" cy="20" r="1" />
          <circle cx="160" cy="60" r="2" />
          <circle cx="200" cy="30" r="1.2" />
          <circle cx="60" cy="90" r="1" />
          <circle cx="120" cy="110" r="1.6" />
          <circle cx="200" cy="120" r="1.3" />
          <circle cx="80" cy="140" r="1" />
        </g>
        <g stroke="#a78bfa" strokeOpacity="0.25" strokeWidth="0.5" fill="none">
          <path d="M40 40 L100 20 L160 60 L200 30" />
          <path d="M60 90 L120 110 L200 120" />
        </g>
      </svg>

      <div className="relative flex flex-col md:flex-row items-start gap-6 lg:gap-8 justify-between">
        {/* Left Side: Briefing Text */}
        <div className="flex-1 min-w-0">
          <div className="mono text-[10px] text-text-mute uppercase tracking-[0.18em] mb-3.5 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-2 shadow-[0_0_10px_#22d3ee]" />
            Briefing Harian · {todayStr}
          </div>

          <h2 className="text-2xl lg:text-3xl font-display font-semibold text-text leading-tight mb-3 text-wrap-pretty">
            Butuh <span className="text-amber-sleek font-bold">{xpNeeded} XP</span> lagi untuk mencapai{" "}
            <span className="grad-indigo font-extrabold">Level {nextLevel}</span> — dan membuka slot skill baru.
          </h2>

          <p className="text-sm text-text-dim max-w-xl leading-relaxed mb-5">
            {focusSource ? (
              <>
                Lanjutkan sesi belajarmu untuk materi{" "}
                <span className="text-text font-semibold">“{focusSource.title}”</span> hari ini. Hari
                {currentStreak > 0
                  ? ` ke-${currentStreak} streak belajarmu aktif.`
                  : " ini adalah hari yang tepat untuk memperkuat refleks belajarmu!"}
              </>
            ) : (
              "Kamu belum memiliki materi belajar yang sedang berlangsung. Mulai tambahkan materi belajar dari katalog atau isi manual sekarang."
            )}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2.5">
            {focusSource ? (
              <Link href={`/dashboard/item/${focusSource.id}`} className="btn btn-primary">
                <Icon name="play" size={14} className="fill-current" />
                Lanjut Belajar
              </Link>
            ) : (
              <button onClick={onAddSource} className="btn btn-primary">
                <Icon name="plus" size={14} />
                Tambah Sumber
              </button>
            )}

            {inProgress.length > 1 && (
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="btn"
                >
                  <Icon name="compass" size={14} />
                  Ganti Fokus
                </button>

                {isDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-30"
                      onClick={() => setIsDropdownOpen(false)}
                    />
                    <div className="absolute left-0 mt-2 w-64 bg-bg-2 border border-line rounded-xl shadow-xl py-1.5 z-40 max-h-60 overflow-y-auto">
                      <div className="px-3 py-1 text-[10px] font-bold text-text-mute uppercase tracking-wider border-b border-line mb-1">
                        Pilih Fokus
                      </div>
                      {inProgress.map((src) => (
                        <button
                          key={src.id}
                          onClick={() => {
                            setManualFocusId(src.id);
                            setIsDropdownOpen(false);
                          }}
                          className={`w-full px-3 py-2 text-left text-xs truncate hover:bg-line/45 flex items-center justify-between ${
                            src.id === focusSource?.id ? "text-indigo-2 font-bold" : "text-text-dim"
                          }`}
                        >
                          <span>{src.title}</span>
                          {src.id === focusSource?.id && <span>✓</span>}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
            <Link href="/dashboard/actions" className="btn text-text-dim">
              <Icon name="archive" size={14} />
              Action Items
            </Link>
          </div>
        </div>

        {/* Right Side: Today's Targets Progress */}
        <div className="w-full md:w-64 flex-shrink-0 flex flex-col gap-3.5 bg-white/[0.02] border border-white/[0.04] p-4 rounded-2xl">
          <div className="mono text-[9px] text-text-mute uppercase tracking-widest">
            Target Hari Ini
          </div>

          <div>
            <ProgressBar
              value={deepWorkMins}
              max={targetDeepWork}
              accent="indigo"
              height={5}
              label="Deep work"
              sub={`${deepWorkMins} / ${targetDeepWork} mnt`}
            />
          </div>

          <div>
            <ProgressBar
              value={pagesRead}
              max={targetPages}
              accent="cyan"
              height={5}
              label="Progres Belajar"
              sub={`${pagesRead} / ${targetPages} unit`}
            />
          </div>

          <div>
            <ProgressBar
              value={reviewsDone}
              max={targetReviews}
              accent="amber"
              height={5}
              label="Catatan Insight"
              sub={`${reviewsDone} / ${targetReviews} card`}
            />
          </div>

          {/* Streak Shield Status / Store */}
          <div className="pt-3 border-t border-white/5 mt-1 flex flex-col gap-2 text-[11px]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-sm">🪙</span>
                <span className="font-medium text-text-dim">Saldo Emas</span>
              </div>
              <span className="font-bold text-amber-400">{currentGold} Gold</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-sm">🛡️</span>
                <span className="font-medium text-text-dim">Streak Shield</span>
              </div>
              {shieldsCount > 0 ? (
                <span className="px-2 py-0.5 rounded-md text-[10px] text-cyan-2 border border-cyan-2/20 bg-cyan-500/[0.05] font-semibold">
                  {shieldsCount} Aktif
                </span>
              ) : (
                <button
                  onClick={onBuyShield}
                  disabled={isBuyingShield || currentGold < 150}
                  className="mono text-[9px] font-bold text-indigo-2 hover:text-indigo-3 disabled:text-text-mute uppercase tracking-wide transition-all border border-indigo-2/20 hover:border-indigo-2/45 disabled:border-white/5 px-2 py-0.5 rounded-lg active:scale-95 disabled:scale-100 disabled:bg-transparent"
                  title="Beli Streak Shield seharga 150 Gold"
                >
                  Beli (150 Gold)
                </button>
              )}
            </div>
          </div>

          {focusSource && onQuickLog && (
            <div className="pt-3.5 border-t border-white/5 mt-1">
              <div className="mono text-[8px] text-text-mute uppercase tracking-[0.12em] mb-2 flex items-center justify-between">
                <span>Log Cepat Sesi</span>
                <span className="text-[8px] text-indigo-2 lowercase truncate max-w-[120px] font-sans">
                  ({focusSource.title})
                </span>
              </div>
              <div className="flex gap-1.5">
                <button
                  onClick={() => handleQuickLog(15)}
                  disabled={isLogging}
                  className="flex-1 bg-white/[0.03] hover:bg-indigo-500/20 active:scale-95 disabled:opacity-50 hover:text-indigo-2 text-text-dim text-[10px] font-bold py-1.5 rounded-xl border border-white/5 transition-all text-center"
                >
                  +15m
                </button>
                <button
                  onClick={() => handleQuickLog(30)}
                  disabled={isLogging}
                  className="flex-1 bg-white/[0.03] hover:bg-indigo-500/20 active:scale-95 disabled:opacity-50 hover:text-indigo-2 text-text-dim text-[10px] font-bold py-1.5 rounded-xl border border-white/5 transition-all text-center"
                >
                  +30m
                </button>
                <button
                  onClick={() => handleQuickLog(60)}
                  disabled={isLogging}
                  className="flex-1 bg-white/[0.03] hover:bg-indigo-500/20 active:scale-95 disabled:opacity-50 hover:text-indigo-2 text-text-dim text-[10px] font-bold py-1.5 rounded-xl border border-white/5 transition-all text-center"
                >
                  +60m
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
