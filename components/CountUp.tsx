'use client';
import { useEffect, useRef } from 'react';
import { gsap, prefersReducedMotion, ScrollTrigger, useScrollReady } from '@/lib/scroll';

type Props = { to: number; decimals?: number; prefix?: string; suffix?: string; duration?: number };

// Counts from 0 to `to` when scrolled into view (once), as a GSAP tween. Respects prefers-reduced-motion.
export default function CountUp({ to, decimals = 0, prefix = '', suffix = '', duration = 1.8 }: Props) {
  const ready = useScrollReady();
  const el = useRef<HTMLSpanElement>(null);
  const fmt = (v: number) => prefix + v.toFixed(decimals) + suffix;

  useEffect(() => {
    if (!ready) return;
    const node = el.current!;
    if (prefersReducedMotion()) { node.textContent = fmt(to); return; }
    const o = { v: 0 };
    const tween = gsap.to(o, {
      v: to, duration, ease: 'power3.out', paused: true,
      onStart: () => node.classList.add('counting'),
      onUpdate: () => { node.textContent = fmt(o.v); },
      onComplete: () => { node.textContent = fmt(to); node.classList.remove('counting'); node.classList.add('done'); },
    });
    const st = ScrollTrigger.create({ trigger: node, start: 'top 88%', once: true, onEnter: () => tween.play() });
    return () => { st.kill(); tween.kill(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, to, decimals, prefix, suffix, duration]);

  return <span ref={el} className="num">{fmt(0)}</span>;
}
