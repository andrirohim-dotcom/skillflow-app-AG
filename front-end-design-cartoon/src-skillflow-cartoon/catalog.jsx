// Learning Catalog + detail — cartoon

const SOURCES = [
  { id: "tfs",  title: "Thinking, Fast & Slow",      author: "Daniel Kahneman",     type: "book",     hue: 0, progress: 64, lvl: "Applied",       chap: "Ch. 9 / 38", lastSeen: "hari ini" },
  { id: "atom", title: "Atomic Habits",              author: "James Clear",         type: "book",     hue: 1, progress: 92, lvl: "Mastered",      chap: "Ch. 18 / 20", lastSeen: "2 hari lalu" },
  { id: "fer",  title: "Ferriss × Naval Ravikant",   author: "Tim Ferriss Show",    type: "podcast",  hue: 1, progress: 78, lvl: "Understanding", chap: "1j 12m / 1j 33m", lastSeen: "kemarin" },
  { id: "rang", title: "Range",                      author: "David Epstein",       type: "book",     hue: 3, progress: 41, lvl: "Understanding", chap: "Ch. 5 / 12", lastSeen: "4 hari lalu" },
  { id: "huber",title: "Huberman Lab — Deep Work",   author: "Andrew Huberman",     type: "podcast",  hue: 2, progress: 22, lvl: "Awareness",     chap: "21m / 1j 48m", lastSeen: "1 minggu lalu" },
  { id: "veri", title: "Veritasium — Math's Fatal Flaw", author: "Derek Muller",    type: "video",    hue: 0, progress: 100, lvl: "Mastered",     chap: "watched",      lastSeen: "5 hari lalu" },
  { id: "nyt",  title: "On the Death of the Hyperlink", author: "New Yorker Essay", type: "article",  hue: 4, progress: 56, lvl: "Understanding", chap: "hal 3 / 5",  lastSeen: "hari ini" },
  { id: "med",  title: "Why We Sleep",               author: "Matthew Walker",      type: "book",     hue: 3, progress: 8,  lvl: "Awareness",     chap: "Ch. 1 / 16", lastSeen: "baru mulai" },
];

const TYPE_META = {
  book:    { emoji: "📖", label: "Buku",    chip: "chip-grape", c: "grape" },
  podcast: { emoji: "🎙️", label: "Podcast", chip: "chip-sky",   c: "sky" },
  video:   { emoji: "🎬", label: "Video",   chip: "chip-coral", c: "coral" },
  article: { emoji: "📰", label: "Artikel", chip: "chip-mint",  c: "mint" },
};

const LVL_META = {
  Awareness:     { chip: "chip-peach", e: "🌱" },
  Understanding: { chip: "chip-sky",   e: "🌿" },
  Applied:       { chip: "chip-grape", e: "🌳" },
  Mastered:      { chip: "chip-sun",   e: "🌟" },
};

const SourceCard = ({ s, onOpen }) => {
  const tm = TYPE_META[s.type];
  const lm = LVL_META[s.lvl];
  return (
    <Sticker className="p-4 cursor-pointer bg-paper flex flex-col gap-3" onClick={onOpen}>
      <div className="relative">
        <CoverPlaceholder title={s.title} hue={s.hue} h={160} label={tm.label}/>
        <div className={`absolute bottom-2 right-2 chip ${lm.chip} !text-[10px] !px-2 !py-0.5`}>
          {lm.e} {s.lvl}
        </div>
      </div>
      <div>
        <div className="flex items-center gap-1.5 mb-1">
          <span className="text-[16px]">{tm.emoji}</span>
          <div className="font-mono text-[10px] text-ink-2 font-bold uppercase tracking-wider">{tm.label}</div>
          <div className="font-mono text-[10px] text-ink-3">·</div>
          <div className="text-[10.5px] font-bold text-ink-2 truncate">{s.author}</div>
        </div>
        <div className="font-display font-extrabold text-[15px] leading-tight" style={{ textWrap: "balance" }}>{s.title}</div>
      </div>
      <div>
        <div className="flex justify-between items-baseline mb-1.5">
          <span className="font-mono text-[10px] text-ink-2 font-bold">{s.chap}</span>
          <span className="font-mono text-[11.5px] font-extrabold text-ink">{s.progress}%</span>
        </div>
        <ProgressBar value={s.progress} accent={s.progress === 100 ? "mint" : "coral"} height={8}/>
      </div>
    </Sticker>
  );
};

