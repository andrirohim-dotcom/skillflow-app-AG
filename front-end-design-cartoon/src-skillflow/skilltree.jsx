// Skill Tree + Stats Radar (pure SVG)

const LVL_TIERS = ["Awareness", "Understanding", "Applied", "Mastered"];
const TIER_COLOR = {
  0: { glow: "rgba(255,255,255,.18)", stroke: "rgba(255,255,255,.25)", fill: "rgba(40,40,55,.7)" },
  1: { glow: "rgba(20,184,166,.55)",  stroke: "#22d3ee",               fill: "rgba(20,184,166,.18)" },
  2: { glow: "rgba(129,140,248,.65)", stroke: "#a78bfa",               fill: "rgba(99,102,241,.22)" },
  3: { glow: "rgba(251,191,36,.7)",   stroke: "#fbbf24",               fill: "rgba(245,158,11,.22)" },
};

// Tree data: nodes positioned in normalized space (0..100)
const TREE = {
  nodes: [
    // root
    { id: "core", x: 50, y: 50, tier: 3, label: "Polymath Core",     size: 22, root: true },
    // four branches
    { id: "mm",   x: 22, y: 28, tier: 2, label: "Mental Models" },
    { id: "sys",  x: 78, y: 28, tier: 1, label: "Systems Thinking" },
    { id: "wri",  x: 22, y: 72, tier: 2, label: "Writing" },
    { id: "beh",  x: 78, y: 72, tier: 1, label: "Behavioral Econ." },
    // mental models leaves
    { id: "mm1",  x: 8,  y: 12, tier: 2, label: "First Principles" },
    { id: "mm2",  x: 8,  y: 38, tier: 1, label: "Inversion" },
    // systems leaves
    { id: "sys1", x: 92, y: 12, tier: 1, label: "Feedback Loops" },
    { id: "sys2", x: 92, y: 38, tier: 0, label: "Leverage Points" },
    // writing leaves
    { id: "wri1", x: 8,  y: 62, tier: 2, label: "Tight Drafts" },
    { id: "wri2", x: 8,  y: 88, tier: 0, label: "Voice & Tone" },
    // behavioral leaves
    { id: "beh1", x: 92, y: 62, tier: 1, label: "Cognitive Biases" },
    { id: "beh2", x: 92, y: 88, tier: 0, label: "Habit Loops" },
  ],
  edges: [
    ["core","mm"], ["core","sys"], ["core","wri"], ["core","beh"],
    ["mm","mm1"], ["mm","mm2"],
    ["sys","sys1"], ["sys","sys2"],
    ["wri","wri1"], ["wri","wri2"],
    ["beh","beh1"], ["beh","beh2"],
  ],
};

const NODE_DETAILS = {
  mm: {
    desc: "Frameworks for clearer thinking — the operating system underneath every other skill.",
    actions: [
      { id: 1, done: true,  text: "Read 'Poor Charlie's Almanack' Ch. 1 — Mental Models talk" },
      { id: 2, done: true,  text: "Catalog 10 favorite models in personal notes" },
      { id: 3, done: false, text: "Apply Inversion to next product decision" },
      { id: 4, done: false, text: "Teach 'opportunity cost' to a non-expert", xp: 80 },
    ],
  },
};

