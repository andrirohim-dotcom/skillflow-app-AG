// ONBOARDING WIZARD — step 3 of 7
const OnboardingScreen = ({ lang }) => {
  const [selected, setSelected] = React.useState(['nervous', 'pace']);

  const t = lang === 'id' ? {
    kicker: 'Onboarding · Langkah 3 dari 7',
    title: 'Apa masalah utamamu saat ini?',
    sub: 'Pilih 2-4 yang paling sering kamu rasakan. Kami akan bangun rencana latihanmu dari sini.',
    next: 'Lanjut',
    back: 'Kembali',
    skip: 'Lewati',
    selected: 'dipilih',
    problems: [
      { id: 'nervous',  emoji: '😰', label: 'Gugup', sub: 'Detak jantung naik, suara bergetar' },
      { id: 'fillers',  emoji: '🗣️', label: 'Filler Words', sub: '"Eee", "kayak", "anu"' },
      { id: 'pace',     emoji: '⏱️', label: 'Terlalu Cepat', sub: 'Tempo > 170 wpm' },
      { id: 'artic',    emoji: '🔈', label: 'Artikulasi', sub: 'Pengucapan kurang jelas' },
      { id: 'open',     emoji: '🎬', label: 'Pembukaan / Penutupan', sub: 'Hook & landing yang lemah' },
      { id: 'improv',   emoji: '💡', label: 'Improvisasi', sub: 'Kaku saat di luar skrip' },
      { id: 'english',  emoji: '🇬🇧', label: 'English', sub: 'Confidence saat berbahasa Inggris' },
      { id: 'struct',   emoji: '📋', label: 'Struktur', sub: 'Alur sulit diikuti audiens' },
      { id: 'engage',   emoji: '🎭', label: 'Kurang Engaging', sub: 'Audiens cepat hilang fokus' },
    ],
  } : {
    kicker: 'Onboarding · Step 3 of 7',
    title: 'What\'s your biggest challenge right now?',
    sub: 'Pick 2-4 that hit closest. We\'ll shape your practice plan from this.',
    next: 'Continue',
    back: 'Back',
    skip: 'Skip',
    selected: 'selected',
    problems: [
      { id: 'nervous',  emoji: '😰', label: 'Nerves', sub: 'Heart racing, voice shaky' },
      { id: 'fillers',  emoji: '🗣️', label: 'Filler Words', sub: '"Uhh", "like", "you know"' },
      { id: 'pace',     emoji: '⏱️', label: 'Too Fast', sub: 'Pace above 170 wpm' },
      { id: 'artic',    emoji: '🔈', label: 'Articulation', sub: 'Words run together' },
      { id: 'open',     emoji: '🎬', label: 'Open / Close', sub: 'Weak hooks and landings' },
      { id: 'improv',   emoji: '💡', label: 'Improvisation', sub: 'Stiff outside the script' },
      { id: 'english',  emoji: '🇬🇧', label: 'English', sub: 'Confidence speaking English' },
      { id: 'struct',   emoji: '📋', label: 'Structure', sub: 'Audience loses the thread' },
      { id: 'engage',   emoji: '🎭', label: 'Not Engaging', sub: 'Attention drifts away' },
    ],
  };

  const toggle = (id) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);

  const STEP = 3, TOTAL = 7;

  return (
    <div className="min-h-full flex flex-col fade-enter">
      {/* Top bar with steps */}
      <div className="border-b border-border bg-bg/80 backdrop-blur-xl sticky top-0 z-20">
        <div className="max-w-[960px] mx-auto px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <IconLogo size={28}/>
            <span className="font-extrabold tracking-tight">SpeakUp</span>
          </div>
          <div className="text-xs text-text-2 font-medium">{t.kicker}</div>
          <button className="text-xs text-text-3 hover:text-text-2 font-medium">{t.skip}</button>
        </div>
        {/* Step dots */}
        <div className="max-w-[960px] mx-auto px-8 pb-5">
          <div className="flex items-center gap-2">
            {Array.from({ length: TOTAL }).map((_, i) => {
              const idx = i + 1;
              const isPast = idx < STEP, isCurrent = idx === STEP;
              return (
                <React.Fragment key={i}>
                  <div className={`flex-1 h-1.5 rounded-full ${isPast || isCurrent ? 'grad-bg' : 'bg-surface-3'}`} style={{ opacity: isCurrent ? 1 : isPast ? 0.85 : 1 }}/>
                </React.Fragment>
              );
            })}
          </div>
          <div className="mt-2 flex items-center justify-between font-mono text-[11px] text-text-3">
            <span>STEP {String(STEP).padStart(2,'0')} / {String(TOTAL).padStart(2,'0')}</span>
            <span>{Math.round((STEP / TOTAL) * 100)}% {lang==='id'?'selesai':'done'}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-[960px] mx-auto w-full px-8 py-12">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-[44px] font-extrabold tracking-tight leading-tight max-w-[640px] mx-auto">{t.title}</h1>
          <p className="mt-4 text-text-2 text-base max-w-[520px] mx-auto leading-relaxed">{t.sub}</p>
        </div>

        {/* Problem grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {t.problems.map(p => {
            const on = selected.includes(p.id);
            return (
              <button
                key={p.id}
                onClick={() => toggle(p.id)}
                className={`relative text-left p-5 rounded-card border transition-all duration-200 group ${on ? 'bg-surface-2 border-primary/60 selected-glow' : 'bg-surface border-border hover:border-border-2 hover:-translate-y-0.5'}`}
              >
                {on && (
                  <span className="absolute top-3 right-3 w-6 h-6 rounded-full grad-bg flex items-center justify-center text-white">
                    <IconCheck size={14} stroke={2.5}/>
                  </span>
                )}
                <div className={`w-[80px] h-[80px] rounded-btn flex items-center justify-center text-[44px] mb-4 transition-all ${on ? 'grad-bg-soft' : 'bg-surface-2 group-hover:bg-surface-3'}`}>
                  {p.emoji}
                </div>
                <div className="font-bold text-base leading-tight tracking-tight">{p.label}</div>
                <div className="mt-1 text-xs text-text-2 leading-relaxed">{p.sub}</div>
              </button>
            );
          })}
        </div>

        {/* Footer actions */}
        <div className="mt-10 flex items-center justify-between">
          <Button variant="ghost">← {t.back}</Button>
          <div className="text-xs font-mono text-text-2">
            <span className="font-bold text-text-1">{selected.length}</span> {t.selected}
          </div>
          <Button disabled={selected.length === 0} iconRight={<IconArrowRight size={16}/>} className={selected.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}>
            {t.next}
          </Button>
        </div>
      </div>
    </div>
  );
};

window.OnboardingScreen = OnboardingScreen;
