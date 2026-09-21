// ── BOARD ──────────────────────────────────────────────────────────────────
// One large dark documentation board. Plain frame → children are absolutely
// positioned; every internal cluster is its own auto-layout.
const board = figma.createFrame();
board.name = 'Foundations';
board.resize(1240, 1560);
page.appendChild(board);
board.x = 0;
board.y = 0;
board.clipsContent = true;
board.cornerRadius = 0;
board.fills = [ LIN([ st('#05060A', 1, 0), st('#0A0C14', 1, 1) ], T_DOWN) ];

// ── BACKDROP ORBS ──────────────────────────────────────────────────────────
// Glass only reads as glass when colour sits behind it. These four bleed
// under every swatch, panel and tile on the board.
orb(board, '#7C5CFF', 240,  300, 620, 0.45, 120);
orb(board, '#C8FF4D', 980,  200, 460, 0.38, 110);
orb(board, '#3DE8FF', 300, 1120, 520, 0.35, 115);
orb(board, '#FF4FA0', 1000, 1000, 480, 0.32, 110);

// ── SECTION LABEL HELPER ───────────────────────────────────────────────────
// A 6pt lime dot + 11pt tracked caption, absolutely placed on the board.
function sectionLabel(x, y, label) {
  const row = stack(board, 'HORIZONTAL', { gap: 10, align: 'CENTER', name: 'Section · ' + label });
  row.x = x;
  row.y = y;
  const dot = figma.createEllipse();
  dot.resize(6, 6);
  row.appendChild(dot);
  dot.name = 'Marker';
  dot.fills = [ S('#C8FF4D', 1) ];
  txt(row, label, { size: 11, style: 'Semi Bold', lh: 14, ls: 6, color: '#FFFFFF', opacity: 0.55 });
  return row;
}

// ── 1 · TITLE BLOCK ────────────────────────────────────────────────────────
// display 56 / title3 subtitle / a row of chips (the chips are the board's
// non-glass accent moment).
const titleWord = txt(null, 'FLUX', { size: 56, style: 'Bold', lh: 58, ls: -3, name: 'FLUX' });
board.appendChild(titleWord);
titleWord.x = 64;
titleWord.y = 64;

const subtitle = txt(null, 'Liquid Glass design system · iOS 26 · iPhone 16 Pro', {
  size: 20, style: 'Semi Bold', lh: 26, ls: -1, opacity: 0.62, name: 'Subtitle'
});
board.appendChild(subtitle);
subtitle.x = 64;
subtitle.y = 132;

const chipRow = stack(board, 'HORIZONTAL', { gap: 10, align: 'CENTER', name: 'Meta Chips' });
chipRow.x = 64;
chipRow.y = 166;
pill(chipRow, 'v1.0 · 393 × 852', { active: true });
pill(chipRow, '10 type styles', {});
pill(chipRow, '18 icons', {});
pill(chipRow, '4 glass layers', {});

// ── 2 · COLOUR ─────────────────────────────────────────────────────────────
// 10 tokens · 96pt squircle chip, token name, hex. The two near-black
// swatches get a hairline so they read against the board.
sectionLabel(64, 220, 'COLOUR');

const swatchRow = stack(board, 'HORIZONTAL', { gap: 16, align: 'MIN', name: 'Colour Tokens' });
swatchRow.x = 64;
swatchRow.y = 250;

const COLOURS = [
  ['bg/base',      '#05060A', true],
  ['bg/deep',      '#0A0C14', true],
  ['orb/lime',     '#C8FF4D', false],
  ['orb/cyan',     '#3DE8FF', false],
  ['orb/violet',   '#7C5CFF', false],
  ['orb/magenta',  '#FF4FA0', false],
  ['orb/amber',    '#FFA33D', false],
  ['ring/move',    '#FF4FA0', false],
  ['ring/exercise','#C8FF4D', false],
  ['ring/stand',   '#3DE8FF', false]
];

COLOURS.forEach(function (c) {
  const col = stack(swatchRow, 'VERTICAL', { gap: 10, align: 'MIN', name: 'Swatch · ' + c[0] });
  const chip = figma.createRectangle();
  chip.resize(96, 96);
  col.appendChild(chip);
  chip.name = c[0];
  chip.cornerRadius = 24;
  chip.cornerSmoothing = 0.6;
  chip.fills = [ S(c[1], 1) ];
  if (c[2]) {
    chip.strokes = [ S('#FFFFFF', 0.15) ];
    chip.strokeWeight = 1;
    chip.strokeAlign = 'INSIDE';
  }
  txt(col, c[0], { size: 11, style: 'Semi Bold', lh: 14, ls: 1, color: '#FFFFFF', opacity: 1 });
  txt(col, c[1], { size: 13, style: 'Medium', lh: 18, color: '#FFFFFF', opacity: 0.38 });
});

