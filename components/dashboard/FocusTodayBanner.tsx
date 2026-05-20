"use client";

import { useState } from "react";
import Link from "next/link";
import { getSourceProgress } from "@/lib/utils/sourceProgress";
import type { LearnerType } from "@/lib/utils/learnerProfile";
import type { WeeklyQuest } from "@/lib/utils/gamification";
import type {
  LearningSource,
  LearningSession,
  KeyInsight,
  SkillProgress,
} from "@/lib/types";

// ─── Focus Source Selection ────────────────────────────────────────────────────

function pickFocusSource(
  sources: LearningSource[],
  sessions: LearningSession[]
): LearningSource | null {
  const inProgress = sources.filter((s) => s.status === "in_progress");
  if (inProgress.length === 0) return null;

  // Priority 1: has dailyPageTarget set
  const withTarget = inProgress.filter((s) => s.dailyPageTarget != null);
  if (withTarget.length > 0) return withTarget[0];

  // Priority 2: most recently studied
  const latestBySource = new Map<string, string>(); // sourceId → latest date
  for (const s of sessions) {
    const existing = latestBySource.get(s.sourceId);
    if (!existing || s.date > existing) latestBySource.set(s.sourceId, s.date);
  }
  let latest: LearningSource | null = null;
  let latestDate = "";
  for (const src of inProgress) {
    const d = latestBySource.get(src.id) ?? "";
    if (d > latestDate) {
      latestDate = d;
      latest = src;
    }
  }
  if (latest) return latest;

  // Priority 3: first in_progress source
  return inProgress[0];
}

// ─── Banner Headline Copy ─────────────────────────────────────────────────────

function getBannerCopy(
  learnerType: LearnerType,
  streak: number,
  sessions: LearningSession[]
): string {
  const today = new Date().toISOString().slice(0, 10);
  const hadSessionToday = sessions.some((s) => s.date && s.date.slice(0, 10) === today);

  if (learnerType === "daily") {
    if (streak > 0) return `🔥 Hari ke-${streak} berturut-turut!`;
    if (hadSessionToday) return "Hebat, sudah mulai hari ini!";
    return "Tidak apa-apa, mulai lagi hari ini.";
  }

  // flexible
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 6);
  cutoff.setHours(0, 0, 0, 0);
  const hasRecentActivity = sessions.some((s) => new Date(s.date) >= cutoff);
  if (!hasRecentActivity) return "Selamat datang kembali! Satu sesi sudah berarti.";
  return "Siap belajar? Tidak ada tekanan, mulai dari mana saja.";
}

// ─── Quest Progress Bar ───────────────────────────────────────────────────────

