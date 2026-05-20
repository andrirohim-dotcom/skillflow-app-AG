"use client";

import { useEffect, useState } from "react";
import { useVoiceInput } from "@/lib/hooks/useVoiceInput";

// ─── Text Transform Helpers ────────────────────────────────────────────────────

/**
 * Takes the first 1-2 sentences to produce a concise insight.
 */
function ringkas(text: string): string {
  const clean = text.trim();
  // Split on sentence-ending punctuation followed by space or end of string
  const sentences = clean.match(/[^.!?]+[.!?]+(\s|$)/g) ?? [];
  if (sentences.length === 0) return clean;
  // Keep max 2 sentences or 180 chars, whichever is shorter
  const twoSentences = sentences.slice(0, 2).join("").trim();
  if (twoSentences.length <= 180) return twoSentences;
  return twoSentences.slice(0, 177).trimEnd() + "...";
}

/**
 * Splits the text into numbered bullet points by sentence.
 */
function pisahkanJadiPoin(text: string): string {
  const clean = text.trim();
  const sentences = clean
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (sentences.length <= 1) return `1. ${clean}`;
  return sentences.map((s, i) => `${i + 1}. ${s}`).join("\n");
}

/**
 * Reformats text as imperative action items.
 * Prepends common action verb prefixes to each sentence.
 */
function ubahJadiActionItem(text: string): string {
  const clean = text.trim();
  const actionPrefixes = ["Pelajari", "Terapkan", "Catat", "Praktikkan", "Diskusikan"];
  const sentences = clean
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (sentences.length === 0) return `- Pelajari: ${clean}`;
  return sentences
    .map((s, i) => {
      const prefix = actionPrefixes[i % actionPrefixes.length];
      // If sentence already starts with a verb-like pattern, keep it
      const startsWithVerb = /^(pelajari|baca|catat|terapkan|buat|coba|identifikasi|analisis|diskusikan|praktikkan|ikuti)/i.test(s);
      return `- ${startsWithVerb ? s : `${prefix}: ${s.charAt(0).toLowerCase() + s.slice(1)}`}`;
    })
    .join("\n");
}

// ─── Listening Timer ───────────────────────────────────────────────────────────

function ListeningTimer() {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, []);
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return <span className="text-xs font-mono text-rose-500 tabular-nums">{m}:{s}</span>;
}

// ─── Mic Button ───────────────────────────────────────────────────────────────

function MicIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M12 2a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z" />
      <path d="M19 10a1 1 0 0 0-2 0 5 5 0 0 1-10 0 1 1 0 0 0-2 0 7 7 0 0 0 6 6.93V19H9a1 1 0 0 0 0 2h6a1 1 0 0 0 0-2h-2v-2.07A7 7 0 0 0 19 10z" />
    </svg>
  );
}

function StopIcon({ className = "" }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <rect x="6" y="6" width="12" height="12" rx="2" />
    </svg>
  );
}

// ─── Main Widget ──────────────────────────────────────────────────────────────

interface VoiceInputWidgetProps {
  /** Called when user clicks "Masukkan ke Teks" with the final transcript */
  onInsert: (text: string) => void;
  /** Optional accent color for the listening state ring (Tailwind class) */
  accentColor?: "sky" | "gray";
}

