// Dashboard view — cartoon

const DailyBanner = () => (
  <Sticker color="coral" size="lg" className="relative overflow-hidden mb-5 p-7 text-white">
    {/* doodle background */}
    <div className="absolute inset-0 pointer-events-none opacity-40">
      <svg className="absolute -right-4 top-0 spin-slow" width="180" height="180" viewBox="0 0 100 100">
        <g stroke="#FFF" strokeWidth="1.5" fill="none" strokeLinecap="round">
          <circle cx="50" cy="50" r="45" strokeDasharray="3 6"/>
          <path d="M50 5 L50 15 M50 85 L50 95 M5 50 L15 50 M85 50 L95 50"/>
        </g>
      </svg>
      <div className="absolute top-6 right-32 text-3xl floaty">⭐</div>
      <div className="absolute bottom-8 right-48 text-2xl bouncey">✨</div>
      <div className="absolute bottom-12 left-10 text-2xl floaty">💫</div>
    </div>

    <div className="relative grid lg:grid-cols-[1.4fr_1fr] gap-7 items-start">
      <div className="min-w-0">
        <div className="eyebrow !text-white/80 mb-3 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-sun pulsey"/>
          Briefing harian · Rabu, 20 Mei
        </div>
        <h2 className="font-display font-black text-[34px] lg:text-[40px] leading-[1.04] mb-4 text-white" style={{ textWrap: "balance" }}>
          Tiga sesi <span className="bg-sun text-ink px-2 rounded-lg border-[2.5px] border-ink inline-block -rotate-2" style={{ boxShadow: "3px 3px 0 #1F1A2E" }}>deep&nbsp;work</span> lagi sampai <span className="underline decoration-wavy decoration-sun decoration-[4px]">Level 13</span>! 🎉
        </h2>
        <div className="text-[14px] font-semibold mb-5 max-w-xl leading-relaxed text-white/90">
          Kemarin kamu berhenti di chapter 9 “Thinking, Fast &amp; Slow”. Yuk lanjut — Selasa adalah hari baca terbaikmu 💪
        </div>
        <div className="flex flex-wrap gap-2.5">
          <button className="btn btn-sun"><Icon name="play" size={15}/> Lanjut baca</button>
          <button className="btn"><Icon name="compass" size={15}/> Atur hari ini</button>
          <button className="btn !bg-white/15 !text-white !border-white/40" style={{ boxShadow: "3px 3px 0 rgba(31,26,46,.4)" }}>🌙 Review kemarin</button>
        </div>
      </div>

      <div className="sticker bg-paper p-4 text-ink relative">
        <div className="absolute -top-3 -right-3 px-2 py-0.5 bg-sun border-[2px] border-ink rounded-full text-[10px] font-mono font-bold rotate-3" style={{ boxShadow: "2px 2px 0 #1F1A2E" }}>TARGET HARI INI 🎯</div>
        <div className="flex flex-col gap-3 mt-1">
          {[
            { l: "Deep work",    v: 85, t: "60 / 90 menit", c: "coral", e: "🎧" },
            { l: "Halaman baca", v: 62, t: "31 / 50 pp",    c: "mint",  e: "📖" },
            { l: "Review kartu", v: 33, t: "1 / 3 kartu",   c: "sky",   e: "🔁" },
          ].map(x => (
            <div key={x.l}>
              <div className="flex justify-between items-baseline mb-1">
                <div className="text-[12.5px] font-bold flex items-center gap-1.5"><span>{x.e}</span> {x.l}</div>
                <div className="font-mono text-[10.5px] font-bold text-ink-2">{x.t}</div>
              </div>
              <ProgressBar value={x.v} accent={x.c} height={10}/>
            </div>
          ))}
        </div>
      </div>
    </div>
  </Sticker>
);

const NextBestActionCard = () => (
  <Sticker color="sun" size="lg" className="p-5 relative overflow-hidden h-full flex flex-col gap-4">
    <div className="absolute -top-3 -right-3 px-2.5 py-1 bg-grape border-[2px] border-ink rounded-full text-[10px] font-mono font-bold text-ink rotate-3" style={{ boxShadow: "2px 2px 0 #1F1A2E" }}>NEXT BEST ✨</div>

    <div className="eyebrow flex items-center gap-2 mt-1">
      <span className="text-base">🎯</span> Direkomendasikan untukmu
    </div>

    <div className="flex gap-4">
      <CoverPlaceholder title="Thinking, Fast & Slow" hue={2} h={110} w={80} label="Ch 9"/>
      <div className="flex-1 min-w-0">
        <div className="font-mono text-[9.5px] font-bold uppercase tracking-wider text-ink-2 mb-1">Kahneman · Cognitive Sci</div>
        <div className="font-display font-black text-[19px] leading-tight mb-1.5 text-ink" style={{ textWrap: "balance" }}>Lanjut Ch. 9 — <span className="marker-coral">The Lazy Controller</span></div>
        <div className="text-[12.5px] font-semibold text-ink-2 leading-snug">Nutup gap stat <strong>Reflection</strong>-mu &amp; unlock node skill “Dual Process” 🧠</div>
      </div>
    </div>

    <div className="flex flex-wrap gap-1.5">
      <span className="chip chip-coral">⚡ +120 XP</span>
      <span className="chip chip-grape">🧠 Reflection +3</span>
      <span className="chip">⏱️ ~22 menit</span>
    </div>

    <div className="flex gap-2 mt-auto">
      <button className="btn btn-coral flex-1 justify-center"><Icon name="play" size={15}/> Mulai sesi</button>
      <button className="btn" title="Snooze">⏰</button>
      <button className="btn" title="Defer">📦</button>
    </div>
  </Sticker>
);

