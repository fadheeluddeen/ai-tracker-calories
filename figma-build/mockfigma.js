// A strict-enough mock of the Figma Plugin API surface used by the FLUX build.
// Purpose: execute prelude + screen bodies locally and throw on the SAME classes of
// error the real API throws, so we never burn metered Figma calls on a broken script.

const ERRORS = [];
function fail(msg) { const e = new Error(msg); ERRORS.push(msg); throw e; }

const SIZING_CHILD = ['FIXED', 'HUG', 'FILL'];
const SIZING_AXIS = ['FIXED', 'AUTO'];
const PRIMARY_ALIGN = ['MIN', 'CENTER', 'MAX', 'SPACE_BETWEEN'];
const COUNTER_ALIGN = ['MIN', 'CENTER', 'MAX', 'BASELINE'];

let idc = 0;

function checkPaint(p, where) {
  if (!p || typeof p !== 'object') fail(where + ': paint must be an object, got ' + JSON.stringify(p));
  if (p.type === 'SOLID') {
    if (!p.color) fail(where + ': SOLID paint missing color');
    if ('a' in p.color) fail(where + ": Unrecognized key(s) in object: 'a' at color — alpha belongs at paint level as `opacity`");
    for (const k of ['r', 'g', 'b']) {
      if (typeof p.color[k] !== 'number') fail(where + ': color.' + k + ' must be a number');
      if (p.color[k] < 0 || p.color[k] > 1) fail(where + ': color.' + k + ' out of 0-1 range (' + p.color[k] + ')');
      if (Number.isNaN(p.color[k])) fail(where + ': color.' + k + ' is NaN (bad hex?)');
    }
    if (p.opacity != null && (p.opacity < 0 || p.opacity > 1)) fail(where + ': opacity out of range');
  } else if (p.type === 'GRADIENT_LINEAR' || p.type === 'GRADIENT_RADIAL' || p.type === 'GRADIENT_ANGULAR' || p.type === 'GRADIENT_DIAMOND') {
    if (!Array.isArray(p.gradientStops) || !p.gradientStops.length) fail(where + ': gradient needs gradientStops');
    p.gradientStops.forEach((s, i) => {
      if (typeof s.position !== 'number') fail(where + ': stop ' + i + ' missing position');
      for (const k of ['r', 'g', 'b']) {
        if (typeof s.color[k] !== 'number' || Number.isNaN(s.color[k])) fail(where + ': stop ' + i + ' color.' + k + ' bad (NaN/missing — check the hex)');
      }
    });
    if (!Array.isArray(p.gradientTransform)) fail(where + ': gradient missing gradientTransform');
  } else if (p.type === 'IMAGE') {
    // ok
  } else {
    fail(where + ': unknown paint type ' + p.type);
  }
}

function checkEffect(e, where) {
  const T = ['DROP_SHADOW', 'INNER_SHADOW', 'LAYER_BLUR', 'BACKGROUND_BLUR', 'NOISE', 'TEXTURE'];
  if (T.indexOf(e.type) === -1) fail(where + ': unknown effect type ' + e.type);
  if (e.type === 'DROP_SHADOW' || e.type === 'INNER_SHADOW') {
    if (!e.color || typeof e.color.a !== 'number') fail(where + ': shadow color needs {r,g,b,a}');
    if (!e.offset || typeof e.offset.x !== 'number') fail(where + ': shadow needs offset {x,y}');
    if (typeof e.radius !== 'number') fail(where + ': shadow needs radius');
    if (!e.blendMode) fail(where + ': shadow needs blendMode');
  } else {
    if (typeof e.radius !== 'number') fail(where + ': blur needs radius');
  }
  if (e.visible !== true && e.visible !== false) fail(where + ': effect needs explicit visible');
}

