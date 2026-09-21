// ============================================================
// SCREEN 02 · WORKOUT LIVE — in-progress outdoor run (no tab bar)
// ============================================================
const b = screenBase(page, '02 · Workout Live', 493, 0);
const screen = b.screen;
const backdrop = b.backdrop;

// ---- local helpers (not in the prelude) ----------------------------------
// block(): a plain (fill-less) auto-layout frame absolutely placed on `screen`.
function block(x, y, w, h, dir, o) {
  o = o || {};
  const horiz = (dir === 'HORIZONTAL');
  const f = figma.createAutoLayout(dir || 'VERTICAL');
  f.name = o.name || 'Block';
  f.resize(w, h == null ? 10 : h);          // resize FIRST
  screen.appendChild(f);
  f.x = x; f.y = y;
  if (horiz) {
    f.primaryAxisSizingMode = 'FIXED';
    f.counterAxisSizingMode = (h == null ? 'AUTO' : 'FIXED');
  } else {
    f.counterAxisSizingMode = 'FIXED';
    f.primaryAxisSizingMode = (h == null ? 'AUTO' : 'FIXED');
  }
  f.fills = [];
  f.paddingLeft = 0; f.paddingRight = 0; f.paddingTop = 0; f.paddingBottom = 0;
  f.itemSpacing = o.gap == null ? 8 : o.gap;
  f.primaryAxisAlignItems = o.justify || 'MIN';
  f.counterAxisAlignItems = o.align || 'MIN';
  f.clipsContent = false;
  return f;
}

// gbtn(): circular glass button with a centred icon. Plain frame -> icon uses x/y.
function gbtn(parent, size, svg, iconSize, name) {
  const f = figma.createFrame();
  f.name = name || 'Glass Button';
  f.resize(size, size);
  if (parent) parent.appendChild(f);
  f.clipsContent = false;
  glass(f, { r: size / 2, blur: 30 });
  const g = icon(f, svg, iconSize);
  g.x = (size - iconSize) / 2;
  g.y = (size - iconSize) / 2;
  return f;
}

// ---- BACKDROP ORBS (glass needs colour behind it) ------------------------
orb(backdrop, '#FF4FA0', 300, 120, 420, 0.50);
orb(backdrop, '#FFA33D',  60, 300, 360, 0.38);
orb(backdrop, '#C8FF4D', 330, 640, 340, 0.35);
orb(backdrop, '#7C5CFF',  40, 760, 300, 0.30);

// ---- STATUS BAR ----------------------------------------------------------
statusBar(screen);

// ---- TOP BAR  y 62..102 --------------------------------------------------
const topBar = block(16, 62, 361, 40, 'HORIZONTAL', { name: 'Top Bar', gap: 0, align: 'CENTER', justify: 'MIN' });
gbtn(topBar, 40, IC(P.chevronR, '#FFFFFF', 2), 20, 'Back');
const topMid = stack(topBar, 'VERTICAL', { gap: 2, align: 'CENTER', justify: 'CENTER', name: 'Run Title', fill: true });
txt(topMid, 'OUTDOOR RUN', { size: 11, style: 'Semi Bold', lh: 14, ls: 4, color: '#C8FF4D' });
txt(topMid, 'GPS STRONG · AUTO LAP', { size: 10, style: 'Medium', lh: 12, ls: 2, color: '#FFFFFF', opacity: 0.38 });
gbtn(topBar, 40, IC(P.share, '#FFFFFF', 1.8), 20, 'Share');

// ---- HERO TIMER  y 130..254 (caption 14 + 4 + 72pt line 74 + 8 + chip 24) --
const timer = block(16, 130, 361, 124, 'VERTICAL', { name: 'Elapsed Timer', gap: 0, align: 'CENTER' });
const elapsedCap = txt(timer, 'ELAPSED', { size: 11, style: 'Semi Bold', lh: 14, ls: 4, color: '#FFFFFF', opacity: 0.38, width: 361, align: 'CENTER' });
elapsedCap.name = 'ELAPSED';
const bigClock = txt(timer, '28:41', { size: 72, style: 'Bold', lh: 74, ls: -4, color: '#FFFFFF', width: 361, align: 'CENTER' });
bigClock.name = 'Clock 28:41';
// the 8pt gap under the clock is carried by the chip row's own top padding
const chipWrap = stack(timer, 'HORIZONTAL', { gap: 0, align: 'CENTER', justify: 'CENTER', name: 'Ahead Chip Row', fill: true });
chipWrap.paddingTop = 8;
const aheadChip = figma.createAutoLayout('HORIZONTAL');
aheadChip.name = 'Chip · Ahead of target';
chipWrap.appendChild(aheadChip);
aheadChip.layoutSizingHorizontal = 'HUG';
aheadChip.layoutSizingVertical = 'HUG';
aheadChip.paddingLeft = 12; aheadChip.paddingRight = 12; aheadChip.paddingTop = 5; aheadChip.paddingBottom = 5;
aheadChip.itemSpacing = 6;
aheadChip.primaryAxisAlignItems = 'CENTER';
aheadChip.counterAxisAlignItems = 'CENTER';
aheadChip.cornerRadius = 12; aheadChip.cornerSmoothing = 0.6;
aheadChip.fills = [ LIN([ st('#C8FF4D', 1, 0), st('#A8F03D', 1, 1) ], T_DOWN) ];
txt(aheadChip, '12s AHEAD OF TARGET', { size: 10, style: 'Bold', lh: 14, ls: 3, color: '#05060A' });

