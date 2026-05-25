// Dashboard OS view

const DailyBanner = () => {
  const today = new Date(2026, 4, 20);
  const dateStr = today.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  return (
    <Card className="ring-indigo" style={{ padding: 28, position: "relative", overflow: "hidden", marginBottom: 24 }}>
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        backgroundImage:
          "radial-gradient(380px 220px at 88% -10%, rgba(34,211,238,.18), transparent 70%)," +
          "radial-gradient(420px 280px at 0% 110%, rgba(139,92,246,.22), transparent 70%)",
      }}/>
      {/* constellation dots */}
      <svg style={{ position: "absolute", right: 10, top: 10, opacity: .7, pointerEvents: "none" }} width="240" height="160" viewBox="0 0 240 160">
        <g fill="#a78bfa">
          <circle cx="40" cy="40" r="1.5"/><circle cx="100" cy="20" r="1"/><circle cx="160" cy="60" r="2"/><circle cx="200" cy="30" r="1.2"/>
          <circle cx="60" cy="90" r="1"/><circle cx="120" cy="110" r="1.6"/><circle cx="200" cy="120" r="1.3"/><circle cx="80" cy="140" r="1"/>
        </g>
        <g stroke="#a78bfa" strokeOpacity=".35" strokeWidth=".5" fill="none">
          <path d="M40 40 L100 20 L160 60 L200 30"/>
          <path d="M60 90 L120 110 L200 120"/>
        </g>
      </svg>

      <div style={{ position: "relative", display: "flex", alignItems: "flex-start", gap: 28, flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 380px", minWidth: 0 }}>
          <div className="mono" style={{ fontSize: 11, color: "var(--text-mute)", letterSpacing: ".18em", textTransform: "uppercase", marginBottom: 12, display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 99, background: "var(--cyan-2)", boxShadow: "0 0 10px var(--cyan-2)" }}/>
            Daily Briefing · {dateStr}
          </div>
          <h2 style={{ fontSize: 30, lineHeight: 1.15, fontWeight: 600, letterSpacing: "-.02em", marginBottom: 12, textWrap: "pretty" }}>
            Three deep-work blocks separate you from <span className="grad-indigo">Level 13</span> — and a new <span style={{ color: "var(--amber-2)" }}>archetype perk</span>.
          </h2>
          <div style={{ fontSize: 14, color: "var(--text-dim)", maxWidth: 520, lineHeight: 1.55, marginBottom: 20 }}>
            You left <span style={{ color: "var(--text)" }}>“Thinking, Fast &amp; Slow”</span> at chapter 9 yesterday. Resume it now while your Reflection stat is still warm — Tuesdays are your strongest read days.
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button className="btn btn-primary"><Icon name="play" size={14}/> Resume reading</button>
            <button className="btn"><Icon name="compass" size={14}/> Plan today</button>
            <button className="btn" style={{ color: "var(--text-dim)" }}><Icon name="archive" size={14}/> Yesterday's review</button>
          </div>
        </div>

        {/* today's targets */}
        <div style={{ flex: "0 1 260px", minWidth: 240, display: "flex", flexDirection: "column", gap: 12 }}>
          <div className="mono" style={{ fontSize: 10, color: "var(--text-mute)", letterSpacing: ".18em", textTransform: "uppercase" }}>Today's Targets</div>
          {[
            { label: "Deep work", value: 85, target: "60 / 90 min", c: "indigo" },
            { label: "Pages",     value: 62, target: "31 / 50 pp",  c: "cyan" },
            { label: "Reviews",   value: 33, target: "1 / 3 cards", c: "amber" },
          ].map(t => (
            <div key={t.label}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
                <div style={{ fontSize: 12, color: "var(--text-dim)" }}>{t.label}</div>
                <div className="mono" style={{ fontSize: 11, color: "var(--text-mute)" }}>{t.target}</div>
              </div>
              <ProgressBar value={t.value} accent={t.c} height={5}/>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

const NextBestActionCard = () => (
  <Card className="ring-cyan" style={{ padding: 22, display: "flex", flexDirection: "column", gap: 14, height: "100%" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ width: 30, height: 30, borderRadius: 9, background: "rgba(20,184,166,.14)", color: "var(--cyan-2)", display: "grid", placeItems: "center", border: "1px solid rgba(20,184,166,.3)" }}>
        <Icon name="sparkle" size={14}/>
      </div>
      <div>
        <div className="mono" style={{ fontSize: 10, color: "var(--cyan-2)", letterSpacing: ".12em", textTransform: "uppercase" }}>Next Best Action</div>
        <div style={{ fontSize: 11, color: "var(--text-mute)" }}>Computed from your stats &amp; calendar</div>
      </div>
    </div>

    <div style={{ display: "flex", gap: 14 }}>
      <CoverPlaceholder title="Thinking, Fast & Slow" hue={210} h={88} w={64} label="Chap 9"/>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="mono" style={{ fontSize: 10, color: "var(--text-mute)", letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 4 }}>Kahneman · Cognitive Science</div>
        <div style={{ fontFamily: "Outfit", fontSize: 17, fontWeight: 600, lineHeight: 1.15, marginBottom: 6 }}>Resume Ch. 9 — The Lazy Controller</div>
        <div style={{ fontSize: 12, color: "var(--text-dim)", lineHeight: 1.5 }}>Closes a gap in your <span style={{ color: "var(--cyan-2)" }}>Reflection</span> stat and unlocks the “Dual Process” skill node.</div>
      </div>
    </div>

    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      <span className="chip" style={{ color: "var(--cyan-2)" }}><span className="dot"/> +120 XP</span>
      <span className="chip" style={{ color: "var(--indigo-2)" }}><span className="dot"/> Reflection +3</span>
      <span className="chip"><Icon name="clock" size={10}/> ~22 min</span>
    </div>

    <div style={{ display: "flex", gap: 8, marginTop: "auto" }}>
      <button className="btn btn-cyan" style={{ flex: 1, justifyContent: "center" }}><Icon name="play" size={14}/> Start session</button>
      <button className="btn" title="Snooze"><Icon name="clock" size={14}/></button>
      <button className="btn" title="Defer"><Icon name="archive" size={14}/></button>
    </div>
  </Card>
);

const GrowingSkills = () => {
  const skills = [
    { name: "Mental Models",    lvl: 4, max: 5, pct: 72, c: "indigo", trend: [3,4,3,5,6,5,7], sub: "Applied" },
    { name: "Systems Thinking", lvl: 3, max: 5, pct: 48, c: "cyan",   trend: [2,2,3,4,3,5,5], sub: "Understanding" },
    { name: "Writing & Drafts", lvl: 3, max: 5, pct: 56, c: "indigo", trend: [1,3,2,4,5,5,6], sub: "Understanding" },
    { name: "Behavioral Econ.", lvl: 2, max: 5, pct: 30, c: "amber",  trend: [1,1,2,2,3,3,3], sub: "Awareness" },
  ];
  return (
    <Card style={{ padding: 22, height: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
        <div>
          <div className="mono" style={{ fontSize: 10, color: "var(--indigo-2)", letterSpacing: ".12em", textTransform: "uppercase", marginBottom: 4 }}>Growing Skills</div>
          <div style={{ fontSize: 16, fontWeight: 600 }}>Top 4 this week</div>
        </div>
        <button className="btn" style={{ padding: "6px 10px", fontSize: 11 }}>All skills <Icon name="chevron" size={11}/></button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {skills.map(s => (
          <div key={s.name} style={{ display: "grid", gridTemplateColumns: "1fr 100px", gap: 14, alignItems: "center" }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6, gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.name}</div>
                  <span className="chip" style={{ color: s.c === "cyan" ? "var(--cyan-2)" : s.c === "amber" ? "var(--amber-2)" : "var(--indigo-2)", padding: "2px 7px", fontSize: 10 }}>{s.sub}</span>
                </div>
                <div className="mono" style={{ fontSize: 11, color: "var(--text-mute)", flexShrink: 0 }}>
                  <span style={{ color: "var(--text)" }}>{s.lvl}</span>/{s.max}
                </div>
              </div>
              <ProgressBar value={s.pct} accent={s.c} height={4}/>
            </div>
            <Sparkline data={s.trend} accent={s.c} height={28} width={100}/>
          </div>
        ))}
      </div>
    </Card>
  );
};

const ActivityFeed = () => {
  const items = [
    { time: "08:42", icon: "book", color: "indigo", title: "Finished Chapter 8 · Thinking, Fast & Slow", meta: ["+85 XP", "Reflection +2", "12 min"] },
    { time: "08:21", icon: "lightbulb", color: "cyan", title: "Captured insight — \"Anchoring biases predictable error\"", meta: ["+5 XP", "Mental Models"] },
    { time: "Yesterday", icon: "check", color: "amber", title: "Completed bounty — Write a 3-paragraph reflection", meta: ["+150 XP", "Writing +5"] },
    { time: "Yesterday", icon: "trophy", color: "amber", title: "Unlocked trophy — \"Streak Keeper · 21 days\"", meta: ["Silver tier"] },
    { time: "May 18", icon: "podcast", color: "indigo", title: "Listened — Tim Ferriss × Naval Ravikant", meta: ["+45 XP", "1h 12m"] },
    { time: "May 18", icon: "target", color: "cyan", title: "Created action item — \"Try the 5-Why framework on standup blockers\"", meta: ["Mission active"] },
  ];
  const colorOf = c => c === "cyan" ? "var(--cyan-2)" : c === "amber" ? "var(--amber-2)" : "var(--indigo-2)";
  const bgOf = c => c === "cyan" ? "rgba(20,184,166,.12)" : c === "amber" ? "rgba(245,158,11,.12)" : "rgba(99,102,241,.14)";
  return (
    <Card style={{ padding: 22 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
        <div>
          <div className="mono" style={{ fontSize: 10, color: "var(--cyan-2)", letterSpacing: ".12em", textTransform: "uppercase", marginBottom: 4 }}>Activity Feed</div>
          <div style={{ fontSize: 16, fontWeight: 600 }}>Latest 6 events</div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button className="btn" style={{ padding: "6px 10px", fontSize: 11 }}>All</button>
          <button className="btn" style={{ padding: "6px 10px", fontSize: 11, color: "var(--text-mute)" }}>XP</button>
          <button className="btn" style={{ padding: "6px 10px", fontSize: 11, color: "var(--text-mute)" }}>Insights</button>
        </div>
      </div>
      <div style={{ position: "relative" }}>
        {/* spine */}
        <div style={{ position: "absolute", left: 19, top: 8, bottom: 8, width: 1, background: "linear-gradient(180deg, transparent, var(--line-strong) 8%, var(--line-strong) 92%, transparent)" }}/>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {items.map((it, i) => (
            <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: "8px 0", position: "relative" }}>
              <div style={{
                width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                background: bgOf(it.color), color: colorOf(it.color),
                display: "grid", placeItems: "center",
                border: `1px solid ${colorOf(it.color)}33`,
                position: "relative", zIndex: 1,
              }}>
                <Icon name={it.icon} size={16}/>
              </div>
              <div style={{ flex: 1, minWidth: 0, paddingTop: 2 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
                  <div style={{ fontSize: 13, color: "var(--text)", textWrap: "pretty", lineHeight: 1.4 }}>{it.title}</div>
                  <div className="mono" style={{ fontSize: 10, color: "var(--text-mute)", flexShrink: 0 }}>{it.time}</div>
                </div>
                <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
                  {it.meta.map((m, j) => (
                    <span key={j} className="chip" style={{ fontSize: 10, padding: "2px 7px", color: j === 0 ? colorOf(it.color) : "var(--text-mute)" }}>{m}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

const HeatStripe = () => {
  // 12 weeks × 7 days
  const days = Array.from({ length: 84 }, (_, i) => {
    const r = Math.sin(i * 1.7) * .5 + .5;
    return r > .8 ? 4 : r > .6 ? 3 : r > .4 ? 2 : r > .15 ? 1 : 0;
  });
  const colors = ["rgba(255,255,255,.04)", "rgba(99,102,241,.22)", "rgba(99,102,241,.45)", "rgba(129,140,248,.7)", "rgba(167,139,250,.95)"];

  return (
    <Card style={{ padding: 22 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div>
          <div className="mono" style={{ fontSize: 10, color: "var(--indigo-2)", letterSpacing: ".12em", textTransform: "uppercase", marginBottom: 4 }}>Consistency Map</div>
          <div style={{ fontSize: 16, fontWeight: 600 }}>Last 12 weeks · <span className="grad-indigo">27-day streak</span></div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span className="mono" style={{ fontSize: 10, color: "var(--text-mute)" }}>less</span>
          {colors.map((c, i) => <div key={i} style={{ width: 12, height: 12, background: c, borderRadius: 3, border: "1px solid rgba(255,255,255,.06)" }}/>)}
          <span className="mono" style={{ fontSize: 10, color: "var(--text-mute)" }}>more</span>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 5 }}>
        {Array.from({ length: 12 }, (_, w) => (
          <div key={w} style={{ display: "grid", gridTemplateRows: "repeat(7, 1fr)", gap: 5 }}>
            {Array.from({ length: 7 }, (_, d) => {
              const v = days[w * 7 + d];
              return <div key={d} title={`Week ${w+1}, Day ${d+1}`} style={{ aspectRatio: "1/1", borderRadius: 4, background: colors[v], border: "1px solid rgba(255,255,255,.04)", transition: "transform .2s" }}/>;
            })}
          </div>
        ))}
      </div>
    </Card>
  );
};

const DashboardView = () => {
  return (
    <div>
      <DailyBanner/>

      {/* KPI strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        <Stat icon="flame" label="Streak" value="27" unit="days" accent="amber" trend={12}/>
        <Stat icon="clock" label="Sessions completed" value="14" unit="this wk" accent="indigo" trend={8}/>
        <Stat icon="check" label="Action items rampung" value="38" unit="/ 52" accent="cyan" trend={5}/>
        <Stat icon="bolt"  label="XP this week" value="2,140" unit="XP" accent="indigo" trend={22}/>
      </div>

      {/* row: NBA + Growing Skills */}
      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 16, marginBottom: 24 }}>
        <NextBestActionCard/>
        <GrowingSkills/>
      </div>

      {/* row: feed + heatmap */}
      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 16 }}>
        <ActivityFeed/>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <HeatStripe/>
          {/* Mini bounty teaser */}
          <Card className="ring-amber" style={{ padding: 22 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <div style={{ width: 30, height: 30, borderRadius: 9, background: "rgba(245,158,11,.14)", color: "var(--amber-2)", display: "grid", placeItems: "center", border: "1px solid rgba(245,158,11,.3)" }}>
                <Icon name="target" size={14}/>
              </div>
              <div style={{ flex: 1 }}>
                <div className="mono" style={{ fontSize: 10, color: "var(--amber-2)", letterSpacing: ".12em", textTransform: "uppercase" }}>Active Bounty</div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>Weekly Reflection Quest</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div className="mono" style={{ fontSize: 10, color: "var(--text-mute)" }}>EXPIRES</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--amber-2)" }}>2d 14h</div>
              </div>
            </div>
            <div style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 12, lineHeight: 1.5 }}>
              Write a 200-word reflection synthesizing 2 sources you finished this week.
            </div>
            <ProgressBar value={45} accent="amber" height={5} label="Progress" sub="1 of 2 sources cited"/>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14 }}>
              <div style={{ display: "flex", gap: 6 }}>
                <span className="chip" style={{ color: "var(--amber-2)" }}>+250 XP</span>
                <span className="chip" style={{ color: "var(--cyan-2)" }}>Reflection +8</span>
              </div>
              <button className="btn btn-amber" style={{ padding: "8px 14px" }}>Continue <Icon name="arrow" size={12}/></button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

window.DashboardView = DashboardView;
