"use client";

import { useEffect, useState } from "react";
import { getWsSources } from "@/lib/storageV2";
import { useWorkspace } from "@/lib/contexts/WorkspaceContext";
import { getSourceProgress } from "@/lib/utils/sourceProgress";
import { colorConfig, sourceTypeColors } from "@/lib/utils/colorConfig";
import { SOURCE_TYPE_ICONS, SOURCE_TYPE_LABELS, SOURCE_STATUS_COLORS, SOURCE_STATUS_LABELS } from "@/lib/constants";
import type { LearningSource } from "@/lib/types";

interface Props {
  /** Increment to force a re-read from storage after a new source is saved */
  refreshKey?: number;
}

export default function SourceProgressList({ refreshKey = 0 }: Props) {
  const { currentUser: user, currentWorkspace: workspace } = useWorkspace();
  const [sources, setSources] = useState<LearningSource[]>([]);

  useEffect(() => {
    async function load() {
      if (!user || !workspace) return;
      // Simulate async
      await new Promise(r => setTimeout(r, 0));
      setSources(await getWsSources(workspace.id, user.id, "all"));
    }
    load();
  }, [user, workspace, refreshKey]);

  if (sources.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col items-center justify-center py-14 text-center">
        <div className="text-4xl mb-3">📂</div>
        <p className="text-gray-500 font-medium text-sm">Belum ada sumber belajar</p>
        <p className="text-xs text-gray-400 mt-1">Tambahkan sumber pertama Anda di sebelah kanan.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold text-gray-800">Progres Belajar</h2>
        <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
          {sources.length} sumber aktif
        </span>
      </div>

      <div className="space-y-4">
        {sources.map((source) => {
          const stats = getSourceProgress(source);
          const colorKey = sourceTypeColors[source.progress.type] ?? "sky";
          const c = colorConfig[colorKey];

          return (
            <div key={source.id} className={`rounded-xl p-4 ${c.bg}`}>
              {/* Header row */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-sm">
                      {SOURCE_TYPE_ICONS[source.progress.type]}
                    </span>
                    <span className={`text-xs font-medium ${c.text}`}>
                      {SOURCE_TYPE_LABELS[source.progress.type]}
                    </span>
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        SOURCE_STATUS_COLORS[source.status]
                      }`}
                    >
                      {SOURCE_STATUS_LABELS[source.status]}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-800 text-sm leading-tight truncate">
                    {source.title}
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">{source.creatorName}</p>
                </div>
                <span className={`text-sm font-bold ${c.text} shrink-0 ml-3`}>
                  {stats.pct}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-white rounded-full h-1.5 overflow-hidden mt-2">
                <div
                  className={`h-1.5 rounded-full transition-all ${c.bar}`}
                  style={{ width: `${stats.pct}%` }}
                />
              </div>

              {/* Footer */}
              <div className="flex justify-between mt-1.5">
                <span className="text-xs text-gray-400">
                  {stats.consumed} {stats.unitLabel}
                </span>
                <span className="text-xs text-gray-400">{stats.total} total</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
