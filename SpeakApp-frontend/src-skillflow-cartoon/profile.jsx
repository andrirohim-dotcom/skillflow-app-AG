// Profile / Character sheet — cartoon

const ARCHETYPES = [
  { id: "poly", emoji: "🔮", name: "Polymath",   tag: "Eksplorer banyak domain",  active: true,  color: "grape" },
  { id: "deep", emoji: "🔱", name: "Deep Diver", tag: "Nyelam dalem di topik pilihan", color: "sky" },
  { id: "expl", emoji: "🧭", name: "Explorer",   tag: "Breadth-first, suka peta baru",   color: "mint" },
  { id: "stra", emoji: "⚔️", name: "Strategist", tag: "Action-biased synthesizer",        color: "coral" },
];

const TROPHIES = [
  { tier: "platinum", name: "Centurion",        desc: "100 hari streak tanpa putus",         emoji: "🔥", date: "Apr 2026", count: 1 },
  { tier: "gold",     name: "Library Walker",   desc: "25 buku dalam setahun",                emoji: "📚", date: "Mar 2026", count: 1 },
  { tier: "gold",     name: "Insight Mason",    desc: "500 insight unik tertangkap",          emoji: "💡", date: "Feb 2026", count: 1 },
  { tier: "silver",   name: "Reflection Adept", desc: "50 refleksi > 200 kata",                emoji: "🪞", date: "Jan 2026", count: 2 },
  { tier: "silver",   name: "Streak Keeper",    desc: "21-day streak 4 kali",                  emoji: "🔥", date: "Des 2025", count: 4 },
  { tier: "bronze",   name: "First Steps",      desc: "Onboarded ke SkillFlow",                emoji: "👣", date: "Nov 2025", count: 1 },
  { tier: "bronze",   name: "Crosspollinator",  desc: "Link 3 sumber ke 1 skill",              emoji: "🐝", date: "Nov 2025", count: 3 },
  { tier: "bronze",   name: "Audio Voyager",    desc: "50 jam podcast",                        emoji: "🎙️", date: "Des 2025", count: 1 },
];

const TROPHY_TIER_STY = {
  platinum: { bg: "bg-paper", chip: "chip", ribbon: "PLATINUM", emoji: "💎" },
  gold:     { bg: "bg-sun",   chip: "chip-sun", ribbon: "GOLD", emoji: "🥇" },
  silver:   { bg: "bg-ocean", chip: "chip-sky", ribbon: "SILVER", emoji: "🥈" },
  bronze:   { bg: "bg-peachy", chip: "chip-peach", ribbon: "BRONZE", emoji: "🥉" },
};

