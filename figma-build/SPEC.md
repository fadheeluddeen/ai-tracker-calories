# FLUX — iOS 26 "Liquid Glass" Fitness App — Figma Build Spec

Target: **iPhone 16 Pro — 393 x 852 pt**. Dark, vivid, glassy. Figma design file.
Everything is built with the Figma **Plugin API** via `use_figma`.

## 0. NON-NEGOTIABLE API RULES (violating any = broken build)

1. Colors are 0–1. Paint `color` is `{r,g,b}` ONLY — **never** `{r,g,b,a}`. Alpha = `opacity` at paint level.
   EXCEPTION: gradient `gradientStops[].color` DOES take `a`, and variable COLOR values DO take `a`.
2. `node.width/height` are read-only -> use `resize(w,h)`.
3. `resize()` RESETS `primaryAxisSizingMode`/`counterAxisSizingMode` to FIXED. Always `resize()` FIRST, then set sizing modes.
4. `layoutSizingHorizontal/Vertical` (on a CHILD) = 'FIXED'|'HUG'|'FILL'. `primary/counterAxisSizingMode` (on the FRAME) = 'FIXED'|'AUTO'. Never cross them.
5. `FILL`/`HUG` only work AFTER `appendChild` into an auto-layout parent.
6. A **HUG** parent collapses **FILL** children. Parent must be FIXED/FILL.
7. TEXT defaults to `textAutoResize='WIDTH_AND_HEIGHT'` and IGNORES FILL. For wrapping text set `textAutoResize='HEIGHT'` BEFORE `.characters`, then `resize(w, h)` after append.
8. Load fonts before ANY text mutation. Inter styles used here: `Regular`, `Medium`, `Semi Bold`, `Bold` (note the SPACE in "Semi Bold").
9. `counterAxisAlignItems` has NO 'STRETCH' -> use 'MIN' + child FILL.
10. Icons: ALWAYS `figma.createNodeFromSvg(...)`. NEVER build from rotated lines/rects.
11. `figma.notify()` does not exist. `console.log` is invisible. Use `return`.
12. Must `return { createdNodeIds: [...] }`.
13. Free/Starter plan -> variable collections support **ONE mode only**. Do NOT call `addMode`. Single mode named `Default`.
14. Top-level page nodes default to (0,0) — set explicit `x`/`y`.
15. Every Promise must be `await`ed. No async IIFE wrapper, no `figma.closePlugin()`.

## 1. DESIGN TOKENS

### Base / canvas
| Token | Hex | Use |
|---|---|---|
| bg/base      | #05060A | screen canvas |
| bg/deep      | #0A0C14 | lower gradient end |

### Backdrop orbs (the colour that the glass refracts — REQUIRED behind every glass panel)
| Token | Hex |
|---|---|
| orb/lime    | #C8FF4D |
| orb/cyan    | #3DE8FF |
| orb/violet  | #7C5CFF |
| orb/magenta | #FF4FA0 |
| orb/amber   | #FFA33D |

### Content
| Token | Hex / alpha |
|---|---|
| text/primary   | #FFFFFF @ 1.0 |
| text/secondary | #FFFFFF @ 0.62 |
| text/tertiary  | #FFFFFF @ 0.38 |
| accent/lime    | #C8FF4D |
| accent/cyan    | #3DE8FF |
| accent/magenta | #FF4FA0 |
| ring/move      | #FF4FA0 |
| ring/exercise  | #C8FF4D |
| ring/stand     | #3DE8FF |

### Radii  (all glass uses `cornerSmoothing = 0.6` — the iOS squircle)
xs 12 · sm 18 · md 24 · lg 30 · xl 38 · pill 999

### Type ramp (Inter — SF Pro stand-in)
| Name | size / lh / weight / tracking |
|---|---|
| display   | 56 / 58 / Bold      / -3% |
| title1    | 34 / 40 / Bold      / -2% |
| title2    | 26 / 32 / Bold      / -2% |
| title3    | 20 / 26 / Semi Bold / -1% |
| headline  | 17 / 22 / Semi Bold / -1% |
| body      | 16 / 22 / Regular   /  0% |
| callout   | 15 / 20 / Medium    /  0% |
| footnote  | 13 / 18 / Medium    /  0% |
| caption   | 11 / 14 / Semi Bold /  4% (UPPERCASE labels) |
| numeric   | 44 / 46 / Bold      / -3% (metric readouts) |