// ── 3 · GLASS ANATOMY ──────────────────────────────────────────────────────
// Four 260×180 panels at x = 64 / 344 / 624 / 904, each stripped back to one
// stage of the recipe so the layering is legible.
sectionLabel(64, 470, 'GLASS ANATOMY');

const anatomyOpts = { dir: 'VERTICAL', pad: 20, gap: 10, justify: 'SPACE_BETWEEN', r: 24 };

// 01 · Tint — gradient fill + backdrop blur only. No stroke, no shadow.
const gA = panel(board, 64, 500, 260, 180, Object.assign({ name: '01 · Tint' }, anatomyOpts));
gA.strokes = [];
gA.effects = [ { type: 'BACKGROUND_BLUR', radius: 40, visible: true } ];
txt(gA, '01 · Tint', { size: 17, style: 'Semi Bold', lh: 22, ls: -1 });
txt(gA, 'White linear gradient, 16% down to 6%, over a 40pt backdrop blur.', {
  size: 13, style: 'Medium', lh: 18, opacity: 0.62, width: 220
});

// 02 · Specular edge — adds the 1px inside gradient stroke + inner highlights.
const gB = panel(board, 344, 500, 260, 180, Object.assign({ name: '02 · Specular edge' }, anatomyOpts));
gB.effects = [
  { type: 'BACKGROUND_BLUR', radius: 40, visible: true },
  { type: 'INNER_SHADOW', color: { r: 1, g: 1, b: 1, a: 0.45 }, offset: { x: 0, y: 1 }, radius: 1, spread: 0, visible: true, blendMode: 'NORMAL' }
];
txt(gB, '02 · Specular edge', { size: 17, style: 'Semi Bold', lh: 22, ls: -1 });
txt(gB, '1pt inside gradient stroke plus a +1px white inner highlight on top.', {
  size: 13, style: 'Medium', lh: 18, opacity: 0.62, width: 220
});

// 03 · Full glass — the complete recipe straight from glass().
const gC = panel(board, 624, 500, 260, 180, Object.assign({ name: '03 · Full glass' }, anatomyOpts));
txt(gC, '03 · Full glass', { size: 17, style: 'Semi Bold', lh: 22, ls: -1 });
txt(gC, 'Adds the −1px bounce light and a 34pt lift shadow at 40% black.', {
  size: 13, style: 'Medium', lh: 18, opacity: 0.62, width: 220
});

// 04 · Tinted — same recipe, lime accent swapped into the fill gradient.
const gD = panel(board, 904, 500, 260, 180, Object.assign({ name: '04 · Tinted' }, anatomyOpts, {
  tint: '#C8FF4D', a1: 0.26, a2: 0.06
}));
txt(gD, '04 · Tinted', { size: 17, style: 'Semi Bold', lh: 22, ls: -1, color: '#C8FF4D' });
txt(gD, 'Accent tint at 26% → 6%. Used for the active card and the live ring.', {
  size: 13, style: 'Medium', lh: 18, opacity: 0.62, width: 220
});

// ── 4 · TYPE RAMP ──────────────────────────────────────────────────────────
// 10 rows: a fixed 150pt tertiary label, then the sample set in that style.
sectionLabel(64, 730, 'TYPE RAMP');

const rampCol = stack(board, 'VERTICAL', { gap: 18, align: 'MIN', name: 'Type Ramp' });
rampCol.x = 64;
rampCol.y = 760;

const RAMP = [
  ['display / 56',  'Move every day', 56, 58, 'Bold',      -3],
  ['title1 / 34',   'Move every day', 34, 40, 'Bold',      -2],
  ['title2 / 26',   'Move every day', 26, 32, 'Bold',      -2],
  ['title3 / 20',   'Move every day', 20, 26, 'Semi Bold', -1],
  ['headline / 17', 'Move every day', 17, 22, 'Semi Bold', -1],
  ['body / 16',     'Move every day', 16, 22, 'Regular',    0],
  ['callout / 15',  'Move every day', 15, 20, 'Medium',     0],
  ['footnote / 13', 'Move every day', 13, 18, 'Medium',     0],
  ['caption / 11',  'MOVE EVERY DAY', 11, 14, 'Semi Bold',  4],
  ['numeric / 44',  'Move every day', 44, 46, 'Bold',      -3]
];

