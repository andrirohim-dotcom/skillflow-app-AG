"use client";

import { useState } from "react";
import {
  createMasterSourceAction,
  updateMasterSourceAction,
} from "@/app/(admin)/admin/sources/actions";
import { TOPIC_CATEGORIES } from "@/lib/topicTaxonomy";
import { CANONICAL_SKILLS } from "@/lib/skillTaxonomy";
import TagPicker, { type TagGroup } from "@/components/ui/TagPicker";
import type { MasterSource, SourceType, DifficultyLevel } from "@/lib/types";

// ─── Tag groups ───────────────────────────────────────────────────────────────

const TOPIC_GROUPS: TagGroup[] = TOPIC_CATEGORIES.map((c) => ({
  groupKey: c.key,
  groupLabel: c.name,
  groupEmoji: c.emoji,
  options: c.topics,
}));

const SKILL_CATEGORY_EMOJI: Record<string, string> = {
  Business: "💼",
  Technical: "💻",
  Personal: "🧑",
  Finance: "💰",
};

const SKILL_GROUPS: TagGroup[] = Array.from(
  CANONICAL_SKILLS.reduce((map, skill) => {
    if (!map.has(skill.category)) map.set(skill.category, []);
    map.get(skill.category)!.push(skill.name);
    return map;
  }, new Map<string, string[]>())
).map(([category, names]) => ({
  groupKey: category,
  groupLabel: category,
  groupEmoji: SKILL_CATEGORY_EMOJI[category] ?? "📌",
  options: names,
}));

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormState {
  sourceType: SourceType;
  title: string;
  creatorName: string;
  url: string;
  topicTags: string[];
  skillTargets: string[];
  difficultyLevel: DifficultyLevel;
  description: string;
  language: "id" | "en";
  isPublished: boolean;
}

interface Props {
  defaultValues?: MasterSource;
  onSaved: () => void;
  onCancel: () => void;
}

