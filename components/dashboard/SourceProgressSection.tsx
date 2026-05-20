"use client";

import { useMemo, useState } from "react";
import { getSourceProgress } from "@/lib/utils/sourceProgress";
import { sortSources, type SortKey } from "@/lib/utils/analytics";
import {
  SOURCE_TYPE_ICONS,
  SOURCE_TYPE_LABELS,
  SOURCE_STATUS_COLORS,
  SOURCE_STATUS_LABELS,
  DIFFICULTY_COLORS,
  DIFFICULTY_LABELS,
} from "@/lib/constants";
import { colorConfig, sourceTypeColors } from "@/lib/utils/colorConfig";
import type { LearningSource, LearningSession, SkillProgress, SourceStatus, SourceType } from "@/lib/types";

// ─── Sub-components ───────────────────────────────────────────────────────────

function SourceCard({
  source,
  skills,
}: {
  source: LearningSource;
  skills: SkillProgress[];
}) {
  const stats = getSourceProgress(source);
  const colorKey = sourceTypeColors[source.progress.type] ?? "sky";
  const c = colorConfig[colorKey];
  const completedItems = skills.flatMap((sp) => sp.actionItems).filter((ai) => ai.completed).length;
  const totalItems = skills.flatMap((sp) => sp.actionItems).length;

  return (
    <div className="group bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-gray-200 transition-all">
      {/* Top row */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg ${c.badge}`}
          >
            {SOURCE_TYPE_ICONS[source.progress.type]}
            {SOURCE_TYPE_LABELS[source.progress.type]}
          </span>
          <span
            className={`text-xs font-medium px-2 py-1 rounded-lg ${
              SOURCE_STATUS_COLORS[source.status]
            }`}
          >
            {SOURCE_STATUS_LABELS[source.status]}
          </span>
          <span
            className={`text-xs font-medium px-2 py-1 rounded-lg ${
              DIFFICULTY_COLORS[source.difficultyLevel]
            }`}
          >
            {DIFFICULTY_LABELS[source.difficultyLevel]}
          </span>
        </div>
        <span className={`text-sm font-extrabold shrink-0 ${c.text}`}>
          {stats.pct}%
        </span>
      </div>

      {/* Title + Creator */}
      <h3 className="font-bold text-gray-900 text-sm leading-snug">{source.title}</h3>
      <p className="text-xs text-gray-400 mt-0.5">{source.creatorName}</p>

      {/* Progress bar */}
      <div className="mt-3 w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
        <div
          className={`h-1.5 rounded-full transition-all duration-500 ${c.bar}`}
          style={{ width: `${stats.pct}%` }}
        />
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-xs text-gray-400">
          {stats.consumed} {stats.unitLabel}
        </span>
        <span className="text-xs text-gray-400">{stats.total} total</span>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
        {/* Skill chips */}
        <div className="flex flex-wrap gap-1 min-w-0">
          {source.skillTargets.slice(0, 2).map((sk) => (
            <span
              key={sk}
              className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md truncate max-w-[100px]"
            >
              {sk}
            </span>
          ))}
          {source.skillTargets.length > 2 && (
            <span className="text-xs text-gray-400">
              +{source.skillTargets.length - 2}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {totalItems > 0 && (
            <span className="text-xs text-gray-400">
              {completedItems}/{totalItems} action
            </span>
          )}
          <a
            href={`/dashboard/item/${source.id}`}
            className="text-xs font-medium text-sky-600 hover:text-sky-800 hover:underline transition-colors"
          >
            Lihat Detail →
          </a>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const TYPE_FILTERS: { label: string; value: SourceType | "all" }[] = [
  { label: "Semua", value: "all" },
  { label: "📚 Buku", value: "book" },
  { label: "▶️ YouTube", value: "youtube" },
  { label: "📄 Artikel", value: "article" },
  { label: "🎧 Podcast", value: "podcast" },
  { label: "🎓 Kursus", value: "course" },
];

const STATUS_FILTERS: { label: string; value: SourceStatus | "all" }[] = [
  { label: "Semua Status", value: "all" },
  { label: "Sedang Belajar", value: "in_progress" },
  { label: "Belum Dimulai", value: "not_started" },
  { label: "Selesai", value: "completed" },
  { label: "Ditunda", value: "on_hold" },
];

const SORT_OPTIONS: { label: string; value: SortKey }[] = [
  { label: "Terbaru", value: "newest" },
  { label: "Paling Sedikit Progres", value: "least_progress" },
  { label: "Paling Aktif", value: "most_active" },
];

interface Props {
  sources: LearningSource[];
  sessions: LearningSession[];
  allSkillProgress: SkillProgress[];
}

export default function SourceProgressSection({ sources, sessions, allSkillProgress }: Props) {
  const [typeFilter, setTypeFilter] = useState<SourceType | "all">("all");
  const [statusFilter, setStatusFilter] = useState<SourceStatus | "all">("all");
  const [sortKey, setSortKey] = useState<SortKey>("newest");

  const filtered = useMemo(() => {
    let result = sources;
    if (typeFilter !== "all")
      result = result.filter((s) => s.progress.type === typeFilter);
    if (statusFilter !== "all")
      result = result.filter((s) => s.status === statusFilter);
    return sortSources(result, sortKey, sessions);
  }, [sources, typeFilter, statusFilter, sortKey, sessions]);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-5 pb-4 border-b border-gray-50">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-gray-900">Progres Belajar</h2>
          <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
            {filtered.length} sumber
          </span>
        </div>

        {/* Type filter pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
          {TYPE_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setTypeFilter(f.value)}
              className={`shrink-0 text-xs font-medium px-3 py-1.5 rounded-lg border transition-all ${
                typeFilter === f.value
                  ? "bg-sky-600 text-white border-sky-600"
                  : "bg-white text-gray-500 border-gray-200 hover:border-sky-200 hover:text-sky-600"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Status + Sort row */}
        <div className="flex gap-2 mt-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as SourceStatus | "all")}
            className="flex-1 text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 text-gray-600 bg-white focus:outline-none focus:ring-1 focus:ring-sky-300"
          >
            {STATUS_FILTERS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
            className="flex-1 text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 text-gray-600 bg-white focus:outline-none focus:ring-1 focus:ring-sky-300"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                Urutkan: {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* List */}
      <div className="p-4 space-y-3 max-h-[560px] overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <span className="text-4xl mb-3">📂</span>
            <p className="text-sm font-medium text-gray-500">Tidak ada sumber ditemukan</p>
            <p className="text-xs text-gray-400 mt-1">
              {sources.length === 0
                ? "Tambahkan sumber belajar pertama Anda."
                : "Coba ubah filter di atas."}
            </p>
          </div>
        ) : (
          filtered.map((source) => (
            <SourceCard
              key={source.id}
              source={source}
              skills={allSkillProgress.filter((sp) => sp.sourceId === source.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
