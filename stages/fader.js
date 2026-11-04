/* Fader's first image block: the case study's live block (tommydelarosbil.com, stages/system-first.js) in
   Fader's own Studio, the one block 4 shows: the bar (Tune, Stage · Tokens · System, the problem count), the
   System panel with Fader's knobs, Harbor on the Stage, the Tokens board and the System room.

   Two hands on one Studio. The reader, and the User (its cursor is labelled), who tunes, checks and repairs.
   It never replays a script: every move is planned from the Studio as it is right now (the room open, every
   knob's value, which of Fader's checks fail). When the reader touches anything, the User lets go at once,
   waits, says it saw the change, and plans again from there. A problem is always its next move, fixed in the
   open.

   One source of truth (T). Harbor, the board, the System room, the bar's count and the panel all read from
   it, every frame it changes. The rooms and Fader's checks are block 4's (demo/scenes.js `parts`), so the two
   blocks are one Studio. */
import { $, $$, desk, clamp, ABORT, css } from './core.js';
css('fader');

const P = window.FaderScenes.parts;
const { problemsOf, START, RANGE, KEY, lerp } = P;
const HTML = `<div class="fx fx-studio fx-live fx-desk">${P.sbar(P.ON_STAGE)}${P.harbor()}${P.BOARD}${P.SYSTEM}${P.panel()}</div>`;