const Trophy = ({ t, i }) => {
  const ts = TROPHY_TIER_STY[t.tier];
  return (
    <Sticker className={`p-4 ${ts.bg} relative text-center`} style={{ transform: `rotate(${(i % 2 ? 1 : -1)}deg)` }}>
      {/* ribbon */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-ink text-sun border-[2px] border-ink rounded-md font-mono text-[9px] font-extrabold tracking-widest" style={{ boxShadow: "2px 2px 0 #FFD93D" }}>
        {ts.ribbon}
      </div>
      {/* count badge */}
      {t.count > 1 && (
        <div className="absolute top-2 right-2 px-2 py-0.5 bg-coral text-white border-[2px] border-ink rounded-full font-mono text-[10px] font-extrabold" style={{ boxShadow: "1.5px 1.5px 0 #1F1A2E" }}>
          ×{t.count}
        </div>
      )}
      <div className="mt-3 mb-2 text-[52px] floaty">{t.emoji}</div>
      <div className="font-display font-black text-[15px] mb-1.5 leading-tight">{t.name}</div>
      <div className="text-[11.5px] font-semibold text-ink-2 leading-snug mb-2 min-h-[32px]" style={{ textWrap: "pretty" }}>{t.desc}</div>
      <div className="font-mono text-[9.5px] text-ink-2 font-bold">{t.date}</div>
    </Sticker>
  );
};

const ArchetypeBadge = () => (
  <div className="relative shrink-0" style={{ width: 220, height: 220 }}>
    {/* spin background */}
    <svg className="absolute inset-0 spin-slow" viewBox="0 0 220 220">
      <circle cx="110" cy="110" r="98" fill="none" stroke="#1F1A2E" strokeWidth="2.5" strokeDasharray="4 8"/>
    </svg>
    {/* main hex */}
    <svg className="absolute inset-0" viewBox="0 0 220 220">
      <defs>
        <linearGradient id="ab-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFD93D"/>
          <stop offset=".5" stopColor="#FF8FA3"/>
          <stop offset="1" stopColor="#B58CFF"/>
        </linearGradient>
      </defs>
      {/* offset shadow */}
      <polygon points="113,33 175,68 175,138 113,173 51,138 51,68" fill="#1F1A2E"/>
      <polygon points="110,30 172,65 172,135 110,170 48,135 48,65" fill="url(#ab-grad)" stroke="#1F1A2E" strokeWidth="3"/>
      {/* inner hex */}
      <polygon points="110,48 156,72 156,128 110,152 64,128 64,72" fill="#FFF" stroke="#1F1A2E" strokeWidth="2.5"/>
      {/* corner dots */}
      {[[110,30],[172,65],[172,135],[110,170],[48,135],[48,65]].map(([x,y], i) =>
        <circle key={i} cx={x} cy={y} r="5" fill="#FFD93D" stroke="#1F1A2E" strokeWidth="2"/>
      )}
    </svg>
    <div className="absolute inset-0 grid place-items-center">
      <div className="text-[72px] wiggle" style={{ filter: "drop-shadow(2px 2px 0 #1F1A2E)" }}>🔮</div>
    </div>
    {/* sparkle stickers */}
    <div className="absolute -top-2 -right-2 text-[28px] floaty">✨</div>
    <div className="absolute -bottom-1 -left-3 text-[24px] bouncey">⭐</div>
  </div>
);

const LevelCurve = () => {
  const levels = Array.from({ length: 15 }, (_, i) => ({ lvl: i + 1, xp: Math.round(500 * Math.pow(1.18, i)) }));
  const max = levels[levels.length - 1].xp;
  const cur = 12, prog = 7280, next = 9500;
  return (
    <div>
      <div className="flex items-end justify-between mb-3">
        <div>
          <div className="eyebrow mb-1">LEVELING CURVE</div>
          <div className="font-display font-black text-[20px] leading-none">
            <span className="text-ink-2">Lv</span> {cur} → <span className="marker-sun">Lv {cur + 1}</span> 🚀
          </div>
        </div>
        <div className="font-mono text-[11px] font-bold text-right">
          <div><span className="text-coral text-[15px]">{prog.toLocaleString()}</span> / {next.toLocaleString()} XP</div>
          <div className="text-ink-2 mt-0.5">2,220 XP lagi</div>
        </div>
      </div>

      <div className="flex items-end gap-1.5 h-32 p-3 bg-cream rounded-2xl border-[2.5px] border-ink" style={{ boxShadow: "3px 3px 0 #1F1A2E" }}>
        {levels.map(l => {
          const h = (l.xp / max) * 98;
          const isCur = l.lvl === cur;
          const isPast = l.lvl < cur;
          const bg = isCur ? "#FF6B6B" : isPast ? "#B58CFF" : "#FFF";
          return (
            <div key={l.lvl} className="flex-1 flex flex-col items-center gap-1">
              <div style={{ height: h, width: "100%", background: bg, border: "2px solid #1F1A2E", borderBottom: "none", borderTopLeftRadius: 5, borderTopRightRadius: 5, position: "relative" }}>
                {isCur && <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[14px] bouncey">⬇️</div>}
              </div>
              <div className={`font-mono text-[9px] ${isCur ? "font-extrabold text-coral" : "font-bold text-ink-2"}`}>{l.lvl}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-3 gap-2.5 mt-3">
        <div className="sticker-flat bg-paper p-2.5">
          <div className="eyebrow mb-1">XP/HARI</div>
          <div className="font-display font-black text-[20px] leading-none">312</div>
        </div>
        <div className="sticker-flat bg-paper p-2.5">
          <div className="eyebrow mb-1">KE LV 13</div>
          <div className="font-display font-black text-[20px] leading-none">~7 hari</div>
        </div>
        <div className="sticker-flat bg-coral p-2.5 text-white">
          <div className="eyebrow !text-white/80 mb-1">PERK Lv 13</div>
          <div className="font-display font-black text-[14px] leading-tight">Custom rituals 🎁</div>
        </div>
      </div>
    </div>
  );
};

const BountyBoard = () => {
  const bounties = [
    { type: "Daily",  title: "Capture 3 insight fresh",                xp: 60,   prog: 2,  of: 3,   exp: "8j",       c: "sky",   e: "💡" },
    { type: "Daily",  title: "45 menit deep work",                      xp: 80,   prog: 22, of: 45,  exp: "8j",       c: "sky",   e: "🎧" },
    { type: "Weekly", title: "Baca 100 halaman dari 2+ sumber",         xp: 250,  prog: 64, of: 100, exp: "2h 14j",   c: "grape", e: "📚" },
    { type: "Weekly", title: "Publish refleksi 200 kata",               xp: 250,  prog: 0,  of: 1,   exp: "2h 14j",   c: "grape", e: "✍️" },
    { type: "Epic",   title: "Finish Thinking, Fast & Slow",            xp: 1200, prog: 64, of: 100, exp: "18 hari",  c: "coral", e: "🧠" },
    { type: "Epic",   title: "Capai Applied tier di Systems",           xp: 1500, prog: 38, of: 100, exp: "30 hari",  c: "coral", e: "🔗" },
  ];
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {bounties.map((b, i) => {
        const bg = { sky:"bg-ocean", grape:"bg-lilac", coral:"bg-peachy" }[b.c];
        const chipColor = { sky:"chip-sky", grape:"chip-grape", coral:"chip-coral" }[b.c];
        const pct = (b.prog / b.of) * 100;
        return (
          <Sticker key={i} className={`p-4 ${bg} flex flex-col gap-2.5`}>
            <div className="flex items-center justify-between gap-2">
              <span className={`chip ${chipColor} !text-[10px]`}>{b.type === "Daily" ? "📅" : b.type === "Weekly" ? "🗓️" : "⚔️"} {b.type}</span>
              <span className="font-mono text-[10px] font-bold text-ink-2">⏳ {b.exp}</span>
            </div>
            <div className="flex items-start gap-2">
              <div className="text-[28px] shrink-0">{b.e}</div>
              <div className="font-display font-extrabold text-[14.5px] leading-tight" style={{ textWrap: "pretty" }}>{b.title}</div>
            </div>
            <ProgressBar value={pct} accent={b.c} height={8} label={`${b.prog} / ${b.of}`} sub={`${Math.round(pct)}%`}/>
            <div className="flex justify-between items-center mt-auto">
              <span className="chip chip-sun !text-[10px]">⚡ +{b.xp} XP</span>
              <button className="btn !text-[11px] !py-1.5 !px-3">Buka <Icon name="arrow" size={11}/></button>
            </div>
          </Sticker>
        );
      })}
    </div>
  );
};

const ProfileView = () => {
  return (
    <div>
      {/* Hero */}
      <Sticker color="grape" size="lg" className="p-7 relative overflow-hidden mb-5">
        {/* doodle bg */}
        <div className="absolute inset-0 pointer-events-none opacity-50">
          <div className="absolute top-6 right-10 text-3xl floaty">🌟</div>
          <div className="absolute top-20 right-32 text-2xl bouncey">✨</div>
          <div className="absolute bottom-8 right-72 text-2xl wiggle">💫</div>
          <div className="absolute top-1/2 left-1/3 text-2xl floaty">⭐</div>
        </div>

        <div className="relative grid grid-cols-1 lg:grid-cols-[auto_1fr_auto] gap-7 items-center">
          <ArchetypeBadge/>
          <div className="min-w-0">
            <div className="eyebrow !text-ink mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-coral pulsey"/>
              LEARNER ARCHETYPE
            </div>
            <h1 className="font-display font-black text-[42px] lg:text-[52px] leading-[1.02] mb-3" style={{ textWrap: "balance" }}>
              Arya — sang <span className="marker-sun">Polymath</span> 🔮
            </h1>
            <div className="text-[14.5px] font-semibold max-w-xl leading-relaxed mb-4 text-ink">
              Kamu nyebar akar ke banyak domain dan bikin ide tumbuh dari hasil cross-pollination. Stat curve-mu condong ke <strong>Action</strong>, tapi <strong>Reflection</strong> lagi naik — kombo berbahaya yang asik!
            </div>
            <div className="flex flex-wrap gap-1.5">
              <span className="chip chip-coral">⭐ Lv 12 · 7,280 XP</span>
              <span className="chip chip-sun">🔥 Streak 27 hari</span>
              <span className="chip chip-mint">🏆 14 tropi</span>
              <span className="chip">📚 31 sumber</span>
            </div>
          </div>

          <div className="lg:max-w-[260px]">
            <div className="eyebrow !text-ink mb-2">Archetype lain</div>
            <div className="flex flex-col gap-2">
              {ARCHETYPES.filter(a => !a.active).map(a => {
                const bg = { sky:"bg-ocean", mint:"bg-minty", coral:"bg-peachy" }[a.color];
                return (
                  <div key={a.id} className={`sticker-flat ${bg} p-2.5 flex items-center gap-2.5 cursor-pointer hover:translate-x-[-2px] transition-transform`}>
                    <div className="text-[24px]">{a.emoji}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-display font-black text-[14px] leading-none">{a.name}</div>
                      <div className="text-[11px] font-semibold text-ink-2 truncate mt-0.5">{a.tag}</div>
                    </div>
                    <Icon name="chevron" size={13}/>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Sticker>

      {/* Level + Bounty */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-5 mb-5">
        <Sticker className="p-5 bg-paper">
          <LevelCurve/>
        </Sticker>
        <Sticker className="p-5 bg-paper">
          <SectionTitle eyebrow="QUEST & BOUNTY BOARD" title="Misi harian & epik" emoji="⚔️" marker="coral"
            action={<div className="flex gap-1.5">
              <div className="tab active coral">Semua</div>
              <div className="tab">Daily</div>
              <div className="tab">Weekly</div>
              <div className="tab">Epic</div>
            </div>}/>
          <BountyBoard/>
        </Sticker>
      </div>

      {/* Trophy room */}
      <Sticker size="lg" className="p-6 bg-paper">
        <SectionTitle eyebrow="TROPHY ROOM" title="Etalase pencapaian" emoji="🏆" marker="sun"
          action={<div className="flex gap-1.5 flex-wrap">
            {["Semua", "Platinum", "Gold", "Silver", "Bronze"].map((t, i) => (
              <div key={t} className={`tab ${i === 0 ? "active" : ""}`}>{t}</div>
            ))}
          </div>}/>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-5">
          {TROPHIES.map((t, i) => <Trophy key={i} t={t} i={i}/>)}
        </div>
      </Sticker>
    </div>
  );
};

window.ProfileView = ProfileView;
