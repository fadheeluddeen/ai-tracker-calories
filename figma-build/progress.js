// ===== SCREEN 03 · PROGRESS =====================================================
const b = screenBase(page, '03 · Progress', 986, 0);
const screen = b.screen;
const backdrop = b.backdrop;

// --- Backdrop orbs (the colour the glass refracts) ------------------------------
orb(backdrop, '#3DE8FF',  60, 120, 400, 0.45);
orb(backdrop, '#C8FF4D', 340, 300, 340, 0.40);
orb(backdrop, '#7C5CFF',  80, 620, 380, 0.38);
orb(backdrop, '#FF4FA0', 340, 760, 300, 0.28);

// --- Status bar ------------------------------------------------------------------
statusBar(screen);

// --- Header: title + W/M glass segmented control · y 62..102 ---------------------
const header = stack(screen, 'HORIZONTAL', { gap: 12, align: 'CENTER', justify: 'SPACE_BETWEEN', name: 'Header' });
header.resize(361, 40);
header.primaryAxisSizingMode = 'FIXED';
header.counterAxisSizingMode = 'FIXED';
header.x = 16; header.y = 62;
txt(header, 'Progress', { size: 34, lh: 40, style: 'Bold', ls: -2, name: 'Title · Progress' });

const seg = figma.createAutoLayout('HORIZONTAL');
seg.name = 'Segmented · W / M';
seg.resize(78, 36);
header.appendChild(seg);
seg.paddingLeft = 4; seg.paddingRight = 4; seg.paddingTop = 4; seg.paddingBottom = 4;
seg.itemSpacing = 2;
seg.primaryAxisAlignItems = 'CENTER';
seg.counterAxisAlignItems = 'CENTER';
seg.clipsContent = false;
glass(seg, { r: 18, blur: 30, noShadow: true });

function mkSeg(parent, label, active) {
  const s = figma.createAutoLayout('HORIZONTAL');
  s.name = 'Seg · ' + label;
  s.resize(34, 28);
  parent.appendChild(s);
  s.primaryAxisAlignItems = 'CENTER';
  s.counterAxisAlignItems = 'CENTER';
  s.cornerRadius = 14; s.cornerSmoothing = 0.6;
  s.fills = active ? [ LIN([ st('#C8FF4D', 1, 0), st('#A8F03D', 1, 1) ], T_DOWN) ] : [];
  txt(s, label, { size: 13, lh: 16, style: active ? 'Bold' : 'Semi Bold', color: active ? '#05060A' : '#FFFFFF', opacity: active ? 1 : 0.6 });
  return s;
}
mkSeg(seg, 'W', true);
mkSeg(seg, 'M', false);

// --- Chart panel: active minutes, 7-day bars · y 128..408 ------------------------
const chart = panel(screen, 16, 128, 361, 280, { name: 'Chart · Active Minutes', r: 30, blur: 40, padX: 20, padY: 18, gap: 12 });

const cRow = stack(chart, 'HORIZONTAL', { gap: 8, align: 'CENTER', justify: 'SPACE_BETWEEN', name: 'Chart Header' });
cRow.layoutSizingHorizontal = 'FILL';
txt(cRow, 'ACTIVE MINUTES', { size: 11, lh: 14, style: 'Semi Bold', ls: 4, opacity: 0.38 });
txt(cRow, '+18% vs last week', { size: 13, lh: 18, style: 'Medium', color: '#C8FF4D' });

const tRow = stack(chart, 'HORIZONTAL', { gap: 8, align: 'MAX', justify: 'SPACE_BETWEEN', name: 'Total' });
tRow.layoutSizingHorizontal = 'FILL';
const tBig = stack(tRow, 'HORIZONTAL', { gap: 6, align: 'MAX', name: '412 min' });
txt(tBig, '412', { size: 34, lh: 40, style: 'Bold', ls: -2 });
txt(tBig, 'min', { size: 17, lh: 24, style: 'Medium', opacity: 0.62 });
txt(tRow, 'avg 59 / day', { size: 13, lh: 22, style: 'Medium', opacity: 0.38 });

