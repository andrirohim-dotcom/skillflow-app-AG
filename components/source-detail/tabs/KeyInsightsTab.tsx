"use client";

import { useState, useMemo } from "react";
import { saveWsInsight, deleteWsInsight, saveWsTask } from "@/lib/storageV2";
import { useWorkspace } from "@/lib/contexts/WorkspaceContext";
import { exportInsightsToMarkdown } from "@/lib/utils/exportInsights";
import VoiceInputWidget from "@/components/ui/VoiceInputWidget";
import {
  INSIGHT_TYPE_LABELS,
  INSIGHT_TYPE_ICONS,
  INSIGHT_TYPE_COLORS,
  INSIGHT_PLACEHOLDER,
} from "@/lib/constants";
import type { LearningSource, KeyInsight, InsightType, SourceTask } from "@/lib/types";

const INSIGHT_TYPES: InsightType[] = ["insight", "quote", "concept", "reflection"];

// ─── Add Insight Form ─────────────────────────────────────────────────────────

interface AddInsightFormProps {
  source: LearningSource;
  onSaved: () => void;
  onCancel: () => void;
}

function AddInsightForm({ source, onSaved, onCancel }: AddInsightFormProps) {
  const { currentUser: user, currentWorkspace: workspace } = useWorkspace();
  const [type, setType] = useState<InsightType>("insight");
  const [content, setContent] = useState("");
  const [pageOrTs, setPageOrTs] = useState("");
  const [tagsRaw, setTagsRaw] = useState("");
  const [skillTarget, setSkillTarget] = useState(source.skillTargets[0] ?? "");
  const [error, setError] = useState("");

  // Recommendation #6: Auto-link Action Item
  const [createAction, setCreateAction] = useState(false);
  const [actionDesc, setActionDesc] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) { setError("Konten tidak boleh kosong."); return; }
    setError("");
    if (!user || !workspace) return;

    setIsSaving(true);
    const insightId = crypto.randomUUID();
    const insight: KeyInsight = {
      id: insightId,
      sourceId: source.id,
      workspaceId: workspace.id,
      userId: user.id,
      type,
      skillTarget: skillTarget || undefined,
      quote: content.trim(),
      pageOrTimestamp: pageOrTs.trim() || undefined,
      tags: tagsRaw.split(",").map((t) => t.trim()).filter(Boolean),
      createdAt: new Date().toISOString(),
    };

    try {
      await saveWsInsight(workspace.id, user.id, insight);

      if (createAction && actionDesc.trim()) {
        const task: SourceTask = {
          id: crypto.randomUUID(),
          sourceId: source.id,
          workspaceId: workspace.id,
          userId: user.id,
          description: actionDesc.trim(),
          context: `Dari insight: "${content.trim().slice(0, 50)}..."`,
          priority: "medium",
          status: "todo",
          createdAt: new Date().toISOString(),
        };
        await saveWsTask(workspace.id, user.id, task);
      }
      onSaved();
    } catch (err) {
      setError("Gagal menyimpan data.");
    } finally {
      setIsSaving(false);
    }
  }

  const typeColor = INSIGHT_TYPE_COLORS[type];

  return (
    <form onSubmit={handleSubmit} className={`rounded-2xl border p-5 space-y-4 shadow-card-depth ${typeColor}`}>
      <h3 className="text-sm font-bold text-text">Catat Insight Baru</h3>

      {/* Type selector */}
      <div>
        <label className={LABEL_CLS}>Tipe</label>
        <div className="flex flex-wrap gap-2">
          {INSIGHT_TYPES.map((t) => (
            <button key={t} type="button" onClick={() => setType(t)}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                type === t
                  ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/50 shadow-glow-primary font-medium"
                  : "bg-white/5 text-text-mute border-white/10 hover:bg-white/10 hover:border-white/20"
              }`}
            >
              <span>{INSIGHT_TYPE_ICONS[t]}</span>
              {INSIGHT_TYPE_LABELS[t]}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="space-y-2">
        <label className={LABEL_CLS}>{INSIGHT_TYPE_LABELS[type]} *</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          placeholder={INSIGHT_PLACEHOLDER[type]}
          className={INPUT_CLS + " resize-none bg-transparent placeholder-text-mute/50"}
        />
        {/* Voice input — appends transcript to content */}
        <VoiceInputWidget
          onInsert={(text) =>
            setContent((prev) => {
              const sep = prev.trim() && !prev.endsWith("\n") ? "\n" : "";
              return prev + sep + text;
            })
          }
          accentColor="indigo"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Page / timestamp */}
        <div>
          <label className={LABEL_CLS}>Halaman / Timestamp</label>
          <input
            type="text"
            value={pageOrTs}
            onChange={(e) => setPageOrTs(e.target.value)}
            placeholder="p.42 atau 12:34"
            className={INPUT_CLS}
          />
        </div>

        {/* Skill target */}
        {source.skillTargets.length > 0 && (
          <div>
            <label className={LABEL_CLS}>Terkait Skill</label>
            <select
              value={skillTarget}
              onChange={(e) => setSkillTarget(e.target.value)}
              className={INPUT_CLS + " bg-bg-2"}
            >
              <option value="">Tidak spesifik</option>
              {source.skillTargets.map((sk) => (
                <option key={sk} value={sk}>{sk}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Recommendation #6: Auto-link */}
      <div className="bg-white/5 p-4 rounded-xl border border-white/10 space-y-3">
        <label className="flex items-center gap-2 cursor-pointer group">
          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
            createAction ? "bg-emerald-500 border-emerald-500" : "border-white/20 group-hover:border-emerald-500/50"
          }`}>
            {createAction && <span className="text-white text-xs">✓</span>}
            <input
              type="checkbox"
              className="hidden"
              checked={createAction}
              onChange={(e) => {
                setCreateAction(e.target.checked);
                if (e.target.checked && !actionDesc) setActionDesc(content);
              }}
            />
          </div>
          <span className="text-xs font-bold text-text-dim">Buat Action Item dari insight ini?</span>
        </label>

        {createAction && (
          <div className="animate-slide-down">
            <input
              type="text"
              value={actionDesc}
              onChange={(e) => setActionDesc(e.target.value)}
              placeholder="Apa yang perlu dilakukan?"
              className={INPUT_CLS + " border-emerald-500/20 focus:ring-emerald-500/30"}
            />
          </div>
        )}
      </div>

      {/* Tags */}
      <div>
        <label className={LABEL_CLS}>Tags (pisahkan koma)</label>
        <input
          type="text"
          value={tagsRaw}
          onChange={(e) => setTagsRaw(e.target.value)}
          placeholder="produktivitas, habit, mindset"
          className={INPUT_CLS}
        />
      </div>

      {error && (
        <p className="text-rose-400 text-xs bg-rose-950/20 px-3 py-2 rounded-lg border border-rose-500/20">
          ⚠️ {error}
        </p>
      )}

      <div className="flex gap-2">
        <button type="submit" disabled={isSaving}
          className="flex-1 bg-gradient-to-r from-indigo-sleek to-violet-sleek hover:from-indigo-sleek/90 hover:to-violet-sleek/90 text-white text-sm font-semibold py-2.5 rounded-xl transition-all shadow-glow-primary active:scale-95 border border-indigo-500/30 cursor-pointer disabled:opacity-50">
          {isSaving ? "Menyimpan..." : "Simpan Insight"}
        </button>
        <button type="button" onClick={onCancel}
          className="px-4 py-2.5 text-sm text-text-dim hover:text-text border border-white/10 rounded-xl hover:bg-white/5 transition-all cursor-pointer bg-transparent">
          Batal
        </button>
      </div>
    </form>
  );
}

