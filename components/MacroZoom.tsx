'use client';
import { useEffect, useRef } from 'react';
import { useI18n } from '@/lib/i18n';
import { gsap, HOLD, registerZone, ScrollTrigger, useScrollReady, useStaticMode } from '@/lib/scroll';

// Macro photo: scale-only zoom on scroll (no frames), one scrubbed GSAP timeline.
function AnimatedMacro({ covered }: { covered?: boolean }) {
  const { t } = useI18n();
  const ready = useScrollReady();
  const track = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const img = useRef<HTMLDivElement>(null);
  const txt = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ready) return;
    const trackEl = track.current!;
    const scrubLen = () => trackEl.offsetHeight - (covered ? 2 + HOLD / 100 : 1) * window.innerHeight;
    const pin = ScrollTrigger.create({ trigger: trackEl, start: 'top top', end: 'bottom bottom', pin: stage.current!, pinSpacing: false });
    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { trigger: trackEl, start: 'top top', end: () => `+=${Math.max(1, scrubLen())}`, scrub: true, invalidateOnRefresh: true },
    });
    tl.fromTo(img.current, { scale: 1 }, { scale: 1.9, duration: 1 }, 0)
      .fromTo(txt.current, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.2 }, 0.1)
      .to(txt.current, { autoAlpha: 0, duration: 0.15 }, 0.85);
    const unreg = registerZone({ a: () => tl.scrollTrigger!.start, b: () => (covered ? pin.end - window.innerHeight : tl.scrollTrigger!.end) });
    return () => { pin.kill(); tl.scrollTrigger?.kill(); tl.kill(); unreg(); };
  }, [ready, covered]);

  return (
    <section ref={track} className="macro rise" id="detail" data-slide="seq" {...(covered ? { 'data-covered': '' } : {})}>
      <div ref={stage} className="seq-stage">
        <div ref={img} className="macro-img">
          <picture>
            <source media="(max-width: 900px)" srcSet="/macro/macro-900.webp" />
            <source media="(max-width: 1600px)" srcSet="/macro/macro-1600.webp" />
            <img src="/macro/macro-2400.webp" alt={t('m_alt')} draggable={false} />
          </picture>
        </div>
        <div className="macro-dim" />
        <div className="seq-shade" />
        <div className="macro-title"><small>Rosso Spider</small><h2 className="big">Rosso<br /><span>{t('word_detail')}</span></h2></div>
        <div ref={txt} className="macro-copy">
          <p>{t('m_copy')}</p>
        </div>
      </div>
    </section>
  );
}

// Static page: the photo, a heading and the caption, no zoom.
function StaticMacro() {
  const { t } = useI18n();
  return (
    <section id="detail" className="macro-static" data-slide="seq">
      <div className="card-head"><small className="lot">Rosso Spider</small><h2 className="big">Rosso<br /><span>{t('word_detail')}</span></h2></div>
      <div className="card-img">
        <picture>
          <source media="(max-width: 900px)" srcSet="/macro/macro-900.webp" />
          <img src="/macro/macro-1600.webp" alt={t('m_alt')} loading="lazy" />
        </picture>
      </div>
      <div className="card-copy"><p>{t('m_copy')}</p></div>
    </section>
  );
}

export default function MacroZoom({ covered }: { covered?: boolean }) {
  const staticMode = useStaticMode();
  return staticMode ? <StaticMacro /> : <AnimatedMacro covered={covered} />;
}
