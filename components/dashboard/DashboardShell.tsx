"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getWsSources,
  getWsSessions,
  getWsInsights,
  getWsSkillProgress,
  updateWsSkillProgress,
} from "@/lib/storageV2";
import { useAuth } from "@/lib/contexts/AuthContext";
import { useWorkspace } from "@/lib/contexts/WorkspaceContext";
import {
  getActiveSources,
  getWeeklyMinutes,
  getTotalSkillsTracked,
  getCurrentStreak,
  getLongestStreak,
  getCompletedActionItemsThisWeek,
  getInsightsThisWeek,
  getWeeklyActivity,
} from "@/lib/utils/analytics";
import { getLearnerType, setLearnerType } from "@/lib/utils/learnerProfile";
import type { LearnerType } from "@/lib/utils/learnerProfile";
import { computeWeeklyXP, getWeeklyQuest } from "@/lib/utils/gamification";
import { isOnboardingComplete } from "@/lib/utils/onboarding";
import type { LearningSource, LearningSession, KeyInsight, SkillProgress } from "@/lib/types";
import type { AccountProfile } from "@/lib/accountTypes";

import KpiBar from "./KpiBar";
import FocusTodayBanner from "./FocusTodayBanner";
import NextBestActionCard from "./NextBestActionCard";
import GrowingSkillsCard from "./GrowingSkillsCard";
import RecentWinsCard from "./RecentWinsCard";
import InsightsPanel from "./InsightsPanel";
import DailySummaryBanner from "./DailySummaryBanner";
import RecommendationCard from "./RecommendationCard";
import AddSourceForm from "@/components/sources/AddSourceForm";
import CatalogPicker from "@/components/sources/CatalogPicker";
import Modal from "@/components/ui/Modal";
import OnboardingFlow from "@/components/onboarding/OnboardingFlow";
import CalendarIcon from "@/components/ui/CalendarIcon";
import OnboardingChecklist from "@/components/dashboard/OnboardingChecklist";
import DailyReview from "@/components/dashboard/DailyReview";
import WeeklyReviewRitual from "@/components/dashboard/WeeklyReviewRitual";
import InsightToActionPrompt from "@/components/dashboard/InsightToActionPrompt";
import { exportLearningReportToMarkdown } from "@/lib/utils/exportReport";
import type { SourcePrefill } from "@/lib/types";

// ─── Data Shape ───────────────────────────────────────────────────────────────

interface AppData {
  sources: LearningSource[];
  sessions: LearningSession[];
  insights: KeyInsight[];
  skillProgress: SkillProgress[];
}

// ─── Dashboard Shell ──────────────────────────────────────────────────────────

