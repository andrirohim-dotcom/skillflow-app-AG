// Global OS Shell: sidebar, header, FAB + quick capture modal

const NAV_ITEMS = [
  { id: "dashboard", icon: "home",   label: "Dashboard",     hint: "⌘1" },
  { id: "catalog",   icon: "book",   label: "Learning",      hint: "⌘2" },
  { id: "skills",    icon: "tree",   label: "Skill Tree",    hint: "⌘3" },
  { id: "profile",   icon: "user",   label: "Character",     hint: "⌘4" },
];

const NAV_SECONDARY = [
  { id: "inbox",     icon: "lightbulb", label: "Inbox",  count: 4 },
  { id: "archive",   icon: "archive",   label: "Archive" },
  { id: "settings",  icon: "settings",  label: "Settings" },
];

const Sidebar = ({ view, setView }) => {
  return (
    <aside style={{
      borderRight: "1px solid var(--line)",
      background: "linear-gradient(180deg, rgba(10,10,20,.85), rgba(6,6,14,.95))",
      padding: "22px 16px",
      display: "flex", flexDirection: "column",
      position: "sticky", top: 0, height: "100vh",
      backdropFilter: "blur(14px)",
    }}>
      {/* logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 8px 4px" }}>
        <div style={{ position: "relative", width: 32, height: 32 }}>
          <svg width="32" height="32" viewBox="0 0 32 32">
            <defs>
              <linearGradient id="logo-g" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#6366f1"/>
                <stop offset=".5" stopColor="#a78bfa"/>
                <stop offset="1" stopColor="#22d3ee"/>
              </linearGradient>
            </defs>
            <path d="M16 3 L26 9 L26 21 L16 27 L6 21 L6 9 Z" fill="url(#logo-g)" opacity=".25"/>
            <path d="M16 6 L23 10.5 L23 17.5 L16 22 L9 17.5 L9 10.5 Z" fill="none" stroke="url(#logo-g)" strokeWidth="1.5"/>
            <circle cx="16" cy="14" r="2.5" fill="#22d3ee" style={{ filter: "drop-shadow(0 0 6px #22d3ee)" }}/>
          </svg>
        </div>
        <div>
          <div style={{ fontFamily: "Outfit", fontWeight: 700, fontSize: 15, letterSpacing: ".01em" }}>
            Skill<span className="grad-indigo">Flow</span>
          </div>
          <div className="mono" style={{ fontSize: 9, color: "var(--text-mute)", letterSpacing: ".15em" }}>LEARNING OS · v0.5.0</div>
        </div>
      </div>

      <div style={{ height: 22 }} />

      {/* search */}
      <div className="glass-soft" style={{ padding: "8px 12px", display: "flex", alignItems: "center", gap: 10, marginBottom: 18, borderRadius: 12 }}>
        <Icon name="search" size={14} style={{ color: "var(--text-mute)" }}/>
        <input placeholder="Search…" style={{ background: "transparent", border: "none", color: "var(--text)", fontSize: 12, outline: "none", flex: 1, fontFamily: "inherit" }}/>
        <span className="mono" style={{ fontSize: 9, color: "var(--text-mute)", padding: "2px 5px", border: "1px solid var(--line-strong)", borderRadius: 4 }}>⌘K</span>
      </div>

      <div className="mono" style={{ fontSize: 9, color: "var(--text-mute)", letterSpacing: ".2em", textTransform: "uppercase", padding: "0 10px", marginBottom: 8 }}>Workspace</div>
      <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {NAV_ITEMS.map(n => {
          const active = view === n.id;
          return (
            <div
              key={n.id}
              onClick={() => setView(n.id)}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "10px 12px", borderRadius: 12,
                cursor: "pointer", transition: "all .2s ease",
                background: active ? "linear-gradient(90deg, rgba(99,102,241,.18), rgba(99,102,241,.04))" : "transparent",
                border: active ? "1px solid rgba(129,140,248,.3)" : "1px solid transparent",
                color: active ? "var(--text)" : "var(--text-dim)",
                position: "relative",
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = "rgba(255,255,255,.03)" }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent" }}
            >
              {active && (
                <span style={{ position: "absolute", left: -1, top: 8, bottom: 8, width: 2, background: "linear-gradient(180deg, #6366f1, #22d3ee)", borderRadius: 2, boxShadow: "0 0 8px #818cf8" }}/>
              )}
              <Icon name={n.icon} size={16} style={{ color: active ? "var(--indigo-2)" : "var(--text-mute)" }}/>
              <span style={{ fontSize: 13, fontWeight: active ? 500 : 400, flex: 1 }}>{n.label}</span>
              <span className="mono" style={{ fontSize: 9, color: "var(--text-mute)", opacity: active ? 1 : .6 }}>{n.hint}</span>
            </div>
          );
        })}
      </nav>

      <div style={{ height: 22 }} />

      <div className="mono" style={{ fontSize: 9, color: "var(--text-mute)", letterSpacing: ".2em", textTransform: "uppercase", padding: "0 10px", marginBottom: 8 }}>Activity</div>
      <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {NAV_SECONDARY.map(n => (
          <div key={n.id} style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "9px 12px", borderRadius: 10, cursor: "pointer",
            color: "var(--text-dim)", transition: "all .2s ease",
          }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,.03)"}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          >
            <Icon name={n.icon} size={14} style={{ color: "var(--text-mute)" }}/>
            <span style={{ fontSize: 12, flex: 1 }}>{n.label}</span>
            {n.count != null && (
              <span className="mono" style={{ fontSize: 9, fontWeight: 600, color: "var(--amber-2)", background: "rgba(245,158,11,.12)", padding: "2px 6px", borderRadius: 99, border: "1px solid rgba(245,158,11,.25)" }}>{n.count}</span>
            )}
          </div>
        ))}
      </nav>

      <div style={{ flex: 1 }}/>

      {/* daily quest reminder pinned */}
      <div className="glass-soft" style={{ padding: 12, borderRadius: 14, border: "1px solid rgba(245,158,11,.18)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <Icon name="flame" size={14} style={{ color: "var(--amber-2)" }}/>
          <div className="mono" style={{ fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--amber-2)" }}>Streak</div>
          <div style={{ flex: 1 }}/>
          <div className="mono" style={{ fontSize: 11, color: "var(--text)" }}>27<span style={{ color: "var(--text-mute)" }}>d</span></div>
        </div>
        <div style={{ fontSize: 11, color: "var(--text-dim)", lineHeight: 1.4, marginBottom: 8 }}>
          Read <span style={{ color: "var(--text)" }}>20 min</span> today to keep the chain alive.
        </div>
        <ProgressBar value={68} accent="amber" height={4}/>
      </div>
    </aside>
  );
};

const Header = ({ view }) => {
  const TITLES = {
    dashboard: ["Welcome back, Arya", "Today's mission — sharpen the edge."],
    catalog:   ["Learning Catalog",   "All knowledge sources, one library."],
    skills:    ["Skill Tree",         "Map the dimensions of your mastery."],
    profile:   ["Character Sheet",    "Your learner archetype, in detail."],
  };
  const [title, subtitle] = TITLES[view] || TITLES.dashboard;
  const xp = 7280, xpToNext = 9500, level = 12;
  const pct = (xp / xpToNext) * 100;

  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 20,
      background: "linear-gradient(180deg, rgba(7,7,16,.85), rgba(7,7,16,.55))",
      backdropFilter: "blur(18px) saturate(140%)",
      borderBottom: "1px solid var(--line)",
      padding: "18px 36px",
      display: "flex", alignItems: "center", gap: 24,
    }}>
      <div style={{ minWidth: 0, flex: "0 1 auto" }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-.015em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{title}</h1>
        <div style={{ fontSize: 12, color: "var(--text-dim)", marginTop: 2 }}>{subtitle}</div>
      </div>

      <div style={{ flex: 1, minWidth: 16 }}/>

      {/* xp glow bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 0, flex: "1 1 380px", maxWidth: 460 }}>
        <Avatar size={42} level={level} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 5 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span className="mono" style={{ fontSize: 10, color: "var(--text-mute)", letterSpacing: ".15em", textTransform: "uppercase" }}>Lv {level}</span>
              <span style={{ fontSize: 12, fontWeight: 600 }}>Polymath</span>
              <span style={{ fontSize: 10 }}>🔮</span>
            </div>
            <div className="mono" style={{ fontSize: 10, color: "var(--text-mute)" }}>
              <span style={{ color: "var(--cyan-2)" }}>{xp.toLocaleString()}</span> / {xpToNext.toLocaleString()} XP
            </div>
          </div>
          <div style={{ height: 8, background: "rgba(255,255,255,.05)", borderRadius: 99, overflow: "hidden", border: "1px solid rgba(255,255,255,.06)", position: "relative" }}>
            <div className="xp-fill" style={{ height: "100%", width: `${pct}%`, borderRadius: 99, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, transparent, rgba(255,255,255,.35), transparent)", animation: "shineX 2.6s ease-in-out infinite", width: "40%" }}/>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
        <button className="btn" style={{ padding: "10px 12px" }}>
          <Icon name="bell" size={14}/>
          <span style={{ width: 6, height: 6, background: "var(--amber-2)", borderRadius: 99, boxShadow: "0 0 6px var(--amber-2)" }}/>
        </button>
        <button className="btn" style={{ padding: "10px 12px" }}>
          <Icon name="settings" size={14}/>
        </button>
      </div>
    </header>
  );
};

const QuickCapture = ({ open, onClose }) => {
  const [tab, setTab] = React.useState("note");
  if (!open) return null;
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 50,
      background: "rgba(5,5,10,.55)",
      backdropFilter: "blur(8px)",
      display: "grid", placeItems: "center", padding: 20,
    }}>
      <div onClick={e => e.stopPropagation()} className="glass ring-indigo" style={{ width: "min(620px, 100%)", padding: 24, borderRadius: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
          <div style={{ width: 36, height: 36, borderRadius: 12, background: "linear-gradient(135deg, #6366f1, #22d3ee)", display: "grid", placeItems: "center", color: "#fff" }}>
            <Icon name="bolt" size={18}/>
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: 17, fontWeight: 600 }}>Quick Capture</h3>
            <div style={{ fontSize: 12, color: "var(--text-dim)" }}>Stash an idea before it slips. <span className="mono" style={{ color: "var(--text-mute)" }}>+5 XP</span></div>
          </div>
          <div className="check" onClick={onClose} style={{ width: 28, height: 28, opacity: 1 }}>
            <Icon name="close" size={14} style={{ color: "var(--text)", opacity: 1 }} />
          </div>
        </div>

        <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
          {[
            { id: "note",     icon: "pen",       label: "Note" },
            { id: "insight",  icon: "lightbulb", label: "Insight" },
            { id: "action",   icon: "target",    label: "Action item" },
            { id: "source",   icon: "book",      label: "Source" },
          ].map(t => (
            <div key={t.id} className={`tab ${tab === t.id ? "active" : ""}`} onClick={() => setTab(t.id)} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Icon name={t.icon} size={12}/> {t.label}
            </div>
          ))}
        </div>

        <textarea
          placeholder="What's the idea?"
          rows={5}
          autoFocus
          style={{
            width: "100%", resize: "none", padding: 14,
            background: "rgba(0,0,0,.25)", color: "var(--text)",
            border: "1px solid var(--line-strong)", borderRadius: 14,
            fontFamily: "inherit", fontSize: 14, outline: "none",
            transition: "all .2s ease",
          }}
        />

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 14 }}>
          <span className="chip" style={{ color: "var(--indigo-2)" }}><span className="dot"/> Mental Models</span>
          <span className="chip" style={{ color: "var(--cyan-2)" }}><span className="dot"/> Atomic Habits</span>
          <span className="chip" style={{ color: "var(--text-mute)" }}><Icon name="plus" size={10}/> Add link</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 18, gap: 8 }}>
          <div className="mono" style={{ fontSize: 10, color: "var(--text-mute)", letterSpacing: ".12em", textTransform: "uppercase" }}>
            <span style={{ color: "var(--cyan-2)" }}>⌘</span>↵ to save · <span style={{ color: "var(--text-mute)" }}>esc</span> to close
          </div>
          <button className="btn btn-primary"><Icon name="bolt" size={14}/> Capture → Inbox</button>
        </div>
      </div>
    </div>
  );
};

const FAB = ({ onClick }) => (
  <button onClick={onClick} className="floaty" aria-label="Quick capture" style={{
    position: "fixed", bottom: 28, right: 28, zIndex: 40,
    width: 60, height: 60, borderRadius: 20,
    border: "1px solid rgba(129,140,248,.5)",
    background: "linear-gradient(135deg, #6366f1, #8b5cf6 60%, #22d3ee)",
    color: "#fff", cursor: "pointer",
    boxShadow: "0 14px 50px -8px rgba(99,102,241,.65), 0 0 0 6px rgba(99,102,241,.08), inset 0 1px 0 rgba(255,255,255,.25)",
    display: "grid", placeItems: "center",
    transition: "transform .25s ease, box-shadow .25s ease",
  }}
  onMouseEnter={e => e.currentTarget.style.transform = "scale(1.06)"}
  onMouseLeave={e => e.currentTarget.style.transform = ""}
  >
    <Icon name="bolt" size={22} strokeWidth={2}/>
  </button>
);

Object.assign(window, { Sidebar, Header, QuickCapture, FAB });
