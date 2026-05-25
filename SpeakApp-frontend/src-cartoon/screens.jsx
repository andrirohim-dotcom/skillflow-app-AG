// All 5 screens for cartoon edition

// ============== LANDING ==============
const LandingScreen = ({ lang, setLang, onCtaLogin, onCtaStart }) => {
  const t = lang === 'id' ? {
    login: 'Masuk',
    kicker: 'Coach AI public speaking',
    h1a: 'Dari grogi,', h1b: 'jadi', h1c: 'memukau',
    sub: 'Latih ngomong di depan publik dengan AI yang ngerti bahasa Indonesia. Skor real-time, latihan harian, progress yang kelihatan!',
    cta1: 'Mulai Gratis', cta2: 'Masuk',
    micro: 'Gratis 14 hari · Tanpa kartu kredit',
    proof: 'Sudah dipakai 10.000+ speaker',
    features: [
      { color: '#FFD93D', emoji: '🎯', kicker: 'Personalisasi', title: 'Coach yang ngerti kamu', body: 'Wizard 7-langkah memetakan masalah — gugup, filler, terlalu cepat — lalu menyusun rencana spesifik buatmu.' },
      { color: '#FF8FA3', emoji: '⚡', kicker: 'Latihan Harian', title: '10 menit, tiap hari', body: 'Misi singkat dengan topik relevan. 3 minggu konsisten = transformasi yang kamu rasakan.' },
      { color: '#6BCB77', emoji: '🏆', kicker: 'Naik Level', title: 'Silent Seed → TED-Level', body: 'XP, streak, badge yang bermakna. Setiap latihan terhitung. Lihat dirimu naik level di setiap pitch.' },
    ],
  } : {
    login: 'Sign in',
    kicker: 'AI public speaking coach',
    h1a: 'From nervous', h1b: 'to', h1c: 'commanding',
    sub: 'Train public speaking with AI that understands Indonesian and English. Real-time scoring, daily drills, visible progress!',
    cta1: 'Start free', cta2: 'Sign in',
    micro: 'Free for 14 days · No credit card',
    proof: 'Loved by 10,000+ speakers',
    features: [
      { color: '#FFD93D', emoji: '🎯', kicker: 'Personalize', title: 'A coach that gets you', body: 'A 7-step intake maps what holds you back — nerves, fillers, pace — then builds a focused plan.' },
      { color: '#FF8FA3', emoji: '⚡', kicker: 'Daily reps', title: '10 minutes, every day', body: 'Short missions with topics that matter. Stick with it 3 weeks and feel the shift.' },
      { color: '#6BCB77', emoji: '🏆', kicker: 'Level up', title: 'Silent Seed → TED-Level', body: 'XP, streaks, badges with real meaning. Every rep counts.' },
    ],
  };

  const avatars = [
    { n: 'Adi', c: '#FF6B6B' }, { n: 'Maya', c: '#FFD93D' }, { n: 'Rio', c: '#6BCB77' },
    { n: 'Nadia', c: '#B58CFF' }, { n: 'Bayu', c: '#5DADEC' }, { n: 'Citra', c: '#FF8FA3' },
  ];

  return (
    <div className="min-h-full">
      {/* Navbar */}
      <nav className="sticky top-0 z-30 bg-cream/95 backdrop-blur-sm border-b-2 border-line">
        <div className="max-w-[1240px] mx-auto px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Mascot size={40}/>
            <span className="font-display font-black text-2xl">SpeakUp</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center p-1 rounded-full bg-paper border-2 border-line text-xs font-mono">
              <button onClick={() => setLang('id')} className={`px-3 h-7 rounded-full font-bold ${lang==='id'?'bg-sun':''}`}>ID</button>
              <button onClick={() => setLang('en')} className={`px-3 h-7 rounded-full font-bold ${lang==='en'?'bg-sun':''}`}>EN</button>
            </div>
            <Button variant="paper" size="sm" onClick={onCtaLogin}>{t.login}</Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bg-paper-noise">
        <div className="absolute inset-0 bg-dots opacity-60 pointer-events-none"/>
        {/* floating stickers */}
        <div className="hidden md:block absolute left-[6%] top-[18%] floaty"><Sticker color="#FFD93D" rotate={-12}>★ +50 XP</Sticker></div>
        <div className="hidden md:block absolute right-[8%] top-[14%] floaty" style={{ animationDelay: '0.7s' }}><Sticker color="#6BCB77" rotate={9}>🔥 streak 7</Sticker></div>
        <div className="hidden md:block absolute left-[10%] bottom-[18%] floaty" style={{ animationDelay: '1.4s' }}><Sticker color="#FF8FA3" rotate={6}>⚡ Level Up!</Sticker></div>

        <div className="relative max-w-[1240px] mx-auto px-8 pt-16 pb-24 grid lg:grid-cols-[1.05fr,0.95fr] gap-12 items-center">
          <div className="fade-enter">
            <Sticker color="#FFD93D" rotate={-3} size="md" className="mb-6">🎤 {t.kicker}</Sticker>
            <h1 className="font-display text-6xl md:text-7xl lg:text-[88px] leading-[0.95] font-black tracking-tight">
              {t.h1a}<br/>
              {t.h1b} <span className="squiggle text-coral">{t.h1c}</span> <span className="wiggle">🎉</span>
            </h1>
            <p className="mt-7 text-lg text-ink-2 max-w-[520px] leading-relaxed font-medium">{t.sub}</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button size="lg" variant="coral" onClick={onCtaStart} iconRight={<IconArrowR size={20}/>}>{t.cta1}</Button>
              <Button size="lg" variant="paper" onClick={onCtaLogin}>{t.cta2}</Button>
            </div>
            <div className="mt-4 text-xs text-ink-3 font-mono font-semibold">{t.micro}</div>

            {/* Social proof */}
            <div className="mt-10 flex items-center gap-4">
              <div className="flex -space-x-2">
                {avatars.map((a, i) => <Avatar key={i} name={a.n} color={a.c} size={40}/>)}
              </div>
              <div>
                <div className="flex items-center gap-1 mb-0.5">
                  {[0,1,2,3,4].map(i => <IconStar key={i} size={14} className="text-coral fill-coral" stroke={1.6}/>)}
                  <span className="font-mono text-xs ml-1 font-bold">4.9</span>
                </div>
                <div className="text-sm font-bold">{t.proof}</div>
              </div>
            </div>
          </div>

          {/* Hero card preview */}
          <div className="relative">
            <Card className="p-7 relative" style={{ transform: 'rotate(1.5deg)' }}>
              <Sticker color="#FF6B6B" rotate={-12} className="absolute -top-3 -left-3 z-10">● LIVE</Sticker>
              <Sticker color="#6BCB77" rotate={11} size="sm" className="absolute -bottom-3 -right-3 z-10">+240 XP</Sticker>

              <div className="flex items-center justify-between mb-5">
                <div className="text-xs font-mono uppercase tracking-wider font-extrabold">Investor Pitch · 02:47</div>
                <Pill color="#FFE9A8">3:30 target</Pill>
              </div>
              <div className="flex items-center gap-6">
                <Ring value={87} size={140} stroke={14} color="#FF6B6B" label="87" sub="Skor"/>
                <div className="flex-1 space-y-3">
                  {[
                    { k: 'Structure', v: 92, c: '#6BCB77' },
                    { k: 'Delivery', v: 81, c: '#5DADEC' },
                    { k: 'Confidence', v: 88, c: '#B58CFF' },
                  ].map(r => (
                    <div key={r.k}>
                      <div className="flex justify-between text-xs mb-1.5 font-bold">
                        <span>{r.k}</span><span className="font-mono">{r.v}</span>
                      </div>
                      <div className="h-3 rounded-full bg-cream border-2 border-line overflow-hidden">
                        <div className="h-full" style={{ width: `${r.v}%`, background: r.c, borderRight: '2px solid #1F1A2E' }}/>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-6 pt-5 border-t-2 border-dashed border-line">
                <Waveform bars={42} active height={48}/>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-[1240px] mx-auto px-8 py-20">
        <div className="grid md:grid-cols-3 gap-6">
          {t.features.map((f, i) => (
            <Card key={i} className="p-7 lift-pop" style={{ transform: `rotate(${[-1.2, 0.8, -0.6][i]}deg)` }}>
              <div className="w-16 h-16 rounded-2xl border-2 border-line flex items-center justify-center text-3xl mb-5" style={{ background: f.color }}>
                {f.emoji}
              </div>
              <div className="font-mono text-[11px] font-extrabold uppercase tracking-[0.2em] text-ink-2 mb-2">{f.kicker}</div>
              <h3 className="font-display text-2xl font-black tracking-tight mb-3 leading-tight">{f.title}</h3>
              <p className="text-ink-2 leading-relaxed font-medium">{f.body}</p>
            </Card>
          ))}
        </div>
      </section>

      <footer className="border-t-2 border-line bg-paper">
        <div className="max-w-[1240px] mx-auto px-8 py-8 flex items-center justify-between text-sm font-bold">
          <div className="flex items-center gap-2"><Mascot size={28}/>SpeakUp · {new Date().getFullYear()}</div>
          <div className="flex gap-6 text-ink-2">
            <span>Privacy</span><span>Terms</span><span>Support</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

// ============== ONBOARDING ==============
const OnboardingScreen = ({ lang }) => {
  const [selected, setSelected] = React.useState(['nervous', 'pace']);

  const t = lang === 'id' ? {
    kicker: 'Onboarding · Langkah 3 dari 7',
    title: 'Apa masalah utamamu',
    title2: 'saat ini?',
    sub: 'Pilih 2-4 yang paling sering kamu rasakan. Kami akan susun rencana latihanmu dari sini!',
    next: 'Lanjut', back: 'Kembali', skip: 'Lewati', selected: 'dipilih',
    problems: [
      { id: 'nervous', emoji: '😰', label: 'Gugup', sub: 'Detak naik, suara gemetar', color: '#FF8FA3' },
      { id: 'fillers', emoji: '🗣️', label: 'Filler Words', sub: '"Eee", "kayak", "anu"', color: '#FFD93D' },
      { id: 'pace',    emoji: '⏱️', label: 'Terlalu Cepat', sub: 'Tempo > 170 wpm', color: '#FFB57A' },
      { id: 'artic',   emoji: '🔈', label: 'Artikulasi', sub: 'Pengucapan kurang jelas', color: '#5DADEC' },
      { id: 'open',    emoji: '🎬', label: 'Buka / Tutup', sub: 'Hook & landing lemah', color: '#B58CFF' },
      { id: 'improv',  emoji: '💡', label: 'Improvisasi', sub: 'Kaku tanpa skrip', color: '#FFD93D' },
      { id: 'english', emoji: '🇬🇧', label: 'English', sub: 'Confidence Inggris', color: '#6BCB77' },
      { id: 'struct',  emoji: '📋', label: 'Struktur', sub: 'Alur sulit diikuti', color: '#FF8FA3' },
      { id: 'engage',  emoji: '🎭', label: 'Kurang Engaging', sub: 'Audiens hilang fokus', color: '#FFB57A' },
    ],
  } : {
    kicker: 'Onboarding · Step 3 of 7',
    title: 'What\'s your biggest', title2: 'challenge?',
    sub: 'Pick 2-4 that hit closest. We\'ll shape your plan from this!',
    next: 'Continue', back: 'Back', skip: 'Skip', selected: 'selected',
    problems: [
      { id: 'nervous', emoji: '😰', label: 'Nerves',         sub: 'Heart racing, voice shaky', color: '#FF8FA3' },
      { id: 'fillers', emoji: '🗣️', label: 'Filler Words',   sub: '"Uhh", "like", "you know"', color: '#FFD93D' },
      { id: 'pace',    emoji: '⏱️', label: 'Too Fast',       sub: 'Pace above 170 wpm', color: '#FFB57A' },
      { id: 'artic',   emoji: '🔈', label: 'Articulation',   sub: 'Words run together', color: '#5DADEC' },
      { id: 'open',    emoji: '🎬', label: 'Open / Close',   sub: 'Weak hooks & landings', color: '#B58CFF' },
      { id: 'improv',  emoji: '💡', label: 'Improvisation',  sub: 'Stiff without script', color: '#FFD93D' },
      { id: 'english', emoji: '🇬🇧', label: 'English',        sub: 'English confidence', color: '#6BCB77' },
      { id: 'struct',  emoji: '📋', label: 'Structure',      sub: 'Audience loses thread', color: '#FF8FA3' },
      { id: 'engage',  emoji: '🎭', label: 'Not Engaging',   sub: 'Attention drifts', color: '#FFB57A' },
    ],
  };

  const toggle = id => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  const STEP = 3, TOTAL = 7;

  return (
    <div className="min-h-full bg-paper-noise">
      <div className="border-b-2 border-line bg-cream/90 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-[960px] mx-auto px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2"><Mascot size={32}/><span className="font-display font-black text-xl">SpeakUp</span></div>
          <div className="text-xs font-extrabold">{t.kicker}</div>
          <button className="text-xs font-bold text-ink-3 hover:text-ink">{t.skip}</button>
        </div>
        <div className="max-w-[960px] mx-auto px-8 pb-5">
          <div className="flex items-center gap-2">
            {Array.from({ length: TOTAL }).map((_, i) => {
              const idx = i + 1;
              const isPast = idx < STEP, isCurrent = idx === STEP;
              const colors = ['#FFD93D', '#6BCB77', '#FF6B6B', '#B58CFF', '#5DADEC', '#FF8FA3', '#FFB57A'];
              return (
                <div key={i} className="flex-1 h-3 rounded-full border-2 border-line overflow-hidden bg-paper">
                  {(isPast || isCurrent) && (
                    <div className="h-full" style={{ background: colors[i], width: isCurrent ? '70%' : '100%', borderRight: isCurrent ? '2px solid #1F1A2E' : 'none' }}/>
                  )}
                </div>
              );
            })}
          </div>
          <div className="mt-2 flex items-center justify-between font-mono text-[11px] font-bold text-ink-2">
            <span>STEP {String(STEP).padStart(2,'0')} / {String(TOTAL).padStart(2,'0')}</span>
            <span>{Math.round((STEP/TOTAL) * 100)}% {lang==='id'?'selesai':'done'}</span>
          </div>
        </div>
      </div>

      <div className="max-w-[1000px] mx-auto px-8 py-12 fade-enter">
        <div className="text-center mb-10 relative">
          <div className="absolute left-1/4 -top-2 floaty"><Spark size={28} color="#FFD93D"/></div>
          <div className="absolute right-1/4 top-4 floaty" style={{ animationDelay: '0.7s' }}><Spark size={20} color="#FF8FA3"/></div>
          <h1 className="font-display text-5xl md:text-6xl font-black tracking-tight leading-[1.05] max-w-[680px] mx-auto">
            {t.title} <span className="marker-sun">{t.title2}</span>
          </h1>
          <p className="mt-5 text-ink-2 max-w-[520px] mx-auto leading-relaxed text-lg font-medium">{t.sub}</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
          {t.problems.map((p, i) => {
            const on = selected.includes(p.id);
            const tilt = [-1.2, 0.6, -0.8, 1.0, -0.6, 0.8, -1.4, 0.4, -0.6][i];
            return (
              <button key={p.id} onClick={() => toggle(p.id)}
                className={`relative text-left p-5 rounded-2xl border-2 border-line transition-all duration-150 group ${on ? 'selected-yay' : 'bg-paper shadow-pop lift-pop'}`}
                style={{ transform: on ? `rotate(${tilt}deg) translate(-2px,-2px)` : `rotate(${tilt}deg)` }}>
                {on && (
                  <span className="absolute -top-3 -right-3 w-9 h-9 rounded-full bg-mint border-2 border-line flex items-center justify-center text-white shadow-pop pop-in2">
                    <IconCheck size={18} stroke={3}/>
                  </span>
                )}
                <div className="w-[72px] h-[72px] rounded-2xl border-2 border-line flex items-center justify-center text-[40px] mb-4" style={{ background: p.color }}>
                  {p.emoji}
                </div>
                <div className="font-display font-black text-xl leading-tight">{p.label}</div>
                <div className="mt-1 text-xs text-ink-2 font-semibold leading-relaxed">{p.sub}</div>
              </button>
            );
          })}
        </div>

        <div className="mt-12 flex items-center justify-between">
          <Button variant="ghost">← {t.back}</Button>
          <div className="text-sm font-extrabold">
            <span className="font-display text-2xl text-coral">{selected.length}</span> {t.selected}
          </div>
          <Button variant="coral" disabled={selected.length === 0} iconRight={<IconArrowR size={18}/>} className={selected.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}>{t.next}</Button>
        </div>
      </div>
    </div>
  );
};

// ============== DASHBOARD ==============
const DashboardScreen = ({ lang, onStartPractice }) => {
  const t = lang === 'id' ? {
    greeting: 'Halo', name: 'Adi', sub: 'Siap latihan hari ini? Misimu butuh 12 menit aja!',
    mission: { title: 'Misi Hari Ini', topic: 'Pitch produk: aplikasi pertanian B2B', tag: 'Persuasif · 3 menit', desc: 'Latih struktur problem → solution → ask. Fokus: kurangi filler dan jaga tempo di bawah 160 wpm.', start: 'Mulai Sesi' },
    countdown: { title: 'Anchor Event', name: 'Investor Pitch — Series A', sub: 'Demo Day · BSD City', practiceLeft: 'Latihan tersisa', sessions: 'sesi' },
    weekly: 'Skor Mingguan', goals: 'Progres Goal', badges: 'Badge Terbaru', theory: 'Teori Hari Ini',
    goalList: [
      { name: 'Kurangi filler', cur: 7, max: 10, color: '#FF6B6B' },
      { name: 'Tempo < 165 wpm', cur: 4, max: 7, color: '#5DADEC' },
      { name: 'Confidence ≥ 85', cur: 12, max: 15, color: '#6BCB77' },
    ],
    theoryCard: { kicker: 'Aristotelian Rhetoric', title: 'Ethos sebelum Pathos', body: 'Sebelum membangkitkan emosi, bangun kredibilitas dulu. Audiens harus percaya kamu pantas didengar — baru mereka mau ikut merasa.' },
  } : {
    greeting: 'Hi', name: 'Adi', sub: 'Ready to practice? Today\'s mission only takes 12 minutes!',
    mission: { title: 'Today\'s Mission', topic: 'Product pitch: B2B agritech app', tag: 'Persuasive · 3 min', desc: 'Drill the problem → solution → ask structure. Focus: cut fillers, keep pace under 160 wpm.', start: 'Start Session' },
    countdown: { title: 'Anchor Event', name: 'Investor Pitch — Series A', sub: 'Demo Day · BSD City', practiceLeft: 'Practices left', sessions: 'sessions' },
    weekly: 'Weekly Score', goals: 'Goal Progress', badges: 'Recent Badges', theory: 'Today\'s Theory',
    goalList: [
      { name: 'Cut fillers', cur: 7, max: 10, color: '#FF6B6B' },
      { name: 'Pace < 165 wpm', cur: 4, max: 7, color: '#5DADEC' },
      { name: 'Confidence ≥ 85', cur: 12, max: 15, color: '#6BCB77' },
    ],
    theoryCard: { kicker: 'Aristotelian Rhetoric', title: 'Ethos before Pathos', body: 'Before stirring feelings, establish credibility. Your audience must believe you deserve to be heard — only then will they let themselves feel.' },
  };

  const sparkData = [62, 65, 71, 68, 74, 79, 87];
  const days = lang==='id'?['M','S','S','R','K','J','S']:['M','T','W','T','F','S','S'];
  const sparkColors = ['#FFD93D', '#FFB57A', '#FF8FA3', '#FF6B6B', '#B58CFF', '#5DADEC', '#6BCB77'];
  const countdown = [{ v:12, l: lang==='id'?'hari':'days' }, { v:4, l: lang==='id'?'jam':'hrs' }, { v:38, l:'min' }];
  const recentBadges = [
    { emoji: '🔥', name: lang==='id'?'7 hari beruntun':'7-day streak', color: '#FFD93D' },
    { emoji: '🎯', name: lang==='id'?'Pemburu Filler':'Filler hunter', color: '#FF8FA3' },
    { emoji: '⚡', name: lang==='id'?'Tempo Master':'Pace master', color: '#6BCB77' },
  ];

  return (
    <div className="max-w-[1240px] mx-auto px-8 py-8 space-y-6 fade-enter">
      {/* Greeting */}
      <Card className="p-7 relative overflow-hidden" style={{ background: '#FFD93D' }}>
        <div className="absolute top-3 right-6 floaty"><Spark size={24} color="#FFFFFF"/></div>
        <div className="absolute bottom-4 right-44 floaty" style={{ animationDelay: '1s' }}><Spark size={16} color="#FF6B6B"/></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider mb-3">
              <IconCal size={14}/> Senin · 10 Mei 2026
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-black tracking-tight leading-[1.05]">
              {t.greeting}, <span className="squiggle">{t.name}</span> <span className="wiggle">👋</span>
            </h1>
            <p className="mt-3 text-ink-2 text-base font-semibold">{t.sub}</p>
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <Sticker color="#FFFFFF" rotate={-3}>🌿 LV.12 · Confident Speaker</Sticker>
              <Sticker color="#6BCB77" rotate={4} className="text-white">⚡ Top 8% pekan ini</Sticker>
            </div>
          </div>
          <StreakBadge days={23}/>
        </div>
        <div className="mt-6 pt-6 border-t-2 border-dashed border-line">
          <XPBar value={2840} max={3500} level={12} nextLevel={13}/>
        </div>
      </Card>

      {/* Mission + Countdown */}
      <div className="grid lg:grid-cols-[1.5fr,1fr] gap-5">
        <Card className="p-7 relative overflow-hidden">
          <Sticker color="#FF6B6B" rotate={-8} className="absolute -top-2 right-8 text-white">⏱ 12 menit</Sticker>
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-ink-2 mb-3">
            <IconTarget size={14}/> {t.mission.title}
          </div>
          <h2 className="font-display text-3xl font-black tracking-tight leading-tight mb-1">{t.mission.topic}</h2>
          <div className="text-xs font-mono font-bold text-ink-2 mb-4">{t.mission.tag}</div>
          <p className="text-ink-2 leading-relaxed font-medium max-w-[520px]">{t.mission.desc}</p>

          <div className="mt-6">
            <div className="flex items-center justify-between text-xs font-bold mb-2">
              <span>{lang==='id'?'Progres misi pekan ini':'Mission progress this week'}</span>
              <span className="font-mono">4 / 7</span>
            </div>
            <div className="h-4 rounded-full bg-cream border-2 border-line overflow-hidden">
              <div className="h-full bg-mint" style={{ width: '57%', borderRight: '2px solid #1F1A2E', backgroundImage: 'repeating-linear-gradient(45deg, rgba(31,26,46,0.12) 0 6px, transparent 6px 12px)' }}/>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <Button variant="coral" onClick={onStartPractice} iconRight={<IconArrowR size={18}/>}>{t.mission.start}</Button>
            <Button variant="paper">{lang==='id'?'Ganti topik':'Change topic'}</Button>
          </div>
        </Card>

        <Card className="p-7 relative overflow-hidden" style={{ background: '#FF8FA3' }}>
          <Sticker color="#FFFFFF" rotate={6} className="absolute top-3 right-3" size="sm">🔔 30 hari lagi</Sticker>
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider mb-3">
            <IconCal size={14}/> {t.countdown.title}
          </div>
          <h3 className="font-display text-2xl font-black tracking-tight leading-tight">{t.countdown.name}</h3>
          <div className="text-xs font-bold mb-5 mt-1">{t.countdown.sub}</div>
          <div className="grid grid-cols-3 gap-2">
            {countdown.map((c, i) => (
              <div key={i} className="bg-paper border-2 border-line rounded-2xl p-3 text-center">
                <div className="font-display text-3xl font-black leading-none">{String(c.v).padStart(2,'0')}</div>
                <div className="text-[10px] uppercase tracking-wider font-extrabold mt-1.5">{c.l}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between text-xs font-extrabold">
            <span>{t.countdown.practiceLeft}</span>
            <span className="font-mono">9 {t.countdown.sessions}</span>
          </div>
        </Card>
      </div>

      {/* 4 widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Weekly */}
        <Card className="p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-xs font-extrabold uppercase tracking-wider text-ink-2 mb-1">{t.weekly}</div>
              <div className="flex items-baseline gap-2">
                <span className="font-display text-4xl font-black">87</span>
                <Sticker color="#6BCB77" rotate={-4} size="sm" className="text-white">↑ +9</Sticker>
              </div>
            </div>
            <Pill color="#FFE9A8">📈 {lang==='id'?'Tren naik':'Trending up'}</Pill>
          </div>
          <div className="flex items-end gap-2 h-32 mt-4">
            {sparkData.map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full rounded-xl border-2 border-line relative" style={{ height: `${v}%`, minHeight: 12, background: sparkColors[i] }}>
                  {i === sparkData.length - 1 && (
                    <span className="absolute -top-7 left-1/2 -translate-x-1/2 font-display text-sm font-black bg-paper border-2 border-line rounded-full px-1.5 shadow-pop">{v}</span>
                  )}
                </div>
                <span className="text-[11px] font-mono font-bold">{days[i]}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Goals */}
        <Card className="p-6">
          <div className="text-xs font-extrabold uppercase tracking-wider text-ink-2 mb-4">{t.goals}</div>
          <div className="space-y-3.5">
            {t.goalList.map((g, i) => {
              const pct = (g.cur/g.max) * 100;
              return (
                <div key={i}>
                  <div className="flex justify-between text-xs mb-1.5 font-bold">
                    <span>{g.name}</span><span className="font-mono">{g.cur}/{g.max}</span>
                  </div>
                  <div className="h-3 rounded-full bg-cream border-2 border-line overflow-hidden">
                    <div className="h-full" style={{ width: `${pct}%`, background: g.color, borderRight: '2px solid #1F1A2E' }}/>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Badges */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-xs font-extrabold uppercase tracking-wider text-ink-2">{t.badges}</div>
            <button className="text-xs font-extrabold underline decoration-2 underline-offset-2 decoration-coral">{lang==='id'?'Semua →':'All →'}</button>
          </div>
          <div className="space-y-2.5">
            {recentBadges.map((b, i) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded-2xl bg-cream border-2 border-line">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl border-2 border-line" style={{ background: b.color }}>{b.emoji}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-extrabold truncate">{b.name}</div>
                  <div className="text-[10px] font-mono font-bold text-ink-2">+50 XP</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Theory */}
      <Card className="p-7 relative overflow-hidden" style={{ background: '#B58CFF' }}>
        <div className="absolute right-8 top-8 text-white opacity-25"><IconBook size={120} stroke={1.6}/></div>
        <div className="relative max-w-[640px]">
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-white mb-3">
            <IconLamp size={14}/> {t.theory}
          </div>
          <Sticker color="#FFFFFF" rotate={-3} size="sm" className="mb-3">📚 {t.theoryCard.kicker}</Sticker>
          <h3 className="font-display text-3xl font-black tracking-tight leading-tight mb-3 text-white">{t.theoryCard.title}</h3>
          <p className="text-white/95 leading-relaxed font-semibold">{t.theoryCard.body}</p>
          <div className="mt-5">
            <Button variant="paper" size="sm" iconRight={<IconArrowR size={14}/>}>{lang==='id'?'Baca lengkap':'Read full'}</Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

// ============== PRACTICE ==============
const PracticeScreen = ({ lang, onExit, initialPhase = 'prep' }) => {
  const [phase, setPhase] = React.useState(initialPhase);
  const [elapsed, setElapsed] = React.useState(0);
  React.useEffect(() => {
    if (phase !== 'recording') return;
    const id = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(id);
  }, [phase]);
  React.useEffect(() => { if (phase === 'prep') setElapsed(0); }, [phase]);
  const fmt = s => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;

  const t = lang === 'id' ? {
    backTo: '← Kembali',
    phases: ['Persiapan', 'Rekaman', 'Skor & Feedback'],
    prep: {
      kicker: 'Misi · Pitch produk · 3 menit',
      topic: 'Pitch aplikasi pertanian B2B',
      sub: 'Susun problem → solution → ask. Bayangkan kamu pitch ke calon investor lokal!',
      instr: 'Instruksi',
      instructions: [
        'Mulai dengan hook 1-kalimat: kondisi pasar petani sayur saat ini.',
        'Jelaskan problem konkret yang dialami 1 persona spesifik.',
        'Tunjukkan solusi-mu — apa, bagaimana, kenapa berbeda.',
        'Tutup dengan ask yang jelas: jumlah dana + use of funds.',
      ],
      tips: 'Tips dari literatur',
      tipList: [
        { src: 'Carmine Gallo — Talk Like TED', body: 'Bawa 1 statistik mengejutkan di 30 detik pertama untuk mengunci perhatian.' },
        { src: 'Nancy Duarte — Resonate', body: 'Buat kontras "what is" vs "what could be" — semakin tajam, semakin menggerakkan.' },
      ],
      go: 'Mulai Rekaman',
      switch: 'Ganti topik',
    },
    rec: { kicker: 'REKAMAN', hint: 'Bicara dengan tempo natural. Mic kamu aktif.', stop: 'Stop & Analisis', pause: 'Jeda' },
    report: {
      kicker: 'Skor Sesi',
      headline: 'Pitch yang solid,', headline2: 'tinggal poles tempo!',
      pb: 'Personal Best',
      structure: 'Structure', delivery: 'Delivery', confidence: 'Confidence',
      well: 'Yang sudah bagus', improve: 'Yang bisa diperbaiki',
      transcript: 'Transkrip',
      legend: { filler: 'Filler', fast: 'Terlalu cepat', strong: 'Bagian kuat' },
      actions: 'Action items',
      done: 'Selesai · +240 XP',
    },
  } : {
    backTo: '← Back',
    phases: ['Prep', 'Recording', 'Score & Feedback'],
    prep: {
      kicker: 'Mission · Product pitch · 3 min',
      topic: 'B2B agritech pitch',
      sub: 'Build problem → solution → ask. Imagine pitching to a local investor!',
      instr: 'Instructions',
      instructions: [
        'Open with a one-sentence hook: state of the smallholder market.',
        'Describe a concrete problem one persona faces.',
        'Show your solution — what, how, why different.',
        'Close with a clear ask: amount + use of funds.',
      ],
      tips: 'Tips from the literature',
      tipList: [
        { src: 'Carmine Gallo — Talk Like TED', body: 'Drop a surprising stat in the first 30 seconds to lock attention.' },
        { src: 'Nancy Duarte — Resonate', body: 'Sharpen "what is" vs "what could be" — wider gap, more movement.' },
      ],
      go: 'Start Recording', switch: 'Switch topic',
    },
    rec: { kicker: 'RECORDING', hint: 'Speak at your natural pace. Mic is live.', stop: 'Stop & Analyze', pause: 'Pause' },
    report: {
      kicker: 'Session Score',
      headline: 'Solid pitch —', headline2: 'pace is the next polish!',
      pb: 'Personal Best',
      structure: 'Structure', delivery: 'Delivery', confidence: 'Confidence',
      well: 'What went well', improve: 'What to improve',
      transcript: 'Transcript',
      legend: { filler: 'Filler', fast: 'Too fast', strong: 'Strong segment' },
      actions: 'Action items',
      done: 'Finish · +240 XP',
    },
  };

  const PhaseHeader = () => (
    <div className="flex items-center justify-between flex-wrap gap-3">
      <Button variant="paper" size="sm" onClick={onExit}>{t.backTo}</Button>
      <div className="flex items-center gap-2">
        {t.phases.map((p, i) => {
          const phaseId = ['prep','recording','report'][i];
          const active = phaseId === phase;
          const done = ['prep','recording','report'].indexOf(phase) > i;
          const colors = ['#FFD93D', '#FF8FA3', '#6BCB77'];
          return (
            <React.Fragment key={p}>
              <div className={`flex items-center gap-2 px-3 h-9 rounded-full border-2 border-line text-xs font-extrabold ${active?'shadow-pop':''}`}
                   style={{ background: active ? colors[i] : (done ? '#FFFFFF' : '#FFF6E5'), color: active ? '#1F1A2E' : (done ? '#1F1A2E' : '#5C4E6F') }}>
                <span className="w-5 h-5 rounded-full border-2 border-line bg-paper font-mono text-[10px] flex items-center justify-center">
                  {done ? <IconCheck size={10} stroke={3}/> : i+1}
                </span>
                {p}
              </div>
              {i < 2 && <div className="w-4 h-0.5 bg-line"/>}
            </React.Fragment>
          );
        })}
      </div>
      <div className="font-mono text-xs font-bold w-[100px] text-right">#1284</div>
    </div>
  );

  return (
    <div className="max-w-[1240px] mx-auto px-8 py-8 space-y-6">
      <PhaseHeader/>

      {phase === 'prep' && (
        <div className="grid lg:grid-cols-[1.5fr,1fr] gap-5 fade-enter">
          <Card className="p-8 relative overflow-hidden">
            <Sticker color="#FFD93D" rotate={-6} className="absolute -top-3 left-8">{t.prep.kicker}</Sticker>
            <div className="absolute top-6 right-6 floaty"><Spark size={28} color="#FF8FA3"/></div>
            <h1 className="font-display text-5xl font-black tracking-tight leading-[1.05] mt-4">{t.prep.topic}</h1>
            <p className="mt-4 text-ink-2 text-lg leading-relaxed font-medium max-w-[560px]">{t.prep.sub}</p>

            <div className="mt-8">
              <div className="text-xs font-extrabold uppercase tracking-wider text-ink-2 mb-3">📋 {t.prep.instr}</div>
              <ol className="space-y-3">
                {t.prep.instructions.map((ins, i) => {
                  const colors = ['#FFD93D', '#FF8FA3', '#6BCB77', '#B58CFF'];
                  return (
                    <li key={i} className="flex gap-3 items-start">
                      <span className="flex-none w-8 h-8 rounded-full border-2 border-line font-display text-sm font-black flex items-center justify-center" style={{ background: colors[i] }}>{i+1}</span>
                      <span className="text-ink leading-relaxed font-semibold pt-0.5">{ins}</span>
                    </li>
                  );
                })}
              </ol>
            </div>

            <div className="mt-8 flex items-center gap-3">
              <Button size="lg" variant="coral" onClick={() => setPhase('recording')} icon={<IconMic size={20}/>}>{t.prep.go}</Button>
              <Button size="lg" variant="paper">{t.prep.switch}</Button>
            </div>
          </Card>

          <div className="space-y-5">
            <Card className="p-6" style={{ background: '#6BCB77' }}>
              <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider mb-4 text-white">
                <IconBook size={14}/> {t.prep.tips}
              </div>
              <div className="space-y-4">
                {t.prep.tipList.map((tip, i) => (
                  <div key={i} className="bg-paper border-2 border-line rounded-2xl p-4">
                    <div className="text-[11px] font-mono font-extrabold text-grape-d mb-1.5">{tip.src}</div>
                    <p className="text-sm text-ink leading-relaxed font-semibold">{tip.body}</p>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <div className="text-xs font-extrabold uppercase tracking-wider text-ink-2 mb-4">🎯 {lang==='id'?'Target sesi':'Session targets'}</div>
              <div className="space-y-3">
                {[
                  { k: lang==='id'?'Durasi':'Duration', v: '02:30 — 03:30', c: '#FFD93D' },
                  { k: lang==='id'?'Tempo':'Pace', v: '140 — 160 wpm', c: '#6BCB77' },
                  { k: 'Filler', v: '< 6 total', c: '#FF8FA3' },
                ].map((s,i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-2xl border-2 border-line" style={{ background: s.c + '40' }}>
                    <span className="text-sm font-bold">{s.k}</span>
                    <span className="font-mono text-sm font-extrabold">{s.v}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {phase === 'recording' && (
        <Card className="p-12 relative overflow-hidden fade-enter min-h-[520px] flex flex-col items-center justify-center" style={{ background: '#FFF6E5' }}>
          <div className="absolute inset-0 bg-dots opacity-50 pointer-events-none"/>
          <div className="absolute top-12 left-12 floaty"><Spark size={32} color="#FFD93D"/></div>
          <div className="absolute top-20 right-16 floaty" style={{ animationDelay: '1s' }}><Spark size={24} color="#FF8FA3"/></div>
          <div className="absolute bottom-16 left-20 floaty" style={{ animationDelay: '0.5s' }}><Spark size={20} color="#6BCB77"/></div>

          <div className="relative flex flex-col items-center">
            <div className="inline-flex items-center gap-2.5 px-4 h-10 rounded-full bg-coral border-2 border-line mb-8 rec-pulse2">
              <span className="w-2.5 h-2.5 rounded-full bg-paper"/>
              <span className="text-xs font-mono font-black text-paper tracking-widest">{t.rec.kicker}</span>
            </div>

            <div className="font-display text-[112px] md:text-[140px] leading-none font-black tabular-nums tracking-tight">
              {fmt(elapsed)}
            </div>
            <div className="font-mono text-xs font-extrabold text-ink-2 mt-2">/ 03:30 TARGET</div>

            <div className="mt-12 w-full max-w-[720px] bg-paper border-2 border-line rounded-2xl p-6 shadow-pop">
              <Waveform bars={56} active height={140}/>
            </div>

            <div className="mt-8 text-ink-2 font-bold">{t.rec.hint}</div>

            <div className="mt-8 flex items-center gap-3">
              <Button size="lg" variant="paper" icon={<IconPause size={18}/>}>{t.rec.pause}</Button>
              <Button size="lg" variant="coral" icon={<IconStop size={18}/>} onClick={() => setPhase('report')}>{t.rec.stop}</Button>
            </div>

            <div className="mt-12 w-full max-w-[720px] grid grid-cols-3 gap-3">
              {[
                { k: lang==='id'?'Tempo':'Pace', v: '152', u: 'wpm', c: '#6BCB77' },
                { k: 'Volume', v: '68', u: 'dB', c: '#5DADEC' },
                { k: 'Filler', v: '3', u: lang==='id'?'kata':'words', c: '#FFD93D' },
              ].map((m, i) => (
                <div key={i} className="rounded-2xl border-2 border-line p-3 text-center shadow-pop" style={{ background: m.c }}>
                  <div className="text-[10px] uppercase tracking-wider font-extrabold mb-1">{m.k}</div>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="font-display text-3xl font-black">{m.v}</span>
                    <span className="font-mono text-[10px] font-bold">{m.u}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {phase === 'report' && <ReportView lang={lang} t={t.report} onExit={onExit}/>}
    </div>
  );
};

const ReportView = ({ lang, t, onExit }) => {
  const [showXP, setShowXP] = React.useState(false);
  React.useEffect(() => {
    const id = setTimeout(() => setShowXP(true), 1200);
    return () => clearTimeout(id);
  }, []);

  const transcript = lang === 'id' ? [
    { type: 'normal', text: 'Bayangkan, ' },
    { type: 'strong', text: 'tujuh dari sepuluh petani sayur di Jawa Barat masih menjual ke tengkulak dengan harga 40 persen di bawah pasar.' },
    { type: 'normal', text: ' Itulah masalah yang Pak Yanto hadapi setiap pagi di Lembang. ' },
    { type: 'filler', text: 'Eee, ' },
    { type: 'normal', text: 'lewat Tani.id, kami menghubungkan langsung petani ke restoran dan ' },
    { type: 'fast', text: 'modern grocery dengan smart routing yang menjamin harga adil dan logistik dingin tanpa perantara.' },
    { type: 'normal', text: ' Dalam pilot 6 bulan, ' },
    { type: 'strong', text: 'pendapatan petani naik 38 persen sementara biaya pasokan ritel turun 12 persen.' },
    { type: 'normal', text: ' Hari ini kami minta ' },
    { type: 'filler', text: 'kayak, ' },
    { type: 'normal', text: '1,2 juta dolar untuk memperluas ke 3 provinsi.' },
  ] : [
    { type: 'normal', text: 'Imagine: ' },
    { type: 'strong', text: 'seven out of ten vegetable farmers in West Java still sell to middlemen at 40% below market.' },
    { type: 'normal', text: ' That\'s what Pak Yanto faces every morning in Lembang. ' },
    { type: 'filler', text: 'Uhh, ' },
    { type: 'normal', text: 'through Tani.id we connect farmers directly to restaurants and ' },
    { type: 'fast', text: 'modern grocery via smart routing that guarantees fair prices and cold logistics.' },
    { type: 'normal', text: ' In a 6-month pilot, ' },
    { type: 'strong', text: 'farmer income rose 38% while retail supply cost fell 12%.' },
    { type: 'normal', text: ' Today we ask for ' },
    { type: 'filler', text: 'like, ' },
    { type: 'normal', text: '$1.2M to expand into 3 provinces.' },
  ];
  const renderToken = (tok, i) => {
    if (tok.type === 'filler') return <span key={i} className="marker-sun font-bold">{tok.text}</span>;
    if (tok.type === 'fast') return <span key={i} className="marker-coral font-bold">{tok.text}</span>;
    if (tok.type === 'strong') return <span key={i} className="marker-mint font-bold">{tok.text}</span>;
    return <span key={i}>{tok.text}</span>;
  };

  const wells = lang === 'id' ? [
    'Hook pembuka tajam — statistik 70% langsung mengunci perhatian.',
    'Use of funds eksplisit di penutup — investor suka transparansi.',
    'Storytelling lewat persona "Pak Yanto" terasa konkret, bukan abstrak.',
  ] : [
    'Sharp opening hook — the 70% stat locked attention immediately.',
    'Use of funds spelled out in the close — investors love that clarity.',
    'Persona-led storytelling ("Pak Yanto") feels concrete, not abstract.',
  ];
  const improves = lang === 'id' ? [
    'Tempo melonjak ke 178 wpm di paruh tengah — turunkan ke 150.',
    'Filler "eee" dan "kayak" muncul 4 kali; latih jeda diam 1-detik.',
    'Belum ada bridge "what could be" — perkuat visi setelah masalah.',
  ] : [
    'Pace spiked to 178 wpm mid-pitch — bring it down to 150.',
    'Fillers "uhh" and "like" appeared 4×; practice silent 1-second pauses.',
    'Missing the "what could be" bridge — paint the vision after the problem.',
  ];
  const actions = lang === 'id' ? [
    { title: 'Latihan jeda diam 60 detik', sub: '5 kali, recite paragraf dengan jeda 1 detik di tiap koma.', color: '#FFD93D' },
    { title: 'Tempo drill — 145 wpm', sub: 'Baca 3 paragraf bookpitch dengan metronom 145 wpm.', color: '#6BCB77' },
    { title: 'Tambahkan visi 1-kalimat', sub: 'Tulis bridge "what could be" dan tempelkan ke pitch v2.', color: '#B58CFF' },
  ] : [
    { title: '60-sec silent pause drill', sub: '5 reps; recite a paragraph pausing 1 sec at every comma.', color: '#FFD93D' },
    { title: 'Pace drill — 145 wpm', sub: 'Read 3 paragraphs with a 145 wpm metronome.', color: '#6BCB77' },
    { title: 'Add a 1-sentence vision', sub: 'Write a "what could be" bridge and paste into pitch v2.', color: '#B58CFF' },
  ];

  return (
    <div className="space-y-5 fade-enter relative">
      {showXP && (
        <div className="fixed bottom-8 right-8 z-50 pop-in2">
          <Card className="p-5 !bg-sun">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-paper border-2 border-line flex items-center justify-center text-3xl bouncy">⚡</div>
              <div>
                <div className="font-display text-3xl font-black leading-none">+240 XP</div>
                <div className="text-xs font-extrabold mt-1">{lang==='id'?'Personal best!':'Personal best!'}</div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Score header */}
      <Card className="p-8 relative overflow-hidden">
        <Sticker color="#6BCB77" rotate={-8} className="absolute -top-3 left-8 text-white">⭐ {t.pb}</Sticker>
        <div className="absolute top-6 right-8 floaty"><Spark size={32} color="#FFD93D"/></div>
        <div className="grid lg:grid-cols-[auto,1fr] gap-10 items-center mt-4">
          <div className="flex items-center gap-8">
            <Ring value={87} size={200} stroke={18} color="#FF6B6B" label="87" sub={t.kicker}/>
            <div className="grid grid-cols-1 gap-3">
              {[
                { k: t.structure, v: 92, c: '#6BCB77' },
                { k: t.delivery, v: 81, c: '#5DADEC' },
                { k: t.confidence, v: 88, c: '#B58CFF' },
              ].map((s, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Ring value={s.v} size={68} stroke={8} color={s.c} label={s.v}/>
                  <div>
                    <div className="text-xs font-mono font-extrabold uppercase tracking-wider text-ink-2">{s.k}</div>
                    <div className="font-display text-lg font-black leading-tight">{s.v >= 90 ? 'Excellent' : s.v >= 80 ? 'Strong' : 'Solid'}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h2 className="font-display text-4xl md:text-5xl font-black tracking-tight leading-[1.05]">
              {t.headline}<br/>
              <span className="marker-sun">{t.headline2}</span>
            </h2>
            <div className="mt-6 grid grid-cols-3 gap-3 max-w-[480px]">
              {[
                { k: lang==='id'?'Durasi':'Duration', v: '03:12', c: '#FFD93D' },
                { k: lang==='id'?'Tempo':'Pace', v: '161 wpm', c: '#6BCB77' },
                { k: 'Filler', v: '4 / 6', c: '#FF8FA3' },
              ].map((s, i) => (
                <div key={i} className="rounded-2xl border-2 border-line p-3" style={{ background: s.c + '50' }}>
                  <div className="text-[10px] uppercase tracking-wider font-extrabold mb-1">{s.k}</div>
                  <div className="font-display text-xl font-black">{s.v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Well/improve */}
      <div className="grid md:grid-cols-2 gap-5">
        <Card className="p-7" style={{ background: '#6BCB77' }}>
          <div className="flex items-center gap-2 mb-4">
            <span className="w-9 h-9 rounded-full bg-paper border-2 border-line flex items-center justify-center"><IconCheck size={18} stroke={3}/></span>
            <h3 className="font-display text-xl font-black tracking-tight text-white">{t.well}</h3>
          </div>
          <ul className="space-y-2.5">
            {wells.map((w, i) => (
              <li key={i} className="flex gap-2.5 text-sm font-semibold leading-relaxed bg-paper rounded-2xl border-2 border-line p-3">
                <span>✨</span><span>{w}</span>
              </li>
            ))}
          </ul>
        </Card>
        <Card className="p-7" style={{ background: '#FFD93D' }}>
          <div className="flex items-center gap-2 mb-4">
            <span className="w-9 h-9 rounded-full bg-paper border-2 border-line flex items-center justify-center"><IconBolt size={18} stroke={2.6}/></span>
            <h3 className="font-display text-xl font-black tracking-tight">{t.improve}</h3>
          </div>
          <ul className="space-y-2.5">
            {improves.map((w, i) => (
              <li key={i} className="flex gap-2.5 text-sm font-semibold leading-relaxed bg-paper rounded-2xl border-2 border-line p-3">
                <span>🛠</span><span>{w}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Transcript */}
      <Card className="p-7">
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <h3 className="font-display text-2xl font-black tracking-tight">📝 {t.transcript}</h3>
          <div className="flex gap-2">
            <Pill color="#FFD93D">● {t.legend.filler}</Pill>
            <Pill color="#FF8FA3">● {t.legend.fast}</Pill>
            <Pill color="#6BCB77">● {t.legend.strong}</Pill>
          </div>
        </div>
        <div className="bg-cream border-2 border-line rounded-2xl p-6">
          <p className="text-base leading-[1.9] font-semibold max-w-[860px]">
            {transcript.map(renderToken)}
          </p>
        </div>
      </Card>

      {/* Action items */}
      <Card className="p-7">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display text-2xl font-black tracking-tight">🎯 {t.actions}</h3>
          <span className="font-mono text-xs font-bold">3 {lang==='id'?'item':'items'}</span>
        </div>
        <div className="grid md:grid-cols-3 gap-3">
          {actions.map((a, i) => (
            <div key={i} className="rounded-2xl border-2 border-line p-4 lift-pop shadow-pop" style={{ background: a.color }}>
              <div className="flex items-start gap-3">
                <span className="flex-none w-9 h-9 rounded-full bg-paper border-2 border-line font-display text-sm font-black flex items-center justify-center">{i+1}</span>
                <div>
                  <div className="font-display text-base font-black leading-tight mb-1.5">{a.title}</div>
                  <div className="text-xs leading-relaxed font-semibold">{a.sub}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 flex items-center justify-between">
          <Button variant="paper">{lang==='id'?'Latih lagi':'Practice again'}</Button>
          <Button variant="coral" onClick={onExit}>{t.done} 🎉</Button>
        </div>
      </Card>
    </div>
  );
};

// ============== PROGRESS ==============
const ProgressScreen = ({ lang }) => {
  const t = lang === 'id' ? {
    h1a: 'Progres &', h1b: 'Pencapaian',
    sub: '30 hari terakhir · konsistenmu mulai berbicara!',
    chart: 'Skor 30 hari', target: 'Target band', avg: 'Rerata', best: 'Terbaik',
    heatmap: 'Aktivitas latihan', less: 'Kurang', more: 'Lebih',
    badges: 'Koleksi Badge', earned: 'didapat', locked: 'terkunci',
    sessions: 'Sesi', xp: 'Total XP', streak: 'Streak terpanjang',
    journey: 'Perjalanan rank', rank: 'Rank Saat Ini',
  } : {
    h1a: 'Progress &', h1b: 'Achievements',
    sub: 'Last 30 days · the work is starting to show!',
    chart: '30-day score', target: 'Target band', avg: 'Avg', best: 'Best',
    heatmap: 'Practice activity', less: 'Less', more: 'More',
    badges: 'Badge Collection', earned: 'earned', locked: 'locked',
    sessions: 'Sessions', xp: 'Total XP', streak: 'Longest streak',
    journey: 'Rank journey', rank: 'Current Rank',
  };

  const scores = [62,64,61,67,65,70,68,72,69,74,71,73,76,72,75,78,74,79,77,80,82,78,81,84,80,83,86,82,85,87];

  const WEEKS = 18;
  const heatmap = React.useMemo(() => {
    const seed = [0,2,1,3,0,1,4,2,3,1,4,2,1,3,0,2,4,3];
    const rows = [];
    for (let d = 0; d < 7; d++) {
      const row = [];
      for (let w = 0; w < WEEKS; w++) row.push((seed[(w + d*3) % seed.length] + (d % 3)) % 5);
      rows.push(row);
    }
    return rows;
  }, []);
  const dayLabels = lang === 'id' ? ['Mn','Sl','Rb','Km','Jm','Sb','Mg'] : ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

  const allBadges = [
    { id: 'streak7',  emoji: '🔥', name: lang==='id'?'7 hari':'7 days', desc: lang==='id'?'Streak konsistensi':'Consistency streak', earned: true,  color: '#FFD93D' },
    { id: 'streak30', emoji: '🌟', name: lang==='id'?'30 hari':'30 days', desc: lang==='id'?'Habit terbentuk':'Habit forming', earned: false, color: '#FFD93D' },
    { id: 'filler',   emoji: '🎯', name: lang==='id'?'Pemburu Filler':'Filler hunter', desc: lang==='id'?'< 3 filler × 5 sesi':'< 3 fillers × 5 sessions', earned: true,  color: '#FF8FA3' },
    { id: 'pace',     emoji: '⚡', name: lang==='id'?'Tempo Master':'Pace master', desc: lang==='id'?'Tempo stabil 7 sesi':'Stable pace × 7', earned: true,  color: '#6BCB77' },
    { id: 'first90',  emoji: '🏆', name: lang==='id'?'Skor 90':'90 score', desc: lang==='id'?'Sesi pertama tembus 90':'First 90 session', earned: false, color: '#FFB57A' },
    { id: 'story',    emoji: '📖', name: 'Storyteller', desc: lang==='id'?'10 cerita selesai':'10 stories done', earned: true,  color: '#B58CFF' },
    { id: 'ted',      emoji: '👑', name: 'TED-Level', desc: lang==='id'?'Rank tertinggi':'Highest rank', earned: false, color: '#FFD93D' },
    { id: 'pitch10',  emoji: '💼', name: '10 Pitch', desc: lang==='id'?'Modul Bisnis':'Business module', earned: true,  color: '#5DADEC' },
    { id: 'eng10',    emoji: '🇬🇧', name: 'English × 10', desc: lang==='id'?'10 sesi Inggris':'10 English sessions', earned: false, color: '#6BCB77' },
    { id: 'hour',     emoji: '⏳', name: lang==='id'?'1 jam panggung':'1 stage hour', desc: lang==='id'?'60 menit kumulatif':'60 cumulative minutes', earned: true,  color: '#FFD93D' },
    { id: 'perfect',  emoji: '💎', name: lang==='id'?'Sesi Sempurna':'Perfect session', desc: lang==='id'?'0 filler · target tempo':'0 fillers · pace on target', earned: false, color: '#B58CFF' },
    { id: 'comeback', emoji: '🌅', name: 'Comeback', desc: lang==='id'?'Lanjut setelah 7 hari off':'Resume after 7-day break', earned: false, color: '#FF8FA3' },
  ];

  // Score chart
  const W = 760, H = 230, P = 32;
  const minS = 50, maxS = 100;
  const xAt = i => P + (i / (scores.length - 1)) * (W - 2*P);
  const yAt = v => H - P - ((v - minS) / (maxS - minS)) * (H - 2*P);
  const path = scores.map((v, i) => `${i===0?'M':'L'}${xAt(i).toFixed(1)},${yAt(v).toFixed(1)}`).join(' ');
  const area = `${path} L${xAt(scores.length-1).toFixed(1)},${H-P} L${P},${H-P} Z`;
  const bandTop = yAt(90), bandBot = yAt(75);

  const ranks = [
    { emoji: '🌱', name: 'Silent Seed', xp: 0, on: true, color: '#6BCB77' },
    { emoji: '🌿', name: 'Confident Speaker', xp: 1500, on: true, current: true, color: '#FFD93D' },
    { emoji: '🎙️', name: 'Stage Ready', xp: 5000, on: false, color: '#FF8FA3' },
    { emoji: '⭐', name: 'Keynoter', xp: 12000, on: false, color: '#B58CFF' },
    { emoji: '👑', name: 'TED-Level', xp: 25000, on: false, color: '#FF6B6B' },
  ];

  return (
    <div className="max-w-[1240px] mx-auto px-8 py-8 space-y-6 fade-enter">
      <div className="flex items-end justify-between flex-wrap gap-4 relative">
        <div className="absolute -top-2 left-72 floaty"><Spark size={24} color="#FFD93D"/></div>
        <div>
          <h1 className="font-display text-5xl font-black tracking-tight leading-[1.05]">
            {t.h1a}<br/>
            <span className="squiggle">{t.h1b}</span> <span className="wiggle">🏆</span>
          </h1>
          <p className="text-ink-2 mt-3 font-semibold text-lg">{t.sub}</p>
        </div>
        <div className="flex gap-3">
          {[
            { k: t.sessions, v: '127', c: '#FFD93D', tilt: -2 },
            { k: t.xp, v: '8,420', c: '#FF8FA3', tilt: 1.5 },
            { k: t.streak, v: '23', c: '#6BCB77', tilt: -1 },
          ].map((s, i) => (
            <div key={i} className="rounded-2xl border-2 border-line p-3 px-4 shadow-pop" style={{ background: s.c, transform: `rotate(${s.tilt}deg)` }}>
              <div className="text-[10px] uppercase tracking-wider font-extrabold mb-0.5">{s.k}</div>
              <div className="font-display text-2xl font-black">{s.v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Chart */}
      <Card className="p-7">
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider"><IconChart size={14}/>{t.chart}</div>
          <div className="flex gap-3 text-xs font-bold">
            <span className="inline-flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm border-2 border-line bg-mint/40"/>{t.target}</span>
            <span className="inline-flex items-center gap-1.5"><span className="w-3 h-3 rounded-full border-2 border-line bg-grape"/>{t.avg} 75</span>
            <span className="inline-flex items-center gap-1.5"><span className="w-3 h-3 rounded-full border-2 border-line bg-sun"/>{t.best} 87</span>
          </div>
        </div>
        <div className="bg-cream border-2 border-line rounded-2xl p-4">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" preserveAspectRatio="none">
            <defs>
              <linearGradient id="area-c" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FF6B6B" stopOpacity="0.45"/>
                <stop offset="100%" stopColor="#FF6B6B" stopOpacity="0"/>
              </linearGradient>
            </defs>
            {[60,70,80,90].map((g) => (
              <g key={g}>
                <line x1={P} x2={W-P} y1={yAt(g)} y2={yAt(g)} stroke="#1F1A2E" strokeWidth="1" strokeDasharray="3 4" opacity="0.25"/>
                <text x={P-8} y={yAt(g)+3} fill="#1F1A2E" fontSize="11" textAnchor="end" fontFamily="JetBrains Mono" fontWeight="700">{g}</text>
              </g>
            ))}
            <rect x={P} y={bandTop} width={W-2*P} height={bandBot-bandTop} fill="rgba(107,203,119,0.25)" stroke="#3FA94F" strokeWidth="2" strokeDasharray="5 4" rx="6"/>
            <path d={area} fill="url(#area-c)"/>
            <path d={path} fill="none" stroke="#1F1A2E" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d={path} fill="none" stroke="#FF6B6B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            {scores.map((v, i) => (
              <circle key={i} cx={xAt(i)} cy={yAt(v)} r={i === scores.length - 1 ? 7 : 3} fill={i === scores.length - 1 ? '#FFD93D' : '#FF6B6B'} stroke="#1F1A2E" strokeWidth="2"/>
            ))}
            {[0, 7, 14, 21, 29].map(i => (
              <text key={i} x={xAt(i)} y={H-10} fill="#5C4E6F" fontSize="11" textAnchor="middle" fontFamily="JetBrains Mono" fontWeight="700">D{i+1}</text>
            ))}
          </svg>
        </div>
      </Card>

      {/* Heatmap + Rank */}
      <div className="grid lg:grid-cols-[1.4fr,1fr] gap-5">
        <Card className="p-7">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider"><IconCal size={14}/>{t.heatmap}</div>
            <span className="text-xs font-mono font-bold"><span className="font-display font-black">87</span> {lang==='id'?'sesi':'sessions'}</span>
          </div>
          <div className="flex gap-2">
            <div className="flex flex-col gap-[4px] pt-[18px] pr-1 font-mono text-[9px] font-bold text-ink-2">
              {dayLabels.map((d, i) => <div key={i} style={{ height: 18 }}>{i % 2 === 0 ? d : ''}</div>)}
            </div>
            <div className="flex-1">
              <div className="flex justify-between font-mono text-[10px] font-bold text-ink-2 mb-2 px-1">
                <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>Mei</span>
              </div>
              <div className="grid gap-[4px]" style={{ gridTemplateColumns: `repeat(${WEEKS}, 1fr)` }}>
                {Array.from({ length: WEEKS }).map((_, w) => (
                  <div key={w} className="flex flex-col gap-[4px]">
                    {heatmap.map((row, d) => (
                      <div key={d} className={`ch-${row[w]} rounded-md aspect-square`}/>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-5 flex items-center justify-end gap-1.5 text-[10px] font-mono font-bold">
            <span>{t.less}</span>
            {[0,1,2,3,4].map(l => <div key={l} className={`ch-${l} w-4 h-4 rounded-md`}/>)}
            <span>{t.more}</span>
          </div>
        </Card>

        <Card className="p-7">
          <div className="text-xs font-extrabold uppercase tracking-wider mb-5 flex items-center gap-2"><IconTrophy size={14}/>{t.journey}</div>
          <div className="space-y-3">
            {ranks.map((r, i) => (
              <div key={i} className={`flex items-center gap-3 p-3 rounded-2xl border-2 border-line ${r.current ? 'shadow-pop' : ''}`}
                   style={{ background: r.current ? r.color : (r.on ? '#FFFFFF' : '#FFF6E5'), opacity: r.on ? 1 : 0.5 }}>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl border-2 border-line bg-paper">{r.on ? r.emoji : <IconLock size={18}/>}</div>
                <div className="flex-1 min-w-0">
                  <div className={`font-display text-base font-black ${r.on ? '' : 'text-ink-2'}`}>{r.name}</div>
                  <div className="text-[10px] font-mono font-bold">{r.xp.toLocaleString()} XP</div>
                </div>
                {r.current && <Sticker color="#FFFFFF" rotate={6} size="sm">{lang==='id'?'KAMU':'YOU'}</Sticker>}
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Badges */}
      <Card className="p-7">
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div className="text-xs font-extrabold uppercase tracking-wider flex items-center gap-2"><IconStar size={14}/>{t.badges}</div>
          <div className="flex gap-2 text-xs font-mono font-bold">
            <Pill color="#6BCB77">{allBadges.filter(b=>b.earned).length} {t.earned}</Pill>
            <Pill color="#FFE9A8">{allBadges.filter(b=>!b.earned).length} {t.locked}</Pill>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {allBadges.map((b, i) => {
            const tilt = [(-1.5),0.8,(-0.6),1.2,(-1),0.6,(-0.8),1.4,(-1.2),0.4,(-0.6),1][i];
            return (
              <div key={b.id} className="p-4 rounded-2xl border-2 border-line text-center lift-pop shadow-pop"
                   style={{ background: b.earned ? b.color : '#FFFFFF', transform: `rotate(${tilt}deg)`, opacity: b.earned ? 1 : 0.55 }}>
                <div className="mx-auto w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-3 bg-paper border-2 border-line">
                  {b.earned ? b.emoji : <IconLock size={20}/>}
                </div>
                <div className="font-display text-sm font-black leading-tight">{b.name}</div>
                <div className="text-[10px] font-semibold mt-1 leading-snug">{b.desc}</div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Rank card */}
      <Card className="p-8 relative overflow-hidden" style={{ background: '#FFD93D' }}>
        <div className="absolute -top-8 -right-8 w-44 h-44 rounded-full bg-coral/30"/>
        <div className="absolute top-12 right-32 floaty"><Spark size={28} color="#FF6B6B"/></div>
        <div className="relative grid md:grid-cols-[auto,1fr,auto] gap-6 items-center">
          <div className="w-24 h-24 rounded-2xl bg-paper border-2 border-line flex items-center justify-center text-5xl shadow-pop">🌿</div>
          <div>
            <div className="text-xs font-extrabold uppercase tracking-wider mb-1">{t.rank}</div>
            <h3 className="font-display text-3xl font-black tracking-tight">Confident Speaker</h3>
            <div className="text-ink-2 font-bold mt-1">{lang==='id'?'2.840 dari 3.500 XP menuju Stage Ready':'2,840 of 3,500 XP to Stage Ready'}</div>
            <div className="mt-3 max-w-[440px]">
              <XPBar value={2840} max={3500} level={12} nextLevel={13}/>
            </div>
          </div>
          <div className="hidden md:flex flex-col items-end gap-2">
            <Sticker color="#FF6B6B" rotate={4} className="text-white">⭐ Top 8%</Sticker>
            <span className="font-mono text-xs font-bold">{lang==='id'?'7 sesi lagi!':'7 more sessions!'}</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

Object.assign(window, { LandingScreen, OnboardingScreen, DashboardScreen, PracticeScreen, ProgressScreen });
