/**
 * SKILL TAXONOMY & DEDUPLICATION
 *
 * Canonical skill registry with aliases for SkillFlow.
 * Manually curated from seed data analysis.
 *
 * Used during migration to:
 * 1. Map old skill names (strings) → canonical Skill records
 * 2. Identify and merge duplicate entries
 * 3. Normalize skill references across all entities
 */

import type { Skill, SkillDeduplicationGroup } from "./types.refactored";

// ─── DEDUPLICATION GROUPS ─────────────────────────────────────────────────────

/**
 * Groups of skill name variations that refer to the same concept.
 * Extracted from seed data frequency analysis.
 * Manual curation required for accuracy.
 */
export const SKILL_DEDUPLICATION_GROUPS: SkillDeduplicationGroup[] = [
  // Leadership & Management
  {
    canonical: "Leadership",
    variations: ["Kepemimpinan", "Kepemimpinan Strategis", "Kepemimpinan Berbasis Nilai"],
    category: "Business",
    domain: "Management",
    sourceCount: 6,
  },
  {
    canonical: "Team Management",
    variations: ["Manajemen Tim", "Manajemen Kelompok", "Team Leadership"],
    category: "Business",
    domain: "Management",
    sourceCount: 8,
  },
  {
    canonical: "Conflict Management",
    variations: ["Manajemen Konflik", "Resolusi Konflik"],
    category: "Business",
    domain: "Management",
    sourceCount: 2,
  },

  // Strategy & Decision Making
  {
    canonical: "Strategic Planning",
    variations: ["Strategi Bisnis", "Perencanaan Strategis", "Strategic Thinking"],
    category: "Business",
    domain: "Strategy",
    sourceCount: 7,
  },
  {
    canonical: "Decision Making",
    variations: ["Pengambilan Keputusan", "Keputusan Strategis", "Analytical Decision Making"],
    category: "Business",
    domain: "Strategy",
    sourceCount: 2,
  },
  {
    canonical: "Strategy Execution",
    variations: ["Eksekusi Strategi", "Implementation"],
    category: "Business",
    domain: "Strategy",
    sourceCount: 2,
  },

  // Productivity & Time
  {
    canonical: "Time Management",
    variations: ["Manajemen Waktu", "Time Blocking", "Scheduling"],
    category: "Personal",
    domain: "Productivity",
    sourceCount: 3,
  },
  {
    canonical: "Deep Focus",
    variations: ["Fokus Mendalam", "Fokus", "Fokus Strategis", "Deep Work"],
    category: "Personal",
    domain: "Productivity",
    sourceCount: 4,
  },
  {
    canonical: "Priority Management",
    variations: ["Manajemen Prioritas", "Prioritization"],
    category: "Personal",
    domain: "Productivity",
    sourceCount: 2,
  },
  {
    canonical: "Task Management",
    variations: ["Manajemen Tugas", "Getting Things Done"],
    category: "Personal",
    domain: "Productivity",
    sourceCount: 2,
  },
  {
    canonical: "Energy Management",
    variations: ["Manajemen Energi", "Work-Life Balance"],
    category: "Personal",
    domain: "Productivity",
    sourceCount: 2,
  },
  {
    canonical: "Productive Habits",
    variations: ["Kebiasaan Produktif", "Habit Formation"],
    category: "Personal",
    domain: "Productivity",
    sourceCount: 2,
  },

  // Finance & Business
  {
    canonical: "Investment",
    variations: ["Investasi", "Investasi & Portofolio", "Portfolio Management"],
    category: "Finance",
    domain: "Investment",
    sourceCount: 3,
  },
  {
    canonical: "Personal Finance Planning",
    variations: ["Perencanaan Keuangan Pribadi", "Financial Planning"],
    category: "Finance",
    domain: "Personal Finance",
    sourceCount: 4,
  },
  {
    canonical: "Financial Literacy",
    variations: ["Literasi Keuangan", "Money Management"],
    category: "Finance",
    domain: "Personal Finance",
    sourceCount: 3,
  },
  {
    canonical: "Business Model Design",
    variations: ["Model Bisnis", "Business Model Canvas"],
    category: "Business",
    domain: "Entrepreneurship",
    sourceCount: 2,
  },
  {
    canonical: "Entrepreneurship",
    variations: ["Entrepreneurship", "Startup Thinking"],
    category: "Business",
    domain: "Entrepreneurship",
    sourceCount: 3,
  },

  // Innovation & Problem Solving
  {
    canonical: "Innovation",
    variations: ["Inovasi Produk", "Creative Problem Solving"],
    category: "Technical",
    domain: "Innovation",
    sourceCount: 2,
  },
  {
    canonical: "Problem Solving",
    variations: ["Problem Solving", "Analytical Thinking"],
    category: "Technical",
    domain: "Problem Solving",
    sourceCount: 2,
  },
  {
    canonical: "Creativity",
    variations: ["Kreativitas", "Creative Thinking"],
    category: "Personal",
    domain: "Innovation",
    sourceCount: 3,
  },

  // Psychology & Mindset
  {
    canonical: "Growth Mindset",
    variations: ["Mindset Pertumbuhan", "Mindset Berkembang"],
    category: "Personal",
    domain: "Mindset",
    sourceCount: 5,
  },
  {
    canonical: "Wealth Mindset",
    variations: ["Mindset Kekayaan", "Financial Mindset"],
    category: "Finance",
    domain: "Mindset",
    sourceCount: 5,
  },
  {
    canonical: "Behavioral Psychology",
    variations: ["Psikologi Perilaku", "Behavioral Economics"],
    category: "Personal",
    domain: "Psychology",
    sourceCount: 4,
  },
  {
    canonical: "Persuasive Communication",
    variations: ["Komunikasi Persuasif", "Influence"],
    category: "Business",
    domain: "Communication",
    sourceCount: 3,
  },
  {
    canonical: "Effective Communication",
    variations: ["Komunikasi Efektif", "Communication Skills"],
    category: "Business",
    domain: "Communication",
    sourceCount: 4,
  },
  {
    canonical: "Motivation & Engagement",
    variations: ["Motivasi & Engagement", "Employee Engagement"],
    category: "Business",
    domain: "Management",
    sourceCount: 2,
  },

  // Technical & Software
  {
    canonical: "Software Engineering",
    variations: ["Software Engineering", "Craftsmanship"],
    category: "Technical",
    domain: "Software Engineering",
    sourceCount: 5,
  },
  {
    canonical: "Clean Code",
    variations: ["Clean Code", "Code Quality"],
    category: "Technical",
    domain: "Software Engineering",
    sourceCount: 2,
  },
  {
    canonical: "System Architecture",
    variations: ["Arsitektur Sistem", "Architectural Thinking"],
    category: "Technical",
    domain: "Software Engineering",
    sourceCount: 3,
  },

  // Health & Well-being
  {
    canonical: "Optimal Health",
    variations: ["Kesehatan Optimal", "Wellness", "Fitness"],
    category: "Personal",
    domain: "Health",
    sourceCount: 2,
  },
  {
    canonical: "Resilience",
    variations: ["Ketahanan Mental", "Mental Strength"],
    category: "Personal",
    domain: "Resilience",
    sourceCount: 3,
  },
  {
    canonical: "Stoicism",
    variations: ["Stoikisme", "Stoic Philosophy"],
    category: "Personal",
    domain: "Philosophy",
    sourceCount: 2,
  },
];

