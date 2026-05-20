import type { LearningSource, SourceProgressStats } from "../types";

/** Derives display-ready progress stats from a LearningSource */
export function getSourceProgress(source: LearningSource): SourceProgressStats {
  const { progress } = source;

  switch (progress.type) {
    case "book":
      return {
        pct: progress.totalPages > 0
          ? Math.round((progress.currentPage / progress.totalPages) * 100)
          : 0,
        consumed: progress.currentPage,
        total: progress.totalPages,
        unitLabel: "halaman",
      };

    case "youtube":
      return {
        pct: progress.totalMinutes > 0
          ? Math.round((progress.watchedMinutes / progress.totalMinutes) * 100)
          : 0,
        consumed: progress.watchedMinutes,
        total: progress.totalMinutes,
        unitLabel: "menit ditonton",
      };

    case "article":
      return {
        pct: progress.estimatedReadMinutes > 0
          ? Math.round((progress.consumedMinutes / progress.estimatedReadMinutes) * 100)
          : 0,
        consumed: progress.consumedMinutes,
        total: progress.estimatedReadMinutes,
        unitLabel: "menit dibaca",
      };

    case "podcast":
      return {
        pct: progress.totalMinutes > 0
          ? Math.round((progress.listenedMinutes / progress.totalMinutes) * 100)
          : 0,
        consumed: progress.listenedMinutes,
        total: progress.totalMinutes,
        unitLabel: "menit didengarkan",
      };

    case "course": {
      if (progress.totalModules && progress.totalModules > 0) {
        return {
          pct: Math.round(((progress.completedModules ?? 0) / progress.totalModules) * 100),
          consumed: progress.completedModules ?? 0,
          total: progress.totalModules,
          unitLabel: "modul selesai",
        };
      }
      if (progress.totalMinutes && progress.totalMinutes > 0) {
        return {
          pct: Math.round(((progress.watchedMinutes ?? 0) / progress.totalMinutes) * 100),
          consumed: progress.watchedMinutes ?? 0,
          total: progress.totalMinutes,
          unitLabel: "menit ditonton",
        };
      }
      return { pct: 0, consumed: 0, total: 0, unitLabel: "unit" };
    }
    default:
      return { pct: 0, consumed: 0, total: 0, unitLabel: "unit" };
  }
}
