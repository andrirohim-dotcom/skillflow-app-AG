"use client";

import { useState } from "react";
import { SOURCE_STATUS_LABELS, SOURCE_TYPE_UNIT_LABEL } from "@/lib/constants";
import { getSourceProgress } from "@/lib/utils/sourceProgress";
import type { LearningSource, SourceStatus } from "@/lib/types";

interface Props {
  source: LearningSource;
  onSaved: (updated: LearningSource) => void;
  onCancel: () => void;
}

export default function UpdateProgressForm({ source, onSaved, onCancel }: Props) {
  const stats = getSourceProgress(source);
  const [current, setCurrent] = useState(String(stats.consumed));
  const [status, setStatus] = useState<SourceStatus>(source.status);
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const val = Number(current);
    if (isNaN(val) || val < 0) {
      setError("Nilai progres tidak valid.");
      return;
    }
    if (val > stats.total) {
      setError(`Tidak boleh melebihi total (${stats.total} ${stats.unitLabel}).`);
      return;
    }
    setError("");

    const now = new Date().toISOString();
    const p = source.progress;
    let updatedProgress = { ...p };

    if (p.type === "book") updatedProgress = { ...p, currentPage: val };
    else if (p.type === "youtube") updatedProgress = { ...p, watchedMinutes: val };
    else if (p.type === "article") updatedProgress = { ...p, consumedMinutes: val };
    else if (p.type === "podcast") updatedProgress = { ...p, listenedMinutes: val };
    else if (p.type === "course") {
      if (p.totalModules) updatedProgress = { ...p, completedModules: val };
      else updatedProgress = { ...p, watchedMinutes: val };
    }

    // Auto-mark completed if progress hits 100%
    const newStatus = val >= stats.total ? "completed" : status;

    onSaved({
      ...source,
      progress: updatedProgress as typeof source.progress,
      status: newStatus,
      updatedAt: now,
    });
  }

  const pct = stats.total > 0 ? Math.round((Number(current) / stats.total) * 100) : 0;

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-lg">
      <div className="bg-gradient-to-r from-sky-600 to-violet-600 px-6 py-5">
        <h2 className="text-white font-bold text-lg">Update Progres</h2>
        <p className="text-sky-100 text-sm mt-0.5">{source.title}</p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        {/* Current progress */}
        <div>
          <label className={LABEL_CLS}>
            Posisi Saat Ini ({stats.unitLabel})
          </label>
          <input
            type="number"
            min="0"
            max={stats.total}
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            className={INPUT_CLS}
          />
          <div className="mt-2">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>0</span>
              <span className="font-semibold text-sky-600">{pct}%</span>
              <span>{stats.total} {stats.unitLabel}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
              <div className="h-2 bg-sky-500 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, pct)}%` }} />
            </div>
          </div>
        </div>

        {/* Status */}
        <div>
          <label className={LABEL_CLS}>Status</label>
          <div className="grid grid-cols-2 gap-2">
            {(["not_started", "in_progress", "completed", "on_hold"] as SourceStatus[]).map((s) => (
              <button key={s} type="button" onClick={() => setStatus(s)}
                className={`text-sm py-2 rounded-xl border transition-all ${
                  status === s
                    ? "bg-sky-600 text-white border-sky-600 font-semibold"
                    : "bg-white text-gray-600 border-gray-200 hover:border-sky-300"
                }`}>
                {SOURCE_STATUS_LABELS[s]}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <p className="text-rose-500 text-xs bg-rose-50 px-3 py-2 rounded-lg border border-rose-100">
            ⚠️ {error}
          </p>
        )}

        <div className="flex gap-2">
          <button type="submit"
            className="flex-1 bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm">
            Simpan Progres
          </button>
          <button type="button" onClick={onCancel}
            className="px-4 py-2.5 text-sm text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
            Batal
          </button>
        </div>
      </form>
    </div>
  );
}

const INPUT_CLS = "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-300 focus:border-transparent transition";
const LABEL_CLS = "block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5";
