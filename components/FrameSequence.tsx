'use client';
import { ReactNode, useEffect, useRef, useState } from 'react';
import { gsap, HOLD, registerZone, ScrollTrigger, useScrollReady, useStaticMode } from '@/lib/scroll';

export type Scene = { from: number; to: number; node: ReactNode; side?: 'start' | 'end' };

type Props = {
  id?: string;
  rise?: boolean;             // rides over the previous (pinned) block
  covered?: boolean;          // the next block slides over this one, so its last screen is not scrub range
  name: 'orbit' | 'top';
  count: number;
  vh?: number;                // scrub length in screens
  scenes?: Scene[];
  title?: ReactNode;          // block shown top-left while the first scene is active
  eager?: boolean;            // load immediately (otherwise when near the viewport)
  onLoadProgress?: (pct: number) => void;
};

const DIM = 0.42;             // background darkening: black overlay alpha painted over each frame (cheaper than a CSS filter)
const tier = () => (window.innerWidth <= 900 ? 768 : window.innerWidth <= 1600 ? 1280 : 1920);

function AnimatedSequence({ id, rise, covered, name, count, vh = 400, scenes = [], title, eager, onLoadProgress }: Props) {
  const ready = useScrollReady();
  const track = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (!ready) return;
    const canvas = cv.current!, trackEl = track.current!, stageEl = stage.current!, ctx = canvas.getContext('2d')!;
    const dir = `/frames/${name}/${tier()}`;
    const imgs: (HTMLImageElement | null)[] = new Array(count).fill(null);
    let cssW = 0, cssH = 0, frame = 0, drawn = -1, visible = false, started = false, gen = 0, loaded = 0, activeIdx = 0;

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

    // ---- loading: start when the section is within one screen, free the decoded bitmaps when it is far away ----
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
    const unload = () => { if (!started) return; started = false; gen++; imgs.fill(null); drawn = -1; };

    // ---- GSAP: pin the stage for the whole track, scrub the frame index over the scrub length ----
    const scrubLen = () => trackEl.offsetHeight - (covered ? 2 + HOLD / 100 : 1) * window.innerHeight;
    const pin = ScrollTrigger.create({ trigger: trackEl, start: 'top top', end: 'bottom bottom', pin: stageEl, pinSpacing: false });
    const scrub = ScrollTrigger.create({
      trigger: trackEl, start: 'top top', end: () => `+=${Math.max(1, scrubLen())}`, invalidateOnRefresh: true,
      onUpdate: (self) => {
        frame = self.progress * (count - 1);
        const a = Math.max(0, scenes.findIndex((s) => self.progress >= s.from && self.progress < s.to));
        if (a !== activeIdx) { activeIdx = a; setActive(a); }
      },
    });
    // free zone: the scrubbed part plus the pause after it (until the next block starts to slide over)
    const unreg = registerZone({ a: () => scrub.start, b: () => (covered ? pin.end - window.innerHeight : scrub.end) });
    const tick = () => { if (!visible) return; const i = Math.round(frame); if (i !== drawn) draw(i); };
    gsap.ticker.add(tick);

    resize();
    const near = new IntersectionObserver((e) => { if (e[0].isIntersecting) load(); else unload(); }, { rootMargin: '100% 0px 100% 0px' });
    const vis = new IntersectionObserver((e) => { visible = e[0].isIntersecting; if (visible) drawn = -1; });
    near.observe(trackEl); vis.observe(trackEl);
    if (eager) load();
    const onResize = () => resize();
    window.addEventListener('resize', onResize);
    return () => {
      gsap.ticker.remove(tick); near.disconnect(); vis.disconnect(); pin.kill(); scrub.kill(); unreg();
      window.removeEventListener('resize', onResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, name, count]);

  return (
    <section ref={track} id={id} className={`seq ${rise ? 'rise' : ''}`} style={{ height: `calc(var(--vh) * ${(vh + (covered ? 100 + HOLD : 0)) / 100})` }} data-slide="seq" {...(covered ? { 'data-covered': '' } : {})}>
      <div ref={stage} className="seq-stage">
        <canvas ref={cv} className="seq-canvas" />
        <div className="seq-glow" />
        <div className="seq-shade" />
        {title && <div className="seq-title" style={{ opacity: active === 0 ? 1 : 0 }}>{title}</div>}
        {scenes.map((s, i) => (
          <div key={i} className={`scene ${s.side === 'end' ? 'end' : ''} ${i === active ? 'on' : ''}`}>{s.node}</div>
        ))}
        <div className="hud">
          <span>{String(active + 1).padStart(2, '0')}</span>
          <i className="hud-line" />
          <span>{String(scenes.length).padStart(2, '0')}</span>
        </div>
      </div>
    </section>
  );
}

// Static page (phones, reduced motion): one still image per scene, with its caption. No canvas, no scrubbing.
const stillFor = (name: string, count: number, s: Scene, first: boolean) => {
  const mid = Math.min(1, (s.from + Math.min(s.to, 1)) / 2);
  const n = first ? 1 : Math.max(1, Math.min(count, Math.round(mid * (count - 1)) + 1));
  return `/frames/${name}/768/frame_${String(n).padStart(4, '0')}.webp`;
};

function StaticSequence({ id, name, count, scenes = [], title }: Props) {
  return (
    <section id={id} className="cards" data-slide="seq">
      {scenes.map((s, i) => (
        <article key={i} className="card">
          {i === 0 && title && <div className="card-head">{title}</div>}
          <div className="card-img"><img src={stillFor(name, count, s, i === 0)} alt="" loading={i === 0 ? 'eager' : 'lazy'} width={768} height={432} /></div>
          <div className="card-copy">{s.node}</div>
        </article>
      ))}
    </section>
  );
}

export default function FrameSequence(props: Props) {
  const staticMode = useStaticMode();
  return staticMode ? <StaticSequence {...props} /> : <AnimatedSequence {...props} />;
}