// ─── BUILD CANONICAL SKILL REGISTRY ───────────────────────────────────────────

/**
 * Converts deduplication groups into canonical Skill entities.
 * Call this once during migration Phase 1.
 */
export function buildCanonicalSkillRegistry(): Skill[] {
  let skillId = 1;
  return SKILL_DEDUPLICATION_GROUPS.map((group) => ({
    id: `skill-${String(skillId++).padStart(3, "0")}`,
    name: group.canonical,
    aliases: group.variations,
    category: group.category,
    domain: group.domain,
    description: `Skill: ${group.canonical}. Aliases: ${group.variations.join(", ")}`,
    createdAt: new Date().toISOString(),
  }));
}

// ─── LOOKUP HELPER ────────────────────────────────────────────────────────────

/**
 * Build a mapping from old skill name (string) → Skill.id.
 * Used during migration to rewrite KeyInsight.skillTarget → skillId.
 *
 * Example:
 *   "Kepemimpinan" → "skill-001" (Leadership)
 *   "Leadership" → "skill-001"
 *   "Kepemimpinan Strategis" → "skill-001"
 */
export function buildSkillNameToIdMap(skills: Skill[]): Record<string, string> {
  const map: Record<string, string> = {};

  for (const skill of skills) {
    // Map canonical name
    map[skill.name] = skill.id;

    // Map all aliases
    for (const alias of skill.aliases) {
      map[alias] = skill.id;
    }
  }

  return map;
}

