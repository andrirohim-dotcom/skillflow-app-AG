// Primitives — sticker cards, chunky progress, doodle covers

const Sticker = ({ children, className = "", color = "white", size = "md", style, ...rest }) => {
  const bg = {
    white:"bg-paper", cream:"bg-cream", cream2:"bg-cream2",
    coral:"bg-coral text-white", mint:"bg-mint", sun:"bg-sun",
    sky:"bg-sky text-white", grape:"bg-grape", peach:"bg-peach",
    rose:"bg-rose", ink:"bg-ink text-cream",
    lilac:"bg-lilac", minty:"bg-minty", peachy:"bg-peachy", ocean:"bg-ocean",
  }[color] || "bg-paper";
  const sz = size === "lg" ? "sticker-lg" : size === "flat" ? "sticker-flat" : "sticker";
  return (
    <div className={`${sz} lift-pop ${bg} ${className}`} style={style} {...rest}>
      {children}
    </div>
  );
};

const ProgressBar = ({ value, max = 100, accent = "coral", height = 12, label, sub }) => {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const fill = {
    coral: "bg-coral", mint: "bg-mint", sky:"bg-sky", grape:"bg-grape", sun:"bg-sun", peach:"bg-peach", rose:"bg-rose",
  }[accent] || "bg-coral";
  return (
    <div className="w-full">
      {(label || sub) && (
        <div className="flex justify-between items-baseline mb-1.5">
          {label && <div className="text-[12px] font-bold text-ink">{label}</div>}
          {sub && <div className="font-mono text-[10px] text-ink-2">{sub}</div>}
        </div>
      )}
      <div className="relative w-full rounded-full border-[2px] border-ink bg-cream overflow-hidden" style={{ height }}>
        <div className={`h-full ${fill} relative`} style={{ width: `${pct}%`, transition: "width .8s cubic-bezier(.2,.7,.2,1)", borderRight: "2px solid #1F1A2E", borderRadius: "0 999px 999px 0" }}>
          {/* shine */}
          <div className="absolute inset-y-0 left-0 right-0 overflow-hidden">
            <div className="absolute top-0 left-0 h-full" style={{ width: "30%", background: "linear-gradient(90deg, transparent, rgba(255,255,255,.6), transparent)", animation: "shineX 2.4s ease-in-out infinite" }}/>
          </div>
          {/* sparkle */}
          {pct > 10 && pct < 100 && (
            <div className="absolute -top-[3px] right-[-1px] text-[12px] leading-none" style={{ textShadow: "0 0 0 #1F1A2E" }}>✨</div>
          )}
        </div>
      </div>
    </div>
  );
};

// KPI stat card
const Stat = ({ icon, label, value, unit, color = "coral", trend, emoji }) => {
  const bg  = { coral:"bg-peachy", mint:"bg-minty", sky:"bg-ocean", grape:"bg-lilac", sun:"bg-cream2", rose:"bg-peachy" }[color];
  const dot = { coral:"bg-coral", mint:"bg-mint", sky:"bg-sky", grape:"bg-grape", sun:"bg-sun", rose:"bg-rose" }[color];
  return (
    <div className={`sticker lift-pop ${bg} p-4 relative overflow-hidden`}>
      {/* corner doodle */}
      <div className="absolute -top-2 -right-2 text-2xl floaty">{emoji || "✨"}</div>
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-9 h-9 rounded-xl border-[2.5px] border-ink ${dot} flex items-center justify-center text-ink`} style={{ boxShadow: "2px 2px 0 #1F1A2E" }}>
          <Icon name={icon} size={17}/>
        </div>
        <div className="eyebrow">{label}</div>
      </div>
      <div className="flex items-baseline gap-1.5">
        <div className="font-display font-black text-ink text-[34px] leading-none">{value}</div>
        {unit && <div className="font-mono text-[11px] text-ink-2">{unit}</div>}
      </div>
      {trend != null && (
        <div className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold" style={{ color: trend > 0 ? "#3FA94F" : "#E8434E" }}>
          {trend > 0 ? "↗" : "↘"} {Math.abs(trend)}% this week
        </div>
      )}
    </div>
  );
};

// Avatar — circular with thick border + level badge
const Avatar = ({ size = 44, level = 12, glow = true }) => (
  <div className="relative shrink-0" style={{ width: size, height: size }}>
    <div className="rounded-full border-[2.5px] border-ink overflow-hidden bg-sun" style={{ width: size, height: size, boxShadow: "3px 3px 0 #1F1A2E" }}>
      <svg width={size} height={size} viewBox="0 0 40 40">
        <defs>
          <linearGradient id="av-c" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#FFD93D"/><stop offset="1" stopColor="#FFB57A"/>
          </linearGradient>
        </defs>
        <rect width="40" height="40" fill="url(#av-c)"/>
        {/* face */}
        <circle cx="14.5" cy="18" r="1.4" fill="#1F1A2E"/>
        <circle cx="25.5" cy="18" r="1.4" fill="#1F1A2E"/>
        <path d="M14 25 q6 4 12 0" stroke="#1F1A2E" strokeWidth="1.6" fill="none" strokeLinecap="round"/>
        {/* cheek */}
        <circle cx="12" cy="22.5" r="1.5" fill="#FF8FA3" opacity=".7"/>
        <circle cx="28" cy="22.5" r="1.5" fill="#FF8FA3" opacity=".7"/>
      </svg>
    </div>
    {glow && (
      <div className="absolute -bottom-1 -right-2 px-1.5 py-0.5 rounded-full bg-coral text-white font-mono text-[9px] font-extrabold border-[2px] border-ink" style={{ boxShadow: "1.5px 1.5px 0 #1F1A2E" }}>
        Lv{level}
      </div>
    )}
  </div>
);

// Sparkline as cartoon doodle
const Sparkline = ({ data, accent = "coral", height = 36, width = 120 }) => {
  const max = Math.max(...data), min = Math.min(...data), range = max - min || 1;
  const pts = data.map((v, i) => [(i / (data.length - 1)) * width, height - ((v - min) / range) * (height - 6) - 3]);
  const d = pts.map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`)).join(" ");
  const c = { coral:"#FF6B6B", mint:"#3FA94F", sky:"#2E84C8", grape:"#8C5BFF", sun:"#F2BE12", rose:"#FF8FA3" }[accent] || "#FF6B6B";
  return (
    <svg width={width} height={height} style={{ overflow: "visible" }}>
      <path d={d} fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      {pts.map(([x, y], i) => i === pts.length - 1 && (
        <g key={i}>
          <circle cx={x} cy={y} r="5" fill="#FFF" stroke="#1F1A2E" strokeWidth="2"/>
          <circle cx={x} cy={y} r="2" fill={c}/>
        </g>
      ))}
    </svg>
  );
};