// ─── Insight Card ─────────────────────────────────────────────────────────────

function InsightCard({
  insight,
  onDelete,
}: {
  insight: KeyInsight;
  onDelete: (id: string) => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const type = insight.type ?? "insight";
  const colorCls = INSIGHT_TYPE_COLORS[type];
  const date = new Date(insight.createdAt).toLocaleDateString("id-ID", {
    day: "numeric", month: "short", year: "numeric",
  });

  return (
    <div className={`rounded-2xl border p-4 shadow-card-depth ${colorCls}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-base">{INSIGHT_TYPE_ICONS[type]}</span>
          <span className="text-xs font-semibold uppercase tracking-wide opacity-70">
            {INSIGHT_TYPE_LABELS[type]}
          </span>
          {insight.pageOrTimestamp && (
            <span className="text-xs font-mono opacity-80 bg-white/10 px-1.5 py-0.5 rounded border border-white/5">
              {insight.pageOrTimestamp}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs opacity-50">{date}</span>
          {confirmDelete ? (
            <div className="flex gap-1">
              <button onClick={() => onDelete(insight.id)}
                className="text-xs text-rose-400 font-semibold px-2 py-0.5 rounded hover:bg-rose-950/30 border border-rose-500/20 transition-colors cursor-pointer">
                Ya
              </button>
              <button onClick={() => setConfirmDelete(false)}
                className="text-xs text-text-mute px-2 py-0.5 rounded hover:bg-white/5 border border-white/10 transition-colors cursor-pointer">
                Batal
              </button>
            </div>
          ) : (
            <button onClick={() => setConfirmDelete(true)}
              className="text-xs opacity-40 hover:opacity-75 transition-opacity px-1 cursor-pointer">
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <p className="text-sm text-text font-medium leading-relaxed">{insight.quote}</p>

      {/* Reflection */}
      {insight.reflection && (
        <p className="text-xs text-text-mute italic mt-2 pt-2 border-t border-white/10">
          {insight.reflection}
        </p>
      )}

      {/* Footer */}
      <div className="flex flex-wrap items-center gap-2 mt-3">
        {insight.skillTarget && (
          <span className="text-xs font-medium bg-white/5 border border-white/10 text-text-dim px-2 py-0.5 rounded-md">
            🎯 {insight.skillTarget}
          </span>
        )}
        {insight.tags.map((tag) => (
          <span key={tag} className="text-xs bg-white/5 border border-white/10 text-text-mute px-2 py-0.5 rounded-md">
            #{tag}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Main Tab ─────────────────────────────────────────────────────────────────

interface Props {
  source: LearningSource;
  insights: KeyInsight[];
  onRefresh: () => void;
}

export default function KeyInsightsTab({ source, insights, onRefresh }: Props) {
  const { currentUser: user, currentWorkspace: workspace } = useWorkspace();
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<InsightType | "all">("all");

  const filtered = useMemo(() => {
    return insights
      .filter((i) => typeFilter === "all" || (i.type ?? "insight") === typeFilter)
      .filter((i) => {
        if (!search) return true;
        const q = search.toLowerCase();
        return (
          i.quote.toLowerCase().includes(q) ||
          i.tags.some((t) => t.toLowerCase().includes(q)) ||
          (i.skillTarget?.toLowerCase().includes(q))
        );
      });
  }, [insights, typeFilter, search]);

  const handleDelete = async (id: string) => {
    if (!user || !workspace) return;
    await deleteWsInsight(workspace.id, user.id, id);
    onRefresh();
  };

  return (
    <div className="space-y-4">
      {/* Search + filter bar */}
      <div className="flex gap-2">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari insight, kutipan, tag..."
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-text placeholder-text-mute focus:outline-none focus:ring-2 focus:ring-indigo-sleek/50 focus:border-transparent transition"
        />
        {filtered.length > 0 && (
          <button
            type="button"
            onClick={() => exportInsightsToMarkdown(filtered, source.title)}
            className="shrink-0 flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-text-mute hover:border-white/20 hover:text-text transition-all active:scale-95 cursor-pointer"
            title="Export insight yang ditampilkan ke Markdown"
          >
            ↓ Export MD
          </button>
        )}
      </div>

      {/* Type filter pills */}
      <div className="flex gap-1.5 flex-wrap">
        {[{ label: "Semua", value: "all" as const }, ...INSIGHT_TYPES.map((t) => ({
          label: `${INSIGHT_TYPE_ICONS[t]} ${INSIGHT_TYPE_LABELS[t]}`,
          value: t as InsightType | "all",
        }))].map((f) => (
          <button key={f.value} onClick={() => setTypeFilter(f.value)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
              typeFilter === f.value
                ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/50 shadow-glow-primary"
                : "bg-white/5 text-text-mute border-white/10 hover:bg-white/10 hover:border-white/20"
            }`}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Add form toggle */}
      {!showForm ? (
        <button onClick={() => setShowForm(true)}
          className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-white/10 hover:border-indigo-500/35 hover:bg-white/5 text-text-mute hover:text-indigo-300 text-sm font-medium py-3 rounded-2xl transition-all cursor-pointer">
          + Catat Insight Baru
        </button>
      ) : (
        <AddInsightForm
          source={source}
          onSaved={() => { setShowForm(false); onRefresh(); }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Count */}
      {insights.length > 0 && (
        <p className="text-xs text-text-mute">
          {filtered.length} dari {insights.length} insight
        </p>
      )}

      {/* List */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center glass-soft border border-white/10 rounded-2xl shadow-card-depth">
          <span className="text-4xl mb-3">💡</span>
          <p className="text-sm font-medium text-text">
            {insights.length === 0 ? "Belum ada insight tercatat" : "Tidak ada yang cocok dengan filter"}
          </p>
          <p className="text-xs text-text-mute mt-1">
            {insights.length === 0 ? "Catat pelajaran penting dari sumber ini." : "Coba ubah filter atau kata kunci."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((i) => (
            <InsightCard key={i.id} insight={i} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}

const INPUT_CLS = "w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-text placeholder-text-mute focus:outline-none focus:ring-2 focus:ring-indigo-sleek/50 focus:border-transparent transition";
const LABEL_CLS = "block text-xs font-semibold text-text-mute uppercase tracking-wide mb-1.5";
