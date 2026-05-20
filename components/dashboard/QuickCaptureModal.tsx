"use client";

import { useEffect, useState } from "react";
import { useWorkspace } from "@/lib/contexts/WorkspaceContext";
import { getWsSources, saveWsInsight, saveWsTask } from "@/lib/storageV2";
import Modal from "@/components/ui/Modal";
import {
  INSIGHT_TYPE_LABELS,
  INSIGHT_TYPE_ICONS,
  INSIGHT_TYPE_COLORS,
  TASK_PRIORITY_LABELS,
  TASK_PRIORITY_COLORS,
} from "@/lib/constants";
import type {
  InsightType,
  KeyInsight,
  LearningSource,
  SourceTask,
  TaskPriority,
} from "@/lib/types";

interface Props {
  onClose: () => void;
  onSaved: () => void;
}

export default function QuickCaptureModal({ onClose, onSaved }: Props) {
  const { currentUser: user, currentWorkspace: workspace } = useWorkspace();
  const [activeTab, setActiveTab] = useState<"insight" | "action">("insight");
  const [sources, setSources] = useState<LearningSource[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form States - Insight
  const [insightType, setInsightType] = useState<InsightType>("insight");
  const [insightContent, setInsightContent] = useState("");
  const [insightTags, setInsightTags] = useState("");
  const [insightSourceId, setInsightSourceId] = useState("");
  const [createActionFromInsight, setCreateActionFromInsight] = useState(false);
  const [linkedActionDesc, setLinkedActionDesc] = useState("");

  // Form States - Action
  const [actionDesc, setActionDesc] = useState("");
  const [actionPriority, setActionPriority] = useState<TaskPriority>("medium");
  const [actionDeadline, setActionDeadline] = useState("");
  const [actionSourceId, setActionSourceId] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user || !workspace) return;
    getWsSources(workspace.id, user.id, "all").then((data) => {
      setSources(data);
      setIsLoading(false);
    });
  }, [user, workspace]);

  async function handleSaveInsight() {
    if (!insightContent.trim()) {
      setError("Konten insight tidak boleh kosong.");
      return;
    }
    if (!user || !workspace) return;

    setIsSaving(true);
    setError("");

    const insight: KeyInsight = {
      id: crypto.randomUUID(),
      sourceId: insightSourceId || undefined,
      workspaceId: workspace.id,
      userId: user.id,
      type: insightType,
      quote: insightContent.trim(),
      tags: insightTags.split(",").map((t) => t.trim()).filter(Boolean),
      createdAt: new Date().toISOString(),
    };

    try {
      await saveWsInsight(workspace.id, user.id, insight);

      if (createActionFromInsight && linkedActionDesc.trim()) {
        const task: SourceTask = {
          id: crypto.randomUUID(),
          sourceId: insightSourceId || undefined,
          workspaceId: workspace.id,
          userId: user.id,
          description: linkedActionDesc.trim(),
          context: `Dari insight: "${insightContent.trim().slice(0, 50)}..."`,
          priority: "medium",
          status: "todo",
          createdAt: new Date().toISOString(),
        };
        await saveWsTask(workspace.id, user.id, task);
      }
      onSaved();
    } catch (err) {
      setError("Gagal menyimpan insight.");
      setIsSaving(false);
    }
  }

  async function handleSaveAction() {
    if (!actionDesc.trim()) {
      setError("Deskripsi action tidak boleh kosong.");
      return;
    }
    if (!user || !workspace) return;

    setIsSaving(true);
    setError("");

    const task: SourceTask = {
      id: crypto.randomUUID(),
      sourceId: actionSourceId || undefined,
      workspaceId: workspace.id,
      userId: user.id,
      description: actionDesc.trim(),
      deadline: actionDeadline || undefined,
      priority: actionPriority,
      status: "todo",
      createdAt: new Date().toISOString(),
    };

    try {
      await saveWsTask(workspace.id, user.id, task);
      onSaved();
    } catch (err) {
      setError("Gagal menyimpan action item.");
      setIsSaving(false);
    }
  }

  return (
    <Modal onClose={onClose} maxWidth="md">
      <div className="bg-white rounded-2xl overflow-hidden shadow-xl">
        {/* Tab Header */}
        <div className="flex border-b border-gray-100">
          <button
            onClick={() => { setActiveTab("insight"); setError(""); }}
            className={`flex-1 py-4 text-sm font-bold transition-all ${
              activeTab === "insight"
                ? "text-sky-600 border-b-2 border-sky-500 bg-sky-50/30"
                : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
            }`}
          >
            💡 Insight Baru
          </button>
          <button
            onClick={() => { setActiveTab("action"); setError(""); }}
            className={`flex-1 py-4 text-sm font-bold transition-all ${
              activeTab === "action"
                ? "text-emerald-600 border-b-2 border-emerald-500 bg-emerald-50/30"
                : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
            }`}
          >
            ✅ Action Item
          </button>
        </div>

        <div className="p-6 space-y-5">
          {activeTab === "insight" ? (
            <>
              {/* Type selector */}
              <div>
                <label className={LABEL_CLS}>Tipe</label>
                <div className="flex flex-wrap gap-2">
                  {(["insight", "quote", "concept", "reflection"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setInsightType(t)}
                      className={`flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border transition-all ${
                        insightType === t
                          ? "bg-gray-800 text-white border-gray-800 shadow-md"
                          : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                      }`}
                    >
                      <span>{INSIGHT_TYPE_ICONS[t]}</span>
                      {INSIGHT_TYPE_LABELS[t]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Content */}
              <div>
                <label className={LABEL_CLS}>Konten Insight *</label>
                <textarea
                  value={insightContent}
                  onChange={(e) => setInsightContent(e.target.value)}
                  rows={4}
                  placeholder="Apa yang kamu pelajari atau kutipan apa yang menarik?"
                  className={INPUT_CLS}
                />
              </div>

              {/* Tags */}
              <div>
                <label className={LABEL_CLS}>Tags (pisahkan koma)</label>
                <input
                  type="text"
                  value={insightTags}
                  onChange={(e) => setInsightTags(e.target.value)}
                  placeholder="e.g. produktivitas, habits"
                  className={INPUT_CLS}
                />
              </div>

              {/* Source Link */}
              <div>
                <label className={LABEL_CLS}>Terkait Sumber (Opsional)</label>
                <select
                  value={insightSourceId}
                  onChange={(e) => setInsightSourceId(e.target.value)}
                  disabled={isLoading}
                  className={INPUT_CLS}
                >
                  <option value="">-- Tidak ada (Capture Global) --</option>
                  {sources.map((s) => (
                    <option key={s.id} value={s.id}>{s.title}</option>
                  ))}
                </select>
              </div>

              {/* Recommendation #6: Auto-link */}
              <div className="bg-sky-50/50 p-4 rounded-xl border border-sky-100 space-y-3">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                    createActionFromInsight ? "bg-sky-500 border-sky-500" : "border-gray-300 group-hover:border-sky-300"
                  }`}>
                    {createActionFromInsight && <span className="text-white text-xs">✓</span>}
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={createActionFromInsight}
                      onChange={(e) => {
                        setCreateActionFromInsight(e.target.checked);
                        if (e.target.checked && !linkedActionDesc) setLinkedActionDesc(insightContent);
                      }}
                    />
                  </div>
                  <span className="text-xs font-bold text-gray-700">Buat Action Item dari insight ini?</span>
                </label>

                {createActionFromInsight && (
                  <div className="animate-slide-down">
                    <input
                      type="text"
                      value={linkedActionDesc}
                      onChange={(e) => setLinkedActionDesc(e.target.value)}
                      placeholder="Apa yang perlu dilakukan?"
                      className={INPUT_CLS + " bg-white border-sky-100 focus:ring-sky-200"}
                    />
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Description */}
              <div>
                <label className={LABEL_CLS}>Deskripsi Action *</label>
                <input
                  type="text"
                  value={actionDesc}
                  onChange={(e) => setActionDesc(e.target.value)}
                  placeholder="Apa yang perlu dilakukan?"
                  className={INPUT_CLS}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Priority */}
                <div>
                  <label className={LABEL_CLS}>Prioritas</label>
                  <select
                    value={actionPriority}
                    onChange={(e) => setActionPriority(e.target.value as TaskPriority)}
                    className={INPUT_CLS}
                  >
                    {(["low", "medium", "high", "urgent"] as const).map((p) => (
                      <option key={p} value={p}>{TASK_PRIORITY_LABELS[p]}</option>
                    ))}
                  </select>
                </div>

                {/* Deadline */}
                <div>
                  <label className={LABEL_CLS}>Deadline (Opsional)</label>
                  <input
                    type="date"
                    value={actionDeadline}
                    onChange={(e) => setActionDeadline(e.target.value)}
                    className={INPUT_CLS}
                  />
                </div>
              </div>

              {/* Source Link */}
              <div>
                <label className={LABEL_CLS}>Terkait Sumber (Opsional)</label>
                <select
                  value={actionSourceId}
                  onChange={(e) => setActionSourceId(e.target.value)}
                  disabled={isLoading}
                  className={INPUT_CLS}
                >
                  <option value="">-- Tidak ada (Capture Global) --</option>
                  {sources.map((s) => (
                    <option key={s.id} value={s.id}>{s.title}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          {error && (
            <p className="text-rose-500 text-xs bg-rose-50 px-3 py-2 rounded-lg border border-rose-100 animate-shake">
              ⚠️ {error}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              onClick={activeTab === "insight" ? handleSaveInsight : handleSaveAction}
              disabled={isSaving}
              className={`flex-1 py-3 rounded-xl text-white font-bold transition-all shadow-lg active:scale-95 ${
                activeTab === "insight" 
                  ? "bg-sky-600 hover:bg-sky-700 shadow-sky-100" 
                  : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100"
              } disabled:opacity-50`}
            >
              {isSaving ? "Menyimpan..." : "Simpan Sekarang"}
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 border border-gray-200 text-gray-500 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

const INPUT_CLS = "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-200 focus:border-sky-300 transition-all bg-gray-50/50 hover:bg-white focus:bg-white";
const LABEL_CLS = "block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1";
