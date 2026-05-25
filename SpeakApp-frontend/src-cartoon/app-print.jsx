// Print-stacked app — all screens rendered at once with page breaks
const PrintApp = () => {
  const [lang, setLang] = React.useState('id');
  const screens = [
    { id: 'landing', label: '01 — Landing', el: <LandingScreen lang={lang} setLang={setLang} onCtaLogin={()=>{}} onCtaStart={()=>{}}/> },
    { id: 'onboarding', label: '02 — Onboarding (Step 3 / 7)', el: <OnboardingScreen lang={lang}/> },
    { id: 'dashboard', label: '03 — Dashboard', el: <DashboardScreen lang={lang} onStartPractice={()=>{}}/> },
    { id: 'practice', label: '04 — Practice · Score Report', el: <PracticeScreen lang={lang} onExit={()=>{}} initialPhase="report"/> },
    { id: 'progress', label: '05 — Progress & Achievements', el: <ProgressScreen lang={lang}/> },
  ];
  return (
    <div className="print-doc">
      {screens.map((s, i) => (
        <section key={s.id} className="print-page">
          <header className="print-header">
            <div className="flex items-center gap-2">
              <Mascot size={26}/>
              <span className="font-display font-black text-xl">SpeakUp</span>
              <span className="text-ink-2 font-semibold text-sm ml-2">· Cartoon Edition</span>
            </div>
            <div className="font-mono text-xs font-extrabold tracking-wider">{s.label}</div>
          </header>
          <div className="print-body">{s.el}</div>
          <footer className="print-footer font-mono text-[10px] font-bold text-ink-2">
            <span>SpeakUp · UI Mockup · 2026</span>
            <span>Page {i + 1} of {screens.length}</span>
          </footer>
        </section>
      ))}
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<PrintApp/>);
