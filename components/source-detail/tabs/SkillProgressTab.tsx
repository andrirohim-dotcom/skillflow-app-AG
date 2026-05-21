"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { updateWsSkillProgress } from "@/lib/storageV2";
import { useWorkspace } from "@/lib/contexts/WorkspaceContext";
import {
  SKILL_LEVEL_LABELS,
  SKILL_LEVEL_DESCRIPTIONS,
  SKILL_LEVEL_COLORS,
  SKILL_LEVELS_ORDER,
  SKILL_COLORS,
} from "@/lib/constants";
import { colorConfig } from "@/lib/utils/colorConfig";
import { getSkillMastery } from "@/lib/utils/analytics";
import type { SkillProgress, SkillLevel, LearningSource } from "@/lib/types";
import Toast from "@/components/ui/Toast";

// ─── Level Updater ────────────────────────────────────────────────────────────

function LevelUpdater({
  sp,
  onSaved,
  onCancel,
}: {
  sp: SkillProgress;
  onSaved: (newLevel: SkillLevel) => void;
  onCancel: () => void;
}) {
  const { currentUser: user, currentWorkspace: workspace } = useWorkspace();
  const currentLevel = sp.level ?? "awareness";
  const [level, setLevel] = useState<SkillLevel>(currentLevel);
  const [evidence, setEvidence] = useState(sp.evidence ?? "");
  const needsEvidence = level === "applied" || level === "mastered";

  async function handleSave() {
    if (!user || !workspace) return;
    await updateWsSkillProgress(workspace.id, user.id, {
      ...sp,
      level,
      evidence: needsEvidence ? evidence.trim() || undefined : undefined,
      levelAchievedAt: level !== currentLevel ? new Date().toISOString() : sp.levelAchievedAt,
    });
    onSaved(level);
  }

  return (
    <div className="glass-soft border border-white/10 rounded-xl p-4 mt-3 space-y-3 shadow-card-depth">
      <p className="text-xs font-semibold text-text-mute uppercase tracking-wide">Update Level Skill</p>

      {/* Level stepper */}
      <div className="grid grid-cols-2 gap-2">
        {SKILL_LEVELS_ORDER.map((l, i) => {
          const currentIdx = SKILL_LEVELS_ORDER.indexOf(currentLevel);
          const isActive = l === level;
          const isAchieved = i <= currentIdx;
          return (
            <button key={l} type="button" onClick={() => setLevel(l)}
              className={`relative text-left p-3 rounded-xl border transition-all cursor-pointer ${
                isActive
                  ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/50 shadow-glow-primary font-medium"
                  : isAchieved
                  ? `${SKILL_LEVEL_COLORS[l]} border-transparent`
                  : "bg-white/5 border-white/10 text-text-mute hover:border-white/20 hover:text-text-dim"
              }`}>
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-xs font-bold">{SKILL_LEVEL_LABELS[l]}</span>
                {isAchieved && l !== level && <span className="text-xs text-indigo-300 opacity-80">✓</span>}
              </div>
              <p className="text-xs opacity-70 leading-tight">{SKILL_LEVEL_DESCRIPTIONS[l]}</p>
            </button>
          );
        })}
      </div>

      {/* Evidence (required for Applied/Mastered) */}
      {needsEvidence && (
        <div>
          <label className="block text-xs font-semibold text-text-mute uppercase tracking-wide mb-1.5">
            Bukti / Evidence {level === "mastered" ? "*" : "(opsional)"}
          </label>
          <textarea
            value={evidence}
            onChange={(e) => setEvidence(e.target.value)}
            rows={3}
            placeholder={
              level === "applied"
                ? "Ceritakan proyek atau situasi nyata di mana kamu menerapkan skill ini..."
                : "Kapan terakhir kamu mengajarkan ini? Siapa yang bisa konfirmasi keahlianmu?"
            }
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-text placeholder-text-mute focus:outline-none focus:ring-2 focus:ring-indigo-sleek/50 focus:border-transparent transition bg-transparent resize-none"
          />
        </div>
      )}

      <div className="flex gap-2">
        <button onClick={handleSave}
          className="flex-1 bg-gradient-to-r from-indigo-sleek to-violet-sleek hover:from-indigo-sleek/90 hover:to-violet-sleek/90 text-white text-sm font-semibold py-2 rounded-xl transition-all shadow-glow-primary border border-indigo-500/30 cursor-pointer active:scale-95">
          Simpan Level
        </button>
        <button onClick={onCancel}
          className="px-4 py-2 text-sm text-text-dim border border-white/10 rounded-xl hover:bg-white/5 transition-all cursor-pointer bg-transparent">
          Batal
        </button>
      </div>
    </div>
  );
}

// ─── Skill Card ───────────────────────────────────────────────────────────────

