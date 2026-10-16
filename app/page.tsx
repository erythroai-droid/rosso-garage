'use client';
import { ReactNode, useEffect, useState } from 'react';
import Header from '@/components/Header';
import Preloader from '@/components/Preloader';
import FrameSequence, { Scene } from '@/components/FrameSequence';
import MacroZoom from '@/components/MacroZoom';
import Footer from '@/components/Footer';
import CountUp from '@/components/CountUp';
import Reveal from '@/components/Reveal';

const Cap = ({ k, h, p, cta }: { k: string; h: string; p: string; cta?: string }) => (
  <div className="cap">
    <b>{k}</b><h3>{h}</h3><p>{p}</p>
    {cta && <a className="more" href="#detail">{cta} <span>→</span></a>}
  </div>
);

type Stat = [ReactNode, string];
// `over`: the block slides up over the pinned last frame of the previous image section
const TextBlock = ({ id, k, h, paras, stats, over }: { id?: string; k: string; h: ReactNode; paras: string[]; stats?: Stat[]; over?: boolean }) => (
  <section id={id} className={`tb ${over ? 'over' : ''}`}>
    <div className="tb-in">
      <Reveal><small>{k}</small></Reveal>
      <div>
        <Reveal delay={80}><h2>{h}</h2></Reveal>
        {paras.map((t, i) => <Reveal key={i} delay={160 + i * 90}><p>{t}</p></Reveal>)}
        {stats && (
          <Reveal delay={320}>
            <div className="tb-stats">{stats.map(([b, s]) => <div key={s}><b>{b}</b><span>{s}</span></div>)}</div>
          </Reveal>
        )}
      </div>
    </div>
  </section>
);

const orbitScenes: Scene[] = [
  { from: 0, to: 0.24, node: <Cap k="Front" h="A family of extreme performance cars" p="Low stance, yellow accents on the hood and slim LED headlights." cta="Discover more" /> },
  { from: 0.24, to: 0.4, side: 'right', node: <Cap k="Side" h="Clean profile" p="Black wheels with a yellow rim line and an open top underline the proportions." /> },
  { from: 0.4, to: 0.82, node: <Cap k="Rear" h="Wing and exhaust" p="Black rear wing, diffuser and a twin exhaust." /> },
  { from: 0.82, to: 1.01, side: 'right', node: <Cap k="Full circle" h="Back to the start" p="Scroll up to turn the car back." /> },
];
const topScenes: Scene[] = [
  { from: 0, to: 0.34, node: <Cap k="Top" h="A new generation of cabin styling." p="Strict symmetry: matte body, yellow air intakes, open cabin." cta="Discover the detail" /> },
  { from: 0.34, to: 0.68, side: 'right', node: <Cap k="Cockpit" h="Open cabin" p="Carbon seats with yellow stitching and a low windscreen header." /> },
  { from: 0.68, to: 1.01, node: <Cap k="Hood" h="Yellow accents" p="The camera moves in: hood vents and matte paint." /> },
];