export default function DashboardShell() {
  const { user, profile: activeAccount, updateProfile: updateAccount, isLoading: authLoading } = useAuth();
  const { currentWorkspace: workspace } = useWorkspace();
  const [data, setData] = useState<AppData>({
    sources: [],
    sessions: [],
    insights: [],
    skillProgress: [],
  });
  const [mounted, setMounted] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalTab, setModalTab] = useState<"catalog" | "manual">("catalog");
  const [prefill, setPrefill] = useState<SourcePrefill | undefined>(undefined);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [learnerType, setLearnerTypeState] = useState<LearnerType>("daily");

  const refresh = useCallback(async () => {
    if (!user || !workspace) return;
    
    // Simulate async
    await new Promise(r => setTimeout(r, 0));

    const sources = await getWsSources(workspace.id, user.id, "all");
    const sessions = await getWsSessions(workspace.id, user.id);
    const insights = await getWsInsights(workspace.id, user.id);
    const skillProgress = await getWsSkillProgress(workspace.id, user.id);
    
    setData({ sources, sessions, insights, skillProgress });
  }, [user, workspace]);

  useEffect(() => {
    if (authLoading) return;
    
    if (!user || !workspace) {
      console.log("DashboardShell: waiting for user/workspace", { user: !!user, workspace: !!workspace });
      setMounted(true);
      return;
    }

    (async () => {
      try {
        console.log("DashboardShell: loading data for", workspace.id);
        const [sources, sessions, insights, skillProgress] = await Promise.all([
          getWsSources(workspace.id, user.id, "all"),
          getWsSessions(workspace.id, user.id, "id, source_id, date, duration_minutes, units_consumed, workspace_id, user_id, created_at"),
          getWsInsights(workspace.id, user.id, "id, source_id, type, quote, tags, workspace_id, user_id, created_at"),
          getWsSkillProgress(workspace.id, user.id, "id, source_id, skill_name, category, level, level_achieved_at, action_items, workspace_id, user_id, created_at")
        ]);
        
        console.log("DashboardShell: data loaded", { 
          sources: sources.length, 
          sessions: sessions.length,
          insights: insights.length,
          skillProgress: skillProgress.length
        });

        setData({ 
          sources: sources || [], 
          sessions: sessions || [], 
          insights: insights || [], 
          skillProgress: skillProgress || [] 
        });
        setLearnerTypeState(getLearnerType());
      } catch (err) {
        console.error("DashboardShell: data load error", err);
      } finally {
        setMounted(true);
      }
    })();
  }, [user, authLoading, workspace]);

  // Show onboarding once mounted and profile not complete
  useEffect(() => {
    if (mounted && activeAccount && !isOnboardingComplete(activeAccount as unknown as AccountProfile)) {
      setShowOnboarding(true);
    }
  }, [mounted, activeAccount]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Onboarding handler ──────────────────────────────────────────────────

  const handleOnboardingComplete = useCallback(async (updated: AccountProfile) => {
    await updateAccount({
      name: updated.name,
      avatar: updated.avatar,
      userRole: updated.userRole,
      focusAreas: updated.focusAreas,
      primaryGoal: updated.primaryGoal,
      onboardingCompleted: updated.onboardingCompleted,
    });
    setShowOnboarding(false);
  }, [updateAccount]);

  // ─── Action item toggle ──────────────────────────────────────────────────

  const handleToggleActionItem = useCallback(
    async (skillProgressId: string, actionItemId: string) => {
      if (!user || !workspace) return;
      const sp = data.skillProgress.find((s) => s.id === skillProgressId);
      if (!sp) return;
      const now = new Date().toISOString();
      const updated: SkillProgress = {
        ...sp,
        actionItems: sp.actionItems.map((ai) =>
          ai.id === actionItemId
            ? {
                ...ai,
                completed: !ai.completed,
                completedAt: !ai.completed ? now : undefined,
              }
            : ai
        ),
      };
      await updateWsSkillProgress(workspace.id, user.id, updated);
      refresh();
    },
    [user, workspace, data.skillProgress, refresh]
  );

  // ─── Learner type toggle ─────────────────────────────────────────────────

  const handleLearnerTypeToggle = useCallback((type: LearnerType) => {
    setLearnerType(type);
    setLearnerTypeState(type);
  }, []);

  // ─── KPI computations ────────────────────────────────────────────────────

  const kpi = {
    activeSources: getActiveSources(data.sources),
    weeklyMinutes: getWeeklyMinutes(data.sessions),
    totalSkills: getTotalSkillsTracked(data.skillProgress),
    currentStreak: getCurrentStreak(data.sessions),
    longestStreak: getLongestStreak(data.sessions),
    completedActionsThisWeek: getCompletedActionItemsThisWeek(data.skillProgress),
    insightsThisWeek: getInsightsThisWeek(data.insights),
    pendingActionItems: data.skillProgress.flatMap((sp) => sp.actionItems).filter((ai) => !ai.completed).length,
  };

  const weeklyActivity = getWeeklyActivity(data.sessions);
  const weeklyXP = computeWeeklyXP(data.sessions, data.insights, data.skillProgress);
  const weeklyQuest = getWeeklyQuest(learnerType, data.sessions, data.insights, data.skillProgress);

  // ─── Skeleton while hydrating ────────────────────────────────────────────

  if (!mounted) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-32 bg-gray-100 rounded-2xl" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 h-80 bg-gray-100 rounded-2xl" />
          <div className="lg:col-span-2 h-80 bg-gray-100 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <>
      {/* ── Onboarding Overlay ── */}
      {showOnboarding && activeAccount && (
        <OnboardingFlow
          account={activeAccount as unknown as AccountProfile}
          onComplete={handleOnboardingComplete}
          onSkip={() => handleOnboardingComplete({ ...(activeAccount as unknown as AccountProfile), onboardingCompleted: true })}
        />
      )}

      {/* ── Add Source Modal ── */}
      {showAddModal && (
        <Modal onClose={() => { setShowAddModal(false); setPrefill(undefined); setModalTab("catalog"); }}>
          {/* Two-tab header */}
          <div className="flex border-b border-gray-100 -mx-6 -mt-4 mb-4 rounded-t-2xl overflow-hidden">
            <button
              onClick={() => setModalTab("catalog")}
              className={`flex-1 py-3 text-sm font-semibold transition-colors ${
                modalTab === "catalog"
                  ? "bg-white text-sky-600 border-b-2 border-sky-500"
                  : "bg-gray-50 text-gray-500 hover:text-gray-700"
              }`}
            >
              📚 Pilih dari Katalog
            </button>
            <button
              onClick={() => setModalTab("manual")}
              className={`flex-1 py-3 text-sm font-semibold transition-colors ${
                modalTab === "manual"
                  ? "bg-white text-sky-600 border-b-2 border-sky-500"
                  : "bg-gray-50 text-gray-500 hover:text-gray-700"
              }`}
            >
              ✏️ Isi Manual
            </button>
          </div>

          {modalTab === "catalog" ? (
            <CatalogPicker
              onSelect={(pf) => {
                setPrefill(pf);
                setModalTab("manual");
              }}
            />
          ) : (
            <AddSourceForm
              prefill={prefill}
              onSaved={() => {
                refresh();
                setShowAddModal(false);
                setPrefill(undefined);
                setModalTab("catalog");
              }}
            />
          )}
        </Modal>
      )}

      <div className="space-y-6">
        {/* ── Page Header ── */}
        <div className="flex items-end justify-between">
          <div className="animate-fade-in">
            <div className="flex items-center gap-3">
              <CalendarIcon />
              <h1 className="text-3xl lg:text-4xl font-display font-black text-text-primary leading-tight">
                Hari Ini
              </h1>
            </div>
            <p className="text-sm text-text-secondary mt-2 font-body ml-1">
              {new Date().toLocaleDateString("id-ID", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => exportLearningReportToMarkdown(data.sources, data.sessions, data.insights, [], activeAccount?.name)}
              className="hidden sm:flex items-center gap-2 bg-white border border-gray-200 text-gray-500 hover:text-gray-800 text-sm font-bold px-4 py-3 rounded-2xl shadow-sm hover:shadow-md transition-all active:scale-95 animate-slide-up"
            >
              <span>📥</span> <span className="hidden lg:inline">Export Report</span>
            </button>
            <button
              onClick={() => { setPrefill(undefined); setModalTab("catalog"); setShowAddModal(true); }}
              className="flex items-center gap-2 bg-gradient-to-r from-neon-pink to-neon-purple hover:shadow-glow-pink text-white text-sm font-display font-bold px-5 py-3 rounded-2xl shadow-card-sm hover:shadow-md transition-all active:scale-95 animate-slide-up"
            >
              <span>✨</span>
              <span>Sumber Baru</span>
            </button>
          </div>
        </div>

        <OnboardingChecklist
          sources={data.sources}
          sessions={data.sessions}
          insights={data.insights}
          onAddSource={() => { setPrefill(undefined); setModalTab("catalog"); setShowAddModal(true); }}
        />

        {/* ── Daily Summary Banner ── */}
        <DailySummaryBanner
          sessions={data.sessions}
          skillProgress={data.skillProgress}
        />

        {/* ── Personal Learning Cockpit: Top Row ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <FocusTodayBanner
              sources={data.sources}
              sessions={data.sessions}
              insights={data.insights}
              skillProgress={data.skillProgress}
              learnerType={learnerType}
              currentStreak={kpi.currentStreak}
              weeklyXP={weeklyXP}
              weeklyQuest={weeklyQuest}
              onAddSource={() => setShowAddModal(true)}
              weeklyGoal={activeAccount?.weeklyGoal}
              weeklyMinutes={kpi.weeklyMinutes}
              gamificationMode={activeAccount?.gamificationMode ?? "standard"}
            />
          </div>
          <div className="lg:col-span-1">
            <RecommendationCard
              sources={data.sources}
              sessions={data.sessions}
              insights={data.insights}
              skillProgress={data.skillProgress}
              profile={activeAccount}
              onStartOnboarding={() => setShowOnboarding(true)}
            />
          </div>
        </div>

        {/* ── Today's Actionable Content ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column: Next action + Growing skills */}
          <div className="lg:col-span-2 space-y-6">
            <NextBestActionCard
              skillProgress={data.skillProgress}
              sources={data.sources}
              onToggle={handleToggleActionItem}
            />
            <GrowingSkillsCard
              skillProgress={data.skillProgress}
              sessions={data.sessions}
            />
          </div>

          {/* Right column: Rituals + Insights */}
          <div className="space-y-6">
            <InsightToActionPrompt 
              insights={data.insights}
              sources={data.sources}
            />
            <WeeklyReviewRitual
              sessions={data.sessions}
              insights={data.insights}
              skillProgress={data.skillProgress}
              onRefresh={refresh}
            />
            <DailyReview
              insights={data.insights}
              sources={data.sources}
              onRefresh={refresh}
            />
            <RecentWinsCard skillProgress={data.skillProgress} />
            <InsightsPanel
              insights={data.insights}
              sources={data.sources}
            />
          </div>
        </div>

        {/* ── Weekly Progress Summary ── */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <h2 className="text-base font-bold text-gray-900 mb-4">📊 Progress Minggu Ini</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-black text-sky-600">{kpi.activeSources}</p>
              <p className="text-xs text-gray-500 mt-1">Sumber Aktif</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-black text-violet-600">{kpi.weeklyMinutes}m</p>
              <p className="text-xs text-gray-500 mt-1">Waktu Belajar</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-black text-emerald-600">{kpi.completedActionsThisWeek}</p>
              <p className="text-xs text-gray-500 mt-1">Action Selesai</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-black text-orange-600">🔥 {kpi.currentStreak}</p>
              <p className="text-xs text-gray-500 mt-1">Streak Saat Ini</p>
            </div>
          </div>
        </div>

        {/* ── Quick Links to Other Pages ── */}
        <div className="flex gap-2 justify-center">
          <a
            href="/dashboard/sources"
            className="text-xs font-semibold text-gray-500 hover:text-sky-600 px-4 py-2 rounded-lg border border-gray-200 hover:border-sky-300 transition-all"
          >
            Lihat Semua Sumber →
          </a>
          <a
            href="/dashboard/skills"
            className="text-xs font-semibold text-gray-500 hover:text-violet-600 px-4 py-2 rounded-lg border border-gray-200 hover:border-violet-300 transition-all"
          >
            Kelola Skills →
          </a>
          <a
            href="/dashboard/actions"
            className="text-xs font-semibold text-gray-500 hover:text-emerald-600 px-4 py-2 rounded-lg border border-gray-200 hover:border-emerald-300 transition-all"
          >
            Semua Action Items →
          </a>
        </div>
      </div>
    </>
  );
}
