'use client';
import { FormEvent, useCallback, useState } from 'react';
import Modal from './Modal';

const NAV = [
  ['01', 'Overview', '#top'],
  ['02', 'Exterior', '#exterior'],
  ['03', 'Design', '#design'],
  ['04', 'Detail', '#detail'],
  ['05', 'Numbers', '#numbers'],
  ['06', 'Contact', '#contact'],
] as const;

const SEARCH_INDEX = [
  ['Rosso Spider — Lot 0001', '#top'],
  ['360° exterior view', '#exterior'],
  ['Top view and cabin', '#design'],
  ['Macro detail: headlight and carbon', '#detail'],
  ['Performance numbers', '#numbers'],
  ['Provenance and documents', '#provenance'],
  ['Contact the seller', '#contact'],
] as const;

type Which = null | 'menu' | 'search' | 'contact';

export default function Header() {
  const [open, setOpen] = useState<Which>(null);
  const [q, setQ] = useState('');
  const [sent, setSent] = useState(false);
  const close = useCallback(() => setOpen(null), []);

  const go = (hash: string) => {
    close();
    setTimeout(() => document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth' }), 120);
  };
  const results = SEARCH_INDEX.filter(([t]) => t.toLowerCase().includes(q.trim().toLowerCase()));
  const submit = (e: FormEvent) => { e.preventDefault(); setSent(true); };

  return (
    <>
      <header className="hdr">
        <div className="hdr-l">
          <a href="#top" className="logo">rosso<br />garage</a>
          <button className="icon" aria-label="Open menu" onClick={() => setOpen('menu')}>
            <svg width="18" height="12" viewBox="0 0 18 12"><path d="M0 1h18M0 6h18M0 11h18" stroke="currentColor" strokeWidth="1.2" /></svg>
          </button>
        </div>
        <div className="hdr-r">
          <span className="lang">ENG ⌄</span>
          <button className="icon" aria-label="Search" onClick={() => { setQ(''); setOpen('search'); }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2" /><path d="M11 11l4 4" stroke="currentColor" strokeWidth="1.2" /></svg>
          </button>
          <button className="btn" onClick={() => { setSent(false); setOpen('contact'); }}>Contact Seller</button>
        </div>
      </header>

      <Modal open={open === 'menu'} onClose={close} label="Menu" variant="full">
        <nav className="menu">
          {NAV.map(([n, t, h]) => (
            <a key={h} href={h} onClick={(e) => { e.preventDefault(); go(h); }}><i>{n}</i><span>{t}</span></a>
          ))}
          <p className="menu-foot">Lot 0001 · Rosso Spider · hello@example.com</p>
        </nav>
      </Modal>

      <Modal open={open === 'search'} onClose={close} label="Search">
        <div className="srch">
          <small>Search</small>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search the lot…" aria-label="Search the lot" />
          <ul>
            {results.map(([t, h]) => <li key={h}><a href={h} onClick={(e) => { e.preventDefault(); go(h); }}>{t} <span>→</span></a></li>)}
            {!results.length && <li className="empty">Nothing found for “{q}”.</li>}
          </ul>
        </div>
      </Modal>

      <Modal open={open === 'contact'} onClose={close} label="Contact seller">
        {sent ? (
          <div className="form-done">
            <small>Thank you</small>
            <h3>Request sent.</h3>
            <p>Our team will reply within one business day. This is a demo form: nothing is actually sent.</p>
            <button className="btn" onClick={close}>Close</button>
          </div>
        ) : (
          <form className="form" onSubmit={submit}>
            <small>Lot 0001 — Rosso Spider</small>
            <h3>Contact the seller</h3>
            <label>Name<input required name="name" autoComplete="name" /></label>
            <label>Email<input required type="email" name="email" autoComplete="email" /></label>
            <label>Message<textarea name="msg" rows={4} defaultValue="I would like to know more about this lot." /></label>
            <button className="btn solid" type="submit">Send request →</button>
          </form>
        )}
      </Modal>
    </>
  );
}
