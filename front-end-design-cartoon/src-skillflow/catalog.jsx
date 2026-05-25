// Learning Catalog + Source Detail

const SOURCES = [
  { id: "tfs",  title: "Thinking, Fast & Slow",      author: "Daniel Kahneman",     type: "book",     hue: 210, progress: 64, lvl: "Applied",       chap: "Ch. 9 / 38", lastSeen: "today" },
  { id: "atom", title: "Atomic Habits",              author: "James Clear",         type: "book",     hue: 30,  progress: 92, lvl: "Mastered",      chap: "Ch. 18 / 20", lastSeen: "2d ago" },
  { id: "fer",  title: "Ferriss × Naval Ravikant",   author: "Tim Ferriss Show",    type: "podcast",  hue: 160, progress: 78, lvl: "Understanding", chap: "1h 12m / 1h 33m", lastSeen: "yesterday" },
  { id: "rang", title: "Range",                      author: "David Epstein",       type: "book",     hue: 280, progress: 41, lvl: "Understanding", chap: "Ch. 5 / 12", lastSeen: "4d ago" },
  { id: "huber",title: "Huberman Lab — Deep Work",   author: "Andrew Huberman",     type: "podcast",  hue: 200, progress: 22, lvl: "Awareness",     chap: "21m / 1h 48m", lastSeen: "1w ago" },
  { id: "veri", title: "Veritasium — Math's Fatal Flaw", author: "Derek Muller",    type: "video",    hue: 0,   progress: 100, lvl: "Mastered",     chap: "watched",      lastSeen: "5d ago" },
  { id: "nyt",  title: "On the Death of the Hyperlink", author: "New Yorker Essay", type: "article",  hue: 50,  progress: 56, lvl: "Understanding", chap: "page 3 / 5",  lastSeen: "today" },
  { id: "med",  title: "Why We Sleep",               author: "Matthew Walker",      type: "book",     hue: 250, progress: 8,  lvl: "Awareness",     chap: "Ch. 1 / 16", lastSeen: "started" },
];

const TYPE_META = {
  book:    { icon: "book2",      label: "Book",    color: "var(--indigo-2)" },
  podcast: { icon: "podcast",    label: "Podcast", color: "var(--cyan-2)" },
  video:   { icon: "video",      label: "Video",   color: "var(--amber-2)" },
  article: { icon: "article",    label: "Article", color: "var(--violet)" },
};

const LVL_META = {
  Awareness:     { c: "var(--text-mute)" },
  Understanding: { c: "var(--cyan-2)" },
  Applied:       { c: "var(--indigo-2)" },
  Mastered:      { c: "var(--amber-2)" },
};

const SourceCard = ({ s, onOpen }) => {
  const tm = TYPE_META[s.type];
  return (
    <Card style={{ padding: 16, display: "flex", flexDirection: "column", gap: 14, cursor: "pointer" }} onClick={onOpen}>
      <div style={{ position: "relative" }}>
        <CoverPlaceholder title={s.title} hue={s.hue} h={150} label={s.type}/>
        <div style={{ position: "absolute", top: 10, right: 10, padding: "4px 8px", background: "rgba(10,10,20,.7)", backdropFilter: "blur(8px)", borderRadius: 99, display: "flex", alignItems: "center", gap: 5, border: "1px solid rgba(255,255,255,.1)" }}>
          <Icon name={tm.icon} size={11} style={{ color: tm.color }}/>
          <span style={{ fontSize: 10, color: tm.color, fontWeight: 500 }}>{tm.label}</span>
        </div>
        <div style={{ position: "absolute", bottom: 10, right: 10, padding: "3px 7px", background: "rgba(10,10,20,.7)", backdropFilter: "blur(8px)", borderRadius: 6, border: "1px solid rgba(255,255,255,.1)" }}>
          <span className="mono" style={{ fontSize: 10, color: LVL_META[s.lvl].c, fontWeight: 600 }}>{s.lvl}</span>
        </div>
      </div>
      <div>
        <div style={{ fontFamily: "Outfit", fontSize: 14, fontWeight: 600, lineHeight: 1.25, marginBottom: 3, textWrap: "balance" }}>{s.title}</div>
        <div style={{ fontSize: 11, color: "var(--text-mute)" }}>{s.author}</div>
      </div>
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 5 }}>
          <span className="mono" style={{ fontSize: 10, color: "var(--text-mute)" }}>{s.chap}</span>
          <span className="mono" style={{ fontSize: 11, color: "var(--text)" }}>{s.progress}%</span>
        </div>
        <ProgressBar value={s.progress} accent={s.progress === 100 ? "cyan" : "indigo"} height={4}/>
      </div>
    </Card>
  );
};

