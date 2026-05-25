// RPG Character Sheet

const ARCHETYPES = [
  { id: "poly", emoji: "🔮", name: "Polymath",   tag: "Balanced explorer of many domains",  c: "indigo", active: true },
  { id: "deep", emoji: "🔱", name: "Deep Diver", tag: "Goes deep on a few hand-picked seas", c: "cyan" },
  { id: "expl", emoji: "🧭", name: "Explorer",   tag: "Breadth-first, charting new ground",  c: "amber" },
  { id: "stra", emoji: "⚔️", name: "Strategist", tag: "Action-biased synthesizer",            c: "amber" },
];

const TROPHIES = [
  { tier: "platinum", name: "Centurion",       desc: "100-day streak unbroken",              icon: "flame",   date: "Apr 2026", count: 1 },
  { tier: "gold",     name: "Library Walker",  desc: "Finished 25 books in a year",          icon: "book2",   date: "Mar 2026", count: 1 },
  { tier: "gold",     name: "Insight Mason",   desc: "Captured 500 distinct insights",       icon: "lightbulb", date: "Feb 2026", count: 1 },
  { tier: "silver",   name: "Reflection Adept",desc: "Wrote 50 reflections > 200 words",     icon: "pen",     date: "Jan 2026", count: 2 },
  { tier: "silver",   name: "Streak Keeper",   desc: "21-day streak completed 4×",           icon: "flame",   date: "Dec 2025", count: 4 },
  { tier: "bronze",   name: "First Steps",     desc: "Onboarded into SkillFlow",             icon: "compass", date: "Nov 2025", count: 1 },
  { tier: "bronze",   name: "Crosspollinator", desc: "Linked 3 sources to one skill",        icon: "tree",    date: "Nov 2025", count: 3 },
  { tier: "bronze",   name: "Audio Voyager",   desc: "Logged 50 podcast hours",              icon: "podcast", date: "Dec 2025", count: 1 },
];

const TIER_STYLE = {
  platinum: { c1: "#e5e7eb", c2: "#94a3b8", text: "#fff", glow: "rgba(226,232,240,.55)", chip: "Platinum" },
  gold:     { c1: "#fde68a", c2: "#d97706", text: "#1a1206", glow: "rgba(245,158,11,.6)",  chip: "Gold" },
  silver:   { c1: "#e2e8f0", c2: "#64748b", text: "#1a1a2e", glow: "rgba(148,163,184,.55)", chip: "Silver" },
  bronze:   { c1: "#fcd9a3", c2: "#9a5712", text: "#1a0d04", glow: "rgba(180,113,46,.5)",   chip: "Bronze" },
};

