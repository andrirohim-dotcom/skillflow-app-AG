// Cartoon-edition primitives: sticker buttons, ring chart, waveform, badges, icons.

const Icon = ({ children, size = 20, stroke = 2.4, className = '', ...rest }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"
       className={className} {...rest}>{children}</svg>
);
const IconMic       = (p) => <Icon {...p}><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10v2a7 7 0 0 0 14 0v-2"/><path d="M12 19v3"/></Icon>;
const IconArrowR    = (p) => <Icon {...p}><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></Icon>;
const IconCheck     = (p) => <Icon {...p}><path d="M20 6 9 17l-5-5"/></Icon>;
const IconStar      = (p) => <Icon {...p}><path d="M12 2 15 9l7 .8-5.4 4.7L18.4 22 12 18.3 5.6 22l1.8-7.5L2 9.8 9 9z"/></Icon>;
const IconCal       = (p) => <Icon {...p}><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="3"/><path d="M3 10h18"/></Icon>;
const IconClock     = (p) => <Icon {...p}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></Icon>;
const IconBolt      = (p) => <Icon {...p}><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8Z"/></Icon>;
const IconStop      = (p) => <Icon {...p}><rect width="12" height="12" x="6" y="6" rx="2"/></Icon>;
const IconPause     = (p) => <Icon {...p}><rect x="6" y="4" width="4" height="16" rx="1.5"/><rect x="14" y="4" width="4" height="16" rx="1.5"/></Icon>;
const IconClose     = (p) => <Icon {...p}><path d="M18 6 6 18"/><path d="m6 6 12 12"/></Icon>;
const IconMenu      = (p) => <Icon {...p}><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="18" y2="18"/></Icon>;
const IconLock      = (p) => <Icon {...p}><rect width="18" height="11" x="3" y="11" rx="2.5"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></Icon>;
const IconBook      = (p) => <Icon {...p}><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></Icon>;
const IconLamp      = (p) => <Icon {...p}><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></Icon>;
const IconTarget    = (p) => <Icon {...p}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></Icon>;
const IconTrophy    = (p) => <Icon {...p}><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></Icon>;
const IconChart     = (p) => <Icon {...p}><path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="m7 14 4-4 4 4 5-5"/></Icon>;

