'use client';
import { ReactNode, useRef } from 'react';
import { usePinnedBlock } from '@/lib/pin';

// A pinned, screen-high section (numbers, provenance) that the next section rides over.
export default function PinSection({ id, className, fit, children }: { id: string; className: string; fit?: string; children: ReactNode }) {
  const el = useRef<HTMLElement>(null);
  usePinnedBlock(el, fit);
  return <section ref={el} id={id} className={className} data-slide="blk">{children}</section>;
}
