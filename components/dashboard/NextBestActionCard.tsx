"use client";

import type { SkillProgress, LearningSource } from "@/lib/types";
import { Card, Icon, Check } from "./SleekPrimitives";

interface Props {
  skillProgress: SkillProgress[];
  sources: LearningSource[];
  onToggle: (skillProgressId: string, actionItemId: string) => void;
}

export default function NextBestActionCard({ skillProgress, sources, onToggle }: Props) {
  const sourceMap = new Map(sources.map((s) => [s.id, s]));

  // Find the next best action: first uncompleted item from highest-level skill
  let nextAction = null;

  const skillsByLevel = skillProgress.slice().sort((a, b) => {
    const levels = ["mastered", "applied", "understanding", "awareness"];
    const aLevel = levels.indexOf(a.level ?? "awareness");
    const bLevel = levels.indexOf(b.level ?? "awareness");
    return aLevel - bLevel;
  });

  for (const sp of skillsByLevel) {
    const uncompleted = sp.actionItems.find((ai) => !ai.completed);
    if (uncompleted) {
      nextAction = { ai: uncompleted, sp, source: sourceMap.get(sp.sourceId) };
      break;
    }
  }

  if (!nextAction) {
    return (
      <Card className="p-[22px]" accent="cyan">
        <div className="flex items-center gap-3 mb-3.5">
          <div className="w-[30px] h-[30px] rounded-lg bg-cyan-500/10 text-cyan-2 flex items-center justify-center border border-cyan-500/30">
            <Icon name="check" size={14} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="mono text-[10px] text-cyan-2 uppercase tracking-[0.12em] mb-0.5">
              Aksi Selanjutnya
            </div>
            <div className="text-sm font-semibold text-text truncate">
              Semua Tugas Selesai
            </div>
          </div>
        </div>
        <p className="text-xs text-text-dim leading-relaxed">
          Hebat! Semua action item sudah selesai. Tambahkan skill baru atau sumber belajar untuk melanjutkan.
        </p>
      </Card>
    );
  }

  const { ai, sp, source } = nextAction;

  return (
    <Card className="ring-cyan p-[22px] flex flex-col justify-between" accent="cyan">
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-[30px] h-[30px] rounded-lg bg-cyan-500/10 text-cyan-2 flex items-center justify-center border border-cyan-500/30">
            <Icon name="bolt" size={14} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="mono text-[10px] text-cyan-2 uppercase tracking-[0.12em] mb-0.5">
              Aksi Selanjutnya
            </div>
            <div className="text-sm font-semibold text-text truncate">
              Rekomendasi Refleks
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3.5 group cursor-pointer" onClick={() => onToggle(sp.id, ai.id)}>
          <div className="mt-0.5 shrink-0">
            <Check on={false} accent="cyan" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-text leading-snug group-hover:text-text-dim transition-colors mb-3">
              {ai.text}
            </p>

            <div className="flex flex-wrap items-center gap-2">
              <span className="chip text-indigo-2 border-indigo-2/20">
                {sp.skillName}
              </span>
              {source && (
                <span className="chip text-text-mute border-white/5 bg-white/[0.02] max-w-[150px] truncate">
                  {source.title}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3.5 border-t border-white/5 flex items-center gap-2 text-text-mute">
        <Icon name="lightbulb" size={13} className="text-cyan-2" />
        <span className="text-[10px] tracking-wide">
          Saran: Kerjakan ini sekarang untuk mempertahankan momentum belajar.
        </span>
      </div>
    </Card>
  );
}