// ---- METRICS PANEL  y 272..392 (361x120) ---------------------------------
const metrics = panel(screen, 16, 272, 361, 120, {
  name: 'Live Metrics', dir: 'VERTICAL', r: 30, blur: 44,
  padX: 20, padY: 22, gap: 0, justify: 'CENTER', align: 'MIN'
});
const metricRow = stack(metrics, 'HORIZONTAL', { gap: 0, justify: 'SPACE_BETWEEN', align: 'CENTER', name: 'Metric Row', fill: true });

function metricCol(parent, label, value, unit, alignMode, iconSvg) {
  const col = stack(parent, 'VERTICAL', { gap: 6, align: alignMode, justify: 'MIN', name: 'Metric · ' + label });
  const lab = stack(col, 'HORIZONTAL', { gap: 5, align: 'CENTER', justify: 'MIN', name: 'Label' });
  if (iconSvg) icon(lab, iconSvg, 13);
  txt(lab, label, { size: 11, style: 'Semi Bold', lh: 14, ls: 4, color: '#FFFFFF', opacity: 0.38 });
  const val = stack(col, 'HORIZONTAL', { gap: 4, align: 'MAX', justify: 'MIN', name: 'Value' });
  txt(val, value, { size: 30, style: 'Bold', lh: 34, ls: -2, color: '#FFFFFF' });
  txt(val, unit, { size: 13, style: 'Medium', lh: 20, color: '#FFFFFF', opacity: 0.62 });
  return col;
}
metricCol(metricRow, 'DISTANCE', '5.24', 'km', 'MIN', null);
metricCol(metricRow, 'PACE', '5:28', '/km', 'CENTER', null);
metricCol(metricRow, 'HEART', '162', 'bpm', 'MAX', IC(P.heart, '#FF4FA0', 2));

// ---- SPLITS PANEL  y 412..564 (361x152), magenta-tinted glass ------------
const splits = panel(screen, 16, 412, 361, 152, {
  name: 'Splits', dir: 'VERTICAL', r: 30, blur: 44,
  tint: '#FF4FA0', a1: 0.18, a2: 0.05,
  padX: 20, padY: 18, gap: 14, align: 'MIN', justify: 'MIN'
});
const splitHead = stack(splits, 'HORIZONTAL', { gap: 8, justify: 'SPACE_BETWEEN', align: 'CENTER', name: 'Splits Header', fill: true });
txt(splitHead, 'CURRENT SPLIT · KM 6', { size: 11, style: 'Semi Bold', lh: 14, ls: 4, color: '#FFFFFF', opacity: 0.62 });
txt(splitHead, 'AVG 5:37 /km', { size: 11, style: 'Semi Bold', lh: 14, ls: 2, color: '#FFFFFF', opacity: 0.38 });

const splitList = stack(splits, 'VERTICAL', { gap: 10, align: 'MIN', justify: 'MIN', name: 'Split Rows', fill: true });
const splitData = [
  { km: 'KM 3', w: 196, pace: '5:41', live: false },
  { km: 'KM 4', w: 214, pace: '5:33', live: false },
  { km: 'KM 5', w: 178, pace: '5:47', live: false },
  { km: 'KM 6', w: 232, pace: '5:28', live: true  }
];
splitData.forEach(function (d) {
  const row = stack(splitList, 'HORIZONTAL', { gap: 8, align: 'CENTER', justify: 'MIN', name: 'Split ' + d.km, fill: true });
  txt(row, d.km, {
    size: 12, style: 'Medium', lh: 14, width: 34,
    color: d.live ? '#C8FF4D' : '#FFFFFF', opacity: d.live ? 1 : 0.62
  });
  // track is a FRAME (clipping) so the gradient fill bar can live inside it
  const track = figma.createFrame();
  track.name = 'Track';
  track.resize(240, 10);
  row.appendChild(track);
  track.layoutSizingHorizontal = 'FIXED';
  track.layoutSizingVertical = 'FIXED';
  track.clipsContent = true;
  track.cornerRadius = 5; track.cornerSmoothing = 0.6;
  track.fills = [ S('#FFFFFF', 0.12) ];
  const barFill = figma.createRectangle();
  barFill.name = 'Fill';
  barFill.resize(d.w, 10);
  track.appendChild(barFill);
  barFill.x = 0; barFill.y = 0;
  barFill.cornerRadius = 5;
  barFill.fills = [ LIN([ st('#C8FF4D', 1, 0), st('#3DE8FF', 1, 1) ], T_RIGHT) ];
  if (!d.live) barFill.opacity = 0.65;
  const pace = txt(row, d.pace, {
    size: 12, style: d.live ? 'Semi Bold' : 'Medium', lh: 14, width: 31, align: 'RIGHT',
    color: '#FFFFFF', opacity: d.live ? 1 : 0.62
  });
  pace.layoutSizingHorizontal = 'FILL';
});

