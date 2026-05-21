"use client";

import React from "react";

// ─── ICON COMPONENT ──────────────────────────────────────────────────────────
export interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: string;
  size?: number;
  strokeWidth?: number;
}

export function Icon({ name, size = 18, strokeWidth = 1.7, style, ...rest }: IconProps) {
  const s = { width: size, height: size, ...style };
  
  const props = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    style: s,
    ...rest,
  };

  const paths: Record<string, React.ReactNode> = {
    home: (
      <>
        <path d="M3 11.5 12 4l9 7.5" />
        <path d="M5 10.5V20h14v-9.5" />
        <path d="M10 20v-5h4v5" />
      </>
    ),
    book: (
      <>
        <path d="M4 4.5A2 2 0 0 1 6 3h13v15H6a2 2 0 0 0-2 2" />
        <path d="M4 4.5V19" />
        <path d="M19 18v3H6a2 2 0 0 1-2-2" />
      </>
    ),
    tree: (
      <>
        <circle cx="12" cy="5" r="2.2" />
        <circle cx="5" cy="13" r="2.2" />
        <circle cx="19" cy="13" r="2.2" />
        <circle cx="8.5" cy="20" r="2" />
        <circle cx="15.5" cy="20" r="2" />
        <path d="M12 7.2v3.6M10.6 10.8 6.8 12M13.4 10.8 17.2 12M6 15l2 3M18 15l-2 3" />
      </>
    ),
    user: (
      <>
        <circle cx="12" cy="8" r="3.5" />
        <path d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6" />
      </>
    ),
    radar: (
      <>
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="5" />
        <path d="M12 3v18M3 12h18" />
      </>
    ),
    bolt: (
      <>
        <path d="M13 3 5 14h6l-1 7 8-11h-6z" />
      </>
    ),
    plus: (
      <>
        <path d="M12 5v14M5 12h14" />
      </>
    ),
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </>
    ),
    bell: (
      <>
        <path d="M18 16v-5a6 6 0 0 0-12 0v5l-2 2h16z" />
        <path d="M10 21a2 2 0 0 0 4 0" />
      </>
    ),
    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1A1.7 1.7 0 0 0 9 19.4a1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
      </>
    ),
    play: (
      <>
        <path d="M7 5v14l12-7z" />
      </>
    ),
    pause: (
      <>
        <rect x="6" y="5" width="4" height="14" rx="1" />
        <rect x="14" y="5" width="4" height="14" rx="1" />
      </>
    ),
    check: (
      <>
        <path d="m5 12 4.5 4.5L20 6" />
      </>
    ),
    flame: (
      <>
        <path d="M12 3c1 4 5 5 5 10a5 5 0 0 1-10 0c0-2 1.5-3 1.5-5 0 1 .5 2 1.5 2 0-3 1-5 2-7z" />
      </>
    ),
    target: (
      <>
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="5" />
        <circle cx="12" cy="12" r="1.5" />
      </>
    ),
    sparkle: (
      <>
        <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6" />
      </>
    ),
    chevron: (
      <>
        <path d="m9 6 6 6-6 6" />
      </>
    ),
    chevronDown: (
      <>
        <path d="m6 9 6 6 6-6" />
      </>
    ),
    grid: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </>
    ),
    list: (
      <>
        <path d="M4 6h16M4 12h16M4 18h16" />
        <circle cx="2.5" cy="6" r=".8" />
        <circle cx="2.5" cy="12" r=".8" />
        <circle cx="2.5" cy="18" r=".8" />
      </>
    ),
    star: (
      <>
        <path d="m12 3 2.6 5.6 6 .7-4.5 4 1.3 6L12 16.8 6.6 19.3l1.3-6L3.4 9.3l6-.7z" />
      </>
    ),
    trophy: (
      <>
        <path d="M8 4h8v4a4 4 0 0 1-8 0z" />
        <path d="M5 5H3v2a3 3 0 0 0 3 3M19 5h2v2a3 3 0 0 1-3 3" />
        <path d="M9 13h6v3H9z" />
        <path d="M8 20h8" />
        <path d="M12 16v4" />
      </>
    ),
    sword: (
      <>
        <path d="m14 4 6 0 0 6L9 21l-3 0 0-3z" />
        <path d="m9 13 2 2M5 17l-2 2 2 2 2-2" />
      </>
    ),
    book2: (
      <>
        <path d="M4 4h12a3 3 0 0 1 3 3v13H7a3 3 0 0 1-3-3z" />
        <path d="M4 17h15" />
      </>
    ),
    podcast: (
      <>
        <circle cx="12" cy="11" r="2" />
        <path d="M9 15c-1.5-1-2-2.4-2-4a5 5 0 0 1 10 0c0 1.6-.5 3-2 4" />
        <path d="M6.5 18C5 16.5 4 14.4 4 12a8 8 0 1 1 16 0c0 2.4-1 4.5-2.5 6" />
        <path d="M11 14h2l-.5 7h-1z" />
      </>
    ),
    video: (
      <>
        <rect x="3" y="6" width="14" height="12" rx="2" />
        <path d="m17 10 4-2v8l-4-2z" />
      </>
    ),
    article: (
      <>
        <rect x="4" y="3" width="16" height="18" rx="2" />
        <path d="M8 8h8M8 12h8M8 16h5" />
      </>
    ),
    pen: (
      <>
        <path d="m4 20 4-1 11-11-3-3L5 16z" />
        <path d="m13 6 3 3" />
      </>
    ),
    archive: (
      <>
        <rect x="3" y="4" width="18" height="4" rx="1" />
        <path d="M5 8v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8" />
        <path d="M10 12h4" />
      </>
    ),
    lightbulb: (
      <>
        <path d="M9 18h6" />
        <path d="M10 21h4" />
        <path d="M12 3a6 6 0 0 0-4 10.5c1 1 1.5 2 1.5 3.5h5c0-1.5.5-2.5 1.5-3.5A6 6 0 0 0 12 3z" />
      </>
    ),
    layers: (
      <>
        <path d="m12 3 9 5-9 5-9-5z" />
        <path d="m3 13 9 5 9-5" />
        <path d="m3 18 9 5 9-5" />
      </>
    ),
    headphones: (
      <>
        <path d="M4 14v-2a8 8 0 0 1 16 0v2" />
        <path d="M4 14h4v6H6a2 2 0 0 1-2-2zM20 14h-4v6h2a2 2 0 0 0 2-2z" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    arrow: (
      <>
        <path d="M5 12h14M13 6l6 6-6 6" />
      </>
    ),
    close: (
      <>
        <path d="m6 6 12 12M18 6 6 18" />
      </>
    ),
    mic: (
      <>
        <rect x="9" y="3" width="6" height="11" rx="3" />
        <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
      </>
    ),
    compass: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="m9 15 1.5-4.5L15 9l-1.5 4.5z" />
      </>
    ),
    crown: (
      <>
        <path d="m3 7 4 4 5-6 5 6 4-4-2 12H5z" />
        <path d="M5 19h14" />
      </>
    ),
  };

  return (
    <svg {...props}>
      {paths[name] || <circle cx="12" cy="12" r="1" />}
    </svg>
  );
}

