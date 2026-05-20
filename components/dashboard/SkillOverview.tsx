import { getSkillMastery } from "@/lib/utils/analytics";
import { colorConfig } from "@/lib/utils/colorConfig";
import { SKILL_COLORS } from "@/lib/constants";
import type { SkillProgress, LearningSource } from "@/lib/types";

interface Props {
  allSkillProgress: SkillProgress[];
  sources: LearningSource[];
}

export default function SkillOverview({ allSkillProgress, sources }: Props) {
  const sourceMap = new Map(sources.map((s) => [s.id, s]));

  // Sort by mastery ascending — least mastered first = highest priority
  const sorted = [...allSkillProgress].sort(
    (a, b) => getSkillMastery(a) - getSkillMastery(b)
  );

  if (allSkillProgress.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col items-center justify-center min-h-[200px] text-center">
        <span className="text-4xl mb-3">🎯</span>
        <p className="text-sm font-medium text-gray-500">Belum ada skill dilacak</p>
        <p className="text-xs text-gray-400 mt-1">
          Tambahkan sumber belajar dengan skill target.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 pt-5 pb-3 border-b border-gray-50">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-900">Skill Overview</h2>
          <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
            {allSkillProgress.length} skill
          </span>
        </div>
      </div>

      <div className="p-4 space-y-3 max-h-[480px] overflow-y-auto">
        {sorted.map((sp, i) => {
          const mastery = getSkillMastery(sp);
          const source = sourceMap.get(sp.sourceId);
          const colorKey = SKILL_COLORS[i % SKILL_COLORS.length];
          const c = colorConfig[colorKey];
          const completed = sp.actionItems.filter((ai) => ai.completed).length;
          const total = sp.actionItems.length;
          const isMastered = mastery === 100;

          return (
            <div
              key={sp.id}
              className={`rounded-xl border ${c.border} p-3 ${c.bg}`}
            >
              {/* Priority badge for the skill needing most attention */}
              {i === 0 && sorted.length > 1 && (
                <span className="inline-block text-xs font-semibold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full mb-2">
                  Prioritas
                </span>
              )}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-800 leading-tight truncate">
                    {sp.skillName}
                  </p>
                  {source && (
                    <p className="text-xs text-gray-400 mt-0.5 truncate">
                      {source.title}
                    </p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  {isMastered ? (
                    <span className="text-xs font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                      ✓ Dikuasai
                    </span>
                  ) : (
                    <span className={`text-sm font-extrabold ${c.text}`}>
                      {mastery}%
                    </span>
                  )}
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-white/70 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-1.5 rounded-full transition-all duration-500 ${c.bar}`}
                  style={{ width: `${mastery}%` }}
                />
              </div>

              <p className="text-xs text-gray-400 mt-1.5">
                {completed}/{total} action item selesai
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
