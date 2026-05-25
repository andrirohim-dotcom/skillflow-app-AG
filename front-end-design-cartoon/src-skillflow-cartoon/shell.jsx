// Shell — sidebar, header, FAB, quick capture

const NAV = [
  { id: "dashboard", icon: "home",   label: "Beranda",      emoji: "🏠", hint: "⌘1" },
  { id: "catalog",   icon: "book",   label: "Belajar",      emoji: "📚", hint: "⌘2" },
  { id: "skills",    icon: "tree",   label: "Skill Tree",   emoji: "🌱", hint: "⌘3" },
  { id: "profile",   icon: "user",   label: "Karakter",     emoji: "🧙", hint: "⌘4" },
];
const NAV_2 = [
  { id: "inbox",    icon: "lightbulb", label: "Inbox",    emoji: "💡", count: 4 },
  { id: "archive",  icon: "archive",   label: "Arsip",    emoji: "📦" },
  { id: "settings", icon: "settings",  label: "Setelan",  emoji: "⚙️" },
];

const Sidebar = ({ view, setView }) => {
  return (
    <aside className="bg-cream border-r-[2.5px] border-ink p-4 flex flex-col sticky top-0 h-screen overflow-y-auto">
      {/* logo */}
      <div className="flex items-center gap-2.5 mb-5">
        <div className="relative">
          <div className="w-11 h-11 rounded-2xl bg-coral border-[2.5px] border-ink flex items-center justify-center text-white text-[22px] floaty" style={{ boxShadow: "3px 3px 0 #1F1A2E" }}>
            🚀
          </div>
          <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-sun border-[2px] border-ink pulsey"/>
        </div>
        <div>
          <div className="font-display font-black text-[18px] leading-none">Skill<span className="text-coral">Flow</span></div>
          <div className="font-mono text-[9px] text-ink-2 tracking-widest mt-1">LEARNING · OS · v0.5</div>
        </div>
      </div>

      {/* search */}
      <div className="sticker-flat bg-paper px-3 py-2 mb-5 flex items-center gap-2">
        <Icon name="search" size={15} style={{ color: "#5C4E6F" }}/>
        <input placeholder="Cari apapun…" className="flex-1 bg-transparent outline-none text-[13px] font-semibold placeholder-ink-3"/>
        <span className="font-mono text-[9px] font-bold text-ink-2 px-1.5 py-0.5 rounded bg-cream border-[1.5px] border-ink">⌘K</span>
      </div>

      <div className="eyebrow px-2 mb-2">Workspace</div>
      <nav className="flex flex-col gap-1.5 mb-4">
        {NAV.map(n => {
          const active = view === n.id;
          return (
            <div key={n.id} onClick={() => setView(n.id)}
              className={`relative cursor-pointer rounded-2xl px-3 py-2.5 flex items-center gap-2.5 font-bold text-[13.5px] transition-all ${active ? "bg-ink text-sun border-[2.5px] border-ink" : "text-ink-2 hover:bg-paper hover:text-ink border-[2.5px] border-transparent"}`}
              style={active ? { boxShadow: "3px 3px 0 #FFD93D" } : {}}
            >
              <span className={`text-[18px] ${active ? "bouncey" : ""}`}>{n.emoji}</span>
              <span className="flex-1">{n.label}</span>
              <span className={`font-mono text-[9px] ${active ? "text-sun/70" : "text-ink-3"}`}>{n.hint}</span>
            </div>
          );
        })}
      </nav>

      <div className="eyebrow px-2 mb-2">Lainnya</div>
      <nav className="flex flex-col gap-1">
        {NAV_2.map(n => (
          <div key={n.id} className="cursor-pointer rounded-xl px-3 py-2 flex items-center gap-2.5 text-[12.5px] font-semibold text-ink-2 hover:bg-paper hover:text-ink transition-all">
            <span className="text-[15px]">{n.emoji}</span>
            <span className="flex-1">{n.label}</span>
            {n.count != null && (
              <span className="chip chip-coral !py-[1px] !px-2 !text-[10px]" style={{ boxShadow: "1.5px 1.5px 0 #1F1A2E" }}>{n.count}</span>
            )}
          </div>
        ))}
      </nav>

      <div className="flex-1"/>

      {/* streak widget */}
      <div className="sticker bg-coral text-white p-3 mt-3">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xl wiggle">🔥</span>
          <div className="font-mono text-[10px] font-bold tracking-widest">STREAK</div>
          <div className="ml-auto font-display font-black text-[18px] leading-none">27d</div>
        </div>
        <div className="text-[11px] mb-2 leading-snug">Baca 20 menit lagi hari ini ✨</div>
        <div className="h-2 bg-coral-d rounded-full border-[1.5px] border-ink overflow-hidden">
          <div className="h-full bg-sun" style={{ width: "68%", borderRight: "1.5px solid #1F1A2E" }}/>
        </div>
      </div>
    </aside>
  );
};

