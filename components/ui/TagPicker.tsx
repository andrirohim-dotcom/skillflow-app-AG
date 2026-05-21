"use client";

import { useEffect, useRef, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TagGroup {
  groupKey: string;
  groupLabel: string;
  groupEmoji: string;
  options: string[];
}

interface TagPickerProps {
  value: string[];
  onChange: (tags: string[]) => void;
  groups: TagGroup[];
  placeholder?: string;
  accentColor?: "sky" | "violet" | "rose";
  required?: boolean;
  id?: string;
  maxTags?: number;
}

// ─── Accent Color Maps ────────────────────────────────────────────────────────

const ACCENT = {
  sky: {
    ring: "ring-indigo-500/20",
    chip: "bg-sky-500/20 text-sky-300 border border-sky-500/30 hover:bg-sky-500/30",
    checkmark: "text-indigo-400",
    hover: "hover:bg-white/5 hover:text-text",
    custom: "text-indigo-400 hover:bg-white/5",
  },
  violet: {
    ring: "ring-indigo-500/20",
    chip: "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/30",
    checkmark: "text-indigo-400",
    hover: "hover:bg-white/5 hover:text-text",
    custom: "text-indigo-400 hover:bg-white/5",
  },
  rose: {
    ring: "ring-rose-500/20",
    chip: "bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30",
    checkmark: "text-rose-400",
    hover: "hover:bg-white/5 hover:text-text",
    custom: "text-rose-400 hover:bg-white/5",
  },
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function TagPicker({
  value,
  onChange,
  groups,
  placeholder = "Cari atau tambah kustom...",
  accentColor = "sky",
  required,
  id,
  maxTags,
}: TagPickerProps) {
  const [searchText, setSearchText] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const ac = ACCENT[accentColor];

  // ─── Click-outside detection ───────────────────────────────────────────────

  useEffect(() => {
    if (!isOpen) return;
    function handleMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearchText("");
      }
    }
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [isOpen]);

  // ─── Helpers ──────────────────────────────────────────────────────────────

  function addTag(tag: string) {
    const trimmed = tag.trim();
    if (!trimmed || value.includes(trimmed)) return;
    if (maxTags !== undefined && value.length >= maxTags) return;
    onChange([...value, trimmed]);
    setSearchText("");
    inputRef.current?.focus();
  }

  function removeTag(tag: string) {
    onChange(value.filter((t) => t !== tag));
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && searchText === "" && value.length > 0) {
      removeTag(value[value.length - 1]);
      return;
    }
    if (e.key === "Escape") {
      e.stopPropagation(); // Prevent bubbling to Modal
      setIsOpen(false);
      setSearchText("");
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      // If exactly one visible option, add it; otherwise add custom
      const allVisible = filteredGroups.flatMap((g) => g.options);
      if (allVisible.length === 1) {
        addTag(allVisible[0]);
      } else if (searchText.trim() && showCustomOption) {
        addTag(searchText.trim());
      }
    }
  }

  // ─── Filtering ────────────────────────────────────────────────────────────

  const searchLower = searchText.toLowerCase();

  const filteredGroups = groups.map((g) => ({
    ...g,
    options: searchText
      ? g.options.filter((opt) => opt.toLowerCase().includes(searchLower))
      : g.options,
  }));

  const allOptionsFlat = groups.flatMap((g) => g.options);
  const showCustomOption =
    searchText.trim().length > 0 &&
    !value.includes(searchText.trim()) &&
    !allOptionsFlat.some((o) => o.toLowerCase() === searchLower);

  const hasAnyResults =
    filteredGroups.some((g) => g.options.length > 0) || showCustomOption;

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="relative" ref={containerRef}>
      {/* Chip container / trigger */}
      <div
        id={id}
        onClick={() => {
          setIsOpen(true);
          inputRef.current?.focus();
        }}
        className={`border rounded-xl px-3 py-2 min-h-[44px] flex flex-wrap gap-1.5 items-center cursor-text bg-surface/50 transition-all duration-200 ${
          isOpen
            ? `ring-2 ${ac.ring} border-indigo-500/30 bg-surface`
            : "border-line hover:border-indigo-500/30"
        }`}
      >
        {/* Selected chips */}
        {value.map((tag) => (
          <span
            key={tag}
            className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-lg transition-colors ${ac.chip}`}
          >
            {tag}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeTag(tag);
              }}
              className="leading-none hover:opacity-70 transition-opacity cursor-pointer"
              aria-label={`Hapus ${tag}`}
            >
              ×
            </button>
          </span>
        ))}

        {/* Search input */}
        <input
          ref={inputRef}
          type="text"
          value={searchText}
          onChange={(e) => {
            setSearchText(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={value.length === 0 ? placeholder : ""}
          required={required && value.length === 0}
          className="flex-1 min-w-[120px] outline-none text-sm bg-transparent placeholder-text-mute text-text"
        />
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-surface border border-line rounded-xl shadow-2xl z-50 max-h-64 overflow-y-auto backdrop-blur-md">
          {filteredGroups.map(
            (group) =>
              group.options.length > 0 && (
                <div key={group.groupKey}>
                  {/* Group header */}
                  <div className="px-3 py-1.5 text-xs font-semibold text-text-mute uppercase tracking-wide bg-surface border-b border-line sticky top-0">
                    {group.groupEmoji} {group.groupLabel}
                  </div>
                  {/* Group options */}
                  {group.options.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => addTag(opt)}
                      className={`w-full px-3 py-2 text-sm text-left text-text-dim flex items-center justify-between transition-colors cursor-pointer ${ac.hover}`}
                    >
                      <span>{opt}</span>
                      {value.includes(opt) && (
                        <span className={`text-xs font-bold ${ac.checkmark}`}>✓</span>
                      )}
                    </button>
                  ))}
                </div>
              )
          )}

          {/* Custom add option */}
          {showCustomOption && (
            <button
              type="button"
              onClick={() => addTag(searchText.trim())}
              className={`w-full px-3 py-2 text-sm text-left font-medium transition-colors border-t border-line cursor-pointer ${ac.custom}`}
            >
              + Tambahkan &ldquo;{searchText.trim()}&rdquo;
            </button>
          )}

          {/* Empty state */}
          {!hasAnyResults && (
            <p className="px-3 py-4 text-xs text-text-mute text-center">
              Tidak ada hasil. Tekan Enter untuk menambahkan.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
