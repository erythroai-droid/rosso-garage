'use client';
import { ReactNode, useEffect, useRef } from 'react';

// Fade/slide-in when the block enters the viewport (once).
export default function Reveal({ children, delay = 0, className = '' }: { children: ReactNode; delay?: number; className?: string }) {
  const el = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = el.current!;
    const io = new IntersectionObserver((e) => {
      if (e[0].isIntersecting) { node.classList.add('in'); io.disconnect(); }
    }, { threshold: 0.15 });
    io.observe(node);
    return () => io.disconnect();
  }, []);
  return <div ref={el} className={`rv ${className}`} style={{ transitionDelay: `${delay}ms` }}>{children}</div>;
}
