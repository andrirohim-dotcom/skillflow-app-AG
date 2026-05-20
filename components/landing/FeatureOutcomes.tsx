const OUTCOMES = [
  {
    icon: "💡",
    accent: "border-amber-400",
    title: "Semua Insight dalam Satu Tempat",
    desc: "Catatan penting, kutipan, dan refleksi terorganisir per sumber. Cari, filter, dan ekspor ke Markdown kapan saja.",
  },
  {
    icon: "🎯",
    accent: "border-violet-400",
    title: "Skill Tracker yang Nyata",
    desc: "Bukan sekadar daftar buku. Setiap sumber terhubung ke skill target dengan 4 level kemahiran yang terukur.",
  },
  {
    icon: "📈",
    accent: "border-sky-400",
    title: "Kebiasaan Belajar Terukur",
    desc: "Streak harian, total sesi, rata-rata durasi. Lihat pola belajar Anda berkembang minggu per minggu.",
  },
  {
    icon: "⚡",
    accent: "border-emerald-400",
    title: "Action Plan Otomatis",
    desc: "Setiap skill mendapat langkah aksi yang kontekstual — dari membangun kebiasaan sampai latihan mendalam.",
  },
];

export default function FeatureOutcomes() {
  return (
    <section className="bg-white py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <p className="text-center text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
          Yang Anda dapatkan
        </p>
        <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 text-center mb-12">
          Dirancang untuk hasil, bukan sekadar fitur
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {OUTCOMES.map((o) => (
            <div
              key={o.title}
              className={`border-l-4 ${o.accent} bg-gray-50 rounded-r-2xl rounded-l-sm p-5`}
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">{o.icon}</span>
                <h3 className="text-sm font-bold text-gray-900">{o.title}</h3>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">{o.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