// Reading Timer panel — interactive
const ReadingTimer = () => {
  const [seconds, setSeconds] = React.useState(60 * 22 + 38); // 22:38
  const [running, setRunning] = React.useState(true);
  React.useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setSeconds(x => x + 1), 1000);
    return () => clearInterval(id);
  }, [running]);
  const m = Math.floor(seconds / 60), s = seconds % 60;
  const goalSec = 45 * 60;
  const pct = Math.min(100, (seconds / goalSec) * 100);
  const radius = 60, circ = 2 * Math.PI * radius;

  return (
    <Card className="ring-cyan" style={{ padding: 24 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
        <div>
          <div className="mono" style={{ fontSize: 10, color: "var(--cyan-2)", letterSpacing: ".12em", textTransform: "uppercase", marginBottom: 4 }}>Reading Timer</div>
          <div style={{ fontSize: 15, fontWeight: 600 }}>Session in progress</div>
        </div>
        <div className="chip" style={{ color: running ? "var(--green)" : "var(--text-mute)" }}>
          <span className="dot" style={{ background: running ? "var(--green)" : "var(--text-mute)", boxShadow: running ? "0 0 8px var(--green)" : "" }}/>
          {running ? "LIVE" : "PAUSED"}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 24, marginBottom: 18 }}>
        <div style={{ position: "relative", width: 152, height: 152, flexShrink: 0 }}>
          <svg width="152" height="152" viewBox="0 0 152 152">
            <defs>
              <linearGradient id="rt-g" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#22d3ee"/><stop offset="1" stopColor="#14b8a6"/>
              </linearGradient>
            </defs>
            <circle cx="76" cy="76" r={radius} fill="none" stroke="rgba(255,255,255,.06)" strokeWidth="8"/>
            <circle cx="76" cy="76" r={radius} fill="none" stroke="url(#rt-g)" strokeWidth="8"
              strokeDasharray={circ}
              strokeDashoffset={circ * (1 - pct / 100)}
              strokeLinecap="round"
              transform="rotate(-90 76 76)"
              style={{ filter: "drop-shadow(0 0 8px #14b8a6)", transition: "stroke-dashoffset .5s ease" }}/>
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", textAlign: "center" }}>
            <div>
              <div className="mono" style={{ fontFamily: "JetBrains Mono", fontSize: 28, fontWeight: 600, color: "var(--text)", letterSpacing: ".02em" }}>{String(m).padStart(2,"0")}:{String(s).padStart(2,"0")}</div>
              <div className="mono" style={{ fontSize: 9, color: "var(--text-mute)", letterSpacing: ".15em", textTransform: "uppercase", marginTop: 2 }}>of 45 min</div>
            </div>
          </div>
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div className="glass-soft" style={{ padding: 12 }}>
              <div className="mono" style={{ fontSize: 9, color: "var(--text-mute)", textTransform: "uppercase", letterSpacing: ".12em", marginBottom: 4 }}>Pages</div>
              <div style={{ fontFamily: "Outfit", fontSize: 22, fontWeight: 600 }}>14</div>
            </div>
            <div className="glass-soft" style={{ padding: 12 }}>
              <div className="mono" style={{ fontSize: 9, color: "var(--text-mute)", textTransform: "uppercase", letterSpacing: ".12em", marginBottom: 4 }}>Pace</div>
              <div style={{ fontFamily: "Outfit", fontSize: 22, fontWeight: 600 }}>1.6<span className="mono" style={{ fontSize: 11, color: "var(--text-mute)", marginLeft: 4 }}>pg/min</span></div>
            </div>
          </div>
          <div className="glass-soft" style={{ padding: 12 }}>
            <div className="mono" style={{ fontSize: 9, color: "var(--text-mute)", textTransform: "uppercase", letterSpacing: ".12em", marginBottom: 6 }}>Earning</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Icon name="bolt" size={14} style={{ color: "var(--amber-2)" }}/>
              <div style={{ fontFamily: "Outfit", fontSize: 18, fontWeight: 600 }}>+98 <span style={{ color: "var(--text-mute)", fontSize: 12 }}>XP so far</span></div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <button className="btn" onClick={() => setRunning(r => !r)} style={{ flex: 1, justifyContent: "center" }}>
          {running ? <><Icon name="pause" size={14}/> Pause</> : <><Icon name="play" size={14}/> Resume</>}
        </button>
        <button className="btn btn-cyan" style={{ flex: 1, justifyContent: "center" }}><Icon name="check" size={14}/> Complete session</button>
      </div>
    </Card>
  );
};