## 2. THE LIQUID GLASS RECIPE

A glass panel is a FRAME with ALL of:
- **fill**: vertical linear gradient, white `a=0.16` -> white `a=0.06`
- **stroke**: vertical linear gradient white `a=0.50` -> `a=0.08` (50%) -> `a=0.22`, weight 1, `strokeAlign='INSIDE'`
- **effects** (in this order):
  1. `BACKGROUND_BLUR` radius 40
  2. `INNER_SHADOW` white a .45, offset (0, 1), radius 1  <- top specular edge
  3. `INNER_SHADOW` white a .10, offset (0,-1), radius 1  <- bottom bounce light
  4. `DROP_SHADOW` black a .40, offset (0,14), radius 34, spread -10 <- lift
- `cornerSmoothing = 0.6`

**Glass only reads as glass if something colourful sits behind it.** Every screen MUST lay 3–4 blurred colour orbs onto the backdrop before any panel goes down.

Tinted glass variant: swap the fill gradient's white for an accent hex at `a1=0.22 / a2=0.05`.

## 3. SCREEN SKELETON (identical on every screen)

```
Screen                FRAME 393x852, fill bg/base, clipsContent = true
├─ Backdrop           FRAME 393x852 @ (0,0), clipsContent = true   <- orbs live here
├─ Status Bar         @ (0,0)   h 54   (time 9:41 + signal/wifi/battery svg)
├─ …content blocks…   absolutely positioned children
├─ Tab Bar            glass, 361x66 @ (16,762), r=33
└─ Home Indicator     144x5 @ (124,841), white a .35, r=3
```

Content blocks are absolutely positioned inside `Screen` (a PLAIN frame), but each block is
itself an **auto-layout** frame so its internals stay robust.

Safe area: content starts at y=62; bottom content must end above y=750.

## 4. THE PRELUDE

Every `use_figma` script is prepended with this EXACT prelude. Author screen code assuming these
helpers already exist. Do NOT redefine them.

