"use client";

import type { KeyInsight, LearningSource } from "@/lib/types";
import { Card, Icon } from "./SleekPrimitives";

interface Props {
  insights: KeyInsight[];
  sources: LearningSource[];
  onAddInsight?: () => void;
}

export default function InsightsPanel({ insights, sources, onAddInsight }: Props) {
  const sourceMap = new Map(sources.map((s) => [s.id, s]));
  const recent = [...insights]
    .sort((a, b) => new Date(b.createdAt || "").getTime() - new Date(a.createdAt || "").getTime())
    .slice(0, 3);

  if (insights.length === 0) {
    return (
      <Card className="p-[22px]" accent="indigo">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="mono text-[10px] text-indigo-2 uppercase tracking-[0.12em] mb-1">
              Insights
            </div>
            <div className="text-sm font-semibold text-text">Insight Terbaru</div>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <span className="text-3xl mb-2">💡</span>
          <p className="text-xs font-semibold text-text-dim">Belum ada insight dicatat</p>
          <p className="text-[10px] text-text-mute mt-1 max-w-xs leading-normal">
            Catat kutipan atau pelajaran penting dari sumber belajar Anda.
          </p>
          {onAddInsight && (
            <button
              onClick={onAddInsight}
              className="mt-4 btn py-2 px-3 text-xs"
            >
              + Catat Insight
            </button>
          )}
        </div>
      </Card>
    );
  }

  const getTypeIcon = (type: string) => {
    return type === "podcast" ? "podcast" : type === "youtube" ? "video" : "book";
  };

  return (
    <Card className="p-[22px]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="mono text-[10px] text-indigo-2 uppercase tracking-[0.12em] mb-1">
            Insights
          </div>
          <div className="text-sm font-semibold text-text">Insight Terbaru</div>
        </div>
        <span className="chip text-indigo-2 border-indigo-2/20">
          {insights.length} total
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {recent.map((insight) => {
          const source = insight.sourceId ? sourceMap.get(insight.sourceId) : undefined;
          return (
            <div
              key={insight.id}
              className="bg-white/[0.02] border border-white/5 rounded-xl p-3"
            >
              {/* Quote */}
              <p className="text-xs text-text-dim leading-relaxed">
                <span className="text-indigo-2 text-md font-serif mr-1">&ldquo;</span>
                {insight.quote}
                <span className="text-indigo-2 text-md font-serif ml-1">&rdquo;</span>
              </p>

              {/* Reflection */}
              {insight.reflection && (
                <p className="text-[10px] text-text-mute mt-1.5 italic leading-relaxed">
                  {insight.reflection}
                </p>
              )}

              {/* Source reference */}
              {source && (
                <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-white/5 text-[10px] text-text-mute">
                  <Icon name={getTypeIcon(source.progress.type)} size={11} className="text-indigo-2" />
                  <span className="font-medium truncate max-w-[120px]">
                    {source.title}
                  </span>
                  {insight.skillTarget && (
                    <>
                      <span>·</span>
                      <span className="truncate max-w-[100px]">{insight.skillTarget}</span>
                    </>
                  )}
                </div>
              )}

              {/* Tags */}
              {insight.tags && insight.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {insight.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="chip text-[9px] py-0 px-1.5 text-indigo-2 border-indigo-2/15 bg-indigo-500/[0.02]"
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
        <div className="mt-4 pt-3.5 border-t border-white/5">
          <a
            href="/dashboard/insights"
            className="block mono text-[9px] text-center text-indigo-2 hover:text-indigo-3 transition-colors uppercase tracking-wider"
          >
            → Lihat semua {insights.length} insight
          </a>
        </div>
      )}
    </Card>
  );
}