const SkillTreeSVG = ({ selected, onSelect }) => {
  const W = 720, H = 480;
  const px = x => (x / 100) * W;
  const py = y => (y / 100) * H;
  const nodeMap = Object.fromEntries(TREE.nodes.map(n => [n.id, n]));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block" }} preserveAspectRatio="xMidYMid meet">
      <defs>
        <radialGradient id="bg-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(99,102,241,.18)"/>
          <stop offset="100%" stopColor="rgba(99,102,241,0)"/>
        </radialGradient>
        <linearGradient id="edge-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#a78bfa" stopOpacity=".5"/>
          <stop offset="1" stopColor="#22d3ee" stopOpacity=".5"/>
        </linearGradient>
        <filter id="soft" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      <rect width={W} height={H} fill="url(#bg-glow)" opacity=".6"/>

      {/* faint constellation grid */}
      <g opacity=".05" stroke="#a78bfa" strokeWidth=".5">
        {Array.from({ length: 8 }, (_, i) => (
          <line key={i} x1={0} y1={(i + 1) * H / 9} x2={W} y2={(i + 1) * H / 9}/>
        ))}
        {Array.from({ length: 12 }, (_, i) => (
          <line key={"v" + i} y1={0} x1={(i + 1) * W / 13} y2={H} x2={(i + 1) * W / 13}/>
        ))}
      </g>

      {/* edges */}
      <g>
        {TREE.edges.map(([a, b], i) => {
          const A = nodeMap[a], B = nodeMap[b];
          const dim = Math.max(A.tier, B.tier) === 0 ? .25 : .7;
          return (
            <line key={i} x1={px(A.x)} y1={py(A.y)} x2={px(B.x)} y2={py(B.y)}
              stroke="url(#edge-grad)" strokeWidth={A.root || B.root ? 1.8 : 1.2}
              opacity={dim}
              strokeDasharray={Math.max(A.tier, B.tier) === 0 ? "3 4" : "0"}
            />
          );
        })}
      </g>

      {/* nodes */}
      <g>
        {TREE.nodes.map(n => {
          const t = TIER_COLOR[n.tier];
          const r = n.root ? 22 : 14;
          const isSelected = selected === n.id;
          return (
            <g key={n.id} style={{ cursor: "pointer" }} onClick={() => onSelect(n.id)}>
              {/* outer aura when active */}
              {n.tier > 0 && (
                <circle cx={px(n.x)} cy={py(n.y)} r={r + 10} fill={t.glow} opacity=".25" filter="url(#soft)"/>
              )}
              {/* star polygon */}
              <StarShape cx={px(n.x)} cy={py(n.y)} r={r} fill={t.fill} stroke={t.stroke} strokeWidth={isSelected ? 2.4 : 1.5} tier={n.tier}/>
              {/* selected ring */}
              {isSelected && (
                <circle cx={px(n.x)} cy={py(n.y)} r={r + 7} fill="none" stroke={t.stroke} strokeWidth="1" strokeDasharray="2 3" opacity=".8"/>
              )}
              {/* center dot */}
              <circle cx={px(n.x)} cy={py(n.y)} r={n.root ? 5 : 3} fill={n.tier >= 2 ? "#fff" : n.tier === 1 ? t.stroke : "rgba(255,255,255,.5)"}
                style={ n.tier > 0 ? { filter: `drop-shadow(0 0 8px ${t.stroke})` } : {}}/>
              {/* label */}
              <text x={px(n.x)} y={py(n.y) + r + 18} textAnchor="middle" fontFamily="Outfit" fontSize={n.root ? 14 : 11}
                fontWeight={n.root ? 600 : 500}
                fill={n.tier === 0 ? "var(--text-mute)" : "var(--text)"}>
                {n.label}
              </text>
              {/* tier text */}
              {!n.root && (
                <text x={px(n.x)} y={py(n.y) + r + 32} textAnchor="middle" fontFamily="JetBrains Mono" fontSize="9"
                  fill={t.stroke} opacity=".8" letterSpacing=".1em">{LVL_TIERS[n.tier].toUpperCase()}</text>
              )}
            </g>
          );
        })}
      </g>
    </svg>
  );
};

// 5-point star
const StarShape = ({ cx, cy, r, fill, stroke, strokeWidth, tier }) => {
  const points = [];
  const inner = r * 0.45;
  for (let i = 0; i < 10; i++) {
    const a = (Math.PI / 5) * i - Math.PI / 2;
    const rad = i % 2 === 0 ? r : inner;
    points.push(`${cx + Math.cos(a) * rad},${cy + Math.sin(a) * rad}`);
  }
  return <polygon className={tier > 0 ? "node-glow" : ""} points={points.join(" ")} fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinejoin="round" style={{ color: stroke }}/>;
};

// Stats radar
const STATS = [
  { key: "cont", label: "Continuity",  value: 82 },
  { key: "mast", label: "Mastery",     value: 64 },
  { key: "depth",label: "Depth",       value: 78 },
  { key: "brea", label: "Breadth",     value: 58 },
  { key: "ref",  label: "Reflection",  value: 71 },
  { key: "act",  label: "Action",      value: 86 },
];
const PREV_STATS = [70, 60, 65, 52, 55, 78];

