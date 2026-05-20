"use client";

import { colorConfig } from "@/lib/utils/colorConfig";
import { SKILL_COLORS } from "@/lib/constants";
import type { SkillProgress, LearningSource } from "@/lib/types";

interface Props {
  skillProgress: SkillProgress[];
  sources: LearningSource[];
  onToggle: (skillProgressId: string, actionItemId: string) => void;
}

export default function NextBestActionCard({ skillProgress, sources, onToggle }: Props) {
  const sourceMap = new Map(sources.map((s) => [s.id, s]));

  // Find the next best action: first uncompleted item from highest-level skill
  let nextAction = null;
  let skillIndex = 0;

  const skillsByLevel = skillProgress.slice().sort((a, b) => {
    const levels = ["mastered", "applied", "understanding", "awareness"];
    const aLevel = levels.indexOf(a.level ?? "awareness");
    const bLevel = levels.indexOf(b.level ?? "awareness");
    return aLevel - bLevel;
  });

  for (const sp of skillsByLevel) {
    const uncompleted = sp.actionItems.find((ai) => !ai.completed);
    if (uncompleted) {
      nextAction = { ai: uncompleted, sp, source: sourceMap.get(sp.sourceId) };
      skillIndex = skillProgress.indexOf(sp);
      break;
    }
  }

  if (!nextAction) {
    return (
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl p-5 shadow-sm">
        <p className="text-xs font-semibold text-emerald-600 mb-2">🎉 TIDAK ADA TUGAS TERTUNDA</p>
        <p className="text-sm text-gray-700">Semua action item sudah selesai! Tambahkan skill baru atau sumber belajar untuk melanjutkan.</p>
      </div>
    );
  }

  const { ai, sp, source } = nextAction;
  const colorKey = SKILL_COLORS[skillIndex % SKILL_COLORS.length];
  const c = colorConfig[colorKey];

  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
      <p className="text-xs font-semibold text-amber-600 mb-3">⚡ AKSI SELANJUTNYA</p>

      <label className="flex items-start gap-3 cursor-pointer group">
        <input
          type="checkbox"
          checked={false}
          onChange={() => onToggle(sp.id, ai.id)}
          className={`mt-1 w-5 h-5 rounded-lg ${c.checkAccent} cursor-pointer shrink-0`}
        />
        <div className="flex-1 min-w-0">
          <p className="text-base font-bold text-gray-900 leading-snug group-hover:text-gray-700 transition-colors">
            {ai.text}
          </p>

          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${c.badge}`}>
              {sp.skillName}
            </span>
            {source && (
              <span className="text-xs text-gray-500 bg-white/60 px-2.5 py-1 rounded-lg">
                {source.title}
              </span>
            )}
          </div>
        </div>
      </label>

      <div className="mt-4 pt-4 border-t border-amber-100/50">
        <p className="text-xs text-amber-700 font-medium">💡 Tips: Kerjakan ini dulu untuk momentum terbaik hari ini</p>
      </div>
    </div>
  );
}
