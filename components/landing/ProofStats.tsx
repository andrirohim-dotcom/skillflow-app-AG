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
    <section className="bg-sky-50 border-y border-sky-100 py-16 px-6">
      <div className="max-w-4xl mx-auto">
        <dl className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          {STATS.map((s) => (
            <div key={s.label}>
              <dt className="text-5xl font-extrabold text-gray-900 tabular-nums">{s.value}</dt>
              <dd className="text-sm font-semibold text-gray-700 mt-3">{s.label}</dd>
              <dd className="text-xs text-gray-400 mt-1 leading-snug">{s.sub}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
