'use client';
import { useEffect, useMemo, useState } from 'react';
import Header from '@/components/Header';
import Preloader from '@/components/Preloader';
import FrameSequence, { Scene } from '@/components/FrameSequence';
import MacroZoom from '@/components/MacroZoom';
import Footer from '@/components/Footer';
import CountUp from '@/components/CountUp';
import Reveal from '@/components/Reveal';
import TextBlock from '@/components/TextBlock';
import PinSection from '@/components/PinSection';
import ScrollTop from '@/components/ScrollTop';
import { useI18n } from '@/lib/i18n';
import { SmoothScroll, gsap, initMagnet, registerZone, ScrollTrigger, useScrollReady, useStaticMode } from '@/lib/scroll';

const Cap = ({ k, h, p, cta }: { k: string; h: string; p: string; cta?: string }) => (
  <div className="cap">
    <b>{k}</b><h3>{h}</h3><p>{p}</p>
    {cta && <a className="more" href="#detail">{cta} <span className="arr">→</span></a>}
  </div>
);

export default function Page() {
  const [pct, setPct] = useState(0);
  // restored scroll position far from the hero: don't hold the page behind the preloader
  const staticMode = useStaticMode();
  useEffect(() => { if (window.scrollY > 300 || staticMode) setPct(100); }, [staticMode]);   // the static page loads no frame sequence, nothing to wait for
  return (
    <>
      <Preloader pct={pct} />
      <Header />
      <ScrollTop />
      <SmoothScroll><Content onLoadProgress={(v) => setPct((p) => Math.max(p, v))} /></SmoothScroll>
    </>
  );
}

