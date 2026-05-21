const STEPS = [
  {
    number: "01",
    title: "Tambah Sumber Belajar",
    desc: "Buku, video YouTube, artikel, podcast, atau kursus online. Tetapkan target skill dan jadwal baca harian.",
  },
  {
    number: "02",
    title: "Catat & Rekam Sesi",
    desc: "Catat setiap sesi belajar — durasi, progres halaman, dan mood. Tambah insight penting langsung lewat suara.",
  },
  {
    number: "03",
    title: "Lihat Skill Tumbuh",
    desc: "Pantau kemajuan skill dari Awareness hingga Mastered. Kerjakan action plan yang sudah disiapkan otomatis untuk tiap skill.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-[#0b0a11]/40 border-y border-line py-20 px-6 backdrop-blur-md">
      <div className="max-w-5xl mx-auto">
        <p className="text-center text-xs font-bold uppercase tracking-widest text-text-dim/70 mb-3">
          Cara kerja
        </p>
        <h2 className="text-2xl lg:text-3xl font-black text-text text-center mb-14 tracking-tight">
          Tiga langkah menuju skill yang nyata
        </h2>

        {/* Steps */}
        <ol className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {STEPS.map((step, idx) => (
            <li key={step.number} className="relative flex flex-col">
              {/* Connector line (desktop only, between steps) */}
              {idx < STEPS.length - 1 && (
                <div
                  aria-hidden="true"
                  className="hidden md:block absolute top-6 left-full w-full h-[1px] bg-line -translate-x-1/2 z-0"
                  style={{ width: "calc(100% - 3rem)", left: "calc(50% + 1.5rem)" }}
                />
              )}

              <div className="relative z-10">
                {/* Number badge */}
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-line flex items-center justify-center mb-5 shadow-inner">
                  <span className="text-lg font-black text-indigo-400 tabular-nums">{step.number}</span>
                </div>

                <h3 className="text-base font-bold text-text mb-2">{step.title}</h3>
                <p className="text-sm text-text-dim/80 leading-relaxed">{step.desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
