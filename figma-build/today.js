// ===== SCREEN 01 · Today =====================================================
const b = screenBase(page, '01 · Today', 0, 0);
const screen = b.screen;
const backdrop = b.backdrop;

// Local helper: absolutely-positioned, auto-layout content block inside `screen`
// (screen is a PLAIN frame, so x/y are honoured; the block itself is auto-layout).
function blk(x, y, w, h, dir, o) {
  const f = stack(screen, dir, o);
  f.resize(w, h == null ? 10 : h);            // resize FIRST
  f.x = x; f.y = y;
  if (dir === 'HORIZONTAL') {
    f.primaryAxisSizingMode = 'FIXED';                        // width
    f.counterAxisSizingMode = (h == null ? 'AUTO' : 'FIXED'); // height
  } else {
    f.counterAxisSizingMode = 'FIXED';                        // width
    f.primaryAxisSizingMode = (h == null ? 'AUTO' : 'FIXED'); // height
  }
  f.clipsContent = false;
  return f;
}

// --- Backdrop orbs (the colour the glass refracts) ---------------------------
orb(backdrop, '#7C5CFF',  80, 150, 420, 0.55);
orb(backdrop, '#C8FF4D', 330,  60, 300, 0.40);
orb(backdrop, '#FF4FA0', 300, 520, 380, 0.38);
orb(backdrop, '#3DE8FF',  40, 700, 320, 0.30);

// --- Status bar --------------------------------------------------------------
statusBar(screen);

// --- Header  y 62..122 -------------------------------------------------------
const header = blk(16, 62, 361, 60, 'HORIZONTAL', {
  name: 'Header', gap: 12, justify: 'SPACE_BETWEEN', align: 'CENTER'
});
const greet = stack(header, 'VERTICAL', { name: 'Greeting', gap: 2 });
txt(greet, 'Good morning', { size: 13, lh: 18, style: 'Medium', opacity: 0.62 });
txt(greet, 'Alex', { size: 34, lh: 40, style: 'Bold', ls: -2 });

// 44x44 circular glass bell button with a magenta unread dot
const bell = figma.createFrame();
bell.name = 'Notifications';
bell.resize(44, 44);
header.appendChild(bell);
bell.clipsContent = false;
glass(bell, { r: 22, blur: 30, noShadow: true });
const bellIcon = icon(bell, IC(P.bell, '#FFFFFF', 1.7), 21);
bellIcon.x = 11.5; bellIcon.y = 11.5;
const dot = figma.createEllipse();
dot.name = 'Unread Dot';
dot.resize(10, 10);
bell.appendChild(dot);
dot.x = 30; dot.y = 2;
dot.fills = [ S('#FF4FA0', 1) ];
dot.strokes = [ S('#05060A', 0.85) ];
dot.strokeWeight = 1.5; dot.strokeAlign = 'OUTSIDE';
dot.effects = [{ type:'DROP_SHADOW', color:{r:1,g:0.31,b:0.63,a:0.6}, offset:{x:0,y:0}, radius:10, spread:0, visible:true, blendMode:'NORMAL' }];

// --- Hero activity rings panel  y 140..350 -----------------------------------
const hero = panel(screen, 16, 140, 361, 210, {
  name: 'Activity Rings', dir: 'HORIZONTAL', gap: 18, pad: 20, padY: 30,
  r: 34, blur: 44, align: 'CENTER'
});

// Three CONCENTRIC rings inside a plain 150x150 holder (same centre)
const rings = figma.createFrame();
rings.name = 'Rings';
rings.resize(150, 150);
rings.fills = [];
rings.clipsContent = false;
hero.appendChild(rings);
const rMove = ring(rings, 150, 15, '#FF4FA0', 0.82); rMove.x = 0;  rMove.y = 0;  rMove.name = 'Ring · Move';
const rExer = ring(rings, 116, 15, '#C8FF4D', 0.64); rExer.x = 17; rExer.y = 17; rExer.name = 'Ring · Exercise';
const rStand = ring(rings,  82, 15, '#3DE8FF', 0.45); rStand.x = 34; rStand.y = 34; rStand.name = 'Ring · Stand';

