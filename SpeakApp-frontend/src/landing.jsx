// LANDING PAGE — pre-login
const LandingScreen = ({ lang, setLang, onCtaLogin, onCtaStart }) => {
  const t = lang === 'id' ? {
    nav: { login: 'Masuk' },
    hero: {
      kicker: 'AI public speaking coach',
      h1: ['Dari grogi', 'jadi ', 'memukau.'],
      sub: 'Latih public speaking dengan AI yang ngerti bahasa Indonesia. Skor real-time, latihan harian, dan progres yang bisa dilihat.',
      cta1: 'Mulai Gratis',
      cta2: 'Masuk',
      micro: 'Gratis 14 hari · Tanpa kartu kredit',
    },
    proof: 'Bergabung dengan 10.000+ speaker',
    features: [
      { kicker: '01 — Personalisasi', title: 'Coach yang ngerti kamu', body: 'Wizard 7-langkah memetakan masalahmu — gugup, filler words, terlalu cepat — lalu menyusun rencana latihan yang spesifik.' },
      { kicker: '02 — Latihan Harian', title: '10 menit, setiap hari', body: 'Misi harian singkat dengan topik yang relevan. Konsisten 3 minggu, transformasi nyata akan kamu rasakan.' },
      { kicker: '03 — Naik Level', title: 'Dari Silent Seed → TED-Level', body: 'XP, streak, dan badge yang bermakna. Setiap latihan terhitung. Lihat dirimu naik level di setiap pitch.' },
    ],
  } : {
    nav: { login: 'Sign in' },
    hero: {
      kicker: 'AI public speaking coach',
      h1: ['From nervous', 'to ', 'commanding.'],
      sub: 'Train public speaking with AI that understands Indonesian and English. Real-time scoring, daily drills, visible progress.',
      cta1: 'Start free',
      cta2: 'Sign in',
      micro: 'Free for 14 days · No credit card',
    },
    proof: 'Join 10,000+ speakers',
    features: [
      { kicker: '01 — Personalize', title: 'A coach that gets you', body: 'A 7-step intake maps what holds you back — nerves, filler words, pace — then builds a focused practice plan.' },
      { kicker: '02 — Daily reps', title: '10 minutes, every day', body: 'Short daily missions with topics that matter. Stick with it for three weeks and feel the shift.' },
      { kicker: '03 — Level up', title: 'Silent Seed → TED-Level', body: 'XP, streaks, and badges with real meaning. Every rep counts. Watch yourself level up pitch by pitch.' },
    ],
  };

  const avatars = [
    { name: 'Adi Pratama', color: '#4F6EF7' }, { name: 'Maya Putri', color: '#7C3AED' },
    { name: 'Rio Hartono', color: '#10B981' }, { name: 'Nadia Sari', color: '#F59E0B' },
    { name: 'Bayu Wiyono', color: '#F43F5E' }, { name: 'Citra Dewi', color: '#06B6D4' },
  ];

  return (
    <div className="min-h-full">
      {/* Navbar */}
      <nav className="sticky top-0 z-30 backdrop-blur-xl bg-bg/70 border-b border-border">
        <div className="max-w-[1240px] mx-auto px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <IconLogo size={32}/>
            <span className="font-extrabold text-lg tracking-tight">SpeakUp</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center p-1 rounded-btn bg-surface border border-border text-xs font-mono">
              <button onClick={() => setLang('id')} className={`px-2.5 h-7 rounded-md font-semibold ${lang==='id'?'bg-surface-3 text-text-1':'text-text-2'}`}>ID</button>
              <button onClick={() => setLang('en')} className={`px-2.5 h-7 rounded-md font-semibold ${lang==='en'?'bg-surface-3 text-text-1':'text-text-2'}`}>EN</button>
            </div>
            <Button variant="ghost" size="sm" onClick={onCtaLogin}>{t.nav.login}</Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-50"/>
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[900px] rounded-full grad-bg-soft blur-[120px] opacity-60 pointer-events-none"/>
        <div className="relative max-w-[1240px] mx-auto px-8 pt-20 pb-24 grid lg:grid-cols-[1.1fr,0.9fr] gap-16 items-center">
          <div className="fade-enter">
            <div className="inline-flex items-center gap-2 mb-6 px-3 h-8 rounded-full bg-surface border border-border text-xs font-semibold text-text-2">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse"/>
              {t.hero.kicker}
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-[64px] font-extrabold leading-[1.05] tracking-tight">
              {t.hero.h1[0]}<br/>
              {t.hero.h1[1]}<span className="grad-text">{t.hero.h1[2]}</span>
            </h1>
            <p className="mt-6 text-lg text-text-2 max-w-[480px] leading-relaxed">{t.hero.sub}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" onClick={onCtaStart} iconRight={<IconArrowRight size={18}/>}>{t.hero.cta1}</Button>
              <Button size="lg" variant="ghost" onClick={onCtaLogin}>{t.hero.cta2}</Button>
            </div>
            <div className="mt-4 text-xs text-text-3 font-mono">{t.hero.micro}</div>

            {/* Social proof */}
            <div className="mt-10 flex items-center gap-4">
              <div className="flex -space-x-2">
                {avatars.map((a, i) => (
                  <Avatar key={i} name={a.name} color={a.color} size={36} ring/>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1 mb-1">
                  {[0,1,2,3,4].map(i => <span key={i} className="text-warning text-sm">★</span>)}
                  <span className="font-mono text-xs text-text-2 ml-1">4.9</span>
                </div>
                <div className="text-sm text-text-2 font-medium">{t.proof}</div>
              </div>
            </div>
          </div>

          {/* Hero visual: live score preview card */}
          <div className="relative">
            <div className="absolute -inset-6 grad-bg-soft blur-3xl opacity-70 rounded-full pointer-events-none"/>
            <Card glass className="relative p-7">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-error rec-pulse"/>
                  <span className="text-xs font-mono uppercase tracking-wider text-text-2">Live · Investor pitch</span>
                </div>
                <span className="font-mono text-xs text-text-3">02:47</span>
              </div>
              <div className="flex items-center gap-6">
                <RingChart value={87} size={140} stroke={12} label="87" sub="Skor sesi"/>
                <div className="flex-1 space-y-3">
                  {[
                    { k: 'Structure', v: 92, tone: 'success' },
                    { k: 'Delivery', v: 81, tone: 'primary' },
                    { k: 'Confidence', v: 88, tone: 'secondary' },
                  ].map(r => (
                    <div key={r.k}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-text-2 font-medium">{r.k}</span>
                        <span className="font-mono font-bold">{r.v}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-surface-3 overflow-hidden">
                        <div className={`h-full rounded-full ${r.tone==='success'?'bg-success':r.tone==='primary'?'bg-primary':'bg-secondary'}`} style={{ width: `${r.v}%` }}/>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-border">
                <Waveform bars={48} active height={42}/>
              </div>
              <div className="mt-5 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs">
                  <IconSparkles size={14} className="text-warning"/>
                  <span className="font-semibold">+240 XP</span>
                  <span className="text-text-3">· Level up dalam 3 sesi</span>
                </div>
                <Pill tone="success" icon={<IconCheck size={12}/>}>Personal best</Pill>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative max-w-[1240px] mx-auto px-8 py-20">
        <div className="grid md:grid-cols-3 gap-5">
          {t.features.map((f, i) => (
            <Card key={i} className="p-7 lift">
              <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-text-3 mb-4">{f.kicker}</div>
              <div className="w-11 h-11 rounded-btn grad-bg-soft border border-primary/30 flex items-center justify-center mb-5 text-primary">
                {i === 0 ? <IconTarget size={20}/> : i === 1 ? <IconBolt size={20}/> : <IconTrophy size={20}/>}
              </div>
              <h3 className="text-xl font-bold mb-2 tracking-tight">{f.title}</h3>
              <p className="text-text-2 leading-relaxed text-sm">{f.body}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Footer strip */}
      <footer className="border-t border-border">
        <div className="max-w-[1240px] mx-auto px-8 py-8 flex items-center justify-between text-xs text-text-3 font-mono">
          <div className="flex items-center gap-2"><IconLogo size={20}/><span>SpeakUp · {new Date().getFullYear()}</span></div>
          <div className="flex gap-6">
            <span>Privacy</span><span>Terms</span><span>Support</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

window.LandingScreen = LandingScreen;
