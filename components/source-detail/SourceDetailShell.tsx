"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  getWsSourceById,
  getWsSources,
  updateWsSource,
  saveWsSession,
  getWsSessionsBySource,
  getWsInsightsBySource,
  getWsSkillProgressBySource,
  getWsSkillProgress,
  getWsTasksBySource,
} from "@/lib/storageV2";
import { getSourceProgress } from "@/lib/utils/sourceProgress";
import { useWorkspace } from "@/lib/contexts/WorkspaceContext";
import type {
  LearningSource,
  LearningSession,
  KeyInsight,
  SkillProgress,
  SourceTask,
} from "@/lib/types";

import SourceHeader from "./SourceHeader";
import Modal from "@/components/ui/Modal";
import AddSourceForm from "@/components/sources/AddSourceForm";
import UpdateProgressForm from "./UpdateProgressForm";
import SessionNotesTab from "./tabs/SessionNotesTab";
import KeyInsightsTab from "./tabs/KeyInsightsTab";
import ActionItemsTab from "./tabs/ActionItemsTab";
import SkillProgressTab from "./tabs/SkillProgressTab";
import ActivityHistoryTab from "./tabs/ActivityHistoryTab";

// ─── Tab config ───────────────────────────────────────────────────────────────

const TABS = [
  { id: "sessions",  label: "Session Notes",    icon: "⏱️" },
  { id: "insights",  label: "Key Insights",     icon: "💡" },
  { id: "tasks",     label: "Action Items",     icon: "✅" },
  { id: "skills",    label: "Skill Progress",   icon: "🎯" },
  { id: "history",   label: "Activity History", icon: "🕐" },
] as const;

type TabId = (typeof TABS)[number]["id"];

// ─── Shell ────────────────────────────────────────────────────────────────────

interface Props {
  sourceId: string;
}

