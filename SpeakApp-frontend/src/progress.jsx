// PROGRESS & ACHIEVEMENTS
const ProgressScreen = ({ lang }) => {
  const t = lang === 'id' ? {
    h1: 'Progres & Pencapaian',
    sub: '30 hari terakhir · konsistenmu mulai berbicara.',
    chart: 'Skor 30 hari', target: 'Target band', avg: 'Rerata', best: 'Terbaik',
    heatmap: 'Aktivitas latihan', less: 'Kurang', more: 'Lebih',
    badges: 'Badge',
    earned: 'Diperoleh', locked: 'Terkunci',
    rank: 'Rank Saat Ini',
    sessions: 'Sesi', xp: 'Total XP', streak: 'Streak terpanjang',
    journey: 'Perjalanan rank',
  } : {
    h1: 'Progress & Achievements',
    sub: 'Last 30 days · the work is starting to show.',
    chart: '30-day score', target: 'Target band', avg: 'Avg', best: 'Best',
    heatmap: 'Practice activity', less: 'Less', more: 'More',
    badges: 'Badges',
    earned: 'Earned', locked: 'Locked',
    rank: 'Current Rank',
    sessions: 'Sessions', xp: 'Total XP', streak: 'Longest streak',
    journey: 'Rank journey',
  };

  // 30-day score data
  const scores = [62,64,61,67,65,70,68,72,69,74,71,73,76,72,75,78,74,79,77,80,82,78,81,84,80,83,86,82,85,87];

  // Heatmap: 7 rows (days of week) × ~16 weeks
  const WEEKS = 18;
  const heatmap = React.useMemo(() => {
    const seed = [0,2,1,3,0,1,4,2,3,1,4,2,1,3,0,2,4,3];
    const rows = [];
    for (let d = 0; d < 7; d++) {
      const row = [];
      for (let w = 0; w < WEEKS; w++) {
        const v = (seed[(w + d*3) % seed.length] + (d % 3)) % 5;
        row.push(v);
      }
      rows.push(row);
    }
    return rows;
  }, []);

  const dayLabels = lang === 'id' ? ['Mn','Sl','Rb','Km','Jm','Sb','Mg'] : ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

  const allBadges = [
    { id: 'streak7', emoji: '🔥', name: lang==='id'?'7 hari beruntun':'7-day streak', desc: lang==='id'?'Konsistensi awal':'Early consistency', earned: true, tone: 'warning' },
    { id: 'streak30', emoji: '🌟', name: lang==='id'?'30 hari beruntun':'30-day streak', desc: lang==='id'?'Habit terbentuk':'Habit forming', earned: false, tone: 'warning' },
    { id: 'filler', emoji: '🎯', name: lang==='id'?'Pemburu Filler':'Filler hunter', desc: lang==='id'?'< 3 filler dalam 5 sesi':'< 3 fillers across 5 sessions', earned: true, tone: 'primary' },
    { id: 'pace', emoji: '⚡', name: lang==='id'?'Tempo Master':'Pace master', desc: lang==='id'?'Tempo stabil 7 sesi':'Stable pace × 7 sessions', earned: true, tone: 'success' },
    { id: 'first90', emoji: '🏆', name: lang==='id'?'Skor 90 pertama':'First 90 score', desc: lang==='id'?'Sesi pertama tembus 90':'First session hitting 90', earned: false, tone: 'warning' },
    { id: 'storyteller', emoji: '📖', name: lang==='id'?'Storyteller':'Storyteller', desc: lang==='id'?'10 cerita selesai':'10 stories completed', earned: true, tone: 'secondary' },
    { id: 'ted', emoji: '👑', name: lang==='id'?'TED-Level':'TED-Level', desc: lang==='id'?'Rank tertinggi':'Highest rank', earned: false, tone: 'secondary' },
    { id: 'pitch10', emoji: '💼', name: lang==='id'?'10 Investor Pitch':'10 investor pitches', desc: lang==='id'?'Modul Bisnis':'Business module', earned: true, tone: 'primary' },
    { id: 'eng10', emoji: '🇬🇧', name: lang==='id'?'English × 10':'English × 10', desc: lang==='id'?'10 sesi bahasa Inggris':'10 English sessions', earned: false, tone: 'primary' },
    { id: 'hour', emoji: '⏳', name: lang==='id'?'1 jam panggung':'1 stage hour', desc: lang==='id'?'60 menit kumulatif':'60 cumulative minutes', earned: true, tone: 'success' },
    { id: 'perfect', emoji: '💎', name: lang==='id'?'Sesi Sempurna':'Perfect session', desc: lang==='id'?'0 filler · target tempo':'0 fillers · pace on target', earned: false, tone: 'secondary' },
    { id: 'comeback', emoji: '🌅', name: lang==='id'?'Comeback':'Comeback', desc: lang==='id'?'Lanjut setelah 7 hari off':'Resume after 7-day break', earned: false, tone: 'warning' },
  ];

  // Score chart svg
  const W = 760, H = 220, P = 28;
  const min = 50, max = 100;
  const xAt = i => P + (i / (scores.length - 1)) * (W - 2*P);
  const yAt = v => H - P - ((v - min) / (max - min)) * (H - 2*P);
  const path = scores.map((v, i) => `${i===0?'M':'L'}${xAt(i).toFixed(1)},${yAt(v).toFixed(1)}`).join(' ');
  const area = `${path} L${xAt(scores.length-1).toFixed(1)},${H-P} L${P},${H-P} Z`;
  // target band 75-90
  const bandTop = yAt(90), bandBot = yAt(75);

  // Rank journey
  const ranks = [
    { emoji: '🌱', name: 'Silent Seed', xp: 0, on: true },
    { emoji: '🌿', name: 'Confident Speaker', xp: 1500, on: true, current: true },
    { emoji: '🎙️', name: 'Stage Ready', xp: 5000, on: false },
    { emoji: '⭐', name: 'Keynoter', xp: 12000, on: false },
    { emoji: '👑', name: 'TED-Level', xp: 25000, on: false },
  ];

  return (
    <div className="max-w-[1240px] mx-auto px-8 py-8 space-y-6 fade-enter">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">{t.h1}</h1>
          <p className="text-text-2 mt-2">{t.sub}</p>
        </div>
        <div className="flex gap-2">
          {[
            { k: t.sessions, v: '127' },
            { k: t.xp, v: '8,420' },
            { k: t.streak, v: '23' },
          ].map((s, i) => (
            <div key={i} className="bg-surface border border-border rounded-btn px-4 py-2.5">
              <div className="text-[10px] uppercase tracking-wider text-text-3 font-semibold mb-0.5">{s.k}</div>
              <div className="font-mono text-xl font-bold">{s.v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Chart */}
      <Card className="p-7">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-text-3">
            <IconChart size={14}/> {t.chart}
          </div>
          <div className="flex gap-3 text-xs">
            <span className="inline-flex items-center gap-1.5 text-text-2"><span className="w-2.5 h-2.5 rounded-sm bg-success/30"/>{t.target}</span>
            <span className="inline-flex items-center gap-1.5 text-text-2"><span className="w-2.5 h-2.5 rounded-full grad-bg"/>{t.avg} 75</span>
            <span className="inline-flex items-center gap-1.5 text-text-2"><span className="w-2.5 h-2.5 rounded-full bg-warning"/>{t.best} 87</span>
          </div>
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" preserveAspectRatio="none">
          <defs>
            <linearGradient id="line-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#4F6EF7"/>
              <stop offset="100%" stopColor="#7C3AED"/>
            </linearGradient>
            <linearGradient id="area-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4F6EF7" stopOpacity="0.35"/>
              <stop offset="100%" stopColor="#7C3AED" stopOpacity="0"/>
            </linearGradient>
          </defs>
          {/* gridlines */}
          {[60,70,80,90].map((g) => (
            <g key={g}>
              <line x1={P} x2={W-P} y1={yAt(g)} y2={yAt(g)} stroke="#1E1E2E" strokeWidth="1" strokeDasharray="2 4"/>
              <text x={P-6} y={yAt(g)+3} fill="#64748B" fontSize="10" textAnchor="end" fontFamily="JetBrains Mono">{g}</text>
            </g>
          ))}
          {/* target band */}
          <rect x={P} y={bandTop} width={W-2*P} height={bandBot-bandTop} fill="rgba(16,185,129,0.10)" stroke="rgba(16,185,129,0.3)" strokeDasharray="3 3"/>
          {/* area + line */}
          <path d={area} fill="url(#area-grad)"/>
          <path d={path} fill="none" stroke="url(#line-grad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          {/* dots */}
          {scores.map((v, i) => (
            <circle key={i} cx={xAt(i)} cy={yAt(v)} r={i === scores.length - 1 ? 5 : 2.5} fill={i === scores.length - 1 ? '#F59E0B' : '#7C3AED'} stroke={i === scores.length - 1 ? '#0A0A0F' : 'none'} strokeWidth="2"/>
          ))}
          {/* x labels */}
          {[0, 7, 14, 21, 29].map(i => (
            <text key={i} x={xAt(i)} y={H-8} fill="#64748B" fontSize="10" textAnchor="middle" fontFamily="JetBrains Mono">D{i+1}</text>
          ))}
        </svg>
      </Card>

      {/* Heatmap + Rank journey */}
      <div className="grid lg:grid-cols-[1.4fr,1fr] gap-5">
        <Card className="p-7">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-text-3">
              <IconCalendar size={14}/> {t.heatmap}
            </div>
            <span className="text-xs text-text-2 font-mono"><span className="text-text-1 font-bold">87</span> {lang==='id'?'sesi · 18 minggu':'sessions · 18 weeks'}</span>
          </div>
          <div className="flex gap-2">
            <div className="flex flex-col gap-[3px] pt-[18px] pr-1 font-mono text-[9px] text-text-3">
              {dayLabels.map((d, i) => <div key={i} style={{ height: 16 }}>{i % 2 === 0 ? d : ''}</div>)}
            </div>
            <div className="flex-1">
              <div className="flex justify-between font-mono text-[9px] text-text-3 mb-2 px-1">
                <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>Mei</span>
              </div>
              <div className="grid gap-[3px]" style={{ gridTemplateColumns: `repeat(${WEEKS}, 1fr)` }}>
                {Array.from({ length: WEEKS }).map((_, w) => (
                  <div key={w} className="flex flex-col gap-[3px]">
                    {heatmap.map((row, d) => (
                      <div key={d} className={`hm-${row[w]} rounded-sm aspect-square`} title={`Week ${w+1}, level ${row[w]}`}/>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-5 flex items-center justify-end gap-1.5 text-[10px] font-mono text-text-3">
            <span>{t.less}</span>
            {[0,1,2,3,4].map(l => <div key={l} className={`hm-${l} w-3 h-3 rounded-sm`}/>)}
            <span>{t.more}</span>
          </div>
        </Card>

        {/* Rank journey */}
        <Card className="p-7">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-text-3">
              <IconTrophy size={14}/> {t.journey}
            </div>
          </div>
          <div className="space-y-3">
            {ranks.map((r, i) => (
              <div key={i} className={`flex items-center gap-3 p-3 rounded-btn border transition-all ${r.current ? 'border-primary/40 bg-primary/5 selected-glow' : r.on ? 'border-border bg-surface-2' : 'border-border bg-surface'}`}>
                <div className={`w-11 h-11 rounded-btn flex items-center justify-center text-2xl ${r.on ? 'grad-bg-soft border border-primary/30' : 'bg-surface-3 border border-border opacity-50 grayscale'}`}>{r.emoji}</div>
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-bold ${r.on ? '' : 'text-text-3'}`}>{r.name}</div>
                  <div className="text-[10px] font-mono text-text-3">{r.xp.toLocaleString()} XP</div>
                </div>
                {r.current && <Pill tone="primary">{lang==='id'?'Saat ini':'Now'}</Pill>}
                {!r.on && <IconLock size={14} className="text-text-3"/>}
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Badges */}
      <Card className="p-7">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-text-3">
            <IconBadge size={14}/> {t.badges}
          </div>
          <div className="flex gap-2 text-xs font-mono">
            <span className="text-text-2"><span className="text-text-1 font-bold">{allBadges.filter(b=>b.earned).length}</span> {t.earned}</span>
            <span className="text-text-3">·</span>
            <span className="text-text-3">{allBadges.filter(b=>!b.earned).length} {t.locked}</span>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
          {allBadges.map(b => (
            <div key={b.id} className={`p-4 rounded-card border text-center lift relative overflow-hidden ${b.earned ? `bg-surface-2 border-border-2` : 'bg-surface border-border opacity-50 grayscale'}`}>
              {b.earned && (
                <div className={`absolute -top-8 -right-8 w-20 h-20 rounded-full blur-2xl pointer-events-none ${
                  b.tone==='warning'?'bg-warning/30':b.tone==='primary'?'bg-primary/30':b.tone==='secondary'?'bg-secondary/30':'bg-success/30'
                }`}/>
              )}
              <div className="relative">
                <div className={`mx-auto w-14 h-14 rounded-card flex items-center justify-center text-3xl mb-3 ${
                  b.earned ? (b.tone==='warning'?'bg-warning/15 border border-warning/30':b.tone==='primary'?'bg-primary/15 border border-primary/30':b.tone==='secondary'?'bg-secondary/15 border border-secondary/30':'bg-success/15 border border-success/30')
                  : 'bg-surface-3 border border-border'
                }`}>
                  {b.earned ? b.emoji : <IconLock size={20} className="text-text-3"/>}
                </div>
                <div className="text-sm font-bold leading-tight tracking-tight">{b.name}</div>
                <div className="text-[10px] text-text-3 mt-1 leading-snug">{b.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Bottom rank card */}
      <Card glass className="p-7 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-96 h-96 grad-bg-soft rounded-full blur-3xl pointer-events-none"/>
        <div className="relative grid md:grid-cols-[auto,1fr,auto] gap-6 items-center">
          <div className="w-20 h-20 rounded-card grad-bg flex items-center justify-center text-5xl shadow-glow-primary">🌿</div>
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-text-3 mb-1">{t.rank}</div>
            <h3 className="text-2xl font-extrabold tracking-tight">Confident Speaker</h3>
            <div className="text-text-2 text-sm mt-1">{lang==='id'?'2.840 dari 3.500 XP menuju Stage Ready':'2,840 of 3,500 XP to Stage Ready'}</div>
            <div className="mt-3 max-w-[440px]">
              <XPBar value={2840} max={3500} level={12} nextLevel={13}/>
            </div>
          </div>
          <div className="hidden md:flex flex-col items-end gap-2">
            <Pill tone="warning" icon={<IconStar size={12}/>}>Top 8%</Pill>
            <span className="font-mono text-xs text-text-3">{lang==='id'?'7 sesi lagi':'7 more sessions'}</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

window.ProgressScreen = ProgressScreen;
