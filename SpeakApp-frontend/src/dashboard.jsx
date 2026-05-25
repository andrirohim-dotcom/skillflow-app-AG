// DASHBOARD — post-login
const DashboardScreen = ({ lang, onStartPractice }) => {
  const t = lang === 'id' ? {
    greeting: 'Selamat pagi', name: 'Adi', sub: 'Siap latihan hari ini? Misimu butuh 12 menit.',
    mission: { title: 'Misi Hari Ini', topic: 'Pitch produk: aplikasi pertanian B2B', tag: 'Persuasif · 3 menit', desc: 'Latihan struktur problem → solution → ask. Fokus: kurangi filler "eee" dan jaga tempo di bawah 160 wpm.', start: 'Mulai Sesi' },
    countdown: { title: 'Anchor Event', name: 'Investor Pitch — Series A', sub: 'Demo Day · BSD City' },
    weekly: 'Skor Mingguan', goals: 'Progres Goal', badges: 'Badge Terbaru', theory: 'Teori Hari Ini',
    goalList: [
      { name: 'Kurangi filler words', cur: 7, max: 10, unit: 'sesi' },
      { name: 'Tempo bicara di bawah 165 wpm', cur: 4, max: 7, unit: 'sesi' },
      { name: 'Score Confidence ≥ 85', cur: 12, max: 15, unit: 'hari' },
    ],
    theoryCard: { kicker: 'Aristotelian Rhetoric', title: 'Ethos sebelum Pathos', body: 'Sebelum membangkitkan emosi, bangun kredibilitas. Audiens harus percaya kamu pantas didengar — baru mereka mau ikut merasa.' },
    pickup: 'Lanjut latihan'
  } : {
    greeting: 'Good morning', name: 'Adi', sub: 'Ready to practice? Today\'s mission takes about 12 minutes.',
    mission: { title: 'Today\'s Mission', topic: 'Product pitch: B2B agritech app', tag: 'Persuasive · 3 min', desc: 'Drill the problem → solution → ask structure. Focus: cut "uhh" fillers and stay under 160 wpm.', start: 'Start Session' },
    countdown: { title: 'Anchor Event', name: 'Investor Pitch — Series A', sub: 'Demo Day · BSD City' },
    weekly: 'Weekly Score', goals: 'Goal Progress', badges: 'Recent Badges', theory: 'Today\'s Theory',
    goalList: [
      { name: 'Cut filler words', cur: 7, max: 10, unit: 'sessions' },
      { name: 'Pace below 165 wpm', cur: 4, max: 7, unit: 'sessions' },
      { name: 'Confidence score ≥ 85', cur: 12, max: 15, unit: 'days' },
    ],
    theoryCard: { kicker: 'Aristotelian Rhetoric', title: 'Ethos before Pathos', body: 'Before stirring feelings, establish credibility. Your audience must believe you deserve to be heard — only then can they let themselves feel.' },
    pickup: 'Pick up practice'
  };

  const sparkData = [62, 65, 71, 68, 74, 79, 87];
  const days = ['M','S','S','R','K','J','S'];

  // Countdown tick (placeholder static)
  const countdown = [
    { v: 12, l: lang==='id'?'hari':'days' },
    { v: 4, l: lang==='id'?'jam':'hrs' },
    { v: 38, l: lang==='id'?'min':'min' },
  ];

  const recentBadges = [
    { emoji: '🔥', name: '7-day streak', tone: 'warning' },
    { emoji: '🎯', name: 'Filler hunter', tone: 'primary' },
    { emoji: '⚡', name: 'Speed master', tone: 'success' },
  ];

  return (
    <div className="max-w-[1240px] mx-auto px-8 py-8 space-y-6 fade-enter">
      {/* Top: greeting + streak */}
      <div className="flex flex-col lg:flex-row gap-5">
        <Card className="flex-1 p-7 relative overflow-hidden">
          <div className="absolute -right-16 -top-16 w-72 h-72 grad-bg-soft rounded-full blur-3xl opacity-60 pointer-events-none"/>
          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-text-3 uppercase tracking-wider mb-3">
                <IconCalendar size={14}/> Senin · 10 Mei 2026
              </div>
              <h1 className="text-3xl md:text-[40px] font-extrabold tracking-tight leading-[1.1]">
                {t.greeting}, <span className="grad-text">{t.name}</span> 👋
              </h1>
              <p className="mt-3 text-text-2 text-base">{t.sub}</p>
              <div className="mt-5 flex items-center gap-3">
                <LevelPill rank="🌿 LV. 12" name={lang==='id'?'Confident Speaker':'Confident Speaker'}/>
                <Pill tone="primary" icon={<IconBolt size={12}/>}>Top 8% pekan ini</Pill>
              </div>
            </div>
            <StreakBadge days={23}/>
          </div>
          <div className="relative mt-6 pt-6 border-t border-border">
            <XPBar value={2840} max={3500} level={12} nextLevel={13}/>
          </div>
        </Card>
      </div>

      {/* Mission + Countdown row */}
      <div className="grid lg:grid-cols-[1.5fr,1fr] gap-5">
        {/* Mission */}
        <Card className="p-7 relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1/2 grad-bg-soft pointer-events-none opacity-50" style={{ maskImage: 'linear-gradient(to left, black, transparent)' }}/>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-text-3">
                <IconTarget size={14}/> {t.mission.title}
              </div>
              <Pill tone="warning" icon={<IconClock size={12}/>}>{lang==='id'?'12 menit':'12 min'}</Pill>
            </div>
            <h2 className="text-2xl font-bold leading-tight tracking-tight mb-1">{t.mission.topic}</h2>
            <div className="text-xs font-mono text-text-2 mb-4">{t.mission.tag}</div>
            <p className="text-text-2 leading-relaxed text-sm max-w-[560px]">{t.mission.desc}</p>

            {/* progress */}
            <div className="mt-5">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-text-2">{lang==='id'?'Progres misi pekan ini':'Mission progress this week'}</span>
                <span className="font-mono"><span className="text-text-1 font-bold">4</span><span className="text-text-3"> / 7</span></span>
              </div>
              <div className="h-2 rounded-full bg-surface-3 overflow-hidden">
                <div className="h-full grad-bg rounded-full" style={{ width: '57%' }}/>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <Button onClick={onStartPractice} iconRight={<IconArrowRight size={18}/>}>{t.mission.start}</Button>
              <Button variant="ghost">{lang==='id'?'Ganti topik':'Change topic'}</Button>
            </div>
          </div>
        </Card>

        {/* Countdown */}
        <Card className="p-7 relative overflow-hidden">
          <div className="absolute -left-10 -bottom-10 w-56 h-56 rounded-full bg-warning/20 blur-3xl pointer-events-none"/>
          <div className="relative">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-text-3 mb-3">
              <IconCalendar size={14}/> {t.countdown.title}
            </div>
            <h3 className="text-lg font-bold tracking-tight">{t.countdown.name}</h3>
            <div className="text-xs text-text-2 mb-5">{t.countdown.sub}</div>
            <div className="grid grid-cols-3 gap-2">
              {countdown.map((c, i) => (
                <div key={i} className="bg-surface-2 border border-border rounded-btn p-3 text-center">
                  <div className="font-mono text-3xl font-bold leading-none text-warning">{String(c.v).padStart(2,'0')}</div>
                  <div className="text-[10px] uppercase tracking-wider text-text-3 font-semibold mt-1.5">{c.l}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between text-xs">
              <span className="text-text-2">{lang==='id'?'Latihan tersisa':'Practices left'}</span>
              <span className="font-mono"><span className="text-text-1 font-bold">9</span><span className="text-text-3"> sesi</span></span>
            </div>
          </div>
        </Card>
      </div>

      {/* 4 widgets row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Weekly score chart */}
        <Card className="p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-text-3 mb-1">{t.weekly}</div>
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-3xl font-bold">87</span>
                <span className="text-success text-xs font-mono font-semibold inline-flex items-center gap-0.5"><IconArrowUp size={12}/>+9</span>
              </div>
            </div>
            <Pill tone="success">{lang==='id'?'Tren naik':'Trending up'}</Pill>
          </div>
          {/* mini bar chart */}
          <div className="flex items-end gap-2 h-32 mt-4">
            {sparkData.map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full rounded-md grad-bg relative" style={{ height: `${v}%`, minHeight: 8 }}>
                  {i === sparkData.length - 1 && (
                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 font-mono text-[11px] font-bold">{v}</span>
                  )}
                </div>
                <span className="text-[10px] text-text-3 font-mono">{days[i]}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Goals */}
        <Card className="p-6">
          <div className="text-xs font-mono uppercase tracking-wider text-text-3 mb-4">{t.goals}</div>
          <div className="space-y-3.5">
            {t.goalList.map((g, i) => {
              const pct = (g.cur / g.max) * 100;
              return (
                <div key={i}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-text-1 font-medium leading-tight">{g.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-surface-3 overflow-hidden">
                      <div className={`h-full rounded-full ${i===0?'bg-primary':i===1?'bg-secondary':'bg-success'}`} style={{ width: `${pct}%` }}/>
                    </div>
                    <span className="font-mono text-[11px] text-text-2 w-12 text-right">{g.cur}/{g.max}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Badges */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-xs font-mono uppercase tracking-wider text-text-3">{t.badges}</div>
            <button className="text-xs text-primary font-semibold hover:underline">{lang==='id'?'Lihat semua':'See all'}</button>
          </div>
          <div className="space-y-2">
            {recentBadges.map((b, i) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded-btn bg-surface-2 border border-border">
                <div className={`w-9 h-9 rounded-btn flex items-center justify-center text-xl border ${b.tone==='warning'?'bg-warning/10 border-warning/30':b.tone==='primary'?'bg-primary/10 border-primary/30':'bg-success/10 border-success/30'}`}>{b.emoji}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate">{b.name}</div>
                  <div className="text-[10px] font-mono text-text-3">+50 XP</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Theory card */}
      <Card className="p-7 relative overflow-hidden">
        <div className="absolute right-8 top-8 text-text-3 opacity-30"><IconBook size={120}/></div>
        <div className="relative max-w-[640px]">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-text-3 mb-3">
            <IconLightbulb size={14}/> {t.theory}
          </div>
          <div className="text-xs font-mono text-secondary mb-2">{t.theoryCard.kicker}</div>
          <h3 className="text-2xl font-bold leading-tight tracking-tight mb-3">{t.theoryCard.title}</h3>
          <p className="text-text-2 leading-relaxed">{t.theoryCard.body}</p>
          <div className="mt-5">
            <Button variant="ghost" size="sm" iconRight={<IconArrowRight size={14}/>}>{lang==='id'?'Baca lengkap':'Read full'}</Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

window.DashboardScreen = DashboardScreen;
