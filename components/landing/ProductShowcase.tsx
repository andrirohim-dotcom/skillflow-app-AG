const INSIGHT_CARDS = [
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

const TABS = ["Sesi", "Insight", "Skill"];

export default function ProductShowcase() {
  return (
    <section className="bg-white py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <p className="text-center text-xs font-semibold text-gray-400 uppercase tracking-widest mb-8">
          Tampilan dalam aplikasi
        </p>

        {/* Simulated app window */}
        <div
          aria-hidden="true"
          className="max-w-2xl mx-auto rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-scale-in"
        >
          {/* Browser chrome */}
          <div className="bg-gray-100 border-b border-gray-200 px-4 py-2.5 flex items-center gap-3">
            <div className="flex gap-1.5 shrink-0">
              <div className="w-2.5 h-2.5 rounded-full bg-gray-300" />
              <div className="w-2.5 h-2.5 rounded-full bg-gray-300" />
              <div className="w-2.5 h-2.5 rounded-full bg-gray-300" />
            </div>
            <div className="flex-1 bg-white rounded-md px-3 py-1 text-xs text-gray-400 font-mono border border-gray-200 truncate">
              skillflow / Thinking, Fast and Slow
            </div>
          </div>

          {/* Source header */}
          <div className="bg-white px-5 pt-4 pb-3 border-b border-gray-100">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs text-gray-400 font-medium mb-0.5">📚 Buku · Daniel Kahneman</p>
                <p className="text-base font-extrabold text-gray-900">Thinking, Fast and Slow</p>
              </div>
              <span className="shrink-0 text-xs font-bold text-sky-600 bg-sky-50 border border-sky-100 px-2.5 py-1 rounded-lg">
                72% selesai
              </span>
            </div>
            <div className="mt-3 w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-sky-500 rounded-full" style={{ width: "72%" }} />
            </div>
            <p className="text-xs text-gray-400 mt-1.5">288 / 400 hal · Target: 20 hal/hari</p>
          </div>

          {/* Tab bar */}
          <div className="flex border-b border-gray-100 bg-white px-5">
            {TABS.map((tab, i) => (
              <div
                key={tab}
                className={`text-xs font-semibold py-2.5 mr-5 border-b-2 ${
                  i === 1
                    ? "border-sky-600 text-sky-600"
                    : "border-transparent text-gray-400"
                }`}
              >
                {tab}
              </div>
            ))}
          </div>

          {/* Insight cards */}
          <div className="bg-gray-50 p-5 space-y-3">
            {INSIGHT_CARDS.map((card) => (
              <div
                key={card.text}
                className="bg-white rounded-xl border border-gray-100 p-3.5"
              >
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  {card.type}
                </p>
                <p className="text-sm text-gray-800 leading-relaxed">{card.text}</p>
                <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                  <span className="text-xs bg-sky-50 text-sky-600 border border-sky-100 px-2 py-0.5 rounded-md">
                    🎯 {card.skill}
                  </span>
                  {card.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs bg-gray-50 text-gray-400 px-2 py-0.5 rounded-md"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
