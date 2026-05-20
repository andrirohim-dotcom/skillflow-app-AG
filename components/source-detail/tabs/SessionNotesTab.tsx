"use client";

import { useEffect, useState } from "react";
import { saveWsSession, updateWsSource } from "@/lib/storageV2";
import { useWorkspace } from "@/lib/contexts/WorkspaceContext";
import { MOOD_ICONS, MOOD_LABELS } from "@/lib/constants";
import type { LearningSource, LearningSession, MoodLevel } from "@/lib/types";
import { getSourceProgress } from "@/lib/utils/sourceProgress";
import VoiceInputWidget from "@/components/ui/VoiceInputWidget";

// ─── Notes Helpers ───────────────────────────────────────────────────────────

const formatBulletPoints = (text: string) => {
  return text
    .split("\n")
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => line.startsWith("-") || line.startsWith("*") || line.startsWith("•") ? line : `• ${line}`)
    .join("\n");
};

function compileNotes(insight: string, obstacle: string, nextStep: string, general: string): string {
  const parts: string[] = [];
  if (insight.trim()) {
    parts.push(`### 💡 Insight\n${formatBulletPoints(insight)}`);
  }
  if (obstacle.trim()) {
    parts.push(`### 🧱 Hambatan\n${formatBulletPoints(obstacle)}`);
  }
  if (nextStep.trim()) {
    parts.push(`### 🎯 Next Step\n${formatBulletPoints(nextStep)}`);
  }
  if (general.trim()) {
    parts.push(`### 📝 Catatan Lainnya\n${general.trim()}`);
  }
  return parts.join("\n\n");
}

function cleanBullets(text: string): string {
  return text
    .split("\n")
    .map(line => {
      const trimmed = line.trim();
      if (trimmed.startsWith("•") || trimmed.startsWith("-") || trimmed.startsWith("*")) {
        return trimmed.substring(1).trim();
      }
      return trimmed;
    })
    .join("\n");
}

interface ParsedNotes {
  insight: string;
  obstacle: string;
  nextStep: string;
  general: string;
}

