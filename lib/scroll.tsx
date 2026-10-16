'use client';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollSmoother } from 'gsap/ScrollSmoother';

if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

/** Pause (in screens, 100 = one screen) at the end of a block before the next one starts to slide over it. Keep in sync with --hold in globals.css. */
export const HOLD = 60;

export const prefersReducedMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Children create their ScrollTriggers only after the smoother exists (GSAP requires that order).
const Ready = createContext(false);
export const useScrollReady = () => useContext(Ready);

/** Wrap the page content (not fixed UI like the header or modals). */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // one source of truth for "a screen": the same number the ScrollTriggers use (innerHeight). Updated on width change or a big height change,
    // not on the small changes of the phone's address bar, which would make everything jump.
    // --vh only ever grows while the width stays the same, so a screen-high block can never be shorter than the visible area
    // (that left a strip of the block underneath showing) when the phone's address bar hides and the visible height grows.
    let w = window.innerWidth, vhPx = 0;
    const setVh = () => {
      if (window.innerWidth !== w) { w = window.innerWidth; vhPx = 0; }
      vhPx = Math.max(vhPx, window.innerHeight);
      document.documentElement.style.setProperty('--vh', `${vhPx}px`);
    };
    setVh();
    const onResize = () => setVh();
    window.addEventListener('resize', onResize);
    ScrollTrigger.addEventListener('refreshInit', setVh);   // re-measure on every refresh, resize events are not reliable on phones
    ScrollTrigger.config({ ignoreMobileResize: true });
    const sm = ScrollSmoother.create({
      wrapper: '#smooth-wrapper',
      content: '#smooth-content',
      smooth: prefersReducedMotion() ? 0 : 1.15,   // seconds the content takes to catch up with the native scroll
      effects: false,
    });
    setReady(true);
    const refresh = () => ScrollTrigger.refresh();
    document.fonts?.ready.then(refresh);
    window.addEventListener('load', refresh);
    return () => { window.removeEventListener('load', refresh); window.removeEventListener('resize', onResize); ScrollTrigger.removeEventListener('refreshInit', setVh); sm.kill(); };
  }, []);

  return (
    <Ready.Provider value={ready}>
      <div id="smooth-wrapper"><div id="smooth-content">{children}</div></div>
    </Ready.Provider>
  );
}

/** Pause/resume scrolling (modals). */
export function lockScroll(lock: boolean) {
  ScrollSmoother.get()?.paused(lock);
  document.body.style.overflow = lock ? 'hidden' : '';
}

/** Re-measure all triggers (after the language, and with it the text height, changes). */
export function refreshScroll() { ScrollTrigger.refresh(); }

/** Glide to the section that contains `hash` (menu and search links). */
export function goToSection(hash: string) {
  const sm = ScrollSmoother.get();
  if (!sm) return;
  if (hash === '#top') { sm.scrollTo(0, true); return; }
  const el = document.querySelector<HTMLElement>(hash);
  const slide = el?.closest<HTMLElement>('[data-slide]') ?? el?.querySelector<HTMLElement>('[data-slide]') ?? el;
  if (!slide) return;
  const ref = slide.dataset.slide === 'tb' ? slide.closest<HTMLElement>('.grp') ?? slide : slide;   // a pinned block is measured through its group
  sm.scrollTo(ref, true, 'top top');
}

export { gsap, ScrollTrigger, ScrollSmoother };


// ---------- "magnet": after scrolling stops between two blocks, pull the page to the block in the direction of travel ----------
// Every block registers its free-scroll zone [a, b] in scroll pixels (a scrubbed sequence, a pinned text block with its pause, a tall section).
// Inside a zone the page scrolls freely; outside any zone (while one block covers the other) the scroll snaps to the nearest zone edge ahead.
type Zone = { a: () => number; b: () => number };
const zones = new Set<Zone>();
const EPS = 3;

export function registerZone(z: Zone) { zones.add(z); return () => { zones.delete(z); }; }

function snapTarget(value: number, self?: ScrollTrigger) {
  const max = ScrollTrigger.maxScroll(window);
  if (max <= 0) return value;
  const y = value * max;
  const zs = [...zones].map((z) => [z.a(), Math.max(z.a(), z.b())] as [number, number]).sort((p, q) => p[0] - q[0]);
  if (zs.some(([a, b]) => y >= a - EPS && y <= b + EPS)) return value;     // inside a block's own zone: free scroll
  const pts = [...new Set(zs.flatMap(([a, b]) => [a, b]).map((v) => Math.min(max, Math.round(v))))].sort((p, q) => p - q);
  if (!pts.length) return value;
  const dir = self?.direction ?? 0;
  let t: number;
  if (dir > 0) t = pts.find((p) => p > y + EPS) ?? pts[pts.length - 1];
  else if (dir < 0) t = [...pts].reverse().find((p) => p < y - EPS) ?? pts[0];
  else t = pts.reduce((best, p) => (Math.abs(p - y) < Math.abs(best - y) ? p : best), pts[0]);
  return t / max;
}

export function initMagnet() {
  if (prefersReducedMotion()) return () => {};
  const st = ScrollTrigger.create({
    snap: {
      snapTo: (value: number, self?: ScrollTrigger) => snapTarget(value, self),
      delay: 0.12,                                  // seconds of stillness before the pull starts
      duration: { min: 0.3, max: 0.9 },
      ease: 'power2.inOut',
      inertia: false,
    },
  });
  return () => st.kill();
}
