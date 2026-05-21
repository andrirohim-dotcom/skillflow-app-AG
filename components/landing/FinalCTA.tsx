import Link from "next/link";

export default function FinalCTA() {
  return (
    <section className="bg-[#09080d] py-24 px-6 text-center relative overflow-hidden">
      {/* Background glow decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-xl mx-auto relative z-10">
        <h2 className="text-2xl lg:text-3xl font-black text-text mb-4 leading-tight tracking-tight">
          Mulai Bangun Sistem Belajar Anda Hari Ini
        </h2>
        <p className="text-text-dim/80 text-sm leading-relaxed mb-2">
          Gratis. Tanpa akun. Data tersimpan di browser Anda — tidak ke mana-mana.
        </p>
        <p className="text-text-dim/60 text-xs mb-8 font-bold uppercase tracking-wider">
          Tidak perlu setup — langsung bisa digunakan.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 bg-indigo-sleek text-white font-bold px-8 py-3.5 rounded-xl border border-indigo-500/30 hover:bg-indigo-600 hover:scale-[1.02] transition-all active:scale-95 text-sm shadow-lg shadow-indigo-500/15 cursor-pointer"
        >
          Mulai Sekarang — Gratis →
        </Link>
      </div>
    </section>
  );
}
