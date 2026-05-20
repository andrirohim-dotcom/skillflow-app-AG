"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getWsSources, getWsSessions, getWsSkillProgress, deleteWsSource } from "@/lib/storageV2";
import { useWorkspace } from "@/lib/contexts/WorkspaceContext";
import { useAuth } from "@/lib/contexts/AuthContext";
import { sortSources, type SortKey } from "@/lib/utils/analytics";
import { sortByRelevance, scoreSourceRelevance } from "@/lib/utils/recommendations";
import { isOnboardingComplete } from "@/lib/utils/onboarding";
import { getSourceProgress } from "@/lib/utils/sourceProgress";
import { colorConfig, sourceTypeColors } from "@/lib/utils/colorConfig";
import {
  SOURCE_TYPE_ICONS,
  SOURCE_TYPE_LABELS,
  SOURCE_STATUS_COLORS,
  SOURCE_STATUS_LABELS,
  DIFFICULTY_LABELS,
  DIFFICULTY_COLORS,
} from "@/lib/constants";
import type {
  LearningSource,
  LearningSession,
  SkillProgress,
  SourceStatus,
  SourceType,
  DifficultyLevel,
} from "@/lib/types";
import Modal from "@/components/ui/Modal";
import AddSourceForm from "@/components/sources/AddSourceForm";
import CatalogPicker from "@/components/sources/CatalogPicker";
import type { SourcePrefill } from "@/lib/types";

// ─── Source Card ──────────────────────────────────────────────────────────────

