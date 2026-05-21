"use client";

import React from "react";
import type { LearningSource } from "@/lib/types";
import { Card, Icon, ProgressBar } from "./SleekPrimitives";

interface Props {
  sources: LearningSource[];
  onStartBounty?: () => void;
}

export default function SleekBountyQuest({ sources, onStartBounty }: Props) {
  // Let's compute actual progress:
  // How many sources are in_progress or completed this week
  const finishedThisWeek = sources.filter((s) => s.status === "completed").length;
  const targetSources = 2;
  const progressPct = Math.min(100, Math.round((finishedThisWeek / targetSources) * 100));

  // Time remaining until end of week (Sunday midnight)
  const getTimeRemaining = () => {
    const now = new Date();
    const result = new Date();
    result.setDate(now.getDate() + (7 - now.getDay()));
    result.setHours(23, 59, 59, 999);
    
    const diff = result.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    return `${days}h ${hours}j`;
  };

  const timeStr = getTimeRemaining();

  return (
    <Card className="ring-amber p-[22px]" accent="amber" id="tour-quests">
      <div className="flex items-center gap-3 mb-3.5">
        <div className="w-[30px] h-[30px] rounded-lg bg-amber-500/10 text-amber-2 flex items-center justify-center border border-amber-500/30">
          <Icon name="target" size={14} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="mono text-[10px] text-amber-2 uppercase tracking-[0.12em] mb-0.5">
            Bounty Aktif
          </div>
          <div className="text-sm font-semibold text-text truncate">
            Quest Refleksi Mingguan
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="mono text-[9px] text-text-mute uppercase tracking-wider">Berakhir</div>
          <div className="text-xs font-semibold text-amber-2">{timeStr}</div>
        </div>
      </div>

      <div className="text-xs text-text-dim mb-3.5 leading-relaxed">
        Tulis refleksi 200 kata yang merangkum 2 sumber belajar yang kamu pelajari minggu ini.
      </div>

      <div className="mb-3.5">
        <ProgressBar
          value={progressPct}
          max={100}
          accent="amber"
          height={5}
          label="Kemajuan"
          sub={`${finishedThisWeek} dari ${targetSources} sumber selesai`}
        />
      </div>

      <div className="flex justify-between items-center mt-4">
        <div className="flex gap-2">
          <span className="chip text-amber-2 border-amber-2/30">
            <span className="dot bg-amber-2" />
            +250 XP
          </span>
          <span className="chip text-cyan-2 border-cyan-2/30">
            <span className="dot bg-cyan-2" />
            Refleksi +8
          </span>
        </div>
        <button
          onClick={onStartBounty}
          className="btn btn-amber py-2 px-3.5 flex items-center gap-1.5"
        >
          <span>Mulai</span>
          <Icon name="arrow" size={12} />
        </button>
      </div>
    </Card>
  );
}
