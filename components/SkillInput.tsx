"use client";

import { useState } from "react";
import { generateActionPlan } from "@/lib/utils/actionPlanGenerator";
import { colorConfig } from "@/lib/utils/colorConfig";
import { SKILL_COLORS } from "@/lib/constants";

interface SkillItem {
  name: string;
  actionPlan: { text: string; checked: boolean }[];
  color: "sky" | "violet" | "rose";
}

export default function SkillInput() {
  const [bookTitle, setBookTitle] = useState("");
  const [skillInputs, setSkillInputs] = useState(["", "", ""]);
  const [submitted, setSubmitted] = useState(false);
  const [skills, setSkills] = useState<SkillItem[]>([]);
  const [error, setError] = useState("");

  const handleSkillChange = (i: number, value: string) => {
    setSkillInputs((prev) => prev.map((s, idx) => (idx === i ? value : s)));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookTitle.trim()) {
      setError("Judul buku tidak boleh kosong.");
      return;
    }
    const filled = skillInputs.filter((s) => s.trim());
    if (filled.length < 1) {
      setError("Masukkan minimal 1 skill.");
      return;
    }
    setError("");

    const generated: SkillItem[] = skillInputs
      .filter((s) => s.trim())
      .map((s, i) => ({
        name: s.trim(),
        color: SKILL_COLORS[i % SKILL_COLORS.length],
        actionPlan: generateActionPlan(s).map((text) => ({ text, checked: false })),
      }));

    setSkills(generated);
    setSubmitted(true);
  };

  const toggleCheck = (skillIdx: number, planIdx: number) => {
    setSkills((prev) =>
      prev.map((sk, si) =>
        si !== skillIdx
          ? sk
          : {
              ...sk,
              actionPlan: sk.actionPlan.map((p, pi) =>
                pi !== planIdx ? p : { ...p, checked: !p.checked }
              ),
            }
      )
    );
  };

  const handleReset = () => {
    setBookTitle("");
    setSkillInputs(["", "", ""]);
    setSubmitted(false);
    setSkills([]);
    setError("");
  };

  const completedCount = (skill: SkillItem) =>
    skill.actionPlan.filter((p) => p.checked).length;

  return (
    <div className="w-full max-w-3xl mx-auto">
      {!submitted ? (
        /* ── Input Card ── */
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Card Header */}
          <div className="bg-gradient-to-r from-sky-600 to-violet-600 px-6 py-5">
            <h2 className="text-lg font-bold text-white">Tambah Buku & Skill Target</h2>
            <p className="text-sky-100 text-sm mt-0.5">
              Isi judul buku dan skill yang ingin kamu kuasai dari buku ini.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Book Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                📚 Judul Buku
              </label>
              <input
                type="text"
                value={bookTitle}
                onChange={(e) => setBookTitle(e.target.value)}
                placeholder="Contoh: Atomic Habits"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-300 focus:border-transparent transition"
              />
            </div>

            {/* Skill Inputs */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                🎯 Skill yang Ingin Dipelajari
              </label>
              <div className="space-y-3">
                {skillInputs.map((val, i) => {
                  const c = colorConfig[SKILL_COLORS[i]];
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <span
                        className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold ${c.badge} shrink-0`}
                      >
                        {i + 1}
                      </span>
                      <input
                        type="text"
                        value={val}
                        onChange={(e) => handleSkillChange(i, e.target.value)}
                        placeholder={
                          ["Contoh: Manajemen Waktu", "Contoh: Komunikasi Efektif", "Contoh: Pengambilan Keputusan"][i]
                        }
                        className={`flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 ${c.ring} focus:border-transparent transition`}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {error && (
              <p className="text-rose-500 text-sm bg-rose-50 px-4 py-2.5 rounded-lg border border-rose-100">
                ⚠️ {error}
              </p>
            )}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-sky-600 to-violet-600 hover:from-sky-700 hover:to-violet-700 text-white font-semibold py-3 rounded-xl transition-all hover:shadow-md active:scale-[0.99]"
            >
              Buat Action Plan Otomatis →
            </button>
          </form>
        </div>
      ) : (
        /* ── Result Cards ── */
        <div className="space-y-4">
          {/* Book Header */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-0.5">
                Buku
              </p>
              <h2 className="text-lg font-bold text-gray-900">{bookTitle}</h2>
            </div>
            <button
              onClick={handleReset}
              className="text-sm text-gray-400 hover:text-gray-600 border border-gray-200 hover:border-gray-300 px-3 py-1.5 rounded-lg transition-colors"
            >
              + Buku Baru
            </button>
          </div>

          {/* Skill Cards */}
          {skills.map((skill, si) => {
            const c = colorConfig[skill.color];
            const done = completedCount(skill);
            const total = skill.actionPlan.length;
            const pct = Math.round((done / total) * 100);

            return (
              <div
                key={si}
                className={`bg-white rounded-2xl border ${c.border} shadow-sm overflow-hidden`}
              >
                {/* Skill Header */}
                <div className={`${c.bg} px-5 py-4 flex items-center justify-between`}>
                  <div className="flex items-center gap-3">
                    <span className={`w-2.5 h-2.5 rounded-full ${c.dot}`} />
                    <div>
                      <span className={`text-xs font-semibold uppercase tracking-wide ${c.text}`}>
                        Skill {si + 1}
                      </span>
                      <h3 className="text-base font-bold text-gray-800">{skill.name}</h3>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-lg font-extrabold ${c.text}`}>{pct}%</span>
                    <p className="text-xs text-gray-400">{done}/{total} selesai</p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="h-1.5 bg-gray-100">
                  <div
                    className={`h-1.5 ${c.bar} transition-all duration-500`}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                {/* Action Plan Checklist */}
                <div className="px-5 py-4 space-y-2.5">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                    Action Plan
                  </p>
                  {skill.actionPlan.map((plan, pi) => (
                    <label
                      key={pi}
                      className={`flex items-start gap-3 cursor-pointer group p-2.5 rounded-xl transition-colors ${
                        plan.checked ? c.bg : "hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={plan.checked}
                        onChange={() => toggleCheck(si, pi)}
                        className={`mt-0.5 w-4 h-4 rounded ${c.checkAccent} shrink-0 cursor-pointer`}
                      />
                      <span
                        className={`text-sm leading-relaxed transition-colors ${
                          plan.checked
                            ? "line-through text-gray-400"
                            : "text-gray-700 group-hover:text-gray-900"
                        }`}
                      >
                        {plan.text}
                      </span>
                    </label>
                  ))}
                </div>

                {/* Completion Badge */}
                {done === total && (
                  <div className={`mx-5 mb-4 ${c.bg} border ${c.border} rounded-xl px-4 py-3 flex items-center gap-2`}>
                    <span className="text-lg">🎉</span>
                    <p className={`text-sm font-semibold ${c.text}`}>
                      Skill ini telah dikuasai!
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