function SourceCard({
  source,
  skills,
  sessions,
  matchReason,
  score,
  onDelete,
}: {
  source: LearningSource;
  skills: SkillProgress[];
  sessions: LearningSession[];
  matchReason?: string;
  score?: number;
  onDelete?: () => void;
}) {
  const stats = getSourceProgress(source);
  const colorKey = sourceTypeColors[source.progress.type] ?? "sky";
  const c = colorConfig[colorKey];
  const sessionCount = sessions.filter((s) => s.sourceId === source.id).length;
  const completedItems = skills.flatMap((sp) => sp.actionItems).filter((ai) => ai.completed).length;
  const totalItems = skills.flatMap((sp) => sp.actionItems).length;

  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-gray-200 transition-all duration-200 group flex flex-col">
      {/* Top accent bar */}
      <div className={`h-1 w-full ${c.bar}`} />

      <div className="p-5 flex-1 flex flex-col">
        {/* Badges row */}
        <div className="flex flex-wrap items-center gap-1.5 mb-3">
          <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg ${c.badge}`}>
            {SOURCE_TYPE_ICONS[source.progress.type]}{" "}
            {SOURCE_TYPE_LABELS[source.progress.type]}
          </span>
          <span className={`text-xs font-medium px-2 py-1 rounded-lg ${SOURCE_STATUS_COLORS[source.status]}`}>
            {SOURCE_STATUS_LABELS[source.status]}
          </span>
          <span className={`text-xs font-medium px-2 py-1 rounded-lg ${DIFFICULTY_COLORS[source.difficultyLevel]}`}>
            {DIFFICULTY_LABELS[source.difficultyLevel]}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-bold text-gray-900 text-base leading-snug">{source.title}</h3>
        <p className="text-xs text-gray-400 mt-0.5 mb-3">{source.creatorName}</p>

        {/* Progress */}
        <div className="mb-3">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-400">{stats.consumed} / {stats.total} {stats.unitLabel}</span>
            <span className={`font-bold ${c.text}`}>{stats.pct}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
            <div className={`h-1.5 rounded-full transition-all ${c.bar}`} style={{ width: `${stats.pct}%` }} />
          </div>
        </div>

        {/* Tags */}
        {source.topicTags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {source.topicTags.slice(0, 3).map((tag) => (
              <span key={tag} className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md">{tag}</span>
            ))}
          </div>
        )}

        {/* Match chip (Untuk Kamu tab) */}
        {matchReason && matchReason !== "" && (
          <div className="mb-3">
            <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-md bg-violet-50 text-violet-600 border border-violet-100">
              ✨ {matchReason}
            </span>
            {score !== undefined && (
              <span className="ml-1 text-xs font-bold text-violet-500">{score}% cocok</span>
            )}
          </div>
        )}

        {/* Footer stats */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-50">
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span>⏱️ {sessionCount} sesi</span>
            {totalItems > 0 && <span>✅ {completedItems}/{totalItems}</span>}
          </div>
          <div className="flex items-center gap-3">
            {onDelete && (
              <button
                onClick={onDelete}
                className="text-gray-400 hover:text-red-500 transition-colors"
                title="Hapus sumber"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
            <a
              href={`/dashboard/item/${source.id}`}
              className={`text-xs font-semibold ${c.text} hover:underline transition-colors`}
            >
              Buka Detail →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-20 text-center bg-white border border-dashed border-gray-200 rounded-2xl animate-slide-up">
      <div className="text-6xl mb-4">📚</div>
      <h3 className="text-lg font-bold text-gray-700">Belum ada sumber belajar</h3>
      <p className="text-sm text-gray-400 mt-1 mb-6 max-w-xs">
        Tambahkan buku, video, podcast, atau kursus pertama Anda untuk mulai belajar secara terstruktur.
      </p>
      <button
        onClick={onAdd}
        className="bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-all hover:shadow-md active:scale-95"
      >
        + Tambah Sumber Pertama
      </button>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const SOURCE_TYPES: SourceType[] = ["book", "youtube", "article", "podcast", "course"];

export default function SourcesPage() {
  const { currentUser: user, currentWorkspace: workspace } = useWorkspace();
  const { profile } = useAuth();
  const [sources, setSources] = useState<LearningSource[]>([]);
  const [sessions, setSessions] = useState<LearningSession[]>([]);
  const [skills, setSkills] = useState<SkillProgress[]>([]);
  const [mounted, setMounted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalTab, setModalTab] = useState<"catalog" | "manual">("catalog");
  const [prefill, setPrefill] = useState<SourcePrefill | undefined>(undefined);

  const [typeFilter, setTypeFilter] = useState<SourceType | "all" | "recommended">("all");
  const [statusFilter, setStatusFilter] = useState<SourceStatus | "all">("all");
  const [diffFilter, setDiffFilter] = useState<DifficultyLevel | "all">("all");
  const [sortKey, setSortKey] = useState<SortKey>("newest");

  const load = useCallback(async () => {
    if (!user || !workspace) return;
    
    // Simulate async
    await new Promise(r => setTimeout(r, 0));
    
    const src = await getWsSources(workspace.id, user.id, "all");
    const sess = await getWsSessions(workspace.id, user.id);
    const sp = await getWsSkillProgress(workspace.id, user.id);
    
    setSources(src);
    setSessions(sess);
    setSkills(sp);
  }, [user, workspace]);

  const handleDelete = useCallback(async (id: string, title: string) => {
    if (!workspace || !user) return;
    if (window.confirm(`Apakah Anda yakin ingin menghapus "${title}"?\nAksi ini tidak dapat dibatalkan.`)) {
      await deleteWsSource(workspace.id, id);
      load();
    }
  }, [workspace, user, load]);

  useEffect(() => { load(); setMounted(true); }, [load]);

  const filtered = useMemo(() => {
    if (typeFilter === "recommended") {
      let r = sortByRelevance(sources, profile?.focusAreas ?? []);
      if (statusFilter !== "all") r = r.filter((s) => s.status === statusFilter);
      if (diffFilter !== "all") r = r.filter((s) => s.difficultyLevel === diffFilter);
      return r;
    }
    let r = sources;
    if (typeFilter !== "all") r = r.filter((s) => s.progress.type === typeFilter);
    if (statusFilter !== "all") r = r.filter((s) => s.status === statusFilter);
    if (diffFilter !== "all") r = r.filter((s) => s.difficultyLevel === diffFilter);
    return sortSources(r, sortKey, sessions);
  }, [sources, typeFilter, statusFilter, diffFilter, sortKey, sessions]);

  if (!mounted) return <Skeleton />;

  return (
    <>
      {showModal && (
        <Modal onClose={() => {
          setShowModal(false);
          setPrefill(undefined);
          setModalTab("catalog");
        }}>
          {/* Two-tab header */}
          <div className="flex border-b border-gray-100 -mx-6 -mt-4 mb-4 rounded-t-2xl overflow-hidden">
            <button
              onClick={() => setModalTab("catalog")}
              className={`flex-1 py-3 text-sm font-semibold transition-colors ${
                modalTab === "catalog"
                  ? "bg-white text-sky-600 border-b-2 border-sky-500"
                  : "bg-gray-50 text-gray-500 hover:text-gray-700"
              }`}
            >
              📚 Pilih dari Katalog
            </button>
            <button
              onClick={() => setModalTab("manual")}
              className={`flex-1 py-3 text-sm font-semibold transition-colors ${
                modalTab === "manual"
                  ? "bg-white text-sky-600 border-b-2 border-sky-500"
                  : "bg-gray-50 text-gray-500 hover:text-gray-700"
              }`}
            >
              ✏️ Isi Manual
            </button>
          </div>

          {modalTab === "catalog" ? (
            <CatalogPicker
              onSelect={(pf) => {
                setPrefill(pf);
                setModalTab("manual");
              }}
            />
          ) : (
            <AddSourceForm
              prefill={prefill}
              onSaved={() => {
                load();
                setShowModal(false);
                setPrefill(undefined);
                setModalTab("catalog");
              }}
            />
          )}
        </Modal>
      )}

      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Sumber Belajar</h1>
          <p className="text-sm text-gray-400 mt-0.5">{sources.length} sumber terdaftar</p>
        </div>
        <button
          onClick={() => { setPrefill(undefined); setModalTab("catalog"); setShowModal(true); }}
          className="bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-sm shadow-sky-100 transition-all hover:shadow-md active:scale-95"
        >
          + Tambah Sumber
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4 mb-6 shadow-sm space-y-3">
        {/* Type pills */}
        <div className="flex flex-wrap gap-1.5">
          {[{ label: "Semua Tipe", value: "all" as const }, ...SOURCE_TYPES.map((t) => ({
            label: `${SOURCE_TYPE_ICONS[t]} ${SOURCE_TYPE_LABELS[t]}`,
            value: t as SourceType | "all" | "recommended",
          }))].map((f) => (
            <button key={f.value} onClick={() => setTypeFilter(f.value)}
              className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-all ${
                typeFilter === f.value
                  ? "bg-sky-600 text-white border-sky-600"
                  : "bg-white text-gray-500 border-gray-200 hover:border-sky-200 hover:text-sky-600"
              }`}>
              {f.label}
            </button>
          ))}
          <button
            onClick={() => setTypeFilter("recommended")}
            className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-all ${
              typeFilter === "recommended"
                ? "bg-violet-600 text-white border-violet-600"
                : "bg-white text-gray-500 border-gray-200 hover:border-violet-200 hover:text-violet-600"
            }`}
          >
            ✨ Untuk Kamu
          </button>
        </div>

        {/* Status + difficulty + sort */}
        <div className="flex flex-wrap gap-2">
          {[
            {
              value: statusFilter,
              onChange: (v: string) => setStatusFilter(v as SourceStatus | "all"),
              opts: [
                { label: "Semua Status", value: "all" },
                { label: "Sedang Belajar", value: "in_progress" },
                { label: "Belum Dimulai", value: "not_started" },
                { label: "Selesai", value: "completed" },
                { label: "Ditunda", value: "on_hold" },
              ],
            },
            {
              value: diffFilter,
              onChange: (v: string) => setDiffFilter(v as DifficultyLevel | "all"),
              opts: [
                { label: "Semua Level", value: "all" },
                { label: "Pemula", value: "beginner" },
                { label: "Menengah", value: "intermediate" },
                { label: "Lanjutan", value: "advanced" },
              ],
            },
            {
              value: sortKey,
              onChange: (v: string) => setSortKey(v as SortKey),
              opts: [
                { label: "Terbaru", value: "newest" },
                { label: "Progres Terkecil", value: "least_progress" },
                { label: "Progres Terbesar", value: "most_progress" },
                { label: "Paling Aktif", value: "most_active" },
              ],
            },
          ].map((sel, i) => (
            <select key={i} value={sel.value} onChange={(e) => sel.onChange(e.target.value)}
              className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 text-gray-600 bg-white focus:outline-none focus:ring-1 focus:ring-sky-300">
              {sel.opts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          ))}
        </div>

        {/* Result count */}
        <p className="text-xs text-gray-400">
          Menampilkan <span className="font-semibold text-gray-600">{filtered.length}</span> dari {sources.length} sumber
        </p>
      </div>

      {/* Not-onboarded banner for recommended tab */}
      {typeFilter === "recommended" && (
        <div className="mb-4 bg-violet-50 border border-violet-100 rounded-2xl p-5 text-center">
          <p className="text-sm font-semibold text-violet-800 mb-1">Preferensi belum diatur</p>
          <p className="text-xs text-violet-600">Selesaikan pengaturan awal agar SkillFlow bisa merekomendasikan konten yang tepat.</p>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 animate-slide-up">
        {filtered.length === 0 ? (
          <EmptyState onAdd={() => setShowModal(true)} />
        ) : (
          filtered.map((source) => {
            const rel = typeFilter === "recommended"
              ? scoreSourceRelevance(source, profile?.focusAreas ?? [])
              : null;
            return (
              <SourceCard
                key={source.id}
                source={source}
                skills={skills.filter((sp) => sp.sourceId === source.id)}
                sessions={sessions}
                matchReason={rel?.matchReason}
                score={rel?.score}
                onDelete={() => handleDelete(source.id, source.title)}
              />
            );
          })
        )}
      </div>
    </>
  );
}

function Skeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-10 bg-gray-100 rounded-xl w-64" />
      <div className="h-28 bg-gray-100 rounded-2xl" />
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => <div key={i} className="h-64 bg-gray-100 rounded-2xl" />)}
      </div>
    </div>
  );
}