// ─── VALIDATION ───────────────────────────────────────────────────────────────

/**
 * Checks for overlaps or inconsistencies in deduplication groups.
 * Run this before migration to catch issues.
 *
 * Returns: list of warnings (or empty if OK)
 */
export function validateDeduplicationGroups(
  groups: SkillDeduplicationGroup[]
): string[] {
  const warnings: string[] = [];
  const seen = new Set<string>();

  for (const group of groups) {
    // Check canonical is unique
    if (seen.has(group.canonical.toLowerCase())) {
      warnings.push(`Duplicate canonical: "${group.canonical}"`);
    }
    seen.add(group.canonical.toLowerCase());

    // Check no variation appears in two groups
    for (const variation of group.variations) {
      if (seen.has(variation.toLowerCase())) {
        warnings.push(`Variation appears twice: "${variation}"`);
      }
      seen.add(variation.toLowerCase());
    }
  }

  return warnings;
}

// ─── EXPORT DEFAULTS ──────────────────────────────────────────────────────────

export const CANONICAL_SKILLS = buildCanonicalSkillRegistry();
export const SKILL_NAME_TO_ID = buildSkillNameToIdMap(CANONICAL_SKILLS);

// ─── AUDIT SUMMARY ────────────────────────────────────────────────────────────

export function printTaxonomyAudit(): void {
  console.log("\n=== Skill Taxonomy Audit ===");
  console.log(`Total groups: ${SKILL_DEDUPLICATION_GROUPS.length}`);
  console.log(`Total canonical skills: ${CANONICAL_SKILLS.length}`);

  const byCategory = new Map<string, number>();
  const byDomain = new Map<string, number>();

  for (const skill of CANONICAL_SKILLS) {
    byCategory.set(skill.category, (byCategory.get(skill.category) ?? 0) + 1);
    if (skill.domain) {
      byDomain.set(skill.domain, (byDomain.get(skill.domain) ?? 0) + 1);
    }
  }

  console.log("\nBy Category:");
  Array.from(byCategory.entries())
    .sort((a, b) => b[1] - a[1])
    .forEach(([cat, count]) => console.log(`  ${cat}: ${count}`));

  console.log("\nBy Domain:");
  Array.from(byDomain.entries())
    .sort((a, b) => b[1] - a[1])
    .forEach(([dom, count]) => console.log(`  ${dom}: ${count}`));

  const validationErrors = validateDeduplicationGroups(SKILL_DEDUPLICATION_GROUPS);
  if (validationErrors.length > 0) {
    console.warn("\n⚠️  Validation Warnings:");
    validationErrors.forEach((w) => console.warn(`  - ${w}`));
  } else {
    console.log("\n✓ No validation errors");
  }
}