class Node {
  constructor(type) {
    this.type = type;
    this.id = String(++idc) + ':' + idc;
    this.name = type;
    this.children = [];
    this.parent = null;
    this._w = 100; this._h = 100;
    this.x = 0; this.y = 0;
    this.opacity = 1;
    this._fills = [];
    this._strokes = [];
    this._effects = [];
    this.strokeWeight = 1;
    this.strokeAlign = 'INSIDE';
    this.cornerRadius = 0;
    this.cornerSmoothing = 0;
    this.clipsContent = false;
    this.layoutMode = 'NONE';
    this.itemSpacing = 0;
    this.counterAxisSpacing = 0;
    this.layoutWrap = 'NO_WRAP';
    this.paddingTop = 0; this.paddingBottom = 0; this.paddingLeft = 0; this.paddingRight = 0;
    this._primaryAxisSizingMode = 'FIXED';
    this._counterAxisSizingMode = 'FIXED';
    this._primaryAxisAlignItems = 'MIN';
    this._counterAxisAlignItems = 'MIN';
    this._layoutPositioning = 'AUTO';
    this._layoutSizingH = 'FIXED';
    this._layoutSizingV = 'FIXED';
  }
  get width() { return this._w; }
  set width(v) { fail(this.name + ': TypeError: no setter for property width — use resize()'); }
  get height() { return this._h; }
  set height(v) { fail(this.name + ': TypeError: no setter for property height — use resize()'); }

  get fills() { return Object.freeze(this._fills.slice()); }
  set fills(v) {
    if (!Array.isArray(v)) fail(this.name + ': fills must be an array');
    v.forEach((p, i) => checkPaint(p, this.name + '.fills[' + i + ']'));
    this._fills = v.slice();
  }
  get strokes() { return Object.freeze(this._strokes.slice()); }
  set strokes(v) {
    if (!Array.isArray(v)) fail(this.name + ': strokes must be an array');
    v.forEach((p, i) => checkPaint(p, this.name + '.strokes[' + i + ']'));
    this._strokes = v.slice();
  }
  get effects() { return Object.freeze(this._effects.slice()); }
  set effects(v) {
    if (!Array.isArray(v)) fail(this.name + ': effects must be an array');
    v.forEach((e, i) => checkEffect(e, this.name + '.effects[' + i + ']'));
    this._effects = v.slice();
  }

  get primaryAxisSizingMode() { return this._primaryAxisSizingMode; }
  set primaryAxisSizingMode(v) {
    if (SIZING_AXIS.indexOf(v) === -1) fail(this.name + ": primaryAxisSizingMode: Expected 'FIXED' | 'AUTO', received '" + v + "'");
    this._primaryAxisSizingMode = v;
  }
  get counterAxisSizingMode() { return this._counterAxisSizingMode; }
  set counterAxisSizingMode(v) {
    if (SIZING_AXIS.indexOf(v) === -1) fail(this.name + ": counterAxisSizingMode: Expected 'FIXED' | 'AUTO', received '" + v + "'");
    this._counterAxisSizingMode = v;
  }
  get primaryAxisAlignItems() { return this._primaryAxisAlignItems; }
  set primaryAxisAlignItems(v) {
    if (PRIMARY_ALIGN.indexOf(v) === -1) fail(this.name + ': primaryAxisAlignItems invalid: ' + v);
    this._primaryAxisAlignItems = v;
  }
  get counterAxisAlignItems() { return this._counterAxisAlignItems; }
  set counterAxisAlignItems(v) {
    if (COUNTER_ALIGN.indexOf(v) === -1) fail(this.name + ": counterAxisAlignItems: Expected 'MIN' | 'MAX' | 'CENTER' | 'BASELINE', received '" + v + "'");
    this._counterAxisAlignItems = v;
  }
  get layoutPositioning() { return this._layoutPositioning; }
  set layoutPositioning(v) {
    if (['AUTO', 'ABSOLUTE'].indexOf(v) === -1) fail(this.name + ': layoutPositioning invalid: ' + v);
    if (v === 'ABSOLUTE' && (!this.parent || this.parent.layoutMode === 'NONE')) {
      fail(this.name + ': layoutPositioning=ABSOLUTE requires an auto-layout parent (append first)');
    }
    this._layoutPositioning = v;
  }
  get layoutSizingHorizontal() { return this._layoutSizingH; }
  set layoutSizingHorizontal(v) { this._setSizing('layoutSizingHorizontal', v, 'H'); }
  get layoutSizingVertical() { return this._layoutSizingV; }
  set layoutSizingVertical(v) { this._setSizing('layoutSizingVertical', v, 'V'); }
  _setSizing(prop, v, axis) {
    if (SIZING_CHILD.indexOf(v) === -1) {
      fail(this.name + ': ' + prop + ": Expected 'FIXED' | 'HUG' | 'FILL', received '" + v + "'");
    }
    const parentIsAL = this.parent && this.parent.layoutMode && this.parent.layoutMode !== 'NONE';
    const selfIsAL = this.layoutMode && this.layoutMode !== 'NONE';
    if (v === 'FILL' && !parentIsAL) {
      fail(this.name + ': in set_' + prop + ': FILL can only be set on children of auto-layout frames');
    }
    if (v === 'HUG' && !selfIsAL && this.type !== 'TEXT') {
      fail(this.name + ': in set_' + prop + ': HUG is only valid on an auto-layout frame or a TEXT child');
    }
    if (v === 'FILL' && parentIsAL) {
      const pm = this.parent.layoutMode;
      const alongPrimary = (pm === 'HORIZONTAL' && axis === 'H') || (pm === 'VERTICAL' && axis === 'V');
      const parentMode = alongPrimary ? this.parent._primaryAxisSizingMode : this.parent._counterAxisSizingMode;
      if (parentMode === 'AUTO') {
        fail(this.name + ': FILL child under a HUG parent (' + this.parent.name + ' ' + (alongPrimary ? 'primary' : 'counter') + 'AxisSizingMode=AUTO) will collapse');
      }
      if (alongPrimary) { this._w = axis === 'H' ? this.parent._w - this.parent.paddingLeft - this.parent.paddingRight : this._w; }
      else if (axis === 'H') { this._w = this.parent._w - this.parent.paddingLeft - this.parent.paddingRight; }
      else { this._h = this.parent._h - this.parent.paddingTop - this.parent.paddingBottom; }
    }
    if (axis === 'H') this._layoutSizingH = v; else this._layoutSizingV = v;
  }

