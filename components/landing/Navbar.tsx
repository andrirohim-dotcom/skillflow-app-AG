import Link from "next/link";

export default function Navbar() {
  return (
    <nav
      aria-label="Navigasi utama"
      className="sticky top-0 z-50 backdrop-blur-md bg-background/60 border-b border-line"
    >
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo with gradient */}
        <div className="flex items-center gap-2 select-none">
          <span className="text-2xl font-black tracking-tight text-text">
            Skill<span className="bg-gradient-to-r from-indigo-400 via-violet-sleek to-cyan-400 bg-clip-text text-transparent">Flow</span>
          </span>
          <span className="text-lg ml-1">⚡</span>
        </div>

        {/* CTA Button */}
        <Link
          href="/dashboard"
          className="bg-indigo-sleek text-white text-xs font-bold px-5 py-2.5 rounded-xl border border-indigo-500/30 hover:bg-indigo-600 hover:scale-[1.03] transition-all active:scale-95 shadow-lg shadow-indigo-500/15"
        >
          Coba Gratis →
        </Link>
      </div>
    </nav>
  );
}