export default function VoiceInputWidget({
  onInsert,
  accentColor = "sky",
}: VoiceInputWidgetProps) {
  const {
    isSupported,
    status,
    interimText,
    finalText,
    error,
    lang,
    setLang,
    setFinalText,
    start,
    stop,
    clear,
  } = useVoiceInput();

  // Local editable copy of the transcript for display/editing
  const [editableTranscript, setEditableTranscript] = useState("");

  // Derived: show the panel when there's a transcript or we're actively listening
  const expanded = !!editableTranscript || status === "listening";

  // When recognition produces a new final result, sync to editable copy
  useEffect(() => {
    if (finalText) {
      setEditableTranscript(finalText);
    }
  }, [finalText]);

  const ringCls =
    accentColor === "sky"
      ? "ring-sky-400 text-sky-600 bg-sky-50 hover:bg-sky-100"
      : "ring-violet-400 text-violet-600 bg-violet-50 hover:bg-violet-100";

  const listeningCls = "bg-rose-500 text-white ring-rose-300";

  function handleInsert() {
    const text = editableTranscript.trim();
    if (!text) return;
    onInsert(text);
    clear();
    setEditableTranscript("");
  }

  function handleClear() {
    clear();
    setEditableTranscript("");
  }

  function applyTransform(fn: (t: string) => string) {
    const next = fn(editableTranscript);
    setEditableTranscript(next);
    // Keep finalText in sync so re-starts accumulate correctly
    setFinalText(next);
  }

  // ── Not supported banner ──
  if (!isSupported || status === "unsupported") {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-400">
        <MicIcon className="w-3.5 h-3.5 shrink-0" />
        <span>Voice input tidak didukung di browser ini. Gunakan Chrome atau Edge.</span>
      </div>
    );
  }

  // ── Permission denied ──
  if (status === "denied") {
    return (
      <div className="px-3 py-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-600 space-y-1">
        <p className="font-semibold">🚫 Akses mikrofon ditolak</p>
        <p className="text-rose-500">{error}</p>
        <button
          type="button"
          onClick={clear}
          className="text-xs underline text-rose-400 hover:text-rose-600"
        >
          Tutup
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* ── Trigger row ── */}
      <div className="flex items-center gap-2">
        {/* Mic button */}
        {status === "listening" ? (
          <button
            type="button"
            onClick={stop}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border-2 ring-2 transition-all ${listeningCls} animate-pulse`}
          >
            <StopIcon className="w-3.5 h-3.5" />
            Stop
          </button>
        ) : (
          <button
            type="button"
            onClick={start}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-transparent ring-2 ring-transparent transition-all hover:ring-2 ${ringCls}`}
          >
            <MicIcon className="w-3.5 h-3.5" />
            Rekam
          </button>
        )}

        {/* Listening timer */}
        {status === "listening" && <ListeningTimer />}

        {/* Live interim transcript (faded) */}
        {status === "listening" && interimText && (
          <p className="text-xs text-gray-400 italic truncate flex-1">{interimText}…</p>
        )}

        {/* Language toggle */}
        {status !== "listening" && (
          <button
            type="button"
            onClick={() => setLang(lang === "id-ID" ? "en-US" : "id-ID")}
            className="ml-auto text-xs text-gray-400 hover:text-gray-600 px-2 py-1 rounded-lg border border-gray-200 bg-white hover:border-gray-300 transition-all shrink-0"
            title="Ganti bahasa transkripsi"
          >
            {lang === "id-ID" ? "🇮🇩 ID" : "🇺🇸 EN"}
          </button>
        )}
      </div>

      {/* ── Listening live display ── */}
      {status === "listening" && (finalText || interimText) && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl px-3 py-2 text-sm leading-relaxed">
          {finalText && <span className="text-gray-800">{finalText} </span>}
          {interimText && <span className="text-gray-400 italic">{interimText}</span>}
        </div>
      )}

      {/* ── Error message ── */}
      {error && status !== "listening" && (
        <p className="text-xs text-rose-500 bg-rose-50 border border-rose-100 rounded-lg px-3 py-2">
          ⚠️ {error}
        </p>
      )}

      {/* ── Post-recording panel ── */}
      {expanded && status !== "listening" && editableTranscript && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Hasil Transkripsi
            </p>
            <button
              type="button"
              onClick={handleClear}
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✕ Hapus
            </button>
          </div>

          {/* Editable transcript */}
          <textarea
            value={editableTranscript}
            onChange={(e) => setEditableTranscript(e.target.value)}
            rows={4}
            className="w-full text-sm text-gray-800 bg-white border border-gray-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-sky-200 focus:border-sky-300 leading-relaxed"
          />

          {/* Transform buttons */}
          <div className="flex flex-wrap gap-1.5">
            <p className="w-full text-xs text-gray-400 mb-0.5">Ubah transcript:</p>
            <button
              type="button"
              onClick={() => applyTransform(ringkas)}
              className="text-xs px-2.5 py-1 rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
              title="Ambil poin utama, buang pengulangan"
            >
              ✂️ Ringkas jadi Insight
            </button>
            <button
              type="button"
              onClick={() => applyTransform(pisahkanJadiPoin)}
              className="text-xs px-2.5 py-1 rounded-lg border border-violet-200 bg-violet-50 text-violet-600 hover:bg-violet-100 transition-colors"
              title="Pecah menjadi poin-poin bernomor"
            >
              📋 Pisahkan jadi Poin
            </button>
            <button
              type="button"
              onClick={() => applyTransform(ubahJadiActionItem)}
              className="text-xs px-2.5 py-1 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
              title="Format ulang sebagai langkah aksi"
            >
              ✅ Ubah jadi Action Item
            </button>
          </div>

          {/* Insert + retry row */}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={handleInsert}
              className="flex-1 bg-gray-800 hover:bg-gray-900 text-white text-xs font-semibold py-2 rounded-xl transition-colors"
            >
              ↩ Masukkan ke Teks
            </button>
            <button
              type="button"
              onClick={() => {
                // Keep existing transcript and start a new session to append more
                start();
              }}
              className="px-3 py-2 text-xs text-gray-500 border border-gray-200 rounded-xl hover:bg-white transition-colors"
              title="Lanjutkan merekam dan append ke transcript"
            >
              + Rekam Lagi
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
