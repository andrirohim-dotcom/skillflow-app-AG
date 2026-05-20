import { colorConfig } from "@/lib/utils/colorConfig";
import { SKILL_COLORS } from "@/lib/constants";
import type { SkillProgress, LearningSource } from "@/lib/types";

interface Props {
  allSkillProgress: SkillProgress[];
  sources: LearningSource[];
  onToggle: (skillProgressId: string, actionItemId: string) => void;
}

export default function ActionItemsPanel({ allSkillProgress, sources, onToggle }: Props) {
  const sourceMap = new Map(sources.map((s) => [s.id, s]));

  // Collect all uncompleted action items with context, limit to 3
  const activeItems = allSkillProgress.flatMap((sp, si) =>
    sp.actionItems
      .filter((ai) => !ai.completed)
      .map((ai) => ({
        ai,
        sp,
        source: sourceMap.get(sp.sourceId),
        colorKey: SKILL_COLORS[si % SKILL_COLORS.length],
      }))
  ).slice(0, 3);

  const totalActive = allSkillProgress.flatMap((sp) =>
    sp.actionItems.filter((ai) => !ai.completed)
  ).length;

  if (allSkillProgress.length === 0 || totalActive === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h2 className="text-base font-bold text-gray-900 mb-4">Action Items Aktif</h2>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <span className="text-4xl mb-3">🎉</span>
          <p className="text-sm font-medium text-gray-600">
            {allSkillProgress.length === 0
              ? "Belum ada action item"
              : "Semua action item selesai!"}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {allSkillProgress.length === 0
              ? "Tambah sumber belajar untuk mulai melacak."
              : "Luar biasa! Tambah sumber baru untuk tantangan berikutnya."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 pt-5 pb-3 border-b border-gray-50">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-900">Action Items Aktif</h2>
          <span className="text-xs text-gray-400 bg-amber-50 text-amber-600 px-2.5 py-1 rounded-full font-medium">
            {totalActive} tersisa
          </span>
        </div>
      </div>

      <div className="p-4 space-y-1.5">
        {activeItems.map(({ ai, sp, source, colorKey }) => {
          const c = colorConfig[colorKey];
          return (
            <label
              key={ai.id}
              className="flex items-start gap-3 cursor-pointer group p-2.5 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <input
                type="checkbox"
                checked={false}
                onChange={() => onToggle(sp.id, ai.id)}
                className={`mt-0.5 w-4 h-4 rounded ${c.checkAccent} shrink-0 cursor-pointer`}
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-gray-700 leading-snug group-hover:text-gray-900 transition-colors">
                  {ai.text}
                </p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className={`text-xs font-medium ${c.text}`}>{sp.skillName}</span>
                  {source && (
                    <>
                      <span className="text-gray-300">·</span>
                      <span className="text-xs text-gray-400 truncate">{source.title}</span>
                    </>
                  )}
                </div>
              </div>
            </label>
          );
        })}
      </div>

      {totalActive > 3 && (
        <div className="px-5 pb-4 border-t border-gray-50 pt-3">
          <a
            href="/dashboard/actions"
            className="block text-xs text-center text-sky-600 hover:text-sky-800 font-medium transition-colors"
          >
            → {totalActive - 3} action lainnya di halaman Actions
          </a>
        </div>
      )}
    </div>
  );
}
