// Minimal stroke icon set — 24x24 viewBox, currentColor
const Icon = ({ name, size = 18, strokeWidth = 1.7, style, ...rest }) => {
  const s = { width: size, height: size, ...style };
  const props = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    style: s,
    ...rest,
  };
  const paths = {
    home: <><path d="M3 11.5 12 4l9 7.5"/><path d="M5 10.5V20h14v-9.5"/><path d="M10 20v-5h4v5"/></>,
    book: <><path d="M4 4.5A2 2 0 0 1 6 3h13v15H6a2 2 0 0 0-2 2"/><path d="M4 4.5V19"/><path d="M19 18v3H6a2 2 0 0 1-2-2"/></>,
    tree: <><circle cx="12" cy="5" r="2.2"/><circle cx="5" cy="13" r="2.2"/><circle cx="19" cy="13" r="2.2"/><circle cx="8.5" cy="20" r="2"/><circle cx="15.5" cy="20" r="2"/><path d="M12 7.2v3.6M10.6 10.8 6.8 12M13.4 10.8 17.2 12M6 15l2 3M18 15l-2 3"/></>,
    user: <><circle cx="12" cy="8" r="3.5"/><path d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6"/></>,
    radar: <><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><path d="M12 3v18M3 12h18"/></>,
    bolt: <><path d="M13 3 5 14h6l-1 7 8-11h-6z"/></>,
    plus: <><path d="M12 5v14M5 12h14"/></>,
    search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></>,
    bell: <><path d="M18 16v-5a6 6 0 0 0-12 0v5l-2 2h16z"/><path d="M10 21a2 2 0 0 0 4 0"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1A1.7 1.7 0 0 0 9 19.4a1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></>,
    play: <><path d="M7 5v14l12-7z"/></>,
    pause: <><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></>,
    check: <><path d="m5 12 4.5 4.5L20 6"/></>,
    flame: <><path d="M12 3c1 4 5 5 5 10a5 5 0 0 1-10 0c0-2 1.5-3 1.5-5 0 1 .5 2 1.5 2 0-3 1-5 2-7z"/></>,
    target: <><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/></>,
    sparkle: <><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/></>,
    chevron: <><path d="m9 6 6 6-6 6"/></>,
    chevronDown: <><path d="m6 9 6 6 6-6"/></>,
    grid: <><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></>,
    list: <><path d="M4 6h16M4 12h16M4 18h16"/><circle cx="2.5" cy="6" r=".8"/><circle cx="2.5" cy="12" r=".8"/><circle cx="2.5" cy="18" r=".8"/></>,
    star: <><path d="m12 3 2.6 5.6 6 .7-4.5 4 1.3 6L12 16.8 6.6 19.3l1.3-6L3.4 9.3l6-.7z"/></>,
    trophy: <><path d="M8 4h8v4a4 4 0 0 1-8 0z"/><path d="M5 5H3v2a3 3 0 0 0 3 3M19 5h2v2a3 3 0 0 1-3 3"/><path d="M9 13h6v3H9z"/><path d="M8 20h8"/><path d="M12 16v4"/></>,
    sword: <><path d="m14 4 6 0 0 6L9 21l-3 0 0-3z"/><path d="m9 13 2 2M5 17l-2 2 2 2 2-2"/></>,
    book2: <><path d="M4 4h12a3 3 0 0 1 3 3v13H7a3 3 0 0 1-3-3z"/><path d="M4 17h15"/></>,
    podcast: <><circle cx="12" cy="11" r="2"/><path d="M9 15c-1.5-1-2-2.4-2-4a5 5 0 0 1 10 0c0 1.6-.5 3-2 4"/><path d="M6.5 18C5 16.5 4 14.4 4 12a8 8 0 1 1 16 0c0 2.4-1 4.5-2.5 6"/><path d="M11 14h2l-.5 7h-1z"/></>,
    video: <><rect x="3" y="6" width="14" height="12" rx="2"/><path d="m17 10 4-2v8l-4-2z"/></>,
    article: <><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/></>,
    pen: <><path d="m4 20 4-1 11-11-3-3L5 16z"/><path d="m13 6 3 3"/></>,
    archive: <><rect x="3" y="4" width="18" height="4" rx="1"/><path d="M5 8v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8"/><path d="M10 12h4"/></>,
    lightbulb: <><path d="M9 18h6"/><path d="M10 21h4"/><path d="M12 3a6 6 0 0 0-4 10.5c1 1 1.5 2 1.5 3.5h5c0-1.5.5-2.5 1.5-3.5A6 6 0 0 0 12 3z"/></>,
    layers: <><path d="m12 3 9 5-9 5-9-5z"/><path d="m3 13 9 5 9-5"/><path d="m3 18 9 5 9-5"/></>,
    headphones: <><path d="M4 14v-2a8 8 0 0 1 16 0v2"/><path d="M4 14h4v6H6a2 2 0 0 1-2-2zM20 14h-4v6h2a2 2 0 0 0 2-2z"/></>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    arrow: <><path d="M5 12h14M13 6l6 6-6 6"/></>,
    close: <><path d="m6 6 12 12M18 6 6 18"/></>,
    mic: <><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></>,
    compass: <><circle cx="12" cy="12" r="9"/><path d="m9 15 1.5-4.5L15 9l-1.5 4.5z"/></>,
    crown: <><path d="m3 7 4 4 5-6 5 6 4-4-2 12H5z"/><path d="M5 19h14"/></>,
  };
  return <svg {...props}>{paths[name] || <circle cx="12" cy="12" r="1"/>}</svg>;
};

window.Icon = Icon;
