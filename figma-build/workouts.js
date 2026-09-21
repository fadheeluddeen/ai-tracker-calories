// ===== SCREEN 04 · Workouts — browsable workout library =====
const b = screenBase(page, '04 · Workouts', 1479, 0);
const screen = b.screen;
const backdrop = b.backdrop;

// ---- local helpers (names not used by the prelude) ----

// circular glass button, auto-layout centred, holding one icon
function glassCircle(parent, size, svg, iconSize, iconOpacity, blurR) {
  const f = figma.createAutoLayout('HORIZONTAL');
  f.name = 'Glass Button';
  f.resize(size, size);
  if (parent) parent.appendChild(f);
  f.primaryAxisSizingMode = 'FIXED';
  f.counterAxisSizingMode = 'FIXED';
  f.paddingLeft = 0; f.paddingRight = 0; f.paddingTop = 0; f.paddingBottom = 0;
  f.itemSpacing = 0;
  f.primaryAxisAlignItems = 'CENTER';
  f.counterAxisAlignItems = 'CENTER';
  f.clipsContent = false;
  glass(f, { r: size / 2, blur: blurR == null ? 30 : blurR });
  const g = icon(f, svg, iconSize);
  if (iconOpacity != null) g.opacity = iconOpacity;
  return f;
}

// 52x52 squircle with a two-stop diagonal accent gradient + dark glyph
function accentTile(parent, hexA, hexB, pathD) {
  const f = figma.createAutoLayout('HORIZONTAL');
  f.name = 'Tile';
  f.resize(52, 52);
  if (parent) parent.appendChild(f);
  f.primaryAxisSizingMode = 'FIXED';
  f.counterAxisSizingMode = 'FIXED';
  f.paddingLeft = 0; f.paddingRight = 0; f.paddingTop = 0; f.paddingBottom = 0;
  f.itemSpacing = 0;
  f.primaryAxisAlignItems = 'CENTER';
  f.counterAxisAlignItems = 'CENTER';
  f.clipsContent = false;
  f.cornerRadius = 18;
  f.cornerSmoothing = 0.6;
  f.strokes = [];
  f.fills = [ LIN([ st(hexA, 1, 0), st(hexB, 1, 1) ], T_DIAG) ];
  icon(f, IC(pathD, '#05060A', 2.1), 24);
  return f;
}

// tiny metadata chip used inside the featured hero card
function metaChip(parent, label) {
  const c = figma.createAutoLayout('HORIZONTAL');
  c.name = 'Meta · ' + label;
  if (parent) parent.appendChild(c);
  c.primaryAxisSizingMode = 'AUTO';
  c.counterAxisSizingMode = 'AUTO';
  c.paddingLeft = 10; c.paddingRight = 10; c.paddingTop = 5; c.paddingBottom = 5;
  c.itemSpacing = 0;
  c.primaryAxisAlignItems = 'CENTER';
  c.counterAxisAlignItems = 'CENTER';
  c.cornerRadius = 12;
  c.cornerSmoothing = 0.6;
  c.strokes = [];
  c.fills = [ S('#FFFFFF', 0.14) ];
  txt(c, label, { size: 11, style: 'Semi Bold', lh: 14, ls: 4, color: '#FFFFFF', opacity: 0.88 });
  return c;
}

// ---- backdrop orbs (the colour the glass refracts) ----
orb(backdrop, '#C8FF4D', 70, 140, 380, 0.42);
orb(backdrop, '#3DE8FF', 330, 300, 400, 0.45);
orb(backdrop, '#FF4FA0', 60, 600, 340, 0.35);
orb(backdrop, '#FFA33D', 340, 780, 300, 0.30);

// ---- status bar ----
statusBar(screen);

// ---- header: "Train" + settings button — y 62..106 ----
const header = stack(screen, 'HORIZONTAL', { gap: 0, align: 'CENTER', justify: 'SPACE_BETWEEN', name: 'Header' });
header.resize(361, 44);
header.x = 16; header.y = 62;
header.primaryAxisSizingMode = 'FIXED';
header.counterAxisSizingMode = 'FIXED';
txt(header, 'Train', { size: 34, style: 'Bold', lh: 40, ls: -2 });
glassCircle(header, 44, IC(P.gear, '#FFFFFF', 1.7), 20, 0.85, 30);

// ---- search field — y 116..164 ----
const search = panel(screen, 16, 116, 361, 48, {
  name: 'Search Field', dir: 'HORIZONTAL', r: 24,
  padX: 18, padY: 0, gap: 10, align: 'CENTER', blur: 34
});
const searchGlyph = icon(search, IC(P.route, '#FFFFFF', 1.8), 18);
searchGlyph.opacity = 0.45;
txt(search, 'Search workouts', { size: 16, style: 'Regular', lh: 22, opacity: 0.45 });

// ---- category chip row (clipped so it runs off the right edge) — y 180..218 ----
const chipClip = figma.createFrame();
chipClip.name = 'Category Row';
chipClip.resize(377, 38);
chipClip.fills = [];
chipClip.strokes = [];
chipClip.clipsContent = true;
screen.appendChild(chipClip);
chipClip.x = 16; chipClip.y = 180;

const chipRow = stack(chipClip, 'HORIZONTAL', { gap: 8, align: 'CENTER', justify: 'MIN', name: 'Chips' });
chipRow.primaryAxisSizingMode = 'AUTO';
chipRow.counterAxisSizingMode = 'AUTO';
chipRow.x = 0; chipRow.y = 2;
pill(chipRow, 'All', { active: true });
pill(chipRow, 'Strength', {});
pill(chipRow, 'Cardio', {});
pill(chipRow, 'Mobility', {});
pill(chipRow, 'HIIT', {});

