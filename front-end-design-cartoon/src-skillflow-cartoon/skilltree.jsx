// Skill Tree + Radar — cartoon

const LVL_TIERS = ["Awareness", "Understanding", "Applied", "Mastered"];
const SKILL_TIER_STY = {
  0: { fill: "#FFFFFF", chip: "chip", emoji: "🌱", label: "tau dikit" },
  1: { fill: "#DDF0FF", chip: "chip-sky",   emoji: "🌿", label: "bisa jelasin" },
  2: { fill: "#F2EAFF", chip: "chip-grape", emoji: "🌳", label: "bisa apply" },
  3: { fill: "#FFD93D", chip: "chip-sun",   emoji: "🌟", label: "bisa ngajarin" },
};

const TREE = {
  nodes: [
    { id: "core", x: 50, y: 50, tier: 3, label: "Polymath Core",     root: true },
    { id: "mm",   x: 22, y: 28, tier: 2, label: "Mental Models" },
    { id: "sys",  x: 78, y: 28, tier: 1, label: "Systems Thinking" },
    { id: "wri",  x: 22, y: 72, tier: 2, label: "Writing" },
    { id: "beh",  x: 78, y: 72, tier: 1, label: "Behavioral Econ." },
    { id: "mm1",  x: 6,  y: 12, tier: 2, label: "First Principles" },
    { id: "mm2",  x: 6,  y: 38, tier: 1, label: "Inversion" },
    { id: "sys1", x: 94, y: 12, tier: 1, label: "Feedback Loops" },
    { id: "sys2", x: 94, y: 38, tier: 0, label: "Leverage Points" },
    { id: "wri1", x: 6,  y: 62, tier: 2, label: "Tight Drafts" },
    { id: "wri2", x: 6,  y: 88, tier: 0, label: "Voice & Tone" },
    { id: "beh1", x: 94, y: 62, tier: 1, label: "Cognitive Biases" },
    { id: "beh2", x: 94, y: 88, tier: 0, label: "Habit Loops" },
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
    desc: "Framework biar mikir lebih jernih — operating system di bawah skill lain.",
    actions: [
      { id: 1, done: true,  text: "Baca 'Poor Charlie's Almanack' Ch. 1 — Mental Models talk" },
      { id: 2, done: true,  text: "Catat 10 model favorit di notes pribadi" },
      { id: 3, done: false, text: "Apply Inversion pada keputusan produk berikutnya" },
      { id: 4, done: false, text: "Ajarin 'opportunity cost' ke non-expert", xp: 80 },
    ],
  },
};

const SkillTreeSVG = ({ selected, onSelect }) => {
  const W = 740, H = 480;
  const px = x => (x / 100) * W;
  const py = y => (y / 100) * H;
  const nodeMap = Object.fromEntries(TREE.nodes.map(n => [n.id, n]));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block" preserveAspectRatio="xMidYMid meet">
      <defs>
        <pattern id="dots-pat" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1.2" fill="#1F1A2E" opacity=".12"/>
        </pattern>
      </defs>

      <rect width={W} height={H} fill="url(#dots-pat)"/>

      {/* edges — wobbly lines */}
      {TREE.edges.map(([a, b], i) => {
        const A = nodeMap[a], B = nodeMap[b];
        const x1 = px(A.x), y1 = py(A.y), x2 = px(B.x), y2 = py(B.y);
        const mx = (x1 + x2) / 2 + (Math.sin(i) * 12);
        const my = (y1 + y2) / 2 + (Math.cos(i) * 10);
        const max = Math.max(A.tier, B.tier);
        const dim = max === 0;
        return (
          <path key={i} d={`M${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`}
            fill="none"
            stroke="#1F1A2E"
            strokeWidth={A.root || B.root ? 3 : 2.5}
            opacity={dim ? .25 : 1}
            strokeDasharray={dim ? "5 6" : "0"}
            strokeLinecap="round"
          />
        );
      })}

      {/* nodes */}
      {TREE.nodes.map(n => {
        const t = SKILL_TIER_STY[n.tier];
        const r = n.root ? 32 : 22;
        const isSel = selected === n.id;
        return (
          <g key={n.id} style={{ cursor: "pointer" }} onClick={() => onSelect(n.id)}>
            {/* offset shadow as second polygon */}
            <g transform={`translate(${px(n.x) + 3}, ${py(n.y) + 3})`}>
              {n.tier === 3 ?
                <StarShape cx={0} cy={0} r={r} fill="#1F1A2E" stroke="#1F1A2E" strokeWidth={0}/>
                : <circle cx="0" cy="0" r={r} fill="#1F1A2E"/>}
            </g>
            <g transform={`translate(${px(n.x)}, ${py(n.y)})`}>
              {n.tier === 3 ?
                <StarShape cx={0} cy={0} r={r} fill={t.fill}/>
                : <circle cx="0" cy="0" r={r} fill={t.fill} stroke="#1F1A2E" strokeWidth="2.5"/>}
              {/* center emoji */}
              <text x="0" y="6" textAnchor="middle" fontSize={n.root ? 26 : 18} style={{ pointerEvents: "none" }}>{t.emoji}</text>
              {/* selected halo */}
              {isSel && (
                <circle cx="0" cy="0" r={r + 6} fill="none" stroke="#FF6B6B" strokeWidth="2.5" strokeDasharray="3 4" className="spin-slow" style={{ transformOrigin: "center" }}/>
              )}
            </g>
            {/* label */}
            <text x={px(n.x)} y={py(n.y) + r + 18} textAnchor="middle"
              fontFamily="Fraunces" fontSize={n.root ? 16 : 13} fontWeight={n.root ? 800 : 700}
              fill="#1F1A2E" opacity={n.tier === 0 ? .55 : 1}>
              {n.label}
            </text>
            {!n.root && (
              <text x={px(n.x)} y={py(n.y) + r + 33} textAnchor="middle"
                fontFamily="JetBrains Mono" fontSize="10" fill="#5C4E6F" letterSpacing=".1em">
                {LVL_TIERS[n.tier].toUpperCase()}
              </text>
            )}
          </g>
        );
      })}

      {/* doodle accents */}
      <text x="20" y="40" fontSize="22">✨</text>
      <text x={W - 36} y={H - 24} fontSize="22">🌟</text>
    </svg>
  );
};

