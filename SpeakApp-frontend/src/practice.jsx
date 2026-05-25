// PRACTICE SESSION — 3 phases: prep, recording, score report
const PracticeScreen = ({ lang, onExit }) => {
  const [phase, setPhase] = React.useState('prep'); // prep | recording | report
  const [elapsed, setElapsed] = React.useState(0);

  React.useEffect(() => {
    if (phase !== 'recording') return;
    const id = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(id);
  }, [phase]);

  React.useEffect(() => {
    if (phase === 'prep') setElapsed(0);
  }, [phase]);

  const fmt = (s) => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;

  const t = lang === 'id' ? {
    backTo: '← Kembali ke Dashboard',
    phases: ['Persiapan', 'Rekaman', 'Skor & Feedback'],
    prep: {
      kicker: 'Misi · Pitch produk · 3 menit',
      topic: 'Pitch produk: aplikasi pertanian B2B untuk petani sayur',
      sub: 'Susun problem → solution → ask. Bayangkan kamu pitch ke calon investor lokal.',
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
    rec: {
      kicker: 'REKAMAN BERLANGSUNG',
      hint: 'Bicara dengan tempo natural. Mic kamu aktif.',
      stop: 'Stop & Analisis',
      pause: 'Jeda',
    },
    report: {
      kicker: 'Skor Sesi',
      headline: 'Pitch yang solid, tinggal poles tempo',
      pb: 'Personal Best',
      structure: 'Structure',
      delivery: 'Delivery',
      confidence: 'Confidence',
      well: 'Yang sudah bagus',
      improve: 'Yang bisa diperbaiki',
      transcript: 'Transkrip',
      legend: { filler: 'Filler word', fast: 'Terlalu cepat', strong: 'Bagian kuat' },
      actions: 'Action items',
      done: 'Selesai · +240 XP',
    },
  } : {
    backTo: '← Back to Dashboard',
    phases: ['Prep', 'Recording', 'Score & Feedback'],
    prep: {
      kicker: 'Mission · Product pitch · 3 min',
      topic: 'Product pitch: B2B agritech app for vegetable farmers',
      sub: 'Build problem → solution → ask. Imagine pitching to a local investor.',
      instr: 'Instructions',
      instructions: [
        'Open with a one-sentence hook: the state of the smallholder market.',
        'Describe a concrete problem one specific persona faces.',
        'Show your solution — what it is, how it works, why it\'s different.',
        'Close with a clear ask: amount + use of funds.',
      ],
      tips: 'Tips from the literature',
      tipList: [
        { src: 'Carmine Gallo — Talk Like TED', body: 'Drop one surprising stat in the first 30 seconds to lock attention.' },
        { src: 'Nancy Duarte — Resonate', body: 'Sharpen the "what is" vs "what could be" contrast — the wider the gap, the more it moves people.' },
      ],
      go: 'Start Recording',
      switch: 'Switch topic',
    },
    rec: {
      kicker: 'RECORDING',
      hint: 'Speak at your natural pace. Mic is live.',
      stop: 'Stop & Analyze',
      pause: 'Pause',
    },
    report: {
      kicker: 'Session Score',
      headline: 'Solid pitch — pace is the next polish',
      pb: 'Personal Best',
      structure: 'Structure',
      delivery: 'Delivery',
      confidence: 'Confidence',
      well: 'What went well',
      improve: 'What to improve',
      transcript: 'Transcript',
      legend: { filler: 'Filler word', fast: 'Too fast', strong: 'Strong segment' },
      actions: 'Action items',
      done: 'Finish · +240 XP',
    },
  };

  // Phase header
  const PhaseHeader = () => (
    <div className="flex items-center justify-between">
      <button onClick={onExit} className="text-sm text-text-2 hover:text-text-1 font-medium">{t.backTo}</button>
      <div className="flex items-center gap-2">
        {t.phases.map((p, i) => {
          const phaseId = ['prep','recording','report'][i];
          const active = phaseId === phase;
          const done = ['prep','recording','report'].indexOf(phase) > i;
          return (
            <React.Fragment key={p}>
              <div className={`flex items-center gap-2 px-3 h-8 rounded-full text-xs font-semibold border ${active?'grad-bg-soft text-text-1 border-primary/40':done?'bg-surface text-text-2 border-border':'bg-surface text-text-3 border-border'}`}>
                <span className={`w-5 h-5 rounded-full font-mono text-[10px] flex items-center justify-center ${active?'grad-bg text-white':done?'bg-success text-white':'bg-surface-3 text-text-3'}`}>
                  {done ? <IconCheck size={11}/> : i+1}
                </span>
                {p}
              </div>
              {i < 2 && <div className="w-6 h-px bg-border"/>}
            </React.Fragment>
          );
        })}
      </div>
      <div className="text-xs font-mono text-text-3 w-[180px] text-right">SESSION · #1284</div>
    </div>
  );

  return (
    <div className="max-w-[1240px] mx-auto px-8 py-8 space-y-6">
      <PhaseHeader/>

      {phase === 'prep' && (
        <div className="grid lg:grid-cols-[1.5fr,1fr] gap-5 fade-enter">
          <Card className="p-8 relative overflow-hidden">
            <div className="absolute -top-32 -right-32 w-96 h-96 grad-bg-soft rounded-full blur-3xl pointer-events-none"/>
            <div className="relative">
              <div className="text-xs font-mono uppercase tracking-wider text-text-3 mb-3">{t.prep.kicker}</div>
              <h1 className="text-[40px] leading-[1.1] font-extrabold tracking-tight">{t.prep.topic}</h1>
              <p className="mt-4 text-text-2 text-base leading-relaxed max-w-[560px]">{t.prep.sub}</p>

              <div className="mt-8">
                <div className="text-xs font-mono uppercase tracking-wider text-text-3 mb-3">{t.prep.instr}</div>
                <ol className="space-y-2.5">
                  {t.prep.instructions.map((ins, i) => (
                    <li key={i} className="flex gap-3 items-start">
                      <span className="flex-none w-6 h-6 rounded-full bg-surface-2 border border-border-2 font-mono text-[11px] font-bold flex items-center justify-center text-text-2 mt-0.5">{i+1}</span>
                      <span className="text-text-1 text-sm leading-relaxed">{ins}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="mt-8 flex items-center gap-3">
                <Button size="lg" onClick={() => setPhase('recording')} icon={<IconMic size={18}/>}>{t.prep.go}</Button>
                <Button size="lg" variant="ghost">{t.prep.switch}</Button>
              </div>
            </div>
          </Card>

          <div className="space-y-5">
            <Card className="p-6">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-text-3 mb-4">
                <IconBook size={14}/> {t.prep.tips}
              </div>
              <div className="space-y-4">
                {t.prep.tipList.map((tip, i) => (
                  <div key={i} className="border-l-2 border-secondary/50 pl-4">
                    <div className="text-[11px] font-mono text-secondary mb-1.5">{tip.src}</div>
                    <p className="text-sm text-text-1 leading-relaxed">{tip.body}</p>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <div className="text-xs font-mono uppercase tracking-wider text-text-3 mb-4">{lang==='id'?'Target sesi':'Session targets'}</div>
              <div className="space-y-3">
                {[
                  { k: lang==='id'?'Durasi':'Duration', v: '02:30 — 03:30', tone: 'primary' },
                  { k: lang==='id'?'Tempo':'Pace', v: '140 — 160 wpm', tone: 'success' },
                  { k: lang==='id'?'Filler words':'Filler words', v: '< 6 total', tone: 'warning' },
                ].map((s,i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <span className="text-sm text-text-2">{s.k}</span>
                    <span className="font-mono text-sm font-semibold">{s.v}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {phase === 'recording' && (
        <Card className="p-12 relative overflow-hidden fade-enter min-h-[520px] flex flex-col items-center justify-center">
          <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none"/>
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-error/10 blur-3xl pointer-events-none"/>

          <div className="relative flex flex-col items-center">
            <div className="inline-flex items-center gap-2.5 px-4 h-9 rounded-full border border-error/40 bg-error/10 mb-8">
              <span className="w-2 h-2 rounded-full bg-error rec-pulse"/>
              <span className="text-xs font-mono font-bold text-error tracking-widest">{t.rec.kicker}</span>
            </div>

            <div className="font-mono text-[96px] md:text-[128px] leading-none font-bold tabular-nums tracking-tight">
              {fmt(elapsed)}
            </div>
            <div className="font-mono text-xs text-text-3 mt-2">/ 03:30 TARGET</div>

            <div className="mt-12 w-full max-w-[720px]">
              <Waveform bars={64} active height={140}/>
            </div>

            <div className="mt-10 text-text-2 text-sm">{t.rec.hint}</div>

            <div className="mt-8 flex items-center gap-3">
              <Button size="lg" variant="ghost" icon={<IconPause size={18}/>}>{t.rec.pause}</Button>
              <Button size="lg" variant="danger" icon={<IconStop size={18}/>} onClick={() => setPhase('report')}>{t.rec.stop}</Button>
            </div>

            {/* Live meters */}
            <div className="mt-12 w-full max-w-[720px] grid grid-cols-3 gap-3">
              {[
                { k: lang==='id'?'Tempo':'Pace', v: '152', u: 'wpm', tone: 'success' },
                { k: lang==='id'?'Volume':'Volume', v: '68', u: 'dB', tone: 'primary' },
                { k: 'Fillers', v: '3', u: lang==='id'?'kata':'words', tone: 'warning' },
              ].map((m, i) => (
                <div key={i} className="bg-surface-2 border border-border rounded-btn px-4 py-3 text-center">
                  <div className="text-[10px] uppercase tracking-wider text-text-3 font-semibold mb-1">{m.k}</div>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className={`font-mono text-2xl font-bold ${m.tone==='success'?'text-success':m.tone==='primary'?'text-primary':'text-warning'}`}>{m.v}</span>
                    <span className="font-mono text-[10px] text-text-3">{m.u}</span>
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
    const id = setTimeout(() => setShowXP(true), 1400);
    return () => clearTimeout(id);
  }, []);

  // Highlighted transcript
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
    { type: 'normal', text: '1,2 juta dolar untuk memperluas ke 3 provinsi dan membangun gudang dingin keempat.' },
  ] : [
    { type: 'normal', text: 'Imagine: ' },
    { type: 'strong', text: 'seven out of ten vegetable farmers in West Java still sell to middlemen at 40% below market price.' },
    { type: 'normal', text: ' That\'s what Pak Yanto faces every morning in Lembang. ' },
    { type: 'filler', text: 'Uhh, ' },
    { type: 'normal', text: 'through Tani.id we connect farmers directly to restaurants and ' },
    { type: 'fast', text: 'modern grocery via smart routing that guarantees fair prices and cold logistics with no middlemen.' },
    { type: 'normal', text: ' In a 6-month pilot, ' },
    { type: 'strong', text: 'farmer income rose 38% while retail supply cost fell 12%.' },
    { type: 'normal', text: ' Today we\'re asking for ' },
    { type: 'filler', text: 'like, ' },
    { type: 'normal', text: '$1.2M to expand into 3 provinces and build a fourth cold warehouse.' },
  ];

  const renderToken = (tok, i) => {
    if (tok.type === 'filler') return <mark key={i} className="bg-warning/20 text-warning rounded px-0.5 mx-px">{tok.text}</mark>;
    if (tok.type === 'fast') return <mark key={i} className="bg-error/15 text-error rounded px-0.5 mx-px underline decoration-error/40 decoration-wavy">{tok.text}</mark>;
    if (tok.type === 'strong') return <mark key={i} className="bg-success/15 text-success/95 rounded px-0.5 mx-px font-medium">{tok.text}</mark>;
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
    { title: 'Latihan jeda diam 60 detik', sub: '5 kali, recite paragraf dengan jeda 1 detik di tiap koma.' },
    { title: 'Tempo drill — 145 wpm', sub: 'Baca 3 paragraf bookpitch dengan metronom 145 wpm.' },
    { title: 'Tambahkan visi 1-kalimat', sub: 'Tulis bridge "what could be" dan tempelkan ke pitch v2.' },
  ] : [
    { title: '60-sec silent pause drill', sub: '5 reps; recite a paragraph pausing 1 sec at every comma.' },
    { title: 'Pace drill — 145 wpm', sub: 'Read 3 paragraphs with a 145 wpm metronome.' },
    { title: 'Add a 1-sentence vision', sub: 'Write a "what could be" bridge and paste into pitch v2.' },
  ];

  return (
    <div className="space-y-5 fade-enter relative">
      {/* XP popup */}
      {showXP && (
        <div className="fixed bottom-8 right-8 z-50 pop-in">
          <Card className="p-5 grad-bg-soft border-primary/40 shadow-glow-primary backdrop-blur-xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full grad-bg flex items-center justify-center text-2xl">⚡</div>
              <div>
                <div className="font-mono text-2xl font-bold">+240 XP</div>
                <div className="text-xs text-text-2">{lang==='id'?'Sesi tersimpan · Personal best':'Session saved · Personal best'}</div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Score header */}
      <Card className="p-8 relative overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] grad-bg-soft rounded-full blur-3xl pointer-events-none"/>
        <div className="relative grid lg:grid-cols-[auto,1fr] gap-10 items-center">
          <div className="flex items-center gap-8">
            <RingChart value={87} size={200} stroke={16} label="87" sub={t.kicker}/>
            <div className="grid grid-cols-1 gap-4">
              {[
                { k: t.structure, v: 92, tone: 'success' },
                { k: t.delivery, v: 81, tone: 'primary' },
                { k: t.confidence, v: 88, tone: 'secondary' },
              ].map((s, i) => (
                <div key={i} className="flex items-center gap-3">
                  <RingChart value={s.v} size={64} stroke={6} label={s.v} tone={s.tone === 'secondary' ? 'primary' : s.tone} gradient={`lg-mini-${i}`}/>
                  <div>
                    <div className="text-xs font-mono uppercase tracking-wider text-text-3">{s.k}</div>
                    <div className="text-text-2 text-sm font-medium">{s.v >= 90 ? 'Excellent' : s.v >= 80 ? 'Strong' : s.v >= 70 ? 'Solid' : 'Working'}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Pill tone="success" icon={<IconStar size={12}/>}>{t.pb}</Pill>
              <Pill tone="primary"><span className="font-mono">+9</span> vs avg</Pill>
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight max-w-[520px]">{t.headline}</h2>
            <div className="mt-6 grid grid-cols-3 gap-3 max-w-[480px]">
              <Stat k={lang==='id'?'Durasi':'Duration'} v="03:12"/>
              <Stat k={lang==='id'?'Tempo rerata':'Avg pace'} v="161 wpm"/>
              <Stat k="Fillers" v="4 / 6"/>
            </div>
          </div>
        </div>
      </Card>

      {/* Well / improve */}
      <div className="grid md:grid-cols-2 gap-5">
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-7 h-7 rounded-full bg-success/15 text-success flex items-center justify-center"><IconCheck size={14}/></span>
            <h3 className="font-bold tracking-tight">{t.well}</h3>
          </div>
          <ul className="space-y-2.5">
            {wells.map((w, i) => (
              <li key={i} className="flex gap-2.5 text-sm text-text-1 leading-relaxed">
                <span className="text-success mt-1">●</span>
                <span>{w}</span>
              </li>
            ))}
          </ul>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-7 h-7 rounded-full bg-warning/15 text-warning flex items-center justify-center"><IconBolt size={14}/></span>
            <h3 className="font-bold tracking-tight">{t.improve}</h3>
          </div>
          <ul className="space-y-2.5">
            {improves.map((w, i) => (
              <li key={i} className="flex gap-2.5 text-sm text-text-1 leading-relaxed">
                <span className="text-warning mt-1">●</span>
                <span>{w}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Transcript */}
      <Card className="p-7">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold tracking-tight text-lg">{t.transcript}</h3>
          <div className="flex gap-2 text-[11px]">
            <Pill tone="warning">{t.legend.filler}</Pill>
            <Pill tone="error">{t.legend.fast}</Pill>
            <Pill tone="success">{t.legend.strong}</Pill>
          </div>
        </div>
        <p className="text-base leading-[1.85] text-text-1 max-w-[860px]">
          {transcript.map(renderToken)}
        </p>
      </Card>

      {/* Action items */}
      <Card className="p-7">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold tracking-tight text-lg">{t.actions}</h3>
          <span className="font-mono text-xs text-text-3">3 {lang==='id'?'item':'items'}</span>
        </div>
        <div className="grid md:grid-cols-3 gap-3">
          {actions.map((a, i) => (
            <div key={i} className="bg-surface-2 border border-border rounded-btn p-4 lift">
              <div className="flex items-start gap-3">
                <span className="flex-none w-7 h-7 rounded-full grad-bg text-white text-xs font-bold flex items-center justify-center mt-0.5">{i+1}</span>
                <div>
                  <div className="font-semibold text-sm leading-tight mb-1.5">{a.title}</div>
                  <div className="text-text-2 text-xs leading-relaxed">{a.sub}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 flex items-center justify-between">
          <Button variant="ghost">{lang==='id'?'Latih lagi':'Practice again'}</Button>
          <Button onClick={onExit} icon={<IconSparkles size={16}/>}>{t.done}</Button>
        </div>
      </Card>
    </div>
  );
};

const Stat = ({ k, v }) => (
  <div className="bg-surface-2 border border-border rounded-btn p-3">
    <div className="text-[10px] uppercase tracking-wider text-text-3 font-semibold mb-1">{k}</div>
    <div className="font-mono text-lg font-bold">{v}</div>
  </div>
);

window.PracticeScreen = PracticeScreen;