  resize(w, h) {
    if (typeof w !== 'number' || typeof h !== 'number' || Number.isNaN(w) || Number.isNaN(h)) {
      fail(this.name + ': resize(' + w + ',' + h + ') — arguments must be numbers');
    }
    if (w < 0.01 || h < 0.01) fail(this.name + ': resize below minimum (' + w + 'x' + h + ')');
    this._w = w; this._h = h;
    // real Figma silently resets both sizing modes to FIXED
    this._primaryAxisSizingMode = 'FIXED';
    this._counterAxisSizingMode = 'FIXED';
  }
  resizeWithoutConstraints(w, h) { this.resize(w, h); }

  appendChild(n) {
    if (!n) fail(this.name + '.appendChild(undefined)');
    if (n === this) fail(this.name + ': cannot append to itself');
    if (n.parent) n.parent.children = n.parent.children.filter(c => c !== n);
    n.parent = this;
    this.children.push(n);
    this._relayout();
  }
  insertChild(i, n) { this.appendChild(n); }
  _relayout() {
    if (!this.layoutMode || this.layoutMode === 'NONE') return;
    const flow = this.children.filter(c => c._layoutPositioning !== 'ABSOLUTE');
    const gap = this.itemSpacing * Math.max(0, flow.length - 1);
    if (this.layoutMode === 'HORIZONTAL') {
      const w = flow.reduce((a, c) => a + c._w, 0) + gap + this.paddingLeft + this.paddingRight;
      const h = flow.reduce((a, c) => Math.max(a, c._h), 0) + this.paddingTop + this.paddingBottom;
      if (this._primaryAxisSizingMode === 'AUTO') this._w = w;
      if (this._counterAxisSizingMode === 'AUTO') this._h = h;
      this._contentW = w; this._contentH = h;
    } else {
      const h = flow.reduce((a, c) => a + c._h, 0) + gap + this.paddingTop + this.paddingBottom;
      const w = flow.reduce((a, c) => Math.max(a, c._w), 0) + this.paddingLeft + this.paddingRight;
      if (this._primaryAxisSizingMode === 'AUTO') this._h = h;
      if (this._counterAxisSizingMode === 'AUTO') this._w = w;
      this._contentW = w; this._contentH = h;
    }
    if (this.parent) this.parent._relayout();
  }
  remove() { if (this.parent) this.parent.children = this.parent.children.filter(c => c !== this); }
  clone() { const c = new Node(this.type); c.name = this.name + ' copy'; c._w = this._w; c._h = this._h; return c; }
  findOne() { return null; }
  findAll() { return []; }
  findAllWithCriteria() { return []; }
  set(props) { for (const k in props) { if (k === 'width' || k === 'height') { this.resize(k === 'width' ? props[k] : this._w, k === 'height' ? props[k] : this._h); } else { this[k] = props[k]; } } return this; }
  async screenshot() { return null; }
}