function parseNotes(raw: string): ParsedNotes {
  const result: ParsedNotes = {
    insight: "",
    obstacle: "",
    nextStep: "",
    general: ""
  };
  
  if (!raw) return result;
  
  const sections = raw.split(/###\s+/);
  let hasFoundSection = false;
  
  sections.forEach(sec => {
    const lines = sec.split("\n");
    const header = lines[0].trim().toLowerCase();
    const content = lines.slice(1).join("\n").trim();
    
    if (header.includes("insight")) {
      result.insight = cleanBullets(content);
      hasFoundSection = true;
    } else if (header.includes("hambatan")) {
      result.obstacle = cleanBullets(content);
      hasFoundSection = true;
    } else if (header.includes("next step") || header.includes("langkah")) {
      result.nextStep = cleanBullets(content);
      hasFoundSection = true;
    } else if (header.includes("catatan") || header.includes("lainnya")) {
      result.general = content;
      hasFoundSection = true;
    }
  });
  
  if (!hasFoundSection) {
    result.general = raw.trim();
  }
  
  return result;
}

// ─── Add Session Form ─────────────────────────────────────────────────────────

interface AddSessionFormProps {
  source: LearningSource;
  sessions: LearningSession[];
  onSaved: () => void;
  onCancel: () => void;
  initialDuration?: number;
}

function AddSessionForm({ source, sessions, onSaved, onCancel, initialDuration }: AddSessionFormProps) {
  const { currentUser: user, currentWorkspace: workspace } = useWorkspace();
  const stats = getSourceProgress(source);
  const today = new Date().toISOString().slice(0, 10);

  // Bug #2: auto-fill start progress from the highest endProgress in past sessions
  const maxEndFromSessions = sessions.reduce(
    (max, s) => Math.max(max, s.endProgress ?? 0), 0
  );
  const initialProgress = Math.max(maxEndFromSessions, stats.consumed);

  const [date, setDate] = useState(today);
  const [duration, setDuration] = useState(initialDuration || 45);
  const [startProg, setStartProg] = useState(String(initialProgress));
  const [endProg, setEndProg] = useState(String(initialProgress));
  
  // Structured Editor States
  const [notesMode, setNotesMode] = useState<"structured" | "raw">("structured");
  const [insightText, setInsightText] = useState("");
  const [obstacleText, setObstacleText] = useState("");
  const [nextStepText, setNextStepText] = useState("");
  const [generalNotes, setGeneralNotes] = useState("");
  
  const [notes, setNotes] = useState(""); // Raw/Fallback notes state
  const [copied, setCopied] = useState(false);
  const [voiceTarget, setVoiceTarget] = useState<"insight" | "obstacle" | "nextStep" | "general">("insight");
  
  const [mood, setMood] = useState<MoodLevel>("good");
  const [focus, setFocus] = useState<number>(3);
  const [productivity, setProductivity] = useState<number>(3);
  const [error, setError] = useState("");

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Gagal menyalin teks:", err);
    }
  };



  const handleCancel = () => {
    onCancel();
  };

  const moods: MoodLevel[] = ["great", "good", "okay", "tired", "distracted"];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!duration || Number(duration) < 1) {
      setError("Durasi harus diisi dan lebih dari 0 menit.");
      return;
    }
    setError("");
    if (!user || !workspace) return;

    const end = Number(endProg) || 0;
    const start = Number(startProg) || 0;
    const consumed = Math.max(0, end - start);

    const finalNotes = notesMode === "structured"
      ? compileNotes(insightText, obstacleText, nextStepText, generalNotes)
      : notes;

    const session: LearningSession = {
      id: crypto.randomUUID(),
      sourceId: source.id,
      workspaceId: workspace.id,
      userId: user.id,
      date,
      durationMinutes: Number(duration),
      unitsConsumed: consumed,
      startProgress: start,
      endProgress: end,
      notes: finalNotes.trim() || undefined,
      mood,
      focusRating: focus,
      productivityRating: productivity,
      createdAt: new Date().toISOString(),
    };

    await saveWsSession(workspace.id, user.id, session);

    // Auto-update source progress if end > current
    const p = source.progress;
    if (p.type === "book" && end > p.currentPage) {
      await updateWsSource(workspace.id, { ...source, progress: { ...p, currentPage: end }, updatedAt: new Date().toISOString() });
    } else if (p.type === "youtube" && end > p.watchedMinutes) {
      await updateWsSource(workspace.id, { ...source, progress: { ...p, watchedMinutes: end }, updatedAt: new Date().toISOString() });
    } else if (p.type === "article" && end > p.consumedMinutes) {
      await updateWsSource(workspace.id, { ...source, progress: { ...p, consumedMinutes: end }, updatedAt: new Date().toISOString() });
    } else if (p.type === "podcast" && end > p.listenedMinutes) {
      await updateWsSource(workspace.id, { ...source, progress: { ...p, listenedMinutes: end }, updatedAt: new Date().toISOString() });
    } else if (p.type === "course" && p.completedModules !== undefined && end > p.completedModules) {
      await updateWsSource(workspace.id, { ...source, progress: { ...p, completedModules: end }, updatedAt: new Date().toISOString() });
    }


    onSaved();
  }

  const unitLabel = stats.unitLabel;

  return (
    <form onSubmit={handleSubmit} className="bg-sky-50 border border-sky-100 rounded-2xl p-5 space-y-4">
      <h3 className="text-sm font-bold text-gray-800">Catat Sesi Baru</h3>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={LABEL_CLS}>Tanggal</label>
          <input type="date" value={date} max={today}
            onChange={(e) => setDate(e.target.value)} className={INPUT_CLS} />
        </div>
        <div>
          <label className={LABEL_CLS}>Durasi (menit) *</label>
          <div className="flex gap-2">
            <input type="number" min="1" value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className={`${INPUT_CLS} flex-1`} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={LABEL_CLS}>Mulai dari ({unitLabel})</label>
          <input type="number" min="0" value={startProg}
            onChange={(e) => setStartProg(e.target.value)} className={INPUT_CLS} />
        </div>
        <div>
          <label className={LABEL_CLS}>Selesai di ({unitLabel})</label>
          <input type="number" min="0" value={endProg}
            onChange={(e) => setEndProg(e.target.value)} className={INPUT_CLS} />
        </div>
      </div>

      {/* Mood selector */}
      <div>
        <label className={LABEL_CLS}>Mood</label>
        <div className="flex gap-2 flex-wrap">
          {moods.map((m) => (
            <button key={m} type="button" onClick={() => setMood(m)}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all ${
                mood === m
                  ? "bg-sky-600 text-white border-sky-600"
                  : "bg-white text-gray-600 border-gray-200 hover:border-sky-200"
              }`}
            >
              <span>{MOOD_ICONS[m]}</span>
              {MOOD_LABELS[m]}
            </button>
          ))}
        </div>
      </div>

      {/* Ratings */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={LABEL_CLS}>Fokus</label>
          <RatingPicker value={focus} onChange={setFocus} />
        </div>
        <div>
          <label className={LABEL_CLS}>Produktivitas</label>
          <RatingPicker value={productivity} onChange={setProductivity} />
        </div>
      </div>

      {/* Notes Section with Premium Switchable Editor */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <label className={LABEL_CLS}>Catatan Sesi</label>
          <div className="flex bg-gray-200/60 rounded-xl p-0.5 border border-gray-200">
            <button
              type="button"
              onClick={() => {
                if (notesMode === "raw") {
                  const parsed = parseNotes(notes);
                  setInsightText(parsed.insight);
                  setObstacleText(parsed.obstacle);
                  setNextStepText(parsed.nextStep);
                  setGeneralNotes(parsed.general);
                }
                setNotesMode("structured");
              }}
              className={`text-[10px] font-bold px-2.5 py-1 rounded-lg transition-all ${
                notesMode === "structured"
                  ? "bg-white text-sky-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              📊 Terstruktur
            </button>
            <button
              type="button"
              onClick={() => {
                if (notesMode === "structured") {
                  setNotes(compileNotes(insightText, obstacleText, nextStepText, generalNotes));
                }
                setNotesMode("raw");
              }}
              className={`text-[10px] font-bold px-2.5 py-1 rounded-lg transition-all ${
                notesMode === "raw"
                  ? "bg-white text-sky-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              📝 Raw Text
            </button>
          </div>
        </div>

        {notesMode === "structured" ? (
          <div className="grid gap-3">
            {/* Insight Card */}
            <div className="bg-white border-2 border-amber-100 hover:border-amber-200 rounded-2xl p-3.5 shadow-sm transition-all focus-within:ring-2 focus-within:ring-amber-300 focus-within:border-transparent">
              <p className="text-[10px] font-black text-amber-800 uppercase tracking-widest mb-1.5">💡 Insight Utama</p>
              <textarea
                value={insightText}
                onChange={(e) => setInsightText(e.target.value)}
                rows={2}
                placeholder="Apa hal menarik atau pemahaman baru yang kamu dapatkan?"
                className="w-full text-xs text-gray-700 bg-transparent resize-none border-none outline-none focus:ring-0 p-0 font-medium placeholder-gray-400"
              />
            </div>

            {/* Obstacle Card */}
            <div className="bg-white border-2 border-rose-100 hover:border-rose-200 rounded-2xl p-3.5 shadow-sm transition-all focus-within:ring-2 focus-within:ring-rose-300 focus-within:border-transparent">
              <p className="text-[10px] font-black text-rose-800 uppercase tracking-widest mb-1.5">🧱 Hambatan / Tantangan</p>
              <textarea
                value={obstacleText}
                onChange={(e) => setObstacleText(e.target.value)}
                rows={2}
                placeholder="Apakah ada materi yang sulit dipahami atau kendala belajar?"
                className="w-full text-xs text-gray-700 bg-transparent resize-none border-none outline-none focus:ring-0 p-0 font-medium placeholder-gray-400"
              />
            </div>

            {/* Next Step Card */}
            <div className="bg-white border-2 border-emerald-100 hover:border-emerald-200 rounded-2xl p-3.5 shadow-sm transition-all focus-within:ring-2 focus-within:ring-emerald-300 focus-within:border-transparent">
              <p className="text-[10px] font-black text-emerald-800 uppercase tracking-widest mb-1.5">🎯 Langkah Berikutnya</p>
              <textarea
                value={nextStepText}
                onChange={(e) => setNextStepText(e.target.value)}
                rows={2}
                placeholder="Apa tindakan konkret yang akan kamu lakukan berikutnya?"
                className="w-full text-xs text-gray-700 bg-transparent resize-none border-none outline-none focus:ring-0 p-0 font-medium placeholder-gray-400"
              />
            </div>

            {/* General Notes Card */}
            <div className="bg-white border-2 border-slate-100 hover:border-slate-200 rounded-2xl p-3.5 shadow-sm transition-all focus-within:ring-2 focus-within:ring-slate-300 focus-within:border-transparent">
              <p className="text-[10px] font-black text-slate-800 uppercase tracking-widest mb-1.5">📝 Catatan Lainnya</p>
              <textarea
                value={generalNotes}
                onChange={(e) => setGeneralNotes(e.target.value)}
                rows={2}
                placeholder="Catatan bebas atau kutipan penting dari sesi belajar..."
                className="w-full text-xs text-gray-700 bg-transparent resize-none border-none outline-none focus:ring-0 p-0 font-medium placeholder-gray-400"
              />
            </div>
          </div>
        ) : (
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={5}
            placeholder="Apa yang kamu pelajari hari ini? Hambatan? Hal menarik?"
            className={`${INPUT_CLS} resize-none font-medium leading-relaxed p-3.5`}
          />
        )}

        {/* Voice Input Integration */}
        <div className="space-y-2 mt-2 pt-2 border-t border-gray-100">
          {notesMode === "structured" && (
            <div className="flex items-center gap-2 p-2 bg-sky-50/50 border border-sky-100 rounded-xl">
              <span className="text-[10px] font-bold text-sky-700 uppercase tracking-wider shrink-0">🎯 Target Suara:</span>
              <div className="flex gap-1 flex-wrap">
                {[
                  { label: "💡 Insight", value: "insight" as const },
                  { label: "🧱 Hambatan", value: "obstacle" as const },
                  { label: "🎯 Next Step", value: "nextStep" as const },
                  { label: "📝 Catatan", value: "general" as const },
                ].map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setVoiceTarget(t.value)}
                    className={`text-[9px] font-semibold px-2 py-0.5 rounded-lg border transition-all ${
                      voiceTarget === t.value
                        ? "bg-sky-600 text-white border-sky-600 shadow-sm"
                        : "bg-white text-gray-500 border-gray-200 hover:border-sky-300"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between gap-3">
            <VoiceInputWidget
              onInsert={(text) => {
                if (notesMode === "raw") {
                  setNotes((prev) => {
                    const sep = prev.trim() && !prev.endsWith("\n") ? "\n" : "";
                    return prev + sep + text;
                  });
                } else {
                  if (voiceTarget === "insight") {
                    setInsightText((prev) => {
                      const sep = prev.trim() && !prev.endsWith("\n") ? "\n" : "";
                      return prev + sep + text;
                    });
                  } else if (voiceTarget === "obstacle") {
                    setObstacleText((prev) => {
                      const sep = prev.trim() && !prev.endsWith("\n") ? "\n" : "";
                      return prev + sep + text;
                    });
                  } else if (voiceTarget === "nextStep") {
                    setNextStepText((prev) => {
                      const sep = prev.trim() && !prev.endsWith("\n") ? "\n" : "";
                      return prev + sep + text;
                    });
                  } else if (voiceTarget === "general") {
                    setGeneralNotes((prev) => {
                      const sep = prev.trim() && !prev.endsWith("\n") ? "\n" : "";
                      return prev + sep + text;
                    });
                  }
                }
              }}
              accentColor="sky"
            />

            {/* Quick Copy Action */}
            <button
              type="button"
              onClick={() => {
                const textToCopy = notesMode === "structured"
                  ? compileNotes(insightText, obstacleText, nextStepText, generalNotes)
                  : notes;
                handleCopy(textToCopy);
              }}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border border-gray-200 bg-white hover:border-gray-300 text-gray-600 hover:text-gray-800 transition-all active:scale-95 shadow-sm"
            >
              {copied ? (
                <>
                  <span className="text-emerald-500">✓</span>
                  <span className="text-emerald-600">Tersalin!</span>
                </>
              ) : (
                <>
                  <span>📋</span>
                  <span>Salin Catatan</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <p className="text-rose-500 text-xs bg-rose-50 px-3 py-2 rounded-lg border border-rose-100">
          ⚠️ {error}
        </p>
      )}

      <div className="flex gap-2">
        <button type="submit"
          className="flex-1 bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors">
          Simpan Sesi
        </button>
        <button type="button" onClick={handleCancel}
          className="px-4 py-2.5 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-xl transition-colors">
          Batal
        </button>
      </div>
    </form>
  );
}

function RatingPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" onClick={() => onChange(n)}
          className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
            n <= value ? "bg-sky-500 text-white" : "bg-gray-100 text-gray-400 hover:bg-gray-200"
          }`}>
          {n}
        </button>
      ))}
    </div>
  );
}

// ─── Session Card ─────────────────────────────────────────────────────────────

function SessionCard({ session }: { session: LearningSession }) {
  const date = new Date(session.date).toLocaleDateString("id-ID", {
    weekday: "short", day: "numeric", month: "short", year: "numeric",
  });

  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!session.notes) return;
    try {
      await navigator.clipboard.writeText(session.notes);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Gagal menyalin catatan:", err);
    }
  };

  const parsed = parseNotes(session.notes || "");
  const hasStructuredNotes = !!(parsed.insight || parsed.obstacle || parsed.nextStep);

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all">
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <p className="text-xs text-gray-400 font-medium">{date}</p>
          <p className="text-base font-bold text-gray-900 mt-0.5">
            {session.durationMinutes} menit belajar
          </p>
        </div>
        <div className="flex items-center gap-2">
          {session.notes && (
            <button
              type="button"
              onClick={handleCopy}
              className={`p-1.5 rounded-lg border border-gray-100 text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all active:scale-95`}
              title="Salin catatan sesi ini"
            >
              {copied ? (
                <span className="text-[10px] font-bold text-emerald-500 px-1">Tersalin!</span>
              ) : (
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
              )}
            </button>
          )}
          {session.mood && (
            <span title={MOOD_LABELS[session.mood]} className="text-xl">
              {MOOD_ICONS[session.mood]}
            </span>
          )}
          {session.startProgress !== undefined && session.endProgress !== undefined && (
            <span className="text-xs bg-sky-50 text-sky-600 font-medium px-2 py-1 rounded-lg">
              +{session.endProgress - session.startProgress} unit
            </span>
          )}
        </div>
      </div>

      {/* Ratings */}
      {(session.focusRating || session.productivityRating) && (
        <div className="flex gap-4 mb-3">
          {session.focusRating !== undefined && session.focusRating !== null && (
            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-400">Fokus:</span>
              <span className="text-xs font-semibold text-gray-700">
                {"●".repeat(Math.max(0, Math.min(5, session.focusRating)))}
                {"○".repeat(Math.max(0, 5 - Math.min(5, session.focusRating)))}
              </span>
            </div>
          )}
          {session.productivityRating !== undefined && session.productivityRating !== null && (
            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-400">Produktif:</span>
              <span className="text-xs font-semibold text-gray-700">
                {"●".repeat(Math.max(0, Math.min(5, session.productivityRating)))}
                {"○".repeat(Math.max(0, 5 - Math.min(5, session.productivityRating)))}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Notes Section with Premium Rendering */}
      {session.notes && (
        <div className="space-y-2.5 mt-3 pt-3 border-t border-gray-50">
          {hasStructuredNotes ? (
            <div className="grid gap-2">
              {parsed.insight && (
                <div className="bg-amber-50/40 border-l-4 border-amber-400 rounded-r-2xl p-2.5 transition-all hover:bg-amber-50/70">
                  <p className="text-[10px] font-black text-amber-800 uppercase tracking-widest mb-1">💡 Insight</p>
                  <div className="text-xs text-gray-700 font-medium leading-relaxed whitespace-pre-line">
                    {parsed.insight}
                  </div>
                </div>
              )}
              {parsed.obstacle && (
                <div className="bg-rose-50/40 border-l-4 border-rose-400 rounded-r-2xl p-2.5 transition-all hover:bg-rose-50/70">
                  <p className="text-[10px] font-black text-rose-800 uppercase tracking-widest mb-1">🧱 Hambatan</p>
                  <div className="text-xs text-gray-700 font-medium leading-relaxed whitespace-pre-line">
                    {parsed.obstacle}
                  </div>
                </div>
              )}
              {parsed.nextStep && (
                <div className="bg-emerald-50/40 border-l-4 border-emerald-400 rounded-r-2xl p-2.5 transition-all hover:bg-emerald-50/70">
                  <p className="text-[10px] font-black text-emerald-800 uppercase tracking-widest mb-1">🎯 Next Step</p>
                  <div className="text-xs text-gray-700 font-medium leading-relaxed whitespace-pre-line">
                    {parsed.nextStep}
                  </div>
                </div>
              )}
              {parsed.general && (
                <div className="bg-slate-50/40 border-l-4 border-slate-400 rounded-r-2xl p-2.5 transition-all hover:bg-slate-50/70">
                  <p className="text-[10px] font-black text-slate-800 uppercase tracking-widest mb-1">📝 Catatan Lainnya</p>
                  <div className="text-xs text-gray-700 font-medium leading-relaxed whitespace-pre-line">
                    {parsed.general}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-gray-600 leading-relaxed bg-gray-50 rounded-xl px-3 py-2.5 whitespace-pre-line font-medium">
              {session.notes}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Tab ─────────────────────────────────────────────────────────────────

interface Props {
  source: LearningSource;
  sessions: LearningSession[];
  onRefresh: () => void;
  onSwitchTab?: (tab: "sessions" | "insights" | "tasks" | "skills" | "history") => void;
  initialDuration?: number;
}

export default function SessionNotesTab({ source, sessions, onRefresh, onSwitchTab, initialDuration }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [showNextStep, setShowNextStep] = useState(false);

  useEffect(() => {
    if (initialDuration) {
      setShowForm(true);
      setShowNextStep(false);
    }
  }, [initialDuration]);

  const totalMinutes = sessions.reduce((sum, s) => sum + s.durationMinutes, 0);
  const totalSessions = sessions.length;

  return (
    <div className="space-y-4">
      {/* Summary bar */}
      {totalSessions > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Total Sesi", value: totalSessions },
            { label: "Total Menit", value: totalMinutes },
            { label: "Rata-rata / Sesi", value: `${Math.round(totalMinutes / totalSessions)}m` },
          ].map((s) => (
            <div key={s.label} className="bg-white border border-gray-100 rounded-xl p-3 text-center shadow-sm">
              <div className="text-xl font-extrabold text-gray-900">{s.value}</div>
              <div className="text-xs text-gray-400 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Add session toggle */}
      {!showForm ? (
        <button onClick={() => { setShowForm(true); setShowNextStep(false); }}
          className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-gray-200 hover:border-sky-300 text-gray-400 hover:text-sky-600 text-sm font-medium py-3 rounded-2xl transition-all">
          + Catat Sesi Belajar Baru
        </button>
      ) : (
        <AddSessionForm
          source={source}
          sessions={sessions}
          onSaved={() => { setShowForm(false); setShowNextStep(true); onRefresh(); }}
          onCancel={() => setShowForm(false)}
          initialDuration={initialDuration}
        />
      )}

      {/* Next-step card — appears after session save */}
      {showNextStep && !showForm && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 relative">
          <button
            onClick={() => setShowNextStep(false)}
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-sm"
            aria-label="Tutup"
          >
            ✕
          </button>
          <p className="text-sm font-bold text-emerald-800 mb-0.5">✅ Sesi tersimpan!</p>
          <p className="text-xs text-emerald-600 mb-3">Mau lanjut ke mana?</p>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => { setShowNextStep(false); onSwitchTab?.("insights"); }}
              className="text-xs font-semibold bg-white border border-emerald-200 text-emerald-700 hover:bg-emerald-100 px-3 py-2 rounded-xl transition-colors"
            >
              💡 Tambah Insight
            </button>
            <button
              onClick={() => { setShowNextStep(false); onSwitchTab?.("tasks"); }}
              className="text-xs font-semibold bg-white border border-emerald-200 text-emerald-700 hover:bg-emerald-100 px-3 py-2 rounded-xl transition-colors"
            >
              ✔ Cek Action Items
            </button>
          </div>
        </div>
      )}

      {/* Session list */}
      {sessions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center bg-white border border-gray-100 rounded-2xl">
          <span className="text-4xl mb-3">📝</span>
          <p className="text-sm font-medium text-gray-500">Belum ada sesi tercatat</p>
          <p className="text-xs text-gray-400 mt-1">Klik tombol di atas untuk mulai mencatat.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((s) => <SessionCard key={s.id} session={s} />)}
        </div>
      )}
    </div>
  );
}

// ─── Shared styles ────────────────────────────────────────────────────────────

const INPUT_CLS = "w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-sky-300 focus:border-transparent transition";
const LABEL_CLS = "block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5";