function QuestBar({ task }: { task: WeeklyQuest["tasks"][number] }) {
  const pct = Math.min(100, Math.round((task.current / task.target) * 100));
  const done = task.current >= task.target;
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-14 h-1.5 bg-white/60 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${done ? "bg-emerald-500" : "bg-sky-500"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={`text-xs tabular-nums ${done ? "text-emerald-600 font-semibold" : "text-gray-500"}`}>
        {task.label} {task.current}/{task.target}
      </span>
    </div>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  sources: LearningSource[];
  sessions: LearningSession[];
  insights: KeyInsight[];
  skillProgress: SkillProgress[];
  learnerType: LearnerType;
  currentStreak: number;
  weeklyXP: number;
  weeklyQuest: WeeklyQuest;
  onAddSource: () => void;
  weeklyGoal?: number;
  weeklyMinutes?: number;
  gamificationMode?: "standard" | "light";
}

// ─── Source Icons Helper ──────────────────────────────────────────────────────

function getSourceIcon(type: string) {
  switch (type) {
    case "book":
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      );
    case "youtube":
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      );
    case "article":
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
      );
    case "podcast":
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
        </svg>
      );
    case "course":
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 018.918 5.842 50.45 50.45 0 00-2.658.814m-15.482 0a50.53 50.53 0 0115.481 0M3.313 12.85A4.321 4.321 0 013 11.25V9.75M21 11.25a4.32 4.32 0 01-.313 1.6M12 12.75c-1.564 0-3.106-.118-4.613-.346m0 0L6 17.5M12 12.75c1.564 0 3.106-.118 4.613-.346m0 0L18 17.5" />
        </svg>
      );
    default:
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      );
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function FocusTodayBanner({
  sources,
  sessions,
  learnerType,
  currentStreak,
  weeklyXP,
  weeklyQuest,
  onAddSource,
  weeklyGoal,
  weeklyMinutes,
  gamificationMode,
}: Props) {
  const [manualFocusId, setManualFocusId] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const inProgress = sources.filter((s) => s.status === "in_progress");
  
  let focusSource = inProgress.find((s) => s.id === manualFocusId) || null;
  if (!focusSource) {
    focusSource = pickFocusSource(sources, sessions);
  }

  const bannerCopy = getBannerCopy(learnerType, currentStreak, sessions);

  const progress = focusSource ? getSourceProgress(focusSource) : null;
  const unitSuffix =
    focusSource?.progress.type === "book" ? "hal" : "mnt";

  return (
    <div className="bg-gradient-to-r from-sky-50 to-indigo-50 border border-sky-200 rounded-2xl p-5 animate-slide-up">
      {/* Row 1: copy + XP badge */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <p className="text-sm font-semibold text-sky-700">{bannerCopy}</p>
        <span className="shrink-0 text-xs font-bold bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full">
          ⚡ {weeklyXP} XP minggu ini
        </span>
      </div>

      {/* Weekly goal progress */}
      {weeklyGoal && weeklyGoal > 0 && gamificationMode !== "light" && (() => {
        const mins = weeklyMinutes ?? 0;
        const pct = Math.round((mins / weeklyGoal) * 100);
        return (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-500">
                Target minggu: {mins}/{weeklyGoal} mnt
              </span>
              <span className={`text-xs font-semibold ${
                pct >= 100 ? "text-emerald-600" : pct >= 50 ? "text-amber-600" : "text-sky-600"
              }`}>
                {Math.min(100, pct)}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-white/60 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${pct >= 100 ? "bg-emerald-500" : "bg-sky-500"}`}
                style={{ width: `${Math.min(100, pct)}%` }}
              />
            </div>
          </div>
        );
      })()}

      {/* Row 2: focus source or empty state */}
      {focusSource && progress ? (
        <div className="flex items-end justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">
                Fokus Hari Ini
              </p>
              {inProgress.length > 1 && (
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="text-[10px] bg-sky-100 hover:bg-sky-200 active:scale-95 text-sky-700 px-1.5 py-0.5 rounded-full font-bold flex items-center gap-1 transition-all border border-sky-200/50 shadow-sm cursor-pointer"
                >
                  <span>Ganti Fokus</span>
                  <span>⚙️</span>
                </button>
              )}
            </div>
            
            {inProgress.length > 1 ? (
              <div className="relative inline-block text-left w-full mt-1 select-none z-20">
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center justify-between w-full max-w-md px-3 py-2 text-base font-extrabold text-gray-900 bg-white/60 hover:bg-white/80 border border-sky-100 hover:border-sky-200 rounded-xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-sky-500/50 shadow-sm"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sky-600 shrink-0">
                      {getSourceIcon(focusSource.progress.type)}
                    </span>
                    <span className="truncate">{focusSource.title}</span>
                  </div>
                  <span className={`text-gray-400 shrink-0 ml-2 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </span>
                </button>

                {isDropdownOpen && (
                  <>
                    {/* Backdrop to close */}
                    <div 
                      className="fixed inset-0 z-30" 
                      onClick={() => setIsDropdownOpen(false)} 
                    />
                    
                    {/* Dropdown Menu */}
                    <div className="absolute z-40 left-0 right-0 md:right-auto md:w-96 mt-2 origin-top-left bg-white border border-sky-100 rounded-xl shadow-xl py-1.5 focus:outline-none overflow-hidden max-h-72 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-sky-50/50">
                        Ganti Fokus Belajar
                      </div>
                      <div className="divide-y divide-gray-50">
                        {inProgress.map((s) => {
                          const sProgress = getSourceProgress(s);
                          const isSelected = s.id === focusSource.id;
                          return (
                            <button
                              key={s.id}
                              onClick={() => {
                                setManualFocusId(s.id);
                                setIsDropdownOpen(false);
                              }}
                              className={`flex items-start gap-3 w-full px-3 py-2.5 text-left text-sm transition-colors duration-100 ${
                                isSelected 
                                  ? "bg-sky-50 text-sky-900" 
                                  : "hover:bg-slate-50 text-gray-700"
                              }`}
                            >
                              <span className={`mt-0.5 shrink-0 ${isSelected ? "text-sky-600" : "text-gray-400"}`}>
                                {getSourceIcon(s.progress.type)}
                              </span>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-2">
                                  <p className={`font-semibold truncate ${isSelected ? "text-sky-900" : "text-gray-900"}`}>
                                    {s.title}
                                  </p>
                                  {isSelected && (
                                    <span className="shrink-0 text-sky-600">
                                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                      </svg>
                                    </span>
                                  )}
                                </div>
                                
                                <div className="mt-1 flex items-center justify-between gap-2">
                                  <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                                    <div 
                                      className={`h-full rounded-full ${isSelected ? "bg-sky-500" : "bg-gray-400"}`} 
                                      style={{ width: `${sProgress.pct}%` }}
                                    />
                                  </div>
                                  <span className="text-[10px] text-gray-500 font-medium shrink-0">
                                    {sProgress.pct}% selesai
                                  </span>
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 mt-1 py-1">
                <span className="text-sky-600 shrink-0">
                  {getSourceIcon(focusSource.progress.type)}
                </span>
                <p className="text-base font-extrabold text-gray-900 truncate">
                  {focusSource.title}
                </p>
              </div>
            )}
            <p className="text-xs text-gray-500 mt-1.5">
              {progress.pct}% selesai
              {focusSource.dailyPageTarget != null
                ? ` · Target: ${focusSource.dailyPageTarget} ${unitSuffix}/hari`
                : ""}
            </p>
            {/* Mini progress bar */}
            <div className="w-full max-w-xs h-1.5 bg-white/70 rounded-full overflow-hidden mt-2">
              <div
                className="h-full bg-sky-500 rounded-full transition-all"
                style={{ width: `${progress.pct}%` }}
              />
            </div>
          </div>
          <Link
            href={`/dashboard/item/${focusSource.id}`}
            className="shrink-0 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-md shadow-sky-600/10"
          >
            Mulai Belajar →
          </Link>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-gray-500">
            Belum ada sumber belajar aktif.
          </p>
          <button
            onClick={onAddSource}
            className="shrink-0 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors"
          >
            + Tambah Sumber
          </button>
        </div>
      )}

      {/* Row 3: weekly quest progress */}
      <div className="mt-4 pt-3 border-t border-sky-200/60">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <p className="text-xs font-semibold text-gray-400 shrink-0">
            Quest minggu ini:
          </p>
          {weeklyQuest.tasks.map((task) => (
            <QuestBar key={task.label} task={task} />
          ))}
          {weeklyQuest.isComplete && (
            <span className="text-xs font-bold text-emerald-600">
              ✓ Quest selesai!
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