const TABS = [
  { id: "notes",    label: "Session Notes",  icon: "pen" },
  { id: "insights", label: "Key Insights",   icon: "lightbulb" },
  { id: "actions",  label: "Action Items",   icon: "target" },
  { id: "history",  label: "Activity",       icon: "clock" },
];

const NotesTab = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
    {[
      { time: "Today · 12 min in", text: "System 1 vs System 2 — the metaphor is elegant but Kahneman is careful: these are characters, not brain regions. Useful as labels, dangerous as ontology." },
      { time: "Today · 7 min in", text: "Cognitive ease primes us to believe. Repetition → familiarity → truth. The implication for media diets is uncomfortable." },
      { time: "Yesterday · Ch. 8", text: "Anchoring is shockingly robust even when subjects KNOW the anchor is random. We can't reason our way out of it — only structurally avoid it." },
    ].map((n, i) => (
      <div key={i} className="glass-soft" style={{ padding: 18, borderLeft: "2px solid var(--indigo)" }}>
        <div className="mono" style={{ fontSize: 10, color: "var(--text-mute)", letterSpacing: ".12em", marginBottom: 8, textTransform: "uppercase" }}>{n.time}</div>
        <div style={{ fontSize: 13.5, color: "var(--text)", lineHeight: 1.6, textWrap: "pretty" }}>{n.text}</div>
      </div>
    ))}
    <button className="btn" style={{ alignSelf: "flex-start" }}><Icon name="plus" size={14}/> Add a note</button>
  </div>
);

