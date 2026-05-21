import type { LearningSource, LearningSession, KeyInsight, SkillProgress } from "../types";
import type { Profile } from "../types/profile";

export interface Recommendation {
  id: string;
  type: "source" | "action" | "skill" | "recovery" | "insight";
  title: string;
  description: string;
  reason: string;
  cta: {
    label: string;
    href: string;
  };
  priority: number; // 1 (highest) to 10
}

/**
 * Personal Learning Cockpit Recommendation Engine
 * Rule-based logic for personalizing the learning experience.
 */
export function getCockpitRecommendations(
  sources: LearningSource[],
  sessions: LearningSession[],
  insights: KeyInsight[],
  skillProgress: SkillProgress[],
  profile: Profile
): Recommendation[] {
  const recommendations: Recommendation[] = [];
  const targetSkills = profile.focusAreas || [];

  // 1. RECOVERY: Check for inactivity (Soft Recovery)
  const lastSessionDate = sessions.length > 0 
    ? new Date(sessions.sort((a, b) => b.date.localeCompare(a.date))[0].date)
    : null;
  const daysSinceLastSession = lastSessionDate 
    ? Math.floor((Date.now() - lastSessionDate.getTime()) / 86400000)
    : 99;

  if (daysSinceLastSession >= 3 && daysSinceLastSession < 99) {
    recommendations.push({
      id: "recovery-warmup",
      type: "recovery",
      title: "Pemanasan Pelan",
      description: "Sudah 3 hari kamu tidak belajar. Yuk, baca 5-10 menit saja hari ini untuk menjaga momentum.",
      reason: "Disarankan karena kamu sedang dalam fase tidak aktif sejenak.",
      cta: { label: "Pilih Sumber Ringan", href: "/dashboard/sources" },
      priority: 1,
    });
  }

  // 2. TARGET SKILL: Missing focus
  targetSkills.forEach(skill => {
    const hasProgress = skillProgress.some(sp => sp.skillName === skill);
    if (!hasProgress) {
      recommendations.push({
        id: `focus-missing-${skill}`,
        type: "skill",
        title: `Mulai Kuasai ${skill}`,
        description: `Kamu memilih ${skill} sebagai skill target, tapi belum ada progres yang dicatat.`,
        reason: `Berdasarkan skill target utamamu.`,
        cta: { label: "Cari Sumber Terkait", href: `/dashboard/sources?q=${encodeURIComponent(skill)}` },
        priority: 2,
      });
    }
  });

  // 3. ACTION: Next Best Action for Target Skills
  skillProgress.forEach(sp => {
    if (targetSkills.includes(sp.skillName)) {
      const pendingActions = sp.actionItems.filter(ai => !ai.completed);
      if (pendingActions.length > 0) {
        recommendations.push({
          id: `action-next-${sp.id}`,
          type: "action",
          title: `Lanjut Praktek: ${pendingActions[0].text}`,
          description: `Selesaikan action item ini untuk naik ke level berikutnya di skill ${sp.skillName}.`,
          reason: `Karena ini adalah langkah konkret untuk skill targetmu: ${sp.skillName}.`,
          cta: { label: "Buka Action Items", href: "/dashboard/actions" },
          priority: 3,
        });
      }
    }
  });

  // 4. SOURCE: Relevant sources for Target Skills
  sources.forEach(source => {
    if (source.status === "not_started" || source.status === "in_progress") {
      const matchesTarget = source.skillTargets.some(s => targetSkills.includes(s));
      if (matchesTarget) {
        recommendations.push({
          id: `source-suggest-${source.id}`,
          type: "source",
          title: `Lanjutkan: ${source.title}`,
          description: `Sumber ini sangat relevan dengan target skill kamu saat ini.`,
          reason: `Mendukung skill target: ${source.skillTargets.filter(s => targetSkills.includes(s)).join(", ")}.`,
          cta: { label: "Mulai Belajar", href: `/dashboard/item/${source.id}` },
          priority: 4,
        });
      }
    }
  });

  // 5. INSIGHT: Convert to action & Spaced Repetition
  const now = Date.now();
  const dueInsights = insights.filter((insight) => {
    const lastReviewed = insight.lastReviewedAt ? new Date(insight.lastReviewedAt).getTime() : new Date(insight.createdAt).getTime();
    const intervalMs = (insight.reviewIntervalDays || 1) * 24 * 60 * 60 * 1000;
    return lastReviewed + intervalMs <= now;
  });

  dueInsights.forEach(insight => {
    recommendations.push({
      id: `insight-spaced-rep-${insight.id}`,
      type: "insight",
      title: "Spaced Repetition: Tinjau Insight",
      description: `Tinjau insight: "${insight.quote.slice(0, 60)}..."`,
      reason: "Berdasarkan interval review Ebbinghaus untuk memperkuat ingatan jangka panjang.",
      cta: { label: "Review Sekarang", href: "/dashboard/insights" },
      priority: 1,
    });
  });

  const recentInsights = insights.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);
  recentInsights.forEach(insight => {
    // Only add if not already in due recommendations to avoid duplicate recommendation targets
    if (dueInsights.some(d => d.id === insight.id)) return;

    if (insight.type === "reflection" || insight.quote.length > 100) {
      recommendations.push({
        id: `insight-review-${insight.id}`,
        type: "insight",
        title: "Tinjau Refleksi",
        description: `"${insight.quote.slice(0, 60)}..."`,
        reason: "Kamu mencatat refleksi yang mendalam, yuk ubah jadi langkah nyata.",
        cta: { label: "Lihat Detail", href: "/dashboard/insights" },
        priority: 5,
      });
    }
  });

  return recommendations.sort((a, b) => a.priority - b.priority).slice(0, 3);
}

export interface RelevanceResult {
  score: number;
  matchReason: string;
}

export function scoreSourceRelevance(source: LearningSource, targetSkills: string[]): RelevanceResult {
  if (!targetSkills || targetSkills.length === 0) {
    return { score: 0, matchReason: "" };
  }
  
  const matched = source.skillTargets.filter(skill => targetSkills.includes(skill));
  if (matched.length > 0) {
    const score = Math.round((matched.length / targetSkills.length) * 100);
    return {
      score,
      matchReason: `Mendukung skill target: ${matched.join(", ")}`
    };
  }
  
  return { score: 0, matchReason: "" };
}

export function sortByRelevance(sources: LearningSource[], targetSkills: string[]): LearningSource[] {
  if (!targetSkills || targetSkills.length === 0) {
    return sources;
  }
  const scored = sources.map(source => {
    const rel = scoreSourceRelevance(source, targetSkills);
    return { source, score: rel.score };
  });
  return scored
    .sort((a, b) => b.score - a.score)
    .map(item => item.source);
}
