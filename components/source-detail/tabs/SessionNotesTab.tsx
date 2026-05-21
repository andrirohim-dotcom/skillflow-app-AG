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
    <form onSubmit={handleSubmit} className="glass border border-white/10 rounded-2xl p-5 space-y-4 shadow-card-depth">
      <h3 className="text-sm font-bold text-text">Catat Sesi Baru</h3>

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
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                mood === m
                  ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/50 shadow-glow-primary font-medium"
                  : "bg-white/5 text-text-mute border-white/10 hover:bg-white/10 hover:border-white/20"
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
          <div className="flex bg-white/5 rounded-xl p-0.5 border border-white/10">
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
              className={`text-[10px] font-bold px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                notesMode === "structured"
                  ? "bg-white/10 text-indigo-300 border border-white/10 shadow-glow-primary"
                  : "text-text-mute hover:text-text-dim"
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
              className={`text-[10px] font-bold px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                notesMode === "raw"
                  ? "bg-white/10 text-indigo-300 border border-white/10 shadow-glow-primary"
                  : "text-text-mute hover:text-text-dim"
              }`}
            >
              📝 Raw Text
            </button>
          </div>
        </div>

        {notesMode === "structured" ? (
          <div className="grid gap-3">
            {/* Insight Card */}
            <div className="bg-amber-500/5 border border-amber-500/25 hover:border-amber-500/40 rounded-2xl p-3.5 shadow-card-depth transition-all focus-within:ring-2 focus-within:ring-amber-500/30 focus-within:border-transparent">
              <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-1.5">💡 Insight Utama</p>
              <textarea
                value={insightText}
                onChange={(e) => setInsightText(e.target.value)}
                rows={2}
                placeholder="Apa hal menarik atau pemahaman baru yang kamu dapatkan?"
                className="w-full text-xs text-text bg-transparent resize-none border-none outline-none focus:ring-0 p-0 font-medium placeholder-amber-500/30"
              />
            </div>

            {/* Obstacle Card */}
            <div className="bg-rose-500/5 border border-rose-500/25 hover:border-rose-500/40 rounded-2xl p-3.5 shadow-card-depth transition-all focus-within:ring-2 focus-within:ring-rose-500/30 focus-within:border-transparent">
              <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-1.5">🧱 Hambatan / Tantangan</p>
              <textarea
                value={obstacleText}
                onChange={(e) => setObstacleText(e.target.value)}
                rows={2}
                placeholder="Apakah ada materi yang sulit dipahami atau kendala belajar?"
                className="w-full text-xs text-text bg-transparent resize-none border-none outline-none focus:ring-0 p-0 font-medium placeholder-rose-500/30"
              />
            </div>

            {/* Next Step Card */}
            <div className="bg-emerald-500/5 border border-emerald-500/25 hover:border-emerald-500/40 rounded-2xl p-3.5 shadow-card-depth transition-all focus-within:ring-2 focus-within:ring-emerald-500/30 focus-within:border-transparent">
              <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1.5">🎯 Langkah Berikutnya</p>
              <textarea
                value={nextStepText}
                onChange={(e) => setNextStepText(e.target.value)}
                rows={2}
                placeholder="Apa tindakan konkret yang akan kamu lakukan berikutnya?"
                className="w-full text-xs text-text bg-transparent resize-none border-none outline-none focus:ring-0 p-0 font-medium placeholder-emerald-500/30"
              />
            </div>

            {/* General Notes Card */}
            <div className="bg-white/5 border border-white/10 hover:border-white/20 rounded-2xl p-3.5 shadow-card-depth transition-all focus-within:ring-2 focus-within:ring-indigo-500/30 focus-within:border-transparent">
              <p className="text-[10px] font-black text-text-dim uppercase tracking-widest mb-1.5">📝 Catatan Lainnya</p>
              <textarea
                value={generalNotes}
                onChange={(e) => setGeneralNotes(e.target.value)}
                rows={2}
                placeholder="Catatan bebas atau kutipan penting dari sesi belajar..."
                className="w-full text-xs text-text bg-transparent resize-none border-none outline-none focus:ring-0 p-0 font-medium placeholder-text-mute"
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
        <div className="space-y-2 mt-2 pt-2 border-t border-white/5">
          {notesMode === "structured" && (
            <div className="flex items-center gap-2 p-2 bg-white/5 border border-white/10 rounded-xl">
              <span className="text-[10px] font-bold text-text-mute uppercase tracking-wider shrink-0">🎯 Target Suara:</span>
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
                    className={`text-[9px] font-semibold px-2 py-0.5 rounded-lg border transition-all cursor-pointer ${
                      voiceTarget === t.value
                        ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/50 shadow-glow-primary"
                        : "bg-white/5 text-text-mute border-white/10 hover:bg-white/10"
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
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-text hover:text-white transition-all active:scale-95 shadow-sm cursor-pointer"
            >
              {copied ? (
                <>
                  <span className="text-emerald-500">✓</span>
                  <span className="text-emerald-400">Tersalin!</span>
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
        <p className="text-rose-400 text-xs bg-rose-950/20 px-3 py-2 rounded-lg border border-rose-500/20">
          ⚠️ {error}
        </p>
      )}

      <div className="flex gap-2">
        <button type="submit"
          className="flex-1 bg-gradient-to-r from-indigo-sleek to-violet-sleek hover:from-indigo-sleek/90 hover:to-violet-sleek/90 text-white text-sm font-semibold py-2.5 rounded-xl transition-all shadow-glow-primary active:scale-95 border border-indigo-500/30 cursor-pointer">
          Simpan Sesi
        </button>
        <button type="button" onClick={handleCancel}
          className="px-4 py-2.5 text-sm text-text-dim hover:text-text border border-white/10 rounded-xl hover:bg-white/5 transition-all cursor-pointer">
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
          className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            n <= value
              ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/50 shadow-glow-primary"
              : "bg-white/5 text-text-mute border border-white/10 hover:bg-white/10 hover:text-text"
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
    <div className="glass-soft border border-white/10 rounded-2xl p-4 shadow-card-depth hover:border-white/20 transition-all">
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <p className="text-xs text-text-mute font-medium">{date}</p>
          <p className="text-base font-bold text-text mt-0.5">
            {session.durationMinutes} menit belajar
          </p>
        </div>
        <div className="flex items-center gap-2">
          {session.notes && (
            <button
              type="button"
              onClick={handleCopy}
              className={`p-1.5 rounded-lg border border-white/10 text-text-mute hover:text-text hover:bg-white/5 transition-all active:scale-95 cursor-pointer`}
              title="Salin catatan sesi ini"
            >
              {copied ? (
                <span className="text-[10px] font-bold text-emerald-400 px-1">Tersalin!</span>
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
            <span className="text-xs bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-medium px-2 py-1 rounded-lg">
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
              <span className="text-xs text-text-mute">Fokus:</span>
              <span className="text-xs font-semibold text-indigo-400">
                {"●".repeat(Math.max(0, Math.min(5, session.focusRating)))}
                <span className="text-white/10">{"○".repeat(Math.max(0, 5 - Math.min(5, session.focusRating)))}</span>
              </span>
            </div>
          )}
          {session.productivityRating !== undefined && session.productivityRating !== null && (
            <div className="flex items-center gap-1">
              <span className="text-xs text-text-mute">Produktif:</span>
              <span className="text-xs font-semibold text-indigo-400">
                {"●".repeat(Math.max(0, Math.min(5, session.productivityRating)))}
                <span className="text-white/10">{"○".repeat(Math.max(0, 5 - Math.min(5, session.productivityRating)))}</span>
              </span>
            </div>
          )}
        </div>
      )}

      {/* Notes Section with Premium Rendering */}
      {session.notes && (
        <div className="space-y-2.5 mt-3 pt-3 border-t border-white/5">
          {hasStructuredNotes ? (
            <div className="grid gap-2">
              {parsed.insight && (
                <div className="bg-amber-500/5 border-l-4 border-amber-500 rounded-r-2xl p-2.5 transition-all hover:bg-amber-500/10">
                  <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-1">💡 Insight</p>
                  <div className="text-xs text-text font-medium leading-relaxed whitespace-pre-line">
                    {parsed.insight}
                  </div>
                </div>
              )}
              {parsed.obstacle && (
                <div className="bg-rose-500/5 border-l-4 border-rose-500 rounded-r-2xl p-2.5 transition-all hover:bg-rose-500/10">
                  <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-1">🧱 Hambatan</p>
                  <div className="text-xs text-text font-medium leading-relaxed whitespace-pre-line">
                    {parsed.obstacle}
                  </div>
                </div>
              )}
              {parsed.nextStep && (
                <div className="bg-emerald-500/5 border-l-4 border-emerald-500 rounded-r-2xl p-2.5 transition-all hover:bg-emerald-500/10">
                  <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">🎯 Next Step</p>
                  <div className="text-xs text-text font-medium leading-relaxed whitespace-pre-line">
                    {parsed.nextStep}
                  </div>
                </div>
              )}
              {parsed.general && (
                <div className="bg-white/5 border-l-4 border-white/20 rounded-r-2xl p-2.5 transition-all hover:bg-white/10">
                  <p className="text-[10px] font-black text-text-dim uppercase tracking-widest mb-1">📝 Catatan Lainnya</p>
                  <div className="text-xs text-text font-medium leading-relaxed whitespace-pre-line">
                    {parsed.general}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-text-dim leading-relaxed bg-white/5 rounded-xl px-3 py-2.5 whitespace-pre-line font-medium border border-white/5">
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
            <div key={s.label} className="glass-soft border border-white/5 rounded-xl p-3 text-center shadow-card-depth">
              <div className="text-xl font-extrabold text-text">{s.value}</div>
              <div className="text-xs text-text-mute mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Add session toggle */}
      {!showForm ? (
        <button onClick={() => { setShowForm(true); setShowNextStep(false); }}
          className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-white/10 hover:border-indigo-500/35 hover:bg-white/5 text-text-mute hover:text-indigo-300 text-sm font-medium py-3 rounded-2xl transition-all cursor-pointer">
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
        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4 relative shadow-card-depth">
          <button
            onClick={() => setShowNextStep(false)}
            className="absolute top-3 right-3 text-text-mute hover:text-text text-sm cursor-pointer"
            aria-label="Tutup"
          >
            ✕
          </button>
          <p className="text-sm font-bold text-emerald-400 mb-0.5">✅ Sesi tersimpan!</p>
          <p className="text-xs text-text-mute mb-3">Mau lanjut ke mana?</p>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => { setShowNextStep(false); onSwitchTab?.("insights"); }}
              className="text-xs font-semibold bg-white/5 border border-emerald-500/20 text-emerald-400 hover:bg-white/10 px-3 py-2 rounded-xl transition-all cursor-pointer"
            >
              💡 Tambah Insight
            </button>
            <button
              onClick={() => { setShowNextStep(false); onSwitchTab?.("tasks"); }}
              className="text-xs font-semibold bg-white/5 border border-emerald-500/20 text-emerald-400 hover:bg-white/10 px-3 py-2 rounded-xl transition-all cursor-pointer"
            >
              ✔ Cek Action Items
            </button>
          </div>
        </div>
      )}

      {/* Session list */}
      {sessions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center glass-soft border border-white/10 rounded-2xl shadow-card-depth">
          <span className="text-4xl mb-3">📝</span>
          <p className="text-sm font-medium text-text">Belum ada sesi tercatat</p>
          <p className="text-xs text-text-mute mt-1">Klik tombol di atas untuk mulai mencatat.</p>
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

const INPUT_CLS = "w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-text placeholder-text-mute focus:outline-none focus:ring-2 focus:ring-indigo-sleek/50 focus:border-transparent transition";
const LABEL_CLS = "block text-xs font-semibold text-text-mute uppercase tracking-wide mb-1.5";
