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
  not_started: "bg-gray-100 text-gray-500",
  in_progress: "bg-sky-100 text-sky-700",
  completed: "bg-emerald-100 text-emerald-700",
  on_hold: "bg-amber-100 text-amber-700",
};

export const DIFFICULTY_LABELS: Record<DifficultyLevel, string> = {
  beginner: "Pemula",
  intermediate: "Menengah",
  advanced: "Lanjutan",
};

export const DIFFICULTY_COLORS: Record<DifficultyLevel, string> = {
  beginner: "bg-emerald-50 text-emerald-600",
  intermediate: "bg-amber-50 text-amber-600",
  advanced: "bg-rose-50 text-rose-600",
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
  insight: "bg-amber-50 text-amber-700 border-amber-200",
  quote: "bg-indigo-50 text-indigo-700 border-indigo-200",
  concept: "bg-violet-50 text-violet-700 border-violet-200",
  reflection: "bg-teal-50 text-teal-700 border-teal-200",
  weekly_report: "bg-emerald-50 text-emerald-700 border-emerald-200",
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
  awareness: "bg-gray-100 text-gray-600",
  understanding: "bg-sky-100 text-sky-700",
  applied: "bg-violet-100 text-violet-700",
  mastered: "bg-emerald-100 text-emerald-700",
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
  low: "bg-gray-100 text-gray-500",
  medium: "bg-sky-100 text-sky-600",
  high: "bg-orange-100 text-orange-600",
  urgent: "bg-rose-100 text-rose-700",
};

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "Belum",
  in_progress: "Dikerjakan",
  done: "Selesai",
  cancelled: "Dibatalkan",
};

export const TASK_STATUS_COLORS: Record<TaskStatus, string> = {
  todo: "bg-gray-50 text-gray-500 border-gray-200",
  in_progress: "bg-sky-50 text-sky-600 border-sky-200",
  done: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-gray-50 text-gray-400 border-gray-200",
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
