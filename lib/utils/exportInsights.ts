import { INSIGHT_TYPE_LABELS } from "@/lib/constants";
import type { KeyInsight } from "@/lib/types";

export function exportInsightsToMarkdown(insights: KeyInsight[], sourceTitle?: string): void {
  const exportDate = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const lines: string[] = [];

  if (sourceTitle) {
    lines.push(`# Insights: ${sourceTitle}`, `Diekspor: ${exportDate}`, "");
  } else {
    lines.push("# Semua Insights — SkillFlow", `Diekspor: ${exportDate}`, "");
  }

  for (const insight of insights) {
    const typeLabel = INSIGHT_TYPE_LABELS[insight.type ?? "insight"] ?? "Insight";
    const location = insight.pageOrTimestamp ? ` *(${insight.pageOrTimestamp})*` : "";

    lines.push(`## ${typeLabel}${location}`, "");
    lines.push(insight.quote, "");

    if (insight.reflection) {
      lines.push(`> ${insight.reflection}`, "");
    }
    if (insight.skillTarget) {
      lines.push(`**Skill:** ${insight.skillTarget}`);
    }
    if (insight.tags.length > 0) {
      lines.push(`**Tags:** ${insight.tags.map((t) => `#${t}`).join(", ")}`);
    }
    lines.push("", "---", "");
  }

  const blob = new Blob([lines.join("\n")], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = sourceTitle
    ? `insights-${sourceTitle.replace(/\s+/g, "-").toLowerCase()}.md`
    : "insights-skillflow.md";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 100);
}
