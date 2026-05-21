"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getWsSkillProgress, getWsSources, updateWsSkillProgress } from "@/lib/storageV2";
import { useWorkspace } from "@/lib/contexts/WorkspaceContext";
import { getSkillMastery } from "@/lib/utils/analytics";
import {
  SKILL_LEVEL_LABELS,
  SKILL_LEVEL_COLORS,
  SKILL_LEVEL_DESCRIPTIONS,
  SKILL_LEVELS_ORDER,
} from "@/lib/constants";
import type { SkillProgress, LearningSource, SkillLevel } from "@/lib/types";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SkillsPage() {
  const { currentUser: user, currentWorkspace: workspace } = useWorkspace();
  const [skills, setSkills] = useState<SkillProgress[]>([]);
  const [sources, setSources] = useState<LearningSource[]>([]);
  const [mounted, setMounted] = useState(false);
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"map" | "per-source" | "per-skill">("map");
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null);
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user || !workspace) return;
    
    const sp = await getWsSkillProgress(workspace.id, user.id);
    const src = await getWsSources(workspace.id, user.id, "all");
    
    setSkills(sp);
    setSources(src);

    // Default select first skill if map is active
    if (sp.length > 0 && !selectedSkillId) {
      setSelectedSkillId(sp[0].id);
    }
  }, [user, workspace, selectedSkillId]);

  useEffect(() => {
    load();
    setMounted(true);
  }, [load]);

  const handleToggleActionItem = useCallback(async (skillProgressId: string, actionItemId: string) => {
    if (!user || !workspace) return;
    const progress = skills.find((sp) => sp.id === skillProgressId);
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
      await updateWsSkillProgress(workspace.id, user.id, updatedProgress);
      
      // Refresh local states
      setSkills((prev) =>
        prev.map((sp) => (sp.id === skillProgressId ? updatedProgress : sp))
      );
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingItemId(null);
    }
  }, [user, workspace, skills]);

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
    const bioText = user.profile.bio.toLowerCase();
    return displaySkills.filter((sp) => {
      const nl = sp.skillName.toLowerCase();
      return bioText.includes(nl);
    });
  }, [displaySkills, user?.profile?.bio]);

  // Layout algorithm for dynamic SVG skill map
  const skillMapData = useMemo(() => {
    if (skills.length === 0) return { nodes: [], paths: [], height: 500 };

    // Group skills by category
    const categoryMap: Record<string, SkillProgress[]> = {};
    skills.forEach((sp) => {
      const cat = sp.category || "General";
      if (!categoryMap[cat]) categoryMap[cat] = [];
      categoryMap[cat].push(sp);
    });

    const categories = Object.keys(categoryMap);
    const totalCategories = categories.length;

    const height = Math.max(500, totalCategories * 160);
    const rootX = 60;
    const rootY = height / 2;

    const nodes: any[] = [];
    const paths: any[] = [];

    // Push Root Node
    nodes.push({
      id: "root",
      type: "root",
      label: "Start",
      emoji: "🚀",
      x: rootX,
      y: rootY,
      level: "awareness",
    });

    categories.forEach((cat, catIdx) => {
      const catId = `cat-${catIdx}`;
      const catX = 220;
      const catY = (catIdx + 0.5) * (height / totalCategories);

      // Add Category Node
      let catEmoji = "🎯";
      if (cat.toLowerCase().includes("tech") || cat.toLowerCase().includes("dev") || cat.toLowerCase().includes("code")) catEmoji = "💻";
      else if (cat.toLowerCase().includes("business") || cat.toLowerCase().includes("finance")) catEmoji = "📈";
      else if (cat.toLowerCase().includes("design") || cat.toLowerCase().includes("art")) catEmoji = "🎨";
      else if (cat.toLowerCase().includes("life") || cat.toLowerCase().includes("health")) catEmoji = "🌱";

      nodes.push({
        id: catId,
        type: "category",
        label: cat,
        emoji: catEmoji,
        x: catX,
        y: catY,
        level: "awareness",
      });

      // Path: Root -> Category
      paths.push({
        id: `path-root-${catId}`,
        fromX: rootX,
        fromY: rootY,
        toX: catX,
        toY: catY,
        active: true,
      });

      const catSkills = categoryMap[cat];
      const totalSkills = catSkills.length;

      catSkills.forEach((sp, skillIdx) => {
        const skillX = 460;
        // Vertically center skill nodes around their parent category node
        const skillY = catY + (skillIdx - (totalSkills - 1) / 2) * 85;

        const levelEmojis = {
          awareness: "👁️",
          understanding: "📖",
          applied: "⚡",
          mastered: "👑",
        };
        const level = sp.level || "awareness";

        // Add Skill Node
        nodes.push({
          id: sp.id,
          type: "skill",
          label: sp.skillName,
          emoji: levelEmojis[level] || "✨",
          x: skillX,
          y: skillY,
          level: level,
          skillData: sp,
        });

        // Path: Category -> Skill
        paths.push({
          id: `path-${catId}-${sp.id}`,
          fromX: catX,
          fromY: catY,
          toX: skillX,
          toY: skillY,
          active: sp.actionItems.some((ai) => ai.completed),
        });
      });
    });

    return { nodes, paths, height };
  }, [skills]);

  const selectedSkill = useMemo(() => {
    if (!selectedSkillId) return null;
    return skills.find((sp) => sp.id === selectedSkillId) || null;
  }, [selectedSkillId, skills]);

  const selectedSkillSource = useMemo(() => {
    if (!selectedSkill) return null;
    return sources.find((s) => s.id === selectedSkill.sourceId) || null;
  }, [selectedSkill, sources]);

  if (!mounted) return <Skeleton />;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16 text-text">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1 text-[11px] font-black uppercase tracking-widest text-text-mute">
          <span>Dashboard</span>
          <span>/</span>
          <span className="text-indigo-400">Interactive Skill Tree</span>
        </div>
        <div className="flex items-center justify-between mt-1">
          <div>
            <h1 className="text-3xl font-black text-text tracking-tight">Interactive Skill Tree</h1>
            <p className="text-sm text-text-mute mt-0.5">{skills.length} active skills in your learning graph</p>
          </div>
        </div>
      </div>

      {/* Navigation and View mode Switch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface/20 border border-line rounded-2xl p-4 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-text-mute uppercase tracking-wider">Visual mode:</span>
          <div className="flex bg-white/5 border border-line p-0.5 rounded-xl">
            <button
              onClick={() => setViewMode("map")}
              className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg transition-all ${
                viewMode === "map"
                  ? "bg-indigo-sleek text-white shadow-md border border-indigo-500/20"
                  : "text-text-mute hover:text-text"
              }`}
            >
              🗺️ Map Tree
            </button>
            <button
              onClick={() => setViewMode("per-source")}
              className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg transition-all ${
                viewMode === "per-source"
                  ? "bg-indigo-sleek text-white shadow-md border border-indigo-500/20"
                  : "text-text-mute hover:text-text"
              }`}
            >
              📚 Per Source
            </button>
            <button
              onClick={() => setViewMode("per-skill")}
              className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg transition-all ${
                viewMode === "per-skill"
                  ? "bg-indigo-sleek text-white shadow-md border border-indigo-500/20"
                  : "text-text-mute hover:text-text"
              }`}
            >
              🎯 Per Skill
            </button>
          </div>
        </div>

        {/* Level stats pills */}
        <div className="flex flex-wrap gap-2">
          {SKILL_LEVELS_ORDER.map((level) => (
            <div
              key={level}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl border text-[10px] font-black uppercase tracking-wide ${SKILL_LEVEL_COLORS[level]}`}
            >
              <span>{SKILL_LEVEL_LABELS[level]}</span>
              <span className="font-mono bg-white/10 px-1.5 py-0.5 rounded-md">{totalByLevel[level]}</span>
            </div>
          ))}
        </div>
      </div>

      {skills.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="animate-slide-up">
          {viewMode === "map" ? (
            /* ── INTERACTIVE SVG NODE MAP TREE ── */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Map Canvas (Left 2 Columns) */}
              <div className="lg:col-span-2 bg-surface/30 border border-line rounded-3xl p-6 shadow-xl relative overflow-hidden backdrop-blur-xl flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xs font-black text-text-mute uppercase tracking-widest">Peta Kompetensi</h3>
                    <p className="text-[10px] text-text-mute mt-0.5">Scroll mendatar untuk melihat hubungan node skill Anda</p>
                  </div>
                  <div className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-text-mute bg-white/5 border border-line px-2.5 py-1 rounded-xl">
                    <span>Base</span>
                    <span className="text-indigo-400">→ Category → Skill</span>
                  </div>
                </div>

                {/* SVG Area */}
                <div className="flex-1 w-full overflow-x-auto scrollbar-thin border border-line bg-surface/10 rounded-2xl p-4 relative min-h-[480px]">
                  <svg
                    viewBox={`0 0 680 ${skillMapData.height}`}
                    className="w-[680px] select-none"
                    style={{ height: `${skillMapData.height}px` }}
                  >
                    <defs>
                      <linearGradient id="activeLineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#6366f1" stopOpacity="0.8" />
                      </linearGradient>
                      <radialGradient id="nodeGlowSelected" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
                      </radialGradient>
                    </defs>

                    {/* Render Connectors */}
                    {skillMapData.paths.map((p) => {
                      const controlX = (p.fromX + p.toX) / 2;
                      const pathD = `M ${p.fromX} ${p.fromY} C ${controlX} ${p.fromY}, ${controlX} ${p.toY}, ${p.toX} ${p.toY}`;
                      
                      return (
                        <path
                          key={p.id}
                          d={pathD}
                          fill="none"
                          stroke={p.active ? "url(#activeLineGradient)" : "rgba(255, 255, 255, 0.08)"}
                          strokeWidth={p.active ? "2.5" : "1.5"}
                          strokeDasharray={p.active ? "none" : "4, 4"}
                          className="transition-all duration-500"
                        />
                      );
                    })}

                    {/* Render Nodes */}
                    {skillMapData.nodes.map((node) => {
                      const isRoot = node.type === "root";
                      const isCategory = node.type === "category";
                      const isSkill = node.type === "skill";
                      const isSelected = selectedSkillId === node.id;

                      const size = isRoot ? 16 : isCategory ? 19 : 22;

                      let bgFill = "fill-surface/90";
                      let strokeColor = "stroke-line";

                      if (isRoot) {
                        bgFill = "fill-indigo-950/90";
                        strokeColor = "stroke-indigo-500";
                      } else if (isCategory) {
                        bgFill = "fill-slate-900/90";
                        strokeColor = "stroke-indigo-400/60";
                      } else if (isSkill) {
                        const levelColors = {
                          awareness: { fill: "fill-slate-900/90", stroke: "stroke-slate-600" },
                          understanding: { fill: "fill-sky-950/90", stroke: "stroke-sky-400" },
                          applied: { fill: "fill-violet-950/90", stroke: "stroke-violet-400" },
                          mastered: { fill: "fill-emerald-950/90", stroke: "stroke-emerald-400" },
                        }[node.level as SkillLevel] || { fill: "fill-slate-900/90", stroke: "stroke-slate-600" };

                        bgFill = levelColors.fill;
                        strokeColor = levelColors.stroke;
                      }

                      if (isSelected) {
                        strokeColor = "stroke-yellow-400";
                      }

                      return (
                        <g
                          key={node.id}
                          transform={`translate(${node.x}, ${node.y})`}
                          className={`cursor-pointer group ${!isSkill ? "pointer-events-none" : ""}`}
                          onClick={() => {
                            if (isSkill) setSelectedSkillId(node.id);
                          }}
                        >
                          {/* Pulsing glow background for selected */}
                          {isSelected && (
                            <circle
                              r={size + 14}
                              fill="url(#nodeGlowSelected)"
                              className="animate-pulse"
                            />
                          )}

                          {/* Glow ring on hover */}
                          <circle
                            r={size + 6}
                            fill="none"
                            stroke={isSelected ? "rgba(245, 158, 11, 0.25)" : "rgba(99, 102, 241, 0.12)"}
                            strokeWidth="5"
                            className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                          />

                          {/* Base circle border */}
                          <circle
                            r={size}
                            className={`${bgFill} ${strokeColor} transition-all duration-300`}
                            strokeWidth={isSelected ? "2.5" : "1.5"}
                          />

                          {/* Node Icon Emoji */}
                          <text
                            y="5"
                            textAnchor="middle"
                            className="text-base select-none pointer-events-none filter drop-shadow-md"
                          >
                            {node.emoji}
                          </text>

                          {/* Skill label text */}
                          <text
                            y={size + 13}
                            textAnchor="middle"
                            className={`text-[8.5px] font-black uppercase tracking-wider fill-current select-none pointer-events-none ${
                              isSelected ? "text-yellow-400 font-extrabold" : "text-text-mute group-hover:text-text"
                            } transition-colors`}
                          >
                            {node.label.length > 16 ? node.label.slice(0, 14) + ".." : node.label}
                          </text>

                          {/* Orbit action items micro dots */}
                          {isSkill && node.skillData?.actionItems && (
                            <g>
                              {node.skillData.actionItems.map((ai: any, aiIdx: number) => {
                                const totalAi = node.skillData.actionItems.length;
                                const angle = (aiIdx * (2 * Math.PI)) / totalAi - Math.PI / 2;
                                const orbitRadius = size + 7.5;
                                const ox = orbitRadius * Math.cos(angle);
                                const oy = orbitRadius * Math.sin(angle);
                                
                                return (
                                  <circle
                                    key={ai.id}
                                    cx={ox}
                                    cy={oy}
                                    r="3"
                                    className={`${
                                      ai.completed
                                        ? "fill-emerald-400 stroke-surface/80"
                                        : "fill-white/10 stroke-surface/80"
                                    } transition-all duration-500`}
                                    strokeWidth="1"
                                  />
                                );
                              })}
                            </g>
                          )}
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </div>

              {/* Sidebar Action Item Panel (Right 1 Column) */}
              <div className="bg-surface/30 border border-line rounded-3xl p-6 shadow-xl relative overflow-hidden backdrop-blur-xl h-fit">
                {selectedSkill ? (
                  <div className="space-y-6">
                    {/* Sidebar Title */}
                    <div className="space-y-1.5 pb-4 border-b border-line">
                      <span className="text-[8px] font-black tracking-widest uppercase text-indigo-400 bg-indigo-500/10 border border-indigo-500/25 px-2 py-0.5 rounded-full">
                        {selectedSkill.category || "General"}
                      </span>
                      <h3 className="text-lg font-black text-text tracking-tight uppercase leading-snug pt-1">{selectedSkill.skillName}</h3>
                      {selectedSkillSource && (
                        <p className="text-[10px] font-medium text-text-mute truncate">
                          Sumber: <span className="text-text-dim">{selectedSkillSource.title}</span>
                        </p>
                      )}
                    </div>

                    {/* Skill Details */}
                    <div className="space-y-3">
                      <div>
                        <p className="text-[9px] font-black text-text-mute uppercase tracking-widest">Mastery Level</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${SKILL_LEVEL_COLORS[selectedSkill.level || "awareness"]}`}>
                            {SKILL_LEVEL_LABELS[selectedSkill.level || "awareness"]}
                          </span>
                          <span className="text-xs font-bold text-text-mute font-mono">
                            ({Math.round((selectedSkill.actionItems.filter(ai => ai.completed).length / Math.max(1, selectedSkill.actionItems.length)) * 100)}% Complete)
                          </span>
                        </div>
                      </div>

                      {selectedSkill.evidence && (
                        <div>
                          <p className="text-[9px] font-black text-text-mute uppercase tracking-widest">Catatan Bukti</p>
                          <p className="text-xs text-text-dim bg-white/5 border border-line rounded-xl p-3 mt-1 leading-relaxed italic">
                            "{selectedSkill.evidence}"
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Action Items List */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <h4 className="text-[10px] font-black text-text-mute uppercase tracking-widest">Misi & Action Items</h4>
                        <span className="text-[9px] font-black text-indigo-400 bg-indigo-500/5 px-2 py-0.5 rounded border border-indigo-500/15">
                          +3 XP per misi
                        </span>
                      </div>
                      
                      {selectedSkill.actionItems.length > 0 ? (
                        <div className="space-y-2">
                          {selectedSkill.actionItems.map((item) => {
                            const isUpdating = updatingItemId === item.id;
                            return (
                              <div
                                key={item.id}
                                className={`border rounded-xl p-3 flex items-start gap-3 transition-all ${
                                  item.completed
                                    ? "bg-emerald-500/5 border-emerald-500/20 text-text-mute"
                                    : "bg-surface/20 border-line hover:border-indigo-500/30 text-text"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={item.completed}
                                  disabled={isUpdating}
                                  onChange={() => handleToggleActionItem(selectedSkill.id, item.id)}
                                  className="mt-0.5 w-4 h-4 rounded bg-surface border-line text-indigo-500 focus:ring-indigo-500/20 focus:ring-offset-surface cursor-pointer disabled:opacity-50"
                                />
                                <div className="min-w-0 flex-1">
                                  <p className={`text-xs leading-relaxed ${item.completed ? "line-through" : "text-text-dim"}`}>
                                    {item.text}
                                  </p>
                                  <span className="text-[8px] font-black tracking-widest uppercase block mt-1">
                                    {item.completed ? "✨ +3 XP DIDAPAT" : "⚡ HADIAH: +3 XP"}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-6 border border-dashed border-line bg-white/5 rounded-2xl">
                          <span className="text-2xl">📝</span>
                          <p className="text-xs font-bold text-text mt-2">Belum ada action item</p>
                          <p className="text-[10px] text-text-mute mt-1 max-w-xs mx-auto">
                            Definisikan action items pada modul detail Sumber Belajar untuk skill ini.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <span className="text-4xl block">🗺️</span>
                    <h4 className="text-xs font-black text-text uppercase tracking-wider mt-4">Pilih Node Skill</h4>
                    <p className="text-[10px] text-text-mute mt-1.5 max-w-xs mx-auto leading-relaxed">
                      Silakan klik salah satu node skill berbentuk bulat di dalam peta kompetensi untuk melihat dan mencentang misi action items.
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* ── ALTERNATIVE GRID VIEWS (PER SOURCE & PER SKILL) ── */
            <>
              {/* Filter by source (only in per-source mode) */}
              {sources.length > 0 && viewMode === "per-source" && (
                <div className="bg-surface/30 border border-line rounded-3xl p-5 mb-8 shadow-lg backdrop-blur-md">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="text-xs font-bold text-text-mute uppercase tracking-wider">Source Filter:</span>
                    <button
                      onClick={() => setSourceFilter("all")}
                      className={`text-xs px-3.5 py-1.5 rounded-xl border transition-all duration-200 uppercase tracking-wider font-extrabold ${
                        sourceFilter === "all"
                          ? "bg-indigo-sleek text-white border-indigo-500/40 shadow-md"
                          : "bg-white/5 text-text-dim border-line hover:border-indigo-500/30 hover:text-text"
                      }`}
                    >
                      All Sources
                    </button>
                    {sources.map((src) => (
                      <button
                        key={src.id}
                        onClick={() => setSourceFilter(src.id)}
                        className={`text-xs px-3.5 py-1.5 rounded-xl border transition-all duration-200 uppercase tracking-wider font-extrabold ${
                          sourceFilter === src.id
                            ? "bg-indigo-sleek text-white border-indigo-500/40 shadow-md"
                            : "bg-white/5 text-text-dim border-line hover:border-indigo-500/30 hover:text-text"
                        }`}
                      >
                        {src.title.length > 22 ? src.title.slice(0, 22) + "…" : src.title}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Priority skills section */}
              {prioritySkills.length > 0 && (
                <div className="mb-10">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-lg">⭐</span>
                    <h2 className="text-sm font-black text-text uppercase tracking-widest">Priority Skills</h2>
                    <span className="text-xs text-text-mute">— based on your bio profile</span>
                    <span className="ml-auto text-xs font-black bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2.5 py-0.5 rounded-full">
                      {prioritySkills.length}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {prioritySkills.map((sp) => (
                      <div key={sp.id} className="relative group">
                        <div className="absolute -top-1.5 -right-1.5 z-10 w-5.5 h-5.5 bg-gradient-to-br from-amber-500 to-yellow-400 rounded-full flex items-center justify-center shadow-lg border border-yellow-300 text-[10px]">
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
                  <div className="mt-6 border-t border-line pt-2" />
                </div>
              )}

              {/* Skill cards by level groups */}
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
            </>
          )}
        </div>
      )}
    </div>
  );
}

// Custom Glassmorphism SkillCard for grid list view
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

  const otherSources = allSources?.filter((s) => s.skillTargets.includes(sp.skillName) && (!source || s.id !== source.id)) ?? [];

  const levelColors: Record<SkillLevel, { bar: string; ring: string }> = {
    awareness: { bar: "bg-white/30", ring: "border-line" },
    understanding: { bar: "bg-sky-500", ring: "border-sky-500/20 shadow-[0_0_8px_rgba(14,165,233,0.1)]" },
    applied: { bar: "bg-violet-500", ring: "border-violet-500/20 shadow-[0_0_8px_rgba(139,92,246,0.1)]" },
    mastered: { bar: "bg-emerald-500", ring: "border-emerald-500/20 shadow-[0_0_8px_rgba(16,185,129,0.1)]" },
  };

  const lc = levelColors[level];

  return (
    <div className={`bg-surface/30 border rounded-3xl p-5 shadow-lg hover:shadow-xl hover:bg-surface/50 hover:border-indigo-500/30 transition-all duration-300 backdrop-blur-md flex flex-col justify-between h-full group ${lc.ring}`}>
      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0">
            <h4 className="font-extrabold text-sm text-text leading-snug uppercase tracking-wider group-hover:text-indigo-400 transition-colors duration-200 truncate">{sp.skillName}</h4>
            {source && (
              <p className="text-[10px] text-text-mute mt-0.5 truncate">
                dari: <span className="text-text-dim">{source.title}</span>
              </p>
            )}
          </div>
          <span className={`shrink-0 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${SKILL_LEVEL_COLORS[level]}`}>
            {SKILL_LEVEL_LABELS[level]}
          </span>
        </div>

        {/* Contributing sources chips */}
        {allSources && allSources.length > 1 && (
          <div className="mb-3 flex flex-wrap gap-1">
            {allSources.map((src) => (
              <span key={src.id} className="text-[9px] bg-sky-500/10 text-sky-400 px-2 py-0.5 rounded-lg border border-sky-500/20 font-medium">
                {src.title.substring(0, 14)}{src.title.length > 14 ? "..." : ""}
              </span>
            ))}
          </div>
        )}

        {/* Also taught in details */}
        {otherSources.length > 0 && (
          <p className="text-[9px] text-violet-400 bg-violet-500/10 border border-violet-500/20 px-2 py-1 rounded-xl mb-3 italic">
            Juga dilatih di: {otherSources.map((s) => s.title).join(", ")}
          </p>
        )}

        {/* Category */}
        {sp.category && sp.category !== sp.skillName && (
          <span className="inline-block text-[9px] text-indigo-400 font-bold bg-indigo-500/5 px-2 py-0.5 rounded border border-indigo-500/15 mb-3 uppercase tracking-wider">
            {sp.category}
          </span>
        )}
      </div>

      <div>
        {/* Progress bar */}
        {totalItems > 0 && (
          <div className="mt-3">
            <div className="flex justify-between text-[10px] mb-1 font-bold">
              <span className="text-text-mute">{completedItems}/{totalItems} Action Items</span>
              <span className="text-text-dim">{mastery}%</span>
            </div>
            <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden border border-line">
              <div
                className={`h-full rounded-full transition-all duration-500 ${lc.bar}`}
                style={{ width: `${mastery}%` }}
              />
            </div>
          </div>
        )}

        {/* Action items preview list */}
        {totalItems > 0 && (
          <div className="mt-3 pt-3 border-t border-line space-y-1.5">
            {sp.actionItems.slice(0, 2).map((ai) => (
              <div key={ai.id} className="flex items-center gap-2 text-[10px] text-text-dim">
                <span className={ai.completed ? "text-emerald-400" : "text-text-mute"}>
                  {ai.completed ? "✓" : "○"}
                </span>
                <span className={`truncate ${ai.completed ? "line-through text-text-mute/50" : ""}`}>
                  {ai.text}
                </span>
              </div>
            ))}
            {totalItems > 2 && (
              <p className="text-[9px] font-bold text-text-mute pl-4 uppercase tracking-wider">+{totalItems - 2} more missions</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

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
    <div className="mb-10">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">{levelEmoji[level]}</span>
        <h3 className="text-sm font-black text-text uppercase tracking-widest">{SKILL_LEVEL_LABELS[level]}</h3>
        <span className="text-xs text-text-mute">— {SKILL_LEVEL_DESCRIPTIONS[level]}</span>
        <span className="ml-auto text-xs font-black bg-white/5 text-text-mute border border-line px-2.5 py-0.5 rounded-full">
          {skills.length}
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center bg-surface/20 border border-dashed border-line rounded-3xl backdrop-blur-md">
      <div className="text-5xl mb-4">🎯</div>
      <h3 className="text-base font-black text-text uppercase tracking-wider">No Skills Tracked Yet</h3>
      <p className="text-xs text-text-mute mt-1.5 max-w-xs mx-auto leading-relaxed">
        Tambahkan sumber belajar baru dan atur target skill kompetensi untuk memetakan visualisasi progress Anda.
      </p>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-10 bg-white/5 border border-line rounded-xl w-64" />
      <div className="h-20 bg-white/5 border border-line rounded-2xl" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => <div key={i} className="h-44 bg-white/5 border border-line rounded-3xl" />)}
      </div>
    </div>
  );
}