const StatsRadar = ({ size = 360 }) => {
  const cx = size / 2, cy = size / 2;
  const radius = size * 0.36;
  const n = STATS.length;
  const point = (i, v) => {
    const a = (Math.PI * 2 / n) * i - Math.PI / 2;
    return [cx + Math.cos(a) * radius * (v / 100), cy + Math.sin(a) * radius * (v / 100)];
  };
  const polyPts = vals => vals.map((v, i) => point(i, v).join(",")).join(" ");

  return (
    <svg viewBox={`0 0 ${size} ${size}`} style={{ width: "100%", height: "auto", display: "block" }}>
      <defs>
        <radialGradient id="radar-fill" cx="50%" cy="50%">
          <stop offset="0" stopColor="#6366f1" stopOpacity=".5"/>
          <stop offset="1" stopColor="#22d3ee" stopOpacity=".15"/>
        </radialGradient>
        <linearGradient id="radar-stroke" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#a78bfa"/>
          <stop offset="1" stopColor="#22d3ee"/>
        </linearGradient>
      </defs>

      {/* concentric rings */}
      {[0.25, 0.5, 0.75, 1].map((k, i) => (
        <polygon key={i} points={polyPts(Array(n).fill(100 * k))}
          fill="none" stroke="rgba(255,255,255,.07)" strokeWidth="1"/>
      ))}
      {/* axis lines */}
      {STATS.map((_, i) => {
        const [x2, y2] = point(i, 100);
        return <line key={i} x1={cx} y1={cy} x2={x2} y2={y2} stroke="rgba(255,255,255,.08)" strokeWidth="1"/>;
      })}

      {/* previous (ghost) */}
      <polygon points={polyPts(PREV_STATS)} fill="none" stroke="rgba(255,255,255,.25)" strokeDasharray="3 3" strokeWidth="1"/>

      {/* current */}
      <polygon points={polyPts(STATS.map(s => s.value))}
        fill="url(#radar-fill)"
        stroke="url(#radar-stroke)"
        strokeWidth="2"
        style={{ filter: "drop-shadow(0 0 10px rgba(129,140,248,.5))" }}/>

      {/* points + values */}
      {STATS.map((s, i) => {
        const [x, y] = point(i, s.value);
        return (
          <g key={s.key}>
            <circle cx={x} cy={y} r="4" fill="#fff" style={{ filter: "drop-shadow(0 0 6px #a78bfa)" }}/>
          </g>
        );
      })}

      {/* labels */}
      {STATS.map((s, i) => {
        const [lx, ly] = point(i, 122);
        const [vx, vy] = point(i, 138);
        return (
          <g key={s.key + "l"}>
            <text x={lx} y={ly} textAnchor="middle" fontFamily="Outfit" fontSize="12" fontWeight="500" fill="var(--text)">{s.label}</text>
            <text x={vx} y={vy + 4} textAnchor="middle" fontFamily="JetBrains Mono" fontSize="10" fill="var(--cyan-2)">{s.value}</text>
          </g>
        );
      })}
    </svg>
  );
};

