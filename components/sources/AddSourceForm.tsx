"use client";

import { useEffect, useState } from "react";
import { saveWsSource, saveWsSkillProgress } from "@/lib/storageV2";
import { useWorkspace } from "@/lib/contexts/WorkspaceContext";
import { generateActionPlan } from "@/lib/utils/actionPlanGenerator";
import {
  SOURCE_TYPE_LABELS,
  SOURCE_TYPE_ICONS,
  SOURCE_TYPE_CREATOR_LABEL,
} from "@/lib/constants";
import { TOPIC_CATEGORIES } from "@/lib/topicTaxonomy";
import { CANONICAL_SKILLS } from "@/lib/skillTaxonomy";
import TagPicker, { type TagGroup } from "@/components/ui/TagPicker";
import type {
  SourceType,
  SourceStatus,
  DifficultyLevel,
  LearningSource,
  SkillProgress,
  ProgressData,
  SourcePrefill,
} from "@/lib/types";

// ─── Tag Groups (built once, outside component) ───────────────────────────────

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

// ─── Form state ───────────────────────────────────────────────────────────────

interface FormState {
  sourceType: SourceType;
  title: string;
  creatorName: string;
  url: string;
  topicTags: string[];
  skillTargets: string[];
  status: SourceStatus;
  difficultyLevel: DifficultyLevel;
  // book
  totalPages: string;
  currentPage: string;
  // youtube / podcast
  totalMinutes: string;
  watchedMinutes: string;
  // article
  estimatedReadMinutes: string;
  consumedMinutes: string;
  // course
  courseTrackBy: "modules" | "minutes";
  totalModules: string;
  completedModules: string;
  // reading targets
  dailyPageTarget: string;
  targetCompletionDate: string;
}

const INITIAL_STATE: FormState = {
  sourceType: "book",
  title: "",
  creatorName: "",
  url: "",
  topicTags: [],
  skillTargets: [],
  status: "not_started",
  difficultyLevel: "beginner",
  totalPages: "",
  currentPage: "0",
  totalMinutes: "",
  watchedMinutes: "0",
  estimatedReadMinutes: "",
  consumedMinutes: "0",
  courseTrackBy: "modules",
  totalModules: "",
  completedModules: "0",
  dailyPageTarget: "",
  targetCompletionDate: "",
};

const SOURCE_TYPES: SourceType[] = ["book", "youtube", "article", "podcast", "course"];

interface Props {
  onSaved?: () => void;
  prefill?: SourcePrefill;
}

function buildInitialFromPrefill(prefill: SourcePrefill): FormState {
  return {
    ...INITIAL_STATE,
    sourceType: prefill.sourceType,
    title: prefill.title,
    creatorName: prefill.creatorName,
    url: prefill.url,
    topicTags: prefill.topicTags,
    skillTargets: prefill.skillTargets,
    difficultyLevel: prefill.difficultyLevel,
  };
}

// ─── Metadata Link Parser ───────────────────────────────────────────────────

interface ParsedMetadata {
  title?: string;
  creatorName?: string;
  sourceType?: SourceType;
}

