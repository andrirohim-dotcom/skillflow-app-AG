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
  accentColor?: "sky" | "indigo" | "violet" | "gray";
  /** Called when recording state changes */
  onListeningStateChange?: (isListening: boolean) => void;
}

export default function VoiceInputWidget({
  onInsert,
  accentColor = "sky",
  onListeningStateChange,
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

  const isListening = status === "listening";

  useEffect(() => {
    onListeningStateChange?.(isListening);
  }, [isListening, onListeningStateChange]);

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

  let ringCls = "";
  if (accentColor === "sky") {
    ringCls = "ring-sky-500/30 text-sky-400 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 shadow-[0_0_8px_rgba(56,189,248,0.2)]";
  } else if (accentColor === "indigo") {
    ringCls = "ring-indigo-500/30 text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 shadow-[0_0_8px_rgba(99,102,241,0.2)]";
  } else if (accentColor === "violet") {
    ringCls = "ring-violet-500/30 text-violet-400 bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/30 shadow-[0_0_8px_rgba(139,92,246,0.2)]";
  } else {
    ringCls = "ring-white/20 text-text-dim bg-white/5 hover:bg-white/10 border border-white/10";
  }

  const listeningCls = "bg-rose-500/20 text-rose-400 ring-rose-500/30 border border-rose-500/30 shadow-[0_0_8px_rgba(244,63,94,0.4)]";

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
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-text-mute">
        <MicIcon className="w-3.5 h-3.5 shrink-0" />
        <span>Voice input tidak didukung di browser ini. Gunakan Chrome atau Edge.</span>
      </div>
    );
  }

  // ── Permission denied ──
  if (status === "denied") {
    return (
      <div className="px-3 py-2.5 rounded-xl bg-rose-950/20 border border-rose-500/20 text-xs text-rose-400 space-y-1">
        <p className="font-semibold">🚫 Akses mikrofon ditolak</p>
        <p className="text-rose-500/80">{error}</p>
        <button
          type="button"
          onClick={clear}
          className="text-xs underline text-rose-400 hover:text-rose-350 cursor-pointer"
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
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border-2 ring-2 transition-all ${listeningCls} animate-pulse cursor-pointer`}
          >
            <StopIcon className="w-3.5 h-3.5" />
            Stop
          </button>
        ) : (
          <button
            type="button"
            onClick={start}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-transparent ring-2 ring-transparent transition-all hover:ring-2 cursor-pointer ${ringCls}`}
          >
            <MicIcon className="w-3.5 h-3.5" />
            Rekam
          </button>
        )}

        {/* Listening timer */}
        {status === "listening" && <ListeningTimer />}

        {/* Soundwave visualizer */}
        {status === "listening" && (
          <div className="flex items-end gap-[3px] h-3 px-1.5 self-center">
            <span className="w-[2px] h-full bg-rose-500/80 rounded-full animate-soundwave-bar" style={{ animationDelay: '0.1s' }} />
            <span className="w-[2px] h-full bg-rose-500 rounded-full animate-soundwave-bar" style={{ animationDelay: '0.3s' }} />
            <span className="w-[2px] h-full bg-rose-400 rounded-full animate-soundwave-bar" style={{ animationDelay: '0.5s' }} />
            <span className="w-[2px] h-full bg-rose-500 rounded-full animate-soundwave-bar" style={{ animationDelay: '0.2s' }} />
            <span className="w-[2px] h-full bg-rose-500/80 rounded-full animate-soundwave-bar" style={{ animationDelay: '0.4s' }} />
          </div>
        )}

        {/* Live interim transcript (faded) */}
        {status === "listening" && interimText && (
          <p className="text-xs text-text-mute italic truncate flex-1">{interimText}…</p>
        )}

        {/* Language toggle */}
        {status !== "listening" && (
          <button
            type="button"
            onClick={() => setLang(lang === "id-ID" ? "en-US" : "id-ID")}
            className="ml-auto text-xs text-text-mute hover:text-text px-2 py-1 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all shrink-0 cursor-pointer"
            title="Ganti bahasa transkripsi"
          >
            {lang === "id-ID" ? "🇮🇩 ID" : "🇺🇸 EN"}
          </button>
        )}
      </div>

      {/* ── Listening live display ── */}
      {status === "listening" && (finalText || interimText) && (
        <div className="bg-rose-950/20 border border-rose-500/25 rounded-xl px-3 py-2 text-sm leading-relaxed text-text">
          {finalText && <span className="text-text">{finalText} </span>}
          {interimText && <span className="text-text-mute italic">{interimText}</span>}
        </div>
      )}

      {/* ── Error message ── */}
      {error && status !== "listening" && (
        <p className="text-xs text-rose-400 bg-rose-950/20 border border-rose-500/20 rounded-lg px-3 py-2">
          ⚠️ {error}
        </p>
      )}

      {/* ── Post-recording panel ── */}
      {expanded && status !== "listening" && editableTranscript && (
        <div className="glass-soft border border-white/10 rounded-xl p-3 space-y-3 shadow-card-depth">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-text-mute uppercase tracking-wide">
              Hasil Transkripsi
            </p>
            <button
              type="button"
              onClick={handleClear}
              className="text-xs text-text-mute hover:text-text transition-colors cursor-pointer"
            >
              ✕ Hapus
            </button>
          </div>

          {/* Editable transcript */}
          <textarea
            value={editableTranscript}
            onChange={(e) => setEditableTranscript(e.target.value)}
            rows={4}
            className="w-full text-sm text-text bg-white/5 border border-white/10 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-sleek/50 focus:border-transparent leading-relaxed"
          />

          {/* Transform buttons */}
          <div className="flex flex-wrap gap-1.5">
            <p className="w-full text-xs text-text-mute mb-0.5">Ubah transcript:</p>
            <button
              type="button"
              onClick={() => applyTransform(ringkas)}
              className="text-xs px-2.5 py-1 rounded-lg border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20 transition-all cursor-pointer"
              title="Ambil poin utama, buang pengulangan"
            >
              ✂️ Ringkas jadi Insight
            </button>
            <button
              type="button"
              onClick={() => applyTransform(pisahkanJadiPoin)}
              className="text-xs px-2.5 py-1 rounded-lg border border-violet-500/30 bg-violet-500/10 text-violet-300 hover:bg-violet-500/20 transition-all cursor-pointer"
              title="Pecah menjadi poin-poin bernomor"
            >
              📋 Pisahkan jadi Poin
            </button>
            <button
              type="button"
              onClick={() => applyTransform(ubahJadiActionItem)}
              className="text-xs px-2.5 py-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 transition-all cursor-pointer"
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
              className="flex-1 bg-gradient-to-r from-indigo-sleek to-violet-sleek hover:from-indigo-sleek/90 hover:to-violet-sleek/90 text-white text-xs font-semibold py-2 rounded-xl transition-all shadow-glow-primary active:scale-95 border border-indigo-500/30 cursor-pointer"
            >
              ↩ Masukkan ke Teks
            </button>
            <button
              type="button"
              onClick={() => {
                // Keep existing transcript and start a new session to append more
                start();
              }}
              className="px-3 py-2 text-xs text-text-dim border border-white/10 rounded-xl hover:bg-white/5 transition-all cursor-pointer"
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