const SkillsView = () => {
  const [selected, setSelected] = React.useState("mm");
  const sel = TREE.nodes.find(n => n.id === selected);
  const details = NODE_DETAILS[selected];
  const [actions, setActions] = React.useState(NODE_DETAILS.mm.actions);
  const toggle = id => setActions(xs => xs.map(x => x.id === id ? { ...x, done: !x.done } : x));

  return (
    <div>
      {/* Stats radar + meta */}
      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 16, marginBottom: 20 }}>
        <Card style={{ padding: 22 }}>
          <SectionTitle eyebrow="Stats Radar" title="Six dimensions of your learning"
            accent="cyan"
            action={<span className="chip" style={{ color: "var(--cyan-2)" }}><Icon name="sparkle" size={10}/> +9% vs. last week</span>} />
          <StatsRadar size={420}/>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginTop: 16 }}>
            {STATS.map((s, i) => {
              const delta = s.value - PREV_STATS[i];
              return (
                <div key={s.key} className="glass-soft" style={{ padding: 12, display: "flex", flexDirection: "column", gap: 4 }}>
                  <div className="mono" style={{ fontSize: 9, color: "var(--text-mute)", letterSpacing: ".12em", textTransform: "uppercase" }}>{s.label}</div>
                  <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
                    <div style={{ fontFamily: "Outfit", fontSize: 20, fontWeight: 600 }}>{s.value}</div>
                    <div className="mono" style={{ fontSize: 10, color: delta >= 0 ? "var(--green)" : "var(--rose)" }}>
                      {delta >= 0 ? "+" : ""}{delta}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card className="ring-indigo" style={{ padding: 22 }}>
            <div className="mono" style={{ fontSize: 10, color: "var(--indigo-2)", letterSpacing: ".12em", textTransform: "uppercase", marginBottom: 6 }}>Archetype Snapshot</div>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ fontSize: 38 }}>🔮</div>
              <div>
                <div style={{ fontFamily: "Outfit", fontSize: 22, fontWeight: 600 }} className="grad-indigo">Polymath</div>
                <div style={{ fontSize: 12, color: "var(--text-dim)" }}>Balanced across Depth &amp; Breadth — leaning Action.</div>
              </div>
            </div>
            <div style={{ height: 16 }}/>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <span className="chip" style={{ color: "var(--indigo-2)" }}>Depth 78</span>
              <span className="chip" style={{ color: "var(--indigo-2)" }}>Breadth 58</span>
              <span className="chip" style={{ color: "var(--amber-2)" }}>Action 86</span>
            </div>
            <div style={{ fontSize: 12, color: "var(--text-mute)", marginTop: 14, lineHeight: 1.5 }}>
              Suggestion: nudge <span style={{ color: "var(--text)" }}>Breadth</span> by trying one source outside your usual domains this week.
            </div>
          </Card>

          <Card style={{ padding: 22 }}>
            <div className="mono" style={{ fontSize: 10, color: "var(--cyan-2)", letterSpacing: ".12em", textTransform: "uppercase", marginBottom: 12 }}>Skill Tier Legend</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {LVL_TIERS.map((t, i) => {
                const tc = TIER_COLOR[i];
                return (
                  <div key={t} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ position: "relative", width: 22, height: 22, display: "grid", placeItems: "center" }}>
                      <svg width="22" height="22" viewBox="-12 -12 24 24"><StarShape cx={0} cy={0} r={10} fill={tc.fill} stroke={tc.stroke} strokeWidth={1.4} tier={i}/></svg>
                    </div>
                    <div style={{ flex: 1, fontSize: 13, fontWeight: 500, color: tc.stroke }}>{t}</div>
                    <div className="mono" style={{ fontSize: 10, color: "var(--text-mute)" }}>
                      {["familiar with", "can explain", "can apply", "can teach"][i]}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>

      {/* Tree */}
      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 16 }}>
        <Card style={{ padding: 22 }}>
          <SectionTitle eyebrow="Skill Tree" title="Interactive map of your competencies" accent="indigo"
            action={<div style={{ display: "flex", gap: 6 }}>
              <button className="btn" style={{ padding: "6px 10px", fontSize: 11 }}><Icon name="plus" size={11}/> Plant skill</button>
            </div>}/>
          <SkillTreeSVG selected={selected} onSelect={setSelected}/>
        </Card>

        <Card className="ring-indigo" style={{ padding: 22 }}>
          <div className="mono" style={{ fontSize: 10, color: "var(--indigo-2)", letterSpacing: ".12em", textTransform: "uppercase", marginBottom: 6 }}>Selected Node</div>
          <h3 style={{ fontFamily: "Outfit", fontSize: 22, fontWeight: 600, marginBottom: 4 }}>{sel.label}</h3>
          <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
            <span className="chip" style={{ color: TIER_COLOR[sel.tier].stroke }}><Icon name="star" size={10}/> {LVL_TIERS[sel.tier]}</span>
            <span className="chip">3 sources linked</span>
            <span className="chip"><Icon name="bolt" size={10}/> 412 XP earned</span>
          </div>
          <div style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.55, marginBottom: 18 }}>
            {details ? details.desc : "Click any star in the tree to inspect its missions, related sources, and unlock paths."}
          </div>

          <ProgressBar value={68} accent="indigo" height={5} label="To next tier" sub="68% · need 280 XP"/>

          <div style={{ height: 18 }}/>
          <div className="mono" style={{ fontSize: 10, color: "var(--text-mute)", letterSpacing: ".12em", textTransform: "uppercase", marginBottom: 10 }}>Sub-missions</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {actions.map(a => (
              <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 10, background: "rgba(255,255,255,.025)", border: "1px solid var(--line)", opacity: a.done ? .55 : 1 }}>
                <Check on={a.done} onClick={() => toggle(a.id)}/>
                <div style={{ flex: 1, fontSize: 12.5, color: "var(--text)", lineHeight: 1.4, textDecoration: a.done ? "line-through" : "none", textDecorationColor: "var(--text-mute)" }}>{a.text}</div>
                {a.xp && <span className="chip" style={{ color: "var(--amber-2)", fontSize: 10 }}>+{a.xp} XP</span>}
              </div>
            ))}
          </div>

          <button className="btn" style={{ marginTop: 14, width: "100%", justifyContent: "center" }}>
            <Icon name="plus" size={12}/> Add sub-mission
          </button>
        </Card>
      </div>
    </div>
  );
};

window.SkillsView = SkillsView;