function SkillCard({
  sp,
  index,
  onRefresh,
  allSkillsGlobal,
  allSources,
}: {
  sp: SkillProgress;
  index: number;
  onRefresh: () => void;
  allSkillsGlobal?: SkillProgress[];
  allSources?: LearningSource[];
}) {
  const { currentUser: user, currentWorkspace: workspace } = useWorkspace();
  const [showUpdater, setShowUpdater] = useState(false);
  const [localSp, setLocalSp] = useState<SkillProgress>(sp);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  useEffect(() => { setLocalSp(sp); }, [sp]);

  const colorKey = SKILL_COLORS[index % SKILL_COLORS.length];
  const c = colorConfig[colorKey];
  const mastery = getSkillMastery(localSp);
  const level = sp.level ?? "awareness";
  const levelIdx = SKILL_LEVELS_ORDER.indexOf(level);
  const completedActions = (localSp.actionItems || []).filter((ai) => ai.completed).length;

  async function handleToggle(itemId: string) {
    if (!user || !workspace) return;
    const actionItems = localSp.actionItems || [];
    const newActionItems = actionItems.map((ai) =>
      ai.id === itemId
        ? { ...ai, completed: !ai.completed, completedAt: !ai.completed ? new Date().toISOString() : undefined }
        : ai
    );

    const allDone = newActionItems.length > 0 && newActionItems.every((ai) => ai.completed);
    let newLevel = localSp.level ?? "awareness";
    let newAchievedAt = localSp.levelAchievedAt;

    // If all action items done, move to next level automatically
    if (allDone) {
      const currentIdx = SKILL_LEVELS_ORDER.indexOf(newLevel);
      if (currentIdx < SKILL_LEVELS_ORDER.length - 1) {
        newLevel = SKILL_LEVELS_ORDER[currentIdx + 1];
        newAchievedAt = new Date().toISOString();
        setToastMsg(`🎯 Level Up! "${localSp.skillName}" kini ${SKILL_LEVEL_LABELS[newLevel]}!`);
      }
    }

    const updated: SkillProgress = {
      ...localSp,
      actionItems: newActionItems,
      level: newLevel,
      levelAchievedAt: newAchievedAt,
    };

    // Update local state immediately for responsiveness
    setLocalSp(updated);

    // Persist to database
    await updateWsSkillProgress(workspace.id, user.id, updated);
    
    // Refresh parent to sync all tabs
    onRefresh();
  }

  const achievedDate = sp.levelAchievedAt
    ? new Date(sp.levelAchievedAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
    : null;

  return (
    <div className={`glass-soft border ${c.border} rounded-2xl overflow-hidden shadow-card-depth`}>
      {/* Header */}
      <div className={`${c.bg} px-5 py-4 flex items-start justify-between`}>
        <div>
          <h3 className="text-base font-bold text-text">{sp.skillName}</h3>
          {achievedDate && (
            <p className="text-xs text-text-mute mt-0.5">Dicapai: {achievedDate}</p>
          )}
        </div>
        <div className="text-right">
          <span className={`inline-block text-xs font-bold px-2.5 py-1 rounded-lg ${SKILL_LEVEL_COLORS[level]}`}>
            {SKILL_LEVEL_LABELS[level]}
          </span>
          <p className="text-xs text-text-mute mt-1">{mastery}% action done</p>
        </div>
      </div>

      {/* Level progress stepper */}
      <div className="px-5 pt-4 pb-2">
        <div className="flex items-center gap-0">
          {SKILL_LEVELS_ORDER.map((l, i) => {
            const isReached = i <= levelIdx;
            const isCurrent = l === level;
            return (
              <div key={l} className="flex items-center flex-1">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all border ${
                  isCurrent
                    ? `${c.bar} text-white shadow-glow-primary border-white/20`
                    : isReached
                    ? "bg-white/10 border-white/20 text-indigo-300"
                    : "bg-white/5 border-white/10 text-text-mute"
                }`}>
                  {isReached ? (isCurrent ? i + 1 : "✓") : i + 1}
                </div>
                {i < SKILL_LEVELS_ORDER.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-1 rounded ${i < levelIdx ? "bg-indigo-500/30" : "bg-white/5"}`} />
                )}
              </div>
            );
          })}
        </div>
        <div className="flex justify-between mt-1.5">
          {SKILL_LEVELS_ORDER.map((l) => (
            <span key={l} className="text-[10px] font-semibold text-text-mute text-center leading-tight" style={{ width: "25%" }}>
              {SKILL_LEVEL_LABELS[l]}
            </span>
          ))}
        </div>
      </div>

      {/* Evidence */}
      {sp.evidence && (
        <div className="mx-5 mb-3">
          <p className="text-xs text-text-mute bg-white/5 border border-white/10 rounded-lg px-3 py-2 italic leading-relaxed">
            💬 {sp.evidence}
          </p>
        </div>
      )}

      {/* Action items checklist */}
      <div className="px-5 pb-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-text-mute uppercase tracking-wide">
            Action Plan ({completedActions}/{(localSp.actionItems || []).length})
          </p>
          {/* Progress bar inline */}
          <div className="w-24 bg-white/5 rounded-full h-1.5 overflow-hidden">
            <div className={`h-1.5 ${c.bar} transition-all`} style={{ width: `${mastery}%` }} />
          </div>
        </div>

        <div className="space-y-1.5">
          {(localSp.actionItems || []).map((ai) => (
            <button
              key={ai.id}
              type="button"
              onClick={() => handleToggle(ai.id)}
              className={`w-full flex items-start gap-2.5 p-2 rounded-lg text-left transition-colors cursor-pointer ${
                ai.completed ? c.bg : "hover:bg-white/5"
              }`}
            >
              <div className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center text-xs shrink-0 ${
                ai.completed ? `${c.bar} text-white` : "border border-white/20 bg-white/5"
              }`}>
                {ai.completed && "✓"}
              </div>
              <span className={`text-xs leading-relaxed ${
                ai.completed ? "line-through text-text-mute" : "text-text-dim"
              }`}>
                {ai.text}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* "Also in" other sources */}
      {(() => {
        const otherSources = (allSkillsGlobal ?? [])
          .filter((s) => s.skillName === sp.skillName && s.sourceId !== sp.sourceId)
          .map((s) => allSources?.find((src) => src.id === s.sourceId))
          .filter((src): src is LearningSource => !!src);
        if (otherSources.length === 0) return null;
        return (
          <div className="px-5 pb-2">
            <p className="text-xs text-text-mute">
              Skill ini juga ada di:{" "}
              {otherSources.map((src, i) => (
                <span key={src.id}>
                  <Link href={`/dashboard/item/${src.id}`} className="text-indigo-400 hover:underline hover:text-indigo-300 transition-colors font-medium">
                    {src.title}
                  </Link>
                  {i < otherSources.length - 1 ? ", " : ""}
                </span>
              ))}
            </p>
          </div>
        );
      })()}

      {/* Footer: update level button */}
      <div className="px-5 pb-4">
        {!showUpdater ? (
          <button onClick={() => setShowUpdater(true)}
            className={`w-full text-xs font-semibold py-2 rounded-xl border transition-all cursor-pointer ${
              level === "mastered"
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-glow-primary"
                : `${c.bg} ${c.text} border-current/30 hover:bg-white/5 hover:border-current`
            }`}>
            {level === "mastered" ? "✓ Skill Dikuasai" : `Update Level → ${SKILL_LEVEL_LABELS[SKILL_LEVELS_ORDER[levelIdx + 1] ?? level]}`}
          </button>
        ) : (
          <LevelUpdater
            sp={sp}
            onSaved={(newLevel) => {
              setShowUpdater(false);
              setToastMsg(`✅ Level "${sp.skillName}" diperbarui ke ${SKILL_LEVEL_LABELS[newLevel]}!`);
              onRefresh();
            }}
            onCancel={() => setShowUpdater(false)}
          />
        )}
      </div>

      {/* Toast notification */}
      {toastMsg && <Toast message={toastMsg} onDismiss={() => setToastMsg(null)} />}
    </div>
  );
}

// ─── Main Tab ─────────────────────────────────────────────────────────────────

interface Props {
  allSkillProgress: SkillProgress[];
  allSkillsGlobal?: SkillProgress[];
  allSources?: LearningSource[];
  onRefresh: () => void;
}

export default function SkillProgressTab({ allSkillProgress, allSkillsGlobal, allSources, onRefresh }: Props) {
  if (allSkillProgress.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center glass-soft border border-white/10 rounded-2xl shadow-card-depth">
        <span className="text-4xl mb-3">🎯</span>
        <p className="text-sm font-medium text-text">Belum ada skill dilacak</p>
        <p className="text-xs text-text-mute mt-1 max-w-xs">
          Skill target ditambahkan saat kamu mendaftarkan sumber belajar.
        </p>
      </div>
    );
  }

  const masteredCount = allSkillProgress.filter((sp) => (sp.level ?? "awareness") === "mastered").length;

  return (
    <div className="space-y-4">
      {masteredCount > 0 && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3 flex items-center gap-2 shadow-glow-primary">
          <span className="text-lg">🏆</span>
          <p className="text-sm font-semibold text-emerald-400">
            {masteredCount} skill telah dikuasai dari sumber ini!
          </p>
        </div>
      )}

      <div className="space-y-4">
        {allSkillProgress.map((sp, i) => (
          <SkillCard
            key={sp.id}
            sp={sp}
            index={i}
            onRefresh={onRefresh}
            allSkillsGlobal={allSkillsGlobal}
            allSources={allSources}
          />
        ))}
      </div>
    </div>
  );
}
