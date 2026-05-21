"use client";

import { useMemo } from "react";
import type { LearningSession, KeyInsight, SkillProgress } from "@/lib/types";

interface Props {
  focusAreas: string[];
  sessions: LearningSession[];
  insights: KeyInsight[];
  skillProgress: SkillProgress[];
  currentStreak: number;
  longestStreak: number;
}

export default function StatsRadar({
  focusAreas,
  sessions,
  insights,
  skillProgress,
  currentStreak,
  longestStreak,
}: Props) {
  const stats = useMemo(() => {
    // 1. Consistency: based on streak momentum
    const consistencyVal = Math.min(100, (currentStreak * 12) + (longestStreak * 4) + 15);

    // 2. Mastery: action items completion rate
    const actionItems = skillProgress.flatMap((sp) => sp.actionItems || []);
    const completedActions = actionItems.filter((ai) => ai.completed).length;
    const masteryVal = actionItems.length > 0 
      ? Math.round((completedActions / actionItems.length) * 100)
      : 0;

    // 3. Depth: total minutes studied
    const totalMinutes = sessions.reduce((sum, s) => sum + (s.durationMinutes || 0), 0);
    const depthVal = Math.min(100, Math.round((totalMinutes / 600) * 100));

    // 4. Breadth: target skills count
    const breadthVal = Math.min(100, Math.round((focusAreas.length / 6) * 100));

    // 5. Reflection: insights relative to sessions
    const reflectionVal = sessions.length > 0
      ? Math.min(100, Math.round((insights.length / sessions.length) * 100))
      : insights.length > 0 ? 50 : 0;

    // 6. Action: number of active/completed actions created
    const actionVal = Math.min(100, actionItems.length * 10);

    return [
      { name: "Consistency", value: consistencyVal, label: "🔥 Kontinuitas" },
      { name: "Mastery", value: masteryVal, label: "🎓 Penguasaan" },
      { name: "Depth", value: depthVal, label: "⏰ Kedalaman" },
      { name: "Breadth", value: breadthVal, label: "🌐 Keluasan" },
      { name: "Reflection", value: reflectionVal, label: "💡 Refleksi" },
      { name: "Action", value: actionVal, label: "⚡ Aksi" },
    ];
  }, [focusAreas, sessions, insights, skillProgress, currentStreak, longestStreak]);

  // SVG Calculations
  const center = 110;
  const radius = 75;

  const points = useMemo(() => {
    return stats.map((stat, i) => {
      const angle = i * (Math.PI / 3) - Math.PI / 2; // start from top
      const valPercent = stat.value / 100;
      const x = center + radius * valPercent * Math.cos(angle);
      const y = center + radius * valPercent * Math.sin(angle);
      return { x, y };
    });
  }, [stats]);

  const polygonPath = useMemo(() => {
    return points.map((p) => `${p.x},${p.y}`).join(" ");
  }, [points]);

  const gridCircles = [0.25, 0.5, 0.75, 1];

  return (
    <div className="bg-surface/30 border border-line rounded-3xl p-6 shadow-lg flex flex-col items-center backdrop-blur-xl">
      <h3 className="text-xs font-black text-text-mute uppercase tracking-widest self-start mb-6">Cognitive Attributes</h3>
      
      <div className="relative w-full flex justify-center items-center h-60">
        <svg viewBox="0 0 220 220" className="w-56 h-56 overflow-visible">
          <defs>
            <radialGradient id="radarGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(99, 102, 241, 0.45)" />
              <stop offset="100%" stopColor="rgba(79, 70, 229, 0.08)" />
            </radialGradient>
          </defs>

          {/* Grid Hexagons */}
          {gridCircles.map((ratio, idx) => {
            const hexPoints = Array.from({ length: 6 }).map((_, i) => {
              const angle = i * (Math.PI / 3) - Math.PI / 2;
              const x = center + radius * ratio * Math.cos(angle);
              const y = center + radius * ratio * Math.sin(angle);
              return `${x},${y}`;
            }).join(" ");

            return (
              <polygon
                key={idx}
                points={hexPoints}
                fill="none"
                stroke={idx === 3 ? "rgba(99, 102, 241, 0.3)" : "rgba(255, 255, 255, 0.05)"}
                strokeWidth={idx === 3 ? "1.5" : "1"}
              />
            );
          })}

          {/* Grid Axes Lines */}
          {Array.from({ length: 3 }).map((_, i) => {
            const angle1 = i * (Math.PI / 3) - Math.PI / 2;
            const angle2 = angle1 + Math.PI;
            const x1 = center + radius * Math.cos(angle1);
            const y1 = center + radius * Math.sin(angle1);
            const x2 = center + radius * Math.cos(angle2);
            const y2 = center + radius * Math.sin(angle2);

            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="rgba(255, 255, 255, 0.05)"
                strokeWidth="1"
              />
            );
          })}

          {/* Data Fill Area */}
          <polygon
            points={polygonPath}
            fill="url(#radarGlow)"
            stroke="rgb(129, 140, 248)"
            strokeWidth="2"
            className="transition-all duration-500 ease-out filter drop-shadow-[0_0_4px_rgba(99,102,241,0.2)]"
          />

          {/* Node points on the chart */}
          {points.map((p, idx) => (
            <circle
              key={idx}
              cx={p.x}
              cy={p.y}
              r="4.5"
              fill="rgb(129, 140, 248)"
              stroke="rgba(15, 23, 42, 1)"
              strokeWidth="2"
              className="shadow transition-all duration-500 ease-out"
            />
          ))}

          {/* Labels */}
          {stats.map((stat, i) => {
            const angle = i * (Math.PI / 3) - Math.PI / 2;
            const labelRadius = radius + 18;
            const labelX = center + labelRadius * Math.cos(angle);
            const labelY = center + labelRadius * Math.sin(angle);
            
            // Adjust anchor based on horizontal alignment
            let textAnchor: "middle" | "start" | "end" = "middle";
            if (Math.cos(angle) > 0.1) textAnchor = "start";
            if (Math.cos(angle) < -0.1) textAnchor = "end";

            return (
              <g key={i} className="select-none">
                <text
                  x={labelX}
                  y={labelY - 2}
                  textAnchor={textAnchor}
                  className="text-[8px] font-black text-text-mute fill-current uppercase tracking-wider"
                >
                  {stat.label}
                </text>
                <text
                  x={labelX}
                  y={labelY + 6}
                  textAnchor={textAnchor}
                  className="text-[9px] font-black text-indigo-400 fill-current"
                >
                  {stat.value} / 100
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
