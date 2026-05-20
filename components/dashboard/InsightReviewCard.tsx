"use client";

import { useEffect, useState } from "react";
import { INSIGHT_TYPE_ICONS, INSIGHT_TYPE_LABELS } from "@/lib/constants";
import type { KeyInsight, LearningSource } from "@/lib/types";

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  insights: KeyInsight[];
  sources: LearningSource[];
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function InsightReviewCard({ insights, sources }: Props) {
  const [mounted, setMounted] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const oldInsights = insights.filter(
      (i) => new Date(i.createdAt) < sevenDaysAgo
    );

    if (insights.length < 5 || oldInsights.length === 0) {
      setMounted(true);
      return;
    }

    const stored = sessionStorage.getItem("insight_review_id");
    const storedInsight = stored ? oldInsights.find((i) => i.id === stored) : null;

    if (storedInsight) {
      setSelectedId(stored);
    } else {
      const random = oldInsights[Math.floor(Math.random() * oldInsights.length)];
      sessionStorage.setItem("insight_review_id", random.id);
      setSelectedId(random.id);
    }

    setMounted(true);
  }, [insights]);

  if (!mounted || dismissed || !selectedId) return null;

  const selectedInsight = insights.find((i) => i.id === selectedId);
  if (!selectedInsight) return null;

  const source = sources.find((s) => s.id === selectedInsight.sourceId);

  return (
    <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-bold text-indigo-500 uppercase tracking-wide">
          🔁 Ingat Ini?
        </p>
        <button
          onClick={() => setDismissed(true)}
          className="text-indigo-300 hover:text-indigo-500 text-xs transition-colors"
          aria-label="Tutup"
        >
          ✕
        </button>
      </div>

      {/* Content */}
      <p className="text-sm text-gray-800 leading-relaxed mb-2">
        <span className="text-indigo-300 text-lg font-serif mr-1">&ldquo;</span>
        {selectedInsight.quote}
        <span className="text-indigo-300 text-lg font-serif ml-1">&rdquo;</span>
      </p>

      {/* Type badge + source */}
      <div className="flex items-center justify-between mt-3 pt-2 border-t border-indigo-100">
        <div className="flex items-center gap-2 min-w-0">
          {selectedInsight.type && (
            <span className="shrink-0 text-xs font-semibold bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-md">
              {INSIGHT_TYPE_ICONS[selectedInsight.type]} {INSIGHT_TYPE_LABELS[selectedInsight.type]}
            </span>
          )}
          {source && (
            <span className="text-xs text-gray-400 truncate">{source.title}</span>
          )}
        </div>
        {source && (
          <a
            href={`/dashboard/item/${source.id}`}
            className="shrink-0 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors ml-2"
          >
            Buka Sumber →
          </a>
        )}
      </div>
    </div>
  );
}
