"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/contexts/AuthContext";

const NAV = [
  { label: "Overview", href: "/admin", icon: "📊", exact: true },
  { label: "Users", href: "/admin/users", icon: "👥" },
  { label: "Master Sumber", href: "/admin/sources", icon: "📚" },
  { label: "Settings", href: "/admin/settings", icon: "⚙️" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { profile, signOut } = useAuth();

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  }

  return (
    <aside className="w-56 min-h-screen bg-gray-900 text-white flex flex-col shrink-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-700">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Admin Panel</p>
        <span className="text-lg font-black">
          Skill<span className="text-sky-400">Flow</span>
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
              isActive(item.href, item.exact)
                ? "bg-sky-600 text-white"
                : "text-gray-400 hover:text-white hover:bg-gray-800"
            }`}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}

        <div className="pt-4 border-t border-gray-700 mt-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <span>←</span>
            <span>Kembali ke App</span>
          </Link>
        </div>
      </nav>

      {/* Admin user info */}
      <div className="px-4 py-4 border-t border-gray-700">
        <p className="text-xs text-gray-400 truncate">{profile?.email}</p>
        <button
          onClick={signOut}
          className="text-xs text-gray-500 hover:text-red-400 transition-colors mt-1"
        >
          Keluar
        </button>
      </div>
    </aside>
  );
}
