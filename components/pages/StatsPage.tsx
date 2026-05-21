"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getWsSessions,
  getWsInsights,
  getWsSkillProgress,
  getWsSources,
  getWsTasks,
} from "@/lib/storageV2";
import { useWorkspace } from "@/lib/contexts/WorkspaceContext";
import {
  getWeeklyActivity,
  getMonthlyActivity,
  getConsistencyScore,
  getCurrentStreak,
  getLongestStreak,
  getTotalStats,
  getWeeklyBuckets,
  type DayActivity,
  type WeekBucket,
} from "@/lib/utils/analytics";
import { getSourceProgress } from "@/lib/utils/sourceProgress";
import { exportLearningReportToMarkdown } from "@/lib/utils/exportReport";
import type { LearningSession, KeyInsight, SkillProgress, LearningSource, SourceTask } from "@/lib/types";

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KpiCard({
  icon,
  label,
  value,
  sub,
  accent,
  interpretation,
}: {
  icon: string;
  label: string;
  value: string | number;
  sub?: string;
  accent?: string;
  interpretation?: string;
}) {
  return (
    <div className="bg-surface/40 border border-line rounded-2xl p-4 shadow-lg hover:shadow-xl hover:bg-surface/60 transition-all duration-300 backdrop-blur-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-text-mute font-medium">{label}</p>
          <p className={`text-2xl font-extrabold mt-1 ${accent ?? "text-text"}`}>{value}</p>
          {sub && <p className="text-xs text-text-mute mt-0.5">{sub}</p>}
          {interpretation && (
            <p className="text-xs font-medium text-text-dim mt-1.5 leading-snug">{interpretation}</p>
          )}
        </div>
        <span className="text-2xl">{icon}</span>
      </div>
    </div>
  );
}

// ─── Interpretation Helpers ───────────────────────────────────────────────────

function getConsistencyLabel(score: number): string {
  if (score >= 70) return "Konsisten! Pertahankan.";
  if (score >= 40) return "Mulai stabil, terus!";
  return "Mulai dari 1 sesi per hari.";
}

// ─── Heatmap ──────────────────────────────────────────────────────────────────

function HeatCell({ day }: { day: DayActivity }) {
  const intensity =
    day.minutes === 0
      ? "bg-white/5 border border-white/5"
      : day.minutes < 20
      ? "bg-sky-500/20"
      : day.minutes < 45
      ? "bg-sky-500/55"
      : "bg-sky-500";

  return (
    <div
      title={`${day.date}: ${day.minutes} mnt, ${day.sessionCount} sesi`}
      className={`rounded-md aspect-square transition-colors cursor-default ${intensity} ${
        day.isToday ? "ring-2 ring-sky-500 ring-offset-1" : ""
      }`}
    />
  );
}

