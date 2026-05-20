export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-violet-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-3xl font-black tracking-tight">
            Skill<span className="bg-gradient-to-r from-sky-500 to-violet-500 bg-clip-text text-transparent">Flow</span>
          </span>
          <p className="text-sm text-gray-400 mt-1">Ubah Pengetahuan Jadi Keahlian</p>
        </div>
        {children}
      </div>
    </div>
  );
}
