"use client";

import { useEffect, useState } from "react";

export default function CalendarIcon() {
  const [date, setDate] = useState<number | null>(null);

  useEffect(() => {
    setDate(new Date().getDate());
  }, []);

  return (
    <div className="relative inline-flex items-center justify-center w-8 h-8 lg:w-10 lg:h-10 bg-white border-2 border-text-primary rounded-lg overflow-hidden shadow-sm">
      {/* Header of calendar */}
      <div className="absolute top-0 left-0 right-0 h-2.5 lg:h-3 bg-rose-500 border-b-2 border-text-primary" />
      
      {/* Date number */}
      <span className="mt-2 text-sm lg:text-base font-black text-text-primary tabular-nums">
        {date ?? "..."}
      </span>
      
      {/* Punch holes (optional detail) */}
      <div className="absolute -top-0.5 left-1.5 w-1 h-1.5 bg-gray-300 rounded-full border border-text-primary" />
      <div className="absolute -top-0.5 right-1.5 w-1 h-1.5 bg-gray-300 rounded-full border border-text-primary" />
    </div>
  );
}
