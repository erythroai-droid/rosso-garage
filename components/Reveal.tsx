'use client';
import { ReactNode, useEffect, useRef } from 'react';
import { gsap, prefersReducedMotion, ScrollTrigger, useScrollReady } from '@/lib/scroll';

// Fade/slide-in when the block enters the viewport (once), driven by GSAP + ScrollTrigger.
export default function Reveal({ children, delay = 0, className = '' }: { children: ReactNode; delay?: number; className?: string }) {
  const ready = useScrollReady();
  const el = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ready) return;
    const node = el.current!;
    if (prefersReducedMotion()) { gsap.set(node, { autoAlpha: 1, y: 0 }); node.classList.add('in'); return; }
    const tween = gsap.fromTo(node, { autoAlpha: 0, y: 24 }, {
      autoAlpha: 1, y: 0, duration: 0.8, delay: (delay / 1000) * 0.5, ease: 'power3.out', paused: true,
      onStart: () => node.classList.add('in'),
    });
    const st = ScrollTrigger.create({ trigger: node, start: 'top 94%', once: true, onEnter: () => tween.play() });
    return () => { st.kill(); tween.kill(); };
  }, [ready, delay]);

  return <div ref={el} className={`rv ${className}`}>{children}</div>;
}