export default function Page() {
  const [pct, setPct] = useState(0);
  // restored scroll position far from the hero: don't hold the page behind the preloader
  useEffect(() => { if (window.scrollY > 300) setPct(100); }, []);
  return (
    <main id="top">
      <Preloader pct={pct} />
      <Header />

      <FrameSequence
        name="orbit" count={180} vh={450} eager scenes={orbitScenes} onLoadProgress={(v) => setPct((p) => Math.max(p, v))}
        title={<><div className="lot">LOT 0001</div><h1>Rosso<br /><span>Spider</span></h1><div className="price">Price on request<small>inclusive of applicable buyer&apos;s fee</small></div></>}
      />

      <TextBlock
        id="exterior" over
        k="01 — Exterior"
        h={<>A shape you can read<br /><span>from every side.</span></>}
        paras={[
          'A low silhouette, a long hood and an open top are drawn in a single line, from the slim LED headlights to the black rear wing. The matte paint does not glare, so the form stays readable even in the half-light of the studio.',
          'Yellow hood vents, a yellow line on the black wheels and carbon inserts are the only contrast against the deep red. Everything else is pure geometry.',
          'Demo text and figures: replace them with the real data of the car.',
        ]}
        stats={[
          [<CountUp key="a" to={360} suffix="°" />, 'view'],
          [<CountUp key="b" to={4} />, 'angles'],
          [<CountUp key="c" to={180} />, 'frames'],
        ]}
      />

      <FrameSequence
        id="design" name="top" count={180} vh={350} scenes={topScenes}
        title={<><div className="lot">Rosso Spider</div><h2 className="big">Rosso<br /><span>Design</span></h2></>}
      />

      <TextBlock
        over
        k="02 — Cabin"
        h={<>A cabin built<br /><span>around the driver.</span></>}
        paras={[
          'From above you can see how the space is organised: two carbon bucket seats, a low windscreen header and a steering wheel placed at the centre of the composition. Nothing extra, every panel in its place.',
          'Yellow stitching on the seats repeats the accents of the body, and the open top leaves the driver alone with the road. Next, the camera moves in on the details.',
        ]}
        stats={[
          [<CountUp key="a" to={2} />, 'seats'],
          [<CountUp key="b" to={100} suffix="%" />, 'hand assembled'],
          [<CountUp key="c" to={12} />, 'paint layers'],
        ]}
      />

      <MacroZoom />

      <TextBlock
        over
        k="03 — Detail"
        h={<>Small things that<br /><span>build the character.</span></>}
        paras={[
          'A headlight with three light lines, a carbon air duct, a hexagonal radiator mesh and a yellow blade in the bumper. In the macro view you can see how the matte paint kills reflections and highlights the relief.',
          'Details, documents and photographs of the lot are below.',
        ]}
      />

      <section id="numbers" className="specs" aria-label="Specifications">
        <Reveal><small>LOT 0001 — NUMBERS</small></Reveal>
        <Reveal delay={80}><h2>Numbers that<br /><span>speak for themselves.</span></h2></Reveal>
        <div className="specs-grid">
          <Reveal delay={120}><div className="spec"><b><CountUp to={780} /></b><span>horsepower</span></div></Reveal>
          <Reveal delay={200}><div className="spec"><b><CountUp to={2.5} decimals={1} /></b><span>0–100 km/h, s</span></div></Reveal>
          <Reveal delay={280}><div className="spec"><b><CountUp to={340} /></b><span>top speed, km/h</span></div></Reveal>
          <Reveal delay={360}><div className="spec"><b><CountUp to={1} /> / <CountUp to={1} /></b><span>one of a kind</span></div></Reveal>
        </div>
        <Reveal delay={200}><p className="specs-note">Demo values: replace them with the data of the car.</p></Reveal>
      </section>

      <section id="provenance" className="split">
        <div className="split-img">
          <picture>
            <source media="(max-width: 900px)" srcSet="/macro/macro-900.webp" />
            <img src="/macro/macro-1600.webp" alt="" />
          </picture>
        </div>
        <div className="split-copy">
          <Reveal><small>LOT 0001 — PROVENANCE</small></Reveal>
          <Reveal delay={80}><h2>One of a kind.<br /><span>Handled with care.</span></h2></Reveal>
          <Reveal delay={160}><p>The lot has been inspected and photographed by our team. We check the body, the cabin, the documents and the ownership history, and publish only what is confirmed.</p></Reveal>
          <Reveal delay={240}><p>Demo text: replace it with the real data about the car, its ownership history and documents.</p></Reveal>
          <Reveal delay={320}>
            <ul className="stats">
              <li><b><CountUp to={4120} /></b><span>km, odometer</span></li>
              <li><b>#<CountUp to={157} /></b><span>of <CountUp to={400} /></span></li>
              <li><b><CountUp to={2024} /></b><span>certified</span></li>
            </ul>
          </Reveal>
        </div>
      </section>

      <Footer />
    </main>
  );
}
