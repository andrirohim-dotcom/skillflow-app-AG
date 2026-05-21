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
    <div className="glass border-white/10 shadow-card-depth overflow-hidden mb-6">
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
              className="text-xs font-medium text-text-dim hover:text-text bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 px-3 py-1.5 rounded-lg transition-all active:scale-95 cursor-pointer shadow-sm"
            >
              Edit Sumber
            </button>
            <button
              onClick={onProgressClick}
              className="text-xs font-semibold text-white bg-gradient-to-r from-indigo-sleek to-violet-sleek hover:from-indigo-sleek/90 hover:to-violet-sleek/90 px-3.5 py-1.5 rounded-lg transition-all active:scale-95 shadow-glow-primary border border-indigo-500/30 cursor-pointer"
            >
              Update Progres
            </button>
          </div>
        </div>

        {/* Title + creator */}
        <h1 className="text-2xl font-extrabold text-text leading-tight mb-1">
          {source.title}
        </h1>
        <p className="text-sm text-text-mute">{source.creatorName}</p>

        {/* URL */}
        {source.url && (() => {
          let displayUrl = source.url;
          try {
            const urlObj = new URL(source.url);
            displayUrl = urlObj.hostname;
          } catch (e) {
            displayUrl = source.url.replace(/^(https?:\/\/)?(www\.)?/, "").split("/")[0];
          }
          return (
            <div className="mt-2.5">
              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs bg-sky-500/10 hover:bg-sky-500/15 text-sky-400 border border-sky-500/20 hover:border-sky-500/35 px-2.5 py-1.5 rounded-lg transition-all shadow-sm cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
                <span>{displayUrl} ↗</span>
              </a>
            </div>
          );
        })()}

        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-text-dim">Progres keseluruhan</span>
            <span className={`text-sm font-extrabold ${c.text}`}>{stats.pct}%</span>
          </div>
          <div className="w-full bg-white/5 border border-white/5 rounded-full h-2 overflow-hidden">
            <div
              className={`h-2 rounded-full transition-all duration-700 ${c.bar}`}
              style={{ width: `${stats.pct}%` }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-xs text-text-mute">
              {stats.consumed} {stats.unitLabel}
            </span>
            <span className="text-xs text-text-mute">{stats.total} total</span>
          </div>
        </div>

        {/* Footer: tags + skills */}
        <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-white/5">
          {source.topicTags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {source.topicTags.map((tag) => (
                <span key={tag} className="text-xs bg-white/5 text-text-dim border border-white/5 px-2 py-0.5 rounded-md">
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