// Cartoon mascot logo: chunky speech bubble with mic
const Mascot = ({ size = 36 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <rect x="3" y="4" width="42" height="34" rx="9" fill="#FFD93D" stroke="#1F1A2E" strokeWidth="2.4"/>
    <path d="M16 38 L14 45 L22 38" fill="#FFD93D" stroke="#1F1A2E" strokeWidth="2.4" strokeLinejoin="round"/>
    <rect x="20" y="14" width="8" height="13" rx="4" fill="#FFFFFF" stroke="#1F1A2E" strokeWidth="2.2"/>
    <path d="M16 23v1a8 8 0 0 0 16 0v-1" stroke="#1F1A2E" strokeWidth="2.2" strokeLinecap="round"/>
    <line x1="24" y1="32" x2="24" y2="35" stroke="#1F1A2E" strokeWidth="2.2" strokeLinecap="round"/>
    <circle cx="13" cy="13" r="1.6" fill="#1F1A2E"/>
  </svg>
);

// Sticker badge (small swirly)
const Sticker = ({ children, color = '#FFD93D', rotate = -6, size = 'md', className = '' }) => {
  const sizes = { sm: 'px-2.5 h-7 text-[11px]', md: 'px-3 h-8 text-xs', lg: 'px-4 h-10 text-sm' };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-extrabold border-[2px] border-line ${sizes[size]} ${className}`}
      style={{ background: color, transform: `rotate(${rotate}deg)`, boxShadow: '2px 2px 0 0 #1F1A2E' }}>
      {children}
    </span>
  );
};

// Pill (no rotation)
const Pill = ({ children, color = '#FFE9A8', icon, className = '' }) => (
  <span className={`inline-flex items-center gap-1.5 rounded-full font-bold border-2 border-line px-3 h-7 text-[11px] ${className}`}
    style={{ background: color }}>
    {icon} {children}
  </span>
);

// Chunky button
const Button = ({ variant = 'coral', size = 'md', icon, iconRight, children, className = '', ...rest }) => {
  const base = 'inline-flex items-center justify-center gap-2 font-extrabold rounded-2xl border-2 border-line transition-all duration-150 press whitespace-nowrap';
  const sizes = { sm: 'px-4 h-10 text-sm', md: 'px-5 h-12 text-sm', lg: 'px-7 h-14 text-base' };
  const variants = {
    coral: 'bg-coral text-white shadow-pop lift-pop',
    sun:   'bg-sun text-ink shadow-pop lift-pop',
    mint:  'bg-mint text-white shadow-pop lift-pop',
    grape: 'bg-grape text-white shadow-pop lift-pop',
    paper: 'bg-paper text-ink shadow-pop lift-pop',
    ghost: 'bg-cream text-ink hover:bg-paper',
  };
  return (
    <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...rest}>
      {icon}{children}{iconRight}
    </button>
  );
};

const Card = ({ variant = 'paper', className = '', children, ...rest }) => {
  const map = {
    paper: 'sticker-lg',
    flat: 'sticker-flat',
    sun: 'sticker-lg !bg-sun',
    mint: 'sticker-lg !bg-mint',
    coral: 'sticker-lg !bg-coral',
    rose: 'sticker-lg !bg-rose',
    grape: 'sticker-lg !bg-grape',
    peach: 'sticker-lg !bg-peach',
  };
  return <div className={`${map[variant]} ${className}`} {...rest}>{children}</div>;
};

// Ring chart (cartoon — thick stroke, dark outline)
const Ring = ({ value = 75, size = 180, stroke = 16, color = '#FF6B6B', label, sub }) => {
  const r = (size - stroke - 4) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      {/* dark outline ring */}
      <svg width={size} height={size} className="absolute inset-0 -rotate-90">
        <circle cx={size/2} cy={size/2} r={r + 2} stroke="#1F1A2E" strokeWidth={stroke + 4} fill="none"/>
        <circle cx={size/2} cy={size/2} r={r} stroke="#FFF6E5" strokeWidth={stroke} fill="none"/>
        <circle cx={size/2} cy={size/2} r={r} stroke={color} strokeWidth={stroke} fill="none"
          strokeLinecap="round" strokeDasharray={c}
          style={{ '--circ': c, '--target': offset, strokeDashoffset: offset }}
          className="ring-anim2"/>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {label !== undefined && <div className="font-display font-black leading-none" style={{ fontSize: size * 0.32 }}>{label}</div>}
        {sub && <div className="text-ink-2 text-xs mt-1.5 font-bold uppercase tracking-wider">{sub}</div>}
      </div>
    </div>
  );
};

// XP bar — chunky
const XPBar = ({ value, max, level, nextLevel, className = '' }) => {
  const pct = Math.min(100, (value/max) * 100);
  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-end justify-between mb-2">
        <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider">
          <span>LV {level}</span><span className="text-ink-3">→</span><span>LV {nextLevel}</span>
        </div>
        <span className="font-mono text-xs"><span className="font-bold">{value.toLocaleString()}</span> / {max.toLocaleString()} XP</span>
      </div>
      <div className="relative h-4 rounded-full bg-paper border-2 border-line overflow-hidden">
        <div className="absolute inset-y-0 left-0 bg-mint" style={{ width: `${pct}%`, borderRight: '2px solid #1F1A2E' }}/>
        {/* stripes overlay */}
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(45deg, rgba(31,26,46,0.10) 0 6px, transparent 6px 12px)', width: `${pct}%` }}/>
      </div>
    </div>
  );
};

// Streak badge
const StreakBadge = ({ days, className = '' }) => (
  <div className={`inline-flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-sun border-2 border-line shadow-pop ${className}`}>
    <span className="text-3xl bouncy">🔥</span>
    <div>
      <div className="font-display text-3xl font-black leading-none">{days}</div>
      <div className="text-[10px] uppercase tracking-wider font-extrabold mt-0.5">hari beruntun</div>
    </div>
  </div>
);

// Waveform (cartoon: chunky bars, no glow)
const Waveform = ({ bars = 48, active = true, height = 110 }) => {
  const heights = React.useMemo(() => Array.from({ length: bars }, () => 0.25 + Math.random() * 0.75), [bars]);
  const colors = ['#FF6B6B', '#FFD93D', '#6BCB77', '#B58CFF', '#5DADEC'];
  return (
    <div className="flex items-center justify-center gap-[3px]" style={{ height }}>
      {heights.map((h, i) => (
        <div key={i}
          className={`cwave-bar rounded-full border-2 border-line ${active?'':'opacity-50'}`}
          style={{
            width: 6, height: `${h * 100}%`,
            background: colors[i % colors.length],
            animationDelay: `${(i % 7) * -0.13}s`,
            animationDuration: `${0.7 + (i % 4) * 0.16}s`,
            animationPlayState: active ? 'running' : 'paused',
          }}
        />
      ))}
    </div>
  );
};

const Avatar = ({ name, size = 36, color, className = '' }) => {
  const initials = (name || '?').split(' ').slice(0,2).map(p => p[0]).join('').toUpperCase();
  const palette = ['#FF6B6B', '#FFD93D', '#6BCB77', '#B58CFF', '#5DADEC', '#FF8FA3'];
  const bg = color || palette[(name || '').charCodeAt(0) % palette.length];
  return (
    <div className={`inline-flex items-center justify-center font-black text-ink rounded-full border-2 border-line ${className}`}
      style={{ width: size, height: size, background: bg, fontSize: size * 0.36 }}>{initials}</div>
  );
};

// Sparkly bg star (geometric)
const Spark = ({ size = 16, color = '#FFD93D', className = '', style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} style={style}>
    <path d="M12 2 L13.5 10.5 L22 12 L13.5 13.5 L12 22 L10.5 13.5 L2 12 L10.5 10.5 Z" fill={color} stroke="#1F1A2E" strokeWidth="1.6" strokeLinejoin="round"/>
  </svg>
);

Object.assign(window, {
  Icon, IconMic, IconArrowR, IconCheck, IconStar, IconCal, IconClock, IconBolt, IconStop, IconPause, IconClose, IconMenu, IconLock, IconBook, IconLamp, IconTarget, IconTrophy, IconChart,
  Mascot, Sticker, Pill, Button, Card, Ring, XPBar, StreakBadge, Waveform, Avatar, Spark
});
