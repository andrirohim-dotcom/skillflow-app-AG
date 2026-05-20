import type { SkillColor } from "../constants";

// Single source of truth for all color tokens — no more per-component colorMap

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
    badge: "bg-sky-100 text-sky-700",
    border: "border-sky-200",
    bg: "bg-sky-50",
    bar: "bg-sky-500",
    dot: "bg-sky-500",
    text: "text-sky-600",
    ring: "focus:ring-sky-300",
    checkAccent: "accent-sky-600",
  },
  violet: {
    badge: "bg-violet-100 text-violet-700",
    border: "border-violet-200",
    bg: "bg-violet-50",
    bar: "bg-violet-500",
    dot: "bg-violet-500",
    text: "text-violet-600",
    ring: "focus:ring-violet-300",
    checkAccent: "accent-violet-600",
  },
  rose: {
    badge: "bg-rose-100 text-rose-700",
    border: "border-rose-200",
    bg: "bg-rose-50",
    bar: "bg-rose-500",
    dot: "bg-rose-500",
    text: "text-rose-600",
    ring: "focus:ring-rose-300",
    checkAccent: "accent-rose-600",
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