// Legend: coloured dot + uppercase label + value
const legend = stack(hero, 'VERTICAL', { name: 'Legend', gap: 16 });
legend.layoutSizingHorizontal = 'FILL';
const legendRows = [
  { c: '#FF4FA0', label: 'MOVE',     value: '512 / 620 KCAL' },
  { c: '#C8FF4D', label: 'EXERCISE', value: '38 / 60 MIN' },
  { c: '#3DE8FF', label: 'STAND',    value: '9 / 12 HR' }
];
legendRows.forEach(function (row) {
  const r = stack(legend, 'HORIZONTAL', { name: 'Legend · ' + row.label, gap: 9, align: 'CENTER' });
  const d = figma.createEllipse();
  d.name = 'Dot'; d.resize(8, 8);
  r.appendChild(d);
  d.fills = [ S(row.c, 1) ];
  const col = stack(r, 'VERTICAL', { gap: 2 });
  txt(col, row.label, { size: 11, lh: 14, style: 'Semi Bold', ls: 4, color: row.c });
  txt(col, row.value, { size: 13, lh: 18, style: 'Medium', opacity: 0.72 });
});

// --- Three small stat tiles  y 366..470 --------------------------------------
const tiles = [
  { t: 'Steps',    v: '8,241',  lbl: 'STEPS',    c: '#3DE8FF', ic: P.activity },
  { t: 'Distance', v: '6.4 km', lbl: 'DISTANCE', c: '#C8FF4D', ic: P.route },
  { t: 'Calories', v: '743',    lbl: 'CALORIES', c: '#FF4FA0', ic: P.flame }
];
tiles.forEach(function (tl, i) {
  const tile = panel(screen, 16 + i * 123, 366, 115, 104, {
    name: 'Stat · ' + tl.t, dir: 'VERTICAL', gap: 6, padX: 12, padY: 12,
    r: 24, blur: 36, tint: tl.c, a1: 0.18, a2: 0.05
  });
  const badge = figma.createFrame();
  badge.name = 'Icon Chip';
  badge.resize(32, 32);
  tile.appendChild(badge);
  badge.cornerRadius = 11; badge.cornerSmoothing = 0.6;
  badge.fills = [ S(tl.c, 0.20) ];
  badge.strokes = [ S(tl.c, 0.35) ];
  badge.strokeWeight = 1; badge.strokeAlign = 'INSIDE';
  badge.clipsContent = false;
  const gi = icon(badge, IC(tl.ic, tl.c, 1.9), 18);
  gi.x = 7; gi.y = 7;
  const col = stack(tile, 'VERTICAL', { gap: 2 });
  txt(col, tl.v, { size: 20, lh: 26, style: 'Semi Bold', ls: -1 });
  txt(col, tl.lbl, { size: 11, lh: 14, style: 'Semi Bold', ls: 4, opacity: 0.45 });
});

// --- Section label  y 492..506 -----------------------------------------------
const upNext = blk(18, 492, 357, 14, 'HORIZONTAL', {
  name: 'Section · Up next', justify: 'SPACE_BETWEEN', align: 'CENTER', gap: 8
});
txt(upNext, 'UP NEXT', { size: 11, lh: 14, style: 'Semi Bold', ls: 4, opacity: 0.38 });
txt(upNext, 'See all', { size: 12, lh: 14, style: 'Semi Bold', color: '#C8FF4D', opacity: 0.9 });

