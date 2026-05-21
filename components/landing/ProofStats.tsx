const STATS = [
  {
    value: "5",
    label: "Jenis sumber belajar",
    sub: "Buku, video, artikel, podcast, kursus",
  },
  {
    value: "4",
    label: "Level kemahiran per skill",
    sub: "Awareness → Understanding → Applied → Mastered",
  },
  {
    value: "1",
    label: "Workspace untuk segalanya",
    sub: "Insight, sesi, skill — semua tersimpan lokal",
  },
];

export default function ProofStats() {
  return (
    <section className="bg-[#0b0a11]/40 border-y border-line py-16 px-6 backdrop-blur-md">
      <div className="max-w-4xl mx-auto">
        <dl className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          {STATS.map((s) => (
            <div key={s.label}>
              <dt className="text-5xl font-black text-indigo-400 tabular-nums">{s.value}</dt>
              <dd className="text-sm font-bold text-text mt-3">{s.label}</dd>
              <dd className="text-xs text-text-dim/80 mt-1 leading-snug">{s.sub}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
