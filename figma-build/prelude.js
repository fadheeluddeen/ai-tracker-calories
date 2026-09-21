// --- compatibility shims: never let an optional API sink a whole build ---
// figma.createAutoLayout is a newer convenience API; fall back to manual setup if absent.
const mkAuto = (dir, props) => {
  let d = 'HORIZONTAL', p = props || null;
  if (typeof dir === 'string') { d = dir; }
  else if (dir && typeof dir === 'object') { p = dir; }
  let f;
  if (typeof figma.createAutoLayout === 'function') {
    f = figma.createAutoLayout(d);
  } else {
    f = figma.createFrame();
    f.layoutMode = d;
    f.primaryAxisSizingMode = 'AUTO';
    f.counterAxisSizingMode = 'AUTO';
  }
  if (p) for (const k in p) f[k] = p[k];
  return f;
};
// cornerSmoothing (the iOS squircle) is optional on some node types — set it defensively.
const smooth = (n, v) => { try { n.cornerSmoothing = (v == null ? 0.6 : v); } catch (e) {} };

const hx = h => ({ r: parseInt(h.slice(1,3),16)/255, g: parseInt(h.slice(3,5),16)/255, b: parseInt(h.slice(5,7),16)/255 });
const S  = (h,o) => ({ type:'SOLID', color: hx(h), opacity: (o==null?1:o) });
const st = (h,a,p) => ({ color: { r: hx(h).r, g: hx(h).g, b: hx(h).b, a: a }, position: p });
const T_RIGHT = [[1,0,0],[0,1,0]];
const T_DOWN  = [[0,1,0],[-1,0,1]];
const T_DIAG  = [[0.7,0.7,-0.2],[-0.7,0.7,0.5]];
const LIN = (stops,t) => ({ type:'GRADIENT_LINEAR', gradientStops: stops, gradientTransform: t||T_RIGHT });
const RAD = (stops,t) => ({ type:'GRADIENT_RADIAL', gradientStops: stops, gradientTransform: t||T_RIGHT });
const IC = (d,c,w) => '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="'+d+'" stroke="'+(c||'#FFFFFF')+'" stroke-width="'+(w||1.8)+'" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const ICF = (d,c) => '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="'+d+'" fill="'+(c||'#FFFFFF')+'"/></svg>';
const P = {
  home:'M3 10.5 12 3l9 7.5V20a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 20z',
  activity:'M3 12h4l3-8 4 16 3-8h4',
  dumbbell:'M6.5 6.5v11M17.5 6.5v11M3 9.5v5M21 9.5v5M6.5 12h11',
  trophy:'M7 4h10v5a5 5 0 0 1-10 0zM7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3M9.5 20h5M12 14v6',
  person:'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4.5 20.5a7.5 7.5 0 0 1 15 0',
  flame:'M12 22c4 0 6.5-2.7 6.5-6.2 0-4.6-4.3-6.4-4.3-9.8 0 0-2.6 1.2-2.6 4.3 0 1.9 1 2.7 1 4 0 1-.8 1.8-1.8 1.8s-1.8-.9-1.8-2.2c0-.6.2-1.2.2-1.2S5.5 14 5.5 16.4C5.5 19.4 8 22 12 22Z',
  heart:'M12 20.5 4.7 13.4a4.6 4.6 0 0 1 6.5-6.5l.8.8.8-.8a4.6 4.6 0 0 1 6.5 6.5z',
  bolt:'M13 2 4 14h7l-1 8 9-12h-7z',
  clock:'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 7v5l3.2 1.9',
  route:'M6.5 8.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM17.5 20.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM6.5 8.5v4a5 5 0 0 0 5 5h1.5',
  chevronR:'m9 5 7 7-7 7',
  plus:'M12 5v14M5 12h14',
  bell:'M18 8.5a6 6 0 1 0-12 0c0 6-2 7.5-2 7.5h16s-2-1.5-2-7.5M13.7 20a2 2 0 0 1-3.4 0',
  share:'M4 12v7a1.5 1.5 0 0 0 1.5 1.5h13A1.5 1.5 0 0 0 20 19v-7M12 15.5V3.5M8 7.5 12 3.5l4 4',
  gear:'M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4ZM19.1 14.5a1.6 1.6 0 0 0 .3 1.8l.1.1a1.9 1.9 0 1 1-2.7 2.7l-.1-.1a1.6 1.6 0 0 0-2.7 1.1v.3a1.9 1.9 0 1 1-3.8 0v-.2a1.6 1.6 0 0 0-2.7-1.1l-.1.1a1.9 1.9 0 1 1-2.7-2.7l.1-.1a1.6 1.6 0 0 0-1.1-2.7H3.5a1.9 1.9 0 1 1 0-3.8h.2a1.6 1.6 0 0 0 1.1-2.7l-.1-.1a1.9 1.9 0 1 1 2.7-2.7l.1.1a1.6 1.6 0 0 0 2.7-1.1V3.5a1.9 1.9 0 1 1 3.8 0v.2a1.6 1.6 0 0 0 2.7 1.1l.1-.1a1.9 1.9 0 1 1 2.7 2.7l-.1.1a1.6 1.6 0 0 0 1.1 2.7h.3a1.9 1.9 0 1 1 0 3.8h-.2a1.6 1.6 0 0 0-1.5 1.1Z',
  play:'M8 5.5v13l11-6.5z',
  pause:'M9 5h2.5v14H9zM15.5 5H18v14h-2.5z',
  stop:'M7.5 7.5h9v9h-9z'
};
const STATUS_SVG = '<svg width="72" height="14" viewBox="0 0 72 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 9.5h2.2v3.5H1zM6 7h2.2v6H6zM11 4.3h2.2V13H11zM16 1.5h2.2V13H16z" fill="#FFFFFF"/><path d="M28.5 4.2a9.4 9.4 0 0 1 12.6 0" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round"/><path d="M31.4 7.4a5.3 5.3 0 0 1 6.8 0" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round"/><circle cx="34.8" cy="11.1" r="1.7" fill="#FFFFFF"/><rect x="50.5" y="2.2" width="18" height="9.6" rx="3" stroke="#FFFFFF" stroke-opacity="0.5" stroke-width="1.2"/><rect x="52" y="3.7" width="13" height="6.6" rx="1.8" fill="#FFFFFF"/><path d="M69.6 5.6v3" stroke="#FFFFFF" stroke-opacity="0.5" stroke-width="1.6" stroke-linecap="round"/></svg>';

