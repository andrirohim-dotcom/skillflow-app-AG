"use client";

import type { KeyInsight, LearningSource } from "@/lib/types";

interface Props {
  insights: KeyInsight[];
  sources: LearningSource[];
}

/**
 * Insight to Action Prompt
 * Encourages users to convert their best insights into action items.
 */
export default function InsightToActionPrompt({ insights, sources }: Props) {
  // Logic: Find insights that are reflections but might not have associated actions
  // For this version, we just pick the most recent reflection
  const reflection = insights.find(i => i.type === "reflection");
  
  if (!reflection) return null;

  const source = sources.find(s => s.id === reflection.sourceId);

  return (
    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-5 text-white shadow-lg overflow-hidden relative group">
      {/* Decorative background element */}
      <div className="absolute -right-4 -bottom-4 text-8xl opacity-10 rotate-12 group-hover:rotate-0 transition-transform duration-500">
        💡
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-3">
          <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest">Reflection Link</span>
          {source && <p className="text-[10px] text-indigo-100 font-bold truncate">dari {source.title}</p>}
        </div>
        
        <p className="text-sm font-medium italic leading-relaxed mb-4">
          "{reflection.quote.length > 80 ? reflection.quote.slice(0, 80) + "..." : reflection.quote}"
        </p>

        <div className="flex flex-col gap-2">
          <p className="text-xs text-indigo-100 mb-1">Ubah refleksi ini menjadi langkah nyata?</p>
          <a
            href="/dashboard/actions"
            className="inline-flex items-center justify-center bg-white text-indigo-600 text-xs font-black px-4 py-2.5 rounded-xl hover:bg-indigo-50 transition-colors shadow-sm"
          >
            Buat Action Item →
          </a>
        </div>
      </div>
    </div>
  );
}
