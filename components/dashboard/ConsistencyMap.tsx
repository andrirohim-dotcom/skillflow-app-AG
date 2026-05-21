"use client";

import React from "react";
import type { LearningSession } from "@/lib/types";
import { Card } from "./SleekPrimitives";

interface Props {
  sessions: LearningSession[];
  currentStreak: number;
}

export default function ConsistencyMap({ sessions, currentStreak }: Props) {
  // Get date for any cell
  const getCellData = () => {
    const data = [];
    const today = new Date();
    // 12 weeks * 7 days = 84 cells
    const totalCells = 84;

    // We start from the oldest day in the grid, which is 83 days ago
    for (let i = totalCells - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);

      // Filter sessions for this day
      const daySessions = sessions.filter((s) => s.date && s.date.slice(0, 10) === dateStr);
      const totalMins = daySessions.reduce((sum, s) => sum + (s.durationMinutes || 0), 0);
      const isShield = daySessions.some((s) => s.isStreakShield);

      let level = 0;
      if (totalMins > 0 && totalMins <= 15) level = 1;
      else if (totalMins > 15 && totalMins <= 30) level = 2;
      else if (totalMins > 30 && totalMins <= 60) level = 3;
      else if (totalMins > 60) level = 4;

      data.push({
        date: dateStr,
        mins: totalMins,
        level,
        isShield,
        dayLabel: d.toLocaleDateString("id-ID", { weekday: "short" }),
      });
    }
    return data;
  };

  const cells = getCellData();
  
  // Format cells into 12 columns of 7 days (weeks)
  const weeks = [];
  for (let i = 0; i < 12; i++) {
    weeks.push(cells.slice(i * 7, (i + 1) * 7));
  }

  const levelColors = [
    "rgba(255, 255, 255, 0.04)",
    "rgba(99, 102, 241, 0.22)",
    "rgba(99, 102, 241, 0.45)",
    "rgba(129, 140, 248, 0.7)",
    "rgba(167, 139, 250, 0.95)",
  ];

  return (
    <Card className="p-[22px] h-full" id="tour-heatmap">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="mono text-[10px] text-indigo-2 uppercase tracking-[0.12em] mb-1">
            Consistency Map
          </div>
          <div className="text-sm font-semibold text-text">
            12 Minggu Terakhir · <span className="grad-indigo">{currentStreak}-hari streak</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 select-none">
          <span className="mono text-[9px] text-text-mute">less</span>
          {levelColors.map((color, i) => (
            <div
              key={i}
              className="w-2.5 h-2.5 rounded-[3px] border border-white/5"
              style={{ background: color }}
            />
          ))}
          <span className="mono text-[9px] text-text-mute">more</span>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-1.5">
        {weeks.map((week, wIdx) => (
          <div key={wIdx} className="grid grid-rows-7 gap-1.5">
            {week.map((cell, dIdx) => (
              <div
                key={dIdx}
                title={cell.isShield ? `${cell.date}: Streak Shield Aktif 🛡️` : `${cell.date}: ${cell.mins} menit belajar`}
                className="aspect-square rounded-[3px] border border-white/5 transition-transform hover:scale-110 cursor-pointer flex items-center justify-center text-[7px]"
                style={{
                  background: cell.isShield ? "rgba(6, 182, 212, 0.45)" : levelColors[cell.level],
                  borderColor: cell.isShield ? "rgba(6, 182, 212, 0.6)" : undefined,
                }}
              >
                {cell.isShield && "🛡️"}
              </div>
            ))}
          </div>
        ))}
      </div>
    </Card>
  );
}
