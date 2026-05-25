// Shared primitives: buttons, badges, ring charts, waveform, XP bar, etc.

const Button = ({ variant = 'primary', size = 'md', icon, iconRight, children, className = '', ...rest }) => {
  const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-btn transition-all duration-200 active:scale-[0.98] whitespace-nowrap';
  const sizes = { sm: 'px-3 h-9 text-sm', md: 'px-5 h-11 text-sm', lg: 'px-7 h-14 text-base' };
  const variants = {
    primary: 'text-white grad-bg shadow-glow-primary hover:shadow-[0_12px_36px_-8px_rgba(79,110,247,0.6)] hover:-translate-y-px',
    ghost: 'bg-surface text-text-1 border border-border hover:border-border-2 hover:bg-surface-2',
    outline: 'bg-transparent text-text-1 border border-border-2 hover:bg-surface-2',
    success: 'text-white bg-success shadow-glow-success hover:-translate-y-px',
    danger: 'text-white bg-error shadow-glow-error hover:-translate-y-px',
  };
  return (
    <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...rest}>
      {icon}
      {children}
      {iconRight}
    </button>
  );
};

const Card = ({ glass = false, className = '', children, ...rest }) => (
  <div className={`${glass ? 'glass' : 'bg-surface border border-border'} rounded-card ${className}`} {...rest}>
    {children}
  </div>
);

const Pill = ({ children, tone = 'primary', icon, className = '' }) => {
  const tones = {
    primary: 'bg-primary/10 text-primary border-primary/30',
    secondary: 'bg-secondary/10 text-secondary border-secondary/30',
    success: 'bg-success/10 text-success border-success/30',
    warning: 'bg-warning/10 text-warning border-warning/30',
    error: 'bg-error/10 text-error border-error/30',
    neutral: 'bg-surface-2 text-text-2 border-border-2',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 h-6 text-xs font-semibold rounded-full border ${tones[tone]} ${className}`}>
      {icon} {children}
    </span>
  );
};

// Gradient pill — used for level badges
const LevelPill = ({ rank, name, className = '' }) => (
  <span className={`inline-flex items-center gap-2 px-3 h-7 text-xs font-bold rounded-full grad-bg text-white shadow-glow-primary ${className}`}>
    <span>{rank}</span>
    <span className="opacity-90 font-semibold">{name}</span>
  </span>
);

// Ring / donut chart with gradient stroke. Optional center text.
const RingChart = ({ value = 75, size = 200, stroke = 14, label, sub, gradient = 'lg-ring', tone = 'primary' }) => {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  const colorMap = { primary: ['#4F6EF7', '#7C3AED'], success: ['#10B981', '#34D399'], warning: ['#F59E0B', '#FB7185'], error: ['#F43F5E', '#FB7185'] };
  const [a, b] = colorMap[tone] || colorMap.primary;
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id={gradient} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={a}/>
            <stop offset="100%" stopColor={b}/>
          </linearGradient>
        </defs>
        <circle cx={size/2} cy={size/2} r={r} stroke="#1E1E2E" strokeWidth={stroke} fill="none"/>
        <circle cx={size/2} cy={size/2} r={r} stroke={`url(#${gradient})`} strokeWidth={stroke} fill="none"
          strokeLinecap="round" strokeDasharray={c}
          style={{ '--circ': c, '--target': offset, strokeDashoffset: offset, filter: `drop-shadow(0 0 8px ${a}55)` }}
          className="ring-anim"/>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {label !== undefined && (
          <div className="font-mono font-bold leading-none" style={{ fontSize: size * 0.28 }}>{label}</div>
        )}
        {sub && <div className="text-text-2 text-xs mt-1.5 font-medium">{sub}</div>}
      </div>
    </div>
  );
};

// XP bar with glow + percentage label
const XPBar = ({ value, max, level, nextLevel, className = '' }) => {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-end justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-text-2 uppercase tracking-wider">Level {level}</span>
          <span className="text-text-3">→</span>
          <span className="text-xs font-semibold text-text-2 uppercase tracking-wider">Level {nextLevel}</span>
        </div>
        <span className="font-mono text-xs text-text-2"><span className="text-text-1 font-bold">{value.toLocaleString()}</span> / {max.toLocaleString()} XP</span>
      </div>
      <div className="relative h-2.5 rounded-full bg-surface-3 overflow-hidden border border-border">
        <div className="absolute inset-y-0 left-0 grad-bg rounded-full xp-glow" style={{ width: `${pct}%` }}/>
      </div>
    </div>
  );
};

