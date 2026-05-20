"use client";

import { useEffect, useMemo, useState } from "react";
import { getMasterSources } from "@/lib/db/masterSources";
import {
  SOURCE_TYPE_ICONS,
  SOURCE_TYPE_LABELS,
} from "@/lib/constants";
import type { MasterSource, SourceType, SourcePrefill } from "@/lib/types";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props {
  onSelect: (prefill: SourcePrefill) => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

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

const ALL_SKILLS = [
  "Leadership", "Team Management", "Strategic Planning", "Decision Making",
  "Effective Communication", "Persuasive Communication", "Business Model Design",
  "Entrepreneurship", "Time Management", "Deep Focus", "Priority Management",
  "Task Management", "Energy Management", "Productive Habits", "Growth Mindset",
  "Behavioral Psychology", "Resilience", "Stoicism", "Investment",
  "Personal Finance Planning", "Financial Literacy", "Wealth Mindset",
  "Software Engineering", "Clean Code", "System Architecture", "Problem Solving",
  "Innovation", "Creativity", "Optimal Health", "Conflict Management",
  "Motivation & Engagement", "Strategy Execution",
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function CatalogPicker({ onSelect }: Props) {
  const [sources, setSources] = useState<MasterSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<SourceType | "all">("all");
  const [skillFilter, setSkillFilter] = useState<string>("all");
  const [langFilter, setLangFilter] = useState<"id" | "en" | "all">("all");

  useEffect(() => {
    let active = true;
    const timeout = setTimeout(() => {
      if (loading && active) {
        setError("Koneksi lambat, silakan coba lagi.");
        setLoading(false);
      }
    }, 10000); // 10s timeout

    getMasterSources({ limit: 300 })
      .then((data) => {
        if (active) {
          setSources(data);
          setError(null);
        }
      })
      .catch((err) => {
        console.error("CatalogPicker fetch error:", err);
        if (active) setError("Gagal memuat katalog.");
      })
      .finally(() => {
        if (active) {
          setLoading(false);
          clearTimeout(timeout);
        }
      });

    return () => { active = false; clearTimeout(timeout); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = useMemo(() => {
    let r = sources;
    if (typeFilter !== "all") r = r.filter((s) => s.sourceType === typeFilter);
    if (langFilter !== "all") r = r.filter((s) => s.language === langFilter);
    if (skillFilter !== "all") r = r.filter((s) => s.skillTargets.includes(skillFilter));
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.creatorName.toLowerCase().includes(q)
      );
    }
    return r;
  }, [sources, typeFilter, langFilter, skillFilter, search]);

  function handleSelect(source: MasterSource) {
    const prefill: SourcePrefill = {
      sourceType: source.sourceType,
      title: source.title,
      creatorName: source.creatorName,
      url: source.url ?? "",
      topicTags: source.topicTags,
      skillTargets: source.skillTargets,
      difficultyLevel: source.difficultyLevel,
    };
    onSelect(prefill);
  }

  return (
    <div className="flex flex-col h-full">
      {/* Search + Filters */}
      <div className="p-4 space-y-3 border-b border-gray-100 bg-white sticky top-0 z-10">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="🔍 Cari judul atau penulis..."
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300 focus:border-transparent"
        />

        {/* Type filter */}
        <div className="flex flex-wrap gap-1.5">
          {(["all", "book", "youtube", "article", "podcast", "course"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t as SourceType | "all")}
              className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition-colors ${
                typeFilter === t
                  ? "bg-sky-600 text-white border-sky-600"
                  : "bg-white text-gray-500 border-gray-200 hover:border-sky-300 hover:text-sky-600"
              }`}
            >
              {t === "all" ? "Semua" : `${SOURCE_TYPE_ICONS[t as SourceType]} ${SOURCE_TYPE_LABELS[t as SourceType]}`}
            </button>
          ))}

          <div className="w-px bg-gray-200" />

          {/* Language filter */}
          {(["all", "id", "en"] as const).map((l) => (
            <button
              key={l}
              onClick={() => setLangFilter(l)}
              className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition-colors ${
                langFilter === l
                  ? "bg-violet-600 text-white border-violet-600"
                  : "bg-white text-gray-500 border-gray-200 hover:border-violet-300 hover:text-violet-600"
              }`}
            >
              {l === "all" ? "Semua Bahasa" : l === "id" ? "🇮🇩 ID" : "🇺🇸 EN"}
            </button>
          ))}
        </div>

        {/* Skill filter */}
        <div>
          <select
            value={skillFilter}
            onChange={(e) => setSkillFilter(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-transparent bg-white text-gray-600"
          >
            <option value="all">Semua Skill</option>
            {ALL_SKILLS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <p className={`text-xs ${error ? "text-rose-500 font-semibold" : "text-gray-400"}`}>
          {loading ? "Memuat katalog..." : error ? `⚠️ ${error}` : `${filtered.length} sumber ditemukan`}
        </p>
      </div>

      {/* Source list */}
      <div className="flex-1 overflow-y-auto max-h-[52vh] p-4 space-y-3">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 rounded-2xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="py-12 text-center text-gray-400">
            <p className="text-3xl mb-2">❌</p>
            <p className="text-sm font-semibold text-rose-500">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 text-xs font-bold text-sky-600 hover:underline"
            >
              Coba Lagi
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-gray-400">
            <p className="text-3xl mb-2">🔍</p>
            <p className="text-sm font-semibold">Tidak ada sumber yang cocok</p>
            <p className="text-xs mt-1">Coba ubah filter atau gunakan tab "Isi Manual"</p>
          </div>
        ) : (
          filtered.map((source) => (
            <div
              key={source.id}
              className="border border-gray-100 rounded-2xl p-4 hover:border-sky-200 hover:shadow-sm transition-all bg-white"
            >
              <div className="flex items-start gap-3">
                {/* Type icon */}
                <span className="text-2xl shrink-0 mt-0.5">
                  {SOURCE_TYPE_ICONS[source.sourceType]}
                </span>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-800 leading-tight line-clamp-1">
                        {source.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">{source.creatorName}</p>
                    </div>
                    <button
                      onClick={() => handleSelect(source)}
                      className="shrink-0 text-xs font-semibold px-3 py-1.5 rounded-xl bg-sky-600 text-white hover:bg-sky-700 transition-colors whitespace-nowrap"
                    >
                      + Tambahkan
                    </button>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${DIFFICULTY_COLORS[source.difficultyLevel]}`}>
                      {DIFFICULTY_LABELS[source.difficultyLevel]}
                    </span>
                    <span className="text-xs text-gray-400">
                      {source.language === "id" ? "🇮🇩" : "🇺🇸"}
                    </span>

                    {/* Skill chips (max 3) */}
                    {source.skillTargets.slice(0, 3).map((skill) => (
                      <span
                        key={skill}
                        className="text-xs px-2 py-0.5 rounded-md bg-violet-50 text-violet-600 border border-violet-100"
                      >
                        {skill}
                      </span>
                    ))}
                    {source.skillTargets.length > 3 && (
                      <span className="text-xs text-gray-400">
                        +{source.skillTargets.length - 3} skill
                      </span>
                    )}
                  </div>

                  {/* Description (if any) */}
                  {source.description && (
                    <p className="text-xs text-gray-400 mt-1.5 line-clamp-2">
                      {source.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