class TextNode extends Node {
  constructor() {
    super('TEXT');
    this._chars = '';
    this._fontName = { family: 'Inter', style: 'Regular' };
    this.fontSize = 12;
    this._lineHeight = { unit: 'AUTO' };
    this._letterSpacing = { value: 0, unit: 'PERCENT' };
    this.textAutoResize = 'WIDTH_AND_HEIGHT';
    this.textAlignHorizontal = 'LEFT';
    this._w = 0; this._h = 0;
  }
  get fontName() { return this._fontName; }
  set fontName(v) {
    if (!v || !v.family || !v.style) fail('fontName must be {family,style}');
    if (!LOADED.has(v.family + '|' + v.style)) {
      fail('Cannot write to node with unloaded font "' + v.family + ' ' + v.style + '"');
    }
    this._fontName = v;
  }
  get lineHeight() { return this._lineHeight; }
  set lineHeight(v) {
    if (typeof v === 'number') fail('lineHeight must be {value,unit} or {unit:"AUTO"}, got a bare number');
    if (!v || !v.unit) fail('lineHeight needs a unit');
    this._lineHeight = v;
  }
  get letterSpacing() { return this._letterSpacing; }
  set letterSpacing(v) {
    if (typeof v === 'number') fail('letterSpacing must be {value,unit}, got a bare number');
    if (!v || !v.unit) fail('letterSpacing needs a unit');
    this._letterSpacing = v;
  }
  get characters() { return this._chars; }
  set characters(v) {
    if (!LOADED.has(this._fontName.family + '|' + this._fontName.style)) {
      fail('Cannot write to node with unloaded font "' + this._fontName.family + ' ' + this._fontName.style + '"');
    }
    this._chars = String(v);
    const lh = this._lineHeight.unit === 'PIXELS' ? this._lineHeight.value : this.fontSize * 1.25;
    const approxCharW = this.fontSize * 0.55;
    if (this.textAutoResize === 'WIDTH_AND_HEIGHT') {
      this._w = Math.max(1, this._chars.length * approxCharW);
      this._h = lh;
    } else if (this.textAutoResize === 'HEIGHT') {
      const w = this._w > 0 ? this._w : 200;
      const perLine = Math.max(1, Math.floor(w / approxCharW));
      this._h = Math.max(1, Math.ceil(this._chars.length / perLine)) * lh;
    }
    if (this.parent) this.parent._relayout();
  }
  resize(w, h) {
    super.resize(w, h);
    if (this.textAutoResize === 'HEIGHT') {
      const approxCharW = this.fontSize * 0.55;
      const lh = this._lineHeight.unit === 'PIXELS' ? this._lineHeight.value : this.fontSize * 1.25;
      const perLine = Math.max(1, Math.floor(w / approxCharW));
      this._h = Math.max(1, Math.ceil(Math.max(1, this._chars.length) / perLine)) * lh;
    }
    if (this.parent) this.parent._relayout();
  }
  getStyledTextSegments() { return [{ fontName: this._fontName }]; }
}

class EllipseNode extends Node {
  constructor() { super('ELLIPSE'); this._arcData = { startingAngle: 0, endingAngle: Math.PI * 2, innerRadius: 0 }; }
  get arcData() { return this._arcData; }
  set arcData(v) {
    if (!v) fail('arcData must be an object');
    for (const k of ['startingAngle', 'endingAngle', 'innerRadius']) {
      if (typeof v[k] !== 'number' || Number.isNaN(v[k])) fail('arcData.' + k + ' must be a number, got ' + v[k]);
    }
    if (v.innerRadius < 0 || v.innerRadius > 1) fail('arcData.innerRadius must be 0..1, got ' + v.innerRadius);
    this._arcData = v;
  }
}

