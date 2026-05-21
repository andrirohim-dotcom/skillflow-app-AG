import Link from "next/link";

// ── CSS Product Mockup ────────────────────────────────────────────────────────

function ProductMockup() {
  return (
    <div aria-hidden="true" className="w-full max-w-sm mx-auto animate-slide-up relative">
      {/* Glow background decoration */}
      <div className="absolute -inset-8 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-cyan-500/10 rounded-3xl blur-3xl -z-10 animate-pulse" />

      {/* Dashboard card wrapper - glassmorphism with depth */}
      <div className="relative rounded-3xl overflow-hidden border border-line bg-surface/40 backdrop-blur-md shadow-2xl">
        {/* Top bar */}
        <div className="relative border-b border-line px-4 py-3 flex items-center gap-2 bg-white/5">
          <div className="w-2 h-2 rounded-full bg-rose-500/70" />
          <div className="w-2 h-2 rounded-full bg-amber-500/70" />
          <div className="w-2 h-2 rounded-full bg-emerald-500/70" />
          <span className="ml-2 text-[10px] text-text-dim font-bold uppercase tracking-wider">✨ SkillFlow</span>
        </div>

        <div className="p-4 space-y-3">
          {/* Source card - custom mini premium card */}
          <div className="bg-surface/50 border border-line rounded-2xl overflow-hidden shadow-md flex flex-col">
            {/* Header */}
            <div className="h-24 bg-gradient-to-br from-blue-600/60 to-blue-500/40 relative p-3 flex flex-col justify-between overflow-hidden">
              <div 
                className="absolute inset-0 opacity-15 pointer-events-none"
                style={{ backgroundImage: `repeating-linear-gradient(45deg, rgba(59, 130, 246, 0.15), rgba(59, 130, 246, 0.15) 10px, transparent 10px, transparent 20px)` }}
              />
              <div className="flex justify-between items-center relative z-10">
                <div className="bg-black/30 w-5.5 h-5.5 rounded-md border border-white/10 flex items-center justify-center">
                  <svg className="w-2.5 h-2.5 text-white/80" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2" />
                  </svg>
                </div>
                <div className="bg-black/30 text-[8px] font-black text-white/90 px-1.5 py-0.5 rounded-full uppercase tracking-wider border border-white/10">
                  📘 Book
                </div>
              </div>
              <div className="relative z-10 flex justify-between items-end">
                <div className="flex flex-col">
                  <span className="text-[7px] font-black tracking-widest text-white/50 uppercase">Book</span>
                  <span className="text-[11px] font-black text-white leading-tight truncate">Thinking, Fast and Slow</span>
                </div>
                <span className="bg-black/40 border border-white/10 text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md text-white">
                  Applied
                </span>
              </div>
            </div>
            {/* Body */}
            <div className="p-3">
              <div className="flex justify-between items-center text-[9px] mb-1 font-semibold">
                <span className="text-text-dim/80">288 / 400 hal</span>
                <span className="font-black text-text-dim">72%</span>
              </div>
              <div className="w-full bg-white/5 rounded-full h-1 overflow-hidden border border-white/5">
                <div className="h-full bg-blue-400 rounded-full" style={{ width: "72%" }} />
              </div>
            </div>
          </div>

          {/* Insight strip - vibrant */}
          <div className="rounded-2xl p-3.5 bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/20 shadow-sm">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-xs">💡</span>
              <span className="text-[9px] font-black uppercase tracking-wider text-amber-400">Insight Baru</span>
            </div>
            <p className="text-xs text-text-dim leading-relaxed">
              Sistem 1 bekerja otomatis dan cepat; Sistem 2 memerlukan usaha sadar dan lambat.
            </p>
            <div className="flex gap-1 mt-2">
              <span className="text-[9px] font-semibold px-2 py-0.5 rounded-md text-amber-400 bg-amber-500/10 border border-amber-500/20">#psikologi</span>
              <span className="text-[9px] font-semibold px-2 py-0.5 rounded-md text-pink-400 bg-pink-500/10 border border-pink-500/20">#keputusan</span>
            </div>
          </div>

          {/* Skill row - dual gradient cards */}
          <div className="flex items-center gap-3">
            <div className="flex-1 rounded-2xl p-3 bg-surface/50 border border-line shadow-sm">
              <p className="text-[10px] font-bold text-text mb-1">Critical Thinking</p>
              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-400 rounded-full" style={{ width: "60%" }} />
              </div>
              <p className="text-[9px] text-indigo-400 font-bold mt-1.5">Applied</p>
            </div>
            <div className="flex-1 rounded-2xl p-3 bg-surface/50 border border-line shadow-sm">
              <p className="text-[10px] font-bold text-text mb-1">Behavioral Econ</p>
              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-400 rounded-full" style={{ width: "80%" }} />
              </div>
              <p className="text-[9px] text-emerald-400 font-bold mt-1.5">Mastered 🚀</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Hero ──────────────────────────────────────────────────────────────────────

export default function Hero() {
  return (
    <section className="max-w-6xl mx-auto px-6 pt-20 pb-32 relative overflow-hidden">
      {/* Animated gradient background glows */}
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full blur-3xl -z-10" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-gradient-to-br from-cyan-500/10 to-emerald-500/10 rounded-full blur-3xl -z-10" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative">
        {/* Left column — copy */}
        <div className="space-y-6 stagger-1">
          {/* Eyebrow - vibrant */}
          <div className="inline-flex items-center gap-2 text-xs font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/30 px-4 py-2 rounded-full uppercase tracking-wider select-none">
            <span className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" />
            Untuk pembaca yang serius
          </div>

          {/* H1 — bold maximalist */}
          <div className="space-y-2">
            <h1 className="text-4xl lg:text-5xl font-black text-text leading-tight tracking-tight">
              Anda Membaca.{" "}
              <span className="relative block mt-2">
                <span className="absolute -inset-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 opacity-20 blur-lg rounded-lg" />
                <span className="relative text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-sleek to-cyan-400 font-extrabold">
                  Tapi Apakah Anda Benar-benar Belajar?
                </span>
              </span>
            </h1>
          </div>

          <p className="text-base text-text-dim/95 leading-relaxed max-w-lg">
            Kebanyakan orang selesai membaca, lalu lupa. SkillFlow memastikan setiap sesi meninggalkan sesuatu nyata — insight tersimpan, skill terukur, kemajuan yang meledak-ledak.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center bg-indigo-sleek text-white font-bold px-8 py-4 rounded-2xl border border-indigo-500/30 hover:bg-indigo-600 hover:scale-[1.02] transition-all active:scale-95 text-base shadow-lg shadow-indigo-500/15 cursor-pointer"
            >
              Buka Dashboard ✨
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center justify-center text-text hover:text-white hover:scale-[1.02] font-bold px-8 py-4 rounded-2xl border border-line hover:border-indigo-500/30 hover:bg-white/5 transition-all text-base cursor-pointer"
            >
              Lihat cara kerjanya ↓
            </a>
          </div>

          {/* Trust signal */}
          <p className="text-xs text-text-dim/80 font-bold pt-4 select-none uppercase tracking-wider">
            ✨ Gratis · 🔒 Tanpa akun · 💾 Data di browser Anda
          </p>
        </div>

        {/* Right column — product mockup */}
        <div className="lg:pl-8 stagger-2">
          <ProductMockup />
        </div>
      </div>
    </section>
  );
}