const GrowingSkills = () => {
  const skills = [
    { name: "Mental Models",    lvl: 4, max: 5, pct: 72, c: "grape", trend: [3,4,3,5,6,5,7], sub: "Applied",       emoji: "🧠" },
    { name: "Systems Thinking", lvl: 3, max: 5, pct: 48, c: "sky",   trend: [2,2,3,4,3,5,5], sub: "Understanding", emoji: "🔗" },
    { name: "Writing & Drafts", lvl: 3, max: 5, pct: 56, c: "coral", trend: [1,3,2,4,5,5,6], sub: "Understanding", emoji: "✍️" },
    { name: "Behavioral Econ.", lvl: 2, max: 5, pct: 30, c: "mint",  trend: [1,1,2,2,3,3,3], sub: "Awareness",     emoji: "💸" },
  ];
  const chipColor = { grape:"chip-grape", sky:"chip-sky", coral:"chip-coral", mint:"chip-mint" };
  return (
    <Sticker className="p-5 h-full bg-paper">
      <SectionTitle eyebrow="GROWING SKILLS" title="Lagi naik daun" emoji="🌱" marker="mint"
        action={<button className="btn !text-[11px] !py-1.5 !px-3">Semua skill <Icon name="chevron" size={11}/></button>}/>

      <div className="flex flex-col gap-3.5">
        {skills.map(s => (
          <div key={s.name} className="grid items-center gap-3" style={{ gridTemplateColumns: "1fr 110px" }}>
            <div className="min-w-0">
              <div className="flex justify-between items-center mb-1.5 gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-[18px]">{s.emoji}</span>
                  <div className="text-[13.5px] font-extrabold truncate">{s.name}</div>
                  <span className={`chip ${chipColor[s.c]} !py-0.5 !px-2 !text-[10px]`}>{s.sub}</span>
                </div>
                <div className="font-mono text-[11px] font-bold text-ink-2 shrink-0">
                  <span className="text-ink">{s.lvl}</span>/{s.max}
                </div>
              </div>
              <ProgressBar value={s.pct} accent={s.c} height={8}/>
            </div>
            <Sparkline data={s.trend} accent={s.c} height={32} width={108}/>
          </div>
        ))}
      </div>
    </Sticker>
  );
};

