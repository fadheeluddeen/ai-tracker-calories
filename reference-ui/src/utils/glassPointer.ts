// Interactive glass: while a finger/pointer is down on a glass surface, its
// specular highlight tracks the touch point and glows (see --gx/--gy/--glow-a
// in index.css). One set of document listeners covers every glass element,
// including ones mounted later, so components don't need to opt in.
const GLASS_SELECTOR = '.liquid-glass, .liquid-glass-subtle, .liquid-glass-thick';

let active: HTMLElement | null = null;

function place(el: HTMLElement, e: PointerEvent) {
  const r = el.getBoundingClientRect();
  if (!r.width || !r.height) return;
  el.style.setProperty('--gx', `${((e.clientX - r.left) / r.width) * 100}%`);
  el.style.setProperty('--gy', `${((e.clientY - r.top) / r.height) * 100}%`);
}

// Removing the inline values lets the highlight glide back to its resting
// top-left position via the registered-property transition.
function release() {
  if (!active) return;
  active.removeAttribute('data-glass-active');
  active.style.removeProperty('--gx');
  active.style.removeProperty('--gy');
  active = null;
}

export function installGlassPointer() {
  document.addEventListener(
    'pointerdown',
    (e) => {
      release();
      const el = (e.target as Element | null)?.closest<HTMLElement>(GLASS_SELECTOR);
      if (!el) return;
      active = el;
      el.setAttribute('data-glass-active', '');
      place(el, e);
    },
    { passive: true }
  );
  document.addEventListener('pointermove', (e) => active && place(active, e), { passive: true });
  // pointercancel fires when a touch turns into a scroll — drop the glow then too.
  document.addEventListener('pointerup', release, { passive: true });
  document.addEventListener('pointercancel', release, { passive: true });
}
