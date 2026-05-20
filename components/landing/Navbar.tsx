import Link from "next/link";

export default function Navbar() {
  return (
    <nav
      aria-label="Navigasi utama"
      className="sticky top-0 z-50 backdrop-blur bg-light-bg/80 dark:bg-dark-bg/80 border-b border-light-border dark:border-dark-border"
    >
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo with gradient */}
        <div className="flex items-center gap-2">
          <span className="text-2xl font-display font-black tracking-tight text-text-primary">
            Skill
          </span>
          <span className="text-2xl font-display font-black bg-gradient-to-r from-neon-pink via-neon-purple to-neon-cyan bg-clip-text text-transparent">
            Flow
          </span>
          <span className="text-lg ml-1">⚡</span>
        </div>

        {/* CTA Button */}
        <Link
          href="/dashboard"
          className="bg-gradient-to-r from-neon-pink to-neon-purple hover:shadow-glow-pink text-white text-sm font-display font-bold px-6 py-2.5 rounded-xl shadow-card-sm hover:shadow-md transition-all active:scale-95"
        >
          Buka Dashboard →
        </Link>
      </div>
    </nav>
  );
}