// Reading Timer
const ReadingTimer = () => {
  const [seconds, setSeconds] = React.useState(60 * 22 + 38);
  const [running, setRunning] = React.useState(true);
  React.useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setSeconds(x => x + 1), 1000);
    return () => clearInterval(id);
  }, [running]);
  const m = Math.floor(seconds / 60), s = seconds % 60;
  const goalSec = 45 * 60;
  const pct = Math.min(100, (seconds / goalSec) * 100);
  const radius = 64, circ = 2 * Math.PI * radius;

  return (
    <Sticker color="mint" size="lg" className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="eyebrow !text-ink">READING TIMER</div>
          <div className="font-display font-black text-[17px] mt-0.5">Sesi sedang jalan ✨</div>
        </div>
        <div className={`chip ${running ? "chip-coral" : ""}`}>
          <span className={`w-2 h-2 rounded-full ${running ? "bg-coral pulsey" : "bg-ink-2"}`}/>
          {running ? "LIVE" : "PAUSED"}
        </div>
      </div>

      <div className="flex items-center gap-5 mb-4 flex-wrap">
        <div className="relative shrink-0" style={{ width: 156, height: 156 }}>
          <svg width="156" height="156" viewBox="0 0 156 156">
            <circle cx="78" cy="78" r={radius} fill="#FFF" stroke="#1F1A2E" strokeWidth="3"/>
            <circle cx="78" cy="78" r={radius} fill="none" stroke="#FF6B6B" strokeWidth="10"
              strokeDasharray={circ}
              strokeDashoffset={circ * (1 - pct / 100)}
              strokeLinecap="round"
              transform="rotate(-90 78 78)"
              style={{ transition: "stroke-dashoffset .5s ease" }}/>
            <circle cx="78" cy="78" r={radius - 7} fill="none" stroke="#1F1A2E" strokeWidth="2" strokeDasharray="2 4" opacity=".25"/>
          </svg>
          <div className="absolute inset-0 grid place-items-center text-center">
            <div>
              <div className="font-mono font-black text-[28px] text-ink leading-none">{String(m).padStart(2,"0")}:{String(s).padStart(2,"0")}</div>
              <div className="eyebrow !text-ink-2 mt-1">of 45 menit</div>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-2.5 min-w-[180px]">
          <div className="grid grid-cols-2 gap-2.5">
            <div className="sticker-flat bg-paper p-3">
              <div className="eyebrow mb-1">PAGES</div>
              <div className="font-display font-black text-[22px] leading-none">14 📖</div>
            </div>
            <div className="sticker-flat bg-paper p-3">
              <div className="eyebrow mb-1">PACE</div>
              <div className="font-display font-black text-[22px] leading-none">1.6<span className="font-mono text-[11px] text-ink-2 ml-1">pg/m</span></div>
            </div>
          </div>
          <div className="sticker-flat bg-sun p-3">
            <div className="eyebrow mb-1">EARNING</div>
            <div className="font-display font-black text-[20px] leading-none">⚡ +98 XP</div>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <button className="btn flex-1 justify-center" onClick={() => setRunning(r => !r)}>
          {running ? <><Icon name="pause" size={14}/> Pause</> : <><Icon name="play" size={14}/> Resume</>}
        </button>
        <button className="btn btn-coral flex-1 justify-center"><Icon name="check" size={14}/> Selesai</button>
      </div>
    </Sticker>
  );
};

const TABS = [
  { id: "notes",    label: "Catatan",     emoji: "📝" },
  { id: "insights", label: "Key Insights", emoji: "💡" },
  { id: "actions",  label: "Action Items", emoji: "🎯" },
  { id: "history",  label: "Riwayat",     emoji: "🕘" },
];