const Trophy = ({ t }) => {
  const ts = TIER_STYLE[t.tier];
  return (
    <div className="lift glass-soft" style={{ padding: 18, textAlign: "center", position: "relative", overflow: "hidden", borderRadius: 18 }}>
      <div style={{
        position: "absolute", inset: 0, opacity: .25,
        background: `radial-gradient(180px 120px at 50% -10%, ${ts.glow}, transparent 65%)`
      }}/>
      <div style={{ position: "relative", margin: "0 auto 12px", width: 64, height: 64, display: "grid", placeItems: "center" }}>
        <svg width="64" height="64" viewBox="0 0 64 64" style={{ filter: `drop-shadow(0 0 10px ${ts.glow})` }}>
          <defs>
            <linearGradient id={`tg-${t.name}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={ts.c1}/><stop offset="1" stopColor={ts.c2}/>
            </linearGradient>
            <linearGradient id={`tg2-${t.name}`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor={ts.c2} stopOpacity=".6"/><stop offset=".5" stopColor={ts.c1}/><stop offset="1" stopColor={ts.c2} stopOpacity=".6"/>
            </linearGradient>
          </defs>
          {/* shield */}
          <path d="M32 4 L52 12 V32 C52 46 32 60 32 60 C32 60 12 46 12 32 V12 Z" fill={`url(#tg-${t.name})`} stroke={ts.c1} strokeWidth="1" opacity=".95"/>
          <path d="M32 8 L48 14 V31 C48 42 32 54 32 54 C32 54 16 42 16 31 V14 Z" fill="rgba(0,0,0,.25)"/>
          <path d="M32 8 L48 14 V31 C48 42 32 54 32 54 C32 54 16 42 16 31 V14 Z" fill={`url(#tg2-${t.name})`} opacity=".6"/>
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", color: ts.text }}>
          <Icon name={t.icon} size={22} strokeWidth={2}/>
        </div>
        {t.count > 1 && (
          <div style={{ position: "absolute", top: -2, right: -4, padding: "1px 6px", borderRadius: 99, background: "var(--bg-2)", border: `1px solid ${ts.c1}`, fontSize: 10, fontWeight: 700, color: ts.c1, fontFamily: "Outfit" }}>×{t.count}</div>
        )}
      </div>
      <div style={{ fontFamily: "Outfit", fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{t.name}</div>
      <div style={{ fontSize: 11, color: "var(--text-dim)", lineHeight: 1.4, marginBottom: 10, minHeight: 30 }}>{t.desc}</div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <span style={{ fontSize: 9, fontWeight: 600, color: ts.c1, textTransform: "uppercase", letterSpacing: ".12em", padding: "2px 7px", borderRadius: 99, border: `1px solid ${ts.c1}55`, background: `linear-gradient(180deg, ${ts.c1}15, transparent)` }} className="mono">{ts.chip}</span>
        <span className="mono" style={{ fontSize: 10, color: "var(--text-mute)" }}>{t.date}</span>
      </div>
    </div>
  );
};

const ArchetypeBadge = () => (
  <div style={{ position: "relative", padding: "24px 0" }}>
    <svg viewBox="0 0 200 200" style={{ width: 200, height: 200 }}>
      <defs>
        <radialGradient id="ab-glow" cx="50%" cy="50%">
          <stop offset="0" stopColor="rgba(167,139,250,.5)"/>
          <stop offset="1" stopColor="rgba(167,139,250,0)"/>
        </radialGradient>
        <linearGradient id="ab-rim" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#6366f1"/>
          <stop offset=".5" stopColor="#a78bfa"/>
          <stop offset="1" stopColor="#22d3ee"/>
        </linearGradient>
      </defs>
      <circle cx="100" cy="100" r="95" fill="url(#ab-glow)"/>
      {/* outer rune ring */}
      <circle cx="100" cy="100" r="78" fill="none" stroke="url(#ab-rim)" strokeWidth="1.5" strokeDasharray="2 5"/>
      {/* hex */}
      <polygon points="100,18 165,55 165,145 100,182 35,145 35,55" fill="rgba(99,102,241,.08)" stroke="url(#ab-rim)" strokeWidth="2"/>
      <polygon points="100,30 154,61 154,139 100,170 46,139 46,61" fill="rgba(20,184,166,.08)" stroke="rgba(34,211,238,.4)" strokeWidth="1"/>
      {/* inner star */}
      <g transform="translate(100 100)">
        <StarShape cx={0} cy={0} r={42} fill="rgba(255,255,255,.02)" stroke="url(#ab-rim)" strokeWidth={1.5} tier={3}/>
      </g>
      {/* compass dots */}
      {[0,1,2,3,4,5].map(i => {
        const a = (Math.PI / 3) * i - Math.PI / 2;
        return <circle key={i} cx={100 + Math.cos(a) * 78} cy={100 + Math.sin(a) * 78} r="3" fill="#a78bfa" style={{ filter: "drop-shadow(0 0 4px #a78bfa)" }}/>;
      })}
    </svg>
    <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", textAlign: "center", flexDirection: "column" }}>
      <div style={{ fontSize: 56, lineHeight: 1, filter: "drop-shadow(0 0 12px rgba(167,139,250,.6))" }}>🔮</div>
    </div>
  </div>
);

const LevelCurve = () => {
  const levels = Array.from({ length: 15 }, (_, i) => ({ lvl: i + 1, xp: Math.round(500 * Math.pow(1.18, i)) }));
  const max = levels[levels.length - 1].xp;
  const cur = 12, prog = 7280, next = 9500;
  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 8 }}>
        <div>
          <div className="mono" style={{ fontSize: 10, color: "var(--cyan-2)", letterSpacing: ".12em", textTransform: "uppercase", marginBottom: 4 }}>Leveling Curve</div>
          <div style={{ fontFamily: "Outfit", fontSize: 18, fontWeight: 600 }}>
            <span style={{ color: "var(--text-mute)" }}>Lv</span> {cur} → <span className="grad-indigo">Lv {cur + 1}</span>
          </div>
        </div>
        <div className="mono" style={{ fontSize: 11, color: "var(--text-mute)", textAlign: "right" }}>
          <div><span style={{ color: "var(--cyan-2)" }}>{prog.toLocaleString()}</span> / {next.toLocaleString()} XP</div>
          <div style={{ marginTop: 2 }}>2,220 XP to go</div>
        </div>
      </div>

      {/* bar chart */}
      <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 110, marginTop: 16, padding: "8px 0", borderBottom: "1px solid var(--line)" }}>
        {levels.map(l => {
          const h = (l.xp / max) * 92;
          const isCurrent = l.lvl === cur;
          const isPast = l.lvl < cur;
          const isFuture = l.lvl > cur;
          const bg = isCurrent ? "linear-gradient(180deg, #fbbf24, #f59e0b)"
                   : isPast    ? "linear-gradient(180deg, rgba(167,139,250,.7), rgba(99,102,241,.5))"
                              : "rgba(255,255,255,.06)";
          return (
            <div key={l.lvl} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div style={{ width: "100%", height: h, background: bg, borderRadius: "4px 4px 0 0",
                            boxShadow: isCurrent ? "0 0 12px rgba(245,158,11,.6)" : "none",
                            border: isFuture ? "1px dashed rgba(255,255,255,.1)" : "none", borderBottom: "none",
                            transition: "all .3s ease" }}/>
              <div className="mono" style={{ fontSize: 9, color: isCurrent ? "var(--amber-2)" : "var(--text-mute)", fontWeight: isCurrent ? 600 : 400 }}>{l.lvl}</div>
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
        <span className="mono" style={{ fontSize: 9, color: "var(--text-mute)", letterSpacing: ".1em", textTransform: "uppercase" }}>Past</span>
        <span className="mono" style={{ fontSize: 9, color: "var(--amber-2)", letterSpacing: ".1em", textTransform: "uppercase" }}>Now</span>
        <span className="mono" style={{ fontSize: 9, color: "var(--text-mute)", letterSpacing: ".1em", textTransform: "uppercase" }}>Future</span>
      </div>

      <div style={{ height: 18 }}/>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
        <div className="glass-soft" style={{ padding: 12 }}>
          <div className="mono" style={{ fontSize: 9, color: "var(--text-mute)", textTransform: "uppercase", letterSpacing: ".12em", marginBottom: 4 }}>XP / day avg</div>
          <div style={{ fontFamily: "Outfit", fontSize: 19, fontWeight: 600 }}>312</div>
        </div>
        <div className="glass-soft" style={{ padding: 12 }}>
          <div className="mono" style={{ fontSize: 9, color: "var(--text-mute)", textTransform: "uppercase", letterSpacing: ".12em", marginBottom: 4 }}>Days to Lv 13</div>
          <div style={{ fontFamily: "Outfit", fontSize: 19, fontWeight: 600 }}>~7</div>
        </div>
        <div className="glass-soft" style={{ padding: 12 }}>
          <div className="mono" style={{ fontSize: 9, color: "var(--text-mute)", textTransform: "uppercase", letterSpacing: ".12em", marginBottom: 4 }}>Perk at Lv 13</div>
          <div style={{ fontFamily: "Outfit", fontSize: 14, fontWeight: 600, color: "var(--amber-2)" }}>Custom rituals</div>
        </div>
      </div>
    </div>
  );
};

const BountyBoard = () => {
  const bounties = [
    { type: "Daily",   title: "Capture 3 fresh insights",            xp: 60,  prog: 2, of: 3, exp: "8h",  c: "cyan" },
    { type: "Daily",   title: "Hit 45 minutes of deep work",         xp: 80,  prog: 22, of: 45, exp: "8h", c: "cyan" },
    { type: "Weekly",  title: "Read 100 pages across 2+ sources",    xp: 250, prog: 64, of: 100, exp: "2d 14h", c: "indigo" },
    { type: "Weekly",  title: "Publish a 200-word reflection",       xp: 250, prog: 0, of: 1, exp: "2d 14h", c: "indigo" },
    { type: "Epic",    title: "Finish Thinking, Fast & Slow",        xp: 1200, prog: 64, of: 100, exp: "18d", c: "amber" },
    { type: "Epic",    title: "Reach Applied tier in Systems",       xp: 1500, prog: 38, of: 100, exp: "30d", c: "amber" },
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
      {bounties.map((b, i) => {
        const cm = b.c === "cyan" ? { c: "var(--cyan-2)", bg: "rgba(20,184,166,.12)", border: "rgba(20,184,166,.3)" }
                : b.c === "amber" ? { c: "var(--amber-2)", bg: "rgba(245,158,11,.12)", border: "rgba(245,158,11,.3)" }
                : { c: "var(--indigo-2)", bg: "rgba(99,102,241,.14)", border: "rgba(99,102,241,.3)" };
        const pct = (b.prog / b.of) * 100;
        return (
          <div key={i} className="glass-soft lift" style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10, borderRadius: 16, border: `1px solid ${cm.border}` }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
              <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: ".15em", color: cm.c, textTransform: "uppercase", padding: "3px 8px", borderRadius: 99, background: cm.bg, border: `1px solid ${cm.border}` }} className="mono">{b.type}</span>
              <span className="mono" style={{ fontSize: 10, color: "var(--text-mute)" }}>{b.exp}</span>
            </div>
            <div style={{ fontFamily: "Outfit", fontSize: 15, fontWeight: 600, lineHeight: 1.3, textWrap: "pretty", minHeight: 40 }}>{b.title}</div>
            <ProgressBar value={pct} accent={b.c} height={4} label={`${b.prog} / ${b.of}`} sub={`${Math.round(pct)}%`}/>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto" }}>
              <span className="chip" style={{ color: cm.c }}><Icon name="bolt" size={10}/> +{b.xp} XP</span>
              <button className="btn" style={{ padding: "5px 10px", fontSize: 11 }}>Open <Icon name="arrow" size={11}/></button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const ProfileView = () => {
  return (
    <div>
      {/* Hero */}
      <Card className="ring-indigo" style={{ padding: 28, position: "relative", overflow: "hidden", marginBottom: 20 }}>
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background:
            "radial-gradient(500px 280px at 80% -10%, rgba(20,184,166,.16), transparent 70%)," +
            "radial-gradient(500px 280px at 0% 110%, rgba(99,102,241,.22), transparent 70%)",
        }}/>
        {/* runes background */}
        <svg style={{ position: "absolute", inset: 0, opacity: .15, pointerEvents: "none" }} viewBox="0 0 1000 300" preserveAspectRatio="xMidYMid slice">
          <g stroke="#a78bfa" strokeWidth=".7" fill="none">
            <path d="M50 50 L150 90 L250 60 L350 110 L450 80 L550 130 L650 100 L750 150 L850 120 L950 170"/>
            <path d="M50 250 L150 210 L250 240 L350 190 L450 220 L550 170 L650 200 L750 150 L850 180 L950 130"/>
          </g>
          <g fill="#22d3ee" opacity=".5">
            {Array.from({ length: 20 }, (_, i) => <circle key={i} cx={50 + i * 50} cy={50 + Math.sin(i) * 100 + 150} r=".8"/>)}
          </g>
        </svg>

        <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 32, flexWrap: "wrap" }}>
          <ArchetypeBadge/>
          <div style={{ flex: "1 1 380px", minWidth: 0 }}>
            <div className="mono" style={{ fontSize: 11, color: "var(--text-mute)", letterSpacing: ".18em", textTransform: "uppercase", marginBottom: 10 }}>Learner Archetype</div>
            <h1 style={{ fontSize: 44, fontWeight: 700, lineHeight: 1.05, letterSpacing: "-.02em", marginBottom: 8 }}>
              Arya — the <span className="grad-indigo">Polymath</span>
            </h1>
            <div style={{ fontSize: 15, color: "var(--text-dim)", maxWidth: 540, lineHeight: 1.55, marginBottom: 18 }}>
              You spread roots across many domains and shape ideas by their cross-pollination. Your stat curve favors Action, but Reflection is rising — a dangerous, exciting combo.
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <span className="chip" style={{ color: "var(--indigo-2)" }}><Icon name="star" size={10}/> Level 12 · 7,280 XP</span>
              <span className="chip" style={{ color: "var(--amber-2)" }}><Icon name="flame" size={10}/> 27-day streak</span>
              <span className="chip" style={{ color: "var(--cyan-2)" }}><Icon name="trophy" size={10}/> 14 trophies</span>
              <span className="chip"><Icon name="book2" size={10}/> 31 sources tracked</span>
            </div>
          </div>

          {/* archetype switcher */}
          <div style={{ flex: "0 1 240px" }}>
            <div className="mono" style={{ fontSize: 10, color: "var(--text-mute)", letterSpacing: ".15em", textTransform: "uppercase", marginBottom: 8 }}>Other archetypes</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {ARCHETYPES.filter(a => !a.active).map(a => (
                <div key={a.id} className="glass-soft" style={{ padding: 10, display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                  <div style={{ fontSize: 20 }}>{a.emoji}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{a.name}</div>
                    <div style={{ fontSize: 10.5, color: "var(--text-mute)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.tag}</div>
                  </div>
                  <Icon name="chevron" size={12} style={{ color: "var(--text-mute)" }}/>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Leveling Stats + Bounty */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 16, marginBottom: 20 }}>
        <Card style={{ padding: 22 }}>
          <LevelCurve/>
        </Card>

        <Card style={{ padding: 22 }}>
          <SectionTitle eyebrow="Quest & Bounty Board" title="Daily, weekly & epic missions" accent="amber"
            action={<div style={{ display: "flex", gap: 6 }}>
              <button className="btn" style={{ padding: "6px 10px", fontSize: 11 }}>Daily</button>
              <button className="btn" style={{ padding: "6px 10px", fontSize: 11, color: "var(--text-mute)" }}>Weekly</button>
              <button className="btn" style={{ padding: "6px 10px", fontSize: 11, color: "var(--text-mute)" }}>Epic</button>
            </div>}/>
          <BountyBoard/>
        </Card>
      </div>

      {/* Trophy Room */}
      <Card style={{ padding: 24 }}>
        <SectionTitle eyebrow="Trophy Room" title="Pencapaian unggulan" accent="amber"
          action={<div style={{ display: "flex", gap: 6 }}>
            {["All", "Platinum", "Gold", "Silver", "Bronze"].map((t, i) => (
              <div key={t} className={`tab ${i === 0 ? "active" : ""}`} style={{ padding: "6px 12px", fontSize: 11 }}>{t}</div>
            ))}
          </div>}/>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 14 }}>
          {TROPHIES.map((t, i) => <Trophy key={i} t={t}/>)}
        </div>
      </Card>
    </div>
  );
};

window.ProfileView = ProfileView;
