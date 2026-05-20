"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  getWsSourceById,
  getWsSources,
  updateWsSource,
  getWsSessionsBySource,
  getWsInsightsBySource,
  getWsSkillProgressBySource,
  getWsSkillProgress,
  getWsTasksBySource,
} from "@/lib/storageV2";
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
        <div className="h-48 bg-gray-100 rounded-2xl" />
        <div className="h-12 bg-gray-100 rounded-xl" />
        <div className="h-64 bg-gray-100 rounded-2xl" />
      </div>
    );
  }

  if (!source) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <span className="text-5xl mb-4">🔍</span>
        <h2 className="text-lg font-bold text-gray-800">Sumber tidak ditemukan</h2>
        <p className="text-sm text-gray-400 mt-1 mb-6">
          ID <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">{sourceId}</code> tidak ada di storage.
        </p>
        <Link href="/dashboard"
          className="bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">
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
      {source.dailyPageTarget && (
        <div className="bg-sky-50 border border-sky-200 rounded-xl px-4 py-3 mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-sky-700 uppercase tracking-wide">Target Hari Ini</p>
            <p className="text-sm font-bold text-sky-900 mt-0.5">
              {source.dailyPageTarget} {source.progress.type === "book" ? "halaman" : "menit"}
            </p>
          </div>
          {source.targetCompletionDate && (
            <div className="text-right">
              <p className="text-xs text-sky-500">Selesai sebelum</p>
              <p className="text-sm font-semibold text-sky-700">
                {new Date(source.targetCompletionDate).toLocaleDateString("id-ID", {
                  day: "numeric", month: "short", year: "numeric",
                })}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tab bar */}
      <div className="flex gap-1 bg-white border border-gray-100 rounded-2xl p-1.5 shadow-sm mb-6 overflow-x-auto">
        {TABS.map((tab) => {
          const count = tabBadge[tab.id];
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? "bg-sky-600 text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              <span>{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
              {count !== undefined && count > 0 && (
                <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
                  isActive ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
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
