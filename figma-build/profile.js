// ===== 05 · Profile — screen shell =====
const b = screenBase(page, '05 · Profile', 1972, 0);
const screen = b.screen;
const backdrop = b.backdrop;

// Local helper: absolutely-positioned, width-constrained text inside a PLAIN frame.
// Avoids layoutSizingHorizontal (a child-only prop that needs an auto-layout parent).
function absText(parent, chars, o, x, y, w) {
  const t = txt(null, chars, o);
  parent.appendChild(t);
  t.textAutoResize = 'HEIGHT';
  t.resize(w, t.height);
  t.textAlignHorizontal = (o && o.align) ? o.align : 'LEFT';
  t.x = x; t.y = y;
  return t;
}

// ===== Backdrop orbs — the colour the glass refracts =====
orb(backdrop, '#7C5CFF', 196, 150, 440, 0.55, 110);
orb(backdrop, '#FF4FA0', 330, 380, 340, 0.38, 100);
orb(backdrop, '#3DE8FF',  50, 600, 360, 0.35, 100);
orb(backdrop, '#C8FF4D', 340, 780, 300, 0.30,  95);

// ===== Status bar =====
statusBar(screen);

// ===== Header row — "You" + settings gear · y 62..106 =====
const header = stack(screen, 'HORIZONTAL', { name: 'Header', gap: 12, align: 'CENTER', justify: 'SPACE_BETWEEN' });
header.resize(361, 44);
header.primaryAxisSizingMode = 'FIXED';
header.counterAxisSizingMode = 'FIXED';
header.x = 16; header.y = 62;
txt(header, 'You', { size: 34, style: 'Bold', lh: 40, ls: -2, name: 'Title · You' });

const gearBtn = figma.createFrame();
gearBtn.name = 'Gear Button';
gearBtn.resize(44, 44);
header.appendChild(gearBtn);
gearBtn.clipsContent = false;
glass(gearBtn, { r: 22, blur: 34 });
const gearIcon = icon(gearBtn, IC(P.gear, '#FFFFFF', 1.7), 22);
gearIcon.x = 11; gearIcon.y = 11;
gearIcon.opacity = 0.85;

// ===== Identity — avatar · y 124..220 =====
const avatar = figma.createFrame();
avatar.name = 'Avatar · AR';
avatar.resize(96, 96);
screen.appendChild(avatar);
avatar.x = 148; avatar.y = 124;
avatar.cornerRadius = 48;
avatar.cornerSmoothing = 0.6;
avatar.clipsContent = false;
avatar.fills = [ LIN([ st('#7C5CFF', 1, 0), st('#FF4FA0', 1, 1) ], T_DIAG) ];
avatar.strokes = [ LIN([ st('#FFFFFF', 0.45, 0), st('#FFFFFF', 0.10, 1) ], T_DOWN) ];
avatar.strokeWeight = 1; avatar.strokeAlign = 'INSIDE';
avatar.effects = [
  { type: 'DROP_SHADOW', color: { r: 0.486, g: 0.361, b: 1, a: 0.55 }, offset: { x: 0, y: 14 }, radius: 34, spread: -6, visible: true, blendMode: 'NORMAL' }
];
const initials = txt(null, 'AR', { size: 34, style: 'Bold', lh: 40, ls: -2, color: '#05060A', name: 'Initials' });
avatar.appendChild(initials);
initials.textAutoResize = 'HEIGHT';
initials.resize(96, initials.height);
initials.textAlignHorizontal = 'CENTER';
initials.x = 0; initials.y = (96 - initials.height) / 2;

// ===== Identity — name + meta · y 232..284 =====
absText(screen, 'Alex Rivera', { size: 26, style: 'Bold', lh: 32, ls: -2, align: 'CENTER', name: 'Name' }, 16, 232, 361);
absText(screen, 'Member since 2023 · Level 12', { size: 13, style: 'Medium', lh: 18, align: 'CENTER', opacity: 0.62, name: 'Meta' }, 16, 266, 361);

// ===== Lifetime stats strip · y 304..390 =====
const stats = panel(screen, 16, 304, 361, 86, {
  name: 'Lifetime Stats', dir: 'HORIZONTAL', r: 26, blur: 44,
  padX: 26, padY: 0, gap: 0, align: 'CENTER', justify: 'SPACE_BETWEEN'
});
const STAT_DATA = [
  { v: '184',   l: 'WORKOUTS' },
  { v: '62.4k', l: 'CALORIES' },
  { v: '17',    l: 'STREAK'   }
];
STAT_DATA.forEach((d, i) => {
  if (i > 0) {
    const sep = figma.createRectangle();
    sep.name = 'Divider';
    sep.resize(1, 36);
    stats.appendChild(sep);
    sep.fills = [ S('#FFFFFF', 0.14) ];
  }
  const col = stack(stats, 'VERTICAL', { name: 'Stat · ' + d.l, gap: 5, align: 'CENTER', justify: 'CENTER' });
  txt(col, d.v, { size: 20, style: 'Semi Bold', lh: 26, ls: -1 });
  txt(col, d.l, { size: 11, style: 'Semi Bold', lh: 14, ls: 4, opacity: 0.38 });
});