function txt(parent, chars, o) {
  o = o || {};
  const t = figma.createText();
  t.fontName = { family:'Inter', style: o.style || 'Regular' };
  t.fontSize = o.size || 15;
  t.lineHeight = o.lh ? { value:o.lh, unit:'PIXELS' } : { unit:'AUTO' };
  t.letterSpacing = { value: (o.ls==null?0:o.ls), unit:'PERCENT' };
  if (o.width) t.textAutoResize = 'HEIGHT';
  t.characters = chars;
  t.fills = [ S(o.color || '#FFFFFF', o.opacity==null?1:o.opacity) ];
  t.name = o.name || (chars.length>28 ? chars.slice(0,28) : chars) || 'Text';
  if (parent) parent.appendChild(t);
  if (o.width) { t.resize(o.width, t.height); t.layoutSizingHorizontal = 'FIXED'; }
  if (o.align) t.textAlignHorizontal = o.align;
  return t;
}

function glass(n, o) {
  o = o || {};
  const tint = o.tint || '#FFFFFF';
  const a1 = o.a1==null ? 0.16 : o.a1;
  const a2 = o.a2==null ? 0.06 : o.a2;
  n.fills = [ LIN([ st(tint,a1,0), st(tint,a2,1) ], T_DOWN) ];
  n.strokes = [ LIN([ st('#FFFFFF',0.50,0), st('#FFFFFF',0.08,0.5), st('#FFFFFF',0.22,1) ], T_DOWN) ];
  n.strokeWeight = 1; n.strokeAlign = 'INSIDE';
  n.cornerRadius = o.r==null ? 28 : o.r;
  smooth(n);
  const fx = [
    { type:'BACKGROUND_BLUR', radius: o.blur==null?40:o.blur, visible:true },
    { type:'INNER_SHADOW', color:{r:1,g:1,b:1,a:0.45}, offset:{x:0,y:1},  radius:1, spread:0, visible:true, blendMode:'NORMAL' },
    { type:'INNER_SHADOW', color:{r:1,g:1,b:1,a:0.10}, offset:{x:0,y:-1}, radius:1, spread:0, visible:true, blendMode:'NORMAL' }
  ];
  if (!o.noShadow) fx.push({ type:'DROP_SHADOW', color:{r:0,g:0,b:0,a:0.40}, offset:{x:0,y:14}, radius:34, spread:-10, visible:true, blendMode:'NORMAL' });
  n.effects = fx;
  return n;
}

