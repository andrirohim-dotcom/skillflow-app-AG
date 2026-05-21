const OLD_WAYS = [
  "Baca, lupa dalam seminggu",
  "Tumpukan buku tak pernah selesai",
  "Insight berserakan di berbagai tempat",
  "Tidak tahu skill apa yang sedang dibangun",
  "Semangat awal, mandek di tengah jalan",
];

const NEW_WAYS = [
  "Baca, catat insight, temukan lagi kapan saja",
  "Progres harian yang terukur dan jelas",
  "Semua insight terorganisir per sumber",
  "Skill tracker nyata dengan 4 level kemahiran",
  "Target harian + streak menjaga konsistensi",
];

export default function TensionSection() {
  return (
    <section className="bg-[#0b0a11]/80 border-y border-line py-20 px-6 backdrop-blur-md">
      <div className="max-w-5xl mx-auto">
        <p className="text-center text-xs font-bold uppercase tracking-widest text-text-dim/70 mb-3">
          Saatnya jujur
        </p>
        <h2 className="text-2xl lg:text-3xl font-black text-text text-center mb-12 tracking-tight">
          Baca banyak bukan berarti belajar banyak
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {/* Cara lama */}
          <div className="bg-surface/30 border border-line rounded-3xl p-6 backdrop-blur-md">
            <p className="text-xs font-black uppercase tracking-widest text-rose-400 mb-4">
              Cara kebanyakan orang
            </p>
            <ul className="space-y-3">
              {OLD_WAYS.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-0.5 w-4 h-4 rounded-full bg-rose-500/20 border border-rose-500/30 flex items-center justify-center shrink-0">
                    <span className="text-rose-400 text-[10px] font-bold">✕</span>
                  </span>
                  <span className="text-sm text-text-dim/80 leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Dengan SkillFlow */}
          <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-3xl p-6 backdrop-blur-md">
            <p className="text-xs font-black uppercase tracking-widest text-indigo-400 mb-4">
              Dengan SkillFlow
            </p>
            <ul className="space-y-3">
              {NEW_WAYS.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-0.5 w-4 h-4 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
                    <span className="text-indigo-400 text-[10px] font-bold">✓</span>
                  </span>
                  <span className="text-sm text-text-dim leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="text-center mt-10">
          <a href="#how-it-works" className="text-xs font-bold uppercase tracking-wider text-text-dim/70 hover:text-indigo-400 transition-colors">
            Lihat bagaimana SkillFlow bekerja ↓
          </a>
        </div>
      </div>
    </section>
  );
}