// ─── CARD COMPONENT ──────────────────────────────────────────────────────────
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  accent?: "indigo" | "cyan" | "amber" | "";
}

export function Card({ children, className = "", style, accent, ...rest }: CardProps) {
  const ringClass =
    accent === "indigo"
      ? "ring-indigo"
      : accent === "cyan"
      ? "ring-cyan"
      : accent === "amber"
      ? "ring-amber"
      : "";

  return (
    <div
      className={`glass lift ${ringClass} ${className}`}
      style={style}
      {...rest}
    >
      {children}
    </div>
  );
}

// ─── SECTION TITLE ───────────────────────────────────────────────────────────
export interface SectionTitleProps {
  eyebrow?: string;
  title: string;
  action?: React.ReactNode;
  accent?: "indigo" | "cyan" | "amber";
}

export function SectionTitle({ eyebrow, title, action, accent = "indigo" }: SectionTitleProps) {
  const color =
    accent === "cyan"
      ? "var(--cyan-2)"
      : accent === "amber"
      ? "var(--amber-2)"
      : "var(--indigo-2)";

  return (
    <div className="flex items-end justify-between mb-4 gap-4">
      <div>
        {eyebrow && (
          <div
            className="mono text-[10px] font-bold uppercase tracking-[0.15em] mb-1.5 flex items-center gap-2"
            style={{ color }}
          >
            <span className="w-3.5 h-[1px] display-inline-block" style={{ background: color }} />
            {eyebrow}
          </div>
        )}
        <h2 className="text-xl font-display font-semibold text-text">{title}</h2>
      </div>
      {action}
    </div>
  );
}

