// App root
const App = () => {
  const [view, setView]       = React.useState("dashboard");
  const [source, setSource]   = React.useState(null);
  const [captureOpen, setCO]  = React.useState(false);

  React.useEffect(() => { setSource(null); }, [view]);

  React.useEffect(() => {
    const fn = e => {
      if (e.key === "Escape") setCO(false);
      if ((e.metaKey || e.ctrlKey) && e.key === ".") { e.preventDefault(); setCO(o => !o); }
      if ((e.metaKey || e.ctrlKey) && e.key === "1") { e.preventDefault(); setView("dashboard"); }
      if ((e.metaKey || e.ctrlKey) && e.key === "2") { e.preventDefault(); setView("catalog"); }
      if ((e.metaKey || e.ctrlKey) && e.key === "3") { e.preventDefault(); setView("skills"); }
      if ((e.metaKey || e.ctrlKey) && e.key === "4") { e.preventDefault(); setView("profile"); }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, []);

  return (
    <div className="app bg-paper-noise">
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
      <FAB onClick={() => setCO(true)}/>
      <QuickCapture open={captureOpen} onClose={() => setCO(false)}/>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