const NotesTab = () => {
  const notes = [
    { time: "Hari ini · 12 min", c: "coral", text: "System 1 vs System 2 — metafora-nya elegan tapi Kahneman hati-hati: ini karakter, bukan brain region. Kelabel doang sebenernya." },
    { time: "Hari ini · 7 min",  c: "grape", text: "Cognitive ease bikin kita gampang percaya. Repetisi → familiar → terasa benar. Implikasinya buat media diet bikin gak nyaman." },
    { time: "Kemarin · Ch. 8",   c: "mint",  text: "Anchoring kuat banget meskipun subject TAU anchor-nya random. Gak bisa di-reason out — cuma bisa secara struktural dihindari." },
  ];
  return (
    <div className="flex flex-col gap-3">
      {notes.map((n, i) => {
        const bg = { coral:"bg-peachy", grape:"bg-lilac", mint:"bg-minty" }[n.c];
        return (
          <div key={i} className={`sticker-flat ${bg} p-4 -rotate-[.5deg] ${i % 2 ? "rotate-[.5deg]" : ""}`} style={{ transform: `rotate(${i % 2 ? .5 : -.5}deg)` }}>
            <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-ink-2 mb-2">{n.time}</div>
            <div className="text-[14px] font-semibold text-ink leading-relaxed" style={{ textWrap: "pretty" }}>{n.text}</div>
          </div>
        );
      })}
      <button className="btn self-start"><Icon name="plus" size={14}/> Tambah catatan</button>
    </div>
  );
};

const InsightsTab = () => {
  const items = [
    { title: "WYSIATI",        text: "“What you see is all there is.” Kita bikin cerita koheren dari bukti terbatas dan jarang audit yang missing.", c: "grape", e: "👁️" },
    { title: "Anchoring",      text: "Angka random bikin estimasi kita bergeser. Strategi: pre-commit range sebelum negosiasi.",                       c: "coral", e: "⚓" },
    { title: "Substitution",   text: "Pertanyaan susah diam-diam diganti yang gampang. Triknya: notice the swap.",                                       c: "sky",   e: "🔄" },
    { title: "Cognitive ease", text: "Familiar = terasa benar. Diversify font, sumber, format buat slow your believing.",                                c: "mint",  e: "🧊" },
  ];
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {items.map((it, i) => {
        const bg = { grape:"bg-lilac", coral:"bg-peachy", sky:"bg-ocean", mint:"bg-minty" }[it.c];
        return (
          <Sticker key={i} className={`p-4 ${bg}`}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-9 h-9 rounded-xl bg-paper border-[2.5px] border-ink flex items-center justify-center text-[18px]" style={{ boxShadow: "2px 2px 0 #1F1A2E" }}>{it.e}</div>
              <div className="font-display font-black text-[16px]">{it.title}</div>
            </div>
            <div className="text-[12.5px] font-semibold leading-relaxed text-ink" style={{ textWrap: "pretty" }}>{it.text}</div>
          </Sticker>
        );
      })}
    </div>
  );
};