RAMP.forEach(function (r) {
  const row = stack(rampCol, 'HORIZONTAL', { gap: 28, align: 'CENTER', name: 'Ramp · ' + r[0] });
  txt(row, r[0], { size: 11, style: 'Semi Bold', lh: 14, ls: 4, opacity: 0.38, width: 150 });
  txt(row, r[1], { size: r[2], lh: r[3], style: r[4], ls: r[5] });
});

// ── 5 · ICONOGRAPHY ────────────────────────────────────────────────────────
// Wrapping grid, 476 wide → 6 tiles per row × 3 rows. Each tile is a 64pt
// glass square with the 24pt glyph optically centred by auto-layout.
sectionLabel(700, 730, 'ICONOGRAPHY');

const iconWrap = figma.createAutoLayout('HORIZONTAL');
iconWrap.name = 'Icon Grid';
iconWrap.fills = [];
iconWrap.layoutWrap = 'WRAP';
board.appendChild(iconWrap);
iconWrap.resize(476, 64);              // resize FIRST
iconWrap.primaryAxisSizingMode = 'FIXED';   // width stays 476
iconWrap.counterAxisSizingMode = 'AUTO';    // height hugs the wrapped rows
iconWrap.itemSpacing = 16;
iconWrap.counterAxisSpacing = 16;
iconWrap.primaryAxisAlignItems = 'MIN';
iconWrap.counterAxisAlignItems = 'MIN';
iconWrap.paddingLeft = 0; iconWrap.paddingRight = 0;
iconWrap.paddingTop = 0; iconWrap.paddingBottom = 0;
iconWrap.clipsContent = false;
iconWrap.x = 700;
iconWrap.y = 760;

const ICON_KEYS = ['home', 'activity', 'dumbbell', 'trophy', 'person', 'flame',
                   'heart', 'bolt', 'clock', 'route', 'chevronR', 'plus',
                   'bell', 'share', 'gear', 'play', 'pause', 'stop'];
const FILLED_KEYS = { play: true, pause: true, stop: true };

ICON_KEYS.forEach(function (key) {
  const tile = figma.createAutoLayout('HORIZONTAL');
  tile.name = 'Icon · ' + key;
  tile.resize(64, 64);                 // resize FIRST
  iconWrap.appendChild(tile);
  tile.layoutSizingHorizontal = 'FIXED';
  tile.layoutSizingVertical = 'FIXED';
  tile.paddingLeft = 0; tile.paddingRight = 0;
  tile.paddingTop = 0; tile.paddingBottom = 0;
  tile.itemSpacing = 0;
  tile.primaryAxisAlignItems = 'CENTER';
  tile.counterAxisAlignItems = 'CENTER';
  tile.clipsContent = false;
  glass(tile, { r: 20, blur: 30, noShadow: true });
  icon(tile, FILLED_KEYS[key] ? ICF(P[key], '#C8FF4D') : IC(P[key], '#FFFFFF', 1.8), 24);
});

// ── 6 · RADII + SPACING ────────────────────────────────────────────────────
// Six 72pt glass squares stepping through the radius scale; the last is a
// full circle standing in for the pill token.
sectionLabel(700, 1180, 'RADII + SPACING');

const radiiRow = stack(board, 'HORIZONTAL', { gap: 14, align: 'MIN', name: 'Radii Scale' });
radiiRow.x = 700;
radiiRow.y = 1210;

const RADII = [
  [12, '12'], [18, '18'], [24, '24'], [30, '30'], [38, '38'], [36, '999']
];

RADII.forEach(function (r) {
  const col = stack(radiiRow, 'VERTICAL', { gap: 8, align: 'CENTER', name: 'Radius · ' + r[1] });
  const sq = figma.createFrame();
  sq.name = 'r' + r[1];
  sq.resize(72, 72);
  col.appendChild(sq);
  sq.clipsContent = false;
  glass(sq, { r: r[0], blur: 30, noShadow: true });
  txt(col, r[1], { size: 11, style: 'Semi Bold', lh: 14, ls: 4, opacity: 0.38 });
});