function Content({ onLoadProgress }: { onLoadProgress: (v: number) => void }) {
  const ready = useScrollReady();
  const { t } = useI18n();
  // a block that is being covered by the next one darkens (scrubbed, so it follows the scroll exactly)
  useEffect(() => {
    if (!ready) return;
    // A block darkens while the next one slides over it. Stateless: the amount is recomputed every frame from where the next block is on the
    // screen, so it can never stay stuck (e.g. after scrolling back up) the way tween state can.
    const coverEl = (s: HTMLElement) => (s.matches('.seq,.macro') ? s.querySelector<HTMLElement>('.seq-stage') : s);
    const slides = [...document.querySelectorAll<HTMLElement>('[data-slide]')];
    const pairs = slides.slice(1).map((cur, i) => ({ prev: coverEl(slides[i]), probe: cur.closest<HTMLElement>('.pin-spacer') ?? cur, last: -1 }));
    const tick = () => {
      const vh = window.innerHeight;
      for (const p of pairs) {
        if (!p.prev) continue;
        const v = Math.round(Math.max(0, Math.min(1, 1 - p.probe.getBoundingClientRect().top / vh)) * 100) / 100;
        if (v !== p.last) { p.last = v; p.prev.style.setProperty('--cover', String(v)); }
      }
    };
    gsap.ticker.add(tick);
    const ctx = { revert: () => { gsap.ticker.remove(tick); pairs.forEach((p) => p.prev?.style.removeProperty('--cover')); } };
    // the footer is not pinned: a free zone from the moment it fills the screen to the end of the page
    const cleanups = ['#contact'].map((sel) => {
      const el = document.querySelector<HTMLElement>(sel)!;
      const st = ScrollTrigger.create({ trigger: el, start: 'top top', invalidateOnRefresh: true });
      const unreg = registerZone({ a: () => st.start, b: () => Math.min(ScrollTrigger.maxScroll(window), st.start + Math.max(0, el.offsetHeight - window.innerHeight)) });
      return () => { st.kill(); unreg(); };
    });
    const magnet = initMagnet();
    return () => { ctx.revert(); cleanups.forEach((c) => c()); magnet(); };
  }, [ready]);

  const orbitScenes: Scene[] = useMemo(() => [
    { from: 0, to: 0.24, node: <Cap k={t('o1k')} h={t('o1h')} p={t('o1p')} cta={t('o1c')} /> },
    { from: 0.24, to: 0.4, side: 'end', node: <Cap k={t('o2k')} h={t('o2h')} p={t('o2p')} /> },
    { from: 0.4, to: 0.82, node: <Cap k={t('o3k')} h={t('o3h')} p={t('o3p')} /> },
    { from: 0.82, to: 1.01, side: 'end', node: <Cap k={t('o4k')} h={t('o4h')} p={t('o4p')} /> },
  ], [t]);
  const topScenes: Scene[] = useMemo(() => [
    { from: 0, to: 0.34, node: <Cap k={t('t1k')} h={t('t1h')} p={t('t1p')} cta={t('t1c')} /> },
    { from: 0.34, to: 0.68, side: 'end', node: <Cap k={t('t2k')} h={t('t2h')} p={t('t2p')} /> },
    { from: 0.68, to: 1.01, node: <Cap k={t('t3k')} h={t('t3h')} p={t('t3p')} /> },
  ], [t]);

  return (
    <main id="top">
      <FrameSequence
        name="orbit" count={180} vh={450} covered eager scenes={orbitScenes} onLoadProgress={onLoadProgress}
        title={<><div className="lot">{t('lot')}</div><h1>Rosso<br /><span>Spider</span></h1><div className="price">{t('price')}<small>{t('price_note')}</small></div></>}
      />

      {/* each group: the text block slides up over the pinned section above, then the next image section rides up over the text block */}
      <div className="grp over" style={{ zIndex: 1 }}>
        <TextBlock
          id="exterior" k={t('b1k')} h1={t('b1h1')} h2={t('b1h2')} paras={[t('b1p1'), t('b1p2'), t('b1p3')]}
          stats={[[<CountUp key="a" to={360} suffix="°" />, t('b1s1')], [<CountUp key="b" to={4} />, t('b1s2')], [<CountUp key="c" to={180} />, t('b1s3')]]}
        />
        <FrameSequence
          id="design" rise covered name="top" count={180} vh={350} scenes={topScenes}
          title={<><div className="lot">Rosso Spider</div><h2 className="big">Rosso<br /><span>{t('word_design')}</span></h2></>}
        />
      </div>

      <div className="grp over" style={{ zIndex: 2 }}>
        <TextBlock
          k={t('b2k')} h1={t('b2h1')} h2={t('b2h2')} paras={[t('b2p1'), t('b2p2')]}
          stats={[[<CountUp key="a" to={2} />, t('b2s1')], [<CountUp key="b" to={100} suffix="%" />, t('b2s2')], [<CountUp key="c" to={12} />, t('b2s3')]]}
        />
        <MacroZoom covered />
      </div>

      <div className="grp over" style={{ zIndex: 3 }}>
        <TextBlock k={t('b3k')} h1={t('b3h1')} h2={t('b3h2')} paras={[t('b3p1'), t('b3p2')]} />
        <PinSection id="numbers" className="specs rise" fit=".specs-in">
          <div className="specs-in" aria-label={t('sp_label')}>
          <Reveal><small>{t('sp_k')}</small></Reveal>
          <Reveal delay={80}><h2>{t('sp_h1')}<br /><span>{t('sp_h2')}</span></h2></Reveal>
          <div className="specs-grid">
            <Reveal delay={120}><div className="spec"><b><CountUp to={780} /></b><span>{t('sp_l1')}</span></div></Reveal>
            <Reveal delay={200}><div className="spec"><b><CountUp to={2.5} decimals={1} /></b><span>{t('sp_l2')}</span></div></Reveal>
            <Reveal delay={280}><div className="spec"><b><CountUp to={340} /></b><span>{t('sp_l3')}</span></div></Reveal>
            <Reveal delay={360}><div className="spec"><b><CountUp to={1} /> / <CountUp to={1} /></b><span>{t('sp_l4')}</span></div></Reveal>
          </div>
          <Reveal delay={200}><p className="specs-note">{t('sp_note')}</p></Reveal>
          </div>
        </PinSection>


        <PinSection id="provenance" className="split rise" fit=".split-copy">
          <div className="split-img">
            <picture>
              <source media="(max-width: 900px)" srcSet="/macro/macro-900.webp" />
              <img src="/macro/macro-1600.webp" alt="" />
            </picture>
          </div>
          <div className="split-copy">
            <Reveal><small>{t('pv_k')}</small></Reveal>
            <Reveal delay={80}><h2>{t('pv_h1')}<br /><span>{t('pv_h2')}</span></h2></Reveal>
            <Reveal delay={160}><p>{t('pv_p1')}</p></Reveal>
            <Reveal delay={240}><p>{t('pv_p2')}</p></Reveal>
            <Reveal delay={320}>
              <ul className="stats">
                <li><b><CountUp to={4120} /></b><span>{t('pv_l1')}</span></li>
                <li><b>#<CountUp to={157} /></b><span>{t('pv_l2')} <CountUp to={400} /></span></li>
                <li><b><CountUp to={2024} /></b><span>{t('pv_l3')}</span></li>
              </ul>
            </Reveal>
          </div>
        </PinSection>

        <Footer />
      </div>
    </main>
  );
}