const SOURCE_TYPES: SourceType[] = ["book", "youtube", "article", "podcast", "course"];
const SOURCE_TYPE_LABELS: Record<SourceType, string> = {
  book: "Buku",
  youtube: "YouTube",
  article: "Artikel",
  podcast: "Podcast",
  course: "Kursus",
};
const SOURCE_TYPE_ICONS: Record<SourceType, string> = {
  book: "📖",
  youtube: "▶️",
  article: "📝",
  podcast: "🎧",
  course: "🎓",
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function MasterSourceForm({ defaultValues, onSaved, onCancel }: Props) {
  const isEdit = !!defaultValues;

  const [form, setForm] = useState<FormState>({
    sourceType: defaultValues?.sourceType ?? "book",
    title: defaultValues?.title ?? "",
    creatorName: defaultValues?.creatorName ?? "",
    url: defaultValues?.url ?? "",
    topicTags: defaultValues?.topicTags ?? [],
    skillTargets: defaultValues?.skillTargets ?? [],
    difficultyLevel: defaultValues?.difficultyLevel ?? "beginner",
    description: defaultValues?.description ?? "",
    language: defaultValues?.language ?? "en",
    isPublished: defaultValues?.isPublished ?? false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) { setError("Judul wajib diisi"); return; }
    if (!form.creatorName.trim()) { setError("Nama pembuat wajib diisi"); return; }
    if (form.skillTargets.length === 0) { setError("Pilih minimal 1 skill target"); return; }

    setError("");
    setLoading(true);
    try {
      const input = {
        sourceType: form.sourceType,
        title: form.title.trim(),
        creatorName: form.creatorName.trim(),
        url: form.url.trim() || undefined,
        topicTags: form.topicTags,
        skillTargets: form.skillTargets,
        difficultyLevel: form.difficultyLevel,
        description: form.description.trim() || undefined,
        language: form.language,
        isPublished: form.isPublished,
      };

      if (isEdit && defaultValues) {
        await updateMasterSourceAction(defaultValues.id, input);
      } else {
        await createMasterSourceAction(input);
      }
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">
          {isEdit ? "Edit Sumber" : "Tambah Master Sumber"}
        </h2>
        <button
          type="button"
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600 text-xl leading-none"
        >
          ×
        </button>
      </div>

      {/* Source type */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          Jenis Sumber
        </label>
        <div className="flex flex-wrap gap-2">
          {SOURCE_TYPES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => set("sourceType", t)}
              className={`px-3 py-1.5 rounded-xl text-sm font-semibold border transition-all ${
                form.sourceType === t
                  ? "bg-sky-600 text-white border-sky-600"
                  : "bg-white text-gray-600 border-gray-200 hover:border-sky-300 hover:text-sky-600"
              }`}
            >
              {SOURCE_TYPE_ICONS[t]} {SOURCE_TYPE_LABELS[t]}
            </button>
          ))}
        </div>
      </div>

      {/* Title + Creator */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
            Judul <span className="text-red-400">*</span>
          </label>
          <input
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="Judul sumber belajar"
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
            Pembuat / Penulis <span className="text-red-400">*</span>
          </label>
          <input
            value={form.creatorName}
            onChange={(e) => set("creatorName", e.target.value)}
            placeholder="Nama penulis / channel / host"
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300 focus:border-transparent"
          />
        </div>
      </div>

      {/* URL */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
          URL (opsional)
        </label>
        <input
          value={form.url}
          onChange={(e) => set("url", e.target.value)}
          placeholder="https://..."
          type="url"
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300 focus:border-transparent"
        />
      </div>

      {/* Difficulty + Language */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
            Level Kesulitan
          </label>
          <select
            value={form.difficultyLevel}
            onChange={(e) => set("difficultyLevel", e.target.value as DifficultyLevel)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300 focus:border-transparent bg-white"
          >
            <option value="beginner">Pemula</option>
            <option value="intermediate">Menengah</option>
            <option value="advanced">Mahir</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
            Bahasa
          </label>
          <select
            value={form.language}
            onChange={(e) => set("language", e.target.value as "id" | "en")}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300 focus:border-transparent bg-white"
          >
            <option value="en">🇺🇸 Inggris</option>
            <option value="id">🇮🇩 Indonesia</option>
          </select>
        </div>
      </div>

      {/* Topic Tags */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
          Topik
        </label>
        <TagPicker
          value={form.topicTags}
          onChange={(tags) => set("topicTags", tags)}
          groups={TOPIC_GROUPS}
          placeholder="Cari topik atau tambah kustom..."
          accentColor="sky"
        />
      </div>

      {/* Skill Targets */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
          Skill Target <span className="text-red-400">*</span>
        </label>
        <TagPicker
          value={form.skillTargets}
          onChange={(tags) => set("skillTargets", tags)}
          groups={SKILL_GROUPS}
          placeholder="Cari skill dari daftar atau tambah kustom..."
          accentColor="violet"
          required
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
          Deskripsi (opsional)
        </label>
        <textarea
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          rows={3}
          placeholder="Ringkasan singkat tentang sumber ini..."
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300 focus:border-transparent resize-none"
        />
      </div>

      {/* Is Published */}
      <label className="flex items-center gap-3 cursor-pointer">
        <div className="relative">
          <input
            type="checkbox"
            checked={form.isPublished}
            onChange={(e) => set("isPublished", e.target.checked)}
            className="sr-only"
          />
          <div
            className={`w-10 h-6 rounded-full transition-colors ${
              form.isPublished ? "bg-sky-500" : "bg-gray-200"
            }`}
          />
          <div
            className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
              form.isPublished ? "translate-x-4" : "translate-x-0"
            }`}
          />
        </div>
        <span className="text-sm font-medium text-gray-700">
          {form.isPublished ? "Dipublish (terlihat user)" : "Draft (tidak terlihat user)"}
        </span>
      </label>

      {/* Error */}
      {error && (
        <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
          {error}
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold transition-colors disabled:opacity-60"
        >
          {loading ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Tambah Sumber"}
        </button>
      </div>
    </form>
  );
}