const LOADED = new Set();

function parseSvg(svg) {
  if (typeof svg !== 'string') fail('createNodeFromSvg needs a string, got ' + typeof svg);
  if (!/^\s*<svg[\s>]/.test(svg)) fail('createNodeFromSvg: not an <svg> string: ' + String(svg).slice(0, 60));
  if (!/viewBox=/.test(svg)) fail('createNodeFromSvg: svg missing viewBox');
  if (/(stroke|fill)="(undefined|null|)"/.test(svg)) fail('createNodeFromSvg: svg has an undefined stroke/fill colour — check IC()/ICF() args');
  if (/d="(undefined|null)"/.test(svg)) fail('createNodeFromSvg: svg path d is undefined — check the P.<name> key exists');
  const n = new Node('FRAME');
  n.name = 'svg';
  const mw = svg.match(/width="(\d+(?:\.\d+)?)"/);
  const mh = svg.match(/height="(\d+(?:\.\d+)?)"/);
  n._w = mw ? parseFloat(mw[1]) : 24;
  n._h = mh ? parseFloat(mh[1]) : 24;
  return n;
}

const PAGE = new Node('PAGE');
PAGE.name = 'MockPage';

const figma = {
  currentPage: PAGE,
  root: { children: [PAGE] },
  createFrame: () => new Node('FRAME'),
  createRectangle: () => new Node('RECTANGLE'),
  createEllipse: () => new EllipseNode(),
  createText: () => new TextNode(),
  createVector: () => new Node('VECTOR'),
  createLine: () => new Node('LINE'),
  createComponent: () => new Node('COMPONENT'),
  createPage: () => new Node('PAGE'),
  createSection: () => new Node('SECTION'),
  createNodeFromSvg: parseSvg,
  createAutoLayout: (a, b) => {
    let dir = 'HORIZONTAL', props = null;
    if (typeof a === 'string') { dir = a; props = b || null; }
    else if (a && typeof a === 'object') { props = a; }
    if (['HORIZONTAL', 'VERTICAL'].indexOf(dir) === -1) fail('createAutoLayout: bad direction ' + dir);
    const n = new Node('FRAME');
    n.layoutMode = dir;
    n._primaryAxisSizingMode = 'AUTO';
    n._counterAxisSizingMode = 'AUTO';
    n._w = 0; n._h = 0;
    if (props) for (const k in props) n[k] = props[k];
    return n;
  },
  group: (nodes, parent) => { const g = new Node('GROUP'); nodes.forEach(n => g.appendChild(n)); parent.appendChild(g); return g; },
  loadFontAsync: async f => { LOADED.add(f.family + '|' + f.style); },
  listAvailableFontsAsync: async () => [
    { fontName: { family: 'Inter', style: 'Regular' } },
    { fontName: { family: 'Inter', style: 'Medium' } },
    { fontName: { family: 'Inter', style: 'Semi Bold' } },
    { fontName: { family: 'Inter', style: 'Bold' } },
  ],
  setCurrentPageAsync: async p => { figma.currentPage = p; },
  getNodeByIdAsync: async () => PAGE,
  createTextStyle: () => ({ set name(v) {}, set fontName(v) {}, set fontSize(v) {}, set lineHeight(v) {}, set letterSpacing(v) {}, id: 'S:' + (++idc) }),
  createEffectStyle: () => ({ set name(v) {}, set effects(v) { v.forEach((e, i) => checkEffect(e, 'effectStyle[' + i + ']')); }, id: 'E:' + (++idc) }),
  variables: {
    createVariableCollection: n => ({ id: 'C', modes: [{ modeId: 'm' }], renameMode() {}, name: n }),
    createVariable: () => ({ setValueForMode() {}, set scopes(v) {}, id: 'V' }),
    setBoundVariableForPaint: p => p,
  },
  notify: () => { fail('figma.notify() is not implemented in use_figma'); },
  closePlugin: () => { fail('figma.closePlugin() must not be called'); },
  viewport: { scrollAndZoomIntoView() {} },
};

module.exports = { figma, PAGE, Node, TextNode, ERRORS, LOADED };
