import type { SkillColor } from "../constants";

// Single source of truth for all color tokens — updated for dark/glassmorphism theme

export interface ColorTokens {
  badge: string;
  border: string;
  bg: string;
  bar: string;      // progress bar fill
  dot: string;      // small indicator dot
  text: string;     // accent text
  ring: string;     // focus ring
  checkAccent: string;
}

export const colorConfig: Record<SkillColor, ColorTokens> = {
  sky: {
    badge: "bg-sky-500/10 text-sky-400 border border-sky-500/20",
    border: "border-sky-500/20",
    bg: "bg-sky-500/5",
    bar: "bg-sky-500",
    dot: "bg-sky-500",
    text: "text-sky-400",
    ring: "focus:ring-sky-500/30",
    checkAccent: "accent-sky-500",
  },
  violet: {
    badge: "bg-violet-500/10 text-violet-400 border border-violet-500/20",
    border: "border-violet-500/20",
    bg: "bg-violet-500/5",
    bar: "bg-violet-500",
    dot: "bg-violet-500",
    text: "text-violet-400",
    ring: "focus:ring-violet-500/30",
    checkAccent: "accent-violet-500",
  },
  rose: {
    badge: "bg-rose-500/10 text-rose-400 border border-rose-500/20",
    border: "border-rose-500/20",
    bg: "bg-rose-500/5",
    bar: "bg-rose-500",
    dot: "bg-rose-500",
    text: "text-rose-400",
    ring: "focus:ring-rose-500/30",
    checkAccent: "accent-rose-500",
  },
};

// Source-type color mapping for progress list
export const sourceTypeColors: Record<string, SkillColor> = {
  book: "sky",
  youtube: "rose",
  article: "violet",
  podcast: "violet",
  course: "sky",
};
