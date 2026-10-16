'use client';
import { useEffect, useRef } from 'react';

// Macro photo: scale-only zoom on scroll (no frames), smoothed with lerp.
export default function MacroZoom() {
  const track = useRef<HTMLElement>(null);
  const img = useRef<HTMLDivElement>(null);
  const txt = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = track.current!, el = img.current!, tx = txt.current!;
    let target = 0, cur = 0, visible = false, raf = 0, last = performance.now();
    const p = () => {
      const r = t.getBoundingClientRect(), total = t.offsetHeight - window.innerHeight;
      return total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 0;
    };
    const onScroll = () => { target = p(); };
    const apply = () => {
      el.style.transform = `scale(${1 + cur * 0.9})`;                    // 1.0 -> 1.9
      const o = Math.min(1, Math.max(0, (cur - 0.1) / 0.25)) * (1 - Math.min(1, Math.max(0, (cur - 0.85) / 0.15)));
      tx.style.opacity = String(o); tx.style.transform = `translateY(${(1 - o) * 24}px)`;
    };
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(0.1, (now - last) / 1000); last = now;
      if (!visible) return;
      cur += (target - cur) * (1 - Math.pow(1 - 0.1, dt * 60));
      if (Math.abs(target - cur) < 0.0005) cur = target;
      apply();
    };
    const io = new IntersectionObserver((e) => { visible = e[0].isIntersecting; if (visible) { onScroll(); cur = target; apply(); } });
    io.observe(t); onScroll(); apply();
    window.addEventListener('scroll', onScroll, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); io.disconnect(); window.removeEventListener('scroll', onScroll); };
  }, []);

  return (
    <section ref={track} className="macro" id="detail">
      <div className="seq-stage">
        <div ref={img} className="macro-img">
          <picture>
            <source media="(max-width: 900px)" srcSet="/macro/macro-900.webp" />
            <source media="(max-width: 1600px)" srcSet="/macro/macro-1600.webp" />
            <img src="/macro/macro-2400.webp" alt="Macro view of the Rosso Spider front end" draggable={false} />
          </picture>
        </div>
        <div className="macro-dim" />
        <div className="seq-shade" />
        <div className="macro-title"><small>Rosso Spider</small><h2 className="big">Rosso<br /><span>Detail</span></h2></div>
        <div ref={txt} className="macro-copy">
          <p>Matte paint, carbon inserts and yellow accents: every detail is assembled by hand.</p>
        </div>
      </div>
    </section>
  );
}