// ─── PROGRESS BAR ────────────────────────────────────────────────────────────
export interface ProgressBarProps {
  value: number;
  max?: number;
  accent?: "indigo" | "cyan" | "amber";
  height?: number;
  label?: string;
  sub?: string;
}

export function ProgressBar({
  value,
  max = 100,
  accent = "indigo",
  height = 6,
  label,
  sub,
}: ProgressBarProps) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));

  const grad =
    accent === "cyan"
      ? "linear-gradient(90deg, #14b8a6, #22d3ee)"
      : accent === "amber"
      ? "linear-gradient(90deg, #f59e0b, #fbbf24)"
      : "linear-gradient(90deg, #6366f1, #a78bfa)";

  const glow =
    accent === "cyan"
      ? "0 0 14px rgba(20,184,166,0.45)"
      : accent === "amber"
      ? "0 0 14px rgba(245,158,11,0.45)"
      : "0 0 14px rgba(129,140,248,0.45)";

  return (
    <div className="w-full">
      {(label || sub) && (
        <div className="flex justify-between items-baseline mb-2">
          {label && <div className="text-xs text-text-dim tracking-wide">{label}</div>}
          {sub && <div className="mono text-[10px] text-text-mute">{sub}</div>}
        </div>
      )}
      <div
        className="bg-white/5 rounded-full overflow-hidden border border-white/5"
        style={{ height }}
      >
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${pct}%`,
            background: grad,
            boxShadow: glow,
          }}
        />
      </div>
    </div>
  );
}

// ─── STAT KPI TILE ──────────────────────────────────────────────────────────
export interface StatProps {
  icon: string;
  label: string;
  value: string | number;
  unit?: string;
  accent?: "indigo" | "cyan" | "amber";
  trend?: number;
}

export function Stat({ icon, label, value, unit, accent = "indigo", trend }: StatProps) {
  const color =
    accent === "cyan"
      ? "var(--cyan-2)"
      : accent === "amber"
      ? "var(--amber-2)"
      : "var(--indigo-2)";

  const bg =
    accent === "cyan"
      ? "rgba(20,184,166,0.10)"
      : accent === "amber"
      ? "rgba(245,158,11,0.10)"
      : "rgba(99,102,241,0.12)";

  return (
    <div className="glass-soft p-[18px] flex flex-col gap-3 relative overflow-hidden rounded-2xl lift">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(120px 80px at 90% 10%, ${bg}, transparent 70%)`,
        }}
      />
      <div className="flex justify-between items-center z-10">
        <div
          className="w-8 h-8 rounded-[10px] flex items-center justify-center border"
          style={{
            background: bg,
            color,
            borderColor: `${color}33`,
          }}
        >
          <Icon name={icon} size={16} />
        </div>
        {trend !== undefined && (
          <div
            className={`mono text-[10px] font-bold ${
              trend >= 0 ? "text-green-sleek" : "text-rose-sleek"
            }`}
          >
            {trend >= 0 ? "▲" : "▼"} {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div className="z-10">
        <div className="mono text-[10px] text-text-mute uppercase tracking-widest mb-1">
          {label}
        </div>
        <div className="flex items-baseline gap-1">
          <div className="font-display text-3xl font-semibold text-text leading-none">
            {value}
          </div>
          {unit && <div className="mono text-xs text-text-mute">{unit}</div>}
        </div>
      </div>
    </div>
  );
}

// ─── AVATAR COMPONENT ────────────────────────────────────────────────────────
export interface AvatarProps {
  size?: number;
  level?: number;
  glow?: boolean;
  nameAbbr?: string;
}

export function Avatar({ size = 36, level = 12, glow = true, nameAbbr = "AY" }: AvatarProps) {
  return (
    <div
      className="relative flex-shrink-0"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} viewBox="0 0 40 40">
        <defs>
          <linearGradient id="av-g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#6366f1" />
            <stop offset="0.5" stopColor="#a78bfa" />
            <stop offset="1" stopColor="#22d3ee" />
          </linearGradient>
          <radialGradient id="av-i" cx="0.5" cy="0.4">
            <stop offset="0" stopColor="#1a1a2e" stopOpacity="0" />
            <stop offset="1" stopColor="#0a0a16" />
          </radialGradient>
        </defs>
        <circle cx="20" cy="20" r="19" fill="url(#av-g)" />
        <circle cx="20" cy="20" r="16.5" fill="#0c0c1a" />
        <circle cx="20" cy="20" r="16.5" fill="url(#av-i)" />
        <text
          x="20"
          y="24.5"
          textAnchor="middle"
          fontFamily="Outfit, sans-serif"
          fontWeight="600"
          fontSize="13"
          fill="#e7e7f3"
        >
          {nameAbbr}
        </text>
      </svg>
      {glow && (
        <div
          className="absolute -bottom-0.5 -right-1 bg-gradient-to-br from-amber-sleek to-amber-2 text-[#1a1206] font-display text-[9px] font-bold px-1.5 py-0.5 rounded-full border-2 border-[#0a0a16]"
          style={{
            boxShadow: "0 0 10px rgba(245,158,11,0.7)",
          }}
        >
          {level}
        </div>
      )}
    </div>
  );
}

