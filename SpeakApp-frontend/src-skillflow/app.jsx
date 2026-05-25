// App root — routes between views

const App = () => {
  const [view, setView] = React.useState("dashboard");
  const [source, setSource] = React.useState(null);
  const [captureOpen, setCaptureOpen] = React.useState(false);

  // Reset detail when changing top-level view
  React.useEffect(() => { setSource(null); }, [view]);

  // ⌘K-ish shortcut: cmd+. opens quick capture
  React.useEffect(() => {
    const fn = e => {
      if (e.key === "Escape") setCaptureOpen(false);
      if ((e.metaKey || e.ctrlKey) && e.key === ".") { e.preventDefault(); setCaptureOpen(o => !o); }
      if ((e.metaKey || e.ctrlKey) && e.key === "1") { e.preventDefault(); setView("dashboard"); }
      if ((e.metaKey || e.ctrlKey) && e.key === "2") { e.preventDefault(); setView("catalog"); }
      if ((e.metaKey || e.ctrlKey) && e.key === "3") { e.preventDefault(); setView("skills"); }
      if ((e.metaKey || e.ctrlKey) && e.key === "4") { e.preventDefault(); setView("profile"); }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, []);

  return (
    <div className="app">
      <Sidebar view={view} setView={setView}/>
      <div className="main-wrap">
        <Header view={view}/>
        <div className="content">
          {view === "dashboard" && <DashboardView/>}
          {view === "catalog"   && <CatalogView source={source} setSource={setSource}/>}
          {view === "skills"    && <SkillsView/>}
          {view === "profile"   && <ProfileView/>}
        </div>
      </div>
      <FAB onClick={() => setCaptureOpen(true)}/>
      <QuickCapture open={captureOpen} onClose={() => setCaptureOpen(false)}/>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