```js
// ---- prelude ----
const hx = h => ({ r: parseInt(h.slice(1,3),16)/255, g: parseInt(h.slice(3,5),16)/255, b: parseInt(h.slice(5,7),16)/255 });
const S  = (h,o) => ({ type:'SOLID', color: hx(h), opacity: (o==null?1:o) });
const st = (h,a,p) => ({ color: { r: hx(h).r, g: hx(h).g, b: hx(h).b, a: a }, position: p });
const T_RIGHT = [[1,0,0],[0,1,0]];
const T_DOWN  = [[0,1,0],[-1,0,1]];
const T_DIAG  = [[0.7,0.7,-0.2],[-0.7,0.7,0.5]];
const LIN = (stops,t) => ({ type:'GRADIENT_LINEAR', gradientStops: stops, gradientTransform: t||T_RIGHT });
const RAD = (stops,t) => ({ type:'GRADIENT_RADIAL', gradientStops: stops, gradientTransform: t||T_RIGHT });

// text: txt(parent, "Hello", {size,lh,style,color,opacity,ls,width,align,name})
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

// glass(frame, {r, blur, tint, a1, a2, noShadow})
function glass(n, o) {
  o = o || {};
  const tint = o.tint || '#FFFFFF';
  const a1 = o.a1==null ? 0.16 : o.a1;
  const a2 = o.a2==null ? 0.06 : o.a2;
  n.fills = [ LIN([ st(tint,a1,0), st(tint,a2,1) ], T_DOWN) ];
  n.strokes = [ LIN([ st('#FFFFFF',0.50,0), st('#FFFFFF',0.08,0.5), st('#FFFFFF',0.22,1) ], T_DOWN) ];
  n.strokeWeight = 1; n.strokeAlign = 'INSIDE';
  n.cornerRadius = o.r==null ? 28 : o.r;
  n.cornerSmoothing = 0.6;
  const fx = [
    { type:'BACKGROUND_BLUR', radius: o.blur==null?40:o.blur, visible:true },
    { type:'INNER_SHADOW', color:{r:1,g:1,b:1,a:0.45}, offset:{x:0,y:1},  radius:1, spread:0, visible:true, blendMode:'NORMAL' },
    { type:'INNER_SHADOW', color:{r:1,g:1,b:1,a:0.10}, offset:{x:0,y:-1}, radius:1, spread:0, visible:true, blendMode:'NORMAL' }
  ];
  if (!o.noShadow) fx.push({ type:'DROP_SHADOW', color:{r:0,g:0,b:0,a:0.40}, offset:{x:0,y:14}, radius:34, spread:-10, visible:true, blendMode:'NORMAL' });
  n.effects = fx;
  return n;
}

// panel(parent, x, y, w, h|null, {dir,gap,pad,padX,padY,r,blur,tint,a1,a2,name,align,justify})
// h === null  => hug height.  Returns an auto-layout glass frame absolutely placed in `parent`.
function panel(parent, x, y, w, h, o) {
  o = o || {};
  const f = figma.createAutoLayout(o.dir || 'VERTICAL');
  f.name = o.name || 'Glass Panel';
  f.resize(w, h==null ? 10 : h);            // resize FIRST
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

// plain auto-layout row/col INSIDE a panel (no glass)
function stack(parent, dir, o) {
  o = o || {};
  const f = figma.createAutoLayout(dir);
  f.name = o.name || (dir==='HORIZONTAL'?'Row':'Col');
  f.fills = [];
  f.itemSpacing = o.gap==null ? 8 : o.gap;
  f.primaryAxisAlignItems = o.justify || 'MIN';
  f.counterAxisAlignItems = o.align || 'MIN';
  if (parent) parent.appendChild(f);
  if (o.fill) f.layoutSizingHorizontal = 'FILL';
  return f;
}

// orb(parent, hex, cx, cy, size, opacity, blur) — absolutely placed, cx/cy are the CENTRE
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

// icon(parent, svgString, size) -> FrameNode
function icon(parent, svg, size) {
  const n = figma.createNodeFromSvg(svg);
  n.resize(size, size);
  n.name = 'Icon';
  if (parent) parent.appendChild(n);
  return n;
}

// ring(parent, size, thickness, hex, pct) — progress arc via 2 ellipses + arcData
function ring(parent, size, thickness, hex, pct, trackAlpha) {
  const g = figma.createFrame();
  g.name = 'Ring'; g.resize(size,size); g.fills=[]; g.clipsContent=false;
  if (parent) parent.appendChild(g);
  const track = figma.createEllipse();
  track.resize(size,size); g.appendChild(track); track.x=0; track.y=0;
  track.fills = [ S(hex, trackAlpha==null?0.16:trackAlpha) ];
  track.arcData = { startingAngle:0, endingAngle:Math.PI*2, innerRadius: 1 - (thickness/(size/2))/2 };
  const prog = figma.createEllipse();
  prog.resize(size,size); g.appendChild(prog); prog.x=0; prog.y=0;
  prog.fills = [ S(hex, 1) ];
  prog.arcData = { startingAngle: -Math.PI/2, endingAngle: -Math.PI/2 + Math.PI*2*pct, innerRadius: 1 - (thickness/(size/2))/2 };
  prog.name = 'Progress';
  return g;
}

function statusBar(screen) {
  const b = figma.createFrame(); b.name='Status Bar'; b.resize(393,54); b.fills=[];
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
// ---- end prelude ----
```

`STATUS_SVG` is also provided by the prelude (cellular bars + wifi + battery, 72x14).

### `arcData` note
`arcData.innerRadius` is a 0–1 fraction of the radius. `startingAngle`/`endingAngle` are radians,
0 = 3 o'clock, increasing clockwise. `-Math.PI/2` = 12 o'clock.

## 5. ICON LIBRARY (use these exact path strings)

All 24x24, `stroke-width="1.8"`, round caps.