function panel(parent, x, y, w, h, o) {
  o = o || {};
  const f = mkAuto(o.dir || 'VERTICAL');
  f.name = o.name || 'Glass Panel';
  f.resize(w, h==null ? 10 : h);
  parent.appendChild(f);
  f.x = x; f.y = y;
  f.counterAxisSizingMode = 'FIXED';
  f.primaryAxisSizingMode = (h==null ? 'AUTO' : 'FIXED');
  const px = o.padX==null ? (o.pad==null?20:o.pad) : o.padX;
  const py = o.padY==null ? (o.pad==null?20:o.pad) : o.padY;
  f.paddingLeft = px; f.paddingRight = px; f.paddingTop = py; f.paddingBottom = py;
  f.itemSpacing = o.gap==null ? 12 : o.gap;
  f.primaryAxisAlignItems = o.justify || 'MIN';
  f.counterAxisAlignItems = o.align || 'MIN';
  f.clipsContent = false;
  glass(f, o);
  return f;
}

function stack(parent, dir, o) {
  o = o || {};
  const f = mkAuto(dir);
  f.name = o.name || (dir==='HORIZONTAL'?'Row':'Col');
  f.fills = [];
  f.itemSpacing = o.gap==null ? 8 : o.gap;
  f.primaryAxisAlignItems = o.justify || 'MIN';
  f.counterAxisAlignItems = o.align || 'MIN';
  if (parent) parent.appendChild(f);
  if (o.fill) {
    f.layoutSizingHorizontal = 'FILL';
    // layoutSizingHorizontal only fixes sizing RELATIVE TO THE PARENT. Without also
    // pinning this frame's own hug axis, any FILL children nested inside still collapse
    // (a HUG frame can't give FILL children real width — see prelude gotcha notes).
    if (dir === 'VERTICAL') f.counterAxisSizingMode = 'FIXED';
    else f.primaryAxisSizingMode = 'FIXED';
  }
  return f;
}

function orb(parent, hex, cx, cy, size, opacity, blur) {
  const e = figma.createEllipse();
  e.resize(size, size);
  parent.appendChild(e);
  e.x = cx - size/2; e.y = cy - size/2;
  e.fills = [ RAD([ st(hex,0.95,0), st(hex,0.0,1) ]) ];
  e.opacity = opacity==null ? 0.9 : opacity;
  e.effects = [{ type:'LAYER_BLUR', radius: blur==null?90:blur, visible:true }];
  e.name = 'Orb';
  return e;
}

function icon(parent, svg, size) {
  const n = figma.createNodeFromSvg(svg);
  n.resize(size, size);
  n.name = 'Icon';
  if (parent) parent.appendChild(n);
  return n;
}

function ring(parent, size, thickness, hex, pct, trackAlpha) {
  const g = figma.createFrame();
  g.name = 'Ring'; g.resize(size,size); g.fills=[]; g.clipsContent=false;
  if (parent) parent.appendChild(g);
  const inner = 1 - (thickness/(size/2));
  const track = figma.createEllipse();
  track.resize(size,size); g.appendChild(track); track.x=0; track.y=0;
  track.fills = [ S(hex, trackAlpha==null?0.16:trackAlpha) ];
  track.arcData = { startingAngle:0, endingAngle:Math.PI*2, innerRadius: inner };
  track.name = 'Track';
  const prog = figma.createEllipse();
  prog.resize(size,size); g.appendChild(prog); prog.x=0; prog.y=0;
  prog.fills = [ S(hex, 1) ];
  prog.arcData = { startingAngle: -Math.PI/2, endingAngle: -Math.PI/2 + Math.PI*2*pct, innerRadius: inner };
  prog.name = 'Progress';
  return g;
}