// Streak counter — gold pill
const StreakBadge = ({ days, className = '' }) => (
  <div className={`inline-flex items-center gap-3 px-4 py-2 rounded-card bg-gradient-to-br from-warning/15 to-warning/5 border border-warning/30 shadow-glow-warning ${className}`}>
    <span className="text-2xl flame">🔥</span>
    <div>
      <div className="font-mono text-2xl font-bold text-warning leading-none">{days}</div>
      <div className="text-[10px] uppercase tracking-wider text-warning/80 font-semibold mt-0.5">hari berturut-turut</div>
    </div>
  </div>
);

// Waveform visualizer — animated bars (placeholder)
const Waveform = ({ bars = 56, active = true, height = 120 }) => {
  const heights = React.useMemo(() => Array.from({ length: bars }, () => 0.3 + Math.random() * 0.7), [bars]);
  const delays = React.useMemo(() => Array.from({ length: bars }, () => Math.random() * -1), [bars]);
  return (
    <div className="flex items-center justify-center gap-[3px]" style={{ height }}>
      {heights.map((h, i) => (
        <div key={i}
          className={`wave-bar rounded-full ${active ? '' : 'opacity-40'}`}
          style={{
            width: 4,
            height: `${h * 100}%`,
            background: `linear-gradient(180deg, #4F6EF7 0%, #7C3AED 100%)`,
            animationDelay: `${delays[i]}s`,
            animationDuration: `${0.6 + (i % 5) * 0.12}s`,
            animationPlayState: active ? 'running' : 'paused',
            boxShadow: active ? '0 0 6px rgba(79,110,247,0.6)' : 'none',
          }}
        />
      ))}
    </div>
  );
};

// Avatar (initials)
const Avatar = ({ name, size = 32, className = '', src, ring = false, color }) => {
  const initials = (name || '?').split(' ').slice(0, 2).map(p => p[0]).join('').toUpperCase();
  const palette = ['#4F6EF7', '#7C3AED', '#10B981', '#F59E0B', '#F43F5E', '#06B6D4', '#EC4899'];
  const bg = color || palette[(name || '').charCodeAt(0) % palette.length];
  return (
    <div
      className={`inline-flex items-center justify-center font-bold text-white rounded-full ${ring ? 'ring-2 ring-bg' : ''} ${className}`}
      style={{ width: size, height: size, background: bg, fontSize: size * 0.4 }}
    >{initials}</div>
  );
};

// Tab pill row
const TabRow = ({ tabs, active, onChange, className = '' }) => (
  <div className={`inline-flex items-center gap-1 p-1 rounded-card bg-surface border border-border ${className}`}>
    {tabs.map(t => (
      <button key={t.id} onClick={() => onChange(t.id)}
        className={`tab-btn px-4 h-9 rounded-btn text-sm font-semibold transition-all border border-transparent ${active === t.id ? 'tab-active' : 'text-text-2'}`}>
        {t.label}
      </button>
    ))}
  </div>
);

// Sparkline (small, used in dashboard)
const Sparkline = ({ data, width = 200, height = 48, stroke = '#4F6EF7' }) => {
  const min = Math.min(...data), max = Math.max(...data);
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / (max - min || 1)) * (height - 6) - 3;
    return [x, y];
  });
  const d = pts.map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`)).join(' ');
  const areaD = `${d} L${width},${height} L0,${height} Z`;
  return (
    <svg width={width} height={height}>
      <defs>
        <linearGradient id="sl-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.35"/>
          <stop offset="100%" stopColor={stroke} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <path d={areaD} fill="url(#sl-grad)"/>
      <path d={d} fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
};

Object.assign(window, { Button, Card, Pill, LevelPill, RingChart, XPBar, StreakBadge, Waveform, Avatar, TabRow, Sparkline });
