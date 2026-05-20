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
    <section className="bg-gray-900 py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <p className="text-center text-xs font-semibold uppercase tracking-widest text-gray-500 mb-3">
          Saatnya jujur
        </p>
        <h2 className="text-2xl lg:text-3xl font-bold text-white text-center mb-12">
          Baca banyak bukan berarti belajar banyak
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {/* Cara lama */}
          <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-6">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">
              Cara kebanyakan orang
            </p>
            <ul className="space-y-3">
              {OLD_WAYS.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-0.5 w-4 h-4 rounded-full bg-rose-900/60 flex items-center justify-center shrink-0">
                    <span className="text-rose-400 text-xs font-bold">✕</span>
                  </span>
                  <span className="text-sm text-gray-400 leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Dengan SkillFlow */}
          <div className="bg-sky-900/20 border border-sky-800/40 rounded-2xl p-6">
            <p className="text-xs font-bold uppercase tracking-widest text-sky-500 mb-4">
              Dengan SkillFlow
            </p>
            <ul className="space-y-3">
              {NEW_WAYS.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-0.5 w-4 h-4 rounded-full bg-sky-800/60 flex items-center justify-center shrink-0">
                    <span className="text-sky-400 text-xs font-bold">✓</span>
                  </span>
                  <span className="text-sm text-gray-200 leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="text-center mt-10">
          <a href="#how-it-works" className="text-sm text-gray-500 hover:text-sky-400 transition-colors">
            Lihat bagaimana SkillFlow bekerja ↓
          </a>
        </div>
      </div>
    </section>
  );
}