// 7 columns · each a 30x160 plain frame with the bar absolutely placed so all
// bar BOTTOMS sit on the same 140 baseline, day letter at y=146.
const cols = stack(chart, 'HORIZONTAL', { gap: 10, align: 'MIN', justify: 'SPACE_BETWEEN', name: 'Bars' });
cols.layoutSizingHorizontal = 'FILL';
const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const BARH = [58, 96, 44, 120, 78, 140, 66];
const DNAME = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
DAYS.forEach(function (d, i) {
  const h = BARH[i];
  const hero = (h === 140);
  const col = figma.createFrame();
  col.name = 'Col · ' + DNAME[i];
  col.resize(30, 160);
  col.fills = [];
  col.clipsContent = false;
  cols.appendChild(col);

  const bar = figma.createFrame();
  bar.name = 'Bar · ' + DNAME[i];
  bar.resize(30, h);
  col.appendChild(bar);
  bar.x = 0; bar.y = 140 - h;
  bar.cornerRadius = 15; bar.cornerSmoothing = 0.6;
  bar.clipsContent = false;
  if (hero) {
    bar.fills = [ LIN([ st('#C8FF4D', 1, 0), st('#3DE8FF', 1, 1) ], T_DOWN) ];
    bar.strokes = [];
    bar.effects = [{ type: 'DROP_SHADOW', color: { r: 0.78, g: 1, b: 0.30, a: 0.50 }, offset: { x: 0, y: 8 }, radius: 22, spread: -4, visible: true, blendMode: 'NORMAL' }];
  } else {
    bar.fills = [ S('#FFFFFF', 0.16) ];
    bar.strokes = [ S('#FFFFFF', 0.20) ];
    bar.strokeWeight = 1; bar.strokeAlign = 'INSIDE';
  }

  const dl = txt(null, d, { size: 11, lh: 14, style: 'Semi Bold', ls: 4, color: hero ? '#C8FF4D' : '#FFFFFF', opacity: hero ? 1 : 0.38, name: 'Day · ' + DNAME[i] });
  col.appendChild(dl);
  dl.x = Math.round((30 - dl.width) / 2);
  dl.y = 146;
});

// --- Two tinted stat cards · y 428..540 ------------------------------------------
function mkStat(x, tint, path, value, label, name) {
  const c = panel(screen, x, 428, 176, 112, { name: name, r: 26, blur: 40, tint: tint, a1: 0.22, a2: 0.05, pad: 16, gap: 0, justify: 'SPACE_BETWEEN' });
  icon(c, IC(path, tint, 1.8), 22);
  const col = stack(c, 'VERTICAL', { gap: 3, align: 'MIN', name: 'Value' });
  txt(col, value, { size: 26, lh: 32, style: 'Bold', ls: -2 });
  txt(col, label, { size: 11, lh: 14, style: 'Semi Bold', ls: 4, opacity: 0.55 });
  return c;
}
mkStat(16,  '#FFA33D', P.flame,  '17', 'DAY STREAK',     'Stat · Day Streak');
mkStat(201, '#7C5CFF', P.trophy, '5',  'PERSONAL BESTS', 'Stat · Personal Bests');

// --- Section header · y 560..574 --------------------------------------------------
const secHead = stack(screen, 'HORIZONTAL', { gap: 8, align: 'CENTER', justify: 'SPACE_BETWEEN', name: 'Section · Recent PBs' });
secHead.resize(361, 14);
secHead.primaryAxisSizingMode = 'FIXED';
secHead.counterAxisSizingMode = 'FIXED';
secHead.x = 16; secHead.y = 560;
txt(secHead, 'RECENT PERSONAL BESTS', { size: 11, lh: 14, style: 'Semi Bold', ls: 4, opacity: 0.38 });
txt(secHead, 'SEE ALL', { size: 11, lh: 14, style: 'Semi Bold', ls: 4, color: '#C8FF4D', opacity: 0.85 });

// --- Two personal-best glass rows · y 588..650 and y 662..724 ---------------------
function mkPB(y, tint, path, title, sub, value, name) {
  const row = panel(screen, 16, y, 361, 62, { name: name, dir: 'HORIZONTAL', r: 22, blur: 40, padX: 12, padY: 0, gap: 12, align: 'CENTER', justify: 'SPACE_BETWEEN' });

  const left = stack(row, 'HORIZONTAL', { gap: 12, align: 'CENTER', name: 'Left' });

  const tile = figma.createFrame();
  tile.name = 'Tile';
  tile.resize(36, 36);
  left.appendChild(tile);
  tile.cornerRadius = 12; tile.cornerSmoothing = 0.6;
  tile.fills = [ S(tint, 0.18) ];
  tile.strokes = [ S(tint, 0.35) ];
  tile.strokeWeight = 1; tile.strokeAlign = 'INSIDE';
  tile.clipsContent = false;
  const g = icon(tile, IC(path, tint, 1.8), 20);
  g.x = 8; g.y = 8;

  const col = stack(left, 'VERTICAL', { gap: 2, align: 'MIN', name: 'Copy' });
  txt(col, title, { size: 17, lh: 22, style: 'Semi Bold', ls: -1 });
  txt(col, sub, { size: 13, lh: 18, style: 'Medium', opacity: 0.62 });

  txt(row, value, { size: 17, lh: 22, style: 'Semi Bold', ls: -1, color: '#C8FF4D' });
  return row;
}
mkPB(588, '#3DE8FF', P.route,    'Fastest 5K',        'Sat 14 Sep · Riverside loop', '24:06', 'PB · Fastest 5K');
mkPB(662, '#C8FF4D', P.dumbbell, 'Heaviest deadlift', 'Thu 12 Sep · Strength',       '142 kg', 'PB · Deadlift');

// --- Chrome ----------------------------------------------------------------------
tabBar(screen, 1);
homeIndicator(screen);
