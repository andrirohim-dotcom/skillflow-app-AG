"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getWsSources,
  getWsSessions,
  getWsInsights,
  getWsSkillProgress,
  updateWsSkillProgress,
  saveWsSession,
} from "@/lib/storageV2";
import { useCelebration } from "@/context/CelebrationContext";
import { useXPToast } from "@/components/gamification/XPToast";
import { getLevelFromXP } from "@/lib/utils/gamification";
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
} from "@/lib/utils/analytics";
import { getLearnerType } from "@/lib/utils/learnerProfile";
import type { LearnerType } from "@/lib/utils/learnerProfile";
import {
  computeWeeklyXP,
  computeTotalXP,
  computeTotalGold,
} from "@/lib/utils/gamification";
import { isOnboardingComplete } from "@/lib/utils/onboarding";
import type { LearningSource, LearningSession, KeyInsight, SkillProgress } from "@/lib/types";
import type { AccountProfile } from "@/lib/accountTypes";

import KpiBar from "./KpiBar";
import SleekDailyBanner from "./SleekDailyBanner";
import NextBestActionCard from "./NextBestActionCard";
import DashboardTour from "./DashboardTour";
import LevelUpModal from "./LevelUpModal";
import GrowingSkillsCard from "./GrowingSkillsCard";
import ConsistencyMap from "./ConsistencyMap";
import SleekBountyQuest from "./SleekBountyQuest";
import SleekActivityFeed from "./SleekActivityFeed";
import RecentWinsCard from "./RecentWinsCard";
import InsightsPanel from "./InsightsPanel";
import RecommendationCard from "./RecommendationCard";
import AddSourceForm from "@/components/sources/AddSourceForm";
import CatalogPicker from "@/components/sources/CatalogPicker";
import Modal from "@/components/ui/Modal";
import OnboardingFlow from "@/components/onboarding/OnboardingFlow";
import OnboardingChecklist from "@/components/dashboard/OnboardingChecklist";
import DailyReview from "@/components/dashboard/DailyReview";
import WeeklyReviewRitual from "@/components/dashboard/WeeklyReviewRitual";
import InsightToActionPrompt from "@/components/dashboard/InsightToActionPrompt";
import { exportLearningReportToMarkdown } from "@/lib/utils/exportReport";
import type { SourcePrefill } from "@/lib/types";
import { Icon } from "./SleekPrimitives";

interface AppData {
  sources: LearningSource[];
  sessions: LearningSession[];
  insights: KeyInsight[];
  skillProgress: SkillProgress[];
}