const ActivityFeed = () => {
  const items = [
    { time: "08:42",     emoji: "📖", c: "coral", title: "Selesai Chapter 8 · Thinking, Fast & Slow", meta: ["+85 XP", "Reflection +2", "12 menit"] },
    { time: "08:21",     emoji: "💡", c: "sun",   title: "Capture insight — “Anchoring biases predictable error”", meta: ["+5 XP", "Mental Models"] },
    { time: "Kemarin",   emoji: "🎯", c: "mint",  title: "Selesai bounty — Tulis refleksi 3 paragraf", meta: ["+150 XP", "Writing +5"] },
    { time: "Kemarin",   emoji: "🏆", c: "grape", title: "Unlock trophy — “Streak Keeper · 21 hari”", meta: ["Tier Silver"] },
    { time: "18 Mei",    emoji: "🎙️", c: "sky",   title: "Dengar — Tim Ferriss × Naval Ravikant", meta: ["+45 XP", "1j 12m"] },
    { time: "18 Mei",    emoji: "🎯", c: "rose",  title: "Bikin action item — Coba 5-Why pada blocker standup", meta: ["Misi aktif"] },
  ];
  const bg = { coral:"bg-peachy", sun:"bg-cream2", mint:"bg-minty", grape:"bg-lilac", sky:"bg-ocean", rose:"bg-peachy" };
  return (
    <Sticker className="p-5 bg-paper">
      <SectionTitle eyebrow="ACTIVITY FEED" title="Aktivitas terbaru" emoji="✨" marker="coral"
        action={<div className="flex gap-1.5">
          <div className="tab active coral">Semua</div>
          <div className="tab">XP</div>
          <div className="tab">Insight</div>
        </div>}/>
      <div className="flex flex-col gap-2.5">
        {items.map((it, i) => (
          <div key={i} className={`sticker-flat ${bg[it.c]} p-3 flex items-start gap-3`}>
            <div className="w-11 h-11 rounded-2xl bg-paper border-[2.5px] border-ink flex items-center justify-center text-[22px] shrink-0" style={{ boxShadow: "2px 2px 0 #1F1A2E" }}>
              {it.emoji}
            </div>
            <div className="flex-1 min-w-0 pt-0.5">
              <div className="flex justify-between gap-2 items-baseline">
                <div className="text-[13px] font-bold text-ink leading-snug" style={{ textWrap: "pretty" }}>{it.title}</div>
                <div className="font-mono text-[10px] font-bold text-ink-2 shrink-0">{it.time}</div>
              </div>
              <div className="flex flex-wrap gap-1 mt-1.5">
                {it.meta.map((m, j) => <span key={j} className="chip !py-0 !px-2 !text-[10px] bg-paper">{m}</span>)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Sticker>
  );
};

const HeatStripe = () => {
  const days = Array.from({ length: 84 }, (_, i) => {
    const r = Math.sin(i * 1.7) * .5 + .5;
    return r > .8 ? 4 : r > .6 ? 3 : r > .4 ? 2 : r > .15 ? 1 : 0;
  });
  const colors = ["#FFFFFF", "#FFE3E3", "#FF8FA3", "#FF6B6B", "#E8434E"];

  return (
    <Sticker className="p-5 bg-paper">
      <SectionTitle eyebrow="CONSISTENCY MAP" title="12 minggu terakhir" emoji="🔥" marker="coral"
        action={<div className="flex items-center gap-1.5">
          <span className="font-mono text-[10px] font-bold text-ink-2">sepi</span>
          {colors.map((c, i) => <div key={i} className="w-3.5 h-3.5 rounded border-[2px] border-ink" style={{ background: c }}/>)}
          <span className="font-mono text-[10px] font-bold text-ink-2">rame</span>
        </div>}/>
      <div className="grid gap-1.5" style={{ gridTemplateColumns: "repeat(12, 1fr)" }}>
        {Array.from({ length: 12 }, (_, w) => (
          <div key={w} className="grid gap-1.5" style={{ gridTemplateRows: "repeat(7, 1fr)" }}>
            {Array.from({ length: 7 }, (_, d) => {
              const v = days[w * 7 + d];
              return <div key={d} className="border-[1.5px] border-ink rounded" style={{ background: colors[v], aspectRatio: "1/1" }}/>;
            })}
          </div>
        ))}
      </div>
      <div className="mt-3 text-[12.5px] font-bold text-ink-2">
        Streak: <span className="font-display text-[18px] font-black text-coral marker-sun">27 hari</span> 🔥
      </div>
    </Sticker>
  );
};

const BountyTeaser = () => (
  <Sticker color="grape" className="p-5">
    <div className="flex items-center gap-2 mb-3">
      <div className="w-9 h-9 rounded-xl bg-paper border-[2.5px] border-ink flex items-center justify-center text-[18px]" style={{ boxShadow: "2px 2px 0 #1F1A2E" }}>🎯</div>
      <div className="flex-1">
        <div className="font-mono text-[10px] font-bold tracking-widest">ACTIVE BOUNTY</div>
        <div className="font-display font-black text-[15px] leading-none mt-1">Quest Refleksi Mingguan</div>
      </div>
      <div className="text-right">
        <div className="font-mono text-[9px] text-ink-2">SISA</div>
        <div className="font-display font-black text-[15px] text-coral-d">2h 14j</div>
      </div>
    </div>
    <div className="text-[12.5px] font-semibold leading-snug mb-3 text-ink">
      Tulis refleksi 200 kata yang menyintesis 2 sumber yang kamu selesain minggu ini ✍️
    </div>
    <ProgressBar value={45} accent="sun" height={10} label="Progress" sub="1 dari 2 sumber dikutip"/>
    <div className="flex justify-between items-center mt-3 gap-2">
      <div className="flex gap-1.5">
        <span className="chip chip-sun">⚡ +250 XP</span>
        <span className="chip chip-mint">🧠 Reflection +8</span>
      </div>
      <button className="btn btn-coral !py-2 !px-3">Lanjut <Icon name="arrow" size={12}/></button>
    </div>
  </Sticker>
);

const DashboardView = () => (
  <div>
    <DailyBanner/>

    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
      <Stat icon="flame" label="STREAK"  value="27"    unit="hari"     color="coral" trend={12} emoji="🔥"/>
      <Stat icon="clock" label="SESI"    value="14"    unit="minggu"   color="grape" trend={8}  emoji="⏱️"/>
      <Stat icon="check" label="MISI"    value="38"    unit="/ 52"     color="mint"  trend={5}  emoji="✅"/>
      <Stat icon="bolt"  label="XP MINGGU" value="2,140" unit="XP"     color="sun"   trend={22} emoji="⚡"/>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-5 mb-5">
      <NextBestActionCard/>
      <GrowingSkills/>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-5">
      <ActivityFeed/>
      <div className="flex flex-col gap-5">
        <HeatStripe/>
        <BountyTeaser/>
      </div>
    </div>
  </div>
);

window.DashboardView = DashboardView;
