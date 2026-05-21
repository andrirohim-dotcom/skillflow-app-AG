import type {
  SourceType,
  SourceStatus,
  DifficultyLevel,
  InsightType,
  SkillLevel,
  TaskPriority,
  TaskStatus,
  MoodLevel,
} from "./types";

// ─── Source Type ──────────────────────────────────────────────────────────────

export const SOURCE_TYPE_LABELS: Record<SourceType, string> = {
  book: "Buku",
  youtube: "YouTube",
  article: "Artikel",
  podcast: "Podcast",
  course: "Kursus / Webinar",
};

export const SOURCE_TYPE_ICONS: Record<SourceType, string> = {
  book: "📚",
  youtube: "▶️",
  article: "📄",
  podcast: "🎧",
  course: "🎓",
};

export const SOURCE_TYPE_CREATOR_LABEL: Record<SourceType, string> = {
  book: "Penulis",
  youtube: "Channel / Kreator",
  article: "Penulis",
  podcast: "Host / Podcast",
  course: "Instruktur / Platform",
};

export const SOURCE_TYPE_UNIT_LABEL: Record<SourceType, string> = {
  book: "halaman",
  youtube: "menit",
  article: "menit baca",
  podcast: "menit",
  course: "modul",
};

// ─── Status & Difficulty ──────────────────────────────────────────────────────

export const SOURCE_STATUS_LABELS: Record<SourceStatus, string> = {
  not_started: "Belum Dimulai",
  in_progress: "Sedang Belajar",
  completed: "Selesai",
  on_hold: "Ditunda",
};

export const SOURCE_STATUS_COLORS: Record<SourceStatus, string> = {
  not_started: "bg-white/5 text-text-mute border border-white/5",
  in_progress: "bg-indigo-500/10 text-indigo-2 border border-indigo-500/20",
  completed: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
  on_hold: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
};

export const DIFFICULTY_LABELS: Record<DifficultyLevel, string> = {
  beginner: "Pemula",
  intermediate: "Menengah",
  advanced: "Lanjutan",
};

export const DIFFICULTY_COLORS: Record<DifficultyLevel, string> = {
  beginner: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/15",
  intermediate: "bg-amber-500/10 text-amber-400 border border-amber-500/15",
  advanced: "bg-rose-500/10 text-rose-400 border border-rose-500/15",
};

// ─── Insight Types ────────────────────────────────────────────────────────────

export const INSIGHT_TYPE_LABELS: Record<InsightType, string> = {
  insight: "Insight",
  quote: "Kutipan",
  concept: "Konsep",
  reflection: "Refleksi",
  weekly_report: "Laporan Mingguan",
};

export const INSIGHT_TYPE_ICONS: Record<InsightType, string> = {
  insight: "💡",
  quote: "💬",
  concept: "🧠",
  reflection: "🪞",
  weekly_report: "📊",
};

export const INSIGHT_TYPE_COLORS: Record<InsightType, string> = {
  insight: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  quote: "bg-indigo-500/10 text-indigo-2 border border-indigo-500/20",
  concept: "bg-violet-500/10 text-violet-400 border border-violet-500/20",
  reflection: "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20",
  weekly_report: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
};

export const INSIGHT_PLACEHOLDER: Record<InsightType, string> = {
  insight: "Apa insight atau pelajaran kunci yang kamu dapat?",
  quote: "Tulis kutipan penting dari sumber ini...",
  concept: "Jelaskan konsep atau framework yang kamu pelajari...",
  reflection: "Pertanyaan atau refleksi apa yang muncul dari bacaan ini?",
  weekly_report: "Tulis laporan mingguan atau progress kamu...",
};

// ─── Skill Level ──────────────────────────────────────────────────────────────

export const SKILL_LEVEL_LABELS: Record<SkillLevel, string> = {
  awareness: "Awareness",
  understanding: "Understanding",
  applied: "Applied",
  mastered: "Mastered",
};

export const SKILL_LEVEL_DESCRIPTIONS: Record<SkillLevel, string> = {
  awareness: "Tahu topik ini ada",
  understanding: "Paham konsep dasarnya",
  applied: "Sudah dipraktikkan",
  mastered: "Bisa mengajarkan ke orang lain",
};

export const SKILL_LEVEL_COLORS: Record<SkillLevel, string> = {
  awareness: "bg-white/5 text-text-mute border border-line",
  understanding: "bg-sky-500/10 text-sky-400 border border-sky-500/20",
  applied: "bg-violet-500/10 text-violet-400 border border-violet-500/20",
  mastered: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
};

export const SKILL_LEVELS_ORDER: SkillLevel[] = [
  "awareness",
  "understanding",
  "applied",
  "mastered",
];

// ─── Task Priority & Status ───────────────────────────────────────────────────

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: "Rendah",
  medium: "Sedang",
  high: "Tinggi",
  urgent: "Mendesak",
};

export const TASK_PRIORITY_COLORS: Record<TaskPriority, string> = {
  low: "bg-white/5 text-text-mute border border-line",
  medium: "bg-sky-500/10 text-sky-400 border border-sky-500/20",
  high: "bg-orange-500/10 text-orange-400 border border-orange-500/20",
  urgent: "bg-rose-500/10 text-rose-400 border border-rose-500/20",
};

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "Belum",
  in_progress: "Dikerjakan",
  done: "Selesai",
  cancelled: "Dibatalkan",
};

export const TASK_STATUS_COLORS: Record<TaskStatus, string> = {
  todo: "bg-white/5 text-text-mute border border-line",
  in_progress: "bg-sky-500/10 text-sky-400 border border-sky-500/20",
  done: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
  cancelled: "bg-white/5 text-text-dim/50 border border-line/50",
};

// ─── Mood ─────────────────────────────────────────────────────────────────────

export const MOOD_LABELS: Record<MoodLevel, string> = {
  great: "Luar biasa",
  good: "Baik",
  okay: "Biasa",
  tired: "Lelah",
  distracted: "Tidak fokus",
};

export const MOOD_ICONS: Record<MoodLevel, string> = {
  great: "🔥",
  good: "😊",
  okay: "😐",
  tired: "😴",
  distracted: "😵",
};

// ─── UI Color Palette ─────────────────────────────────────────────────────────

export const SKILL_COLORS = ["sky", "violet", "rose"] as const;
export type SkillColor = (typeof SKILL_COLORS)[number];

// ─── Storage Keys ─────────────────────────────────────────────────────────────

export const STORAGE_KEYS = {
  SOURCES: "skillflow:sources",
  SESSIONS: "skillflow:sessions",
  INSIGHTS: "skillflow:insights",
  SKILL_PROGRESS: "skillflow:skill_progress",
  TASKS: "skillflow:tasks",
  SEEDED: "skillflow:seeded",
  LEARNER_TYPE: "skillflow:learner_type",
  // Multi-account
  ACCOUNTS: "skillflow:accounts",
  ACTIVE_ACCOUNT: "skillflow:active_account",
} as const;