// ---- featured hero card (cyan-tinted glass) — y 244..412 ----
const hero = panel(screen, 16, 244, 361, 168, {
  name: 'Featured · VO2 Max Intervals', dir: 'VERTICAL', r: 30,
  tint: '#3DE8FF', a1: 0.26, a2: 0.05,
  pad: 20, gap: 12, align: 'MIN', justify: 'SPACE_BETWEEN', blur: 44
});

// hero top: copy block on the left, accent-filled play button on the right
const heroTop = stack(hero, 'HORIZONTAL', { gap: 12, align: 'CENTER', justify: 'SPACE_BETWEEN', name: 'Hero Top' });
heroTop.layoutSizingHorizontal = 'FILL';
heroTop.counterAxisSizingMode = 'AUTO';

const heroCopy = stack(heroTop, 'VERTICAL', { gap: 6, align: 'MIN', justify: 'MIN', name: 'Hero Copy' });
heroCopy.primaryAxisSizingMode = 'AUTO';
heroCopy.counterAxisSizingMode = 'AUTO';
txt(heroCopy, 'FEATURED · THIS WEEK', { size: 11, style: 'Semi Bold', lh: 14, ls: 4, color: '#3DE8FF' });
txt(heroCopy, 'VO2 Max Intervals', { size: 26, style: 'Bold', lh: 32, ls: -2 });
txt(heroCopy, '6 x 3 min @ 90% · 32 min', { size: 13, style: 'Medium', lh: 18, opacity: 0.62 });

const heroPlay = figma.createAutoLayout('HORIZONTAL');
heroPlay.name = 'Play';
heroPlay.resize(48, 48);
heroTop.appendChild(heroPlay);
heroPlay.primaryAxisSizingMode = 'FIXED';
heroPlay.counterAxisSizingMode = 'FIXED';
heroPlay.paddingLeft = 0; heroPlay.paddingRight = 0; heroPlay.paddingTop = 0; heroPlay.paddingBottom = 0;
heroPlay.itemSpacing = 0;
heroPlay.primaryAxisAlignItems = 'CENTER';
heroPlay.counterAxisAlignItems = 'CENTER';
heroPlay.clipsContent = false;
heroPlay.cornerRadius = 24;
heroPlay.cornerSmoothing = 0.6;
heroPlay.strokes = [];
heroPlay.fills = [ LIN([ st('#3DE8FF', 1, 0), st('#C8FF4D', 1, 1) ], T_DIAG) ];
heroPlay.effects = [{ type: 'DROP_SHADOW', color: { r: 0.24, g: 0.91, b: 1, a: 0.42 }, offset: { x: 0, y: 6 }, radius: 20, spread: -4, visible: true, blendMode: 'NORMAL' }];
icon(heroPlay, ICF(P.play, '#05060A'), 22);

// hero bottom: three metadata chips
const heroMeta = stack(hero, 'HORIZONTAL', { gap: 8, align: 'CENTER', justify: 'MIN', name: 'Hero Meta' });
heroMeta.primaryAxisSizingMode = 'AUTO';
heroMeta.counterAxisSizingMode = 'AUTO';
metaChip(heroMeta, 'HIIT');
metaChip(heroMeta, 'ADVANCED');
metaChip(heroMeta, '480 KCAL');

// ---- section caption — y 432..446 ----
const secLabel = txt(screen, 'ALL WORKOUTS', { size: 11, style: 'Semi Bold', lh: 14, ls: 4, opacity: 0.42, name: 'Section · All Workouts' });
secLabel.x = 18; secLabel.y = 432;

// ---- three glass list rows — y 458..538, 548..628, 638..718 ----
const rows = [
  { y: 458, a: '#C8FF4D', z: '#3DE8FF', ic: P.dumbbell, name: 'Upper Body Power', meta: 'Strength · 45 min · 8 exercises' },
  { y: 548, a: '#FF4FA0', z: '#FFA33D', ic: P.flame,    name: 'Metcon Burner',    meta: 'HIIT · 22 min · 6 rounds' },
  { y: 638, a: '#7C5CFF', z: '#3DE8FF', ic: P.heart,    name: 'Recovery Flow',    meta: 'Mobility · 18 min · 12 poses' }
];

rows.forEach(function (r) {
  const row = panel(screen, 16, r.y, 361, 80, {
    name: 'Workout · ' + r.name, dir: 'HORIZONTAL', r: 26,
    padX: 14, padY: 0, gap: 14, align: 'CENTER', justify: 'SPACE_BETWEEN', blur: 36
  });

  const lead = stack(row, 'HORIZONTAL', { gap: 14, align: 'CENTER', justify: 'MIN', name: 'Lead' });
  lead.primaryAxisSizingMode = 'AUTO';
  lead.counterAxisSizingMode = 'AUTO';
  accentTile(lead, r.a, r.z, r.ic);

  const copy = stack(lead, 'VERTICAL', { gap: 3, align: 'MIN', justify: 'MIN', name: 'Copy' });
  copy.primaryAxisSizingMode = 'AUTO';
  copy.counterAxisSizingMode = 'AUTO';
  txt(copy, r.name, { size: 17, style: 'Semi Bold', lh: 22, ls: -1 });
  txt(copy, r.meta, { size: 13, style: 'Medium', lh: 18, opacity: 0.62 });

  glassCircle(row, 32, IC(P.chevronR, '#FFFFFF', 2), 16, 0.6, 24);
});

// ---- tab bar (Train active = index 3) + home indicator ----
tabBar(screen, 3);
homeIndicator(screen);
