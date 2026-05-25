// App shell — switches between 5 screens
const SCREENS = [
  { id: 'landing',    label: { id: '01 Landing', en: '01 Landing' } },
  { id: 'onboarding', label: { id: '02 Onboarding', en: '02 Onboarding' } },
  { id: 'dashboard',  label: { id: '03 Dashboard', en: '03 Dashboard' } },
  { id: 'practice',   label: { id: '04 Practice', en: '04 Practice' } },
  { id: 'progress',   label: { id: '05 Progress', en: '05 Progress' } },
];

const App = () => {
  const [screen, setScreen] = React.useState('landing');
  const [lang, setLang] = React.useState('id');

  // Read hash for deep-link
  React.useEffect(() => {
    const fromHash = window.location.hash.replace('#','');
    if (SCREENS.some(s => s.id === fromHash)) setScreen(fromHash);
  }, []);
  React.useEffect(() => { window.location.hash = screen; }, [screen]);

  // For dashboard/practice deep-link
  const goPractice = () => setScreen('practice');
  const goDashboard = () => setScreen('dashboard');

  const screenLabel = SCREENS.find(s => s.id === screen)?.label[lang];

  return (
    <div className="min-h-screen bg-bg" data-screen-label={screenLabel}>
      {/* Floating screen-switcher bar */}
      <ScreenSwitcher screen={screen} setScreen={setScreen} lang={lang} setLang={setLang}/>

      {/* Main */}
      <main className="relative pb-20">
        {screen === 'landing'    && <LandingScreen lang={lang} setLang={setLang} onCtaLogin={() => setScreen('dashboard')} onCtaStart={() => setScreen('onboarding')}/>}
        {screen === 'onboarding' && <OnboardingScreen lang={lang}/>}
        {screen === 'dashboard'  && <DashboardScreen lang={lang} onStartPractice={goPractice}/>}
        {screen === 'practice'   && <PracticeScreen lang={lang} onExit={goDashboard}/>}
        {screen === 'progress'   && <ProgressScreen lang={lang}/>}
      </main>
    </div>
  );
};

const ScreenSwitcher = ({ screen, setScreen, lang, setLang }) => {
  const [open, setOpen] = React.useState(true);
  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50">
      {open ? (
        <div className="glass rounded-card px-2.5 py-2 flex items-center gap-1 shadow-2xl">
          <div className="flex items-center gap-1 pr-2 mr-1 border-r border-border-2">
            <IconLogo size={22}/>
            <span className="text-xs font-bold tracking-tight pr-1">SpeakUp</span>
          </div>
          {SCREENS.map(s => (
            <button key={s.id} onClick={() => setScreen(s.id)}
              className={`tab-btn px-3 h-8 rounded-btn text-xs font-semibold transition-all border border-transparent ${screen===s.id?'tab-active':'text-text-2'}`}>
              {s.label[lang]}
            </button>
          ))}
          <div className="ml-2 pl-2 border-l border-border-2 flex items-center gap-1">
            <div className="flex items-center p-0.5 rounded-md bg-surface-2 border border-border text-[11px] font-mono">
              <button onClick={() => setLang('id')} className={`px-1.5 h-6 rounded-sm font-semibold ${lang==='id'?'bg-surface-3 text-text-1':'text-text-3'}`}>ID</button>
              <button onClick={() => setLang('en')} className={`px-1.5 h-6 rounded-sm font-semibold ${lang==='en'?'bg-surface-3 text-text-1':'text-text-3'}`}>EN</button>
            </div>
            <button onClick={() => setOpen(false)} className="w-7 h-7 rounded-md hover:bg-surface-2 text-text-3 hover:text-text-1 flex items-center justify-center">
              <IconClose size={14}/>
            </button>
          </div>
        </div>
      ) : (
        <button onClick={() => setOpen(true)} className="glass rounded-full w-12 h-12 flex items-center justify-center shadow-2xl hover:shadow-glow-primary transition-all">
          <IconMenu size={18}/>
        </button>
      )}
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