// ---- AMBER INSIGHT STRIP  y 592..656 (361x64) ----------------------------
const strip = panel(screen, 16, 592, 361, 64, {
  name: 'Insight · Negative split', dir: 'HORIZONTAL', r: 22, blur: 40,
  tint: '#FFA33D', a1: 0.24, a2: 0.08,
  padX: 18, padY: 0, gap: 12, align: 'CENTER', justify: 'MIN'
});
const boltChip = figma.createFrame();
boltChip.name = 'Bolt Chip';
boltChip.resize(34, 34);
strip.appendChild(boltChip);
boltChip.layoutSizingHorizontal = 'FIXED';
boltChip.layoutSizingVertical = 'FIXED';
boltChip.clipsContent = false;
boltChip.cornerRadius = 17; boltChip.cornerSmoothing = 0.6;
boltChip.fills = [ LIN([ st('#FFC46B', 1, 0), st('#FFA33D', 1, 1) ], T_DOWN) ];
boltChip.effects = [{ type: 'DROP_SHADOW', color: { r: 1, g: 0.64, b: 0.24, a: 0.40 }, offset: { x: 0, y: 6 }, radius: 16, spread: -4, visible: true, blendMode: 'NORMAL' }];
const boltIcon = icon(boltChip, ICF(P.bolt, '#1A0E00'), 18);
boltIcon.x = 8; boltIcon.y = 8;
const stripTxt = txt(strip, 'Negative split — 12s faster than last km', {
  size: 15, style: 'Medium', lh: 20, color: '#FFFFFF', width: 279
});
stripTxt.layoutSizingHorizontal = 'FILL';

// ---- CONTROLS  common centre Y = 722 -------------------------------------
// left 64 -> y 690..754 · centre 84 -> y 680..764 · right 64 -> y 690..754
const stopBtn = gbtn(screen, 64, ICF(P.stop, '#FF4FA0'), 24, 'Stop');
stopBtn.x = 64; stopBtn.y = 690;

const pauseBtn = figma.createFrame();
pauseBtn.name = 'Pause (primary)';
pauseBtn.resize(84, 84);
screen.appendChild(pauseBtn);
pauseBtn.x = 154; pauseBtn.y = 680;   // centre x = 196, centre y = 722
pauseBtn.clipsContent = false;
pauseBtn.cornerRadius = 42; pauseBtn.cornerSmoothing = 0.6;
pauseBtn.fills = [ LIN([ st('#C8FF4D', 1, 0), st('#3DE8FF', 1, 1) ], T_DIAG) ];
pauseBtn.effects = [{ type: 'DROP_SHADOW', color: { r: 0.78, g: 1, b: 0.30, a: 0.45 }, offset: { x: 0, y: 10 }, radius: 30, spread: -6, visible: true, blendMode: 'NORMAL' }];
const pauseIcon = icon(pauseBtn, ICF(P.pause, '#05060A'), 32);
pauseIcon.x = 26; pauseIcon.y = 26;

const routeBtn = gbtn(screen, 64, IC(P.route, '#FFFFFF', 1.8), 24, 'Route');
routeBtn.x = 264; routeBtn.y = 690;

// ---- CONTROL CAPTION  y 782..796 -----------------------------------------
const ctlCap = block(16, 782, 361, 14, 'VERTICAL', { name: 'Control Hint', gap: 0, align: 'MIN' });
txt(ctlCap, 'AUTO PAUSE ON · HOLD STOP TO END RUN', {
  size: 10, style: 'Semi Bold', lh: 14, ls: 3, color: '#FFFFFF', opacity: 0.38, width: 361, align: 'CENTER'
});

// ---- HOME INDICATOR ------------------------------------------------------
homeIndicator(screen);
