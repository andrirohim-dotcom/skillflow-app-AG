"use client";

import { useEffect, useState, useRef } from "react";

interface Props {
  onFinish: (seconds: number) => void;
}

export default function ReadingTimer({ onFinish }: Props) {
  const [status, setStatus] = useState<"idle" | "running" | "paused">("idle");
  const [seconds, setSeconds] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (status === "running") {
      intervalRef.current = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [status]);

  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h > 0 ? h + ":" : ""}${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleStop = () => {
    onFinish(seconds);
    setStatus("idle");
    setSeconds(0);
  };

  if (status === "idle") {
    return (
      <button
        onClick={() => setStatus("running")}
        className="flex items-center gap-2 bg-sky-50 text-sky-700 hover:bg-sky-100 px-4 py-2 rounded-xl text-xs font-bold transition-all border border-sky-200/50 active:scale-95"
      >
        <span>⏱️</span>
        <span>Mulai Sesi Belajar</span>
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2 bg-gray-900 text-white px-4 py-1.5 rounded-2xl shadow-lg animate-scale-in">
      <div className="flex flex-col items-center justify-center min-w-[50px] border-r border-gray-700 pr-3 mr-1">
        <span className="text-[8px] font-black uppercase text-gray-500 tracking-tighter">Running</span>
        <span className="font-mono text-sm font-bold tabular-nums">{formatTime(seconds)}</span>
      </div>
      
      <div className="flex items-center gap-1.5 ml-1">
        <button
          onClick={() => setStatus(status === "running" ? "paused" : "running")}
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
            status === "running" ? "bg-gray-800 hover:bg-gray-700" : "bg-emerald-600 hover:bg-emerald-700 animate-pulse"
          }`}
          title={status === "running" ? "Jeda" : "Lanjut"}
        >
          {status === "running" ? (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16" />
              <rect x="14" y="4" width="4" height="16" />
            </svg>
          ) : (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="ml-0.5">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        <button
          onClick={handleStop}
          className="bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white text-[10px] font-black px-3 py-1.5 rounded-lg shadow-sm active:scale-95 transition-all uppercase tracking-wider"
        >
          Selesai
        </button>
      </div>
    </div>
  );
}
