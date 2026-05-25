// Shared primitives

const Card = ({ children, className = "", style, accent, ...rest }) => {
  const ringClass = accent === "indigo" ? "ring-indigo" : accent === "cyan" ? "ring-cyan" : accent === "amber" ? "ring-amber" : "";
  return (
    <div className={`glass lift ${ringClass} ${className}`} style={style} {...rest}>
      {children}
    </div>
  );
};

const SectionTitle = ({ eyebrow, title, action, accent = "indigo" }) => {
  const color = accent === "cyan" ? "var(--cyan-2)" : accent === "amber" ? "var(--amber-2)" : "var(--indigo-2)";
  return (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 16, gap: 16 }}>
      <div>
        {eyebrow && (
          <div className="mono" style={{ fontSize: 11, color, opacity: .9, textTransform: "uppercase", letterSpacing: ".15em", marginBottom: 6, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 14, height: 1, background: color, display: "inline-block" }}></span>
            {eyebrow}
          </div>
        )}
        <h2 style={{ fontSize: 22, fontWeight: 600 }}>{title}</h2>
      </div>
      {action}
    </div>
  );
};

// progress bar with glow tint
const ProgressBar = ({ value, max = 100, accent = "indigo", height = 6, label, sub }) => {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const grad = accent === "cyan"
    ? "linear-gradient(90deg, #14b8a6, #22d3ee)"
    : accent === "amber"
    ? "linear-gradient(90deg, #f59e0b, #fbbf24)"
    : "linear-gradient(90deg, #6366f1, #a78bfa)";
  const glow = accent === "cyan"
    ? "0 0 14px rgba(20,184,166,.45)"
    : accent === "amber"
    ? "0 0 14px rgba(245,158,11,.45)"
    : "0 0 14px rgba(129,140,248,.45)";
  return (
    <div style={{ width: "100%" }}>
      {(label || sub) && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
          <div style={{ fontSize: 12, color: "var(--text-dim)", letterSpacing: ".02em" }}>{label}</div>
          <div className="mono" style={{ fontSize: 11, color: "var(--text-mute)" }}>{sub}</div>
        </div>
      )}
      <div style={{ height, background: "rgba(255,255,255,.05)", borderRadius: 99, overflow: "hidden", border: "1px solid rgba(255,255,255,.06)" }}>
        <div style={{ height: "100%", width: `${pct}%`, borderRadius: 99, background: grad, boxShadow: glow, transition: "width .8s cubic-bezier(.2,.7,.2,1)" }} />
      </div>
    </div>
  );
};