const InsightsTab = () => (
  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
    {[
      { title: "WYSIATI", text: "\"What you see is all there is.\" We build coherent stories from limited evidence and rarely audit what's missing.", c: "indigo" },
      { title: "Anchoring", text: "Random numbers shift our estimates. Useful: pre-commit to ranges before negotiations.", c: "cyan" },
      { title: "Substitution", text: "Hard questions get silently swapped for easy ones. The trick is to notice the swap.", c: "amber" },
      { title: "Cognitive ease", text: "Familiar = true (felt sense). Diversify font, source, format to slow your believing.", c: "indigo" },
    ].map((it, i) => {
      const cm = it.c === "cyan" ? { c: "var(--cyan-2)", b: "rgba(20,184,166,.18)" } :
                 it.c === "amber" ? { c: "var(--amber-2)", b: "rgba(245,158,11,.18)" } :
                 { c: "var(--indigo-2)", b: "rgba(99,102,241,.18)" };
      return (
        <div key={i} className="glass-soft lift" style={{ padding: 18, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${cm.c}, transparent 80%)` }}/>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <div style={{ width: 24, height: 24, borderRadius: 7, background: cm.b, color: cm.c, display: "grid", placeItems: "center", border: `1px solid ${cm.c}33` }}><Icon name="lightbulb" size={12}/></div>
            <div style={{ fontFamily: "Outfit", fontSize: 14, fontWeight: 600 }}>{it.title}</div>
          </div>
          <div style={{ fontSize: 12.5, color: "var(--text-dim)", lineHeight: 1.55, textWrap: "pretty" }}>{it.text}</div>
        </div>
      );
    })}
  </div>
);

const ActionsTab = () => {
  const [items, setItems] = React.useState([
    { id: 1, done: true,  text: "Re-read Ch. 8 to internalize anchoring & substitution", xp: 25 },
    { id: 2, done: false, text: "Run a personal experiment: anchor my next salary negotiation", xp: 80, mission: true },
    { id: 3, done: false, text: "Write a 200-word reflection connecting WYSIATI to news consumption", xp: 60 },
    { id: 4, done: false, text: "Find a counter-example essay disputing System 1/2 framing", xp: 40 },
    { id: 5, done: true,  text: "Highlight 5 quotes for spaced-rep review", xp: 15 },
  ]);
  const toggle = id => setItems(xs => xs.map(x => x.id === id ? { ...x, done: !x.done } : x));
  const doneCount = items.filter(i => i.done).length;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div className="mono" style={{ fontSize: 11, color: "var(--text-mute)", letterSpacing: ".1em", textTransform: "uppercase" }}>
          <span style={{ color: "var(--text)" }}>{doneCount}</span> of {items.length} complete
        </div>
        <button className="btn" style={{ padding: "6px 10px", fontSize: 11 }}><Icon name="plus" size={12}/> New action</button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {items.map(it => (
          <div key={it.id} className="glass-soft" style={{ padding: 14, display: "flex", alignItems: "center", gap: 14, opacity: it.done ? .6 : 1, transition: "all .3s ease" }}>
            <Check on={it.done} onClick={() => toggle(it.id)}/>
            <div style={{ flex: 1, fontSize: 13.5, color: "var(--text)", textDecoration: it.done ? "line-through" : "none", textDecorationColor: "var(--text-mute)", textWrap: "pretty", lineHeight: 1.4 }}>
              {it.text}
            </div>
            {it.mission && <span className="chip" style={{ color: "var(--amber-2)" }}><Icon name="target" size={10}/> Mission</span>}
            <span className="chip" style={{ color: it.done ? "var(--text-mute)" : "var(--cyan-2)" }}><Icon name="bolt" size={10}/> +{it.xp}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const HistoryTab = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
    {[
      { d: "May 20", what: "Read 14 pages · Ch. 9 in progress", xp: "+98 XP" },
      { d: "May 19", what: "Finished Ch. 8 · 4 highlights", xp: "+85 XP" },
      { d: "May 17", what: "Captured 3 insights", xp: "+15 XP" },
      { d: "May 16", what: "Started Ch. 8", xp: "+10 XP" },
      { d: "May 14", what: "First session — Ch. 1–3", xp: "+220 XP" },
    ].map((e, i) => (
      <div key={i} className="glass-soft" style={{ padding: 14, display: "flex", alignItems: "center", gap: 14 }}>
        <div className="mono" style={{ fontSize: 11, color: "var(--text-mute)", width: 70 }}>{e.d}</div>
        <div style={{ flex: 1, fontSize: 13, color: "var(--text)" }}>{e.what}</div>
        <span className="chip" style={{ color: "var(--cyan-2)" }}>{e.xp}</span>
      </div>
    ))}
  </div>
);

const CatalogView = ({ source, setSource }) => {
  const [view, setViewMode] = React.useState("grid");
  const [filter, setFilter] = React.useState("all");
  const [activeTab, setActiveTab] = React.useState("notes");

  if (source) {
    const s = SOURCES.find(x => x.id === source);
    return (
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--text-mute)", marginBottom: 18 }}>
          <span style={{ cursor: "pointer" }} onClick={() => setSource(null)}>Learning</span>
          <Icon name="chevron" size={11}/>
          <span style={{ color: "var(--text-dim)" }}>{TYPE_META[s.type].label}s</span>
          <Icon name="chevron" size={11}/>
          <span style={{ color: "var(--text)" }}>{s.title}</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 20, marginBottom: 20 }}>
          {/* hero */}
          <Card style={{ padding: 24, position: "relative", overflow: "hidden" }}>
            <div style={{ display: "flex", gap: 22 }}>
              <CoverPlaceholder title={s.title} hue={s.hue} h={200} w={140} label={s.type}/>
              <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
                <div className="mono" style={{ fontSize: 10, color: "var(--text-mute)", letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
                  <Icon name={TYPE_META[s.type].icon} size={12} style={{ color: TYPE_META[s.type].color }}/>
                  {TYPE_META[s.type].label} · {s.author}
                </div>
                <h2 style={{ fontSize: 26, fontWeight: 600, lineHeight: 1.15, marginBottom: 12, textWrap: "balance" }}>{s.title}</h2>
                <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
                  <span className="chip" style={{ color: LVL_META[s.lvl].c }}><Icon name="star" size={10}/> {s.lvl}</span>
                  <span className="chip"><Icon name="clock" size={10}/> 8h 42m logged</span>
                  <span className="chip"><Icon name="pen" size={10}/> 12 notes · 4 insights</span>
                </div>
                <div style={{ marginTop: "auto" }}>
                  <ProgressBar value={s.progress} accent="indigo" height={6} label={`Progress · ${s.chap}`} sub={`${s.progress}% · last opened ${s.lastSeen}`}/>
                </div>
              </div>
            </div>
          </Card>

          {/* timer */}
          <ReadingTimer/>
        </div>

        <Card style={{ padding: 22 }}>
          <div style={{ display: "flex", gap: 6, marginBottom: 22, borderBottom: "1px solid var(--line)", paddingBottom: 14 }}>
            {TABS.map(t => (
              <div key={t.id} className={`tab ${activeTab === t.id ? "active" : ""}`} onClick={() => setActiveTab(t.id)} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Icon name={t.icon} size={13}/> {t.label}
              </div>
            ))}
          </div>
          {activeTab === "notes"    && <NotesTab/>}
          {activeTab === "insights" && <InsightsTab/>}
          {activeTab === "actions"  && <ActionsTab/>}
          {activeTab === "history"  && <HistoryTab/>}
        </Card>
      </div>
    );
  }

  const FILTERS = [
    { id: "all",     label: "All",      icon: "layers" },
    { id: "book",    label: "Books",    icon: "book2" },
    { id: "podcast", label: "Podcasts", icon: "podcast" },
    { id: "video",   label: "Videos",   icon: "video" },
    { id: "article", label: "Articles", icon: "article" },
  ];
  const list = SOURCES.filter(s => filter === "all" || s.type === filter);

  return (
    <div>
      {/* toolbar */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 4 }}>
          {FILTERS.map(f => (
            <div key={f.id} className={`tab ${filter === f.id ? "active" : ""}`} onClick={() => setFilter(f.id)} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Icon name={f.icon} size={12}/> {f.label}
              <span className="mono" style={{ fontSize: 9, color: "var(--text-mute)", marginLeft: 2 }}>
                {f.id === "all" ? SOURCES.length : SOURCES.filter(s => s.type === f.id).length}
              </span>
            </div>
          ))}
        </div>
        <div style={{ flex: 1 }}/>
        <div className="glass-soft" style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 12 }}>
          <Icon name="search" size={13} style={{ color: "var(--text-mute)" }}/>
          <input placeholder="Find in catalog…" style={{ background: "transparent", border: "none", color: "var(--text)", fontSize: 12, outline: "none", width: 160, fontFamily: "inherit" }}/>
        </div>
        <div className="glass-soft" style={{ display: "flex", padding: 3, borderRadius: 10 }}>
          <div onClick={() => setViewMode("grid")} style={{ padding: 6, borderRadius: 7, background: view === "grid" ? "rgba(255,255,255,.08)" : "transparent", color: view === "grid" ? "var(--text)" : "var(--text-mute)", cursor: "pointer" }}><Icon name="grid" size={14}/></div>
          <div onClick={() => setViewMode("list")} style={{ padding: 6, borderRadius: 7, background: view === "list" ? "rgba(255,255,255,.08)" : "transparent", color: view === "list" ? "var(--text)" : "var(--text-mute)", cursor: "pointer" }}><Icon name="list" size={14}/></div>
        </div>
        <button className="btn btn-primary"><Icon name="plus" size={14}/> Add source</button>
      </div>

      {view === "grid" ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
          {list.map(s => <SourceCard key={s.id} s={s} onOpen={() => setSource(s.id)}/>)}
        </div>
      ) : (
        <Card style={{ padding: 8 }}>
          {list.map((s, i) => (
            <div key={s.id} onClick={() => setSource(s.id)} style={{ display: "grid", gridTemplateColumns: "44px 1.6fr 1fr 1fr 80px 100px", gap: 16, padding: "14px 16px", borderBottom: i < list.length - 1 ? "1px solid var(--line)" : "none", alignItems: "center", cursor: "pointer", borderRadius: 12, transition: "background .2s ease" }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,.03)"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              <div style={{ width: 36, height: 44 }}>
                <CoverPlaceholder title="" hue={s.hue} h={44} w={36} label=""/>
              </div>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 500 }}>{s.title}</div>
                <div style={{ fontSize: 11, color: "var(--text-mute)" }}>{s.author}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Icon name={TYPE_META[s.type].icon} size={12} style={{ color: TYPE_META[s.type].color }}/>
                <span style={{ fontSize: 12, color: "var(--text-dim)" }}>{TYPE_META[s.type].label}</span>
              </div>
              <span className="mono" style={{ fontSize: 11, color: LVL_META[s.lvl].c }}>{s.lvl}</span>
              <span className="mono" style={{ fontSize: 11, color: "var(--text-mute)" }}>{s.chap}</span>
              <ProgressBar value={s.progress} accent={s.progress === 100 ? "cyan" : "indigo"} height={4}/>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
};

window.CatalogView = CatalogView;