// ─── SPARKLINE COMPONENT ─────────────────────────────────────────────────────
export interface SparklineProps {
  data: number[];
  accent?: "indigo" | "cyan" | "amber";
  height?: number;
  width?: number;
}

export function Sparkline({ data, accent = "indigo", height = 36, width = 120 }: SparklineProps) {
  if (!data || data.length === 0) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return [x, y];
  });

  const d = pts.map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`)).join(" ");
  const area = `${d} L${width},${height} L0,${height} Z`;

  const colors = {
    indigo: { stroke: "#a78bfa", fill: "url(#sp-i)", stop: "#a78bfa" },
    cyan: { stroke: "#22d3ee", fill: "url(#sp-c)", stop: "#22d3ee" },
    amber: { stroke: "#fbbf24", fill: "url(#sp-a)", stop: "#fbbf24" },
  };

  const c = colors[accent] || colors.indigo;
  const lastPoint = pts[pts.length - 1];

  return (
    <svg width={width} height={height} className="overflow-visible select-none">
      <defs>
        <linearGradient id="sp-i" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#a78bfa" stopOpacity="0.35" />
          <stop offset="1" stopColor="#a78bfa" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="sp-c" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#22d3ee" stopOpacity="0.35" />
          <stop offset="1" stopColor="#22d3ee" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="sp-a" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fbbf24" stopOpacity="0.35" />
          <stop offset="1" stopColor="#fbbf24" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={c.fill} />
      <path
        d={d}
        fill="none"
        stroke={c.stroke}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ filter: `drop-shadow(0 0 4px ${c.stroke})` }}
      />
      {lastPoint && (
        <circle
          cx={lastPoint[0]}
          cy={lastPoint[1]}
          r="2.5"
          fill={c.stroke}
          style={{ filter: `drop-shadow(0 0 6px ${c.stroke})` }}
        />
      )}
    </svg>
  );
}

// ─── CHECK COMPONENT ─────────────────────────────────────────────────────────
export interface CheckProps {
  on: boolean;
  onClick?: () => void;
  accent?: "indigo" | "cyan" | "amber";
}

export function Check({ on, onClick, accent = "cyan" }: CheckProps) {
  const accentColor = accent === "cyan" ? "on" : "";
  return (
    <div className={`check ${on ? "on" : ""}`} onClick={onClick}>
      {on && (
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#070710"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m5 12 4.5 4.5L20 6" />
        </svg>
      )}
    </div>
  );
}

// ─── COVER PLACEHOLDER ───────────────────────────────────────────────────────
export interface CoverPlaceholderProps {
  title: string;
  hue?: number;
  w?: string | number;
  h?: string | number;
  label?: string;
}

export function CoverPlaceholder({
  title,
  hue = 240,
  w = "100%",
  h = 160,
  label,
}: CoverPlaceholderProps) {
  const c1 = `hsl(${hue}, 55%, 38%)`;
  const c2 = `hsl(${(hue + 40) % 360}, 60%, 22%)`;

  return (
    <div
      className="rounded-2xl overflow-hidden border border-white/10 relative flex items-end p-3.5 flex-shrink-0"
      style={{
        width: w,
        height: h,
        background: `linear-gradient(135deg, ${c1}, ${c2})`,
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, rgba(255,255,255,0.04) 0, rgba(255,255,255,0.04) 1px, transparent 1px, transparent 8px)",
        }}
      />
      <div className="absolute top-3 left-3 w-6 h-6 rounded-md bg-black/30 border border-white/15 flex items-center justify-center text-white">
        <Icon name="book2" size={12} />
      </div>
      <div className="relative">
        <div className="mono text-[8px] text-white/50 uppercase tracking-widest">
          {label || "cover"}
        </div>
        <div className="font-display text-sm font-semibold text-white leading-tight mt-1 truncate max-w-full">
          {title}
        </div>
      </div>
    </div>
  );
}