const Header = ({ view }) => {
  const TITLES = {
    dashboard: { emoji: "👋", h: "Halo, Arya!", s: "Misi hari ini udah siap — ayo mulai 🚀" },
    catalog:   { emoji: "📚", h: "Perpustakaanmu", s: "Semua sumber belajar dalam satu rak." },
    skills:    { emoji: "🌱", h: "Pohon Skill",  s: "Lihat skill-mu tumbuh bercabang." },
    profile:   { emoji: "🧙", h: "Lembar Karakter", s: "Archetype-mu, tropi, dan misi." },
  };
  const t = TITLES[view] || TITLES.dashboard;
  const xp = 7280, xpNext = 9500, level = 12;
  const pct = (xp / xpNext) * 100;

  return (
    <header className="sticky top-0 z-20 bg-cream/85 backdrop-blur-md border-b-[2.5px] border-ink px-8 py-4 flex items-center gap-5">
      <div className="min-w-0 flex-1 lg:flex-initial">
        <h1 className="font-display font-black text-[24px] lg:text-[26px] leading-none flex items-center gap-2 whitespace-nowrap overflow-hidden text-ellipsis">
          <span className="wiggle shrink-0">{t.emoji}</span>
          <span className="truncate">{t.h}</span>
        </h1>
        <div className="text-[12px] font-semibold text-ink-2 mt-1 truncate hidden lg:block">{t.s}</div>
      </div>

      <div className="hidden lg:block flex-1 min-w-4"/>

      {/* XP bar */}
      <div className="hidden md:flex items-center gap-3 min-w-0 shrink-0" style={{ width: "min(420px, 44vw)" }}>
        <Avatar size={46} level={level}/>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-baseline mb-1 gap-2 whitespace-nowrap">
            <span className="chip chip-grape !py-0.5 !text-[10px]">🔮 Polymath · Lv {level}</span>
            <span className="font-mono text-[10.5px] font-bold text-ink-2">
              <span className="text-coral">{xp.toLocaleString()}</span><span className="hidden xl:inline"> / {xpNext.toLocaleString()}</span> XP
            </span>
          </div>
          <div className="relative h-3.5 rounded-full border-[2.5px] border-ink bg-paper overflow-hidden" style={{ boxShadow: "2px 2px 0 #1F1A2E" }}>
            <div className="h-full relative" style={{ width: `${pct}%`, background: "linear-gradient(90deg, #FF6B6B 0%, #FFB57A 30%, #FFD93D 60%, #6BCB77 100%)", borderRight: "2px solid #1F1A2E", borderRadius: "0 999px 999px 0", transition: "width .8s cubic-bezier(.2,.7,.2,1)" }}>
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-0 h-full" style={{ width: "30%", background: "linear-gradient(90deg, transparent, rgba(255,255,255,.6), transparent)", animation: "shineX 2.6s ease-in-out infinite" }}/>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button className="btn !p-2.5 relative">
          <Icon name="bell" size={16}/>
          <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-coral border-[2px] border-ink"/>
        </button>
        <button className="btn !p-2.5">
          <Icon name="settings" size={16}/>
        </button>
      </div>
    </header>
  );
};

const QuickCapture = ({ open, onClose }) => {
  const [tab, setTab] = React.useState("note");
  if (!open) return null;
  return (
    <div onClick={onClose} className="fixed inset-0 z-50 flex items-center justify-center p-5"
      style={{ background: "rgba(31,26,46,.35)", backdropFilter: "blur(6px)" }}>
      <div onClick={e => e.stopPropagation()} className="sticker-lg bg-paper p-6 w-full" style={{ maxWidth: 580 }}>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-2xl bg-coral border-[2.5px] border-ink flex items-center justify-center text-2xl wiggle" style={{ boxShadow: "3px 3px 0 #1F1A2E" }}>⚡</div>
          <div className="flex-1">
            <h3 className="font-display font-black text-[20px] leading-none">Quick Capture</h3>
            <div className="text-[12px] font-semibold text-ink-2 mt-1">Tangkep ide sebelum kelupaan! <span className="chip chip-mint !py-0 !px-1.5 !text-[10px] ml-1">+5 XP</span></div>
          </div>
          <div onClick={onClose} className="w-9 h-9 rounded-xl border-[2.5px] border-ink bg-cream flex items-center justify-center cursor-pointer hover:bg-paper" style={{ boxShadow: "2px 2px 0 #1F1A2E" }}>
            <Icon name="close" size={16}/>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-3">
          {[
            { id: "note",    e: "📝", l: "Catatan" },
            { id: "insight", e: "💡", l: "Insight" },
            { id: "action",  e: "🎯", l: "Action" },
            { id: "source",  e: "📚", l: "Sumber" },
          ].map(t => (
            <div key={t.id} className={`tab ${tab === t.id ? "active coral" : ""}`} onClick={() => setTab(t.id)}>
              <span>{t.e}</span> {t.l}
            </div>
          ))}
        </div>

        <textarea
          autoFocus
          placeholder="Apa yang ada di pikiranmu? ✨"
          rows={4}
          className="w-full p-4 rounded-2xl border-[2.5px] border-ink bg-cream font-sans font-semibold text-[14px] outline-none resize-none"
          style={{ boxShadow: "inset 0 2px 0 rgba(0,0,0,.05)" }}
        />

        <div className="flex flex-wrap gap-1.5 mt-3">
          <span className="chip chip-grape">🧠 Mental Models</span>
          <span className="chip chip-mint">⚛️ Atomic Habits</span>
          <span className="chip"><Icon name="plus" size={10}/> Tag baru</span>
        </div>

        <div className="flex justify-between items-center mt-5 gap-3">
          <div className="font-mono text-[10px] text-ink-2">
            <span className="font-bold text-ink">⌘↵</span> simpan · <span className="font-bold text-ink">esc</span> tutup
          </div>
          <button className="btn btn-coral">⚡ Simpan ke Inbox</button>
        </div>
      </div>
    </div>
  );
};

const FAB = ({ onClick }) => (
  <button onClick={onClick} className="press fixed bottom-7 right-7 z-40 rounded-3xl"
    style={{ width: 68, height: 68, border: "3px solid #1F1A2E", boxShadow: "5px 5px 0 #1F1A2E", background: "linear-gradient(135deg, #FFD93D, #FF6B6B 75%)" }}
    aria-label="Quick capture"
  >
    <span className="text-3xl block wiggle">⚡</span>
  </button>
);

Object.assign(window, { Sidebar, Header, QuickCapture, FAB });