function Heatmap({ activity, mode }: { activity: DayActivity[]; mode: "7" | "30" }) {
  if (mode === "7") {
    return (
      <div className="mt-3">
        <div className="grid grid-cols-7 gap-1.5">
          {activity.map((day) => (
            <div key={day.date} className="flex flex-col items-center gap-1">
              <HeatCell day={day} />
              <span className="text-[10px] text-text-mute">{day.label}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 30-day: 5 rows × 6 cols, no labels (tooltip only)
  return (
    <div className="mt-3">
      <div className="grid grid-cols-10 gap-1">
        {activity.map((day) => (
          <HeatCell key={day.date} day={day} />
        ))}
      </div>
      <div className="flex items-center justify-between mt-2">
        <span className="text-xs text-text-mute">
          {new Date(activity[0]?.date ?? "").toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
        </span>
        <div className="flex items-center gap-1 text-xs text-text-mute">
          <span>Kurang</span>
          <div className="flex gap-0.5">
            {["bg-white/5 border border-white/5", "bg-sky-500/20", "bg-sky-500/55", "bg-sky-500"].map((c, i) => (
              <div key={i} className={`w-2.5 h-2.5 rounded-sm ${c}`} />
            ))}
          </div>
          <span>Banyak</span>
        </div>
        <span className="text-xs text-text-mute">
          {new Date(activity[activity.length - 1]?.date ?? "").toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
        </span>
      </div>
    </div>
  );
}

// ─── Bar Chart ────────────────────────────────────────────────────────────────

function BarChart({ buckets }: { buckets: WeekBucket[] }) {
  const max = Math.max(...buckets.map((b) => b.minutes), 1);
  return (
    <div className="flex items-end gap-1.5 h-28 mt-3">
      {buckets.map((bucket) => {
        const pct = Math.round((bucket.minutes / max) * 100);
        const isCurrentWeek = bucket.label === "Minggu ini";
        return (
          <div key={bucket.label} className="flex-1 flex flex-col items-center gap-1 group">
            <div
              title={`${bucket.label}: ${bucket.minutes} mnt`}
              className={`w-full rounded-t-md transition-all duration-300 cursor-default ${
                isCurrentWeek ? "bg-sky-500 shadow-md shadow-sky-500/20" : "bg-sky-500/20 group-hover:bg-sky-500/40"
              }`}
              style={{ height: `${Math.max(pct, 2)}%` }}
            />
            <span className="text-[9px] text-text-mute truncate w-full text-center leading-tight">
              {bucket.label.replace(" lalu", "").replace("Minggu ", "Mg ")}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Progress Summary ─────────────────────────────────────────────────────────

function SourceProgressRow({ source }: { source: LearningSource }) {
  const stats = getSourceProgress(source);
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-text truncate">{source.title}</p>
        <div className="w-full bg-white/5 rounded-full h-1 mt-1 overflow-hidden border border-white/5">
          <div className="h-1 rounded-full bg-sky-500 transition-all" style={{ width: `${stats.pct}%` }} />
        </div>
      </div>
      <span className="text-xs font-bold text-sky-400 shrink-0">{stats.pct}%</span>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function StatsPage() {
  const { currentUser: user, currentWorkspace: workspace } = useWorkspace();
  const [sessions, setSessions] = useState<LearningSession[]>([]);
  const [insights, setInsights] = useState<KeyInsight[]>([]);
  const [skills, setSkills] = useState<SkillProgress[]>([]);
  const [sources, setSources] = useState<LearningSource[]>([]);
  const [tasks, setTasks] = useState<SourceTask[]>([]);
  const [mounted, setMounted] = useState(false);
  const [heatMode, setHeatMode] = useState<"7" | "30">("30");

  const load = useCallback(async () => {
    if (!user || !workspace) return;
    
    // Simulate async
    await new Promise(r => setTimeout(r, 0));

    const sess = await getWsSessions(workspace.id, user.id);
    const ins = await getWsInsights(workspace.id, user.id);
    const sp = await getWsSkillProgress(workspace.id, user.id);
    const src = await getWsSources(workspace.id, user.id, "all");
    const tsk = await getWsTasks(workspace.id, user.id);
    
    setSessions(sess);
    setInsights(ins);
    setSkills(sp);
    setSources(src);
    setTasks(tsk);
  }, [user, workspace]);

  useEffect(() => {
    load();
    setMounted(true);
  }, [load]);

  const weeklyActivity = useMemo(() => getWeeklyActivity(sessions), [sessions]);
  const monthlyActivity = useMemo(() => getMonthlyActivity(sessions), [sessions]);
  const activity = heatMode === "7" ? weeklyActivity : monthlyActivity;
  const consistencyScore = useMemo(() => getConsistencyScore(activity), [activity]);
  const currentStreak = useMemo(() => getCurrentStreak(sessions), [sessions]);
  const longestStreak = useMemo(() => getLongestStreak(sessions), [sessions]);
  const totalStats = useMemo(
    () => getTotalStats(sessions, insights, skills, tasks),
    [sessions, insights, skills, tasks]
  );
  const weeklyBuckets = useMemo(() => getWeeklyBuckets(sessions, 8), [sessions]);

  const unitBreakdown = useMemo(() => {
    const books = sources.filter((s) => s.progress.type === "book");
    const videos = sources.filter((s) => s.progress.type === "youtube" || s.progress.type === "podcast" || s.progress.type === "article" || s.progress.type === "course");
    const pages = books.reduce((sum, s) => {
      const sp = s.progress as { currentPage?: number };
      return sum + (sp.currentPage ?? 0);
    }, 0);
    const mins = videos.reduce((sum, s) => {
      const sp = s.progress as { watchedMinutes?: number; listenedMinutes?: number; consumedMinutes?: number; completedModules?: number };
      return sum + (sp.watchedMinutes ?? sp.listenedMinutes ?? sp.consumedMinutes ?? 0);
    }, 0);
    return { pages, mins };
  }, [sources]);

  const completedActionItems = useMemo(
    () => skills.flatMap((sp) => sp.actionItems).filter((ai) => ai.completed).length,
    [skills]
  );
  const totalActionItems = useMemo(
    () => skills.flatMap((sp) => sp.actionItems).length,
    [skills]
  );

  const skillTimeline = useMemo(
    () =>
      skills
        .filter((sp) => sp.levelAchievedAt || sp.createdAt)
        .map((sp) => ({
          skillName: sp.skillName,
          level: sp.level ?? "awareness",
          achievedAt: sp.levelAchievedAt ?? sp.createdAt,
        }))
        .sort((a, b) => a.achievedAt.localeCompare(b.achievedAt)),
    [skills]
  );

  if (!mounted) return <Skeleton />;

  const activeDaysInPeriod = activity.filter((d) => d.minutes > 0).length;
  const totalMinutesInPeriod = activity.reduce((s, d) => s + d.minutes, 0);

  return (
    <>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-text">Statistik</h1>
          <p className="text-sm text-text-mute mt-0.5">Semua metrik belajar Anda dalam satu tempat</p>
        </div>
        <button
          onClick={() => exportLearningReportToMarkdown(sources, sessions, insights, tasks, user?.name)}
          className="flex items-center gap-2 bg-indigo-sleek hover:bg-indigo-2 border border-indigo-500/30 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-500/10 active:scale-95"
        >
          <span>📥</span> Export Report
        </button>
      </div>

      {/* ─── Heatmap Section ─── */}
      <div className="bg-surface/40 border border-line rounded-2xl p-5 mb-5 shadow-lg backdrop-blur-md">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-sm font-bold text-text">Aktivitas Belajar</h2>
          <div className="flex gap-1">
            <button
              onClick={() => setHeatMode("7")}
              className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-all duration-200 ${
                heatMode === "7"
                  ? "bg-indigo-sleek text-white border-indigo-500/40"
                  : "bg-white/5 text-text-dim border-line hover:border-indigo-500/30 hover:text-text hover:bg-white/10"
              }`}
            >
              7 Hari
            </button>
            <button
              onClick={() => setHeatMode("30")}
              className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-all duration-200 ${
                heatMode === "30"
                  ? "bg-indigo-sleek text-white border-indigo-500/40"
                  : "bg-white/5 text-text-dim border-line hover:border-indigo-500/30 hover:text-text hover:bg-white/10"
              }`}
            >
              30 Hari
            </button>
          </div>
        </div>
        <p className="text-xs text-text-mute mb-1">
          {activeDaysInPeriod} hari aktif · {totalMinutesInPeriod} menit total
        </p>
        <Heatmap activity={activity} mode={heatMode} />
      </div>

      {/* ─── Consistency + Streak ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <KpiCard
          icon="🔥"
          label="Konsistensi"
          value={`${consistencyScore}%`}
          sub={`${heatMode === "7" ? "7" : "30"} hari terakhir`}
          accent={consistencyScore >= 70 ? "text-emerald-400" : consistencyScore >= 40 ? "text-amber-400" : "text-rose-400"}
          interpretation={getConsistencyLabel(consistencyScore)}
        />
        <KpiCard
          icon="⚡"
          label="Streak Saat Ini"
          value={`${currentStreak} hari`}
          sub="hari berturut-turut"
          accent="text-sky-400"
        />
        <KpiCard
          icon="🏆"
          label="Streak Terpanjang"
          value={`${longestStreak} hari`}
          sub="rekor terbaik"
          accent="text-violet-400"
        />
        <KpiCard
          icon="📅"
          label="Hari Aktif"
          value={totalStats.activeDays}
          sub="sepanjang waktu"
        />
      </div>

      {/* ─── Volume metrics ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
        <KpiCard
          icon="⏱️"
          label="Total Sesi"
          value={totalStats.totalSessions}
          sub={`${Math.round(totalStats.totalMinutes / 60)} jam total`}
        />
        <KpiCard
          icon="📄"
          label="Halaman Dibaca"
          value={unitBreakdown.pages}
          sub="dari semua buku"
          accent="text-sky-400"
        />
        <KpiCard
          icon="🎬"
          label="Menit Ditonton/Didengar"
          value={unitBreakdown.mins}
          sub="video, podcast, artikel"
          accent="text-violet-400"
        />
        <KpiCard
          icon="💡"
          label="Total Insights"
          value={totalStats.totalInsights}
          sub="insight tersimpan"
          accent="text-amber-400"
        />
        <KpiCard
          icon="✅"
          label="Action Items Selesai"
          value={completedActionItems}
          sub={`dari ${totalActionItems} total`}
          accent="text-emerald-400"
        />
        <KpiCard
          icon="📚"
          label="Sumber Belajar"
          value={sources.length}
          sub={`${sources.filter((s) => s.status === "in_progress").length} sedang berjalan`}
        />
      </div>

      {/* ─── Bar chart ─── */}
      <div className="bg-surface/40 border border-line rounded-2xl p-5 mb-5 shadow-lg backdrop-blur-md">
        <h2 className="text-sm font-bold text-text mb-1">Menit Belajar per Minggu</h2>
        <p className="text-xs text-text-mute">8 minggu terakhir</p>
        <BarChart buckets={weeklyBuckets} />
      </div>

      {/* ─── Source progress summary ─── */}
      {sources.length > 0 && (
        <div className="bg-surface/40 border border-line rounded-2xl p-5 mb-5 shadow-lg backdrop-blur-md">
          <h2 className="text-sm font-bold text-text mb-4">Progres per Sumber</h2>
          <div className="space-y-3">
            {sources
              .sort((a, b) => getSourceProgress(b).pct - getSourceProgress(a).pct)
              .map((src) => (
                <SourceProgressRow key={src.id} source={src} />
              ))}
          </div>
        </div>
      )}

      {/* ─── Skill Level Timeline ─── */}
      {skillTimeline.length > 0 && (
        <div className="bg-surface/40 border border-line rounded-2xl p-5 shadow-lg backdrop-blur-md">
          <h2 className="text-sm font-bold text-text mb-1">Timeline Skill Level</h2>
          <p className="text-xs text-text-mute mb-4">Perkembangan level skill dari waktu ke waktu</p>
          <div className="relative">
            <div className="absolute left-[9px] top-0 bottom-0 w-px bg-line" />
            <div className="space-y-3">
              {skillTimeline.map((item, idx) => {
                const dotColor: Record<string, string> = {
                  awareness: "bg-white/40",
                  understanding: "bg-sky-500",
                  applied: "bg-violet-500",
                  mastered: "bg-emerald-500",
                };
                const badgeColor: Record<string, string> = {
                  awareness: "bg-white/5 text-text-dim border border-line",
                  understanding: "bg-sky-500/10 text-sky-400 border border-sky-500/20",
                  applied: "bg-violet-500/10 text-violet-400 border border-violet-500/20",
                  mastered: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
                };
                const levelLabel: Record<string, string> = {
                  awareness: "Awareness",
                  understanding: "Understanding",
                  applied: "Applied",
                  mastered: "Mastered",
                };
                return (
                  <div key={idx} className="flex items-start gap-3 pl-1">
                    <div className={`w-4 h-4 rounded-full shrink-0 mt-0.5 ring-2 ring-surface/40 ${dotColor[item.level]}`} />
                    <div className="flex-1 min-w-0 pb-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-text truncate">{item.skillName}</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${badgeColor[item.level]}`}>
                          {levelLabel[item.level]}
                        </span>
                      </div>
                      <p className="text-xs text-text-mute mt-0.5">
                        {new Date(item.achievedAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Skeleton loading layout
function Skeleton() {
  return (
    <div className="animate-pulse space-y-5">
      <div className="h-10 bg-white/5 border border-line rounded-xl w-48" />
      <div className="h-44 bg-white/5 border border-line rounded-2xl" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => <div key={i} className="h-24 bg-white/5 border border-line rounded-2xl" />)}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[1, 2, 3, 4, 5, 6].map((i) => <div key={i} className="h-24 bg-white/5 border border-line rounded-2xl" />)}
      </div>
      <div className="h-48 bg-white/5 border border-line rounded-2xl" />
      <div className="h-64 bg-white/5 border border-line rounded-2xl" />
    </div>
  );
}
