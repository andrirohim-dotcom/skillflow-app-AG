"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/contexts/AuthContext";
import { useWorkspace } from "@/lib/contexts/WorkspaceContext";
import { getWsSessions, getWsSkillProgress, getWsInsights, updateWsSkillProgress } from "@/lib/storageV2";
import { getCurrentStreak, getLongestStreak } from "@/lib/utils/analytics";
import { computeTotalXP, getLevelFromXP, getLearnerArchetype, getMilestones } from "@/lib/utils/gamification";
import type { LearningSession, SkillProgress, KeyInsight, ActionItem } from "@/lib/types";
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
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isSignOutLoading, setIsSignOutLoading] = useState(false);
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);

  const isLoading = authLoading || wsLoading;

  useEffect(() => {
    if (!user || !currentWorkspace) return;
    (async () => {
      const [sess, sp, ins] = await Promise.all([
        getWsSessions(currentWorkspace.id, user.id),
        getWsSkillProgress(currentWorkspace.id, user.id),
        getWsInsights(currentWorkspace.id, user.id)
      ]);
      setSessions(sess);
      setSkillProgress(sp);
      setInsights(ins);
    })();
  }, [user, currentWorkspace]);

  const currentStreak = useMemo(() => getCurrentStreak(sessions), [sessions]);
  const longestStreak = useMemo(() => getLongestStreak(sessions), [sessions]);

  const totalXP = useMemo(() => computeTotalXP(sessions, insights, skillProgress), [sessions, insights, skillProgress]);
  const levelInfo = useMemo(() => getLevelFromXP(totalXP), [totalXP]);
  const archetype = useMemo(() => getLearnerArchetype(profile?.focusAreas || [], sessions.length), [profile?.focusAreas, sessions]);
  const milestones = useMemo(() => getMilestones(sessions, insights, skillProgress, currentStreak), [sessions, insights, skillProgress, currentStreak]);

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
        <div className="h-12 bg-gray-100 rounded-2xl w-48" />
        <div className="h-64 bg-gray-900 rounded-3xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-40 bg-gray-100 rounded-2xl" />
          <div className="h-40 bg-gray-100 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center">
        <span className="text-4xl mb-4 block">⚠️</span>
        <h2 className="text-lg font-bold text-gray-800">Profil tidak ditemukan</h2>
        <p className="text-sm text-gray-400 mt-1 mb-6">
          Gagal memuat data profil. Silakan coba muat ulang halaman.
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
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

      <div className="max-w-3xl mx-auto space-y-8 pb-12">
        {/* ── RPG Character Sheet Header ── */}
        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden backdrop-blur-md">
          {/* Ambient light effect */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-stretch justify-between gap-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-sky-400 to-indigo-600 flex items-center justify-center text-5xl shadow-glow-sky border-4 border-gray-800 shrink-0">
                {profile.avatar}
              </div>
              <div className="text-center md:text-left flex flex-col justify-center">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                  <h1 className="text-3xl font-black text-white tracking-tight leading-none">{profile.name}</h1>
                  <span className="bg-sky-500/10 text-sky-400 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest border border-sky-500/20">
                    {profile.userRole || "Learner"}
                  </span>
                  <span className={`bg-gradient-to-r ${archetype.badgeColor} text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest flex items-center gap-1 shadow-sm`}>
                    <span>{archetype.emoji}</span>
                    <span>{archetype.name}</span>
                  </span>
                </div>
                <p className="text-sm text-gray-400 mt-2 font-medium">{profile.email}</p>
                <p className="text-xs text-gray-500 mt-1 max-w-md italic">{archetype.description}</p>
              </div>
            </div>

            <div className="flex flex-col justify-between items-center md:items-end w-full md:w-auto shrink-0">
              <button
                onClick={() => setShowOnboarding(true)}
                className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-gray-600 text-gray-300 hover:text-white text-xs font-extrabold px-4 py-2.5 rounded-xl shadow-sm transition-all active:scale-95 w-full md:w-auto justify-center cursor-pointer"
              >
                <span>✨</span> Sesuaikan Karakter
              </button>
              
              {/* Level Ring Representation */}
              <div className="mt-4 md:mt-0 flex items-center gap-3 bg-gray-950/60 px-4 py-2 rounded-2xl border border-gray-800">
                <span className="text-2xl font-black text-sky-400">Lv.{levelInfo.level}</span>
                <div className="w-px h-6 bg-gray-800" />
                <span className="text-[10px] font-black tracking-widest uppercase text-gray-400">{levelInfo.title}</span>
              </div>
            </div>
          </div>

          {/* XP Progress Bar */}
          <div className="mt-6 pt-6 border-t border-gray-800/80">
            <div className="flex items-center justify-between text-xs text-gray-400 font-bold mb-2">
              <span className="uppercase tracking-widest text-[10px]">Progress Pengalaman (XP)</span>
              <span className="font-mono text-sky-400">{levelInfo.currentLevelXP} / {levelInfo.nextLevelXP} XP</span>
            </div>
            <div className="w-full bg-gray-950 h-3 rounded-full overflow-hidden border border-gray-800 shadow-inner">
              <div 
                className="bg-gradient-to-r from-sky-400 via-sky-500 to-indigo-600 h-full rounded-full transition-all duration-1000 shadow-glow-sky"
                style={{ width: `${levelInfo.progressPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-[9px] text-gray-500 font-medium mt-1">
              <span>Level {levelInfo.level}</span>
              <span>Level {levelInfo.level + 1}</span>
            </div>
          </div>
        </div>

        {/* ── Core Layout Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* ── Left Column: Attributes & Trophy Showcase ── */}
          <div className="space-y-8">
            <StatsRadar 
              focusAreas={profile.focusAreas}
              sessions={sessions}
              insights={insights}
              skillProgress={skillProgress}
              currentStreak={currentStreak}
              longestStreak={longestStreak}
            />

            {/* Account Stats Detail */}
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Statistik Momentum</h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-black text-orange-500 leading-none">🔥 {currentStreak}</p>
                  <p className="text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-wide">Streak Saat Ini</p>
                </div>
                <div className="w-px h-10 bg-gray-100" />
                <div>
                  <p className="text-3xl font-black text-violet-500 leading-none">🏆 {longestStreak}</p>
                  <p className="text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-wide">Terpanjang</p>
                </div>
                <div className="w-px h-10 bg-gray-100" />
                <div>
                  <p className="text-3xl font-black text-sky-500 leading-none">⚡ {totalXP}</p>
                  <p className="text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-wide">Total XP</p>
                </div>
              </div>
            </div>

            {/* Trophy Showcase */}
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Trophy Room (Pencapaian)</h3>
              <div className="grid grid-cols-2 gap-4">
                {milestones.map((ms) => {
                  const borderColors = {
                    bronze: "border-amber-700/30 bg-amber-50/10 text-amber-800",
                    silver: "border-slate-300 bg-slate-50/20 text-slate-700",
                    gold: "border-yellow-400/50 bg-yellow-50/20 text-yellow-800",
                    platinum: "border-sky-400 bg-sky-50/15 text-sky-900 shadow-sm",
                  }[ms.tier];

                  return (
                    <div 
                      key={ms.id} 
                      className={`border rounded-2xl p-3 flex flex-col items-center text-center transition-all ${
                        ms.earned 
                          ? `${borderColors} opacity-100 scale-100` 
                          : "border-gray-100 bg-gray-50/30 text-gray-300 opacity-40 grayscale"
                      }`}
                    >
                      <span className="text-2xl mb-1">{ms.emoji}</span>
                      <p className="text-xs font-black tracking-tight leading-snug">{ms.label}</p>
                      <p className="text-[8px] text-gray-400 mt-1 line-clamp-2 leading-tight">{ms.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── Right Column: Interactive Skill Tree & Bounty Board ── */}
          <div className="space-y-8">
            <InteractiveSkillTree 
              targetSkills={profile.focusAreas}
              skillProgress={skillProgress}
              onToggleActionItem={handleToggleActionItem}
            />

            {/* Bounty Board (Quest Log) */}
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Papan Misi Aktif (Bounty Board)</h3>
              {activeBounties.length > 0 ? (
                <div className="space-y-3">
                  {activeBounties.slice(0, 4).map((bounty) => (
                    <div 
                      key={bounty.id} 
                      className="border border-amber-100 bg-amber-50/20 rounded-2xl p-3 flex items-start justify-between gap-3 group transition-all hover:bg-amber-50/40"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                          <span className="text-[8px] font-black uppercase tracking-wider text-amber-700 bg-amber-100/60 px-1.5 py-0.5 rounded">
                            {bounty.skillName}
                          </span>
                        </div>
                        <p className="text-xs text-gray-700 font-medium mt-1.5 leading-snug">{bounty.text}</p>
                      </div>
                      
                      <button
                        onClick={() => handleToggleActionItem(bounty.progressId, bounty.id)}
                        disabled={updatingItemId === bounty.id}
                        className="shrink-0 bg-white hover:bg-amber-500 border border-amber-200 text-amber-600 hover:text-white text-[10px] font-extrabold px-3 py-1.5 rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer disabled:opacity-50"
                      >
                        Selesaikan
                      </button>
                    </div>
                  ))}
                  {activeBounties.length > 4 && (
                    <p className="text-[10px] text-center text-gray-400 font-bold uppercase tracking-wider pt-2">
                      + {activeBounties.length - 4} misi aktif lainnya di tab pohon skill
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center py-6 border border-dashed border-gray-200 rounded-2xl">
                  <span className="text-3xl">🕊️</span>
                  <p className="text-xs font-bold text-gray-700 mt-2">Semua Misi Selesai!</p>
                  <p className="text-[10px] text-gray-400 mt-1 max-w-xs mx-auto">
                    Bagus! Tidak ada bounty aktif tersisa. Tambahkan skill baru atau baca sumber belajar untuk memicu petualangan baru.
                  </p>
                </div>
              )}
            </div>

            {/* Learning Identity */}
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Identitas Petualangan</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Tujuan Utama Kampanye</p>
                  <p className="text-sm font-extrabold text-gray-800 mt-0.5">{profile.primaryGoal || "Belum ditentukan"}</p>
                </div>
                <div>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Mode Visualisasi</p>
                  <p className="text-sm font-extrabold text-gray-800 capitalize mt-0.5">{profile.gamificationMode} Mode</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="pt-4 border-t border-gray-100">
          <div className="bg-rose-50/20 border border-rose-100 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Istirahat di Kedai (Selesaikan Sesi)</h3>
              <p className="text-xs text-gray-500 mt-1">Keluar dari akunmu di perangkat ini. Tenang, progres petualanganmu tetap aman.</p>
            </div>
            <button
              onClick={handleSignOut}
              disabled={isSignOutLoading}
              className="w-full md:w-auto px-6 py-2.5 bg-white border border-rose-200 hover:bg-rose-600 text-rose-600 hover:text-white font-extrabold text-xs rounded-xl transition-all disabled:opacity-50 cursor-pointer shadow-sm"
            >
              {isSignOutLoading ? "Keluar..." : "Keluar Akun →"}
            </button>
          </div>
        </div>

        <div className="text-center opacity-30">
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">SkillFlow v0.5.0 — Personal Learning Cockpit</p>
        </div>
      </div>
    </>
  );
}