// ===== Achievements · caption y 412..426, badges y 438..510 =====
absText(screen, 'ACHIEVEMENTS', { size: 11, style: 'Semi Bold', lh: 14, ls: 4, opacity: 0.5, name: 'Caption · Achievements' }, 16, 412, 200);

const badgeRow = stack(screen, 'HORIZONTAL', { name: 'Achievements', gap: 8, align: 'CENTER', justify: 'MIN' });
badgeRow.resize(312, 72);
badgeRow.primaryAxisSizingMode = 'FIXED';
badgeRow.counterAxisSizingMode = 'FIXED';
badgeRow.x = 16; badgeRow.y = 438;
const BADGES = [
  { p: P.trophy, c: '#C8FF4D', n: 'Century Club',  locked: false },
  { p: P.flame,  c: '#FFA33D', n: '14 Day Streak', locked: false },
  { p: P.bolt,   c: '#3DE8FF', n: 'PR Breaker',    locked: false },
  { p: P.heart,  c: '#FFFFFF', n: 'Zone 5 Hero',   locked: true  }
];
BADGES.forEach(bd => {
  const sq = figma.createFrame();
  sq.name = 'Badge · ' + bd.n;
  sq.resize(72, 72);
  badgeRow.appendChild(sq);
  sq.clipsContent = false;
  glass(sq, { r: 24, blur: 36, tint: bd.c, a1: bd.locked ? 0.14 : 0.22, a2: 0.05 });
  const g = icon(sq, IC(bd.p, bd.c, 1.7), 28);
  g.x = 22; g.y = 22;
  if (bd.locked) sq.opacity = 0.35;
});

// ===== Settings · caption y 540..554, list y 566..748 =====
absText(screen, 'SETTINGS', { size: 11, style: 'Semi Bold', lh: 14, ls: 4, opacity: 0.5, name: 'Caption · Settings' }, 16, 540, 200);

// 6 + 56 + 1 + 56 + 1 + 56 + 6 = 182  ->  566 + 182 = 748 (exactly the budget)
const settings = panel(screen, 16, 566, 361, 182, {
  name: 'Settings List', dir: 'VERTICAL', r: 26, blur: 44,
  pad: 0, padX: 0, padY: 6, gap: 0, align: 'MIN', justify: 'MIN'
});

const SETTINGS_ROWS = [
  { ic: P.bell,  label: 'Notifications',  control: 'chevron' },
  { ic: P.heart, label: 'Health sync',    control: 'toggle'  },
  { ic: P.share, label: 'Share progress', control: 'chevron' }
];

SETTINGS_ROWS.forEach((r, i) => {
  // hairline divider between rows
  if (i > 0) {
    const hr = figma.createRectangle();
    hr.name = 'Hairline';
    hr.resize(361, 1);
    settings.appendChild(hr);
    hr.fills = [ S('#FFFFFF', 0.1) ];
    hr.layoutSizingHorizontal = 'FILL';
  }

  const row = stack(settings, 'HORIZONTAL', { name: 'Row · ' + r.label, gap: 12, align: 'CENTER', justify: 'SPACE_BETWEEN' });
  row.resize(361, 56);
  row.layoutSizingHorizontal = 'FILL';
  row.layoutSizingVertical = 'FIXED';
  row.paddingLeft = 18; row.paddingRight = 18; row.paddingTop = 0; row.paddingBottom = 0;

  const left = stack(row, 'HORIZONTAL', { name: 'Label', gap: 12, align: 'CENTER', justify: 'MIN' });
  const li = icon(left, IC(r.ic, '#FFFFFF', 1.8), 20);
  li.opacity = 0.7;
  txt(left, r.label, { size: 16, style: 'Regular', lh: 22 });

  if (r.control === 'toggle') {
    // non-glass lime accent control — reads ON
    const tog = figma.createFrame();
    tog.name = 'Toggle · On';
    tog.resize(46, 28);
    row.appendChild(tog);
    tog.cornerRadius = 14;
    tog.cornerSmoothing = 0.6;
    tog.clipsContent = false;
    tog.fills = [ LIN([ st('#C8FF4D', 1, 0), st('#A8F03D', 1, 1) ], T_DOWN) ];
    tog.effects = [
      { type: 'DROP_SHADOW', color: { r: 0.78, g: 1, b: 0.3, a: 0.35 }, offset: { x: 0, y: 4 }, radius: 14, spread: -4, visible: true, blendMode: 'NORMAL' }
    ];
    const knob = figma.createEllipse();
    knob.name = 'Knob';
    knob.resize(22, 22);
    tog.appendChild(knob);
    knob.x = 46 - 3 - 22; knob.y = 3;
    knob.fills = [ S('#FFFFFF', 1) ];
    knob.effects = [
      { type: 'DROP_SHADOW', color: { r: 0, g: 0, b: 0, a: 0.25 }, offset: { x: 0, y: 2 }, radius: 4, spread: 0, visible: true, blendMode: 'NORMAL' }
    ];
  } else {
    const ch = icon(row, IC(P.chevronR, '#FFFFFF', 2), 16);
    ch.opacity = 0.4;
  }
});

// ===== Tab bar (Profile active) + home indicator =====
tabBar(screen, 4);
homeIndicator(screen);
