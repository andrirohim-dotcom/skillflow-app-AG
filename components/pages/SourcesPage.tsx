"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getWsSources, getWsSessions, getWsSkillProgress, getWsInsights, deleteWsSource } from "@/lib/storageV2";
import { useWorkspace } from "@/lib/contexts/WorkspaceContext";
import { useAuth } from "@/lib/contexts/AuthContext";
import { sortSources, type SortKey } from "@/lib/utils/analytics";
import { sortByRelevance, scoreSourceRelevance } from "@/lib/utils/recommendations";
import { getSourceProgress } from "@/lib/utils/sourceProgress";
import { computeTotalXP, getLevelFromXP } from "@/lib/utils/gamification";
import {
  SOURCE_TYPE_ICONS,
  SOURCE_TYPE_LABELS,
  SOURCE_STATUS_COLORS,
  SOURCE_STATUS_LABELS,
  DIFFICULTY_LABELS,
  DIFFICULTY_COLORS,
} from "@/lib/constants";
import type {
  LearningSource,
  LearningSession,
  SkillProgress,
  KeyInsight,
  SourceStatus,
  SourceType,
  DifficultyLevel,
} from "@/lib/types";
import Modal from "@/components/ui/Modal";
import AddSourceForm from "@/components/sources/AddSourceForm";
import CatalogPicker from "@/components/sources/CatalogPicker";
import type { SourcePrefill } from "@/lib/types";

// ─── Card Theme Helper ────────────────────────────────────────────────────────

function getCardTheme(source: LearningSource, index: number) {
  const themes = [
    // Blue (Card 1)
    {
      bgGradient: "from-blue-600/60 to-blue-500/40",
      accentBar: "bg-blue-400",
      accentText: "text-blue-400",
      accentBg: "bg-blue-400/20",
      progressFill: "bg-blue-400",
      stripeColor: "rgba(59, 130, 246, 0.15)",
    },
    // Gold/Amber (Card 2)
    {
      bgGradient: "from-amber-600/60 to-amber-500/40",
      accentBar: "bg-amber-400",
      accentText: "text-amber-400",
      accentBg: "bg-amber-400/20",
      progressFill: "bg-amber-400",
      stripeColor: "rgba(245, 158, 11, 0.15)",
    },
    // Teal/Emerald (Card 3)
    {
      bgGradient: "from-teal-600/60 to-teal-500/40",
      accentBar: "bg-teal-400",
      accentText: "text-teal-400",
      accentBg: "bg-teal-400/20",
      progressFill: "bg-teal-400",
      stripeColor: "rgba(20, 184, 166, 0.15)",
    },
    // Violet/Pink/Purple (Card 4)
    {
      bgGradient: "from-pink-600/60 to-pink-500/40",
      accentBar: "bg-pink-400",
      accentText: "text-pink-400",
      accentBg: "bg-pink-400/20",
      progressFill: "bg-pink-400",
      stripeColor: "rgba(236, 72, 153, 0.15)",
    },
    // Dark Blue (Card 5)
    {
      bgGradient: "from-indigo-600/60 to-indigo-500/40",
      accentBar: "bg-indigo-400",
      accentText: "text-indigo-400",
      accentBg: "bg-indigo-400/20",
      progressFill: "bg-indigo-400",
      stripeColor: "rgba(99, 102, 241, 0.15)",
    },
    // Orange/Red (Card 6)
    {
      bgGradient: "from-orange-600/60 to-orange-500/40",
      accentBar: "bg-orange-400",
      accentText: "text-orange-400",
      accentBg: "bg-orange-400/20",
      progressFill: "bg-orange-400",
      stripeColor: "rgba(249, 115, 22, 0.15)",
    },
    // Lime/Green (Card 7)
    {
      bgGradient: "from-lime-600/60 to-lime-500/40",
      accentBar: "bg-lime-400",
      accentText: "text-lime-400",
      accentBg: "bg-lime-400/20",
      progressFill: "bg-lime-400",
      stripeColor: "rgba(132, 204, 22, 0.15)",
    },
    // Purple (Card 8)
    {
      bgGradient: "from-purple-600/60 to-purple-500/40",
      accentBar: "bg-purple-400",
      accentText: "text-purple-400",
      accentBg: "bg-purple-400/20",
      progressFill: "bg-purple-400",
      stripeColor: "rgba(168, 85, 247, 0.15)",
    },
  ];
  return themes[index % themes.length];
}