export default function SourceDetailShell({ sourceId }: Props) {
  const { currentUser: user, currentWorkspace: workspace } = useWorkspace();
  const [source, setSource] = useState<LearningSource | null>(null);
  const [sessions, setSessions] = useState<LearningSession[]>([]);
  const [insights, setInsights] = useState<KeyInsight[]>([]);
  const [skillProgress, setSkillProgress] = useState<SkillProgress[]>([]);
  const [tasks, setTasks] = useState<SourceTask[]>([]);
  const [allSkillsGlobal, setAllSkillsGlobal] = useState<SkillProgress[]>([]);
  const [allSources, setAllSources] = useState<LearningSource[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<TabId>("sessions");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [prefilledDuration, setPrefilledDuration] = useState<number | null>(null);

  const handleTimerFinish = (seconds: number) => {
    const mins = Math.max(1, Math.round(seconds / 60));
    setPrefilledDuration(mins);
    setActiveTab("sessions");
  };

  const handleQuickCompleteTarget = async () => {
    if (!user || !workspace || !source) return;
    const stats = getSourceProgress(source);
    const todayStr = new Date().toLocaleDateString("en-CA");
    const todaySessions = sessions.filter((s) => s.date === todayStr);
    const unitsToday = todaySessions.reduce((sum, s) => sum + (s.unitsConsumed || 0), 0);
    const targetUnits = source.dailyPageTarget || 0;
    const remaining = Math.max(0, targetUnits - unitsToday);
    
    if (remaining <= 0) return;
    
    const start = stats.consumed;
    const end = Math.min(stats.total, start + remaining);
    const actualConsumed = end - start;
    
    let duration = actualConsumed;
    if (source.progress.type === "book") {
      duration = Math.round(actualConsumed * 1.5);
    }
    duration = Math.max(10, duration);
    
    const session: LearningSession = {
      id: crypto.randomUUID(),
      sourceId: source.id,
      workspaceId: workspace.id,
      userId: user.id,
      date: todayStr,
      durationMinutes: duration,
      unitsConsumed: actualConsumed,
      startProgress: start,
      endProgress: end,
      notes: `### 💡 Insight\nMencapai target harian sebesar ${targetUnits} ${stats.unitLabel} melalui Quick Log Selesai Target.`,
      mood: "great",
      focusRating: 4,
      productivityRating: 4,
      createdAt: new Date().toISOString(),
    };
    
    await saveWsSession(workspace.id, user.id, session);
    
    // Auto-update source progress
    const p = source.progress;
    if (p.type === "book") {
      await updateWsSource(workspace.id, { ...source, progress: { ...p, currentPage: end }, updatedAt: new Date().toISOString() });
    } else if (p.type === "youtube") {
      await updateWsSource(workspace.id, { ...source, progress: { ...p, watchedMinutes: end }, updatedAt: new Date().toISOString() });
    } else if (p.type === "article") {
      await updateWsSource(workspace.id, { ...source, progress: { ...p, consumedMinutes: end }, updatedAt: new Date().toISOString() });
    } else if (p.type === "podcast") {
      await updateWsSource(workspace.id, { ...source, progress: { ...p, listenedMinutes: end }, updatedAt: new Date().toISOString() });
    } else if (p.type === "course" && p.completedModules !== undefined) {
      await updateWsSource(workspace.id, { ...source, progress: { ...p, completedModules: end }, updatedAt: new Date().toISOString() });
    }
    
    refresh();
  };

  const refresh = useCallback(async () => {
    if (!user || !workspace) return;
    
    try {
      const [src, sess, ins, sp, tsk, allSp, allSrc] = await Promise.all([
        getWsSourceById(workspace.id, sourceId),
        getWsSessionsBySource(workspace.id, user.id, sourceId),
        getWsInsightsBySource(workspace.id, user.id, sourceId),
        getWsSkillProgressBySource(workspace.id, user.id, sourceId),
        getWsTasksBySource(workspace.id, user.id, sourceId),
        getWsSkillProgress(workspace.id, user.id),
        getWsSources(workspace.id, user.id, "all")
      ]);
      
      setSource(src ?? null);
      setSessions(sess);
      setInsights(ins);
      setSkillProgress(sp);
      setTasks(tsk);
      setAllSkillsGlobal(allSp);
      setAllSources(allSrc);
    } catch (err) {
      console.error("SourceDetailShell refresh error:", err);
    } finally {
      setLoading(false);
    }
  }, [user, workspace, sourceId]);

  useEffect(() => {
    if (user && workspace) {
      refresh();
    }
  }, [user, workspace, refresh]);

  // ─── Loading / Not Found ─────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-48 bg-white/5 border border-white/5 rounded-2xl" />
        <div className="h-12 bg-white/5 border border-white/5 rounded-xl" />
        <div className="h-64 bg-white/5 border border-white/5 rounded-2xl" />
      </div>
    );
  }

  if (!source) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center glass rounded-2xl border border-white/10 shadow-card-depth max-w-lg mx-auto">
        <span className="text-5xl mb-4">🔍</span>
        <h2 className="text-lg font-bold text-text">Sumber tidak ditemukan</h2>
        <p className="text-sm text-text-mute mt-1 mb-6">
          ID <code className="text-xs bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-text">{sourceId}</code> tidak ada di storage.
        </p>
        <Link href="/dashboard"
          className="bg-indigo-sleek hover:bg-indigo-2 text-white border border-indigo-500/30 text-sm font-semibold px-5 py-2.5 rounded-xl transition-all active:scale-95 shadow-lg shadow-indigo-500/10 cursor-pointer">
          ← Kembali ke Dashboard
        </Link>
      </div>
    );
  }

  // ─── Tab badge counts ────────────────────────────────────────────────────

  const tabBadge: Partial<Record<TabId, number>> = {
    sessions: (sessions || []).length,
    insights: (insights || []).length,
    tasks: (tasks || []).filter((t) => t.status !== "done" && t.status !== "cancelled").length,
    skills: (skillProgress || []).length,
    history: (sessions || []).length + (insights || []).length + (tasks?.filter((t) => t.status === "done").length || 0),
  };

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <>
      {/* Edit Source Modal */}
      {showEditModal && (
        <Modal onClose={() => setShowEditModal(false)}>
          <AddSourceForm
            onSaved={() => {
              setShowEditModal(false);
              refresh();
            }}
          />
        </Modal>
      )}

      {/* Update Progress Modal */}
      {showProgressModal && (
        <Modal onClose={() => setShowProgressModal(false)} title="Update Progres">
          <UpdateProgressForm
            source={source}
            onSaved={async (updated) => {
              if (user && workspace) await updateWsSource(workspace.id, updated);
              setShowProgressModal(false);
              refresh();
            }}
            onCancel={() => setShowProgressModal(false)}
          />
        </Modal>
      )}

      {/* Header */}
      <SourceHeader
        source={source}
        onEditClick={() => setShowEditModal(true)}
        onProgressClick={() => setShowProgressModal(true)}
        onTimerFinish={handleTimerFinish}
      />

      {/* Daily target widget */}
      {source.dailyPageTarget && (() => {
        const stats = getSourceProgress(source);
        const todayStr = new Date().toLocaleDateString("en-CA");
        const todaySessions = sessions.filter((s) => s.date === todayStr);
        const unitsToday = todaySessions.reduce((sum, s) => sum + (s.unitsConsumed || 0), 0);
        const targetUnits = source.dailyPageTarget || 0;
        const isTargetMet = unitsToday >= targetUnits;
        const progressPct = targetUnits > 0 ? Math.min(100, (unitsToday / targetUnits) * 100) : 0;
        const remaining = Math.max(0, targetUnits - unitsToday);

        return (
          <div className={`border border-white/10 rounded-2xl p-4.5 mb-6 shadow-card-depth backdrop-blur-md transition-all duration-300 ${
            isTargetMet 
              ? "bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border-emerald-500/30" 
              : "bg-gradient-to-r from-sky-500/10 via-sky-500/5 to-transparent border-sky-500/20"
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl border flex items-center justify-center shrink-0 ${
                  isTargetMet 
                    ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.3)] animate-pulse" 
                    : "bg-sky-500/20 border-sky-500/30 text-sky-400"
                }`}>
                  {isTargetMet ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                </div>
                <div>
                  <p className={`text-[10px] font-black uppercase tracking-widest ${
                    isTargetMet ? "text-emerald-400" : "text-sky-400"
                  }`}>
                    {isTargetMet ? "Target Hari Ini Tercapai! 🎉" : "Target Hari Ini"}
                  </p>
                  <p className="text-sm font-bold text-text mt-0.5">
                    {unitsToday} dari {targetUnits} {stats.unitLabel} selesai
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4.5 justify-between sm:justify-end flex-wrap sm:flex-nowrap">
                {source.targetCompletionDate && (
                  <div className="text-left sm:text-right">
                    <p className="text-xs text-text-mute font-medium">Batas Waktu</p>
                    <p className={`text-xs font-semibold mt-0.5 ${isTargetMet ? "text-emerald-400/80" : "text-sky-400/80"}`}>
                      {new Date(source.targetCompletionDate).toLocaleDateString("id-ID", {
                        day: "numeric", month: "short", year: "numeric",
                      })}
                    </p>
                  </div>
                )}

                {!isTargetMet && (
                  <button
                    onClick={handleQuickCompleteTarget}
                    className="text-xs font-bold text-white bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-500/90 hover:to-indigo-500/90 px-3.5 py-2 rounded-xl transition-all active:scale-95 shadow-md shadow-sky-500/10 cursor-pointer flex items-center gap-1.5 border border-sky-400/20"
                  >
                    <span>Selesaikan (+{remaining} {stats.unitLabel})</span>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Micro Progress Bar */}
            <div className="w-full bg-white/5 border border-white/5 rounded-full h-1.5 mt-3.5 overflow-hidden">
              <div
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  isTargetMet 
                    ? "bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_8px_rgba(16,185,129,0.5)]" 
                    : "bg-gradient-to-r from-sky-500 to-indigo-500"
                }`}
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        );
      })()}

      {/* Tab bar */}
      <div className="flex gap-1 bg-white/5 border border-white/10 rounded-2xl p-1.5 shadow-card-depth mb-6 overflow-x-auto backdrop-blur-md">
        {TABS.map((tab) => {
          const count = tabBadge[tab.id];
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                isActive
                  ? "bg-indigo-sleek/20 text-indigo-300 border border-indigo-500/35 shadow-glow-primary"
                  : "text-text-mute hover:text-text-dim hover:bg-white/5 border border-transparent"
              }`}
            >
              <span>{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
              {count !== undefined && count > 0 && (
                <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full transition-colors ${
                  isActive ? "bg-indigo-500/30 text-indigo-200" : "bg-white/5 text-text-mute border border-white/5"
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div>
        {activeTab === "sessions" && (
          <SessionNotesTab
            source={source}
            sessions={sessions}
            onRefresh={refresh}
            onSwitchTab={setActiveTab}
            initialDuration={prefilledDuration ?? undefined}
          />
        )}
        {activeTab === "insights" && (
          <KeyInsightsTab source={source} insights={insights} onRefresh={refresh} />
        )}
        {activeTab === "tasks" && (
          <ActionItemsTab source={source} tasks={tasks} onRefresh={refresh} />
        )}
        {activeTab === "skills" && (
          <SkillProgressTab
            allSkillProgress={skillProgress}
            allSkillsGlobal={allSkillsGlobal}
            allSources={allSources}
            onRefresh={refresh}
          />
        )}
        {activeTab === "history" && (
          <ActivityHistoryTab
            sessions={sessions}
            insights={insights}
            tasks={tasks}
            skillProgress={skillProgress}
          />
        )}
      </div>
    </>
  );
}