async function parseUrlMetadata(urlStr: string): Promise<ParsedMetadata | null> {
  try {
    const url = new URL(urlStr);
    
    // 1. YouTube
    if (url.hostname.includes("youtube.com") || url.hostname.includes("youtu.be")) {
      const res = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(urlStr)}`);
      if (res.ok) {
        const data = await res.json();
        return {
          title: data.title || "",
          creatorName: data.author_name || "YouTube Creator",
          sourceType: "youtube" as const,
        };
      }
      return {
        sourceType: "youtube" as const,
      };
    }
    
    // 2. Spotify
    if (url.hostname.includes("spotify.com")) {
      try {
        const res = await fetch(`https://open.spotify.com/oembed?url=${encodeURIComponent(urlStr)}`);
        if (res.ok) {
          const data = await res.json();
          return {
            title: data.title || "",
            creatorName: data.provider_name || "Spotify Podcast",
            sourceType: "podcast" as const,
          };
        }
      } catch (e) {}
      return {
        sourceType: "podcast" as const,
        creatorName: "Spotify Podcast",
      };
    }

    // 3. Fallback: Parse slug
    const pathParts = url.pathname.split("/").filter(Boolean);
    if (pathParts.length > 0) {
      const lastPart = pathParts[pathParts.length - 1];
      const parsedTitle = lastPart
        .replace(/[-_]/g, " ")
        .replace(/\.[a-z0-9]+$/i, "") // remove extensions
        .split(" ")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
      
      const domain = url.hostname.replace("www.", "");
      
      return {
        title: parsedTitle || domain,
        creatorName: domain,
        sourceType: "article" as const,
      };
    }
    
    return {
      title: url.hostname.replace("www.", ""),
      creatorName: url.hostname.replace("www.", ""),
      sourceType: "article" as const,
    };
  } catch (e) {
    return null;
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AddSourceForm({ onSaved, prefill }: Props) {
  const { currentUser: user, currentWorkspace: workspace } = useWorkspace();
  const [form, setForm] = useState<FormState>(
    prefill ? buildInitialFromPrefill(prefill) : INITIAL_STATE
  );
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [lastTitle, setLastTitle] = useState("");
  const [isScanning, setIsScanning] = useState(false);

  const handleScanLink = async () => {
    if (!form.url.trim()) return;
    setIsScanning(true);
    setError("");
    try {
      const meta = await parseUrlMetadata(form.url.trim());
      if (meta) {
        setForm((prev) => {
          const next = { ...prev };
          if (meta.title) next.title = meta.title;
          if (meta.creatorName) next.creatorName = meta.creatorName;
          if (meta.sourceType) next.sourceType = meta.sourceType;
          return next;
        });
      } else {
        setError("Tidak dapat mengambil informasi otomatis dari link ini. Silakan isi manual.");
      }
    } catch (e) {
      setError("Gagal memindai link. Silakan isi secara manual.");
    } finally {
      setIsScanning(false);
    }
  };

  // Reset form when user picks a different source from the catalog
  useEffect(() => {
    if (prefill) {
      setForm(buildInitialFromPrefill(prefill));
      setError("");
      setSaved(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefill]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  // ─── Validation ────────────────────────────────────────────────────────────

  function validate(): string {
    if (!form.title.trim()) return "Judul sumber belajar tidak boleh kosong.";
    if (!form.creatorName.trim()) return `Nama ${SOURCE_TYPE_CREATOR_LABEL[form.sourceType]} tidak boleh kosong.`;
    if (form.skillTargets.length < 1)
      return "Masukkan minimal 1 skill yang ingin dipelajari.";

    switch (form.sourceType) {
      case "book":
        if (!form.totalPages || Number(form.totalPages) < 1)
          return "Total halaman harus diisi dan lebih dari 0.";
        break;
      case "youtube":
      case "podcast":
        if (!form.totalMinutes || Number(form.totalMinutes) < 1)
          return "Total durasi (menit) harus diisi.";
        break;
      case "article":
        if (!form.estimatedReadMinutes || Number(form.estimatedReadMinutes) < 1)
          return "Estimasi waktu baca harus diisi.";
        break;
      case "course":
        if (form.courseTrackBy === "modules" && (!form.totalModules || Number(form.totalModules) < 1))
          return "Total modul harus diisi.";
        if (form.courseTrackBy === "minutes" && (!form.totalMinutes || Number(form.totalMinutes) < 1))
          return "Total durasi (menit) harus diisi.";
        break;
    }
    return "";
  }

  // ─── Build ProgressData ────────────────────────────────────────────────────

  function buildProgress(): ProgressData {
    switch (form.sourceType) {
      case "book":
        return {
          type: "book",
          totalPages: Number(form.totalPages),
          currentPage: Number(form.currentPage) || 0,
        };
      case "youtube":
        return {
          type: "youtube",
          totalMinutes: Number(form.totalMinutes),
          watchedMinutes: Number(form.watchedMinutes) || 0,
        };
      case "article":
        return {
          type: "article",
          estimatedReadMinutes: Number(form.estimatedReadMinutes),
          consumedMinutes: Number(form.consumedMinutes) || 0,
        };
      case "podcast":
        return {
          type: "podcast",
          totalMinutes: Number(form.totalMinutes),
          listenedMinutes: Number(form.watchedMinutes) || 0,
        };
      case "course":
        return form.courseTrackBy === "modules"
          ? {
              type: "course",
              totalModules: Number(form.totalModules),
              completedModules: Number(form.completedModules) || 0,
            }
          : {
              type: "course",
              totalMinutes: Number(form.totalMinutes),
              watchedMinutes: Number(form.watchedMinutes) || 0,
            };
    }
  }

  // ─── Submit ────────────────────────────────────────────────────────────────

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    setError("");
    if (!user) return;

    const now = new Date().toISOString();
    const sourceId = crypto.randomUUID();

    const source: LearningSource = {
      id: sourceId,
      title: form.title.trim(),
      creatorName: form.creatorName.trim(),
      url: form.url.trim(),
      topicTags: form.topicTags,
      skillTargets: form.skillTargets,
      status: form.status,
      difficultyLevel: form.difficultyLevel,
      progress: buildProgress(),
      dailyPageTarget: form.dailyPageTarget ? Number(form.dailyPageTarget) : undefined,
      targetCompletionDate: form.targetCompletionDate || undefined,
      createdAt: now,
      updatedAt: now,
      workspaceId: workspace?.id,
      createdBy: user?.id,
      visibility: "personal",
    };

    if (!workspace || !user) {
      setError("Data sesi tidak valid.");
      return;
    }

    await saveWsSource(workspace.id, source);

    for (const skillName of source.skillTargets) {
      const spId = crypto.randomUUID();
      const sp: SkillProgress = {
        id: spId,
        sourceId,
        skillName,
        category: "general",
        actionItems: generateActionPlan(skillName, form.title.trim()).map((text) => ({
          id: crypto.randomUUID(),
          skillProgressId: spId,
          text,
          completed: false,
        })),
        createdAt: now,
        workspaceId: workspace?.id,
        userId: user?.id,
      };
      await saveWsSkillProgress(workspace.id, user.id, sp);
    }

    setLastTitle(form.title.trim());
    setSaved(true);
    onSaved?.();
  }

  function handleAddAnother() {
    setForm(INITIAL_STATE);
    setSaved(false);
    setError("");
  }

  // ─── Success State ─────────────────────────────────────────────────────────

  if (saved) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-500 to-sky-500 px-6 py-5">
          <p className="text-white text-sm font-medium">Sumber Belajar Ditambahkan</p>
          <h2 className="text-white text-lg font-bold mt-0.5">{lastTitle}</h2>
        </div>
        <div className="p-6 flex flex-col items-center text-center">
          <div className="text-5xl mb-3">🎉</div>
          <p className="text-gray-700 font-semibold">Berhasil disimpan!</p>
          <p className="text-sm text-gray-400 mt-1 mb-6">
            Sumber belajar & action plan skill sudah tersimpan di dashboard.
          </p>
          <button
            onClick={handleAddAnother}
            className="bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors"
          >
            + Tambah Sumber Lain
          </button>
        </div>
      </div>
    );
  }

  // ─── Form ──────────────────────────────────────────────────────────────────

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-sky-600 to-violet-600 px-6 py-5">
        <h2 className="text-lg font-bold text-white">Tambah Sumber Belajar</h2>
        <p className="text-sky-100 text-sm mt-0.5">
          Buku, video, artikel, podcast, atau kursus — semua bisa dilacak.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-5">

        {/* ── Source Type Selector ── */}
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
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                  form.sourceType === t
                    ? "bg-sky-600 text-white border-sky-600 shadow-sm"
                    : "bg-white text-gray-600 border-gray-200 hover:border-sky-300 hover:text-sky-600"
                }`}
              >
                <span>{SOURCE_TYPE_ICONS[t]}</span>
                {SOURCE_TYPE_LABELS[t]}
              </button>
            ))}
          </div>
        </div>

        {/* ── Common Fields ── */}
        <div className="grid grid-cols-1 gap-4">
          <Field label="Judul" required>
            <input
              type="text"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder={
                form.sourceType === "book" ? "Contoh: Atomic Habits"
                : form.sourceType === "youtube" ? "Contoh: Clean Code Tutorial"
                : form.sourceType === "article" ? "Contoh: How Habit Stacking Works"
                : form.sourceType === "podcast" ? "Contoh: Huberman Lab #45"
                : "Contoh: Next.js Full Course 2025"
              }
              className={INPUT_CLS}
            />
          </Field>

          <Field label={SOURCE_TYPE_CREATOR_LABEL[form.sourceType]} required>
            <input
              type="text"
              value={form.creatorName}
              onChange={(e) => set("creatorName", e.target.value)}
              placeholder={
                form.sourceType === "book" ? "Contoh: James Clear"
                : form.sourceType === "youtube" ? "Contoh: Fireship"
                : form.sourceType === "podcast" ? "Contoh: Andrew Huberman"
                : "Contoh: Udemy"
              }
              className={INPUT_CLS}
            />
          </Field>

          <Field label="URL (opsional)">
            <div className="flex gap-2">
              <input
                type="url"
                value={form.url}
                onChange={(e) => set("url", e.target.value)}
                placeholder="https://..."
                className={`${INPUT_CLS} flex-1`}
              />
              <button
                type="button"
                onClick={handleScanLink}
                disabled={isScanning || !form.url.trim()}
                className="px-4 py-2 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 disabled:from-gray-100 disabled:to-gray-200 disabled:text-gray-400 text-white font-semibold text-xs rounded-xl transition-all flex items-center gap-1.5 active:scale-[0.98] disabled:scale-100 shadow-sm border border-transparent"
              >
                {isScanning ? (
                  <>
                    <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Memindai...</span>
                  </>
                ) : (
                  <>
                    <span>⚡</span>
                    <span>Scan Link</span>
                  </>
                )}
              </button>
            </div>
          </Field>
        </div>

        {/* ── Type-Specific Progress Fields ── */}
        <div className="bg-gray-50 rounded-xl p-4 space-y-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Progres Awal
          </p>

          {form.sourceType === "book" && (
            <div className="grid grid-cols-2 gap-3">
              <Field label="Total Halaman" required>
                <input type="number" min="1" value={form.totalPages}
                  onChange={(e) => set("totalPages", e.target.value)}
                  placeholder="320" className={INPUT_CLS} />
              </Field>
              <Field label="Halaman Saat Ini">
                <input type="number" min="0" value={form.currentPage}
                  onChange={(e) => set("currentPage", e.target.value)}
                  placeholder="0" className={INPUT_CLS} />
              </Field>
            </div>
          )}

          {(form.sourceType === "youtube" || form.sourceType === "podcast") && (
            <div className="grid grid-cols-2 gap-3">
              <Field label="Total Durasi (menit)" required>
                <input type="number" min="1" value={form.totalMinutes}
                  onChange={(e) => set("totalMinutes", e.target.value)}
                  placeholder="60" className={INPUT_CLS} />
              </Field>
              <Field label={form.sourceType === "youtube" ? "Sudah Ditonton (menit)" : "Sudah Didengarkan (menit)"}>
                <input type="number" min="0" value={form.watchedMinutes}
                  onChange={(e) => set("watchedMinutes", e.target.value)}
                  placeholder="0" className={INPUT_CLS} />
              </Field>
            </div>
          )}

          {form.sourceType === "article" && (
            <div className="grid grid-cols-2 gap-3">
              <Field label="Estimasi Baca (menit)" required>
                <input type="number" min="1" value={form.estimatedReadMinutes}
                  onChange={(e) => set("estimatedReadMinutes", e.target.value)}
                  placeholder="15" className={INPUT_CLS} />
              </Field>
              <Field label="Sudah Dibaca (menit)">
                <input type="number" min="0" value={form.consumedMinutes}
                  onChange={(e) => set("consumedMinutes", e.target.value)}
                  placeholder="0" className={INPUT_CLS} />
              </Field>
            </div>
          )}

          {form.sourceType === "course" && (
            <>
              <div className="flex gap-2 mb-2">
                {(["modules", "minutes"] as const).map((mode) => (
                  <button key={mode} type="button"
                    onClick={() => set("courseTrackBy", mode)}
                    className={`text-xs px-3 py-1 rounded-lg border font-medium transition-all ${
                      form.courseTrackBy === mode
                        ? "bg-sky-600 text-white border-sky-600"
                        : "bg-white text-gray-500 border-gray-200 hover:border-sky-300"
                    }`}
                  >
                    {mode === "modules" ? "Per Modul" : "Per Menit"}
                  </button>
                ))}
              </div>
              {form.courseTrackBy === "modules" ? (
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Total Modul" required>
                    <input type="number" min="1" value={form.totalModules}
                      onChange={(e) => set("totalModules", e.target.value)}
                      placeholder="12" className={INPUT_CLS} />
                  </Field>
                  <Field label="Modul Selesai">
                    <input type="number" min="0" value={form.completedModules}
                      onChange={(e) => set("completedModules", e.target.value)}
                      placeholder="0" className={INPUT_CLS} />
                  </Field>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Total Durasi (menit)" required>
                    <input type="number" min="1" value={form.totalMinutes}
                      onChange={(e) => set("totalMinutes", e.target.value)}
                      placeholder="300" className={INPUT_CLS} />
                  </Field>
                  <Field label="Sudah Ditonton (menit)">
                    <input type="number" min="0" value={form.watchedMinutes}
                      onChange={(e) => set("watchedMinutes", e.target.value)}
                      placeholder="0" className={INPUT_CLS} />
                  </Field>
                </div>
              )}
            </>
          )}
        </div>

        {/* ── Meta Fields ── */}
        <div className="grid grid-cols-2 gap-3">
          <Field label="Status">
            <select value={form.status} onChange={(e) => set("status", e.target.value as SourceStatus)}
              className={INPUT_CLS}>
              <option value="not_started">Belum Dimulai</option>
              <option value="in_progress">Sedang Belajar</option>
              <option value="completed">Selesai</option>
              <option value="on_hold">Ditunda</option>
            </select>
          </Field>
          <Field label="Tingkat Kesulitan">
            <select value={form.difficultyLevel} onChange={(e) => set("difficultyLevel", e.target.value as DifficultyLevel)}
              className={INPUT_CLS}>
              <option value="beginner">Pemula</option>
              <option value="intermediate">Menengah</option>
              <option value="advanced">Lanjutan</option>
            </select>
          </Field>
        </div>

        {/* ── Topic Tags (TagPicker) ── */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
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

        {/* ── Reading Targets (optional) ── */}
        <div className="bg-gray-50 rounded-xl p-4 space-y-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            🎯 Target Belajar <span className="text-gray-400 font-normal normal-case">(opsional)</span>
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Field label={form.sourceType === "book" ? "Target Halaman/Hari" : "Target Menit/Hari"}>
              <input
                type="number"
                min="1"
                value={form.dailyPageTarget}
                onChange={(e) => set("dailyPageTarget", e.target.value)}
                placeholder={form.sourceType === "book" ? "20" : "30"}
                className={INPUT_CLS}
              />
            </Field>
            <Field label="Target Selesai">
              <input
                type="date"
                value={form.targetCompletionDate}
                onChange={(e) => set("targetCompletionDate", e.target.value)}
                className={INPUT_CLS}
              />
            </Field>
          </div>
        </div>

        {/* ── Skill Targets (TagPicker) ── */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            🎯 Skill yang Ingin Dipelajari
            <span className="text-rose-400 ml-0.5">*</span>
          </label>
          <TagPicker
            value={form.skillTargets}
            onChange={(tags) => set("skillTargets", tags)}
            groups={SKILL_GROUPS}
            placeholder="Cari skill dari daftar atau tambah kustom..."
            accentColor="violet"
            required
          />
          <p className="text-xs text-gray-400 mt-2">
            Action plan otomatis akan dibuat untuk setiap skill.
          </p>
        </div>

        {/* ── Error & Submit ── */}
        {error && (
          <p className="text-rose-500 text-sm bg-rose-50 px-4 py-2.5 rounded-lg border border-rose-100">
            ⚠️ {error}
          </p>
        )}

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-sky-600 to-violet-600 hover:from-sky-700 hover:to-violet-700 text-white font-semibold py-3 rounded-xl transition-all hover:shadow-md active:scale-[0.99]"
        >
          Simpan & Buat Action Plan →
        </button>
      </form>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const INPUT_CLS =
  "w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-sky-300 focus:border-transparent transition";

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-600 mb-1">
        {label}
        {required && <span className="text-rose-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}