// --- Hero workout card (violet-tinted glass)  y 516..666 ---------------------
const card = panel(screen, 16, 516, 361, 150, {
  name: 'Up Next · Upper Body Power', dir: 'VERTICAL',
  padX: 20, padY: 16, gap: 0, r: 30, blur: 44,
  tint: '#7C5CFF', a1: 0.26, a2: 0.06, justify: 'SPACE_BETWEEN'
});
const cardCopy = stack(card, 'VERTICAL', { name: 'Copy', gap: 4 });
txt(cardCopy, 'STRENGTH · 45 MIN', { size: 11, lh: 14, style: 'Semi Bold', ls: 4, color: '#C8FF4D' });
txt(cardCopy, 'Upper Body Power', { size: 26, lh: 32, style: 'Bold', ls: -2 });
txt(cardCopy, '8 exercises · 3 rounds', { size: 13, lh: 18, style: 'Medium', opacity: 0.62 });

const cardFoot = stack(card, 'HORIZONTAL', { name: 'Footer', gap: 8, align: 'CENTER', justify: 'SPACE_BETWEEN' });
cardFoot.layoutSizingHorizontal = 'FILL';
const meta = stack(cardFoot, 'HORIZONTAL', { name: 'Meta', gap: 6, align: 'CENTER' });
const clockIcon = icon(meta, IC(P.clock, '#FFFFFF', 1.7), 15);
clockIcon.opacity = 0.55;
txt(meta, '6:30 PM · Full gym', { size: 12, lh: 16, style: 'Medium', opacity: 0.55 });

// Lime pill Start button (non-glass accent element for contrast)
const startBtn = figma.createAutoLayout('HORIZONTAL');
startBtn.name = 'Button · Start';
cardFoot.appendChild(startBtn);
startBtn.resize(104, 40);                    // resize FIRST
startBtn.primaryAxisSizingMode = 'FIXED';
startBtn.counterAxisSizingMode = 'FIXED';
startBtn.itemSpacing = 6;
startBtn.paddingLeft = 16; startBtn.paddingRight = 18;
startBtn.paddingTop = 0; startBtn.paddingBottom = 0;
startBtn.primaryAxisAlignItems = 'CENTER';
startBtn.counterAxisAlignItems = 'CENTER';
startBtn.cornerRadius = 20; startBtn.cornerSmoothing = 0.6;
startBtn.clipsContent = false;
startBtn.fills = [ LIN([ st('#D6FF6B', 1, 0), st('#A8F03D', 1, 1) ], T_DOWN) ];
startBtn.effects = [{ type:'DROP_SHADOW', color:{r:0.78,g:1,b:0.3,a:0.35}, offset:{x:0,y:6}, radius:18, spread:-4, visible:true, blendMode:'NORMAL' }];
icon(startBtn, ICF(P.play, '#05060A'), 16);
txt(startBtn, 'Start', { size: 15, lh: 20, style: 'Semi Bold', ls: -1, color: '#05060A' });

// --- Recovery strip (low, wide glass row)  y 682..740 ------------------------
const recovery = panel(screen, 16, 682, 361, 58, {
  name: 'Recovery', dir: 'HORIZONTAL', padX: 16, padY: 0, gap: 12,
  r: 22, blur: 36, align: 'CENTER', justify: 'SPACE_BETWEEN'
});
const recLeft = stack(recovery, 'HORIZONTAL', { name: 'Recovery Info', gap: 10, align: 'CENTER' });
const heartIcon = icon(recLeft, IC(P.heart, '#FF4FA0', 1.8), 20);
const recCol = stack(recLeft, 'VERTICAL', { gap: 1 });
txt(recCol, 'RECOVERY', { size: 11, lh: 14, style: 'Semi Bold', ls: 4, opacity: 0.45 });
txt(recCol, '86% · Ready to train', { size: 13, lh: 18, style: 'Medium', opacity: 0.85 });
const chev = icon(recovery, IC(P.chevronR, '#FFFFFF', 2), 16);
chev.opacity = 0.4;

// --- Chrome ------------------------------------------------------------------
tabBar(screen, 0);
homeIndicator(screen);
