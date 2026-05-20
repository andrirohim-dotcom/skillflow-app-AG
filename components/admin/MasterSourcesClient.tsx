"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  togglePublishAction,
  deleteMasterSourceAction,
} from "@/app/(admin)/admin/sources/actions";
import MasterSourceForm from "@/components/admin/MasterSourceForm";
import type { MasterSource, SourceType } from "@/lib/types";

// ─── Constants ────────────────────────────────────────────────────────────────

const SOURCE_TYPE_ICONS: Record<SourceType, string> = {
  book: "📖",
  youtube: "▶️",
  article: "📝",
  podcast: "🎧",
  course: "🎓",
};

const SOURCE_TYPE_LABELS: Record<SourceType, string> = {
  book: "Buku",
  youtube: "YouTube",
  article: "Artikel",
  podcast: "Podcast",
  course: "Kursus",
};

const DIFFICULTY_LABELS: Record<string, string> = {
  beginner: "Pemula",
  intermediate: "Menengah",
  advanced: "Mahir",
};

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: "bg-green-100 text-green-700",
  intermediate: "bg-amber-100 text-amber-700",
  advanced: "bg-red-100 text-red-700",
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  initialSources: MasterSource[];
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function MasterSourcesClient({ initialSources }: Props) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<MasterSource | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Local filter state
  const [typeFilter, setTypeFilter] = useState<SourceType | "all">("all");
  const [langFilter, setLangFilter] = useState<"id" | "en" | "all">("all");
  const [publishFilter, setPublishFilter] = useState<"all" | "published" | "draft">("all");
  const [search, setSearch] = useState("");

  const filtered = initialSources.filter((s) => {
    if (typeFilter !== "all" && s.sourceType !== typeFilter) return false;
    if (langFilter !== "all" && s.language !== langFilter) return false;
    if (publishFilter === "published" && !s.isPublished) return false;
    if (publishFilter === "draft" && s.isPublished) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return s.title.toLowerCase().includes(q) || s.creatorName.toLowerCase().includes(q);
    }
    return true;
  });

  async function handleTogglePublish(source: MasterSource) {
    setTogglingId(source.id);
    try {
      await togglePublishAction(source.id, !source.isPublished);
      router.refresh();
    } finally {
      setTogglingId(null);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      await deleteMasterSourceAction(id);
      setConfirmDeleteId(null);
      router.refresh();
    } finally {
      setDeletingId(null);
    }
  }

  function handleFormSaved() {
    setShowForm(false);
    setEditTarget(null);
    router.refresh();
  }

  return (
    <>
      {/* Add/Edit Form Overlay */}
      {(showForm || editTarget) && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-start justify-center pt-16 px-4">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-gray-100 p-6 max-h-[80vh] overflow-y-auto">
            <MasterSourceForm
              defaultValues={editTarget ?? undefined}
              onSaved={handleFormSaved}
              onCancel={() => { setShowForm(false); setEditTarget(null); }}
            />
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
            <h3 className="text-base font-bold text-gray-900 mb-2">Hapus Sumber?</h3>
            <p className="text-sm text-gray-500 mb-5">
              Tindakan ini tidak dapat dibatalkan. Sumber akan dihapus dari katalog.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                onClick={() => handleDelete(confirmDeleteId)}
                disabled={!!deletingId}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold disabled:opacity-60"
              >
                {deletingId ? "Menghapus..." : "Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
        {/* Top row: search + add button */}
        <div className="flex items-center gap-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari judul atau pembuat..."
            className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300 focus:border-transparent"
          />
          <button
            onClick={() => { setEditTarget(null); setShowForm(true); }}
            className="shrink-0 bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
          >
            + Tambah Sumber
          </button>
        </div>

        {/* Filter row */}
        <div className="flex flex-wrap gap-2 text-xs">
          {/* Type filter */}
          {(["all", "book", "youtube", "article", "podcast", "course"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t as SourceType | "all")}
              className={`px-3 py-1 rounded-full border font-semibold transition-colors ${
                typeFilter === t
                  ? "bg-sky-600 text-white border-sky-600"
                  : "bg-white text-gray-500 border-gray-200 hover:border-sky-300 hover:text-sky-600"
              }`}
            >
              {t === "all" ? "Semua Jenis" : `${SOURCE_TYPE_ICONS[t as SourceType]} ${SOURCE_TYPE_LABELS[t as SourceType]}`}
            </button>
          ))}

          <div className="w-px bg-gray-200 mx-1" />

          {/* Language filter */}
          {(["all", "en", "id"] as const).map((l) => (
            <button
              key={l}
              onClick={() => setLangFilter(l)}
              className={`px-3 py-1 rounded-full border font-semibold transition-colors ${
                langFilter === l
                  ? "bg-violet-600 text-white border-violet-600"
                  : "bg-white text-gray-500 border-gray-200 hover:border-violet-300 hover:text-violet-600"
              }`}
            >
              {l === "all" ? "Semua Bahasa" : l === "en" ? "🇺🇸 Inggris" : "🇮🇩 Indonesia"}
            </button>
          ))}

          <div className="w-px bg-gray-200 mx-1" />

          {/* Publish filter */}
          {(["all", "published", "draft"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPublishFilter(p)}
              className={`px-3 py-1 rounded-full border font-semibold transition-colors ${
                publishFilter === p
                  ? "bg-gray-800 text-white border-gray-800"
                  : "bg-white text-gray-500 border-gray-200 hover:border-gray-400 hover:text-gray-700"
              }`}
            >
              {p === "all" ? "Semua Status" : p === "published" ? "✅ Published" : "📝 Draft"}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <p className="text-xs text-gray-400 px-1">
        Menampilkan {filtered.length} dari {initialSources.length} sumber
      </p>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <p className="text-4xl mb-3">📚</p>
            <p className="text-sm font-semibold">Belum ada sumber belajar</p>
            <p className="text-xs mt-1">Klik "Tambah Sumber" atau jalankan seed script</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                  <th className="text-left px-4 py-3 font-semibold">Judul</th>
                  <th className="text-left px-4 py-3 font-semibold">Jenis</th>
                  <th className="text-left px-4 py-3 font-semibold">Bahasa</th>
                  <th className="text-left px-4 py-3 font-semibold">Level</th>
                  <th className="text-left px-4 py-3 font-semibold">Skills</th>
                  <th className="text-center px-4 py-3 font-semibold">Status</th>
                  <th className="text-right px-4 py-3 font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((source) => (
                  <tr key={source.id} className="hover:bg-gray-50/50 transition-colors">
                    {/* Title */}
                    <td className="px-4 py-3 max-w-[220px]">
                      <p className="font-semibold text-gray-800 truncate">{source.title}</p>
                      <p className="text-xs text-gray-400 truncate">{source.creatorName}</p>
                    </td>

                    {/* Type */}
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-lg bg-gray-100 text-gray-600">
                        {SOURCE_TYPE_ICONS[source.sourceType]} {SOURCE_TYPE_LABELS[source.sourceType]}
                      </span>
                    </td>

                    {/* Language */}
                    <td className="px-4 py-3 text-xs text-gray-600">
                      {source.language === "id" ? "🇮🇩 ID" : "🇺🇸 EN"}
                    </td>

                    {/* Difficulty */}
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-lg ${DIFFICULTY_COLORS[source.difficultyLevel]}`}>
                        {DIFFICULTY_LABELS[source.difficultyLevel]}
                      </span>
                    </td>

                    {/* Skills */}
                    <td className="px-4 py-3 max-w-[180px]">
                      <div className="flex flex-wrap gap-1">
                        {source.skillTargets.slice(0, 2).map((s) => (
                          <span key={s} className="text-xs px-1.5 py-0.5 rounded-md bg-violet-50 text-violet-600 border border-violet-100">
                            {s}
                          </span>
                        ))}
                        {source.skillTargets.length > 2 && (
                          <span className="text-xs text-gray-400">+{source.skillTargets.length - 2}</span>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleTogglePublish(source)}
                        disabled={togglingId === source.id}
                        title={source.isPublished ? "Klik untuk jadikan draft" : "Klik untuk publish"}
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full transition-colors disabled:opacity-60 ${
                          source.isPublished
                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                            : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                        }`}
                      >
                        {togglingId === source.id ? "..." : source.isPublished ? "✅ Published" : "📝 Draft"}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => { setEditTarget(source); setShowForm(false); }}
                          className="text-xs font-semibold text-sky-600 hover:text-sky-800 px-2 py-1 rounded-lg hover:bg-sky-50 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(source.id)}
                          className="text-xs font-semibold text-red-400 hover:text-red-600 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
