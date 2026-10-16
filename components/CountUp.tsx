'use client';
import { useEffect, useRef } from 'react';

type Props = { to: number; decimals?: number; prefix?: string; suffix?: string; duration?: number };

// Counts from 0 to `to` when scrolled into view (once). Respects prefers-reduced-motion.
export default function CountUp({ to, decimals = 0, prefix = '', suffix = '', duration = 1800 }: Props) {
  const el = useRef<HTMLSpanElement>(null);
  const fmt = (v: number) => prefix + v.toFixed(decimals) + suffix;

  useEffect(() => {
    const node = el.current!;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { node.textContent = fmt(to); return; }
    let raf = 0, done = false;
    const run = () => {
      node.classList.add('counting');
      const t0 = performance.now();
      const step = (now: number) => {
        const k = Math.min(1, Math.max(0, (now - t0) / duration));   // rAF timestamp can precede t0
        node.textContent = fmt(to * (1 - Math.pow(1 - k, 3)));      // easeOutCubic
        if (k < 1) raf = requestAnimationFrame(step);
        else { node.classList.remove('counting'); node.classList.add('done'); }
      };
      raf = requestAnimationFrame(step);
    };
    const io = new IntersectionObserver((e) => {
      if (e[0].isIntersecting && !done) { done = true; run(); }
    }, { threshold: 0.4 });
    io.observe(node);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [to, decimals, prefix, suffix, duration]);

  return <span ref={el} className="num">{fmt(0)}</span>;
}