export default function DashboardShell() {
  const { user, profile: activeAccount, updateProfile: updateAccount, isLoading: authLoading } = useAuth();
  const { currentWorkspace: workspace } = useWorkspace();
  const { triggerCelebration } = useCelebration();
  const { showToast } = useXPToast();
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
  
  // Streak Shield & Tour States
  const [shieldsCount, setShieldsCount] = useState(0);
  const [spentGold, setSpentGold] = useState(0);
  const [xpOffset, setXpOffset] = useState(0);
  const [isBuyingShield, setIsBuyingShield] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const [shieldNotification, setShieldNotification] = useState<string | null>(null);
  const [levelUpInfo, setLevelUpInfo] = useState<{ level: number; title: string } | null>(null);

  const refresh = useCallback(async () => {
    if (!user || !workspace) return;

    const sources = await getWsSources(workspace.id, user.id, "all");
    const sessions = await getWsSessions(workspace.id, user.id);
    const insights = await getWsInsights(workspace.id, user.id);
    const skillProgress = await getWsSkillProgress(workspace.id, user.id);

    setData({ sources, sessions, insights, skillProgress });
  }, [user, workspace]);

  useEffect(() => {
    if (authLoading) return;

    if (!user || !workspace) {
      setMounted(true);
      return;
    }

    (async () => {
      try {
        const [sources, sessions, insights, skillProgress] = await Promise.all([
          getWsSources(workspace.id, user.id, "all"),
          getWsSessions(workspace.id, user.id),
          getWsInsights(workspace.id, user.id),
          getWsSkillProgress(workspace.id, user.id)
        ]);

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

  useEffect(() => {
    if (mounted && activeAccount && !isOnboardingComplete(activeAccount as unknown as AccountProfile)) {
      setShowOnboarding(true);
    }
  }, [mounted, activeAccount]);

  // Load Tour, Shield & Gold configs
  useEffect(() => {
    if (typeof window !== "undefined" && user) {
      const savedShields = localStorage.getItem("streak_shields");
      if (savedShields) setShieldsCount(parseInt(savedShields, 10));

      const savedSpent = localStorage.getItem(`skillflow:gold:spent:${user.id}`);
      if (savedSpent) setSpentGold(parseInt(savedSpent, 10));

      const savedXpOffset = localStorage.getItem("xp_offset");
      if (savedXpOffset) setXpOffset(parseInt(savedXpOffset, 10));

      const tourCompleted = localStorage.getItem("dashboard_tour_completed");
      if (!tourCompleted) {
        setShowTour(true);
      }
    }
  }, [mounted, user]);

  // Auto-recovery check
  useEffect(() => {
    if (!mounted || !user || !workspace || shieldsCount <= 0 || data.sessions.length === 0) return;

    (async () => {
      const checkDays = [1, 2];
      let shieldsLeft = shieldsCount;
      let shieldUsed = false;
      const recoveredDates: string[] = [];

      for (const daysAgo of checkDays) {
        if (shieldsLeft <= 0) break;
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() - daysAgo);
        const targetDateStr = targetDate.toISOString().slice(0, 10);

        const hasSession = data.sessions.some(
          (s) => s.date && s.date.slice(0, 10) === targetDateStr
        );

        if (!hasSession) {
          const virtualSession: LearningSession = {
            id: crypto.randomUUID(),
            sourceId: "streak-shield-recovery",
            workspaceId: workspace.id,
            userId: user.id,
            date: targetDateStr,
            durationMinutes: 1,
            unitsConsumed: 0,
            isStreakShield: true,
            notes: "Auto-recovery via Streak Shield 🛡️",
            createdAt: new Date().toISOString(),
          };

          shieldsLeft -= 1;
          await saveWsSession(workspace.id, user.id, virtualSession);
          recoveredDates.push(targetDateStr);
          shieldUsed = true;
        }
      }

      if (shieldUsed) {
        localStorage.setItem("streak_shields", shieldsLeft.toString());
        setShieldsCount(shieldsLeft);
        setShieldNotification(
          `Streak Shield Anda telah otomatis digunakan untuk memulihkan hari belajar yang terlewat (${recoveredDates.join(
            ", "
          )}). Streak Anda aman! 🛡️`
        );
        refresh();
      }
    })();
  }, [mounted, user, workspace, shieldsCount, data.sessions, refresh]);

  const focusAreas = activeAccount?.focusAreas || [];
  const totalGoldEarned = computeTotalGold(data.sessions, data.insights, data.skillProgress, learnerType);
  const currentGold = Math.max(0, totalGoldEarned - spentGold);

  const handleBuyShield = useCallback(async () => {
    if (!user) return;
    setIsBuyingShield(true);
    try {
      const shieldCost = 150;
      if (currentGold >= shieldCost) {
        const newSpent = spentGold + shieldCost;
        localStorage.setItem(`skillflow:gold:spent:${user.id}`, newSpent.toString());
        setSpentGold(newSpent);

        const newShields = shieldsCount + 1;
        localStorage.setItem("streak_shields", newShields.toString());
        setShieldsCount(newShields);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsBuyingShield(false);
    }
  }, [user, currentGold, spentGold, shieldsCount]);

  const handleTourComplete = useCallback(() => {
    localStorage.setItem("dashboard_tour_completed", "true");
    setShowTour(false);
  }, []);

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

  const handleToggleActionItem = useCallback(
    async (skillProgressId: string, actionItemId: string) => {
      if (!user || !workspace) return;
      const sp = data.skillProgress.find((s) => s.id === skillProgressId);
      if (!sp) return;
      const now = new Date().toISOString();
      const isCompleting = !sp.actionItems.find((ai) => ai.id === actionItemId)?.completed;
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

      // Trigger "first action" celebration if this is the first completed action today
      if (isCompleting) {
        const todayISO = now.slice(0, 10);
        const todayActionsKey = `skillflow:first_action:${user.id}:${todayISO}`;
        if (!localStorage.getItem(todayActionsKey)) {
          localStorage.setItem(todayActionsKey, "1");
          setTimeout(() => triggerCelebration("first_action"), 400);
        } else {
          showToast("+3 XP diperoleh! ✅", "✅", "emerald");
        }
      }
    },
    [user, workspace, data.skillProgress, refresh, triggerCelebration, showToast]
  );

  const handleQuickLog = useCallback(
    async (minutes: number, sourceId: string) => {
      if (!user || !workspace) return;
      const source = data.sources.find((s) => s.id === sourceId);
      if (!source) return;

      // Capture XP before save
      const xpBefore = computeTotalXP(data.sessions, data.insights, data.skillProgress, activeAccount?.focusAreas ?? [], learnerType);
      const levelBefore = getLevelFromXP(xpBefore).level;

      const today = new Date().toISOString().slice(0, 10);
      const session: LearningSession = {
        id: crypto.randomUUID(),
        sourceId: source.id,
        workspaceId: workspace.id,
        userId: user.id,
        date: today,
        durationMinutes: minutes,
        unitsConsumed: 0,
        notes: "Log cepat sesi belajar harian",
        mood: "good",
        focusRating: 4,
        productivityRating: 4,
        createdAt: new Date().toISOString(),
      };

      await saveWsSession(workspace.id, user.id, session);

      // XP Toast
      const xpGained = 10;
      showToast(`+${xpGained} XP diperoleh! 🔥`, "⚡", "indigo");
      if (minutes >= 60) showToast("+5 Bonus XP (60 mnt)! 💪", "💪", "violet");

      await refresh();

      // Check level up after refresh
      const newSessions = await import("@/lib/storageV2").then(m => m.getWsSessions(workspace.id, user.id));
      const xpAfter = computeTotalXP(newSessions, data.insights, data.skillProgress, activeAccount?.focusAreas ?? [], learnerType);
      const levelAfter = getLevelFromXP(xpAfter).level;
      if (levelAfter > levelBefore) {
        setTimeout(() => triggerCelebration("level_up"), 600);
      }
    },
    [user, workspace, data.sources, data.sessions, data.insights, data.skillProgress, activeAccount, learnerType, refresh, showToast, triggerCelebration]
  );

  // KPI computations
  const kpi = {
    activeSources: getActiveSources(data.sources),
    weeklyMinutes: getWeeklyMinutes(data.sessions),
    totalSkills: getTotalSkillsTracked(data.skillProgress),
    currentStreak: getCurrentStreak(data.sessions),
    longestStreak: getLongestStreak(data.sessions),
    completedActionsThisWeek: getCompletedActionItemsThisWeek(data.skillProgress),
    insightsThisWeek: getInsightsThisWeek(data.insights),
  };

  const weeklyXP = computeWeeklyXP(data.sessions, data.insights, data.skillProgress, focusAreas, learnerType);
  const totalXP = computeTotalXP(data.sessions, data.insights, data.skillProgress, focusAreas, learnerType);

  // Level Up Celebrations trigger
  useEffect(() => {
    if (!mounted || !user || totalXP === 0) return;

    const levelInfo = getLevelFromXP(totalXP);
    const currentLevel = levelInfo.level;
    const key = `skillflow:level:seen:${user.id}`;
    
    const storedLevelStr = localStorage.getItem(key);
    if (!storedLevelStr) {
      // First load, save current level so we don't trigger modal instantly
      localStorage.setItem(key, currentLevel.toString());
    } else {
      const storedLevel = parseInt(storedLevelStr, 10);
      if (currentLevel > storedLevel) {
        setLevelUpInfo({ level: currentLevel, title: levelInfo.title });
        localStorage.setItem(key, currentLevel.toString());
        // Also trigger celebration modal for level up
        setTimeout(() => triggerCelebration("level_up"), 500);
      }
    }
  }, [mounted, user, totalXP, triggerCelebration]);

  // Streak Milestone Celebration (check once per day)
  useEffect(() => {
    if (!mounted || !user || kpi.currentStreak === 0) return;

    const todayISO = new Date().toISOString().slice(0, 10);
    const streakKey = `skillflow:streak_celebrated:${user.id}:${todayISO}`;
    if (localStorage.getItem(streakKey)) return; // Already celebrated today

    const streak = kpi.currentStreak;
    const milestones: Array<{ days: number; type: "streak_7" | "streak_14" | "streak_30" | "streak_100" }> = [
      { days: 7, type: "streak_7" },
      { days: 14, type: "streak_14" },
      { days: 30, type: "streak_30" },
      { days: 100, type: "streak_100" },
    ];

    const hit = milestones.find((m) => streak === m.days);
    if (hit) {
      localStorage.setItem(streakKey, hit.type);
      setTimeout(() => triggerCelebration(hit.type), 1000);
    }
  }, [mounted, user, kpi.currentStreak, triggerCelebration]);

  // Source Complete Celebration
  useEffect(() => {
    if (!mounted || !user || data.sources.length === 0) return;

    const completedSources = data.sources.filter((s) => s.status === "completed");
    if (completedSources.length === 0) return;

    const seenKey = `skillflow:source_complete_seen:${user.id}`;
    const seenIds = JSON.parse(localStorage.getItem(seenKey) ?? "[]") as string[];
    const newCompleted = completedSources.filter((s) => !seenIds.includes(s.id));

    if (newCompleted.length > 0) {
      const updatedIds = [...seenIds, ...newCompleted.map((s) => s.id)];
      localStorage.setItem(seenKey, JSON.stringify(updatedIds));
      setTimeout(() => triggerCelebration("source_complete"), 800);
    }
  }, [mounted, user, data.sources, triggerCelebration]);


  if (!mounted) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-40 bg-white/5 rounded-2xl border border-white/5" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 bg-white/5 rounded-2xl border border-white/5" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-80 bg-white/5 rounded-2xl border border-white/5" />
          <div className="h-80 bg-white/5 rounded-2xl border border-white/5" />
          <div className="h-80 bg-white/5 rounded-2xl border border-white/5" />
        </div>
      </div>
    );
  }

  return (
    <>
      {levelUpInfo && (
        <LevelUpModal
          level={levelUpInfo.level}
          title={levelUpInfo.title}
          onClose={() => setLevelUpInfo(null)}
        />
      )}

      {/* Onboarding Overlay */}
      {showOnboarding && activeAccount && (
        <OnboardingFlow
          account={activeAccount as unknown as AccountProfile}
          onComplete={handleOnboardingComplete}
          onSkip={() => handleOnboardingComplete({ ...(activeAccount as unknown as AccountProfile), onboardingCompleted: true })}
        />
      )}

      {/* Guided Tour Onboarding */}
      {showTour && (
        <DashboardTour onComplete={handleTourComplete} />
      )}

      {/* Shield Recovery Modal/Alert */}
      {shieldNotification && (
        <Modal onClose={() => setShieldNotification(null)}>
          <div className="p-5 text-center">
            <div className="text-4xl mb-3">🛡️</div>
            <h3 className="text-lg font-semibold text-text mb-2">Streak Shield Aktif!</h3>
            <p className="text-xs text-text-dim leading-relaxed mb-4">{shieldNotification}</p>
            <button
              onClick={() => setShieldNotification(null)}
              className="btn btn-primary w-full py-2 font-bold"
            >
              Mantap!
            </button>
          </div>
        </Modal>
      )}

      {/* Add Source Modal */}
      {showAddModal && (
        <Modal onClose={() => { setShowAddModal(false); setPrefill(undefined); setModalTab("catalog"); }}>
          <div className="flex border-b border-white/5 -mx-6 -mt-4 mb-4 rounded-t-2xl overflow-hidden bg-bg-1">
            <button
              onClick={() => setModalTab("catalog")}
              className={`flex-1 py-3 text-xs uppercase tracking-wider font-bold transition-colors ${
                modalTab === "catalog"
                  ? "bg-bg-2 text-indigo-2 border-b-2 border-indigo-2"
                  : "bg-bg-1 text-text-mute hover:text-text-dim"
              }`}
            >
              📚 Katalog
            </button>
            <button
              onClick={() => setModalTab("manual")}
              className={`flex-1 py-3 text-xs uppercase tracking-wider font-bold transition-colors ${
                modalTab === "manual"
                  ? "bg-bg-2 text-indigo-2 border-b-2 border-indigo-2"
                  : "bg-bg-1 text-text-mute hover:text-text-dim"
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

      <div className="space-y-6 pb-12">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-2 flex items-center justify-center border border-indigo-500/35">
                <Icon name="home" size={16} />
              </div>
              <h1 className="text-3xl font-display font-bold text-text leading-none">
                Hari Ini
              </h1>
            </div>
            <p className="text-xs text-text-mute mt-2 font-mono ml-1 uppercase tracking-wider">
              {new Date().toLocaleDateString("id-ID", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
          <div className="flex gap-2.5 shrink-0">
            {/* DEV-ONLY: Celebration test buttons (hidden in production) */}
            {process.env.NODE_ENV === "development" && (
              <div className="flex gap-1.5">
                {(["level_up", "quest_complete", "streak_7", "source_complete", "first_action"] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => triggerCelebration(type)}
                    className="btn text-[9px] text-violet-400 border-violet-500/20 hover:bg-violet-500/10 uppercase tracking-wider font-mono px-2 py-1"
                    title={`Test celebration: ${type}`}
                  >
                    🎉 {type.replace("_", " ")}
                  </button>
                ))}
              </div>
            )}
            <button
              onClick={() => setShowTour(true)}
              className="btn text-text-dim border-white/5 flex items-center gap-1.5"
              title="Mulai Pemandu Fitur Dashboard"
            >
              <span>🧭 Tur</span>
            </button>
            <button
              onClick={() => exportLearningReportToMarkdown(data.sources, data.sessions, data.insights, [], activeAccount?.name)}
              className="btn text-text-dim border-white/5"
            >
              <Icon name="archive" size={14} />
              <span>Export Report</span>
            </button>
            <button
              onClick={() => { setPrefill(undefined); setModalTab("catalog"); setShowAddModal(true); }}
              className="btn btn-primary"
            >
              <Icon name="plus" size={14} />
              <span>Sumber Baru</span>
            </button>
          </div>
        </div>

        {/* Onboarding checklist (if any tasks remain) */}
        <OnboardingChecklist
          sources={data.sources}
          sessions={data.sessions}
          insights={data.insights}
          onAddSource={() => { setPrefill(undefined); setModalTab("catalog"); setShowAddModal(true); }}
        />

        {/* Sleek Daily Briefing Banner */}
        <SleekDailyBanner
          sources={data.sources}
          sessions={data.sessions}
          insights={data.insights}
          skillProgress={data.skillProgress}
          totalXP={totalXP}
          currentGold={currentGold}
          currentStreak={kpi.currentStreak}
          onAddSource={() => { setPrefill(undefined); setModalTab("catalog"); setShowAddModal(true); }}
          onQuickLog={handleQuickLog}
          shieldsCount={shieldsCount}
          onBuyShield={handleBuyShield}
          isBuyingShield={isBuyingShield}
        />

        {/* Sleek KPI Bar */}
        <KpiBar
          activeSources={kpi.activeSources}
          weeklyMinutes={kpi.weeklyMinutes}
          totalSkills={kpi.totalSkills}
          currentStreak={kpi.currentStreak}
          longestStreak={kpi.longestStreak}
          completedActionsThisWeek={kpi.completedActionsThisWeek}
          insightsThisWeek={kpi.insightsThisWeek}
          weeklyXP={weeklyXP}
        />

        {/* Three-Column Cockpit Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
          
          {/* Column 1: Focus & Actions */}
          <div className="flex flex-col gap-6">
            <NextBestActionCard
              skillProgress={data.skillProgress}
              sources={data.sources}
              onToggle={handleToggleActionItem}
            />
            <SleekBountyQuest
              sources={data.sources}
              onStartBounty={() => {
                // Focus on actions page or write reflection
                window.location.href = "/dashboard/actions";
              }}
            />
            <RecommendationCard
              sources={data.sources}
              sessions={data.sessions}
              insights={data.insights}
              skillProgress={data.skillProgress}
              profile={activeAccount}
              onStartOnboarding={() => setShowOnboarding(true)}
            />
          </div>

          {/* Column 2: Progress & Consistency */}
          <div className="flex flex-col gap-6">
            <ConsistencyMap
              sessions={data.sessions}
              currentStreak={kpi.currentStreak}
            />
            <GrowingSkillsCard
              skillProgress={data.skillProgress}
              sessions={data.sessions}
              insights={data.insights}
              sources={data.sources}
            />
            <RecentWinsCard skillProgress={data.skillProgress} />
            <InsightToActionPrompt
              insights={data.insights}
              sources={data.sources}
            />
          </div>

          {/* Column 3: Review & History */}
          <div className="flex flex-col gap-6">
            <DailyReview
              insights={data.insights}
              sources={data.sources}
              onRefresh={refresh}
            />
            <WeeklyReviewRitual
              sessions={data.sessions}
              insights={data.insights}
              skillProgress={data.skillProgress}
              onRefresh={refresh}
            />
            <InsightsPanel
              insights={data.insights}
              sources={data.sources}
            />
            <SleekActivityFeed
              sessions={data.sessions}
              insights={data.insights}
              sources={data.sources}
              skillProgress={data.skillProgress}
            />
          </div>

        </div>
      </div>
    </>
  );
}
