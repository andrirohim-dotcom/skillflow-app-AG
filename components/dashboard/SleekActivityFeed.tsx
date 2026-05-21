"use client";

import React from "react";
import type { LearningSession, KeyInsight, SkillProgress, LearningSource } from "@/lib/types";
import { Card, Icon } from "./SleekPrimitives";

interface Props {
  sessions: LearningSession[];
  insights: KeyInsight[];
  sources: LearningSource[];
  skillProgress: SkillProgress[];
}

interface ActivityEvent {
  timestamp: string; // ISO string for sorting
  timeLabel: string; // e.g. "08:42" or "Kemarin" or "18 Mei"
  icon: string;
  color: "indigo" | "cyan" | "amber";
  title: string;
  meta: string[];
}

export default function SleekActivityFeed({ sessions, insights, sources, skillProgress }: Props) {
  // Helpers
  const getSourceTitle = (sourceId: string) => {
    const s = sources.find((src) => src.id === sourceId);
    return s ? s.title : "Sumber Belajar";
  };

  const getSourceType = (sourceId: string) => {
    const s = sources.find((src) => src.id === sourceId);
    return s ? s.progress.type : "book";
  };

  const formatEventTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        return date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
      } else if (diffDays === 1) {
        return "Kemarin";
      } else {
        return date.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
      }
    } catch {
      return "Baru saja";
    }
  };

  // Compile all activities
  const compileEvents = (): ActivityEvent[] => {
    const events: ActivityEvent[] = [];

    // 1. Add sessions
    sessions.forEach((s) => {
      if (!s.createdAt) return;
      const type = getSourceType(s.sourceId);
      const icon = type === "podcast" ? "podcast" : type === "youtube" ? "video" : "book";
      const xp = s.durationMinutes * 5; // 5 XP per min
      
      events.push({
        timestamp: s.createdAt || s.date,
        timeLabel: formatEventTime(s.createdAt || s.date),
        icon,
        color: "indigo",
        title: `Belajar — ${getSourceTitle(s.sourceId)}`,
        meta: [`+${xp} XP`, `${s.durationMinutes} mnt`],
      });
    });

    // 2. Add insights
    insights.forEach((i) => {
      const timestamp = i.createdAt || new Date().toISOString();
      events.push({
        timestamp,
        timeLabel: formatEventTime(timestamp),
        icon: "lightbulb",
        color: "cyan",
        title: i.quote 
          ? `Mencatat insight: "${i.quote.slice(0, 45)}${i.quote.length > 45 ? "..." : ""}"`
          : `Menambahkan insight baru`,
        meta: ["+10 XP", "Insight"],
      });
    });

    // 3. Add skill updates or action item completions
    skillProgress.forEach((sp) => {
      sp.actionItems.forEach((ai) => {
        if (ai.completed && ai.completedAt) {
          events.push({
            timestamp: ai.completedAt,
            timeLabel: formatEventTime(ai.completedAt),
            icon: "check",
            color: "amber",
            title: `Menyelesaikan action: "${ai.text}"`,
            meta: ["+50 XP", sp.skillName],
          });
        }
      });
    });

    // Sort by timestamp desc, take latest 6
    return events
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
      .slice(0, 6);
  };

  const activeEvents = compileEvents();

  const colorOf = (c: string) =>
    c === "cyan" ? "var(--cyan-2)" : c === "amber" ? "var(--amber-2)" : "var(--indigo-2)";
  const bgOf = (c: string) =>
    c === "cyan"
      ? "rgba(20,184,166,0.12)"
      : c === "amber"
      ? "rgba(245,158,11,0.12)"
      : "rgba(99,102,241,0.14)";

  return (
    <Card className="p-[22px]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="mono text-[10px] text-cyan-2 uppercase tracking-[0.12em] mb-1">
            Activity Feed
          </div>
          <div className="text-sm font-semibold text-text">6 Aktivitas Terakhir</div>
        </div>
        <div className="flex gap-1.5">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-line text-text-dim">
            Semua
          </span>
        </div>
      </div>

      {activeEvents.length === 0 ? (
        <div className="text-center py-8 text-xs text-text-mute">
          Belum ada aktivitas. Mulai belajar atau catat insight pertama kamu!
        </div>
      ) : (
        <div className="relative pl-5">
          {/* spine line */}
          <div className="absolute left-[19px] top-4 bottom-4 w-[1px] bg-gradient-to-b from-line-strong via-line-strong to-transparent pointer-events-none" />
          
          <div className="flex flex-col gap-1.5">
            {activeEvents.map((it, idx) => (
              <div key={idx} className="flex gap-4 items-start py-2.5 relative">
                <div
                  className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center border z-10"
                  style={{
                    background: bgOf(it.color),
                    color: colorOf(it.color),
                    borderColor: `${colorOf(it.color)}33`,
                  }}
                >
                  <Icon name={it.icon} size={16} />
                </div>
                
                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="flex justify-between items-baseline gap-2">
                    <p className="text-xs font-medium text-text leading-snug line-clamp-2">
                      {it.title}
                    </p>
                    <span className="mono text-[9px] text-text-mute flex-shrink-0 select-none">
                      {it.timeLabel}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {it.meta.map((m, mIdx) => (
                      <span
                        key={mIdx}
                        className="chip py-0.5 px-2 text-[9px]"
                        style={{
                          color: mIdx === 0 ? colorOf(it.color) : "var(--text-mute)",
                        }}
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