// Stats radar — cartoon style
const STATS = [
  { key: "cont", label: "Continuity",  value: 82, emoji: "🔥" },
  { key: "mast", label: "Mastery",     value: 64, emoji: "🎯" },
  { key: "depth",label: "Depth",       value: 78, emoji: "🌊" },
  { key: "brea", label: "Breadth",     value: 58, emoji: "🧭" },
  { key: "ref",  label: "Reflection",  value: 71, emoji: "🪞" },
  { key: "act",  label: "Action",      value: 86, emoji: "⚡" },
];
const PREV_STATS = [70, 60, 65, 52, 55, 78];

const StatsRadar = ({ size = 380 }) => {
  const cx = size / 2, cy = size / 2;
  const radius = size * 0.34;
  const n = STATS.length;
  const point = (i, v) => {
    const a = (Math.PI * 2 / n) * i - Math.PI / 2;
    return [cx + Math.cos(a) * radius * (v / 100), cy + Math.sin(a) * radius * (v / 100)];
  };
  const polyPts = vals => vals.map((v, i) => point(i, v).join(",")).join(" ");

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-auto block">
      {/* rings */}
      {[0.25, 0.5, 0.75, 1].map((k, i) => (
        <polygon key={i} points={polyPts(Array(n).fill(100 * k))}
          fill="#FFF6E5" stroke="#1F1A2E" strokeWidth="2" opacity={i === 3 ? 1 : .4}/>
      ))}
      {/* axes */}
      {STATS.map((_, i) => {
        const [x2, y2] = point(i, 100);
        return <line key={i} x1={cx} y1={cy} x2={x2} y2={y2} stroke="#1F1A2E" strokeWidth="1.5" strokeDasharray="3 4" opacity=".3"/>;
      })}

      {/* previous (ghost) */}
      <polygon points={polyPts(PREV_STATS)} fill="#B58CFF" fillOpacity=".2" stroke="#1F1A2E" strokeDasharray="3 4" strokeWidth="2"/>

      {/* current */}
      <polygon points={polyPts(STATS.map(s => s.value))}
        fill="#FF6B6B" fillOpacity=".5"
        stroke="#1F1A2E"
        strokeWidth="3"
        strokeLinejoin="round"
      />

      {/* points */}
      {STATS.map((s, i) => {
        const [x, y] = point(i, s.value);
        return (
          <g key={s.key}>
            <circle cx={x + 2} cy={y + 2} r="6" fill="#1F1A2E"/>
            <circle cx={x} cy={y} r="6" fill="#FFD93D" stroke="#1F1A2E" strokeWidth="2.5"/>
          </g>
        );
      })}

      {/* labels */}
      {STATS.map((s, i) => {
        const [lx, ly] = point(i, 122);
        return (
          <g key={s.key + "l"}>
            <text x={lx} y={ly - 4} textAnchor="middle" fontSize="18">{s.emoji}</text>
            <text x={lx} y={ly + 14} textAnchor="middle" fontFamily="Fraunces" fontSize="12" fontWeight="700" fill="#1F1A2E">{s.label}</text>
            <text x={lx} y={ly + 28} textAnchor="middle" fontFamily="JetBrains Mono" fontSize="11" fontWeight="700" fill="#E8434E">{s.value}</text>
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
      <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-5 mb-5">
        <Sticker className="p-5 bg-paper">
          <SectionTitle eyebrow="STATS RADAR" title="6 dimensi belajar" emoji="🕸️" marker="grape"
            action={<span className="chip chip-mint">✨ +9% vs minggu lalu</span>}/>
          <StatsRadar size={420}/>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3">
            {STATS.map((s, i) => {
              const delta = s.value - PREV_STATS[i];
              return (
                <div key={s.key} className="sticker-flat bg-cream p-2.5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[14px]">{s.emoji}</span>
                    <div className="font-mono text-[10px] font-bold" style={{ color: delta >= 0 ? "#3FA94F" : "#E8434E" }}>
                      {delta >= 0 ? "↗" : "↘"} {Math.abs(delta)}
                    </div>
                  </div>
                  <div className="eyebrow mb-0.5">{s.label}</div>
                  <div className="font-display font-black text-[18px] leading-none">{s.value}</div>
                </div>
              );
            })}
          </div>
        </Sticker>

        <div className="flex flex-col gap-4">
          <Sticker color="grape" className="p-5">
            <div className="eyebrow !text-ink mb-2">ARCHETYPE SNAPSHOT</div>
            <div className="flex items-center gap-4">
              <div className="text-[44px] floaty">🔮</div>
              <div>
                <div className="font-display font-black text-[26px] leading-none">Polymath</div>
                <div className="text-[12.5px] font-semibold text-ink mt-1">Seimbang Depth × Breadth — Action-heavy.</div>
              </div>
            </div>
            <div className="flex gap-1.5 flex-wrap mt-3">
              <span className="chip chip-coral">🌊 Depth 78</span>
              <span className="chip chip-sky">🧭 Breadth 58</span>
              <span className="chip chip-sun">⚡ Action 86</span>
            </div>
            <div className="text-[12px] font-semibold mt-3 leading-snug">
              💡 <strong>Tips:</strong> dorong <span className="marker-sun">Breadth</span> dengan coba 1 sumber dari domain baru minggu ini.
            </div>
          </Sticker>

          <Sticker className="p-5 bg-paper">
            <div className="eyebrow mb-3">SKILL TIER · LEGEND</div>
            <div className="flex flex-col gap-2">
              {LVL_TIERS.map((t, i) => {
                const ts = SKILL_TIER_STY[i];
                return (
                  <div key={t} className={`flex items-center gap-3 p-2 rounded-xl border-[2.5px] border-ink ${{ 0:"bg-cream", 1:"bg-ocean", 2:"bg-lilac", 3:"bg-sun" }[i]}`} style={{ boxShadow: "2px 2px 0 #1F1A2E" }}>
                    <div className="text-[20px]">{ts.emoji}</div>
                    <div className="flex-1 font-display font-extrabold text-[14px]">{t}</div>
                    <div className="font-mono text-[10px] font-bold text-ink-2">{ts.label}</div>
                  </div>
                );
              })}
            </div>
          </Sticker>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-5">
        <Sticker className="p-5 bg-paper">
          <SectionTitle eyebrow="SKILL TREE" title="Peta kemampuanmu" emoji="🌳" marker="mint"
            action={<button className="btn !text-[11px] !py-1.5 !px-3"><Icon name="plus" size={11}/> Plant skill</button>}/>
          <SkillTreeSVG selected={selected} onSelect={setSelected}/>
        </Sticker>

        <Sticker color="sun" className="p-5">
          <div className="eyebrow !text-ink mb-2">NODE TERPILIH</div>
          <h3 className="font-display font-black text-[26px] leading-tight mb-2">{sel.label}</h3>
          <div className="flex flex-wrap gap-1.5 mb-3">
            <span className={`chip ${SKILL_TIER_STY[sel.tier].chip}`}>{SKILL_TIER_STY[sel.tier].emoji} {LVL_TIERS[sel.tier]}</span>
            <span className="chip">📚 3 sumber linked</span>
            <span className="chip">⚡ 412 XP earned</span>
          </div>
          <div className="text-[13px] font-semibold leading-relaxed mb-4">
            {details ? details.desc : "Klik bintang manapun di tree untuk lihat misi, sumber, dan jalur unlock."}
          </div>

          <ProgressBar value={68} accent="coral" height={10} label="Ke tier berikutnya" sub="68% · butuh 280 XP"/>

          <div className="eyebrow mt-5 mb-2">SUB-MISSIONS</div>
          <div className="flex flex-col gap-2">
            {actions.map(a => (
              <div key={a.id} className={`sticker-flat bg-paper p-3 flex items-center gap-2.5 ${a.done ? "opacity-55" : ""}`}>
                <Check on={a.done} onClick={() => toggle(a.id)}/>
                <div className={`flex-1 text-[12.5px] font-semibold leading-snug ${a.done ? "line-through" : ""}`}>{a.text}</div>
                {a.xp && <span className="chip chip-coral !text-[10px]">+{a.xp}</span>}
              </div>
            ))}
          </div>

          <button className="btn w-full justify-center mt-3"><Icon name="plus" size={12}/> Tambah sub-mission</button>
        </Sticker>
      </div>
    </div>
  );
};

window.SkillsView = SkillsView;
