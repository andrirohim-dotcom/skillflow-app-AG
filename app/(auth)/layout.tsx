export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background relative flex items-center justify-center px-4 py-12 overflow-hidden">
      {/* Background ambient glows */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <span className="text-3xl font-black tracking-tight text-text">
            Skill<span className="bg-gradient-to-r from-indigo-400 via-violet-sleek to-cyan-400 bg-clip-text text-transparent">Flow</span>
          </span>
          <p className="text-sm text-text-mute mt-2">Ubah Pengetahuan Jadi Keahlian</p>
        </div>
        {children}
      </div>
    </div>
  );
}
