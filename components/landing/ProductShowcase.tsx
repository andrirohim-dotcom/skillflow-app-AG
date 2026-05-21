"use client";

import { useState } from "react";

const SESSIONS_DATA = [
  {
    type: "⏱️ Sesi Belajar",
    text: "Membaca Bab 9 'The Illusion of Understanding' selama 45 menit. Menambahkan 2 insight baru.",
    skill: "Critical Thinking",
    tags: ["#fokus", "#sistem-2", "+15 XP"],
  },
  {
    type: "⏱️ Sesi Belajar",
    text: "Menonton video 'Biases in Decision Making' selama 30 menit. Menyelesaikan 1 action item.",
    skill: "Behavioral Economics",
    tags: ["#keputusan", "#video", "+10 XP"],
  },
];

const INSIGHTS_DATA = [
  {
    type: "💡 Insight",
    text: "Sistem 1 bekerja otomatis — cepat, intuitif, dan sering keliru. Sistem 2 butuh usaha sadar tapi lebih akurat.",
    skill: "Behavioral Economics",
    tags: ["#psikologi", "#keputusan"],
  },
  {
    type: "📖 Kutipan",
    text: '"Nothing in life is as important as you think it is, while you are thinking about it."',
    skill: "Critical Thinking",
    tags: ["#bias", "#fokus"],
  },
];

const SKILLS_DATA = [
  {
    title: "Critical Thinking",
    level: "Applied",
    progress: 60,
    desc: "Mampu mengidentifikasi bias kognitif dan melakukan dekonstruksi argumen logis secara mandiri.",
    color: "bg-indigo-400",
    textColor: "text-indigo-400",
  },
  {
    title: "Behavioral Economics",
    level: "Mastered 🚀",
    progress: 85,
    desc: "Menguasai teori keputusan, prospek prospektif, heuristik ketersediaan, dan efek pembingkaian.",
    color: "bg-emerald-400",
    textColor: "text-emerald-400",
  },
];

const TABS = ["Sesi", "Insight", "Skill"];

export default function ProductShowcase() {
  const [activeTab, setActiveTab] = useState("Insight");

  return (
    <section className="bg-[#09080d] py-16 px-6 relative overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <p className="text-center text-xs font-bold text-text-mute uppercase tracking-widest mb-3">
          Tampilan dalam aplikasi
        </p>
        <h3 className="text-center text-sm font-bold text-text-dim/80 mb-8">
          Klik tab di bawah untuk melihat bagaimana data Anda terhubung otomatis
        </h3>

        {/* Simulated app window */}
        <div
          className="max-w-2xl mx-auto rounded-3xl shadow-2xl border border-line overflow-hidden bg-surface/30 backdrop-blur-md"
        >
          {/* Browser chrome */}
          <div className="bg-white/5 border-b border-line px-4 py-3 flex items-center gap-3">
            <div className="flex gap-1.5 shrink-0 select-none">
              <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
              <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
              <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
            </div>
            <div className="flex-1 bg-black/20 rounded-xl px-3 py-1 text-xs text-text-dim/80 font-mono border border-line truncate select-none">
              skillflow / Thinking, Fast and Slow
            </div>
          </div>

          {/* Source header */}
          <div className="bg-surface/20 px-5 pt-4 pb-3 border-b border-line select-none">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs text-text-dim font-medium mb-0.5">📚 Buku · Daniel Kahneman</p>
                <p className="text-base font-black text-text">Thinking, Fast and Slow</p>
              </div>
              <span className="shrink-0 text-xs font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-lg">
                72% selesai
              </span>
            </div>
            <div className="mt-3 w-full h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
              <div className="h-full bg-indigo-400 rounded-full" style={{ width: "72%" }} />
            </div>
            <p className="text-xs text-text-dim/80 mt-1.5">288 / 400 hal · Target: 20 hal/hari</p>
          </div>

          {/* Tab bar */}
          <div className="flex border-b border-line bg-surface/20 px-5 select-none">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-xs font-bold py-3 mr-5 border-b-2 transition-all cursor-pointer ${
                  activeTab === tab
                    ? "border-indigo-400 text-indigo-400"
                    : "border-transparent text-text-dim/70 hover:text-text"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Insight/Session/Skill Content list */}
          <div className="bg-[#0b0a11]/40 p-5 space-y-3 min-h-[220px] transition-all duration-300">
            {activeTab === "Sesi" && (
              SESSIONS_DATA.map((card, idx) => (
                <div
                  key={idx}
                  className="bg-surface/50 rounded-2xl border border-line p-4 shadow-sm animate-fade-in"
                >
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-wider mb-2">
                    {card.type}
                  </p>
                  <p className="text-xs text-text-dim leading-relaxed">{card.text}</p>
                  <div className="flex flex-wrap items-center gap-1.5 mt-3">
                    <span className="text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-md font-semibold">
                      🎯 {card.skill}
                    </span>
                    {card.tags.map((tag) => (
                      <span
                        key={tag}
                        className={`text-xs px-2 py-0.5 rounded-md border border-line font-medium ${
                          tag.startsWith("+") 
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                            : "bg-white/5 text-text-dim/80"
                        }`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))
            )}

            {activeTab === "Insight" && (
              INSIGHTS_DATA.map((card, idx) => (
                <div
                  key={idx}
                  className="bg-surface/50 rounded-2xl border border-line p-4 shadow-sm animate-fade-in"
                >
                  <p className="text-[10px] font-black text-amber-400 uppercase tracking-wider mb-2">
                    {card.type}
                  </p>
                  <p className="text-xs text-text-dim leading-relaxed">{card.text}</p>
                  <div className="flex flex-wrap items-center gap-1.5 mt-3">
                    <span className="text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-md font-semibold">
                      🎯 {card.skill}
                    </span>
                    {card.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs bg-white/5 text-text-dim/80 px-2 py-0.5 rounded-md border border-line font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))
            )}

            {activeTab === "Skill" && (
              SKILLS_DATA.map((skill, idx) => (
                <div
                  key={idx}
                  className="bg-surface/50 rounded-2xl border border-line p-4 shadow-sm animate-fade-in"
                >
                  <div className="flex items-center justify-between gap-4 mb-2">
                    <h4 className="text-xs font-black text-text">{skill.title}</h4>
                    <span className={`text-[10px] font-black uppercase tracking-wider ${skill.textColor}`}>
                      {skill.level}
                    </span>
                  </div>
                  <p className="text-xs text-text-dim/90 leading-relaxed mb-3">{skill.desc}</p>
                  <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden border border-white/5">
                    <div className={`h-full ${skill.color} rounded-full`} style={{ width: `${skill.progress}%` }} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
