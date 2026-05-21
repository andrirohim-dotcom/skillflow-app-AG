"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getWsInsights, getWsSources } from "@/lib/storageV2";
import { useWorkspace } from "@/lib/contexts/WorkspaceContext";
import { exportInsightsToMarkdown } from "@/lib/utils/exportInsights";
import {
  INSIGHT_TYPE_LABELS,
  INSIGHT_TYPE_ICONS,
  INSIGHT_TYPE_COLORS,
} from "@/lib/constants";
import type { KeyInsight, LearningSource, InsightType } from "@/lib/types";
import QuickCaptureFAB from "@/components/dashboard/QuickCaptureFAB";

// ─── Insight Card ─────────────────────────────────────────────────────────────

function InsightCard({
  insight,
  source,
}: {
  insight: KeyInsight;
  source: LearningSource | undefined;
}) {
  const type = insight.type ?? "insight";
  const colorClass = INSIGHT_TYPE_COLORS[type];

  return (
    <div className={`rounded-2xl p-4 transition-all duration-300 hover:shadow-xl hover:bg-surface/50 backdrop-blur-md ${colorClass}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-1.5">
          <span className="text-base">{INSIGHT_TYPE_ICONS[type]}</span>
          <span className="text-xs font-semibold text-text">{INSIGHT_TYPE_LABELS[type]}</span>
        </div>
        <span className="text-xs text-text-mute shrink-0">
          {new Date(insight.createdAt).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </span>
      </div>

      {/* Content */}
      <p className="text-sm leading-relaxed font-medium text-text">
        {type === "quote" ? `"${insight.quote}"` : insight.quote}
      </p>

      {insight.reflection && (
        <p className="text-xs mt-2 text-text-dim italic leading-relaxed">{insight.reflection}</p>
      )}

      {/* Footer */}
      <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-3 border-t border-line">
        {source && (
          <span className="text-xs text-text-dim bg-white/5 border border-line px-2 py-0.5 rounded-md truncate max-w-[180px]">
            📚 {source.title}
          </span>
        )}
        {insight.pageOrTimestamp && (
          <span className="text-xs text-text-dim bg-white/5 border border-line px-2 py-0.5 rounded-md">
            @ {insight.pageOrTimestamp}
          </span>
        )}
        {insight.skillTarget && (
          <span className="text-xs text-text-dim bg-white/5 border border-line px-2 py-0.5 rounded-md">
            🎯 {insight.skillTarget}
          </span>
        )}
        {insight.tags.map((tag) => (
          <span key={tag} className="text-xs text-text-dim bg-white/5 border border-line px-2 py-0.5 rounded-md">
            #{tag}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center bg-surface/30 border border-dashed border-line rounded-2xl backdrop-blur-md animate-slide-up">
      <div className="text-6xl mb-4">💡</div>
      <h3 className="text-lg font-bold text-text">Belum ada insights</h3>
      <p className="text-sm text-text-mute mt-1 max-w-xs">
        Catat insights, kutipan, konsep, dan refleksi dari sumber belajar Anda di halaman detail.
      </p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const INSIGHT_TYPES: InsightType[] = ["insight", "quote", "concept", "reflection"];

export default function InsightsPage() {
  const { currentUser: user, currentWorkspace: workspace } = useWorkspace();
  const [insights, setInsights] = useState<KeyInsight[]>([]);
  const [sources, setSources] = useState<LearningSource[]>([]);
  const [mounted, setMounted] = useState(false);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<InsightType | "all">("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [tagFilters, setTagFilters] = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    if (!user || !workspace) return;
    
    // Simulate async
    await new Promise(r => setTimeout(r, 0));

    const raw = await getWsInsights(workspace.id, user.id);
    const src = await getWsSources(workspace.id, user.id, "all");
    
    setInsights(raw.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
    setSources(src);
  }, [user, workspace]);

  useEffect(() => {
    load();
    setMounted(true);
  }, [load]);

  // Collect all unique tags
  const allTags = useMemo(
    () => [...new Set(insights.flatMap((i) => i.tags))].sort(),
    [insights]
  );

  const filtered = useMemo(() => {
    let r = insights;
    if (typeFilter !== "all") r = r.filter((i) => (i.type ?? "insight") === typeFilter);
    if (sourceFilter !== "all") r = r.filter((i) => i.sourceId === sourceFilter);
    if (tagFilters.size > 0) r = r.filter((i) => [...tagFilters].some((t) => i.tags.includes(t)));
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter(
        (i) =>
          i.quote.toLowerCase().includes(q) ||
          (i.reflection ?? "").toLowerCase().includes(q) ||
          i.tags.some((t) => t.toLowerCase().includes(q)) ||
          (i.skillTarget ?? "").toLowerCase().includes(q)
      );
    }
    return r;
  }, [insights, typeFilter, sourceFilter, tagFilters, search]);

  if (!mounted) return <Skeleton />;

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-text">Insights</h1>
          <p className="text-sm text-text-mute mt-0.5">{insights.length} insight tersimpan</p>
        </div>
        {/* Type breakdown pills + Export */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5">
            {INSIGHT_TYPES.map((t) => {
              const count = insights.filter((i) => (i.type ?? "insight") === t).length;
              if (count === 0) return null;
              return (
                <button
                  key={t}
                  onClick={() => setTypeFilter(typeFilter === t ? "all" : t)}
                  className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-all ${
                    INSIGHT_TYPE_COLORS[t]
                  } ${typeFilter === t ? "ring-2 ring-current/30" : "opacity-70 hover:opacity-100"}`}
                >
                  {INSIGHT_TYPE_ICONS[t]} {count}
                </button>
              );
            })}
          </div>
          {filtered.length > 0 && (
            <button
              type="button"
              onClick={() => exportInsightsToMarkdown(filtered)}
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-line bg-surface/50 text-text hover:border-indigo-500/40 hover:bg-surface transition-all"
              title="Export insight yang ditampilkan ke Markdown"
            >
              ↓ Export MD
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-surface/40 border border-line rounded-2xl p-4 mb-6 shadow-lg backdrop-blur-md space-y-3">
        {/* Search */}
        <input
          type="text"
          placeholder="Cari di semua insights..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full text-sm border border-line bg-surface/50 rounded-xl px-3.5 py-2 text-text placeholder:text-text-mute focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/30 transition-all duration-200"
        />

        {/* Type pills */}
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setTypeFilter("all")}
            className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-all duration-200 ${
              typeFilter === "all"
                ? "bg-indigo-sleek text-white border-indigo-500/40"
                : "bg-white/5 text-text-dim border-line hover:border-indigo-500/30 hover:text-text hover:bg-white/10"
            }`}
          >
            Semua Tipe
          </button>
          {INSIGHT_TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(typeFilter === t ? "all" : t)}
              className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-all duration-200 ${
                typeFilter === t
                  ? "bg-indigo-sleek text-white border-indigo-500/40"
                  : "bg-white/5 text-text-dim border-line hover:border-indigo-500/30 hover:text-text hover:bg-white/10"
              }`}
            >
              {INSIGHT_TYPE_ICONS[t]} {INSIGHT_TYPE_LABELS[t]}
            </button>
          ))}
        </div>

        {/* Source dropdown */}
        {sources.length > 0 && (
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="text-xs border border-line rounded-lg px-2.5 py-1.5 text-text-dim bg-surface/80 focus:outline-none focus:ring-1 focus:ring-indigo-500/40 focus:border-indigo-500/30 transition-all cursor-pointer"
          >
            <option value="all">Semua Sumber</option>
            {sources.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>
        )}

        {/* Tag Cloud (multi-select) */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tagFilters.size > 0 && (
              <button
                onClick={() => setTagFilters(new Set())}
                className="text-xs font-medium px-2.5 py-1 rounded-lg border bg-rose-500/20 border-rose-500/30 text-rose-400 hover:bg-rose-500/30 transition-all"
              >
                Semua Tag ✕
              </button>
            )}
            {allTags.map((tag) => {
              const count = insights.filter((i) => i.tags.includes(tag)).length;
              const isActive = tagFilters.has(tag);
              return (
                <button
                  key={tag}
                  onClick={() => {
                    setTagFilters((prev) => {
                      const next = new Set(prev);
                      if (next.has(tag)) next.delete(tag);
                      else next.add(tag);
                      return next;
                    });
                  }}
                  className={`text-xs font-medium px-2.5 py-1 rounded-lg border transition-all duration-200 ${
                    isActive
                      ? "bg-indigo-sleek text-white border-indigo-500/40"
                      : "bg-white/5 text-text-dim border-line hover:border-indigo-500/30 hover:text-text hover:bg-white/10"
                  }`}
                >
                  #{tag}
                  <span className={`ml-1 text-xs ${isActive ? "opacity-70" : "opacity-50"}`}>{count}</span>
                </button>
              );
            })}
          </div>
        )}

        <p className="text-xs text-text-mute">
          Menampilkan{" "}
          <span className="font-semibold text-text-dim">{filtered.length}</span> dari{" "}
          {insights.length} insights
        </p>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="columns-1 sm:columns-2 xl:columns-3 gap-4 space-y-0 animate-slide-up">
          {filtered.map((insight) => (
            <div key={insight.id} className="break-inside-avoid mb-4">
              <InsightCard
                insight={insight}
                source={sources.find((s) => s.id === insight.sourceId)}
              />
            </div>
          ))}
        </div>
      )}

      <QuickCaptureFAB onRefresh={load} />
    </>
  );
}

// Skeleton loading layout
function Skeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-10 bg-white/5 border border-line rounded-xl w-48" />
      <div className="h-36 bg-white/5 border border-line rounded-2xl" />
      <div className="columns-1 sm:columns-2 xl:columns-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-36 bg-white/5 border border-line rounded-2xl mb-4 break-inside-avoid" />
        ))}
      </div>
    </div>
  );
}
