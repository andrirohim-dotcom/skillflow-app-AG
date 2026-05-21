"use client";

import { useState } from "react";
import type { SkillProgress, ActionItem } from "@/lib/types";

interface Props {
  targetSkills: string[];
  skillProgress: SkillProgress[];
  onToggleActionItem?: (skillProgressId: string, actionItemId: string) => Promise<void>;
}

export default function InteractiveSkillTree({
  targetSkills,
  skillProgress,
  onToggleActionItem,
}: Props) {
  const [expandedSkills, setExpandedSkills] = useState<Record<string, boolean>>({});
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);

  const toggleExpand = (skill: string) => {
    setExpandedSkills((prev) => ({
      ...prev,
      [skill]: !prev[skill],
    }));
  };

  const handleCheckboxChange = async (skillProgressId: string, item: ActionItem) => {
    if (!onToggleActionItem) return;
    setUpdatingItemId(item.id);
    try {
      await onToggleActionItem(skillProgressId, item.id);
    } catch (e) {
      console.error("Failed to toggle action item in skill tree", e);
    } finally {
      setUpdatingItemId(null);
    }
  };

  if (targetSkills.length === 0) return null;

  return (
    <div className="bg-surface/30 border border-line rounded-3xl p-6 text-white shadow-lg relative overflow-hidden backdrop-blur-xl">
      {/* Background ambient stars */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        {Array.from({ length: 15 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-indigo-400 rounded-full animate-pulse"
            style={{
              top: `${(i * 17) % 100}%`,
              left: `${(i * 23) % 100}%`,
              animationDelay: `${(i * 0.5) % 3}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 space-y-6">
        <div>
          <h3 className="text-base font-black text-text uppercase tracking-wider">Interactive Skill Tree</h3>
          <p className="text-xs text-text-mute mt-1">Review detail and action items to level up your character</p>
        </div>

        <div className="space-y-4">
          {targetSkills.map((skill) => {
            const progress = skillProgress.find((sp) => sp.skillName === skill);
            const level = progress?.level || "awareness";
            const actionItems = progress?.actionItems || [];
            const completedCount = actionItems.filter((ai) => ai.completed).length;
            const isExpanded = !!expandedSkills[skill];

            // Color coding according to mastery value
            const levelConfig = {
              awareness: { label: "Awareness", color: "border-slate-700/40 text-slate-400 bg-slate-950/20" },
              understanding: { label: "Understanding", color: "border-sky-500/20 text-sky-400 bg-sky-500/10" },
              applied: { label: "Applied", color: "border-violet-500/20 text-violet-400 bg-violet-500/10" },
              mastered: { label: "Mastered", color: "border-emerald-500/20 text-emerald-400 bg-emerald-500/10" },
            }[level];

            return (
              <div 
                key={skill} 
                className="bg-white/5 border border-line rounded-2xl p-4 transition-all duration-300 hover:border-indigo-500/30 hover:bg-white/10"
              >
                {/* Skill Node Row */}
                <div 
                  onClick={() => toggleExpand(skill)}
                  className="flex items-center justify-between cursor-pointer select-none group"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl border flex items-center justify-center font-bold text-sm transition-all duration-300 group-hover:scale-105 ${levelConfig.color}`}>
                      {level === "mastered" ? "👑" : "✨"}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-xs text-text group-hover:text-indigo-400 transition-colors uppercase tracking-wider">{skill}</h4>
                      <p className="text-[10px] text-text-mute font-medium mt-0.5">
                        {actionItems.length > 0 
                          ? `${completedCount} of ${actionItems.length} missions completed` 
                          : "No action items set"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[8px] font-black tracking-widest uppercase px-2 py-0.5 rounded bg-white/5 border border-line text-indigo-400">
                      {levelConfig.label}
                    </span>
                    <span className={`text-text-mute text-xs transition-transform duration-300 ${isExpanded ? "rotate-90 text-indigo-400" : ""}`}>
                      ▶
                    </span>
                  </div>
                </div>

                {/* Sub-nodes: Action Items (Pohon Percabangan) */}
                {isExpanded && (
                  <div className="mt-4 ml-4.5 pl-4 border-l border-dashed border-line relative space-y-3">
                    {actionItems.length > 0 ? (
                      actionItems.map((item) => (
                        <div 
                          key={item.id} 
                          className="flex items-start gap-3 relative group/item py-1"
                        >
                          {/* Radial tree branch line */}
                          <div className="absolute w-3.5 h-px border-t border-dashed border-line -left-4 top-4" />

                          <input
                            type="checkbox"
                            checked={item.completed}
                            disabled={updatingItemId === item.id || !onToggleActionItem}
                            onChange={() => progress?.id && handleCheckboxChange(progress.id, item)}
                            className="mt-1 w-4 h-4 rounded bg-surface border-line text-indigo-500 focus:ring-indigo-500/20 focus:ring-offset-surface cursor-pointer disabled:opacity-50"
                          />

                          <div className="flex-1 min-w-0">
                            <p className={`text-xs leading-relaxed ${item.completed ? "text-text-mute line-through" : "text-text-dim"}`}>
                              {item.text}
                            </p>
                            <span className="text-[8px] font-black tracking-widest uppercase mt-1 block">
                              {item.completed ? "✨ +3 XP ACQUIRED" : "⚡ REWARD: +3 XP"}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="relative text-xs text-text-mute italic py-2">
                        <div className="absolute w-3.5 h-px border-t border-dashed border-line -left-4 top-4" />
                        No actions set for this skill. Add action items in learning source detail page.
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