function screenBase(page, name, x, y) {
  const s = figma.createFrame();
  s.name = name; s.resize(393, 852);
  page.appendChild(s);
  s.x = x; s.y = y;
  s.clipsContent = true;
  s.cornerRadius = 0;
  s.fills = [ LIN([ st('#05060A',1,0), st('#0A0C14',1,1) ], T_DOWN) ];
  const bd = figma.createFrame();
  bd.name = 'Backdrop'; bd.resize(393,852); bd.fills = []; bd.clipsContent = true;
  s.appendChild(bd); bd.x=0; bd.y=0;
  return { screen: s, backdrop: bd };
}

function statusBar(screen) {
  const b = figma.createFrame(); b.name='Status Bar'; b.resize(393,54); b.fills=[]; b.clipsContent=false;
  screen.appendChild(b); b.x=0; b.y=0;
  const t = txt(null, '9:41', { size:16, style:'Semi Bold', lh:20, ls:-1 });
  b.appendChild(t); t.x=34; t.y=17;
  const right = icon(b, STATUS_SVG, 72);
  right.resize(72,14); right.x = 393-34-72; right.y = 20;
  return b;
}

function homeIndicator(screen) {
  const r = figma.createRectangle(); r.name='Home Indicator';
  r.resize(144,5); screen.appendChild(r); r.x=124; r.y=841;
  r.cornerRadius=3; r.fills=[ S('#FFFFFF',0.35) ];
  return r;
}

function tabBar(screen, activeIndex) {
  const bar = panel(screen, 16, 762, 361, 66, { name:'Tab Bar', dir:'HORIZONTAL', r:33, blur:50, pad:0, padX:14, gap:0, align:'CENTER', justify:'SPACE_BETWEEN' });
  const items = [ {ic:P.home,label:'Today'}, {ic:P.activity,label:'Progress'}, null, {ic:P.dumbbell,label:'Train'}, {ic:P.person,label:'You'} ];
  items.forEach((it, i) => {
    if (it === null) {
      const fab = figma.createFrame();
      fab.name = 'FAB'; fab.resize(52,52); fab.cornerRadius = 26; fab.clipsContent = false;
      bar.appendChild(fab);
      fab.fills = [ LIN([ st('#C8FF4D',1,0), st('#3DE8FF',1,1) ], T_DIAG) ];
      fab.effects = [{ type:'DROP_SHADOW', color:{r:0.78,g:1,b:0.3,a:0.45}, offset:{x:0,y:6}, radius:24, spread:-4, visible:true, blendMode:'NORMAL' }];
      const pl = icon(fab, IC(P.plus,'#05060A',2.4), 24);
      pl.x = 14; pl.y = 14;
      return;
    }
    const active = (i === activeIndex);
    const col = stack(bar, 'VERTICAL', { gap:3, align:'CENTER', justify:'CENTER', name:'Tab · '+it.label });
    const g = icon(col, IC(it.ic, active ? '#C8FF4D' : '#FFFFFF', 1.8), 24);
    if (!active) g.opacity = 0.45;
    txt(col, it.label, { size:10, style:'Semi Bold', lh:12, ls:2, color: active ? '#C8FF4D' : '#FFFFFF', opacity: active ? 1 : 0.45 });
  });
  return bar;
}

function pill(parent, label, opts) {
  const o = opts || {};
  const p = mkAuto('HORIZONTAL');
  p.name = 'Chip · ' + label;
  p.fills = o.active
    ? [ LIN([ st('#C8FF4D',1,0), st('#A8F03D',1,1) ], T_DOWN) ]
    : [ LIN([ st('#FFFFFF',0.16,0), st('#FFFFFF',0.06,1) ], T_DOWN) ];
  p.strokes = [ S('#FFFFFF', o.active ? 0 : 0.18) ];
  p.strokeWeight = 1; p.strokeAlign = 'INSIDE';
  p.paddingLeft = 16; p.paddingRight = 16; p.paddingTop = 9; p.paddingBottom = 9;
  p.cornerRadius = 20; smooth(p);
  p.primaryAxisAlignItems = 'CENTER'; p.counterAxisAlignItems = 'CENTER';
  if (!o.active) p.effects = [{ type:'BACKGROUND_BLUR', radius:30, visible:true }];
  if (parent) parent.appendChild(p);
  txt(p, label, { size:13, style:'Semi Bold', lh:16, color: o.active ? '#05060A' : '#FFFFFF', opacity: o.active ? 1 : 0.8 });
  return p;
}
