// App shell — cartoon edition
const SCREENS = [
  { id: 'landing',    label: '01 Landing' },
  { id: 'onboarding', label: '02 Onboarding' },
  { id: 'dashboard',  label: '03 Dashboard' },
  { id: 'practice',   label: '04 Practice' },
  { id: 'progress',   label: '05 Progress' },
];

const App = () => {
  const [screen, setScreen] = React.useState('landing');
  const [lang, setLang] = React.useState('id');

  React.useEffect(() => {
    const fromHash = window.location.hash.replace('#','');
    if (SCREENS.some(s => s.id === fromHash)) setScreen(fromHash);
  }, []);
  React.useEffect(() => { window.location.hash = screen; }, [screen]);

  return (
    <div className="min-h-screen bg-cream" data-screen-label={SCREENS.find(s => s.id === screen)?.label}>
      <ScreenSwitcher screen={screen} setScreen={setScreen} lang={lang} setLang={setLang}/>
      <main className="relative pb-28">
        {screen === 'landing'    && <LandingScreen lang={lang} setLang={setLang} onCtaLogin={() => setScreen('dashboard')} onCtaStart={() => setScreen('onboarding')}/>}
        {screen === 'onboarding' && <OnboardingScreen lang={lang}/>}
        {screen === 'dashboard'  && <DashboardScreen lang={lang} onStartPractice={() => setScreen('practice')}/>}
        {screen === 'practice'   && <PracticeScreen lang={lang} onExit={() => setScreen('dashboard')}/>}
        {screen === 'progress'   && <ProgressScreen lang={lang}/>}
      </main>
    </div>
  );
};

const ScreenSwitcher = ({ screen, setScreen, lang, setLang }) => {
  const [open, setOpen] = React.useState(true);
  const colors = ['#FFD93D', '#FF8FA3', '#6BCB77', '#B58CFF', '#5DADEC'];
  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50">
      {open ? (
        <div className="bg-paper rounded-2xl border-2 border-line px-2.5 py-2 flex items-center gap-1 shadow-pop-lg">
          <div className="flex items-center gap-1.5 pr-2 mr-1 border-r-2 border-line">
            <Mascot size={26}/>
            <span className="font-display font-black text-sm pr-1">SpeakUp</span>
          </div>
          {SCREENS.map((s, i) => (
            <button key={s.id} onClick={() => setScreen(s.id)}
              className={`px-3 h-9 rounded-xl text-xs font-extrabold transition-all border-2 ${screen===s.id?'border-line shadow-pop':'border-transparent hover:bg-cream'}`}
              style={{ background: screen === s.id ? colors[i] : 'transparent' }}>
              {s.label}
            </button>
          ))}
          <div className="ml-2 pl-2 border-l-2 border-line flex items-center gap-1">
            <div className="flex items-center p-0.5 rounded-full bg-cream border-2 border-line text-[11px] font-mono">
              <button onClick={() => setLang('id')} className={`px-2 h-7 rounded-full font-bold ${lang==='id'?'bg-sun':''}`}>ID</button>
              <button onClick={() => setLang('en')} className={`px-2 h-7 rounded-full font-bold ${lang==='en'?'bg-sun':''}`}>EN</button>
            </div>
            <button onClick={() => setOpen(false)} className="w-8 h-8 rounded-lg hover:bg-cream flex items-center justify-center">
              <IconClose size={16}/>
            </button>
          </div>
        </div>
      ) : (
        <button onClick={() => setOpen(true)} className="w-14 h-14 rounded-full bg-sun border-2 border-line shadow-pop-lg flex items-center justify-center lift-pop press">
          <IconMenu size={22}/>
        </button>
      )}
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
