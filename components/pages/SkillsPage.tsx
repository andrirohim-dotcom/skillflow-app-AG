"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getWsSkillProgress, getWsSources } from "@/lib/storageV2";
import { useWorkspace } from "@/lib/contexts/WorkspaceContext";
import { getSkillMastery } from "@/lib/utils/analytics";
import {
  SKILL_LEVEL_LABELS,
  SKILL_LEVEL_COLORS,
  SKILL_LEVEL_DESCRIPTIONS,
  SKILL_LEVELS_ORDER,
} from "@/lib/constants";
import type { SkillProgress, LearningSource, SkillLevel } from "@/lib/types";

// ─── Skill Card ───────────────────────────────────────────────────────────────

function SkillCard({
  sp,
  source,
  allSources,
}: {
  sp: SkillProgress;
  source: LearningSource | undefined;
  allSources?: LearningSource[];
}) {
  const mastery = getSkillMastery(sp);
  const level = sp.level ?? "awareness";
  const completedItems = sp.actionItems.filter((ai) => ai.completed).length;
  const totalItems = sp.actionItems.length;

  // Find other sources teaching the same skill
  const otherSources = allSources?.filter((s) => s.skillTargets.includes(sp.skillName) && (!source || s.id !== source.id)) ?? [];

  const levelColors: Record<SkillLevel, { bar: string; ring: string }> = {
    awareness: { bar: "bg-gray-400", ring: "ring-gray-200" },
    understanding: { bar: "bg-sky-500", ring: "ring-sky-100" },
    applied: { bar: "bg-violet-500", ring: "ring-violet-100" },
    mastered: { bar: "bg-emerald-500", ring: "ring-emerald-100" },
  };

  const lc = levelColors[level];

  return (
    <div className={`bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-200 ring-2 ${lc.ring}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 text-sm leading-snug truncate">{sp.skillName}</h3>
          {source && (
            <p className="text-xs text-gray-400 mt-0.5 truncate">
              dari: {source.title}
            </p>
          )}
        </div>
        <span className={`shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full ${SKILL_LEVEL_COLORS[level]}`}>
          {SKILL_LEVEL_LABELS[level]}
        </span>
      </div>

      {/* Contributing sources chips (for aggregated view) */}
      {allSources && allSources.length > 1 && (
        <div className="mb-2 flex flex-wrap gap-1">
          {allSources.map((src) => (
            <span key={src.id} className="text-xs bg-sky-50 text-sky-700 px-1.5 py-0.5 rounded border border-sky-100">
              {src.title.substring(0, 12)}{src.title.length > 12 ? "..." : ""}
            </span>
          ))}
        </div>
      )}

      {/* Note if same skill exists in other sources */}
      {otherSources.length > 0 && (
        <p className="text-xs text-violet-600 bg-violet-50 px-2 py-1 rounded mb-2 italic">
          Juga dilatih di: {otherSources.map((s) => s.title).join(", ")}
        </p>
      )}

      {/* Category */}
      {sp.category && sp.category !== sp.skillName && (
        <p className="text-xs text-gray-400 mb-2 truncate">{sp.category}</p>
      )}

      {/* Progress bar */}
      {totalItems > 0 && (
        <div className="mb-3">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-400">{completedItems}/{totalItems} action items</span>
            <span className="font-bold text-gray-600">{mastery}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-1.5 rounded-full transition-all ${lc.bar}`}
              style={{ width: `${mastery}%` }}
            />
          </div>
        </div>
      )}

      {/* Evidence */}
      {sp.evidence && (
        <p className="text-xs text-gray-500 bg-gray-50 rounded-lg p-2 line-clamp-2 italic">
          "{sp.evidence}"
        </p>
      )}

      {/* Action items preview */}
      {totalItems > 0 && (
        <div className="mt-2 space-y-1">
          {sp.actionItems.slice(0, 3).map((ai) => (
            <div key={ai.id} className="flex items-center gap-1.5 text-xs text-gray-500">
              <span className={ai.completed ? "text-emerald-500" : "text-gray-300"}>
                {ai.completed ? "✓" : "○"}
              </span>
              <span className={`truncate ${ai.completed ? "line-through text-gray-300" : ""}`}>
                {ai.text}
              </span>
            </div>
          ))}
          {totalItems > 3 && (
            <p className="text-xs text-gray-400 pl-4">+{totalItems - 3} lainnya</p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Level Group ──────────────────────────────────────────────────────────────

function LevelGroup({
  level,
  skills,
  sources,
  viewMode,
  skillSourceMap,
}: {
  level: SkillLevel;
  skills: SkillProgress[];
  sources: LearningSource[];
  viewMode: "per-source" | "per-skill";
  skillSourceMap: Map<string, LearningSource[]>;
}) {
  if (skills.length === 0) return null;

  const levelEmoji: Record<SkillLevel, string> = {
    awareness: "👁️",
    understanding: "📖",
    applied: "⚡",
    mastered: "🏆",
  };

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">{levelEmoji[level]}</span>
        <h2 className="text-base font-bold text-gray-800">{SKILL_LEVEL_LABELS[level]}</h2>
        <span className="text-xs text-gray-400">— {SKILL_LEVEL_DESCRIPTIONS[level]}</span>
        <span className="ml-auto text-xs font-semibold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
          {skills.length}
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {skills.map((sp) => (
          <SkillCard
            key={sp.id}
            sp={sp}
            source={sources.find((s) => s.id === sp.sourceId)}
            allSources={viewMode === "per-skill" ? skillSourceMap.get(sp.id) : undefined}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center bg-white border border-dashed border-gray-200 rounded-2xl animate-slide-up">
      <div className="text-6xl mb-4">🎯</div>
      <h3 className="text-lg font-bold text-gray-700">Belum ada skill yang ditrack</h3>
      <p className="text-sm text-gray-400 mt-1 max-w-xs">
        Tambahkan sumber belajar dan definisikan skill target untuk mulai tracking progres Anda.
      </p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SkillsPage() {
  const { currentUser: user, currentWorkspace: workspace } = useWorkspace();
  const [skills, setSkills] = useState<SkillProgress[]>([]);
  const [sources, setSources] = useState<LearningSource[]>([]);
  const [mounted, setMounted] = useState(false);
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"per-source" | "per-skill">("per-source");

  const load = useCallback(async () => {
    if (!user || !workspace) return;
    // Simulate async for smooth UI transitions
    await new Promise((r) => setTimeout(r, 0));
    
    const sp = await getWsSkillProgress(workspace.id, user.id);
    const src = await getWsSources(workspace.id, user.id, "all");
    
    setSkills(sp);
    setSources(src);
  }, [user, workspace]);

  useEffect(() => {
    load();
    setMounted(true);
  }, [load]);

  const filtered = useMemo(() => {
    if (sourceFilter === "all") return skills;
    return skills.filter((sp) => sp.sourceId === sourceFilter);
  }, [skills, sourceFilter]);

  // For "Per Skill" mode: group by skill name and keep highest level
  const aggregatedBySkillName = useMemo(() => {
    const map = new Map<string, { skill: SkillProgress; sources: LearningSource[] }>();
    skills.forEach((sp) => {
      const existing = map.get(sp.skillName);
      const source = sources.find((s) => s.id === sp.sourceId);
      if (!existing) {
        map.set(sp.skillName, { skill: sp, sources: source ? [source] : [] });
      } else {
        const existingLevel = SKILL_LEVELS_ORDER.indexOf(existing.skill.level ?? "awareness");
        const newLevel = SKILL_LEVELS_ORDER.indexOf(sp.level ?? "awareness");
        if (newLevel > existingLevel) {
          map.set(sp.skillName, { skill: sp, sources: source ? [source] : [] });
        } else if (newLevel === existingLevel && source && !existing.sources.find((s) => s.id === source.id)) {
          existing.sources.push(source);
        } else if (newLevel < existingLevel && source && !existing.sources.find((s) => s.id === source.id)) {
          existing.sources.push(source);
        }
      }
    });
    return Array.from(map.values());
  }, [skills, sources]);

  const displaySkills = viewMode === "per-skill" ? aggregatedBySkillName.map((item) => item.skill) : filtered;
  const skillSourceMap = useMemo(() => {
    const map = new Map<string, LearningSource[]>();
    if (viewMode === "per-skill") {
      aggregatedBySkillName.forEach((item) => {
        map.set(item.skill.id, item.sources);
      });
    }
    return map;
  }, [viewMode, aggregatedBySkillName]);

  const grouped = useMemo(() => {
    return SKILL_LEVELS_ORDER.reduce(
      (acc, level) => {
        acc[level] = displaySkills.filter((sp) => (sp.level ?? "awareness") === level);
        return acc;
      },
      {} as Record<SkillLevel, SkillProgress[]>
    );
  }, [displaySkills]);

  const totalByLevel = useMemo(
    () =>
      SKILL_LEVELS_ORDER.reduce((acc, l) => {
        acc[l] = skills.filter((sp) => (sp.level ?? "awareness") === l).length;
        return acc;
      }, {} as Record<SkillLevel, number>),
    [skills]
  );

  const prioritySkills = useMemo(() => {
    if (!user?.profile?.bio) return [];
    // Just mock priority skills based on bio keywords since focusAreas is not in User
    const bioText = user.profile.bio.toLowerCase();
    return displaySkills.filter((sp) => {
      const nl = sp.skillName.toLowerCase();
      return bioText.includes(nl);
    });
  }, [displaySkills, user?.profile?.bio]);

  if (!mounted) return <Skeleton />;

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Skill Tracker</h1>
          <p className="text-sm text-gray-400 mt-0.5">{skills.length} skill sedang ditrack</p>
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="flex items-center gap-2 mb-6">
        <span className="text-xs font-medium text-gray-500">Tampilan:</span>
        <button
          onClick={() => setViewMode("per-source")}
          className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
            viewMode === "per-source"
              ? "bg-sky-600 text-white border-sky-600"
              : "bg-white text-gray-500 border-gray-200 hover:border-sky-200 hover:text-sky-600"
          }`}
        >
          Per Sumber
        </button>
        <button
          onClick={() => setViewMode("per-skill")}
          className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
            viewMode === "per-skill"
              ? "bg-violet-600 text-white border-violet-600"
              : "bg-white text-gray-500 border-gray-200 hover:border-violet-200 hover:text-violet-600"
          }`}
        >
          Per Skill
        </button>
      </div>

      {/* Level summary pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        {SKILL_LEVELS_ORDER.map((level) => (
          <div
            key={level}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold ${SKILL_LEVEL_COLORS[level]}`}
          >
            <span>{SKILL_LEVEL_LABELS[level]}</span>
            <span className="font-bold">{totalByLevel[level]}</span>
          </div>
        ))}
      </div>

      {/* Filter by source (only in per-source mode) */}
      {sources.length > 0 && viewMode === "per-source" && (
        <div className="bg-white border border-gray-100 rounded-2xl p-4 mb-6 shadow-sm">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs font-medium text-gray-500">Filter sumber:</span>
            <button
              onClick={() => setSourceFilter("all")}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                sourceFilter === "all"
                  ? "bg-sky-600 text-white border-sky-600"
                  : "bg-white text-gray-500 border-gray-200 hover:border-sky-200 hover:text-sky-600"
              }`}
            >
              Semua
            </button>
            {sources.map((src) => (
              <button
                key={src.id}
                onClick={() => setSourceFilter(src.id)}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                  sourceFilter === src.id
                    ? "bg-sky-600 text-white border-sky-600"
                    : "bg-white text-gray-500 border-gray-200 hover:border-sky-200 hover:text-sky-600"
                }`}
              >
                {src.title.length > 20 ? src.title.slice(0, 20) + "…" : src.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      {displaySkills.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="animate-slide-up">
          {/* ── Skill Prioritasmu ── */}
          {prioritySkills.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-lg">⭐</span>
                <h2 className="text-base font-bold text-gray-800">Skill Prioritasmu</h2>
                <span className="text-xs text-gray-400">— berdasarkan minat yang kamu atur</span>
                <span className="ml-auto text-xs font-semibold bg-violet-100 text-violet-600 px-2 py-0.5 rounded-full">
                  {prioritySkills.length}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                {prioritySkills.map((sp) => (
                  <div key={sp.id} className="relative">
                    <div className="absolute -top-1.5 -right-1.5 z-10 w-5 h-5 bg-violet-500 rounded-full flex items-center justify-center shadow-sm text-white text-[10px]">
                      ⭐
                    </div>
                    <SkillCard
                      sp={sp}
                      source={sources.find((s) => s.id === sp.sourceId)}
                      allSources={viewMode === "per-skill" ? skillSourceMap.get(sp.id) : undefined}
                    />
                  </div>
                ))}
              </div>
              <div className="mt-4 border-t border-gray-100 pt-2" />
            </div>
          )}

          {SKILL_LEVELS_ORDER.map((level) => (
            <LevelGroup
              key={level}
              level={level}
              skills={grouped[level]}
              sources={sources}
              viewMode={viewMode}
              skillSourceMap={skillSourceMap}
            />
          ))}
        </div>
      )}
    </>
  );
}

function Skeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-10 bg-gray-100 rounded-xl w-64" />
      <div className="flex gap-2">
        {[1, 2, 3, 4].map((i) => <div key={i} className="h-8 w-24 bg-gray-100 rounded-xl" />)}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {[1, 2, 3, 4, 5, 6].map((i) => <div key={i} className="h-40 bg-gray-100 rounded-2xl" />)}
      </div>
    </div>
  );
}
