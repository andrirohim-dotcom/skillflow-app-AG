import Link from "next/link";

// ── CSS Product Mockup ────────────────────────────────────────────────────────

function ProductMockup() {
  return (
    <div aria-hidden="true" className="w-full max-w-sm mx-auto animate-slide-up relative">
      {/* Glow background decoration */}
      <div className="absolute -inset-8 bg-gradient-to-br from-neon-pink/20 via-neon-purple/10 to-neon-cyan/20 rounded-3xl blur-3xl -z-10 animate-pulse" />

      {/* Dashboard card wrapper - glassmorphism with depth */}
      <div className="relative rounded-2xl overflow-hidden shadow-card-depth border border-light-border dark:border-dark-border dark:bg-dark-card bg-light-card">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-neon-pink/5 via-transparent to-neon-purple/5 pointer-events-none" />

        {/* Top bar */}
        <div className="relative border-b border-light-border dark:border-dark-border px-4 py-3 flex items-center gap-2 bg-gradient-to-r from-neon-pink/10 to-neon-purple/10">
          <div className="w-2.5 h-2.5 rounded-full bg-neon-pink animate-pulse" />
          <div className="w-2.5 h-2.5 rounded-full bg-neon-purple animate-pulse animation-delay-100" />
          <div className="w-2.5 h-2.5 rounded-full bg-neon-cyan animate-pulse animation-delay-200" />
          <span className="ml-2 text-xs text-text-secondary font-display font-bold tracking-wider">✨ SkillFlow</span>
        </div>

        <div className="relative p-4 space-y-3">
          {/* Source card - saturated color */}
          <div className="rounded-xl p-3 bg-gradient-to-br from-neon-cyan/20 to-neon-cyan/10 border border-neon-cyan/30 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-xs font-display font-bold text-text-primary">Thinking, Fast and Slow</p>
                <p className="text-xs text-text-secondary">Daniel Kahneman · Buku</p>
              </div>
              <span className="text-xs font-display font-bold text-neon-cyan bg-neon-cyan/20 px-2 py-0.5 rounded-md border border-neon-cyan/50">
                72%
              </span>
            </div>
            {/* Progress bar with breathing animation */}
            <div className="w-full h-2 bg-dark-border/30 dark:bg-light-border/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-neon-cyan to-neon-purple rounded-full animate-breathe"
                style={{ width: "72%" }}
              />
            </div>
            <p className="text-xs text-text-secondary mt-1.5">288 / 400 hal · Target: 20 hal/hari</p>
          </div>

          {/* Insight strip - vibrant */}
          <div className="rounded-xl p-3 bg-gradient-to-br from-neon-gold/20 to-neon-orange/10 border border-neon-gold/40 shadow-sm">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-sm">💡</span>
              <span className="text-xs font-display font-bold uppercase tracking-wider text-neon-gold">Insight Baru</span>
            </div>
            <p className="text-xs text-text-primary leading-relaxed">
              Sistem 1 bekerja otomatis dan cepat; Sistem 2 memerlukan usaha sadar dan lambat.
            </p>
            <div className="flex gap-1.5 mt-2">
              <span className="text-xs font-body px-2 py-0.5 rounded-md text-neon-orange bg-neon-orange/20 border border-neon-orange/40">#psikologi</span>
              <span className="text-xs font-body px-2 py-0.5 rounded-md text-neon-pink bg-neon-pink/20 border border-neon-pink/40">#keputusan</span>
            </div>
          </div>

          {/* Skill row - dual gradient cards */}
          <div className="flex items-center gap-3">
            <div className="flex-1 rounded-xl p-2.5 bg-gradient-to-br from-neon-purple/20 to-neon-pink/10 border border-neon-purple/40 shadow-sm hover:shadow-md transition-shadow">
              <p className="text-xs font-display font-bold text-text-primary mb-1.5">Critical Thinking</p>
              <div className="w-full h-1.5 bg-dark-border/30 dark:bg-light-border/30 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-neon-purple to-neon-pink rounded-full" style={{ width: "60%" }} />
              </div>
              <p className="text-xs text-neon-purple font-display font-bold mt-1">Applied</p>
            </div>
            <div className="flex-1 rounded-xl p-2.5 bg-gradient-to-br from-neon-lime/20 to-neon-cyan/10 border border-neon-lime/40 shadow-sm hover:shadow-md transition-shadow">
              <p className="text-xs font-display font-bold text-text-primary mb-1.5">Behavioral Econ</p>
              <div className="w-full h-1.5 bg-dark-border/30 dark:bg-light-border/30 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-neon-lime to-neon-cyan rounded-full" style={{ width: "80%" }} />
              </div>
              <p className="text-xs text-neon-lime font-display font-bold mt-1">Mastered 🚀</p>
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
      {/* Animated gradient background */}
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-gradient-to-br from-neon-pink/20 to-neon-purple/20 rounded-full blur-3xl animate-float-up -z-10" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-gradient-to-br from-neon-cyan/20 to-neon-lime/20 rounded-full blur-3xl animate-pulse -z-10" style={{ animationDelay: "2s" }} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative">
        {/* Left column — copy */}
        <div className="space-y-6 stagger-1">
          {/* Eyebrow - vibrant */}
          <div className="inline-flex items-center gap-2 text-xs font-display font-bold text-neon-pink bg-neon-pink/10 border border-neon-pink/40 px-4 py-2 rounded-full uppercase tracking-wider">
            <span className="w-2 h-2 bg-neon-pink rounded-full animate-pulse" />
            Untuk pembaca yang serius
          </div>

          {/* H1 — bold maximalist */}
          <div className="space-y-2">
            <h1 className="text-5xl lg:text-6xl font-display font-black text-text-primary leading-tight">
              Anda Membaca.{" "}
              <span className="relative">
                <span className="absolute -inset-2 bg-gradient-to-r from-neon-pink via-neon-purple to-neon-cyan opacity-30 blur-lg rounded-lg" />
                <span className="relative text-transparent bg-clip-text bg-gradient-to-r from-neon-pink via-neon-purple to-neon-cyan">
                  Tapi Apakah Anda Benar-benar Belajar?
                </span>
              </span>
            </h1>
          </div>

          <p className="text-lg text-text-secondary leading-relaxed max-w-lg font-body">
            Kebanyakan orang selesai membaca, lalu lupa. SkillFlow memastikan setiap sesi meninggalkan sesuatu nyata — insight tersimpan, skill terukur, kemajuan yang meledak-ledak.
          </p>

          {/* CTAs - maximalist style */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center bg-gradient-to-r from-neon-pink to-neon-purple hover:shadow-glow-pink text-white font-display font-bold px-8 py-4 rounded-2xl shadow-card-sm hover:shadow-lg transition-all active:scale-95 text-lg"
            >
              Buka Dashboard ✨
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center justify-center text-text-primary hover:text-text-secondary font-display font-bold px-8 py-4 rounded-2xl border-2 border-neon-purple/40 hover:border-neon-purple/60 hover:bg-neon-purple/5 transition-all text-lg"
            >
              Lihat cara kerjanya ↓
            </a>
          </div>

          {/* Trust signal */}
          <p className="text-sm text-text-secondary font-body pt-4">
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