const ActionsTab = () => {
  const [items, setItems] = React.useState([
    { id: 1, done: true,  text: "Re-read Ch. 8 untuk internalize anchoring & substitution", xp: 25 },
    { id: 2, done: false, text: "Eksperimen pribadi: anchor negosiasi gaji berikutnya", xp: 80, mission: true },
    { id: 3, done: false, text: "Tulis refleksi 200 kata yang nyambungin WYSIATI ke konsumsi berita", xp: 60 },
    { id: 4, done: false, text: "Cari esai counter-example yang dispute framing System 1/2", xp: 40 },
    { id: 5, done: true,  text: "Highlight 5 quote untuk spaced-rep review", xp: 15 },
  ]);
  const toggle = id => setItems(xs => xs.map(x => x.id === id ? { ...x, done: !x.done } : x));
  const doneCount = items.filter(i => i.done).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="font-mono text-[11.5px] font-bold text-ink-2">
          <span className="text-ink text-[14px] font-display font-black">{doneCount}</span> / {items.length} selesai
        </div>
        <button className="btn !text-[11px] !py-1.5 !px-3"><Icon name="plus" size={12}/> Action baru</button>
      </div>
      <div className="flex flex-col gap-2">
        {items.map(it => (
          <div key={it.id} className={`sticker-flat bg-paper p-3 flex items-center gap-3 ${it.done ? "opacity-60" : ""}`}>
            <Check on={it.done} onClick={() => toggle(it.id)}/>
            <div className={`flex-1 text-[13.5px] font-semibold text-ink leading-snug ${it.done ? "line-through decoration-[2px] decoration-ink-2" : ""}`} style={{ textWrap: "pretty" }}>
              {it.text}
            </div>
            {it.mission && <span className="chip chip-coral !text-[10px]">🎯 Mission</span>}
            <span className="chip chip-sun !text-[10px]">⚡ +{it.xp}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const HistoryTab = () => (
  <div className="flex flex-col gap-2">
    {[
      { d: "20 Mei", what: "Baca 14 halaman · Ch. 9 sedang berjalan", xp: "+98 XP" },
      { d: "19 Mei", what: "Selesai Ch. 8 · 4 highlight",              xp: "+85 XP" },
      { d: "17 Mei", what: "Capture 3 insight",                         xp: "+15 XP" },
      { d: "16 Mei", what: "Mulai Ch. 8",                               xp: "+10 XP" },
      { d: "14 Mei", what: "Sesi pertama — Ch. 1–3",                    xp: "+220 XP" },
    ].map((e, i) => (
      <div key={i} className="sticker-flat bg-cream p-3 flex items-center gap-3">
        <div className="font-mono text-[11px] font-bold text-ink-2 w-16">{e.d}</div>
        <div className="flex-1 text-[13px] font-semibold">{e.what}</div>
        <span className="chip chip-sun !text-[10px]">⚡ {e.xp}</span>
      </div>
    ))}
  </div>
);

const CatalogView = ({ source, setSource }) => {
  const [view, setViewMode] = React.useState("grid");
  const [filter, setFilter] = React.useState("all");
  const [activeTab, setActiveTab] = React.useState("notes");

  if (source) {
    const s = SOURCES.find(x => x.id === source);
    const tm = TYPE_META[s.type];
    return (
      <div>
        <div className="flex items-center gap-1.5 text-[12px] font-bold text-ink-2 mb-4">
          <span className="cursor-pointer hover:text-ink" onClick={() => setSource(null)}>📚 Belajar</span>
          <Icon name="chevron" size={11}/>
          <span>{tm.label}</span>
          <Icon name="chevron" size={11}/>
          <span className="text-ink">{s.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-5 mb-5">
          {/* hero */}
          <Sticker className="p-6 bg-paper">
            <div className="flex gap-5 flex-wrap">
              <CoverPlaceholder title={s.title} hue={s.hue} h={220} w={150} label={tm.label}/>
              <div className="flex-1 min-w-[200px] flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[18px]">{tm.emoji}</span>
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-ink-2">{tm.label} · {s.author}</span>
                </div>
                <h2 className="font-display font-black text-[28px] leading-[1.05] mb-3" style={{ textWrap: "balance" }}>
                  <span className="marker-sun">{s.title}</span>
                </h2>
                <div className="flex gap-1.5 flex-wrap mb-4">
                  <span className={`chip ${LVL_META[s.lvl].chip}`}>{LVL_META[s.lvl].e} {s.lvl}</span>
                  <span className="chip">⏱️ 8j 42m logged</span>
                  <span className="chip">✍️ 12 notes · 4 insights</span>
                </div>
                <div className="mt-auto">
                  <ProgressBar value={s.progress} accent="coral" height={12}
                    label={`Progress · ${s.chap}`}
                    sub={`${s.progress}% · terakhir dibuka ${s.lastSeen}`}/>
                </div>
              </div>
            </div>
          </Sticker>

          <ReadingTimer/>
        </div>

        <Sticker className="p-5 bg-paper">
          <div className="flex flex-wrap gap-2 mb-5 pb-3 border-b-[2px] border-dashed border-ink/20">
            {TABS.map(t => (
              <div key={t.id} className={`tab ${activeTab === t.id ? "active coral" : ""}`} onClick={() => setActiveTab(t.id)}>
                <span>{t.emoji}</span> {t.label}
              </div>
            ))}
          </div>
          {activeTab === "notes"    && <NotesTab/>}
          {activeTab === "insights" && <InsightsTab/>}
          {activeTab === "actions"  && <ActionsTab/>}
          {activeTab === "history"  && <HistoryTab/>}
        </Sticker>
      </div>
    );
  }

  const FILTERS = [
    { id: "all",     label: "Semua",   emoji: "📚" },
    { id: "book",    label: "Buku",    emoji: "📖" },
    { id: "podcast", label: "Podcast", emoji: "🎙️" },
    { id: "video",   label: "Video",   emoji: "🎬" },
    { id: "article", label: "Artikel", emoji: "📰" },
  ];
  const list = SOURCES.filter(s => filter === "all" || s.type === filter);

  return (
    <div>
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="flex gap-1.5 flex-wrap">
          {FILTERS.map(f => (
            <div key={f.id} className={`tab ${filter === f.id ? "active coral" : ""}`} onClick={() => setFilter(f.id)}>
              <span>{f.emoji}</span> {f.label}
              <span className="font-mono text-[9px] opacity-70">{f.id === "all" ? SOURCES.length : SOURCES.filter(s => s.type === f.id).length}</span>
            </div>
          ))}
        </div>
        <div className="flex-1"/>
        <div className="sticker-pill bg-paper px-3 py-1.5 flex items-center gap-2">
          <Icon name="search" size={13}/>
          <input placeholder="Cari di katalog…" className="bg-transparent outline-none text-[12px] font-bold w-32"/>
        </div>
        <div className="sticker-pill bg-paper flex p-1">
          <div onClick={() => setViewMode("grid")}  className={`px-2 py-1 rounded-full cursor-pointer ${view === "grid" ? "bg-ink text-sun" : ""}`}><Icon name="grid" size={14}/></div>
          <div onClick={() => setViewMode("list")}  className={`px-2 py-1 rounded-full cursor-pointer ${view === "list" ? "bg-ink text-sun" : ""}`}><Icon name="list" size={14}/></div>
        </div>
        <button className="btn btn-coral"><Icon name="plus" size={14}/> Tambah sumber</button>
      </div>

      {view === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {list.map(s => <SourceCard key={s.id} s={s} onOpen={() => setSource(s.id)}/>)}
        </div>
      ) : (
        <Sticker className="p-2 bg-paper">
          {list.map((s, i) => (
            <div key={s.id} onClick={() => setSource(s.id)}
              className="grid items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-cream transition-colors"
              style={{ gridTemplateColumns: "50px 1.7fr 1fr 1fr 100px 110px" }}>
              <CoverPlaceholder title="" hue={s.hue} h={56} w={42} label=""/>
              <div className="min-w-0">
                <div className="font-display font-extrabold text-[14px] leading-tight truncate">{s.title}</div>
                <div className="text-[11px] font-bold text-ink-2 truncate">{s.author}</div>
              </div>
              <div className="flex items-center gap-1.5">
                <span>{TYPE_META[s.type].emoji}</span>
                <span className="text-[12px] font-bold">{TYPE_META[s.type].label}</span>
              </div>
              <span className={`chip ${LVL_META[s.lvl].chip} !text-[10px]`}>{LVL_META[s.lvl].e} {s.lvl}</span>
              <span className="font-mono text-[11px] font-bold text-ink-2">{s.chap}</span>
              <ProgressBar value={s.progress} accent={s.progress === 100 ? "mint" : "coral"} height={7}/>
            </div>
          ))}
        </Sticker>
      )}
    </div>
  );
};

window.CatalogView = CatalogView;