- home:     `M3 10.5 12 3l9 7.5V20a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 20z`
- activity: `M3 12h4l3-8 4 16 3-8h4`
- dumbbell: `M6.5 6.5v11M17.5 6.5v11M3 9.5v5M21 9.5v5M6.5 12h11`
- trophy:   `M7 4h10v5a5 5 0 0 1-10 0zM7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3M9.5 20h5M12 14v6`
- person:   `M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4.5 20.5a7.5 7.5 0 0 1 15 0`
- flame:    `M12 22c4 0 6.5-2.7 6.5-6.2 0-4.6-4.3-6.4-4.3-9.8 0 0-2.6 1.2-2.6 4.3 0 1.9 1 2.7 1 4 0 1-.8 1.8-1.8 1.8s-1.8-.9-1.8-2.2c0-.6.2-1.2.2-1.2S5.5 14 5.5 16.4C5.5 19.4 8 22 12 22Z`
- heart:    `M12 20.5 4.7 13.4a4.6 4.6 0 0 1 6.5-6.5l.8.8.8-.8a4.6 4.6 0 0 1 6.5 6.5z`
- bolt:     `M13 2 4 14h7l-1 8 9-12h-7z`
- clock:    `M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 7v5l3.2 1.9`
- route:    `M6.5 8.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM17.5 20.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM6.5 8.5v4a5 5 0 0 0 5 5h1.5`
- chevronR: `m9 5 7 7-7 7`
- plus:     `M12 5v14M5 12h14`
- bell:     `M18 8.5a6 6 0 1 0-12 0c0 6-2 7.5-2 7.5h16s-2-1.5-2-7.5M13.7 20a2 2 0 0 1-3.4 0`
- share:    `M4 12v7a1.5 1.5 0 0 0 1.5 1.5h13A1.5 1.5 0 0 0 20 19v-7M12 15.5V3.5M8 7.5 12 3.5l4 4`
- gear:     `M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4ZM19.1 14.5a1.6 1.6 0 0 0 .3 1.8l.1.1a1.9 1.9 0 1 1-2.7 2.7l-.1-.1a1.6 1.6 0 0 0-2.7 1.1v.3a1.9 1.9 0 1 1-3.8 0v-.2a1.6 1.6 0 0 0-2.7-1.1l-.1.1a1.9 1.9 0 1 1-2.7-2.7l.1-.1a1.6 1.6 0 0 0-1.1-2.7H3.5a1.9 1.9 0 1 1 0-3.8h.2a1.6 1.6 0 0 0 1.1-2.7l-.1-.1a1.9 1.9 0 1 1 2.7-2.7l.1.1a1.6 1.6 0 0 0 2.7-1.1V3.5a1.9 1.9 0 1 1 3.8 0v.2a1.6 1.6 0 0 0 2.7 1.1l.1-.1a1.9 1.9 0 1 1 2.7 2.7l-.1.1a1.6 1.6 0 0 0 1.1 2.7h.3a1.9 1.9 0 1 1 0 3.8h-.2a1.6 1.6 0 0 0-1.5 1.1Z`

FILL icons (use `fill="#FFFFFF"`, no stroke attributes):
- play:  `M8 5.5v13l11-6.5z`
- pause: `M9 5h2.5v14H9zM15.5 5H18v14h-2.5z`
- stop:  `M7.5 7.5h9v9h-9z`

Stroke wrapper:
`<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="PATH" stroke="#FFFFFF" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`

Fill wrapper:
`<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="PATH" fill="#FFFFFF"/></svg>`

Recolour by substituting the hex in `stroke="…"` / `fill="…"`.

## 6. SCREEN INVENTORY

All five live on a page named **Screens**, laid out left->right with a 100pt gutter.

| # | Frame name | x | y |
|---|---|---|---|
| 1 | `01 · Today`        | 0    | 0 |
| 2 | `02 · Workout Live` | 493  | 0 |
| 3 | `03 · Progress`     | 986  | 0 |
| 4 | `04 · Workouts`     | 1479 | 0 |
| 5 | `05 · Profile`      | 1972 | 0 |

### Tab bar (identical on screens 1, 3, 4, 5 — screen 2 has NO tab bar)
Glass pill `361 x 66` at `(16, 762)`, r=33, blur 50.
5 slots evenly spaced: Home · Activity · **[+ centre FAB]** · Workouts · Profile.
Active item = accent/lime icon + 11pt Semi Bold lime label. Inactive = white a .45 icon, no label.
Centre FAB: 52x52 circle, fill lime->cyan diagonal gradient, `plus` icon in #05060A, drop shadow lime a .45 blur 24.