export function mount(api) {
  const { S } = api;
  api.hold = 0;                                  // the User decides when to come back, not a timer on the film
  const D = desk(api, { w: 1280, minScale: 0.52, smallScale: 0.84, fitHeight: true, keep: { r: 290 }, html: HTML });
  const ui = D.ui, q = s => $(ui, s), qq = s => $$(ui, s);
  D.cur.insertAdjacentHTML('beforeend', '<b class="cur-tag"><span>User</span><em></em></b>');
  const tag = $(D.cur, '.cur-tag em');
  const say = t => { tag.textContent = t; D.cur.classList.toggle('talking', !!t); };

  // What the reader can work: the rooms, Tune, the accent (its picker: the square and the hue strip), every
  // slider with a range. Ink, paper and speed are read-only here, and say so when touched.
  qq('.fx-rooms [data-r]').forEach(r => { r.dataset.act = 'fx-room'; });
  q('.fx-tune').dataset.act = 'fx-tune';
  q('[data-row="accent"]').dataset.act = 'fx-pick';
  for (const k of ['ink', 'paper', 'speed']) { const r = q(`[data-row="${k}"]`); r.dataset.off = ''; r.title = 'Read-only in this demo'; }
  q('.fx-sat').dataset.drag = ''; q('.fx-hue').dataset.drag = '';

  /* ---------- the one state, and everything that reads it ---------- */
  const T = { ...START, on: 1, panel: 1, picker: false, room: 'stage' };
  const $f = s => ui.querySelector(s);
  let dirty = true;
  const render = () => { if (!dirty) return; dirty = false; P.studio($f, T); };
  const change = (k, v) => { T[k] = v; dirty = true; };
  api.frame(render);                               // one render per frame, whoever changed the state
  const flash = node => { if (!node) return; node.classList.remove('flash'); void node.offsetWidth; node.classList.add('flash'); };

  /* ---------- the reader ---------- */
  const A = { until: 0, saw: false, busy: false, tried: null };   // tried: the accent before the User's own test
  const freezeCursor = () => {                     // stop the User's hand where it actually is
    const m = new DOMMatrixReadOnly(getComputedStyle(D.cur).transform);
    D.cur.style.transitionDuration = '0ms'; D.cur.style.transform = `translate(${m.e}px, ${m.f}px)`; D.cx = m.e; D.cy = m.f;
    D.cur.classList.remove('down');
  };
  const reader = () => {                           // the reader touched the Studio: the User lets go now
    A.until = S.t + 1.6; A.saw = true; A.tried = null;
    if (A.busy) { api.restart(); A.busy = false; }
    freezeCursor(); D.cur.classList.add('yield'); say('watching');
    qq('.held').forEach(n => n.classList.remove('held'));
  };
  let grab = null;
  api.drag('[data-drag]', {
    start: (e, el) => { reader(); grab = { el, r: (el.querySelector('.fx-track') || el).getBoundingClientRect() }; el.classList.add('held'); move(e); },
    move: (dx, dy, e) => move(e),
  });
  const move = e => {
    if (!grab) return;
    A.until = S.t + 1.6;
    const { el, r } = grab, u = clamp((e.clientX - r.left) / r.width, 0, 1);
    if (el.matches('.fx-hue')) change('accent', { ...T.accent, h: 360 * u });
    else if (el.matches('.fx-sat')) change('accent', { ...T.accent, s: u, v: 1 - clamp((e.clientY - r.top) / r.height, 0, 1) });
    else { const key = el.dataset.row, [a, b] = RANGE[key]; change(KEY[key], lerp(a, b, u)); }
  };
  api.world.addEventListener('pointerup', () => { if (grab) { grab.el.classList.remove('held'); grab = null; } });
  api.act('fx-room', s => { reader(); change('room', s.dataset.r); return 'go'; });
  api.act('fx-tune', () => { reader(); slideTune(T.on ? 0 : 1); return 'go'; });
  api.act('fx-pick', () => { reader(); change('picker', T.picker ? false : 'accent'); return 'go'; });

  /* ---------- the User's hands: precise, frame-driven, abortable ---------- */
  /** Runs `step(e)` (eased 0 → 1) for ms, the hand at `at(e)` in the same frame. */
  const tween = (ms, step, at) => new Promise((res, rej) => {
    const g = S.gen;
    D.cur.classList.add('down'); D.cur.style.transitionDuration = '0ms';
    let t = 0;
    const stop = api.frame(dt => {
      if (S.gen !== g) { stop(); rej(ABORT); return; }
      t = Math.min(1, t + dt * 1000 / ms);
      const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      step(e); render();
      if (at) { const [x, y] = at(e); D.cur.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`; D.cx = x; D.cy = y; }
      if (t >= 1) { stop(); D.cur.classList.remove('down'); res(); }
    });
  });
  function slideTune(to) {                         // the panel slides, 0.35 s
    const from = T.panel; T.on = to;
    if (!to) T.picker = false;
    let t = 0;
    const stop = api.frame(dt => { t = Math.min(1, t + dt / 0.35); change('panel', lerp(from, to, 1 - Math.pow(1 - t, 3))); if (t >= 1) stop(); });
  }
  const tune = async () => { if (T.on) return; await D.click(q('.fx-tune')); slideTune(1); await api.wait(500); };
  const go = async r => { if (T.room !== r) { await D.click(q(`.fx-rooms [data-r="${r}"]`)); change('room', r); await api.wait(450); } };
  const slide = async (key, to) => {
    await tune();
    const row = q(`[data-row="${key}"]`), track = row.querySelector('.fx-track'), field = KEY[key], [a, b] = RANGE[key];
    to = clamp(to, a, b);
    const from = T[field], p0 = D.at(track, 0, 0.5), p1 = D.at(track, 1, 0.5), u = x => (x - a) / (b - a);
    await D.move(track, { ax: u(from) });
    await api.wait(120);
    row.classList.add('held');
    try { await tween(clamp(Math.abs(to - from) / (b - a) * 2600, 500, 1500), e => change(field, lerp(from, to, e)), () => [p0[0] + (p1[0] - p0[0]) * u(T[field]), p0[1]]); }
    finally { row.classList.remove('held'); }
    await api.wait(260);
  };
  const openPicker = async () => { await tune(); if (T.picker !== 'accent') { await D.click(q('[data-row="accent"] .fx-sw')); change('picker', 'accent'); await api.wait(350); } };
  const closePicker = async () => { if (T.picker) { await D.click(q('[data-row="accent"] .fx-sw')); change('picker', false); await api.wait(300); } };
  const hue = async h => {
    await openPicker();
    const strip = q('.fx-hue'), p0 = D.at(strip, 0, 0.5), p1 = D.at(strip, 1, 0.5), from = T.accent.h;
    await D.move(strip, { ax: from / 360 }); await api.wait(120);
    await tween(clamp(Math.abs(h - from) / 360 * 3000, 600, 1600), e => change('accent', { ...T.accent, h: lerp(from, h, e) }), () => [p0[0] + (p1[0] - p0[0]) * T.accent.h / 360, p0[1]]);
    await api.wait(260);
  };
  const shade = async (s, v) => {                  // a point of the picker's square: colourfulness, brightness
    await openPicker();
    const sq = q('.fx-sat'), [x0, y0] = D.at(sq, 0, 0), [x1, y1] = D.at(sq, 1, 1), from = { ...T.accent };
    await D.move(sq, { ax: from.s, ay: 1 - from.v }); await api.wait(120);
    await tween(1200, e => change('accent', { ...from, s: lerp(from.s, s, e), v: lerp(from.v, v, e) }), () => [x0 + (x1 - x0) * T.accent.s, y0 + (y1 - y0) * (1 - T.accent.v)]);
    await api.wait(260);
  };
  const look = async (node, ms = 1300) => { if (!node) return; await D.move(node, { ax: 0.35 }); flash(node); await api.wait(ms); };
  const pick = (list, cur, tol) => { const c = list.filter(v => Math.abs(v - cur) > tol); return c[Math.floor(Math.random() * c.length)] ?? list[0]; };

  /* ---------- the User's mind: plan from what is true now ---------- */
  /* The least move back toward where a knob started that clears every size floor. */
  const settle = key => {
    const field = KEY[key], from = T[field], home = START[field], ok = x => !problemsOf({ ...T, [field]: x }).some(p => p.size);
    for (let u = 0; u <= 1.001; u += 0.02) if (ok(lerp(from, home, u))) return lerp(from, home, Math.min(1, u + 0.04));
    return home;
  };
  async function fix(p) {
    if (p.size) {
      say('back to readable sizes'); await go('stage');
      const key = T.text < 1 ? 'text' : 'scale';
      await slide(key, settle(key));
      say(problemsOf(T).length ? '' : '0 problems'); await go('tokens'); await look(q('[data-card="type"]'), 1500);
      return;
    }
    // A colour. After its own test, the User goes back to the accent it had; after the reader's change, the
    // accent's brightness goes down just until every pair reads (ink and paper are fixed here).
    const back = A.tried;
    A.tried = null;
    if (back && !problemsOf({ ...T, accent: back }).length) {
      say('back to the accent that read'); await go('stage');
      await shade(back.s, back.v); await closePicker();
      say('every pair reads'); await go('tokens'); await look(q('[data-card="pairs"]'), 1500);
      return;
    }
    say('fixing the accent'); await go('stage');
    const ok = v => !problemsOf({ ...T, accent: { ...T.accent, v } }).some(p2 => p2.pair);
    let v = T.accent.v;
    while (v > 0.15 && !ok(v)) v -= 0.01;
    await shade(T.accent.s, Math.max(0.15, v - 0.03));
    await closePicker();
    say('the accent reads'); await go('tokens'); await look(q('[data-card="pairs"]'), 1500);
  }
  const DEMOS = [
    async () => {   // only a hue whose whole sweep keeps every pair readable: the User's own moves never fail a check
      say('trying a new accent'); await go('stage');
      const clean = h => { for (let k = 0; k <= 1; k += 0.05) if (problemsOf({ ...T, accent: { ...T.accent, h: lerp(T.accent.h, h, k) } }).length) return false; return true; };
      const list = [352, 272, 200, 330, 222, 300, 160, 240].filter(h => Math.abs(h - T.accent.h) > 40 && clean(h));
      if (list.length) await hue(list[Math.floor(Math.random() * list.length)]);
      else await shade(START.accent.s, START.accent.v);
      await closePicker();
    },
    async () => { say('rounder cards'); await go('stage'); await slide('cards', pick([4, 10, 18, 26], T.r, 5)); },
    async () => { say('checking the tokens'); await go('tokens'); await look(q('[data-card="primitives"]'), 1100); await look(q('[data-card="pairs"]'), 1300); },
    async () => { say('more room'); await go('stage'); await slide('base', pick([8, 10, 12, 14], T.sb, 1.5)); },
    async () => { say('trying smaller text'); await go('stage'); await slide('text', 0.85); await api.wait(700); },   // breaks the size floors on purpose; the checks catch it, the plan fixes it
    async () => { say('setting the type scale'); await go('stage'); await slide('scale', pick([1.16, 1.2, 1.25, 1.3], T.scale, 0.03)); },
    async () => { say('reading the checks'); await go('system'); await look(q('.fx-checks'), 1300); await look(q('.fx-names'), 1100); },
    async () => { say('testing a lighter accent'); await go('stage'); A.tried = { ...T.accent }; await shade(0.3, 0.98); await closePicker(); await api.wait(700); },   // the chart's bars fade: accent fills fail
  ];
  let next = 0, opened = false;
  api.flow(async () => {
    // on phones the first thing seen is the cursor on Harbor, for 1.7 s, then it goes to the panel
    if (!opened && S.mobile) {
      for (let i = 0; i < 60 && !q('.fx-app').offsetWidth; i++) await api.wait(50);
      await document.fonts.ready; D.place(q('.fx-head'), 0.3, 0.5); opened = true; await api.wait(1700); D.hold = false;
    }
    opened = true;
    if (S.t < A.until) { await api.wait(150); return; }                     // the reader is working: wait
    if (A.saw) {                                                            // pick up from what the reader did
      A.saw = false; D.cur.classList.remove('yield');
      say(problemsOf(T).length ? 'sees a problem' : 'sees your change');
      await api.wait(900);
    }
    A.busy = true;
    const p = problemsOf(T);
    if (p.length) await fix(p[0]);
    else { await DEMOS[next % DEMOS.length](); next++; }
    A.busy = false; say('');
    await api.wait(500);
  });
  render();
}
