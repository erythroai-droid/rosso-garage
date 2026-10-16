'use client';
import { RefObject, useEffect } from 'react';
import { registerZone, ScrollTrigger, useScrollReady } from './scroll';

/**
 * A screen-high block that is pinned (by ScrollTrigger) until its group ends, so the next block of the group can ride up over it.
 * - fit: if the content selected by `fitSelector` is taller than the screen, it is scaled down (CSS zoom) so the block is never taller than a screen
 * - zone: registers the block's free-scroll zone for the magnet (from "fills the screen" to "the next block starts to arrive", pause included)
 */
export function usePinnedBlock(ref: RefObject<HTMLElement | null>, fitSelector?: string) {
  const ready = useScrollReady();
  useEffect(() => {
    if (!ready) return;
    const node = ref.current!;
    const grp = node.closest<HTMLElement>('.grp');
    if (!grp) return;
    const inner = fitSelector ? node.querySelector<HTMLElement>(fitSelector) : null;
    const nextRider = node.nextElementSibling instanceof HTMLElement && node.nextElementSibling.classList.contains('rise') ? node.nextElementSibling : null;

    const fit = () => {
      if (!inner) return;
      node.style.setProperty('--fit', '1');
      const cs = getComputedStyle(node);
      const room = window.innerHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
      const need = inner.offsetHeight;
      node.style.setProperty('--fit', need > room ? String(Math.max(0.5, room / need)) : '1');
    };
    fit();
    ScrollTrigger.addEventListener('refreshInit', fit);

    const st = ScrollTrigger.create({
      trigger: node,
      start: () => (node.offsetHeight > window.innerHeight ? 'bottom bottom' : 'top top'),
      endTrigger: grp, end: 'bottom bottom',
      pin: true, pinSpacing: false, invalidateOnRefresh: true,
    });
    const arrive = nextRider ? ScrollTrigger.create({ trigger: nextRider, start: 'top bottom', invalidateOnRefresh: true }) : null;
    const unreg = registerZone({ a: () => st.start, b: () => (arrive ? arrive.start : st.start) });
    return () => { st.kill(); arrive?.kill(); unreg(); ScrollTrigger.removeEventListener('refreshInit', fit); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);
}
