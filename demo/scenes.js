/* Fader's live scenes: the landing page's image blocks after the first (which is the case study's block,
   ../stages/), each one part of the story, all on one app (Harbor, a ceramics shop's dashboard). Built on
   HTMLDemo (step-window.js): a step's html is drawn once (and kept while the next step shares it), then
   draw(t, $, ctx) sets every moving part from t, so a scrub, a frozen frame or reduced motion is exact. Each
   pointer has a name and a tag saying what it does (the User, or the Coding Agent in the editor); at the end of
   each step it moves to where the next step's work starts (the step's lead) and says what it will do there,
   so the steps and the loop run on without a cut. Every label in Fader's chrome and every message is Fader's
   own (its CLI, lint and Studio). */
(function () {
  const { ease, typed, cue, held, glide } = HTMLDemo;
  const lerp = (a, b, k) => a + (b - a) * k;
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const set = (el, props) => { if (el) for (const k in props) el.style.setProperty(k, props[k]); };
  /* A scene sets every moving part on every frame. Writing a label's text again, even to the same words, makes the
     browser replace the node and lay it out and paint it again, dozens of times a frame, so text is written only
     when it changed. */
  const txt = (el, s) => { s = String(s); if (el && el.textContent !== s) el.textContent = s; };
  const shownHtml = new WeakMap();
  const html = (el, s) => { if (el && shownHtml.get(el) !== s) { shownHtml.set(el, s); el.innerHTML = s; } };
  const $$ = ($, sel) => [...$('.fx').querySelectorAll(sel)];

  /** The agent's hand for a step: from where it was to the step's lead, along `path` ([from, to, x, y] in the
      step's time), then to the next step's lead as the step ends, already saying what it will do there.
      `says`: [[at, words], …] after the lead's words. */
  function hand(t, step, ctx, path, clicks = [], says = []) {
    const [x, y, say] = step.lead(ctx), [nx, ny, next] = ctx.steps[ctx.next].lead(ctx);
    const GO = [step.dur - 1, step.dur - 0.3];
    const c = glide(t, [[0, 0, ...ctx.from], [0.1, 0.8, x, y], ...path, [GO[0], GO[1], nx, ny]], clicks);
    c.say = t >= GO[0] ? next : cue(t, [[0, say], ...says], '');
    return c;
  }

  // ---------- Fader's Studio bar: Tune, the rooms, the problem count ----------
  const sbar = (rooms, count = 0, on = 0) => `<div class="fx-sbar"><span class="fx-tune"><span class="fx-switch"></span>Tune</span><span class="fx-rooms">${rooms.map((r, i) => `<span data-r="${r.toLowerCase()}"${i === on ? ' class="on"' : ''}>${r}</span>`).join('')}</span><span class="fx-count">${count} problems</span></div>`;
  const ON_STAGE = ['Stage', 'Tokens', 'System'];
  function problems($, n) {
    txt($('.fx-count'), `${n} problem${n === 1 ? '' : 's'}`);
    set($('.fx-count'), { '--dot': n ? '#f5b84a' : '#3fd18b' });
  }
  function room($, r) { $$($, '.fx-rooms span').forEach((s) => s.classList.toggle('on', s.dataset.r === r)); }
  function tuneSwitch($, on) {
    $('.fx-sbar .fx-switch').classList.toggle('on', on > 0.5);
    set($('.fx-sbar .fx-switch'), { '--on': on > 0.5 ? 1 : 0 });
  }

  // ---------- Harbor ----------
  const NAV = ['Overview', 'Orders', 'Products', 'Customers', 'Settings'];
  const ORDERS = [['Mara Lindqvist', '$128.00', 'Paid'], ['Theo Okafor', '$42.00', 'Shipped'], ['Ines Duarte', '$86.50', 'Paid'], ['Sam Whitfield', '$171.00', 'Pending'], ['June Park', '$64.00', 'Paid']];
  const BARS = [38, 52, 44, 61, 57, 70, 66, 78, 72, 85, 80, 94];
  /* The app, on the Studio's Stage. `messy`: each card wears its own corner, padding, grey, border and title
     size (what an app looks like before Fader), and a tag names the first three. */
  function harbor(messy = false) {
    const card = (cls, [r, p, g, b, h], inner, style = '') => `<div class="fx-card${cls} fx-x" style="${messy ? `--mr:${r}px;--mp:${p}px;--mg:${g};--mb:${b};--mh:${h}px;` : ''}${style}">${messy ? `<em class="fx-tag">${r}px · ${p}px · <i></i>${g}</em>` : ''}${inner}</div>`;
    return `<div class="fx-app">
      <aside class="fx-side"><div class="fx-logo"><i></i>Harbor</div>${NAV.map((n, i) => `<div class="fx-nav${i ? '' : ' on'}">${n}</div>`).join('')}</aside>
      <main class="fx-main">
        <header class="fx-head"><div><h1>Overview</h1><p class="fx-xg" style="--mg:#9ca3af">This week · Oct 21–27</p></div><div class="fx-actions"><span class="fx-btn">Export</span><span class="fx-btn pri">New order</span></div></header>
        <div class="fx-kpis">
          ${card(' fx-kpi', [4, 12, '#6b7280', '#cbd5e1', 31], '<small class="fx-xg">Revenue</small><span class="fx-num">$4,820</span><span class="fx-chip">+12%</span>')}
          ${card(' fx-kpi', [14, 20, '#9ca3af', '#eceef1', 23], '<small class="fx-xg">Orders</small><span class="fx-num">128</span><span class="fx-chip">+8%</span>')}
          ${card(' fx-kpi', [9, 14, '#71717a', '#d4d4d8', 27], '<small class="fx-xg">Average order</small><span class="fx-num">$37.65</span>')}
        </div>
        <div class="fx-grid">
          ${card('', [16, 22, '#6b7280', '#e5e7eb', 17], `<h3>Revenue, 12 weeks</h3><div class="fx-bars">${BARS.map((h) => `<i style="height:${h}%"></i>`).join('')}</div><div class="fx-axis fx-xg" style="--mg:#a1a1aa"><span>Aug 4</span><span>Oct 27</span></div>`)}
          ${card('', [5, 13, '#a1a1aa', '#d1d5db', 14], `<h3>Recent orders <span class="fx-link" style="float:right">View all →</span></h3>${ORDERS.map(([n, total, st]) => `<div class="fx-row"><span>${n}</span><span class="m fx-xg">${total}</span><span class="s${st === 'Paid' ? ' paid' : ''}">${st}</span></div>`).join('')}`, 'grid-row:span 2')}
          ${card('', [12, 18, '#9ca3af', '#e2e8f0', 12], `<h3>Top products</h3>${[['Speckled mug', 46, 0.92], ['Stoneware bowl', 31, 0.62], ['Bud vase', 18, 0.36]].map(([n, u, w]) => `<div class="fx-prod"><span>${n}</span><i><b style="width:${w * 100}%"></b></i><span class="m fx-xg">${u} sold</span></div>`).join('')}`)}
        </div>
      </main>
    </div>`;
  }

  // ---------- The System panel (Tune) ----------
  /* Rows in Fader's folder order: Colors, Type, Spacing, Radius, Motion. */
  const ROW = { ink: 124, paper: 152, accent: 180, text: 244, scale: 272, base: 336, ratio: 364, cards: 428, controls: 456, speed: 520 };
  /* What a slider spans; these are the ones the reader can drag (scene 1), and the value each one sets. */
  const RANGE = { text: [0.625, 1.75], scale: [1, 1.8], base: [4, 18], ratio: [1, 1.8], cards: [0, 32], controls: [0, 32] };
  const KEY = { text: 'text', scale: 'scale', base: 'sb', ratio: 'sr', cards: 'r', controls: 'rc' };
  const slider = (key, label) => `<div class="fx-prow" style="top:${ROW[key]}px" data-row="${key}"${RANGE[key] ? ' data-drag' : ''}><span>${label}</span><span class="fx-track"><b></b><i></i></span><span class="fx-val"></span></div>`;
  const colour = (key, hex) => `<div class="fx-prow" style="top:${ROW[key]}px" data-row="${key}" data-colour><span>${key}</span><span class="fx-sw" style="background:${hex}"></span><span class="fx-hex">${hex}</span></div>`;
  const panel = (ink = '#0f172a', paper = '#ffffff', accent = '#2257c9') => `<div class="fx-panel">
      <div class="fx-ptitle">System <small>LIVE</small></div>
      <div class="fx-write">Write values</div>
      <div class="fx-folder" style="top:104px">Colors</div>${colour('ink', ink)}${colour('paper', paper)}${colour('accent', accent)}
      <div class="fx-folder" style="top:220px">Type</div>${slider('text', 'text')}${slider('scale', 'scale')}
      <div class="fx-folder" style="top:312px">Spacing</div>${slider('base', 'base')}${slider('ratio', 'contrast')}
      <div class="fx-folder" style="top:404px">Radius</div>${slider('cards', 'cards')}${slider('controls', 'controls')}
      <div class="fx-folder" style="top:496px">Motion</div>${slider('speed', 'speed')}
      <div class="fx-picker" hidden><div class="fx-sat"><i></i></div><div class="fx-hue"><i></i></div></div>
    </div>`;
  /* Where the user's or the agent's hand goes in the panel, measured on the page (`at`: ctx.at): a swatch,
     Write, a slider's handle at a value, a point of the open picker's square, its hue strip at a hue. */
  const AT = {
    swatch: (at, key) => at(`[data-row="${key}"] .fx-sw`),
    write: (at) => at('.fx-write'),
    knob: (at, key, val) => at(`[data-row="${key}"] .fx-track`, clamp((val - RANGE[key][0]) / (RANGE[key][1] - RANGE[key][0])), 0.5),
    sv: (at, c) => at('.fx-sat', c.s, 1 - c.v),
    hue: (at, h) => at('.fx-hue', h / 360, 0.5),
  };
  function knob($, key, v, shown) {
    const row = $(`[data-row="${key}"]`);
    set(row, { '--v': clamp(v) });
    txt(row.querySelector('.fx-val'), shown);
  }

  // ---------- Colours: { h, s, v } as the picker draws them; contrast as WCAG counts it ----------
  const rgb = ({ h, s, v }) => { const f = (n) => { const k = (n + h / 60) % 6; return v - v * s * Math.max(0, Math.min(k, 4 - k, 1)); }; return [f(5), f(3), f(1)]; };
  const hex = (c) => `#${c.map((x) => Math.round(x * 255).toString(16).padStart(2, '0')).join('')}`;
  const lum = (c) => { const [r, g, b] = c.map((x) => (x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4)); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
  const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
  const mix = (a, b, p) => a.map((x, i) => lerp(b[i], x, p));
  /** What Fader makes from the three colours, as Harbor wears them: muted (softness 60: 60% of the way to
      the softest grey that still reads), the label on accent (ink or paper, whichever reads better) and
      accent as text (darkened until it reads, or ink). */
  function derive(v) {
    const ink = rgb(v.ink), paper = rgb(v.paper), accent = rgb(v.accent);
    let floor = 1;
    for (let p = 1; p >= 0; p -= 0.02) if (ratio(mix(ink, paper, p), paper) >= 4.5) floor = p; else break;
    const muted = mix(ink, paper, 1 - 0.6 * (1 - floor));
    const label = ratio(ink, accent) >= ratio(paper, accent) ? ink : paper;
    let text = ink;
    for (let p = 1; p >= 0; p -= 0.05) { const c = mix(accent, ink, p); if (ratio(c, paper) >= 4.5) { text = c; break; } }
    return { ink, paper, accent, muted, label, text };
  }
  /** A role's size in px: body (the text knob, in rem) × the type ratio to its step. */
  const rolePx = (v, step) => 16 * v.text * v.scale ** step;
  /* Harbor is drawn at 14px for a 16px body: the stage is a picture of the app. */
  const DRAWN = 0.875;
  /** Harbor and the panel as a set of knob values shows them; `panel` 0 → 1 slides it in and the app aside. */
  /** Harbor as a set of knob values shows it (the app alone, as in production). */
  function wear($, v) {
    const d = derive(v);
    set($('.fx-app'), { '--ink': hex(d.ink), '--paper': hex(d.paper), '--accent': hex(d.accent), '--muted': hex(d.muted), '--on-accent': hex(d.label), '--accent-ink': hex(d.text),
      '--sp-stack': `${v.sb}px`, '--sp-card': `${v.sb * v.sr}px`, '--sp-section': `${v.sb * v.sr * v.sr}px`,
      '--t-h1': `${rolePx(v, 4) * (1 + (v.nh1 || 0) / 100) * DRAWN}px`, '--t-h2': `${rolePx(v, 3) * DRAWN}px`, '--t-h4': `${rolePx(v, 1) * DRAWN}px`, '--t-body': `${rolePx(v, 0) * DRAWN}px`, '--t-cap': `${rolePx(v, -1) * DRAWN}px`,
      '--r': `${v.r}px`, '--rc': `${v.rc}px`, '--text': v.text, '--scale': v.scale, '--shift': `${330 * v.panel + 312 * (v.dpanel || 0)}px`, '--dshift': `${312 * (v.dpanel || 0)}px` });
  }
  /** Harbor and the panel as a set of knob values shows them; `panel` 0 → 1 slides it in and the app aside. */
  function look($, v) {
    const d = derive(v);
    wear($, v);
    set($('.fx-panel'), { opacity: v.panel, transform: `translateX(${(v.panel - 1) * 24}px)` });
    $('.fx-panel').style.visibility = v.panel > 0.01 ? 'visible' : 'hidden';
    tuneSwitch($, v.on);
    for (const key of ['ink', 'paper', 'accent']) {
      const row = $(`[data-row="${key}"]`);
      row.querySelector('.fx-sw').style.background = hex(d[key]);
      txt(row.querySelector('.fx-hex'), hex(d[key]));
      row.classList.toggle('open', v.picker === key);
    }
    $('.fx-picker').hidden = !v.picker;
    if (v.picker) { const c = v[v.picker]; set($('.fx-picker'), { top: `${ROW[v.picker] + 32}px`, '--ph': c.h, '--ps': c.s, '--pv': c.v }); }
    for (const key in RANGE) {
      const val = v[KEY[key]], [a, b] = RANGE[key];
      knob($, key, (val - a) / (b - a), key === 'text' || key === 'scale' || key === 'ratio' ? val.toFixed(2) : Math.round(val));
    }
    knob($, 'speed', 0.35, '250');
  }
  /* ink #0f172a, paper #ffffff, accent hsl(222 72% 46%); `picker`: the colour whose picker is open. */
  const START = { ink: { h: 222, s: 0.643, v: 0.165 }, paper: { h: 222, s: 0, v: 1 }, accent: { h: 222, s: 0.837, v: 0.791 }, r: 6, rc: 4, text: 1, scale: 1.2, sb: 10, sr: 1.4, on: 0, panel: 0, picker: false };
  /* The System room's names (both Studio scenes). */
  const NAMES = `<div class="fx-names"><h4>Names</h4>${[['Ink', 'body text', 'text-ink'], ['Secondary text', 'captions, meta', 'text-muted'], ['Paper', 'backgrounds', 'bg-paper'], ['Accent', 'the one action', 'bg-accent'], ['Hairline', 'thin borders', 'border-border'], ['Cards corner', 'cards, panels', 'rounded-shell'], ['Card inset', 'inside a card', 'p-card']].map(([a, b, c]) => `<div class="fx-nm"><b>${a}</b><span>${b}</span><code>${c}</code></div>`).join('')}</div>`;
  const HEX = (h) => hex(rgb({ ...START.accent, h }));


  // ---------- The Studio's rooms, live: the Tokens board and System, worn by the knobs ----------
  /* Fader's contrast pairs (conventions.ts AA_PAIRS) as Harbor wears them, each with its floor: headings and
     body are ink, the secondary button is ink on paper, and accent fills (the chart) need 3:1 (WCAG 1.4.11). */
  const AA = [['ink on paper', 'ink', 'paper', 4.5], ['headings on paper', 'ink', 'paper', 4.5], ['body text on paper', 'ink', 'paper', 4.5], ['muted on paper', 'muted', 'paper', 4.5], ['label on accent', 'label', 'accent', 4.5], ['accent text on paper', 'text', 'paper', 4.5], ['accent fills on paper', 'accent', 'paper', 3], ['primary button label', 'label', 'accent', 4.5], ['secondary button label', 'ink', 'paper', 4.5]];
  /* Fader's seven type roles (TYPE_ROLES): the step from body on the type ratio, the pair it reads in, its
     weight and its size floor. */
  const ROLES = [['H1', 4, 'headings on paper', 600, 24], ['H2', 3, 'headings on paper', 600, 24], ['H3', 2, 'headings on paper', 500, 16], ['H4', 1, 'headings on paper', 500, 16], ['Body', 0, 'body text on paper', 400, 16], ['Caption', -1, 'muted on paper', 400, 12], ['Mono', -1, 'ink on paper', 400, 12]];
  /** A size as a check prints it: whole pixels, unless rounding would hide that it is under its floor. */
  const pxShown = (px, minPx) => (Math.round(px) >= minPx && px < minPx ? px.toFixed(1) : Math.round(px));
  /** The pairs below their floor, as [label, ratio, floor]. */
  function failing(v) {
    const d = derive(v);
    return AA.map(([label, fg, bg, min]) => [label, ratio(d[fg], d[bg]), min]).filter(([, r, min]) => r < min);
  }
  /** What `fader look` finds in these values, line for line in its words: each role's contrast at its size and
      its size floor, then the pairs no role covers. A line about size carries `size`, one about colour `pair`. */
  function problemsOf(v) {
    const d = derive(v), out = [];
    const ratioOf = (label) => { const [, fg, bg] = AA.find(([l]) => l === label); return ratio(d[fg], d[bg]); };
    for (const [role, step, pair, weight, minPx] of ROLES) {
      const px = rolePx(v, step), r = ratioOf(pair), min = px >= 24 || (weight >= 700 && px >= 18.67) ? 3 : 4.5;
      if (r < min) out.push({ line: `${role} (${pair}) is too faint: ${r.toFixed(1)}:1, and it needs ${min}:1.`, pair });
      if (px < minPx) out.push({ line: `${role} is too small: ${pxShown(px, minPx)}px, and it needs ${minPx}px.`, size: true });
    }
    for (const [label, , , min] of AA.slice(4)) {
      const r = ratioOf(label);
      if (r < min) out.push({ line: `${label} is too faint: ${r.toFixed(1)}:1, and it needs ${min}:1.`, pair: label });
    }
    return out;
  }
  /* The type rows: a role, its step, and what Harbor sets in it. */
  const TYPES = [['H1', 4, 'Overview', 600], ['H2', 3, '$4,820', 600], ['H4', 1, 'Revenue, 12 weeks', 500], ['Body', 0, 'Mara Lindqvist · $128.00 · Paid', 400], ['Caption', -1, 'This week · Oct 21–27', 400]];
  /* The colours on the board: the three knobs, then what Fader makes from them; and the colour roles. */
  const COLOURS = ['ink', 'paper', 'accent', 'muted', 'hairline', 'sunken', 'on accent', 'accent text'];
  const ROLE_NAMES = [['text-ink', 'ink'], ['text-ink-heading', 'ink'], ['text-muted', 'muted'], ['text-accent-ink', 'accent text'], ['bg-paper', 'paper'], ['bg-sunken', 'sunken'], ['bg-accent', 'accent'], ['text-on-accent', 'on accent'], ['border-border', 'hairline']];
  /* The Tokens room: Fader's board, in Harbor's own paper, ink and face. */
  const BOARD = `<div class="fx-sheet fx-lboard" data-lboard><h2>Tokens <small>harbor · src/fader/defaults.ts</small></h2><div class="fx-cards">
      <div class="fx-tc" data-card="primitives"><h4>Primitives <small>3 knobs</small></h4>${COLOURS.map((n, i) => `${i === 3 ? '<p class="fx-sub">made from them</p>' : ''}<div class="fx-tr" data-p="${n}"><span class="fx-dot"></span>${n}<span class="r"></span></div>`).join('')}</div>
      <div class="fx-tc" data-card="semantic"><h4>Semantic</h4>${ROLE_NAMES.map(([u, n]) => `<div class="fx-tr"><code class="fx-role">${u}</code><span class="r">${n}</span></div>`).join('')}</div>
      <div class="fx-tc" data-card="pairs"><h4>Contrast pairs <small>checked live</small></h4>${AA.map(([l]) => `<div class="fx-tr" data-aa="${l}">${l}<span class="r"><b></b><span class="fx-aa"></span></span></div>`).join('')}</div>
    </div><div class="fx-type" data-card="type"><h4>Type roles <small data-tnote></small></h4>${TYPES.map(([n, , s, w]) => `<div class="fx-trow" data-t="${n}"><span class="meta"><span class="fx-aa"></span>${n}<span data-m></span></span><span data-s style="font-weight:${w}">${s}</span></div>`).join('')}</div>
    <div class="fx-cards fx-c2"><div class="fx-tc"><h4>Radius &amp; space</h4><div class="fx-rs">${['cards', 'nested', 'controls'].map((n) => `<span data-c="${n}"><i></i><small></small></span>`).join('')}${['stack', 'card', 'section'].map((n) => `<span class="fx-gap" data-g="${n}"><i></i><small></small></span>`).join('')}</div></div>
      <div class="fx-tc"><h4>Motion</h4>${[['quick', 175, 0.45], ['fast', 250, 0.7], ['slow', 400, 0.95]].map(([n, ms, w]) => `<div class="fx-tr"><span class="fx-mn">${n}</span><i class="fx-mo" style="--w:${w * 100}%"></i><span class="r">${ms}ms</span></div>`).join('')}</div></div></div>`;
  /* The System room: the checks Fader runs on every change, and the names the code reads. */
  const SYSTEM = `<div class="fx-sysl" data-lsys><section class="fx-checks"><h4>Checks <small>run on every change</small></h4>${[['Contrast', ''], ['Scale order', 'H1 down to caption, section down to tight'], ['Roles only', 'Lint, tokens and look all pass']].map(([b, d], i) => `<div class="fx-check"${i === 0 ? ' data-contrast' : i === 2 ? ' data-look' : ''}><i>✓</i><span><b>${b}</b><span>${d}</span></span></div>`).join('')}</section>${NAMES}</div>`;
  /** The room on show, and the Tokens and System rooms drawn from the values. */
  function rooms($, v) {
    const d = derive(v), fails = failing(v), shift = `${330 * v.panel}px`, bad = problemsOf(v);
    $('.fx-app').style.visibility = v.room === 'stage' ? 'visible' : 'hidden';
    $('[data-lboard]').style.display = v.room === 'tokens' ? '' : 'none';
    $('[data-lsys]').style.display = v.room === 'system' ? '' : 'none';
    room($, v.room);
    if (v.room === 'tokens') {
      set($('[data-lboard]'), { '--ink': hex(d.ink), '--paper': hex(d.paper), '--muted': hex(d.muted), '--accent-ink': hex(d.text), '--shift': shift });
      const made = { ink: d.ink, paper: d.paper, accent: d.accent, muted: d.muted, hairline: mix(d.ink, d.paper, 0.11), sunken: mix(d.ink, d.paper, 0.04), 'on accent': d.label, 'accent text': d.text };
      const how = { hairline: '11% ink', sunken: '4% ink', 'on accent': d.label === d.ink ? 'ink' : 'paper' };
      for (const n of COLOURS) {
        const row = $(`[data-p="${n}"]`);
        row.querySelector('.fx-dot').style.background = hex(made[n]);
        txt(row.querySelector('.r'), how[n] || hex(made[n]));
      }
      for (const [l, fg, bg, min] of AA) {
        const r = ratio(d[fg], d[bg]), row = $(`[data-aa="${l}"]`);
        row.querySelector('.fx-aa').classList.toggle('bad', r < min);
        txt(row.querySelector('b'), `${r.toFixed(1)}:1`);
      }
      txt($('[data-tnote]'), `body ${v.text.toFixed(2)}rem · scale ${v.scale.toFixed(2)}`);
      for (const [n, step] of TYPES) {
        const row = $(`[data-t="${n}"]`), px = rolePx(v, step), small = bad.find((p) => p.size && p.line.startsWith(`${n} `));
        const red = small || bad.some((p) => p.pair && p.line.startsWith(`${n} (`));
        row.querySelector('[data-s]').style.fontSize = `${px * DRAWN}px`;
        txt(row.querySelector('[data-m]'), small ? `${pxShown(px, ROLES.find(([r]) => r === n)[4])}px · too small` : `${Math.round(px)}px`);
        row.querySelector('.fx-aa').classList.toggle('bad', !!red);
        row.querySelector('.meta').classList.toggle('bad', !!red);
      }
      const card = v.sb * v.sr;
      for (const [n, r] of [['cards', v.r], ['nested', Math.max(0, v.r - card)], ['controls', v.rc]]) {
        const el = $(`[data-c="${n}"]`);
        el.querySelector('i').style.borderTopLeftRadius = `${r}px`;
        txt(el.querySelector('small'), `${n} ${Math.round(r)}px`);
      }
      for (const [n, px] of [['stack', v.sb], ['card', card], ['section', card * v.sr]]) {
        const el = $(`[data-g="${n}"]`);
        el.querySelector('i').style.width = `${px}px`;
        txt(el.querySelector('small'), `${n} ${Math.round(px)}px`);
      }
    }
    if (v.room === 'system') {
      set($('[data-lsys]'), { left: shift });
      const lines = bad.map((p) => p.line);
      const check = (sel, fail, detail) => {
        const c = $(sel);
        txt(c.querySelector('i'), fail ? '×' : '✓');
        c.querySelector('i').classList.toggle('bad', fail);
        txt(c.querySelector('span > span'), detail);
      };
      check('[data-contrast]', fails.length > 0, fails.length ? fails.slice(0, 2).map(([l, r, min]) => `${l} ${r.toFixed(1)}:1 < ${min}:1`).join(' · ') : `${AA.length} pairs at AA or better`);
      check('[data-look]', lines.length > 0, lines.length ? `${lines.length} to fix: ${lines[0]}` : 'Lint, tokens and look all pass');
    }
  }
  /** The Studio as a set of knob values shows it: Harbor and the panel, the room on show, the bar's count. */
  function studio($, v) {
    look($, v);
    rooms($, v);
    problems($, problemsOf(v).length);
  }
  /* The coding agent's panel, beside the work: a header, then the conversation. */
  const sidePanel = (title, where, inner, cls = '') => `<aside class="fx-agentp ${cls}"><header class="fx-ah"><i></i>${title}<small>${where}</small></header>${inner}</aside>`;
  const agentPanel = (where, inner, cls = '') => sidePanel('Coding agent', where, inner, cls);

  // ---------- 2. Your AI agent can't drift ----------
  const CODE = [
    ['<span class="fx-k">export function</span> <span class="fx-t">OrdersEmpty</span>() {'],
    ['  <span class="fx-k">return</span> ('],
    ['    &lt;<span class="fx-t">div</span> <span class="fx-a">className</span>=<span class="fx-s">"bg-paper border-border rounded-shell p-card"</span>&gt;'],
    ['      &lt;<span class="fx-t">h3</span> <span class="fx-a">className</span>=<span class="fx-s">"text-h4"</span>&gt;No orders yet&lt;/<span class="fx-t">h3</span>&gt;'],
    ['__NEW__'],
    ['    &lt;/<span class="fx-t">div</span>&gt;'],
    ['  )'],
    ['}'],
  ];
  const BAD = '      <p className="text-gray-500 mt-[13px]">Your first order shows up here.</p>';
  const GOOD = '      <p className="text-muted mt-stack">Your first order shows up here.</p>';
  const code = CODE.map(([l], i) => `<div class="fx-ln${l === '__NEW__' ? ' new' : ''}"><b>${i + 1}</b><span${l === '__NEW__' ? ' data-new' : ''}>${l === '__NEW__' ? '' : l}</span></div>`).join('');
  const PROBS = [
    ['OrdersEmpty.tsx:5', 'Use a Fader colour role for "text-gray-500". Read … from src/fader/tokens.css (bg-paper, text-ink, text-muted, bg-accent, border-border).'],
    ['OrdersEmpty.tsx:5', 'Don\'t hardcode "mt-[13px]". Spacing is a role: p-control, p-card, gap-stack, gap-section, px-gutter.'],
  ];
  /* What the coding agent says in its panel, in order: a line, or a tool's result (`ok`: it passed). */
  const SAYS = [['Writing the empty state in OrdersEmpty.tsx.'], ['npm run lint', '2 problems'], ['Two values aren\'t roles. Swapping in <code>text-muted</code> and <code>mt-stack</code>.'], ['npm run lint', 'no problems', 'ok']];
  const lintHtml = `<div class="fx fx-dark">
      <div class="fx-ed"><div class="fx-edtab"><span class="fx-file">OrdersEmpty.tsx</span><span class="fx-crumb">src › orders › OrdersEmpty.tsx</span></div><div class="fx-code">${code}</div>
        <div class="fx-probs"><h4>Problems</h4>${PROBS.map(([where, say]) => `<div class="fx-prob"><span>${say}<small>${where}</small></span></div>`).join('')}<div class="fx-ok">npm run lint · no problems</div></div>
      </div>
      ${agentPanel('OrdersEmpty.tsx', `<div class="fx-you">Add a line under the title so the empty state says what happens next.</div>${SAYS.map(([a, b, ok]) => (b ? `<p class="fx-say tool${ok ? ' ok' : ''}">${a} · <b>${b}</b></p>` : `<p class="fx-say">${a}</p>`)).join('')}`)}
    </div>`;
  /** The new line as written so far: plain while typed, the bad classes underlined once lint has run. */
  function line(text, flag) {
    const esc = text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const hi = esc.replace(/"([^"]*)"/, (m, cls) => `<span class="fx-s">"${cls.split(' ').map((c) => (flag && /gray|\[/.test(c) ? `<span class="fx-bad">${c}</span>` : c)).join(' ')}"</span>`);
    return hi.replace(/^(\s*)&lt;p/, '$1&lt;<span class="fx-t">p</span>').replace(/className/, '<span class="fx-a">className</span>');
  }
  function lint($, { text, caret, flag, probs, said }) {
    html($('[data-new]'), line(text, flag) + (caret ? '<span class="fx-caret"></span>' : ''));
    $$($, '.fx-say').forEach((p, i) => { p.hidden = said <= i; set(p, { '--in': clamp(said - i) }); });
    $$($, '.fx-prob').forEach((p, i) => { p.hidden = probs <= i + 0.01; set(p, { '--in': clamp(probs - i) }); });
    $('.fx-ok').hidden = probs > 0.01;
  }
  /* Where the agent rests while it writes line 5, and where it reads the problems. */
  const PEN = [610, 186];
  const READ = (ctx) => ctx.at('.fx-probs', 0.3, 0.45);
  /* What line 5 held as this step began: coming round the loop, the fixed line goes first. */
  let left = '';
  const TWO = [
    { id: 'writes', name: 'The agent writes', dur: 6.8, html: lintHtml, lead: () => [...PEN, 'writing the empty state'],
      enter(ctx) { left = ctx.prev === 2 ? GOOD : ctx.prev === 1 ? BAD : ''; },
      draw(t, $, ctx) {
        const CLEAR = [0.3, 0.9], TYPE = [1.4, 3.9];
        const text = t < CLEAR[1] && left ? left.slice(0, Math.round(lerp(left.length, 6, ease(t, ...CLEAR)))) : '      ' + typed(BAD.trim(), t, ...TYPE);
        lint($, { text, caret: t < 4.5, flag: false, probs: 0, said: clamp((t - 0.5) / 0.4) });
        return { cursor: hand(t, this, ctx, []) };
      } },
    { id: 'catches', name: 'Lint catches it', dur: 6, html: lintHtml, lead: (ctx) => [...READ(ctx), 'running lint'], draw(t, $, ctx) {
      const RUN = 0.8;
      lint($, { text: BAD, flag: t >= RUN, probs: ease(t, RUN, RUN + 0.5) + ease(t, RUN + 0.3, RUN + 0.8), said: 1 + clamp((t - RUN) / 0.4) + clamp((t - 2.2) / 0.4) });
      return { cursor: hand(t, this, ctx, [], [], [[1.4, 'two values that aren\'t roles']]) };
    } },
    { id: 'fixed', name: 'Fixed with the roles', dur: 6.8, html: lintHtml, lead: () => [...PEN, 'swapping in the roles'], draw(t, $, ctx) {
      const CLEAR = [0.6, 1.2], TYPE = [1.4, 3.2], RUN = 3.6;
      const text = t < CLEAR[1] ? BAD.slice(0, Math.round(lerp(BAD.length, 6, ease(t, ...CLEAR)))) : '      ' + typed(GOOD.trim(), t, ...TYPE);
      const done = t >= RUN;
      lint($, { text, caret: t < RUN, flag: false, probs: done ? 0 : 2 * (1 - ease(t, CLEAR[0], CLEAR[1])), said: 3 + clamp((t - RUN) / 0.4) });
      return { cursor: hand(t, this, ctx, [], [], [[RUN, 'lint passes']]) };
    } },
  ];

  // ---------- 3. Any vibe-coded project, at any stage ----------
  /* One ask: the agent runs fader init itself, follows ADOPT.md, and connects the app when the checks pass. */
  /* What the app's look is made of, before (each value set by hand) and after (the knobs it sorted into). */
  const TALLY = [['Colours', 46, 4], ['Type', 31, 7], ['Spacing', 48, 2], ['Corners', 11, 2], ['Motion', 7, 1]];
  /* ADOPT.md's plan: every value goes to a knob, a role, drift (deleted) or the app's own; 16 + 112 + 14 + 1 = 143. */
  const PLAN = [
    ['Knobs', 16, `ink #0f172a · paper #ffffff · accent ${HEX(222)} · …`],
    ['Roles', 112, 'text-gray-500 → text-muted · p-6 → p-card · rounded-xl → rounded-shell'],
    ['Drift', 14, '#3a3a3c, mt-[13px] … → the nearest role, then deleted'],
    ['The app\'s own', 1, 'the chart\'s tint, mixed from the accent'],
  ];
  const adoptHtml = `<div class="fx fx-studio">${sbar(ON_STAGE, 23)}${harbor(true)}${panel('#0f172a', '#ffffff', HEX(222))}<div class="fx-sweep"></div>
      <div class="fx-tally"><div class="fx-thead"><b data-total></b><span class="fx-tw"><span data-was>values, each set by hand</span><span data-now>knobs. The rest follows them.</span></span></div>${TALLY.map(([n]) => `<div class="fx-tl"><span>${n}</span><i><b></b></i><code></code></div>`).join('')}</div>
      ${agentPanel('harbor', `<div class="fx-you" data-ask></div>
        <p class="fx-say tool ok" data-ran hidden>fader init · <b>harbor is on Fader</b></p>
        <div class="fx-plan"><h5>The plan · 143 values · fader/ADOPT.md</h5>${PLAN.map(([a, n, b]) => `<div class="fx-pl"><span>${a}</span><b>${n}</b><code>${b}</code></div>`).join('')}</div>
        <div class="fx-you" data-go></div><p class="fx-say" data-done hidden>Moving 143 values onto the roles…</p>
        <p class="fx-say tool ok" data-conn hidden>lint · knobs · build · <b>pass, connected</b></p>`, 'fx-side-agent')}</div>`;
  /** Harbor under adoption: tags in, the tally counting up, then a sweep that moves each piece onto the roles
      as it passes (x on the stage) while the tally folds into the knobs. */
  function adopt($, { tags = 9, up = 1, tally = 1, sweep = -1e3, fold = 0, count = 23, agent = 0, ask = '', ran = false, plan = 0, go = '', done = false, conn = false, on = 0, panelIn = 0 }) {
    look($, { ...START, on, panel: panelIn });
    const app = $('.fx-app'), box = app.getBoundingClientRect(), k = box.width / app.offsetWidth;
    // every position is read before any is written: a read after a write makes the browser lay the page out again, once per piece, every frame
    [...$$($, '.fx-x, .fx-xg')].map((el) => [el, el.getBoundingClientRect()]).forEach(([el, r]) => { const x = app.offsetLeft + (r.left - box.left) / k; set(el, { '--clean': ease(sweep, x, x + r.width / k) }); });
    $$($, '.fx-tag').forEach((el, i) => set(el, { '--tagin': clamp(tags - i) }));
    set($('.fx-sweep'), { left: `${sweep}px`, opacity: sweep > 0 && sweep < 1200 ? 1 : 0 });
    set($('.fx-tally'), { '--in': tally });
    let total = 0;
    $$($, '.fx-tl').forEach((row, i) => {
      const [, was, now] = TALLY[i], n = Math.round(lerp(was * up, now, fold));
      total += n;
      txt(row.querySelector('code'), n);
      set(row.querySelector('b'), { width: `${(n / 48) * 100}%` });
    });
    txt($('[data-total]'), total);
    set($('[data-was]'), { opacity: 1 - ease(fold, 0.8, 1) });
    set($('[data-now]'), { opacity: ease(fold, 0.8, 1) });
    problems($, count);
    set($('.fx-side-agent'), { '--in': agent });
    txt($('[data-ask]'), ask);
    $('[data-ran]').hidden = !ran;
    txt($('[data-go]'), go);
    $('[data-go]').hidden = !go;
    $$($, '.fx-pl').forEach((p, i) => set(p, { '--in': clamp(plan - i) }));
    $('[data-done]').hidden = !done;
    $('[data-conn]').hidden = !conn;
  }
  const ASKED = 'Add Fader to this app';
  const THREE = [
    { id: 'values', name: 'Every value, by hand', dur: 6.2, html: adoptHtml, lead: (ctx) => [ctx.W / 2, 500, '143 values, all set by hand'], draw(t, $, ctx) {
      adopt($, { tags: (t - 0.9) / 0.3, tally: ease(t, 1.4, 2.0), up: ease(t, 1.6, 4.0) });
      return { cursor: hand(t, this, ctx, []) };
    } },
    { id: 'ask', name: 'One ask', dur: 9.8, html: adoptHtml, lead: (ctx) => [ctx.W - 200, 330, 'asking my agent'], draw(t, $, ctx) {
      const IN = [0.3, 1.0], ASK = [1.1, 2.2], RAN = 3.0, PLAN_FROM = 4.4, GO = [7.6, 8.1];
      adopt($, { agent: ease(t, ...IN), ask: typed(ASKED, t, ...ASK), ran: t >= RAN, plan: Math.max(0, (t - PLAN_FROM) / 0.45), go: typed('Go ahead', t, ...GO), done: t >= GO[1] + 0.3 });
      return { cursor: hand(t, this, ctx, [], [], [[RAN, 'it installs Fader itself'], [PLAN_FROM + 0.4, 'reading the plan'], [GO[0] - 0.3, 'approving']]) };
    } },
    { id: 'knobs', name: 'Connected', dur: 9.6, html: adoptHtml, lead: (ctx) => [ctx.W * 0.58, ctx.H - 60, 'watching it move onto roles'], draw(t, $, ctx) {
      const SWEEP = [0.3, 2.8], CONN = 3.2, OUT = [4.6, 5.3], TUNE = 6.4;
      const fold = ease(t, SWEEP[0], SWEEP[1] + 0.3), panelIn = ease(t, TUNE + 0.1, TUNE + 0.8);
      adopt($, { agent: 1 - ease(t, ...OUT), ask: ASKED, ran: true, plan: 9, go: 'Go ahead', done: true, conn: t >= CONN,
        sweep: t < SWEEP[0] ? -1e3 : t > SWEEP[1] ? 1e4 : lerp(150, ctx.W + 60, ease(t, ...SWEEP)), fold, count: Math.round(23 * (1 - fold)), on: t >= TUNE ? 1 : 0, panelIn });
      return { cursor: hand(t, this, ctx, [[5.4, 6.1, ...ctx.at('.fx-sbar .fx-switch')]], [TUNE], [[CONN + 0.1, 'checks pass, connected'], [5.4, 'sixteen knobs to tune']]) };
    } },
  ];

  // ---------- 4. Every decision, on one board ----------
  const boardHtml = `<div class="fx fx-studio">${sbar(ON_STAGE, 0, 1)}${harbor()}${BOARD}${SYSTEM}${panel()}</div>`;
  /** Harbor's Studio at a text size (rem), the panel sliding in with Tune, on a room. */
  function board($, { size, panelIn, at }) {
    studio($, { ...START, text: size, on: panelIn > 0.5 ? 1 : 0, panel: panelIn, room: at });
  }
  /* Every tag here holds at least 2.1 s, so a reader can take in what the agent says. */
  const FOUR = [
    { id: 'board', name: 'The board', dur: 7.4, html: boardHtml, lead: (ctx) => [...ctx.at('[data-card="primitives"]', 0.4, 0.5), 'checking the colours'], draw(t, $, ctx) {
      board($, { size: 1, panelIn: 0, at: 'tokens' });
      return { cursor: hand(t, this, ctx, [[2.0, 2.8, ...ctx.at('[data-card="semantic"]', 0.4, 0.5)], [4.2, 5.0, ...ctx.at('[data-card="pairs"]', 0.4, 0.5)]], [], [[2.0, 'the roles they make'], [4.2, 'every pair reads']]) };
    } },
    { id: 'contrast', name: 'Too small? Red', dur: 9.1, html: boardHtml, lead: (ctx) => [...ctx.at('.fx-sbar .fx-switch'), 'trying smaller text'], draw(t, $, ctx) {
      // 0.88rem: Body (14px) and Caption (12px) fall under their floors; H2 keeps its 24px.
      const ON = 1.0, DOWN = [2.3, 3.7], UP = [5.9, 7.0], SMALL = 0.88;
      const size = t < UP[0] ? lerp(1, SMALL, ease(t, ...DOWN)) : lerp(SMALL, 1, ease(t, ...UP));
      board($, { size, panelIn: ease(t, ON + 0.1, ON + 0.7), at: 'tokens' });
      const at = (s) => AT.knob(ctx.at, 'text', s);
      const c = hand(t, this, ctx, [[1.3, 2.1, ...at(1)], [DOWN[0], DOWN[1], ...at(SMALL)], [UP[0], UP[1], ...at(1)]], [ON], [[DOWN[1], 'Body and Caption go red'], [UP[0], 'back to 1.00']]);
      c.press = c.press || (t >= DOWN[0] - 0.1 && t <= DOWN[1]) || (t >= UP[0] - 0.1 && t <= UP[1]);
      return { cursor: c };
    } },
    { id: 'system', name: 'The rules, checked', dur: 7.2, html: boardHtml, lead: (ctx) => [...ctx.at('[data-r="system"]'), 'opening the rules'], draw(t, $, ctx) {
      const CLICK = 1.1, BACK = 4.7;
      // System has nothing to tune: the panel goes as the room opens; back to Tokens before the loop.
      board($, { size: 1, panelIn: 1 - ease(t, CLICK + 0.05, CLICK + 0.5), at: t >= CLICK + 0.1 && t < BACK + 0.1 ? 'system' : 'tokens' });
      $$($, '.fx-check').forEach((c, i) => set(c, { '--in': ease(t, CLICK + 0.3 + i * 0.25, CLICK + 0.7 + i * 0.25) }));
      return { cursor: hand(t, this, ctx, [[1.7, 2.6, ...ctx.at('.fx-checks', 0.5, 0.75)], [3.9, 4.5, ...ctx.at('[data-r="tokens"]')]], [CLICK, BACK], [[1.7, 'all three pass'], [3.9, 'back to the board']]) };
    } },
  ];


  // ---------- 5. Detail: thirty more knobs, each an offset from the system ----------
  /* Fader's Detail panel (TOKEN_SCHEMA rows with tier 'detail'), beside System when open, its title bar when
     folded (a bar above System). Type and Spacing nudge a role by a % of what its scale gives it; a folder
     starts with a readout. */
  const NUDGE = [-75, 200];
  const DFOLD = [['Type', 'Sizes %', ['H1', 'H2', 'H3', 'H4', 'Body', 'Caption', 'Mono'], 'h1'], ['Spacing', 'Roles %', ['tight', 'stack', 'control inset', 'card inset', 'section', 'gutter']]];
  const detailPanel = () => {
    let y = 56, out = '';
    for (const [folder, group, rows, read] of DFOLD) {
      out += `<div class="fx-folder" style="top:${y}px">${folder} <small>› ${group}</small></div>`; y += 26;
      if (read) { out += `<div class="fx-prow fx-read" style="top:${y}px"><span>H1</span><em data-read="h1"></em></div>`; y += 26; }
      for (const r of rows) { out += `<div class="fx-prow" style="top:${y}px" data-nudge="${r}"><span>${r}</span><span class="fx-track"><b></b><i></i></span><span class="fx-val"></span></div>`; y += 28; }
      y += 10;
    }
    return `<div class="fx-panel fx-dpanel"><div class="fx-ptitle">Detail <small>% of the system</small></div>${out}</div>`;
  };
  const detailHtml = `<div class="fx fx-studio">${sbar(ON_STAGE)}${harbor()}${BOARD}${SYSTEM}${panel()}${detailPanel()}</div>`;
  const D0 = { ...START, on: 1, panel: 1, dpanel: 0, nh1: 0, room: 'stage' };
  /* Harbor makes room for System; when Detail opens beside it, Harbor slides on, keeping its width. */
  /** The Studio with Detail: open as far as `dpanel`, H1 nudged by `nh1` %, the readout doing the sum. */
  function detail($, v) {
    studio($, v);
    // Folded, Detail is a bar above System, taking no width from the page; open, it sits beside System.
    const dp = $('.fx-dpanel'), k = v.dpanel;
    set(dp, { left: `${lerp(14, 326, k)}px`, height: `${lerp(44, 518, k)}px` });
    set($('.fx-panel:not(.fx-dpanel)'), { top: `${lerp(118, 66, k)}px` });
    dp.classList.toggle('open', v.dpanel > 0.5);
    $$($, '[data-nudge]').forEach((row) => {
      const n = row.dataset.nudge === 'H1' ? v.nh1 : 0;
      set(row, { '--v': (n - NUDGE[0]) / (NUDGE[1] - NUDGE[0]) });
      txt(row.querySelector('.fx-val'), `${n > 0 ? '+' : ''}${Math.round(n)}%`);
    });
    const base = rolePx(v, 4);
    txt($('[data-read="h1"]'), v.nh1 ? `${Math.round(base)}px +${Math.round(v.nh1)}% = ${Math.round(base * (1 + v.nh1 / 100))}px` : `${Math.round(base)}px, on the scale`);
  }
  const nudgeAt = (ctx, n) => ctx.at('[data-nudge="H1"] .fx-track', (n - NUDGE[0]) / (NUDGE[1] - NUDGE[0]), 0.5);
  const FIVE = [
    { id: 'nudge', name: 'One heading, bigger', dur: 7.4, html: detailHtml, lead: (ctx) => [...ctx.at('.fx-dpanel .fx-ptitle', 0.25, 0.5), 'opening Detail'], draw(t, $, ctx) {
      const OPEN = 1.0, DRAG = [2.4, 3.8];
      detail($, { ...D0, dpanel: ease(t, OPEN + 0.1, OPEN + 0.7), nh1: lerp(0, 15, ease(t, ...DRAG)) });
      const c = hand(t, this, ctx, [[1.5, 2.2, ...nudgeAt(ctx, 0)], [DRAG[0], DRAG[1], ...nudgeAt(ctx, 15)]], [OPEN], [[2.3, 'H1, 15% over the scale']]);
      c.press = c.press || (t >= DRAG[0] - 0.1 && t <= DRAG[1]);
      return { cursor: c };
    } },
    { id: 'scale', name: 'The system still holds', dur: 8, html: detailHtml, lead: (ctx) => [...AT.knob(ctx.at, 'scale', 1.2), 'a bigger type scale'], draw(t, $, ctx) {
      const DRAG = [1.0, 2.6];
      detail($, { ...D0, dpanel: 1, nh1: 15, scale: lerp(1.2, 1.3, ease(t, ...DRAG)) });
      const c = hand(t, this, ctx, [[DRAG[0], DRAG[1], ...AT.knob(ctx.at, 'scale', 1.3)], [3.3, 4.0, ...ctx.at('[data-read="h1"]', 0.2, 0.5)]], [], [[3.2, 'H1 keeps its 15% on top']]);
      c.press = t >= DRAG[0] - 0.1 && t <= DRAG[1];
      return { cursor: c };
    } },
    { id: 'back', name: 'Back to the system', dur: 8.4, html: detailHtml, lead: (ctx) => [...AT.knob(ctx.at, 'scale', 1.3), 'back to the system'], draw(t, $, ctx) {
      const SCALE = [1.0, 2.2], NUDGE_BACK = [3.4, 4.6], FOLD = 5.6;
      detail($, { ...D0, dpanel: 1 - ease(t, FOLD + 0.1, FOLD + 0.7), nh1: lerp(15, 0, ease(t, ...NUDGE_BACK)), scale: lerp(1.3, 1.2, ease(t, ...SCALE)) });
      const c = hand(t, this, ctx, [[SCALE[0], SCALE[1], ...AT.knob(ctx.at, 'scale', 1.2)], [2.6, 3.2, ...nudgeAt(ctx, 15)], [NUDGE_BACK[0], NUDGE_BACK[1], ...nudgeAt(ctx, 0)], [4.9, 5.4, ...ctx.at('.fx-dpanel .fx-ptitle', 0.25, 0.5)]], [FOLD], [[3.3, 'H1 follows the scale again']]);
      c.press = c.press || (t >= SCALE[0] - 0.1 && t <= SCALE[1]) || (t >= NUDGE_BACK[0] - 0.1 && t <= NUDGE_BACK[1]);
      return { cursor: c };
    } },
  ];

  // ---------- 6. Write values: it is your code ----------
  /* The tuned look (a violet accent, a 1.25 scale), saved by Write values into src/fader/defaults.ts and
     tokens.css (TOKEN_DEFAULTS, one line per knob), then the app built for production with no Studio in it. */
  const TUNED = { ...START, accent: { ...START.accent, h: 272 }, scale: 1.25, on: 1, panel: 1, room: 'stage' };
  const writeHtml = `<div class="fx fx-studio">${sbar(ON_STAGE)}${harbor()}${BOARD}${SYSTEM}${panel()}<div class="fx-toast">wrote src/fader/defaults.ts and src/fader/tokens.css</div></div>`;
  const DIFF = [
    [' ', '<span class="fx-k">import type</span> { TokenValues } <span class="fx-k">from</span> <span class="fx-s">\'@fader/system\'</span>'],
    [' ', ''],
    [' ', '<span class="fx-c">/** The knobs. Write values (Tune) saves them here. */</span>'],
    [' ', '<span class="fx-k">export const</span> <span class="fx-t">TOKEN_DEFAULTS</span>: TokenValues = {'],
    [' ', '  ink: <span class="fx-s">\'#0f172a\'</span>,'],
    [' ', '  paper: <span class="fx-s">\'#ffffff\'</span>,'],
    ['-', `  accent: <span class="fx-s">'${HEX(222)}'</span>,`],
    ['+', `  accent: <span class="fx-s">'${HEX(272)}'</span>,`],
    [' ', '  mutedSoftness: <span class="fx-a">60</span>,'],
    [' ', '  <span class="fx-c">// fontHeading, fontText, fontMono …</span>'],
    [' ', '  sizeBody: <span class="fx-a">1</span>,'],
    ['-', '  sizeRatio: <span class="fx-a">1.2</span>,'],
    ['+', '  sizeRatio: <span class="fx-a">1.25</span>,'],
    [' ', '  weightText: <span class="fx-a">400</span>,'],
    [' ', '  <span class="fx-c">// spacing, corners, speed, then the Detail rows …</span>'],
    [' ', '}'],
  ];
  const diffHtml = `<div class="fx fx-dark">
      <div class="fx-ed"><div class="fx-edtab"><span class="fx-file">defaults.ts</span><span class="fx-crumb">src › fader › defaults.ts</span></div>
        <div class="fx-code fx-diff">${DIFF.map(([m, l], i) => `<div class="fx-ln${m === '-' ? ' del' : m === '+' ? ' add' : ''}"${m !== ' ' ? ` data-diff="${m}"` : ''}><b>${m === '+' ? '' : i + 1}</b><span>${m === ' ' ? ' ' : m} ${l}</span></div>`).join('')}</div>
      </div>
      ${sidePanel('Source control', 'harbor', `<p class="fx-say tool">2 files changed</p>${[['src/fader/defaults.ts', '+2 −2'], ['src/fader/tokens.css', '+2 −2']].map(([f, n]) => `<div class="fx-chg"><code>${f}</code><b>${n}</b></div>`).join('')}<p class="fx-say">Plain values in your repo: review them, commit them, roll them back like any other change.</p>`, 'fx-git')}
    </div>`;
  const prodHtml = `<div class="fx fx-dark fx-shipped"><div class="fx-termh"><span><i></i><i></i><i></i></span><b class="fx-url">harbor.shop</b>production</div>${harbor()}</div>`;
  const SIX = [
    { id: 'write', name: 'Write values', dur: 6, html: writeHtml, lead: (ctx) => [...AT.write(ctx.at), 'saving to my code'], draw(t, $, ctx) {
      const CLICK = 1.0;
      studio($, TUNED);
      set($('.fx-write'), { filter: held(t, CLICK, 0.18) ? 'brightness(0.85)' : 'none' });
      set($('.fx-toast'), { '--in': ease(t, CLICK + 0.15, CLICK + 0.6) });
      return { cursor: hand(t, this, ctx, [], [CLICK], [[2.0, 'two files written']]) };
    } },
    { id: 'diff', name: 'In your code', dur: 6.6, html: diffHtml, lead: (ctx) => [...ctx.at('[data-diff="+"]', 0.45, 0.5), 'reading the diff'], draw(t, $, ctx) {
      $$($, '[data-diff]').forEach((l, i) => set(l, { '--in': ease(t, 0.5 + i * 0.25, 0.9 + i * 0.25) }));
      $$($, '.fx-git > :not(.fx-ah)').forEach((l, i) => set(l, { '--in': ease(t, 1.2 + i * 0.3, 1.6 + i * 0.3) }));
      return { cursor: hand(t, this, ctx, [[2.6, 3.3, ...ctx.at('.fx-git .fx-chg', 0.4, 0.5)]], [], [[2.6, 'plain values, in my repo']]) };
    } },
    { id: 'prod', name: 'In production', dur: 6, html: prodHtml, lead: (ctx) => [ctx.W * 0.55, 220, 'live on harbor.shop'], draw(t, $, ctx) {
      wear($, { ...TUNED, panel: 0 });
      return { cursor: hand(t, this, ctx, [[1.6, 2.4, ctx.W * 0.7, 420]], [], [[2.1, 'no Studio, just the app']]) };
    } },
  ];

  const SCENES = {
    lint: { steps: TWO, tabs: ['OrdersEmpty.tsx'], label: 'Your AI agent can\'t drift', who: 'Coding Agent', look: 'agent' },
    adopt: { steps: THREE, tabs: ['Fader · localhost:5173'], label: 'Any vibe-coded project, at any stage' },
    tokens: { steps: FOUR, tabs: ['Fader · localhost:5173'], label: 'Every decision, on one board' },
    detail: { steps: FIVE, tabs: ['Fader · localhost:5173'], label: 'Detail: thirty more knobs, each an offset from the system' },
    write: { steps: SIX, tabs: ['defaults.ts'], label: 'Write values: the look, saved in your code' },
  };
  /** Mounts every [data-scene] under root that isn't mounted yet. */
  function mountAll(root = document) {
    root.querySelectorAll('[data-scene]:not([data-mounted])').forEach((el) => {
      const scene = SCENES[el.dataset.scene];
      if (!scene) return;
      el.dataset.mounted = '1';
      // Its controls stay on the element, so a screenshot script can pause it on an exact frame.
      el.demo = HTMLDemo.mount(el, scene);
      // A page can open a scene on a later step (data-start), its first picture chosen for the story it tells.
      if (el.dataset.start) el.demo.play(Number(el.dataset.start));
    });
  }
  /* The pieces the first image block (../stages/fader.js) draws with, so it is the same Studio as block 4. */
  const parts = { sbar, ON_STAGE, harbor, panel, BOARD, SYSTEM, studio, problemsOf, derive, START, RANGE, KEY, clamp, lerp };
  window.FaderScenes = { mountAll, SCENES, parts };
})();
