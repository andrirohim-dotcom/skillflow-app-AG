// Migrates the original hardcoded mock data into LearningSource format.
// Runs exactly once — gated by the "skillflow:seeded" flag in localStorage.

import type { LearningSource, SkillProgress } from "./types";
import { generateActionPlan } from "./utils/actionPlanGenerator";
import { saveSource, saveSkillProgress, isSeeded, markSeeded } from "./storage";

const SEED_SOURCES: LearningSource[] = [
  {
    id: "seed-src-1",
    title: "Atomic Habits",
    creatorName: "James Clear",
    url: "",
    topicTags: ["habits", "productivity", "self-improvement"],
    skillTargets: ["Manajemen Kebiasaan", "Konsistensi", "Mindset Pertumbuhan"],
    status: "in_progress",
    difficultyLevel: "beginner",
    progress: { type: "book", totalPages: 320, currentPage: 128 },
    createdAt: "2025-01-10T08:00:00.000Z",
    updatedAt: "2025-03-20T10:30:00.000Z",
  },
  {
    id: "seed-src-2",
    title: "Deep Work",
    creatorName: "Cal Newport",
    url: "",
    topicTags: ["focus", "productivity", "career"],
    skillTargets: ["Fokus Mendalam", "Manajemen Waktu"],
    status: "in_progress",
    difficultyLevel: "intermediate",
    progress: { type: "book", totalPages: 296, currentPage: 74 },
    createdAt: "2025-02-05T09:00:00.000Z",
    updatedAt: "2025-03-15T14:00:00.000Z",
  },
  {
    id: "seed-src-3",
    title: "The Pragmatic Programmer",
    creatorName: "Hunt & Thomas",
    url: "",
    topicTags: ["programming", "software engineering", "career"],
    skillTargets: ["Software Engineering", "Clean Code", "Problem Solving"],
    status: "not_started",
    difficultyLevel: "advanced",
    progress: { type: "book", totalPages: 352, currentPage: 0 },
    createdAt: "2025-03-01T10:00:00.000Z",
    updatedAt: "2025-03-01T10:00:00.000Z",
  },
];

export function initializeSeedData(): void {
  if (isSeeded()) return;

  SEED_SOURCES.forEach((source) => {
    saveSource(source);

    source.skillTargets.forEach((skillName, idx) => {
      const sp: SkillProgress = {
        id: `seed-sp-${source.id}-${idx}`,
        sourceId: source.id,
        skillName,
        category: "general",
        actionItems: generateActionPlan(skillName).map((text, pi) => ({
          id: `seed-ai-${source.id}-${idx}-${pi}`,
          skillProgressId: `seed-sp-${source.id}-${idx}`,
          text,
          completed: false,
        })),
        createdAt: source.createdAt,
      };
      saveSkillProgress(sp);
    });
  });

  markSeeded();
}