// Checkbox
const Check = ({ on, onClick }) => (
  <div className={`check ${on ? "on" : ""}`} onClick={onClick}>
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1F1A2E" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 4.5 4.5L20 6"/></svg>
  </div>
);

// Book/source cover — doodle style with sticker label
const CoverPlaceholder = ({ title, hue = 0, w = "100%", h = 160, label = "BOOK" }) => {
  // Cycle through palette indices instead of hue
  const palettes = [
    { bg:"#FFE3E3", stripe:"#FF6B6B", accent:"#FFD93D" }, // coral
    { bg:"#E6F7E9", stripe:"#6BCB77", accent:"#FFD93D" }, // mint
    { bg:"#DDF0FF", stripe:"#5DADEC", accent:"#FF6B6B" }, // sky
    { bg:"#F2EAFF", stripe:"#B58CFF", accent:"#FFD93D" }, // grape
    { bg:"#FFF3B8", stripe:"#FFD93D", accent:"#FF8FA3" }, // sun
    { bg:"#FFE8D6", stripe:"#FFB57A", accent:"#FF6B6B" }, // peach
  ];
  const p = palettes[hue % palettes.length];
  return (
    <div className="relative overflow-hidden border-[2.5px] border-ink rounded-2xl shrink-0" style={{ width: w, height: h, background: p.bg, boxShadow: "3px 3px 0 #1F1A2E" }}>
      {/* big diagonal stripe */}
      <div className="absolute" style={{ left: -10, top: -10, width: "70%", height: "70%", background: p.stripe, transform: "rotate(-12deg)", borderBottomRightRadius: "60%", border: "2px solid #1F1A2E" }}/>
      {/* dot */}
      <div className="absolute" style={{ right: 18, bottom: 22, width: 28, height: 28, borderRadius: "50%", background: p.accent, border: "2px solid #1F1A2E" }}/>
      {/* sticker label */}
      <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-paper border-[2px] border-ink font-mono text-[9px] font-bold uppercase tracking-wider" style={{ boxShadow: "1.5px 1.5px 0 #1F1A2E" }}>
        {label}
      </div>
      {/* title text overlay */}
      {title && (
        <div className="absolute bottom-2 left-2 right-2 px-2 py-1 rounded-md bg-paper/90 border-[2px] border-ink font-display font-extrabold leading-tight text-ink" style={{ fontSize: h > 120 ? 14 : 11, boxShadow: "2px 2px 0 #1F1A2E", textWrap: "balance" }}>
          {title}
        </div>
      )}
    </div>
  );
};

// SectionTitle
const SectionTitle = ({ eyebrow, title, emoji, action, marker = "sun" }) => (
  <div className="flex items-end justify-between mb-4 gap-3 flex-wrap">
    <div>
      {eyebrow && <div className="eyebrow mb-1">{eyebrow}</div>}
      <h2 className="font-display font-extrabold text-[22px] leading-tight text-ink flex items-center gap-2">
        {emoji && <span className="wiggle">{emoji}</span>}
        <span className={`marker-${marker}`}>{title}</span>
      </h2>
    </div>
    {action}
  </div>
);

// Star shape used in skill nodes
const StarShape = ({ cx, cy, r, fill, stroke = "#1F1A2E", strokeWidth = 2.5 }) => {
  const pts = [];
  const inner = r * 0.45;
  for (let i = 0; i < 10; i++) {
    const a = (Math.PI / 5) * i - Math.PI / 2;
    const rad = i % 2 === 0 ? r : inner;
    pts.push(`${cx + Math.cos(a) * rad},${cy + Math.sin(a) * rad}`);
  }
  return <polygon points={pts.join(" ")} fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinejoin="round"/>;
};

Object.assign(window, { Sticker, ProgressBar, Stat, Avatar, Sparkline, Check, CoverPlaceholder, SectionTitle, StarShape });
