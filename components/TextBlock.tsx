'use client';
import { ReactNode, useRef } from 'react';
import Reveal from './Reveal';
import { usePinnedBlock } from '@/lib/pin';

type Stat = [ReactNode, string];

// Text block pinned by ScrollTrigger until its group ends; the next section rides up over it.
// If the block is taller than the screen it is pinned when its bottom edge reaches the bottom of the screen, so all of it can be read.
export default function TextBlock({ id, k, h1, h2, paras, stats }: { id?: string; k: string; h1: string; h2: string; paras: string[]; stats?: Stat[] }) {
  const el = useRef<HTMLElement>(null);

  usePinnedBlock(el, '.tb-in');

  return (
    <section ref={el} id={id} className="tb" data-slide="tb">
      <div className="tb-in">
        <Reveal><small>{k}</small></Reveal>
        <div>
          <Reveal delay={80}><h2>{h1}<br /><span>{h2}</span></h2></Reveal>
          {paras.map((p, i) => <Reveal key={i} delay={160 + i * 90}><p>{p}</p></Reveal>)}
          {stats && (
            <Reveal delay={320}>
              <div className="tb-stats">{stats.map(([b, s]) => <div key={s}><b>{b}</b><span>{s}</span></div>)}</div>
            </Reveal>
          )}
        </div>
      </div>
    </section>
  );
}
