'use client';
import { ReactNode, useEffect, useRef, useState } from 'react';

export type Scene = { from: number; to: number; node: ReactNode; side?: 'left' | 'right' };

type Props = {
  id?: string;
  name: 'orbit' | 'top';
  count: number;
  vh?: number;               // scroll length of the section in vh
  scenes?: Scene[];
  title?: ReactNode;         // block shown top-left while the first scene is active
  eager?: boolean;           // load immediately (otherwise when near the viewport)
  onLoadProgress?: (pct: number) => void;
};

const LERP = 0.1;
const DIM = 0.50;           // background darkening: black overlay alpha painted over each frame (cheaper than CSS filter)
const tier = () => (window.innerWidth <= 900 ? 768 : window.innerWidth <= 1600 ? 1280 : 1920);

export default function FrameSequence({ id, name, count, vh = 400, scenes = [], title, eager, onLoadProgress }: Props) {
  const track = useRef<HTMLElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  const bar = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const canvas = cv.current!, trackEl = track.current!, ctx = canvas.getContext('2d')!;
    const dir = `/frames/${name}/${tier()}`;
    const imgs: (HTMLImageElement | null)[] = new Array(count).fill(null);
    let cssW = 0, cssH = 0, target = 0, current = 0, drawn = -1, visible = false, started = false, raf = 0, last = performance.now();
    let activeIdx = 0, loaded = 0;

    const ok = (i: number) => !!imgs[i] && imgs[i]!.naturalWidth > 0;
    const nearest = (i: number) => {
      for (let d = 0; d < count; d++) {
        if (i - d >= 0 && ok(i - d)) return i - d;
        if (i + d < count && ok(i + d)) return i + d;
      }
      return -1;
    };
    const draw = (i: number) => {
      const j = nearest(Math.max(0, Math.min(count - 1, i)));
      if (j < 0) return;
      const im = imgs[j]!;
      const sx = cssW / im.naturalWidth, sy = cssH / im.naturalHeight;
      const s = cssW / cssH >= 1.5 ? Math.max(sx, sy) : Math.min(sx, sy);   // wide: cover, tall: contain
      const dw = im.naturalWidth * s, dh = im.naturalHeight * s;
      ctx.fillStyle = '#07080b'; ctx.fillRect(0, 0, cssW, cssH);
      ctx.drawImage(im, (cssW - dw) / 2, (cssH - dh) / 2, dw, dh);
      ctx.fillStyle = `rgba(0,0,0,${DIM})`; ctx.fillRect(0, 0, cssW, cssH);
      drawn = j === i ? i : -1;   // keep retrying until the exact frame has arrived
    };
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      cssW = canvas.clientWidth; cssH = canvas.clientHeight;
      canvas.width = Math.round(cssW * dpr); canvas.height = Math.round(cssH * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.imageSmoothingQuality = 'high';
      drawn = -1;
    };
    const progress = () => {
      const r = trackEl.getBoundingClientRect(), total = trackEl.offsetHeight - window.innerHeight;
      return total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 0;
    };
    const onScroll = () => {
      const p = progress();
      target = p * (count - 1);
      if (bar.current) bar.current.style.height = p * 100 + '%';
      const a = Math.max(0, scenes.findIndex((s) => p >= s.from && p < s.to));
      if (a !== activeIdx) { activeIdx = a; setActive(a); }
    };
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(0.1, (now - last) / 1000); last = now;
      if (!visible) return;
      current += (target - current) * (1 - Math.pow(1 - LERP, dt * 60));
      if (Math.abs(target - current) < 0.01) current = target;
      const i = Math.round(current);
      if (i !== drawn) draw(i);
    };

    let gen = 0;
    const load = () => {
      if (started) return;
      started = true; loaded = 0;
      const g = ++gen;
      for (let i = 0; i < count; i++) {
        const im = new Image();
        im.decoding = 'async';
        const fin = () => { loaded++; if (g === 1) onLoadProgress?.(Math.round((loaded / count) * 100)); };   // preloader reflects the first load only
        im.onload = () => { if (g === gen) imgs[i] = im; fin(); };
        im.onerror = fin;                      // a broken frame must not block the page
        im.src = `${dir}/frame_${String(i + 1).padStart(4, '0')}.webp`;
      }
    };
    // free decoded frames when the section is far away (decoded bitmaps are ~4 MB each at 1280px)
    const unload = () => {
      if (!started) return;
      started = false; gen++;
      imgs.fill(null); drawn = -1;
    };

    resize(); onScroll();
    // start loading when the section is within 1.5 screens; draw only while it is on screen
    const near = new IntersectionObserver((e) => { if (e[0].isIntersecting) load(); else unload(); }, { rootMargin: '100% 0px 100% 0px' });
    const vis = new IntersectionObserver((e) => {
      visible = e[0].isIntersecting;
      if (visible) { onScroll(); current = target; drawn = -1; }
    });
    near.observe(trackEl); vis.observe(trackEl);
    if (eager) load();
    window.addEventListener('scroll', onScroll, { passive: true });
    const onResize = () => { resize(); onScroll(); };
    window.addEventListener('resize', onResize);
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf); near.disconnect(); vis.disconnect();
      window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, count]);

  return (
    <section ref={track} id={id} className="seq" style={{ height: `${vh}vh` }}>
      <div className="seq-stage">
        <canvas ref={cv} className="seq-canvas" />
        <div className="seq-glow" />
        <div className="seq-shade" />
        {title && <div className="seq-title" style={{ opacity: active === 0 ? 1 : 0 }}>{title}</div>}
        {scenes.map((s, i) => (
          <div key={i} className={`scene ${s.side === 'right' ? 'right' : ''} ${i === active ? 'on' : ''}`}>{s.node}</div>
        ))}
        <div className="hud">
          <span>{String(active + 1).padStart(2, '0')}</span>
          <i className="hud-line"><i ref={bar as React.RefObject<HTMLElement>} className="hud-fill" /></i>
          <span>{String(scenes.length).padStart(2, '0')}</span>
        </div>
      </div>
    </section>
  );
}
