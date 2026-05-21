"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen text-text bg-transparent">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden bg-bg-1/80 border-b border-line px-4 py-3 flex items-center justify-between sticky top-0 z-30 backdrop-blur-md">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-text-dim hover:text-text p-1 transition-colors"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="font-display font-black tracking-tight text-xl">
            <span>Skill</span>
            <span className="bg-gradient-to-r from-indigo-2 via-violet-sleek to-cyan-2 bg-clip-text text-transparent">Flow</span>
          </div>
          <div className="w-6" />
        </header>

        <main className="flex-1 p-4 lg:p-8">
          <div className="max-w-5xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
