import Link from "next/link";

export default function FinalCTA() {
  return (
    <section className="bg-gray-900 py-24 px-6 text-center">
      <div className="max-w-xl mx-auto">
        <h2 className="text-2xl lg:text-3xl font-bold text-white mb-4 leading-tight">
          Mulai Bangun Sistem Belajar Anda Hari Ini
        </h2>
        <p className="text-gray-400 text-sm leading-relaxed mb-2">
          Gratis. Tanpa akun. Data tersimpan di browser Anda — tidak ke mana-mana.
        </p>
        <p className="text-gray-500 text-sm mb-8">
          Tidak perlu setup — langsung bisa digunakan.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 bg-white hover:bg-gray-100 text-gray-900 font-bold px-8 py-3.5 rounded-xl transition-colors text-sm"
        >
          Mulai Sekarang — Gratis →
        </Link>
      </div>
    </section>
  );
}
