"use client";

import { useMemo, useState } from "react";
import { useWorkspace } from "@/lib/contexts/WorkspaceContext";
import { saveWsInsight } from "@/lib/storageV2";
import type { KeyInsight, LearningSource } from "@/lib/types";
import { INSIGHT_TYPE_ICONS, INSIGHT_TYPE_LABELS } from "@/lib/constants";

interface Props {
  insights: KeyInsight[];
  sources: LearningSource[];
  onRefresh: () => void;
}

export default function DailyReview({ insights, sources, onRefresh }: Props) {
  const { currentUser: user, currentWorkspace: workspace } = useWorkspace();
  const [reviewIndex, setReviewIndex] = useState<number | null>(null); // null means not started
  const [isFinished, setIsFinished] = useState(false);

  const dueInsights = useMemo(() => {
    const now = Date.now();
    return insights.filter((insight) => {
      const lastReviewed = insight.lastReviewedAt ? new Date(insight.lastReviewedAt).getTime() : new Date(insight.createdAt).getTime();
      const intervalMs = (insight.reviewIntervalDays || 1) * 24 * 60 * 60 * 1000;
      return lastReviewed + intervalMs <= now;
    }).slice(0, 3); // Max 3 per day as requested
  }, [insights]);

  if (dueInsights.length === 0 && !isFinished) return null;

  async function handleReview(remembered: boolean) {
    if (reviewIndex === null || !user || !workspace) return;
    
    const insight = dueInsights[reviewIndex];
    const newInterval = remembered 
      ? Math.min((insight.reviewIntervalDays || 1) * 2, 30) 
      : 1;

    const updated: KeyInsight = {
      ...insight,
      lastReviewedAt: new Date().toISOString(),
      reviewIntervalDays: newInterval,
    };

    await saveWsInsight(workspace.id, user.id, updated);

    if (reviewIndex < dueInsights.length - 1) {
      setReviewIndex(reviewIndex + 1);
    } else {
      setIsFinished(true);
      setReviewIndex(null);
      setTimeout(() => {
        onRefresh(); // Refresh parent to clear the widget
      }, 3000);
    }
  }

  if (isFinished) {
    return (
      <div className="bg-surface/80 border border-emerald-500/25 rounded-3xl p-6 text-center animate-slide-up backdrop-blur-md shadow-lg shadow-emerald-500/5">
        <div className="text-4xl mb-2 animate-bounce">🏆</div>
        <h3 className="text-lg font-black text-emerald-400 font-display">Review Selesai!</h3>
        <p className="text-xs text-emerald-500/80 mt-1 font-medium">+50 XP Bonus untuk memori tajammu 🧠</p>
        <div className="mt-4 flex justify-center gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="w-2 h-2 rounded-full bg-emerald-500/70 animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
          ))}
        </div>
      </div>
    );
  }

  if (reviewIndex === null) {
    return (
      <div className="bg-surface/50 border border-line rounded-3xl p-6 shadow-lg backdrop-blur-md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🧠</span>
            <h3 className="text-sm font-bold text-text">Review Harian</h3>
          </div>
          <span className="bg-indigo-500/10 text-indigo-2 border border-indigo-500/25 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">
            {dueInsights.length} Item
          </span>
        </div>
        <p className="text-xs text-text-dim leading-relaxed mb-4">
          Segarkan ingatanmu dengan mereview insight yang sudah kamu pelajari. Ini membantu memindahkan informasi ke memori jangka panjang.
        </p>
        <button
          onClick={() => setReviewIndex(0)}
          className="w-full bg-indigo-sleek hover:bg-indigo-2 text-white text-xs font-bold py-2.5 rounded-xl transition-all shadow-md shadow-indigo-500/10 active:scale-95 flex items-center justify-center gap-1"
        >
          <span>Mulai Review Sekarang</span>
          <span className="text-sm">→</span>
        </button>
      </div>
    );
  }

  const currentInsight = dueInsights[reviewIndex];
  const type = currentInsight.type || "insight";
  const source = sources.find(s => s.id === currentInsight.sourceId);

  return (
    <div className="bg-surface/85 border border-indigo-500/20 rounded-3xl p-6 shadow-xl animate-scale-in relative overflow-hidden backdrop-blur-md">
      <div className="absolute top-0 right-0 p-3 opacity-[0.03] text-4xl pointer-events-none select-none">
        {INSIGHT_TYPE_ICONS[type]}
      </div>
      
      <div className="flex items-center justify-between mb-4">
        <span className="text-[10px] font-black text-indigo-2 uppercase tracking-widest bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
          Item {reviewIndex + 1} dari {dueInsights.length}
        </span>
        <div className="flex items-center gap-1.5">
           <span className="text-xs">{INSIGHT_TYPE_ICONS[type]}</span>
           <span className="text-[10px] font-bold text-text-mute">{INSIGHT_TYPE_LABELS[type]}</span>
        </div>
      </div>

      <div className="min-h-[100px] flex flex-col justify-center">
        <p className="text-sm font-medium text-text leading-relaxed italic">
          "{currentInsight.quote}"
        </p>
        {currentInsight.reflection && (
          <p className="text-xs text-text-dim mt-3 border-l-2 border-line pl-3 leading-relaxed">
            {currentInsight.reflection}
          </p>
        )}
      </div>

      {source && (
        <div className="mt-4 pt-3 border-t border-line">
          <p className="text-[10px] text-text-mute">Dari sumber:</p>
          <p className="text-xs font-bold text-text-dim truncate">📚 {source.title}</p>
        </div>
      )}

      <div className="mt-6 flex gap-3">
        <button
          onClick={() => handleReview(false)}
          className="flex-1 bg-white/5 hover:bg-rose-500/10 text-text-dim hover:text-rose-400 border border-line hover:border-rose-500/35 text-xs font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-2"
        >
          <span>🔁</span> Lupa
        </button>
        <button
          onClick={() => handleReview(true)}
          className="flex-1 bg-indigo-sleek hover:bg-indigo-2 text-white text-xs font-bold py-2.5 rounded-xl transition-all shadow-md shadow-indigo-500/15 flex items-center justify-center gap-2"
        >
          <span>👍</span> Ingat
        </button>
      </div>
    </div>
  );
}
