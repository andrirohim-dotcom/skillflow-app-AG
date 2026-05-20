import type { KeyInsight, LearningSource } from "@/lib/types";
import { SOURCE_TYPE_ICONS } from "@/lib/constants";

interface Props {
  insights: KeyInsight[];
  sources: LearningSource[];
  onAddInsight?: () => void;
}

export default function InsightsPanel({ insights, sources, onAddInsight }: Props) {
  const sourceMap = new Map(sources.map((s) => [s.id, s]));
  const recent = [...insights]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  if (insights.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-gray-900">Insight Terbaru</h2>
        </div>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <span className="text-4xl mb-3">💡</span>
          <p className="text-sm font-medium text-gray-500">Belum ada insight dicatat</p>
          <p className="text-xs text-gray-400 mt-1 max-w-xs">
            Catat kutipan atau pelajaran penting dari sumber belajar Anda.
          </p>
          {onAddInsight && (
            <button
              onClick={onAddInsight}
              className="mt-4 text-xs font-semibold text-sky-600 hover:text-sky-700 border border-sky-200 hover:border-sky-300 px-4 py-2 rounded-lg transition-colors"
            >
              + Catat Insight
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 pt-5 pb-3 border-b border-gray-50">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-900">Insight Terbaru</h2>
          <span className="text-xs text-gray-400 bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-full font-medium">
            {insights.length} total
          </span>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {recent.map((insight) => {
          const source = insight.sourceId ? sourceMap.get(insight.sourceId) : undefined;
          return (
            <div
              key={insight.id}
              className="bg-indigo-50 border border-indigo-100 rounded-xl p-3"
            >
              {/* Quote */}
              <p className="text-sm text-gray-800 leading-relaxed">
                <span className="text-indigo-300 text-lg font-serif mr-1">&ldquo;</span>
                {insight.quote}
                <span className="text-indigo-300 text-lg font-serif ml-1">&rdquo;</span>
              </p>

              {/* Reflection */}
              {insight.reflection && (
                <p className="text-xs text-gray-500 mt-1.5 italic">{insight.reflection}</p>
              )}

              {/* Source reference */}
              {source && (
                <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-indigo-100">
                  <span className="text-xs">
                    {SOURCE_TYPE_ICONS[source.progress.type]}
                  </span>
                  <span className="text-xs text-indigo-500 font-medium truncate">
                    {source.title}
                  </span>
                  {insight.skillTarget && (
                    <>
                      <span className="text-indigo-300">·</span>
                      <span className="text-xs text-gray-400">{insight.skillTarget}</span>
                    </>
                  )}
                </div>
              )}

              {/* Tags */}
              {insight.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {insight.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="text-xs bg-white text-indigo-500 border border-indigo-100 px-2 py-0.5 rounded-md"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {insights.length > 3 && (
        <div className="px-5 pb-4 border-t border-gray-50 pt-3">
          <a
            href="/dashboard/insights"
            className="block text-xs text-center text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
          >
            → Lihat semua {insights.length} insight
          </a>
        </div>
      )}
    </div>
  );
}
