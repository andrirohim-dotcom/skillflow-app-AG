"use client";

import { useMemo, useState } from "react";
import { useWorkspace } from "@/lib/contexts/WorkspaceContext";
import { saveWsInsight } from "@/lib/storageV2";
import type { KeyInsight, LearningSource } from "@/lib/types";
import { INSIGHT_TYPE_ICONS, INSIGHT_TYPE_COLORS, INSIGHT_TYPE_LABELS } from "@/lib/constants";

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
      <div className="bg-white border-2 border-emerald-100 rounded-3xl p-6 text-center animate-slide-up">
        <div className="text-4xl mb-2">🏆</div>
        <h3 className="text-lg font-black text-emerald-900 font-display">Review Selesai!</h3>
        <p className="text-xs text-emerald-600 mt-1 font-medium">+50 XP Bonus untuk memori tajammu 🧠</p>
        <div className="mt-4 flex justify-center gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
          ))}
        </div>
      </div>
    );
  }

  if (reviewIndex === null) {
    return (
      <div className="bg-gradient-to-br from-indigo-50 to-white border-2 border-indigo-100 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🧠</span>
            <h3 className="text-sm font-bold text-gray-900">Review Harian</h3>
          </div>
          <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">
            {dueInsights.length} Item
          </span>
        </div>
        <p className="text-xs text-gray-500 leading-relaxed mb-4">
          Segarkan ingatanmu dengan mereview insight yang sudah kamu pelajari. Ini membantu memindahkan informasi ke memori jangka panjang.
        </p>
        <button
          onClick={() => setReviewIndex(0)}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2.5 rounded-xl transition-all shadow-md shadow-indigo-100 active:scale-95"
        >
          Mulai Review Sekarang →
        </button>
      </div>
    );
  }

  const currentInsight = dueInsights[reviewIndex];
  const type = currentInsight.type || "insight";
  const source = sources.find(s => s.id === currentInsight.sourceId);

  return (
    <div className="bg-white border-2 border-sky-500 rounded-3xl p-6 shadow-xl animate-scale-in relative overflow-hidden">
      <div className="absolute top-0 right-0 p-3 opacity-10 text-4xl">
        {INSIGHT_TYPE_ICONS[type]}
      </div>
      
      <div className="flex items-center justify-between mb-4">
        <span className="text-[10px] font-black text-sky-500 uppercase tracking-widest">
          Item {reviewIndex + 1} dari {dueInsights.length}
        </span>
        <div className="flex items-center gap-1.5">
           <span className="text-xs">{INSIGHT_TYPE_ICONS[type]}</span>
           <span className="text-[10px] font-bold text-gray-400">{INSIGHT_TYPE_LABELS[type]}</span>
        </div>
      </div>

      <div className="min-h-[100px] flex flex-col justify-center">
        <p className="text-sm font-medium text-gray-800 leading-relaxed italic">
          "{currentInsight.quote}"
        </p>
        {currentInsight.reflection && (
          <p className="text-xs text-gray-400 mt-3 border-l-2 border-gray-100 pl-3">
            {currentInsight.reflection}
          </p>
        )}
      </div>

      {source && (
        <div className="mt-4 pt-3 border-t border-gray-50">
          <p className="text-[10px] text-gray-400">Dari sumber:</p>
          <p className="text-xs font-bold text-gray-600 truncate">📚 {source.title}</p>
        </div>
      )}

      <div className="mt-6 flex gap-3">
        <button
          onClick={() => handleReview(false)}
          className="flex-1 bg-gray-50 hover:bg-rose-50 text-gray-500 hover:text-rose-600 border border-gray-200 hover:border-rose-200 text-xs font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-2"
        >
          <span>🔁</span> Lupa
        </button>
        <button
          onClick={() => handleReview(true)}
          className="flex-1 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold py-2.5 rounded-xl transition-all shadow-md shadow-sky-100 flex items-center justify-center gap-2"
        >
          <span>👍</span> Ingat
        </button>
      </div>
    </div>
  );
}