// Stat block: small KPI tile
const Stat = ({ icon, label, value, unit, accent = "indigo", trend }) => {
  const color = accent === "cyan" ? "var(--cyan-2)" : accent === "amber" ? "var(--amber-2)" : "var(--indigo-2)";
  const bg = accent === "cyan" ? "rgba(20,184,166,.10)" : accent === "amber" ? "rgba(245,158,11,.10)" : "rgba(99,102,241,.12)";
  return (
    <div className="glass-soft" style={{ padding: 18, display: "flex", flexDirection: "column", gap: 12, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(120px 80px at 90% 10%, ${bg}, transparent 70%)`, pointerEvents: "none" }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ width: 32, height: 32, borderRadius: 10, background: bg, color, display: "grid", placeItems: "center", border: `1px solid ${color}33` }}>
          <Icon name={icon} size={16} />
        </div>
        {trend && (
          <div className="mono" style={{ fontSize: 10, color: trend > 0 ? "var(--green)" : "var(--rose)" }}>
            {trend > 0 ? "▲" : "▼"} {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div>
        <div className="mono" style={{ fontSize: 11, color: "var(--text-mute)", textTransform: "uppercase", letterSpacing: ".12em", marginBottom: 4 }}>{label}</div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
          <div style={{ fontFamily: "'Outfit'", fontSize: 32, fontWeight: 600, lineHeight: 1, color: "var(--text)" }}>{value}</div>
          {unit && <div className="mono" style={{ fontSize: 12, color: "var(--text-mute)" }}>{unit}</div>}
        </div>
      </div>
    </div>
  );
};

const Avatar = ({ size = 36, level = 12, glow = true }) => (
  <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
    <svg width={size} height={size} viewBox="0 0 40 40">
      <defs>
        <linearGradient id="av-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#6366f1"/>
          <stop offset=".5" stopColor="#a78bfa"/>
          <stop offset="1" stopColor="#22d3ee"/>
        </linearGradient>
        <radialGradient id="av-i" cx=".5" cy=".4">
          <stop offset="0" stopColor="#1a1a2e" stopOpacity="0"/>
          <stop offset="1" stopColor="#0a0a16"/>
        </radialGradient>
      </defs>
      <circle cx="20" cy="20" r="19" fill="url(#av-g)"/>
      <circle cx="20" cy="20" r="16.5" fill="#0c0c1a"/>
      <circle cx="20" cy="20" r="16.5" fill="url(#av-i)"/>
      <text x="20" y="24.5" textAnchor="middle" fontFamily="Outfit" fontWeight="600" fontSize="13" fill="#e7e7f3">AY</text>
    </svg>
    {glow && (
      <div style={{
        position: "absolute", bottom: -2, right: -4,
        background: "linear-gradient(135deg, #f59e0b, #fbbf24)",
        color: "#1a1206", fontSize: 9, fontWeight: 700,
        padding: "2px 6px", borderRadius: 99, fontFamily: "Outfit",
        border: "2px solid #0a0a16",
        boxShadow: "0 0 10px rgba(245,158,11,.7)"
      }}>{level}</div>
    )}
  </div>
);

// Sparkline SVG
const Sparkline = ({ data, accent = "indigo", height = 36, width = 120 }) => {
  const max = Math.max(...data), min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return [x, y];
  });
  const d = pts.map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`)).join(" ");
  const area = `${d} L${width},${height} L0,${height} Z`;
  const colors = {
    indigo: { stroke: "#a78bfa", fill: "url(#sp-i)" },
    cyan:   { stroke: "#22d3ee", fill: "url(#sp-c)" },
    amber:  { stroke: "#fbbf24", fill: "url(#sp-a)" },
  };
  const c = colors[accent];
  return (
    <svg width={width} height={height} style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id="sp-i" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#a78bfa" stopOpacity=".35"/><stop offset="1" stopColor="#a78bfa" stopOpacity="0"/></linearGradient>
        <linearGradient id="sp-c" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#22d3ee" stopOpacity=".35"/><stop offset="1" stopColor="#22d3ee" stopOpacity="0"/></linearGradient>
        <linearGradient id="sp-a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fbbf24" stopOpacity=".35"/><stop offset="1" stopColor="#fbbf24" stopOpacity="0"/></linearGradient>
      </defs>
      <path d={area} fill={c.fill} />
      <path d={d} fill="none" stroke={c.stroke} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 4px ${c.stroke})` }}/>
      {pts.slice(-1).map(([x, y], i) => <circle key={i} cx={x} cy={y} r="3" fill={c.stroke} style={{ filter: `drop-shadow(0 0 6px ${c.stroke})` }}/>)}
    </svg>
  );
};

const Check = ({ on, onClick, accent = "cyan" }) => (
  <div className={`check ${on ? "on" : ""}`} onClick={onClick}>
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0a0a16" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 4.5 4.5L20 6"/></svg>
  </div>
);

// Image placeholder for book cover etc
const CoverPlaceholder = ({ title, hue = 240, w = "100%", h = 160, label }) => {
  const c1 = `hsl(${hue}, 55%, 38%)`;
  const c2 = `hsl(${(hue + 40) % 360}, 60%, 22%)`;
  return (
    <div style={{
      width: w, height: h, borderRadius: 14, overflow: "hidden",
      background: `linear-gradient(135deg, ${c1}, ${c2})`,
      border: "1px solid rgba(255,255,255,.08)",
      position: "relative", display: "flex", alignItems: "flex-end", padding: 14,
      flexShrink: 0,
    }}>
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "repeating-linear-gradient(45deg, rgba(255,255,255,.04) 0, rgba(255,255,255,.04) 1px, transparent 1px, transparent 8px)",
      }}/>
      <div style={{
        position: "absolute", top: 12, left: 12,
        width: 24, height: 24, borderRadius: 6,
        background: "rgba(0,0,0,.3)", border: "1px solid rgba(255,255,255,.15)",
        display: "grid", placeItems: "center", color: "#fff"
      }}>
        <Icon name="book2" size={12}/>
      </div>
      <div style={{ position: "relative" }}>
        <div className="mono" style={{ fontSize: 9, color: "rgba(255,255,255,.5)", textTransform: "uppercase", letterSpacing: ".15em" }}>{label || "cover"}</div>
        <div style={{ fontFamily: "Outfit", fontSize: 14, fontWeight: 600, color: "#fff", lineHeight: 1.15, marginTop: 4 }}>{title}</div>
      </div>
    </div>
  );
};

Object.assign(window, { Card, SectionTitle, ProgressBar, Stat, Avatar, Sparkline, Check, CoverPlaceholder });