// ─── Source Card Component ──────────────────────────────────────────────────

function SourceCard({
  source,
  skills,
  sessions,
  matchReason,
  score,
  onDelete,
  index,
}: {
  source: LearningSource;
  skills: SkillProgress[];
  sessions: LearningSession[];
  matchReason?: string;
  score?: number;
  onDelete?: () => void;
  index: number;
}) {
  const stats = getSourceProgress(source);
  const theme = getCardTheme(source, index);
  
  // Progress status mapping matching screenshot levels
  let levelBadge = "Awareness";
  if (stats.pct >= 90) levelBadge = "Mastered";
  else if (stats.pct >= 60) levelBadge = "Applied";
  else if (stats.pct >= 30) levelBadge = "Understanding";
  
  const sessionCount = sessions.filter((s) => s.sourceId === source.id).length;
  const completedItems = skills.flatMap((sp) => sp.actionItems).filter((ai) => ai.completed).length;
  const totalItems = skills.flatMap((sp) => sp.actionItems).length;

  // Format progress text in English to match screenshot
  let progressText = "";
  if (source.progress.type === "book") {
    progressText = `Ch. ${stats.consumed} / ${stats.total}`;
  } else if (source.progress.type === "article") {
    progressText = `page ${stats.consumed} / ${stats.total}`;
  } else if (source.progress.type === "podcast" || source.progress.type === "youtube" || source.progress.type === "course") {
    if (stats.pct === 100) {
      progressText = "watched";
    } else {
      const formatTime = (mins: number) => {
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        return h > 0 ? `${h}h ${m}m` : `${m}m`;
      };
      progressText = `${formatTime(stats.consumed)} / ${formatTime(stats.total)}`;
    }
  } else {
    progressText = `${stats.consumed} / ${stats.total} ${stats.unitLabel}`;
  }

  // Type labels in English to match the screenshot
  const typeLabelEng = {
    book: "Book",
    youtube: "Video",
    article: "Article",
    podcast: "Podcast",
    course: "Course",
  }[source.progress.type] || "Source";

  // Type icon mapping for pill badge
  const typeIconEng = {
    book: "📘",
    youtube: "📺",
    article: "📄",
    podcast: "🎙️",
    course: "🎓",
  }[source.progress.type] || "📌";

  return (
    <div className="bg-surface/30 border border-line rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl hover:border-indigo-500/35 transition-all duration-300 group flex flex-col backdrop-blur-md">
      {/* ── Covered Card Header ── */}
      <div 
        className={`h-40 bg-gradient-to-br ${theme.bgGradient} relative p-4 flex flex-col justify-between select-none overflow-hidden`}
      >
        {/* Diagonal striped texture overlay */}
        <div 
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{ 
            backgroundImage: `repeating-linear-gradient(45deg, ${theme.stripeColor}, ${theme.stripeColor} 10px, transparent 10px, transparent 20px)` 
          }}
        />

        {/* Top Row */}
        <div className="relative z-10 flex items-center justify-between">
          {/* Card checkbox-style icon */}
          <div className="bg-black/30 backdrop-blur-md w-7 h-7 rounded-lg border border-white/10 flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-white/80" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2" />
            </svg>
          </div>

          {/* Type Badge */}
          <div className="bg-black/30 backdrop-blur-md text-[10px] font-black text-white/90 px-2.5 py-1 rounded-full uppercase tracking-wider border border-white/10 flex items-center gap-1">
            <span>{typeIconEng}</span>
            <span>{typeLabelEng}</span>
          </div>
        </div>

        {/* Bottom Area */}
        <div className="relative z-10 flex items-end justify-between mt-auto">
          <div className="flex flex-col pr-12 min-w-0">
            <span className="text-[9px] font-black tracking-widest text-white/50 uppercase">
              {typeLabelEng}
            </span>
            <h4 className="text-sm font-black text-white leading-tight tracking-tight mt-0.5 truncate">
              {source.title}
            </h4>
          </div>

          {/* Progress badge */}
          <span className="shrink-0 bg-black/40 backdrop-blur-md border border-white/10 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg text-white">
            {levelBadge}
          </span>
        </div>
      </div>

      {/* ── Card Body ── */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div className="mb-4">
          <h3 className="font-bold text-text text-sm leading-snug group-hover:text-indigo-400 transition-colors line-clamp-1">
            {source.title}
          </h3>
          <p className="text-xs text-text-mute mt-0.5">
            {source.creatorName}
          </p>
        </div>

        {/* Progress bar and values */}
        <div className="mb-4">
          <div className="flex justify-between items-center text-[10px] mb-1 font-semibold">
            <span className="text-text-mute">{progressText}</span>
            <span className="font-black text-text-dim">{stats.pct}%</span>
          </div>
          <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden border border-white/5">
            <div className={`h-1.5 rounded-full transition-all duration-500 ${theme.progressFill}`} style={{ width: `${stats.pct}%` }} />
          </div>
        </div>

        {/* Tags */}
        {source.topicTags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {source.topicTags.slice(0, 2).map((tag) => (
              <span key={tag} className="text-[10px] font-semibold bg-white/5 border border-line text-text-dim px-2 py-0.5 rounded-md">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Match chip (Untuk Kamu tab) */}
        {matchReason && matchReason !== "" && (
          <div className="mb-4">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-violet-500/10 text-violet-400 border border-violet-500/20">
              ✨ {matchReason}
            </span>
            {score !== undefined && (
              <span className="ml-1 text-[10px] font-black text-violet-400">{score}% cocok</span>
            )}
          </div>
        )}

        {/* Footer controls */}
        <div className="flex items-center justify-between pt-3 border-t border-line mt-auto">
          <div className="flex items-center gap-3 text-[10px] text-text-mute font-bold">
            <span>⏱️ {sessionCount} sesi</span>
            {totalItems > 0 && <span>✅ {completedItems}/{totalItems}</span>}
          </div>
          <div className="flex items-center gap-3">
            {onDelete && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  onDelete();
                }}
                className="text-text-mute hover:text-rose-400 transition-colors p-1 cursor-pointer"
                title="Hapus sumber"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
            <a
              href={`/dashboard/item/${source.id}`}
              className={`text-[10px] font-black ${theme.accentText} hover:text-indigo-400 hover:underline transition-colors`}
            >
              Buka Detail →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Empty State Component ──────────────────────────────────────────────────

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-20 text-center bg-surface/30 border border-dashed border-line rounded-2xl backdrop-blur-md animate-slide-up">
      <div className="text-6xl mb-4">📚</div>
      <h3 className="text-lg font-bold text-text">Belum ada sumber belajar</h3>
      <p className="text-sm text-text-mute mt-1 mb-6 max-w-xs">
        Tambahkan buku, video, podcast, atau kursus pertama Anda untuk mulai belajar secara terstruktur.
      </p>
      <button
        onClick={onAdd}
        className="bg-indigo-sleek hover:bg-indigo-2 text-white text-sm font-semibold px-6 py-2.5 rounded-xl border border-indigo-500/30 transition-all hover:shadow-lg active:scale-95 cursor-pointer"
      >
        + Tambah Sumber Pertama
      </button>
    </div>
  );
}

// ─── Page Component ─────────────────────────────────────────────────────────

export default function SourcesPage() {
  const { currentUser: user, currentWorkspace: workspace } = useWorkspace();
  const { profile } = useAuth();
  const [sources, setSources] = useState<LearningSource[]>([]);
  const [sessions, setSessions] = useState<LearningSession[]>([]);
  const [skills, setSkills] = useState<SkillProgress[]>([]);
  const [insights, setInsights] = useState<KeyInsight[]>([]);
  const [mounted, setMounted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalTab, setModalTab] = useState<"catalog" | "manual">("catalog");
  const [prefill, setPrefill] = useState<SourcePrefill | undefined>(undefined);

  const [typeFilter, setTypeFilter] = useState<SourceType | "all" | "recommended">("all");
  const [statusFilter, setStatusFilter] = useState<SourceStatus | "all">("all");
  const [diffFilter, setDiffFilter] = useState<DifficultyLevel | "all">("all");
  const [sortKey, setSortKey] = useState<SortKey>("newest");
  const [searchQuery, setSearchQuery] = useState("");

  const load = useCallback(async () => {
    if (!user || !workspace) return;
    const [src, sess, sp, ins] = await Promise.all([
      getWsSources(workspace.id, user.id, "all"),
      getWsSessions(workspace.id, user.id),
      getWsSkillProgress(workspace.id, user.id),
      getWsInsights(workspace.id, user.id)
    ]);
    setSources(src);
    setSessions(sess);
    setSkills(sp);
    setInsights(ins);
  }, [user, workspace]);

  const handleDelete = useCallback(async (id: string, title: string) => {
    if (!workspace || !user) return;
    if (window.confirm(`Apakah Anda yakin ingin menghapus "${title}"?\nAksi ini tidak dapat dibatalkan.`)) {
      await deleteWsSource(workspace.id, id);
      load();
    }
  }, [workspace, user, load]);

  useEffect(() => {
    load();
    setMounted(true);
  }, [load]);

  // Keyboard shortcut for search focus (⌘K or Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        document.getElementById("catalog-search-input")?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const totalXP = useMemo(() => computeTotalXP(sessions, insights, skills), [sessions, insights, skills]);
  const levelInfo = useMemo(() => getLevelFromXP(totalXP), [totalXP]);

  const userInitials = useMemo(() => {
    if (profile?.name) {
      return profile.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase();
    }
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return "AY";
  }, [profile, user]);

  const typeFilterCounts = useMemo(() => {
    return {
      all: sources.length,
      book: sources.filter((s) => s.progress.type === "book").length,
      podcast: sources.filter((s) => s.progress.type === "podcast").length,
      youtube: sources.filter((s) => s.progress.type === "youtube" || s.progress.type === "course").length,
      article: sources.filter((s) => s.progress.type === "article").length,
    };
  }, [sources]);

  const filtered = useMemo(() => {
    let r = sources;
    
    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      r = r.filter((s) => s.title.toLowerCase().includes(q) || s.creatorName.toLowerCase().includes(q));
    }

    // Type filter matching type selections
    if (typeFilter === "recommended") {
      r = sortByRelevance(r, profile?.focusAreas ?? []);
    } else if (typeFilter !== "all") {
      if (typeFilter === "youtube") {
        r = r.filter((s) => s.progress.type === "youtube" || s.progress.type === "course");
      } else {
        r = r.filter((s) => s.progress.type === typeFilter);
      }
    }

    // Status and difficulty filters
    if (statusFilter !== "all") r = r.filter((s) => s.status === statusFilter);
    if (diffFilter !== "all") r = r.filter((s) => s.difficultyLevel === diffFilter);

    // Sorting
    if (typeFilter === "recommended") {
      return r;
    }
    return sortSources(r, sortKey, sessions);
  }, [sources, searchQuery, typeFilter, statusFilter, diffFilter, sortKey, sessions, profile]);

  if (!mounted) return <Skeleton />;

  return (
    <>
      {showModal && (
        <Modal onClose={() => {
          setShowModal(false);
          setPrefill(undefined);
          setModalTab("catalog");
        }}>
          {/* Two-tab header */}
          <div className="flex border-b border-line -mx-6 -mt-4 mb-4 rounded-t-2xl overflow-hidden">
            <button
              onClick={() => setModalTab("catalog")}
              className={`flex-1 py-3 text-sm font-semibold transition-colors cursor-pointer ${
                modalTab === "catalog"
                  ? "bg-surface/50 text-indigo-400 border-b-2 border-indigo-500"
                  : "bg-white/5 text-text-dim hover:text-text hover:bg-white/10"
              }`}
            >
              📚 Pilih dari Katalog
            </button>
            <button
              onClick={() => setModalTab("manual")}
              className={`flex-1 py-3 text-sm font-semibold transition-colors cursor-pointer ${
                modalTab === "manual"
                  ? "bg-surface/50 text-indigo-400 border-b-2 border-indigo-500"
                  : "bg-white/5 text-text-dim hover:text-text hover:bg-white/10"
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
                load();
                setShowModal(false);
                setPrefill(undefined);
                setModalTab("catalog");
              }}
            />
          )}
        </Modal>
      )}

      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-black text-text tracking-tight">Learning Catalog</h1>
          <p className="text-sm text-text-mute mt-1">All knowledge sources, one library.</p>
        </div>

        {/* Dynamic XP/Level Badge & Controls in header */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 bg-surface/40 px-4 py-2 rounded-2xl border border-line backdrop-blur-md">
            {/* Avatar representation with overlay level */}
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-white/10 border border-line flex items-center justify-center font-black text-xs text-text-dim">
                {userInitials}
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center text-[9px] font-black text-black border border-surface shadow-sm">
                {levelInfo.level}
              </div>
            </div>
            
            {/* Level name & dynamic progress track */}
            <div className="flex flex-col">
              <div className="flex justify-between items-end gap-6 text-[9px] font-bold text-text-mute mb-1 uppercase tracking-wider">
                <span>LV {levelInfo.level} {levelInfo.title}</span>
                <span className="font-mono text-indigo-400">{levelInfo.currentLevelXP} / {levelInfo.nextLevelXP} XP</span>
              </div>
              <div className="w-36 bg-white/5 h-1.5 rounded-full overflow-hidden border border-white/5 shadow-inner">
                <div 
                  className="bg-gradient-to-r from-teal-400 to-cyan-500 h-full rounded-full transition-all duration-1000"
                  style={{ width: `${levelInfo.progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Action icon buttons */}
          <div className="flex items-center gap-2">
            <button 
              className="p-2.5 rounded-xl bg-surface/40 border border-line text-text-mute hover:text-text hover:bg-white/5 transition-all relative cursor-pointer"
              title="Notifikasi"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {/* Yellow indicator dot */}
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-500" />
            </button>
            <a 
              href="/dashboard/account"
              className="p-2.5 rounded-xl bg-surface/40 border border-line text-text-mute hover:text-text hover:bg-white/5 transition-all cursor-pointer"
              title="Pengaturan"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.3 0-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* ── Interactive Navigation, Filtering & Search ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        {/* Filter Pills group */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { label: "All", value: "all" as const, count: typeFilterCounts.all },
            { label: "Books", value: "book" as const, count: typeFilterCounts.book },
            { label: "Podcasts", value: "podcast" as const, count: typeFilterCounts.podcast },
            { label: "Videos", value: "youtube" as const, count: typeFilterCounts.youtube },
            { label: "Articles", value: "article" as const, count: typeFilterCounts.article },
          ].map((pill) => (
            <button
              key={pill.value}
              onClick={() => setTypeFilter(pill.value)}
              className={`text-xs font-bold px-4 py-2 rounded-xl border transition-all duration-200 cursor-pointer ${
                typeFilter === pill.value
                  ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/30 shadow-sm"
                  : "bg-white/5 text-text-dim border-line hover:border-indigo-500/30 hover:text-text hover:bg-white/10"
              }`}
            >
              {pill.label} <span className="text-[10px] opacity-60 ml-0.5">{pill.count}</span>
            </button>
          ))}
          <button
            onClick={() => setTypeFilter("recommended")}
            className={`text-xs font-bold px-4 py-2 rounded-xl border transition-all duration-200 cursor-pointer ${
              typeFilter === "recommended"
                ? "bg-violet-500/15 text-violet-400 border-violet-500/30 shadow-sm"
                : "bg-white/5 text-text-dim border-line hover:border-indigo-500/30 hover:text-indigo-2 hover:bg-white/10"
            }`}
          >
            ✨ Untuk Kamu
          </button>
        </div>

        {/* Search, Layout toggler, and add source button */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Search catalog */}
          <div className="relative flex items-center flex-1 lg:flex-initial">
            <svg className="w-4 h-4 text-text-mute absolute left-3 pointer-events-none" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              id="catalog-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Find in catalog..."
              className="bg-surface/50 border border-line rounded-xl pl-9 pr-10 py-2 text-xs text-text placeholder-text-mute focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/30 transition-all duration-200 w-full lg:w-48 focus:lg:w-60 cursor-text"
            />
            <kbd className="border border-line bg-surface rounded-md px-1.5 py-0.5 text-[9px] text-text-mute absolute right-2.5 font-mono pointer-events-none uppercase shadow-sm select-none">
              ⌘K
            </kbd>
          </div>

          {/* Grid/List View switcher representation */}
          <div className="bg-surface/50 border border-line rounded-xl p-1 flex items-center gap-0.5 shadow-sm">
            <button className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-inner cursor-pointer" title="Grid View">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M4 4h4v4H4V4zm6 0h4v4h-4V4zm6 0h4v4h-4V4zM4 10h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4zM4 16h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4z" />
              </svg>
            </button>
            <button className="p-1.5 rounded-lg text-text-mute hover:text-text hover:bg-white/5 transition-colors cursor-pointer" title="List View">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* Add Source button */}
          <button
            onClick={() => { setPrefill(undefined); setModalTab("catalog"); setShowModal(true); }}
            className="bg-indigo-sleek text-white text-xs font-bold px-4 py-2.5 rounded-xl border border-indigo-500/30 hover:bg-indigo-600 transition-all active:scale-95 shadow-lg shadow-indigo-500/15 cursor-pointer flex items-center gap-1.5 shrink-0"
          >
            <span>+ Add source</span>
          </button>
        </div>
      </div>

      {/* Secondary filters row (Status, Difficulty, Sort) */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <select 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value as SourceStatus | "all")}
          className="text-[11px] font-bold border border-line rounded-xl px-3 py-1.5 text-text-dim bg-surface/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/30 transition-all cursor-pointer shadow-sm"
        >
          <option value="all">Semua Status</option>
          <option value="in_progress">Sedang Belajar</option>
          <option value="not_started">Belum Dimulai</option>
          <option value="completed">Selesai</option>
          <option value="on_hold">Ditunda</option>
        </select>

        <select 
          value={diffFilter} 
          onChange={(e) => setDiffFilter(e.target.value as DifficultyLevel | "all")}
          className="text-[11px] font-bold border border-line rounded-xl px-3 py-1.5 text-text-dim bg-surface/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/30 transition-all cursor-pointer shadow-sm"
        >
          <option value="all">Semua Level</option>
          <option value="beginner">Pemula</option>
          <option value="intermediate">Menengah</option>
          <option value="advanced">Lanjutan</option>
        </select>

        <select 
          value={sortKey} 
          onChange={(e) => setSortKey(e.target.value as SortKey)}
          className="text-[11px] font-bold border border-line rounded-xl px-3 py-1.5 text-text-dim bg-surface/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/30 transition-all cursor-pointer shadow-sm"
        >
          <option value="newest">Terbaru</option>
          <option value="least_progress">Progres Terkecil</option>
          <option value="most_progress">Progres Terbesar</option>
          <option value="most_active">Paling Aktif</option>
        </select>

        <div className="flex-1" />
        
        <p className="text-[10px] text-text-mute font-bold uppercase tracking-wider">
          Menampilkan <span className="text-text-dim font-black">{filtered.length}</span> dari {sources.length} sumber
        </p>
      </div>

      {/* Onboarding hint for recommended tab */}
      {typeFilter === "recommended" && (
        <div className="mb-6 bg-violet-500/5 border border-violet-500/20 rounded-2xl p-5 text-center backdrop-blur-md">
          <p className="text-sm font-semibold text-violet-400 mb-1">💡 Personalisasi Rekomendasimu</p>
          <p className="text-xs text-violet-300/80">SkillFlow merekomendasikan sumber belajar berdasarkan fokus keahlian di tab Akun Karakter Anda.</p>
        </div>
      )}

      {/* Grid of Sources */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 animate-slide-up">
        {filtered.length === 0 ? (
          <EmptyState onAdd={() => setShowModal(true)} />
        ) : (
          filtered.map((source, index) => {
            const rel = typeFilter === "recommended"
              ? scoreSourceRelevance(source, profile?.focusAreas ?? [])
              : null;
            return (
              <SourceCard
                key={source.id}
                source={source}
                skills={skills.filter((sp) => sp.sourceId === source.id)}
                sessions={sessions}
                matchReason={rel?.matchReason}
                score={rel?.score}
                onDelete={() => handleDelete(source.id, source.title)}
                index={index}
              />
            );
          })
        )}
      </div>
    </>
  );
}

// Skeleton loading layout
function Skeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-10 bg-white/5 border border-line rounded-xl w-64" />
      <div className="h-28 bg-white/5 border border-line rounded-2xl" />
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => <div key={i} className="h-64 bg-white/5 border border-line rounded-2xl" />)}
      </div>
    </div>
  );
}
