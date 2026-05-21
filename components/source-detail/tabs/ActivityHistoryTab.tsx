import {
  INSIGHT_TYPE_ICONS,
  INSIGHT_TYPE_LABELS,
  SKILL_LEVEL_LABELS,
  MOOD_ICONS,
} from "@/lib/constants";
import type { LearningSession, KeyInsight, SourceTask, SkillProgress } from "@/lib/types";

// ─── Activity event types ─────────────────────────────────────────────────────

type EventKind = "session" | "insight" | "task_done" | "skill_level";

interface ActivityEvent {
  id: string;
  kind: EventKind;
  date: string;       // sortable ISO string
  displayDate: string;
  icon: string;
  title: string;
  sub?: string;
  accentClass: string; // Tailwind border + dot color
}

function buildTimeline(
  sessions: LearningSession[],
  insights: KeyInsight[],
  tasks: SourceTask[],
  skillProgress: SkillProgress[]
): ActivityEvent[] {
  const events: ActivityEvent[] = [];

  sessions.forEach((s) => {
    events.push({
      id: `session-${s.id}`,
      kind: "session",
      date: s.createdAt,
      displayDate: formatDate(s.date),
      icon: s.mood ? MOOD_ICONS[s.mood] : "⏱️",
      title: `Sesi belajar ${s.durationMinutes} menit`,
      sub: s.notes
        ? s.notes.slice(0, 80) + (s.notes.length > 80 ? "…" : "")
        : s.unitsConsumed > 0
        ? `+${s.unitsConsumed} unit progres`
        : undefined,
      accentClass: "border-sky-400 bg-sky-500/20 shadow-[0_0_8px_rgba(56,189,248,0.5)]",
    });
  });

  insights.forEach((i) => {
    const type = i.type ?? "insight";
    events.push({
      id: `insight-${i.id}`,
      kind: "insight",
      date: i.createdAt,
      displayDate: formatDate(i.createdAt),
      icon: INSIGHT_TYPE_ICONS[type],
      title: `${INSIGHT_TYPE_LABELS[type]}: ${i.quote.slice(0, 60)}${i.quote.length > 60 ? "…" : ""}`,
      sub: i.pageOrTimestamp ? `Ref: ${i.pageOrTimestamp}` : undefined,
      accentClass: "border-indigo-400 bg-indigo-500/20 shadow-[0_0_8px_rgba(99,102,241,0.5)]",
    });
  });

  tasks
    .filter((t) => t.status === "done" && t.completedAt)
    .forEach((t) => {
      events.push({
        id: `task-${t.id}`,
        kind: "task_done",
        date: t.completedAt!,
        displayDate: formatDate(t.completedAt!),
        icon: "✅",
        title: `Task selesai: ${t.description.slice(0, 60)}${t.description.length > 60 ? "…" : ""}`,
        sub: t.sourceReference ? `Dari: ${t.sourceReference}` : undefined,
        accentClass: "border-emerald-400 bg-emerald-500/20 shadow-[0_0_8px_rgba(16,185,129,0.5)]",
      });
    });

  skillProgress
    .filter((sp) => sp.levelAchievedAt)
    .forEach((sp) => {
      const level = sp.level ?? "awareness";
      events.push({
        id: `skill-${sp.id}`,
        kind: "skill_level",
        date: sp.levelAchievedAt!,
        displayDate: formatDate(sp.levelAchievedAt!),
        icon: "🎯",
        title: `${sp.skillName} → ${SKILL_LEVEL_LABELS[level]}`,
        sub: sp.evidence ? sp.evidence.slice(0, 80) + (sp.evidence.length > 80 ? "…" : "") : undefined,
        accentClass: "border-violet-400 bg-violet-500/20 shadow-[0_0_8px_rgba(139,92,246,0.5)]",
      });
    });

  return events.sort((a, b) => b.date.localeCompare(a.date));
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("id-ID", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso.slice(0, 10);
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  sessions: LearningSession[];
  insights: KeyInsight[];
  tasks: SourceTask[];
  skillProgress: SkillProgress[];
}

export default function ActivityHistoryTab({ sessions, insights, tasks, skillProgress }: Props) {
  const events = buildTimeline(sessions, insights, tasks, skillProgress);

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center glass-soft border border-white/10 rounded-2xl shadow-card-depth">
        <span className="text-4xl mb-3">🕐</span>
        <p className="text-sm font-medium text-text">Belum ada aktivitas tercatat</p>
        <p className="text-xs text-text-mute mt-1 max-w-xs">
          Aktivitas dari sesi belajar, insight, task, dan skill level update akan muncul di sini.
        </p>
      </div>
    );
  }

  // Group by date display string
  const grouped = events.reduce<Record<string, ActivityEvent[]>>((acc, ev) => {
    const key = ev.displayDate;
    if (!acc[key]) acc[key] = [];
    acc[key].push(ev);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([dateLabel, evs]) => (
        <div key={dateLabel}>
          {/* Date heading */}
          <div className="flex items-center gap-3 mb-3">
            <p className="text-xs font-semibold text-text-mute uppercase tracking-wide shrink-0">
              {dateLabel}
            </p>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Events for this date */}
          <div className="space-y-2 pl-1">
            {evs.map((ev) => (
              <div key={ev.id} className="flex gap-3">
                {/* Timeline dot + line */}
                <div className="flex flex-col items-center">
                  <div className={`w-3 h-3 rounded-full mt-1.5 shrink-0 border ${ev.accentClass}`} />
                  <div className="flex-1 w-px bg-white/10 mt-1" />
                </div>

                {/* Content */}
                <div className="glass-soft border border-white/10 rounded-xl px-4 py-3 flex-1 mb-1 shadow-card-depth hover:border-white/20 hover:bg-white/5 transition-all">
                  <div className="flex items-start gap-3">
                    <span className="text-lg shrink-0 mt-0.5">{ev.icon}</span>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-text leading-snug">{ev.title}</p>
                      {ev.sub && (
                        <p className="text-xs text-text-mute leading-relaxed">{ev.sub}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
