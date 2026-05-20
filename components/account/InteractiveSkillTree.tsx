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
    <div className="bg-gray-900 rounded-3xl p-6 text-white shadow-2xl relative overflow-hidden border border-gray-800">
      {/* Background ambient stars */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        {Array.from({ length: 15 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-sky-400 rounded-full animate-pulse"
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
          <h3 className="text-lg font-display font-black text-sky-400">Pohon Skill Interaktif</h3>
          <p className="text-xs text-gray-400">Klik untuk membuka rincian action items dan tingkatkan level skill Anda</p>
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
              awareness: { label: "Awareness", color: "border-slate-700 text-slate-400 bg-slate-950/50", star: "⭐" },
              understanding: { label: "Understanding", color: "border-sky-800 text-sky-400 bg-sky-950/40", star: "⭐⭐" },
              applied: { label: "Applied", color: "border-violet-800 text-violet-400 bg-violet-950/40", star: "⭐⭐⭐" },
              mastered: { label: "Mastered", color: "border-emerald-800 text-emerald-400 bg-emerald-950/40", star: "👑 Master" },
            }[level];

            return (
              <div 
                key={skill} 
                className="bg-gray-950/40 border border-gray-800/80 rounded-2xl p-4 transition-all duration-300 hover:border-gray-700/80"
              >
                {/* Skill Node Row */}
                <div 
                  onClick={() => toggleExpand(skill)}
                  className="flex items-center justify-between cursor-pointer select-none group"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl border flex items-center justify-center font-bold text-sm transition-all duration-300 group-hover:scale-105 ${levelConfig.color}`}>
                      {level === "mastered" ? "👑" : "✨"}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-gray-100 group-hover:text-sky-300 transition-colors uppercase tracking-wider">{skill}</h4>
                      <p className="text-[10px] text-gray-500 font-medium">
                        {actionItems.length > 0 
                          ? `${completedCount} dari ${actionItems.length} Misi Selesai` 
                          : "Belum ada action item"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[9px] font-black tracking-widest uppercase px-2 py-0.5 rounded bg-gray-900 border border-gray-800 text-sky-400">
                      {levelConfig.label}
                    </span>
                    <span className={`text-gray-500 transition-transform duration-300 ${isExpanded ? "rotate-90 text-sky-400" : ""}`}>
                      ▶
                    </span>
                  </div>
                </div>

                {/* Sub-nodes: Action Items (Pohon Percabangan) */}
                {isExpanded && (
                  <div className="mt-4 ml-5 pl-5 border-l-2 border-dashed border-gray-800 relative space-y-3">
                    {actionItems.length > 0 ? (
                      actionItems.map((item, idx) => (
                        <div 
                          key={item.id} 
                          className="flex items-start gap-3 relative group/item py-1"
                        >
                          {/* Radial tree branch line */}
                          <div className="absolute w-4 h-px border-t border-dashed border-gray-800 -left-5 top-4" />

                          <input
                            type="checkbox"
                            checked={item.completed}
                            disabled={updatingItemId === item.id || !onToggleActionItem}
                            onChange={() => progress?.id && handleCheckboxChange(progress.id, item)}
                            className="mt-1 w-4 h-4 rounded-lg bg-gray-900 border-gray-700 text-sky-500 focus:ring-sky-500 focus:ring-offset-gray-950 cursor-pointer disabled:opacity-50"
                          />

                          <div className="flex-1 min-w-0">
                            <p className={`text-xs leading-relaxed ${item.completed ? "text-gray-500 line-through" : "text-gray-300"}`}>
                              {item.text}
                            </p>
                            <span className="text-[9px] text-sky-500/80 font-bold tracking-wide mt-1 block uppercase">
                              {item.completed ? "✨ +3 XP Diterima" : "⚡ Reward: +3 XP"}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="relative text-xs text-gray-500 italic py-2">
                        <div className="absolute w-4 h-px border-t border-dashed border-gray-800 -left-5 top-4" />
                        Belum ada target aksi untuk skill ini. Tambahkan action items dari modul Sumber Belajar.
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
