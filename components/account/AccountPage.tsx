"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/contexts/AuthContext";
import { useWorkspace } from "@/lib/contexts/WorkspaceContext";
import { getWsSessions, getWsSkillProgress, getWsInsights, updateWsSkillProgress, getWsSources } from "@/lib/storageV2";
import { getCurrentStreak, getLongestStreak } from "@/lib/utils/analytics";
import { computeTotalXP, getLevelFromXP, getLearnerArchetype, getMilestones } from "@/lib/utils/gamification";
import type { LearningSession, SkillProgress, KeyInsight, ActionItem, LearningSource } from "@/lib/types";
import OnboardingFlow from "@/components/onboarding/OnboardingFlow";
import type { AccountProfile } from "@/lib/accountTypes";
import StatsRadar from "./StatsRadar";
import InteractiveSkillTree from "./InteractiveSkillTree";

export default function AccountPage() {
  const { user, profile, updateProfile, signOut, isLoading: authLoading } = useAuth();
  const { currentWorkspace, isLoading: wsLoading } = useWorkspace();
  const [sessions, setSessions] = useState<LearningSession[]>([]);
  const [skillProgress, setSkillProgress] = useState<SkillProgress[]>([]);
  const [insights, setInsights] = useState<KeyInsight[]>([]);
  const [sources, setSources] = useState<LearningSource[]>([]);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isSignOutLoading, setIsSignOutLoading] = useState(false);
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);

  const isLoading = authLoading || wsLoading;

  useEffect(() => {
    if (!user || !currentWorkspace) return;
    (async () => {
      const [sess, sp, ins, srcs] = await Promise.all([
        getWsSessions(currentWorkspace.id, user.id),
        getWsSkillProgress(currentWorkspace.id, user.id),
        getWsInsights(currentWorkspace.id, user.id),
        getWsSources(currentWorkspace.id, user.id, "all")
      ]);
      setSessions(sess);
      setSkillProgress(sp);
      setInsights(ins);
      setSources(srcs);
    })();
  }, [user, currentWorkspace]);

  const currentStreak = useMemo(() => getCurrentStreak(sessions), [sessions]);
  const longestStreak = useMemo(() => getLongestStreak(sessions), [sessions]);

  const totalXP = useMemo(() => computeTotalXP(sessions, insights, skillProgress), [sessions, insights, skillProgress]);
  const levelInfo = useMemo(() => getLevelFromXP(totalXP), [totalXP]);
  const archetype = useMemo(() => getLearnerArchetype(profile?.focusAreas || [], sessions.length), [profile?.focusAreas, sessions]);
  const milestones = useMemo(
    () => getMilestones(sessions, insights, skillProgress, currentStreak, longestStreak, sources, profile?.onboardingCompleted),
    [sessions, insights, skillProgress, currentStreak, longestStreak, sources, profile?.onboardingCompleted]
  );

  const handleSignOut = async () => {
    setIsSignOutLoading(true);
    await signOut();
  };

  const handleOnboardingComplete = useCallback(
    async (updated: AccountProfile) => {
      await updateProfile({
        name: updated.name,
        avatar: updated.avatar,
        userRole: updated.userRole,
        focusAreas: updated.focusAreas,
        primaryGoal: updated.primaryGoal,
        onboardingCompleted: updated.onboardingCompleted,
      });
      setShowOnboarding(false);
    },
    [updateProfile]
  );

  const handleToggleActionItem = useCallback(async (skillProgressId: string, actionItemId: string) => {
    if (!user || !currentWorkspace) return;
    const progress = skillProgress.find((sp) => sp.id === skillProgressId);
    if (!progress) return;

    setUpdatingItemId(actionItemId);

    const updatedActionItems = progress.actionItems.map((ai) => {
      if (ai.id === actionItemId) {
        const completed = !ai.completed;
        return {
          ...ai,
          completed,
          completedAt: completed ? new Date().toISOString() : undefined,
        };
      }
      return ai;
    });

    const updatedProgress = {
      ...progress,
      actionItems: updatedActionItems,
    };

    // Calculate level based on completion
    const completedCount = updatedActionItems.filter((a) => a.completed).length;
    let newLevel = progress.level || "awareness";
    if (updatedActionItems.length > 0) {
      const ratio = completedCount / updatedActionItems.length;
      if (ratio === 1) {
        newLevel = "mastered";
      } else if (ratio >= 0.6) {
        newLevel = "applied";
      } else if (ratio >= 0.3) {
        newLevel = "understanding";
      } else {
        newLevel = "awareness";
      }
    }

    updatedProgress.level = newLevel;
    if (newLevel !== progress.level) {
      updatedProgress.levelAchievedAt = new Date().toISOString();
    }

    try {
      await updateWsSkillProgress(currentWorkspace.id, user.id, updatedProgress);
      
      // Refresh local states
      setSkillProgress((prev) =>
        prev.map((sp) => (sp.id === skillProgressId ? updatedProgress : sp))
      );
      
      // Re-fetch insights and sessions to keep XP synchronized
      const [sess, ins] = await Promise.all([
        getWsSessions(currentWorkspace.id, user.id),
        getWsInsights(currentWorkspace.id, user.id)
      ]);
      setSessions(sess);
      setInsights(ins);
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingItemId(null);
    }
  }, [user, currentWorkspace, skillProgress]);

  const activeBounties = useMemo(() => {
    return skillProgress
      .flatMap((sp) => (sp.actionItems || []).map((ai) => ({ ...ai, skillName: sp.skillName, progressId: sp.id })))
      .filter((ai) => !ai.completed);
  }, [skillProgress]);

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-8 animate-pulse py-8">
        <div className="h-12 bg-white/5 border border-line rounded-2xl w-48" />
        <div className="h-64 bg-white/5 border border-line rounded-3xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-40 bg-white/5 border border-line rounded-2xl" />
          <div className="h-40 bg-white/5 border border-line rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center bg-surface/40 border border-line rounded-3xl backdrop-blur-md">
        <span className="text-4xl mb-4 block">⚠️</span>
        <h2 className="text-lg font-bold text-text">Profil tidak ditemukan</h2>
        <p className="text-sm text-text-mute mt-1 mb-6">
          Gagal memuat data profil. Silakan coba muat ulang halaman.
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="bg-indigo-sleek hover:bg-indigo-2 text-white border border-indigo-500/30 text-sm font-semibold px-5 py-2.5 rounded-xl transition-all active:scale-95 shadow-lg shadow-indigo-500/10 cursor-pointer"
        >
          Muat Ulang
        </button>
      </div>
    );
  }

  const accountProfile: AccountProfile = {
    id: profile.id,
    name: profile.name,
    avatar: profile.avatar,
    bio: profile.bio,
    role: "owner",
    learningMode: "daily",
    focusAreas: profile.focusAreas,
    primaryGoal: profile.primaryGoal,
    weeklyGoal: profile.weeklyGoal,
    gamificationMode: profile.gamificationMode,
    createdAt: profile.createdAt,
    userRole: profile.userRole,
    onboardingCompleted: profile.onboardingCompleted,
  };

  const [questTab, setQuestTab] = useState<"daily" | "weekly" | "epic">("daily");
  const [trophyTab, setTrophyTab] = useState<"all" | "platinum" | "gold" | "silver" | "bronze">("all");

  const epicQuestProgress = useMemo(() => {
    const focusAreas = profile?.focusAreas || [];
    if (focusAreas.length === 0) return 0;

    let totalPercent = 0;
    focusAreas.forEach((skillName) => {
      const sp = skillProgress.find((s) => s.skillName === skillName);
      if (sp && sp.actionItems && sp.actionItems.length > 0) {
        const completed = sp.actionItems.filter((ai) => ai.completed).length;
        totalPercent += (completed / sp.actionItems.length) * 100;
      }
    });

    return Math.round(totalPercent / focusAreas.length);
  }, [profile?.focusAreas, skillProgress]);

  const epicMilestones = useMemo(() => {
    const focusAreas = profile?.focusAreas || [];
    return focusAreas.map((skillName) => {
      const sp = skillProgress.find((s) => s.skillName === skillName);
      const total = sp?.actionItems?.length || 0;
      const completed = sp?.actionItems?.filter((ai) => ai.completed).length || 0;
      const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
      return { skillName, completed, total, percent };
    });
  }, [profile?.focusAreas, skillProgress]);

  const isToday = useCallback((dateString: string) => {
    try {
      const date = new Date(dateString);
      const today = new Date();
      return date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear();
    } catch {
      return false;
    }
  }, []);

  const isThisWeek = useCallback((dateString: string) => {
    try {
      const date = new Date(dateString);
      const today = new Date();
      const firstDay = today.getDate() - today.getDay();
      const startOfWeek = new Date(new Date().setDate(firstDay));
      startOfWeek.setHours(0, 0, 0, 0);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(endOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);
      return date >= startOfWeek && date <= endOfWeek;
    } catch {
      return false;
    }
  }, []);

  // Compute other archetypes
  const archetypesList = useMemo(() => [
    {
      name: "Polymath" as const,
      emoji: "🔮",
      desc: "Menghubungkan ide lintas disiplin ilmu."
    },
    {
      name: "Deep Diver" as const,
      emoji: "🔱",
      desc: "Fokus mendalam mengejar penguasaan mutlak."
    },
    {
      name: "Explorer" as const,
      emoji: "🧭",
      desc: "Menjelajah bidang baru secara menyeluruh."
    },
    {
      name: "Strategist" as const,
      emoji: "⚔️",
      desc: "Sintesis seimbang berorientasi tindakan nyata."
    }
  ], []);

  const otherArchetypes = useMemo(() => {
    return archetypesList.filter(a => a.name !== archetype.name);
  }, [archetype.name, archetypesList]);

  // Compute average daily XP
  const avgXPPerDay = useMemo(() => {
    if (sessions.length === 0) return 312;
    // Calculate total days since first session or default to 7
    let days = 7;
    try {
      const dates = sessions.map(s => new Date(s.date).getTime());
      const minDate = Math.min(...dates);
      const diffTime = Math.abs(new Date().getTime() - minDate);
      days = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    } catch {}
    return Math.max(80, Math.round(totalXP / days) * 4); // Scaled for design likeness
  }, [sessions, totalXP]);

  const nextLevelTotalXP = useMemo(() => 50 * levelInfo.level * (levelInfo.level + 1), [levelInfo.level]);
  const xpToGo = useMemo(() => nextLevelTotalXP - totalXP, [nextLevelTotalXP, totalXP]);
  const daysToNextLevel = useMemo(() => Math.max(1, Math.ceil(xpToGo / avgXPPerDay)), [xpToGo, avgXPPerDay]);

  const nextLevelPerk = useMemo(() => {
    const perks: Record<number, string> = {
      2: "Insight filters",
      3: "Advanced analytics",
      4: "Custom schedules",
      5: "Priority targets",
      6: "Reflective habits",
      7: "Learning rituals",
      8: "Custom templates",
      9: "AI synthesis",
      10: "Milestone badges",
      11: "Cognitive tags",
      12: "Focus metrics",
      13: "Custom rituals",
    };
    return perks[levelInfo.level + 1] || "Archmage traits";
  }, [levelInfo.level]);

  // Compute dynamic quest items
  const quests = useMemo(() => {
    // 1. Daily Quests
    const todayInsights = insights.filter(i => isToday(i.createdAt)).length;
    const todayDuration = sessions.filter(s => isToday(s.date)).reduce((acc, s) => acc + (s.durationMinutes || 0), 0);

    // 2. Weekly Quests
    const thisWeekPages = sessions.filter(s => isThisWeek(s.date)).reduce((acc, s) => acc + (s.unitsConsumed || 0), 0);
    const thisWeekReflections = insights.filter(i => isThisWeek(i.createdAt) && i.reflection && i.reflection.split(/\s+/).filter(Boolean).length >= 20).length;

    // 3. Epic Quests
    const inProgressSources = sources.filter(s => s.status === "in_progress");
    const topSource = inProgressSources[0] || sources[0];
    const sourceTitle = topSource ? topSource.title : "Thinking, Fast and Slow";
    let sourceProgressPct = 64; // Default likeness
    if (topSource) {
      if (topSource.progress.type === "book") {
        sourceProgressPct = Math.round((topSource.progress.currentPage / topSource.progress.totalPages) * 100) || 64;
      } else if (topSource.progress.type === "youtube") {
        sourceProgressPct = Math.round((topSource.progress.watchedMinutes / topSource.progress.totalMinutes) * 100) || 64;
      } else if (topSource.progress.type === "course") {
        sourceProgressPct = Math.round(((topSource.progress.completedModules || 0) / (topSource.progress.totalModules || 1)) * 100) || 64;
      }
    }

    const maxSkillMastery = skillProgress.length > 0
      ? Math.max(...skillProgress.map(sp => {
          const completed = sp.actionItems.filter(ai => ai.completed).length;
          return sp.actionItems.length > 0 ? Math.round((completed / sp.actionItems.length) * 100) : 0;
        }))
      : 38;

    return {
      daily: [
        {
          id: "daily_insights",
          title: "Capture 3 fresh insights",
          current: Math.min(3, todayInsights),
          target: 3,
          reward: "+60 XP",
        },
        {
          id: "daily_duration",
          title: "Hit 45 minutes of deep work",
          current: Math.min(45, todayDuration),
          target: 45,
          reward: "+80 XP",
        }
      ],
      weekly: [
        {
          id: "weekly_pages",
          title: "Read 100 pages across 2+ sources",
          current: Math.min(100, thisWeekPages),
          target: 100,
          reward: "+250 XP",
        },
        {
          id: "weekly_reflection",
          title: "Publish a 200-word reflection",
          current: Math.min(1, thisWeekReflections),
          target: 1,
          reward: "+250 XP",
        }
      ],
      epic: [
        {
          id: "epic_finish_source",
          title: `Selesaikan '${sourceTitle}'`,
          current: sourceProgressPct,
          target: 100,
          reward: "+1200 XP",
        },
        {
          id: "epic_skill_tier",
          title: "Reach Applied tier in any skill",
          current: maxSkillMastery,
          target: 100,
          reward: "+1500 XP",
        }
      ]
    };
  }, [insights, sessions, sources, skillProgress, isToday, isThisWeek]);

  // Filtered achievements
  const filteredMilestones = useMemo(() => {
    if (trophyTab === "all") return milestones;
    return milestones.filter(m => m.tier === trophyTab);
  }, [milestones, trophyTab]);

  return (
    <>
      {showOnboarding && (
        <OnboardingFlow
          account={accountProfile}
          onComplete={handleOnboardingComplete}
          onSkip={() => handleOnboardingComplete({ ...accountProfile, onboardingCompleted: true })}
          editMode
        />
      )}

      <div className="max-w-6xl mx-auto space-y-8 pb-16 text-text">
        {/* ── Breadcrumbs ── */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1 text-[11px] font-black uppercase tracking-widest text-text-mute">
            <span>Dashboard</span>
            <span>/</span>
            <span className="text-indigo-400">Character Sheet</span>
          </div>
          <h1 className="text-3xl font-black text-text tracking-tight mt-1">Character Sheet</h1>
          <p className="text-sm text-text-mute">Your learner archetype, in detail.</p>
        </div>

        {/* ── RPG Character Sheet Header / Profile Banner ── */}
        <div className="bg-surface/30 border border-line rounded-3xl p-6 shadow-xl relative overflow-hidden backdrop-blur-xl">
          {/* Ambient light glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left/Middle Profile details */}
            <div className="lg:col-span-2 flex flex-col sm:flex-row items-center sm:items-stretch gap-6">
              {/* Glowing hexagon avatar frame */}
              <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
                <svg className="absolute inset-0 w-full h-full text-indigo-500/20 filter drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]" viewBox="0 0 100 100" fill="currentColor">
                  <polygon points="50,3 93,28 93,78 50,97 7,78 7,28" className="stroke-indigo-500/50 stroke-[3] fill-surface/90" />
                </svg>
                <span className="relative z-10 text-5xl filter drop-shadow-md select-none">{profile.avatar || "🧑"}</span>
                <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full border border-yellow-300 shadow-lg">
                  Lv.{levelInfo.level}
                </div>
              </div>

              <div className="text-center sm:text-left flex flex-col justify-center min-w-0">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h2 className="text-3xl font-black text-text tracking-tight leading-none truncate">{profile.name}</h2>
                  <span className={`bg-gradient-to-r ${archetype.badgeColor} text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-sm`}>
                    <span>{archetype.emoji}</span>
                    <span>{archetype.name}</span>
                  </span>
                </div>
                <p className="text-xs text-text-mute mt-1.5 font-medium">{profile.email}</p>
                <p className="text-xs text-text-dim mt-3 max-w-lg leading-relaxed italic border-l-2 border-indigo-500/30 pl-3">
                  "{archetype.description}"
                </p>

                {/* Horizontal badges row */}
                <div className="flex flex-wrap items-center gap-2 mt-5">
                  <div className="bg-white/5 border border-line rounded-xl px-3 py-1.5 text-center flex items-center gap-2">
                    <span className="text-[10px] font-black tracking-widest text-text-mute uppercase">LEVEL</span>
                    <span className="text-xs font-black text-indigo-400">{levelInfo.level}</span>
                  </div>
                  <div className="bg-white/5 border border-line rounded-xl px-3 py-1.5 text-center flex items-center gap-2">
                    <span className="text-[10px] font-black tracking-widest text-text-mute uppercase">STREAK</span>
                    <span className="text-xs font-black text-orange-400">🔥 {currentStreak}D</span>
                  </div>
                  <div className="bg-white/5 border border-line rounded-xl px-3 py-1.5 text-center flex items-center gap-2">
                    <span className="text-[10px] font-black tracking-widest text-text-mute uppercase">TROPHIES</span>
                    <span className="text-xs font-black text-yellow-400">🏆 {milestones.filter(m => m.earned).length}</span>
                  </div>
                  <div className="bg-white/5 border border-line rounded-xl px-3 py-1.5 text-center flex items-center gap-2">
                    <span className="text-[10px] font-black tracking-widest text-text-mute uppercase">SOURCES</span>
                    <span className="text-xs font-black text-sky-400">📚 {sources.length}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Archetype Select Side Panel */}
            <div className="bg-white/5 border border-line rounded-2xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-[10px] font-black text-text-mute uppercase tracking-widest">Other Archetypes</h3>
                  <button
                    onClick={() => setShowOnboarding(true)}
                    className="text-[10px] font-black text-indigo-400 hover:text-indigo-300 transition-colors uppercase tracking-widest"
                  >
                    Adjust
                  </button>
                </div>
                <div className="space-y-2">
                  {otherArchetypes.map((oth) => (
                    <div
                      key={oth.name}
                      className="flex items-center gap-2.5 p-2 rounded-xl bg-surface/30 border border-line/60 hover:bg-white/5 hover:border-indigo-500/25 transition-all group cursor-pointer"
                      onClick={() => setShowOnboarding(true)}
                    >
                      <span className="text-lg bg-surface/80 w-7 h-7 rounded-lg flex items-center justify-center border border-line group-hover:scale-105 transition-transform">{oth.emoji}</span>
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold text-text group-hover:text-indigo-400 transition-colors">{oth.name}</p>
                        <p className="text-[9px] text-text-mute truncate leading-tight mt-0.5">{oth.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Main Dashboard Layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* ── Leveling Curve Widget (Left) ── */}
          <div className="bg-surface/30 border border-line rounded-3xl p-6 shadow-lg backdrop-blur-xl flex flex-col justify-between gap-6">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-text-mute uppercase tracking-widest">Leveling Curve</h3>
                <span className="text-xs font-black text-indigo-400 uppercase tracking-widest">Lv {levelInfo.level} → Lv {levelInfo.level + 1}</span>
              </div>
              <p className="text-xs text-text-mute font-bold font-mono mt-1">
                {totalXP.toLocaleString()} / {nextLevelTotalXP.toLocaleString()} XP <span className="text-indigo-400">({xpToGo.toLocaleString()} XP to go)</span>
              </p>
            </div>

            {/* Custom ascending bar chart representing levels 1 to 15 */}
            <div className="h-32 flex items-end justify-between gap-1.5 px-2 relative">
              {Array.from({ length: 15 }, (_, i) => {
                const lvlNum = i + 1;
                const isCurrent = lvlNum === levelInfo.level;
                const isUnlocked = lvlNum < levelInfo.level;
                const isLocked = lvlNum > levelInfo.level;
                
                // Calculate height scaling to form a curve
                const heightPercent = Math.max(12, Math.round(((i + 1) / 15) * 100));
                
                let colorClass = "bg-white/5 border-white/5";
                if (isCurrent) {
                  colorClass = "bg-gradient-to-t from-amber-500 to-yellow-400 border-yellow-400 shadow-[0_0_12px_rgba(245,158,11,0.3)] ring-1 ring-yellow-300";
                } else if (isUnlocked) {
                  colorClass = "bg-indigo-500/20 border-indigo-500/30";
                }

                return (
                  <div
                    key={lvlNum}
                    className="flex-1 flex flex-col items-center justify-end group cursor-default relative"
                    style={{ height: "100%" }}
                  >
                    {/* Tooltip on hover */}
                    <div className="absolute bottom-full mb-1 bg-surface border border-line text-[8px] font-black px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20">
                      Lv {lvlNum} {isCurrent ? "(Now)" : isLocked ? "(Locked)" : "(Past)"}
                    </div>

                    <div
                      className={`w-full rounded-t-sm border-t border-x transition-all duration-700 ${colorClass}`}
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>
                );
              })}
              
              {/* Highlight Marker Label */}
              <div
                className="absolute bottom-0 text-[8px] font-black text-yellow-400 uppercase tracking-widest text-center"
                style={{
                  left: `${((levelInfo.level - 1) / 15) * 100}%`,
                  width: `${(1 / 15) * 100}%`,
                  transform: "translateY(12px)"
                }}
              >
                Now
              </div>
            </div>

            {/* Metric Info Boxes */}
            <div className="grid grid-cols-3 gap-3 pt-6 border-t border-line">
              <div className="bg-white/5 border border-line rounded-2xl p-3 text-center">
                <p className="text-[9px] font-black text-text-mute uppercase tracking-widest">XP / Day Avg</p>
                <p className="text-base font-black text-text mt-1">{avgXPPerDay}</p>
              </div>
              <div className="bg-white/5 border border-line rounded-2xl p-3 text-center">
                <p className="text-[9px] font-black text-text-mute uppercase tracking-widest">Days to Lv {levelInfo.level + 1}</p>
                <p className="text-base font-black text-text mt-1">~{daysToNextLevel}</p>
              </div>
              <div className="bg-white/5 border border-line rounded-2xl p-3 text-center">
                <p className="text-[9px] font-black text-text-mute uppercase tracking-widest">Perk at Lv {levelInfo.level + 1}</p>
                <p className="text-xs font-black text-indigo-400 truncate mt-1.5 uppercase tracking-wide">{nextLevelPerk}</p>
              </div>
            </div>
          </div>

          {/* ── Quest & Bounty Board (Right) ── */}
          <div className="bg-surface/30 border border-line rounded-3xl p-6 shadow-lg backdrop-blur-xl flex flex-col justify-between gap-6">
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-black text-text-mute uppercase tracking-widest">Quest & Bounty Board</h3>
                  <p className="text-[10px] text-text-mute mt-0.5">Daily, weekly & epic missions</p>
                </div>
                {/* Tabs Filter */}
                <div className="flex bg-white/5 border border-line p-0.5 rounded-xl">
                  {(["daily", "weekly", "epic"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setQuestTab(t)}
                      className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg transition-all ${
                        questTab === t
                          ? "bg-indigo-sleek text-white shadow-md shadow-indigo-500/10 border border-indigo-500/20"
                          : "text-text-mute hover:text-text"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Active Quest Cards List */}
            <div className="space-y-3 flex-1">
              {questTab === "epic" ? (
                <div className="space-y-6">
                  {/* Epic Quest Hero Card */}
                  <div className="relative overflow-hidden bg-gradient-to-tr from-surface/80 to-surface/40 border border-amber-500/25 rounded-3xl p-6 shadow-lg shadow-amber-500/5">
                    {/* Glowing Accent */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
                    
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border bg-amber-500/10 text-amber-400 border-amber-500/20">
                            Epic Quest
                          </span>
                          <span className="text-[10px] font-black text-indigo-400 bg-indigo-500/5 px-2 py-0.5 rounded-full border border-indigo-500/10">
                            +2700 XP
                          </span>
                        </div>
                        
                        <h2 className="text-xl font-display font-bold text-text leading-tight">
                          {profile?.primaryGoal || "Tentukan Goal Makro Belajar Kamu"}
                        </h2>
                        
                        <p className="text-xs text-text-dim max-w-lg">
                          Misi utama jangka panjangmu. Selesaikan action items di area fokus belajarmu untuk menyelesaikan quest ini.
                        </p>
                      </div>

                      {/* Circular or big percentage indicator */}
                      <div className="flex flex-col items-center justify-center shrink-0 w-24 h-24 rounded-full bg-white/[0.02] border border-white/5 shadow-inner">
                        <span className="text-2xl font-display font-extrabold text-amber-400">
                          {epicQuestProgress}%
                        </span>
                        <span className="text-[8px] font-bold text-text-mute uppercase tracking-widest">
                          Selesai
                        </span>
                      </div>
                    </div>

                    {/* Overall Progress Bar */}
                    <div className="mt-6 space-y-1.5">
                      <div className="flex justify-between text-[10px] font-bold text-text-mute">
                        <span>Penyelesaian Rata-rata</span>
                        <span>{epicQuestProgress}%</span>
                      </div>
                      <div className="w-full bg-white/5 border border-line h-2 rounded-full overflow-hidden shadow-inner">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-750"
                          style={{ width: `${epicQuestProgress}%` }}
                        />
                      </div>
                    </div>

                    <div className="mt-5 flex justify-end">
                      <button
                        onClick={() => setShowOnboarding(true)}
                        className="text-[10px] font-black uppercase tracking-widest px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-text border border-line hover:border-amber-500/30 transition-all active:scale-95 flex items-center gap-1.5"
                      >
                        ✏️ Sesuaikan Epic Quest
                      </button>
                    </div>
                  </div>

                  {/* Focus Areas Milestones */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-black text-text-mute uppercase tracking-widest">
                      Milestones Sub-Skill ({profile?.focusAreas?.length || 0})
                    </h4>

                    {epicMilestones.length === 0 ? (
                      <div className="text-center py-6 border border-dashed border-line rounded-2xl text-xs text-text-mute">
                        Belum ada area fokus yang ditentukan.
                      </div>
                    ) : (
                      epicMilestones.map((milestone) => (
                        <div
                          key={milestone.skillName}
                          className="border border-line/80 bg-surface/20 hover:bg-white/5 transition-all rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 group"
                        >
                          <div className="min-w-0 flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-wide">
                                Sub-Skill Focus
                              </span>
                            </div>
                            
                            <p className="text-sm font-extrabold text-text leading-snug group-hover:text-indigo-400 transition-colors truncate">
                              {milestone.skillName}
                            </p>
                            
                            {/* Milestone Progress Bar */}
                            <div className="flex items-center gap-3">
                              <div className="w-28 bg-white/5 border border-line h-1.5 rounded-full overflow-hidden shrink-0 shadow-inner">
                                <div
                                  className="h-full rounded-full bg-amber-500 transition-all duration-700"
                                  style={{ width: `${milestone.percent}%` }}
                                />
                              </div>
                              <span className="text-[10px] font-bold text-text-mute font-mono">
                                {milestone.completed}/{milestone.total} Action Items ({milestone.percent}%)
                              </span>
                            </div>
                          </div>

                          <button
                            onClick={() => window.location.href = "/dashboard/actions"}
                            className="shrink-0 text-[10px] font-black uppercase tracking-widest px-4 py-2.5 rounded-xl border border-line hover:border-amber-500/35 bg-white/5 hover:bg-white/10 text-text transition-all active:scale-95 flex items-center justify-center gap-1.5"
                          >
                            Kelola Actions
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ) : (
                quests[questTab].map((q) => {
                  const pct = Math.round((q.current / q.target) * 100) || 0;
                  const isComplete = q.current >= q.target;
                  
                  let labelColor = "bg-sky-500/10 text-sky-400 border-sky-500/20";
                  if (questTab === "weekly") labelColor = "bg-violet-500/10 text-violet-400 border-violet-500/20";

                  return (
                    <div
                      key={q.id}
                      className="border border-line/80 bg-surface/20 hover:bg-white/5 transition-all rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 group"
                    >
                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border ${labelColor}`}>
                            {questTab}
                          </span>
                          <span className="text-[10px] font-black text-indigo-400 bg-indigo-500/5 px-2 py-0.5 rounded-full border border-indigo-500/10">
                            {q.reward}
                          </span>
                        </div>
                        <p className="text-sm font-extrabold text-text leading-snug group-hover:text-indigo-400 transition-colors truncate">{q.title}</p>
                        
                        {/* Progress representation */}
                        <div className="flex items-center gap-3">
                          <div className="w-24 bg-white/5 border border-line h-1.5 rounded-full overflow-hidden shrink-0 shadow-inner">
                            <div
                              className={`h-full rounded-full transition-all duration-700 ${
                                questTab === "daily" ? "bg-sky-500" : "bg-violet-500"
                              }`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-bold text-text-mute font-mono">{q.current}/{q.target} ({pct}%)</span>
                        </div>
                      </div>

                      <button
                        disabled={isComplete}
                        className={`shrink-0 text-[10px] font-black uppercase tracking-widest px-4 py-2.5 rounded-xl border transition-all active:scale-95 flex items-center justify-center gap-1.5 ${
                          isComplete
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 cursor-default"
                            : "bg-white/5 hover:bg-white/10 text-text border-line hover:border-indigo-500/30 cursor-pointer"
                        }`}
                      >
                        {isComplete ? "✓ Selesai" : "Open"}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* ── Trophy Room Widget (Bottom) ── */}
        <div className="bg-surface/30 border border-line rounded-3xl p-6 shadow-lg backdrop-blur-xl space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-xs font-black text-text-mute uppercase tracking-widest">Trophy Room</h3>
              <p className="text-[10px] text-text-mute mt-0.5">Pencapaian unggulan petualangan belajar Anda</p>
            </div>
            {/* Filter categories tabs */}
            <div className="flex bg-white/5 border border-line p-0.5 rounded-xl flex-wrap">
              {(["all", "platinum", "gold", "silver", "bronze"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTrophyTab(t)}
                  className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1.5 rounded-lg transition-all ${
                    trophyTab === t
                      ? "bg-indigo-sleek text-white shadow-md border border-indigo-500/20"
                      : "text-text-mute hover:text-text"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Grid list of trophies */}
          {filteredMilestones.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredMilestones.map((ms) => {
                const borderColors = {
                  bronze: "border-amber-700/20 bg-amber-500/5 text-amber-400 shadow-sm shadow-amber-500/5",
                  silver: "border-slate-500/20 bg-slate-500/5 text-slate-300 shadow-sm shadow-slate-500/5",
                  gold: "border-yellow-500/20 bg-yellow-500/5 text-yellow-400 shadow-sm shadow-yellow-500/5",
                  platinum: "border-sky-500/20 bg-sky-500/5 text-sky-400 shadow-md shadow-sky-500/10",
                }[ms.tier];

                return (
                  <div
                    key={ms.id}
                    className={`border rounded-2xl p-4 flex flex-col items-center text-center transition-all duration-300 hover:scale-[1.02] relative group ${
                      ms.earned
                        ? `${borderColors} opacity-100`
                        : "border-line bg-white/5 text-text-mute opacity-30 grayscale hover:opacity-50"
                    }`}
                  >
                    {/* Tier badge marker at top right */}
                    <span className="absolute top-2 right-2 text-[7px] font-black uppercase tracking-widest opacity-60">
                      {ms.tier}
                    </span>

                    {/* Emoji glow effect */}
                    <div className="w-12 h-12 rounded-full bg-surface/50 border border-line flex items-center justify-center text-2xl mb-2.5 relative group-hover:scale-110 transition-transform">
                      {ms.earned && (
                        <div className="absolute inset-0 bg-indigo-500/10 rounded-full blur-md animate-pulse" />
                      )}
                      <span className="relative z-10">{ms.emoji}</span>
                    </div>

                    <p className="text-xs font-black tracking-tight leading-snug text-text">{ms.label}</p>
                    <p className="text-[10px] text-text-mute mt-1.5 leading-snug line-clamp-2 px-1">{ms.description}</p>
                    
                    {/* Locked/unlocked tag */}
                    <div className="mt-3">
                      <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        ms.earned ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-white/5 text-text-mute border border-line"
                      }`}>
                        {ms.earned ? "Unlocked" : "Locked"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 border border-dashed border-line bg-white/5 rounded-2xl">
              <span className="text-4xl">🏅</span>
              <p className="text-xs font-bold text-text mt-3">Tidak ada trofi</p>
              <p className="text-[10px] text-text-mute mt-1">Belum ada trofi berkategori '{trophyTab}' yang ditemukan.</p>
            </div>
          )}
        </div>

        {/* ── Lower Area: Danger Zone / Break in Tavern ── */}
        <div className="pt-4 border-t border-line">
          <div className="bg-rose-500/10 border border-rose-500/20 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 backdrop-blur-xl">
            <div>
              <h3 className="text-sm font-bold text-text">Istirahat di Kedai (Keluar Akun)</h3>
              <p className="text-xs text-text-mute mt-1">Keluar dari sesi aktif Anda di perangkat ini. Semua data progres petualangan belajar Anda disimpan dengan aman.</p>
            </div>
            <button
              onClick={handleSignOut}
              disabled={isSignOutLoading}
              className="w-full sm:w-auto px-6 py-2.5 bg-rose-500/10 border border-rose-500/30 hover:bg-rose-600 text-rose-400 hover:text-white font-extrabold text-xs rounded-xl transition-all disabled:opacity-50 cursor-pointer shadow-sm"
            >
              {isSignOutLoading ? "Keluar..." : "Keluar Sesi →"}
            </button>
          </div>
        </div>

        <div className="text-center opacity-40">
          <p className="text-[9px] font-black text-text-mute uppercase tracking-widest">SkillFlow v0.5.0 — Personal Learning Cockpit</p>
        </div>
      </div>
    </>
  );
}
