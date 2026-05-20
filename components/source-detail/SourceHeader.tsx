import { getSourceProgress } from "@/lib/utils/sourceProgress";
import { colorConfig, sourceTypeColors } from "@/lib/utils/colorConfig";
import {
  SOURCE_TYPE_ICONS,
  SOURCE_TYPE_LABELS,
  SOURCE_STATUS_COLORS,
  SOURCE_STATUS_LABELS,
  DIFFICULTY_LABELS,
  DIFFICULTY_COLORS,
} from "@/lib/constants";
import type { LearningSource } from "@/lib/types";
import ReadingTimer from "./ReadingTimer";

interface Props {
  source: LearningSource;
  onEditClick: () => void;
  onProgressClick: () => void;
  onTimerFinish: (seconds: number) => void;
}

export default function SourceHeader({ source, onEditClick, onProgressClick, onTimerFinish }: Props) {
  const stats = getSourceProgress(source);
  const colorKey = sourceTypeColors[source.progress.type] ?? "sky";
  const c = colorConfig[colorKey];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
      {/* Color accent strip */}
      <div className={`h-1.5 w-full ${c.bar}`} />

      <div className="px-6 py-5">
        {/* Top row: badges + actions */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg ${c.badge}`}>
              <span>{SOURCE_TYPE_ICONS[source.progress.type]}</span>
              {SOURCE_TYPE_LABELS[source.progress.type]}
            </span>
            <span className={`text-xs font-medium px-2.5 py-1 rounded-lg ${SOURCE_STATUS_COLORS[source.status]}`}>
              {SOURCE_STATUS_LABELS[source.status]}
            </span>
            <span className={`text-xs font-medium px-2.5 py-1 rounded-lg ${DIFFICULTY_COLORS[source.difficultyLevel]}`}>
              {DIFFICULTY_LABELS[source.difficultyLevel]}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <ReadingTimer onFinish={onTimerFinish} />
            <button
              onClick={onEditClick}
              className="text-xs font-medium text-gray-500 hover:text-gray-700 border border-gray-200 hover:border-gray-300 px-3 py-1.5 rounded-lg transition-colors"
            >
              Edit Sumber
            </button>
            <button
              onClick={onProgressClick}
              className="text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 px-3 py-1.5 rounded-lg transition-colors"
            >
              Update Progres
            </button>
          </div>
        </div>

        {/* Title + creator */}
        <h1 className="text-2xl font-extrabold text-gray-900 leading-tight mb-1">
          {source.title}
        </h1>
        <p className="text-sm text-gray-500">{source.creatorName}</p>

        {/* URL */}
        {source.url && (
          <a
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-sky-500 hover:underline mt-1 inline-block"
          >
            {source.url}
          </a>
        )}

        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-gray-500">Progres keseluruhan</span>
            <span className={`text-sm font-extrabold ${c.text}`}>{stats.pct}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
            <div
              className={`h-2 rounded-full transition-all duration-700 ${c.bar}`}
              style={{ width: `${stats.pct}%` }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-xs text-gray-400">
              {stats.consumed} {stats.unitLabel}
            </span>
            <span className="text-xs text-gray-400">{stats.total} total</span>
          </div>
        </div>

        {/* Footer: tags + skills */}
        <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-gray-50">
          {source.topicTags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {source.topicTags.map((tag) => (
                <span key={tag} className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md">
                  {tag}
                </span>
              ))}
            </div>
          )}
          {source.skillTargets.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {source.skillTargets.map((sk) => (
                <span key={sk} className={`text-xs font-medium px-2 py-0.5 rounded-md ${c.badge}`}>
                  🎯 {sk}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
