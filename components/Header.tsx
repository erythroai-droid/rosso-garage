'use client';
import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import Modal from './Modal';
import { LANGS, useI18n } from '@/lib/i18n';
import Flag from './Flag';
import { goToSection, refreshScroll } from '@/lib/scroll';

const NAV = [
  ['01', 'nav_overview', '#top'],
  ['02', 'nav_exterior', '#exterior'],
  ['03', 'nav_design', '#design'],
  ['04', 'nav_detail', '#detail'],
  ['05', 'nav_numbers', '#numbers'],
  ['06', 'nav_contact', '#contact'],
] as const;

const SEARCH_INDEX = [
  ['s_lot', '#top'], ['s_ext', '#exterior'], ['s_top', '#design'], ['s_macro', '#detail'],
  ['s_num', '#numbers'], ['s_prov', '#provenance'], ['s_contact', '#contact'],
] as const;

type Which = null | 'menu' | 'search' | 'contact';

export default function Header() {
  const { t, lang, setLang } = useI18n();
  const [open, setOpen] = useState<Which>(null);
  const [langOpen, setLangOpen] = useState(false);
  const [q, setQ] = useState('');
  const [sent, setSent] = useState(false);
  const langBox = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(null), []);

  useEffect(() => {
    if (!langOpen) return;
    const off = (e: MouseEvent) => { if (!langBox.current?.contains(e.target as Node)) setLangOpen(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setLangOpen(false); };
    document.addEventListener('mousedown', off); document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('mousedown', off); document.removeEventListener('keydown', esc); };
  }, [langOpen]);

  const go = (hash: string) => {
    close();
    setTimeout(() => goToSection(hash), 120);
  };
  useEffect(() => { const id = setTimeout(refreshScroll, 150); return () => clearTimeout(id); }, [lang]);   // text height changes with the language
  const needle = q.trim().toLowerCase();
  const results = SEARCH_INDEX.filter(([k]) => t(k).toLowerCase().includes(needle));
  const submit = (e: FormEvent) => { e.preventDefault(); setSent(true); };
  const current = LANGS.find((l) => l.code === lang)!;

  return (
    <>
      <header className="hdr">
        <div className="hdr-l">
          <a href="#top" className="logo">rosso<br />garage</a>
          <button className="icon" aria-label={t('menu_open')} onClick={() => setOpen('menu')}>
            <svg width="18" height="12" viewBox="0 0 18 12"><path d="M0 1h18M0 6h18M0 11h18" stroke="currentColor" strokeWidth="1.2" /></svg>
          </button>
        </div>
        <div className="hdr-r">
          <div className="lang-wrap" ref={langBox}>
            <button className="lang" aria-haspopup="listbox" aria-expanded={langOpen} aria-label={t('lang')} onClick={() => setLangOpen((v) => !v)}>
              <Flag code={current.code} size={18} /> <span className="lang-code">{current.label}</span>
            </button>
            {langOpen && (
              <ul className="lang-menu" role="listbox">
                {LANGS.map((l) => (
                  <li key={l.code} role="option" aria-selected={l.code === lang}>
                    <button className={l.code === lang ? 'on' : ''} onClick={() => { setLang(l.code); setLangOpen(false); }}>
                      <Flag code={l.code} size={18} /><span lang={l.code}>{l.name}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <button className="icon" aria-label={t('search')} onClick={() => { setQ(''); setOpen('search'); }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2" /><path d="M11 11l4 4" stroke="currentColor" strokeWidth="1.2" /></svg>
          </button>
          <button className="btn" onClick={() => { setSent(false); setOpen('contact'); }}>{t('contact_seller')}</button>
        </div>
      </header>

      <Modal open={open === 'menu'} onClose={close} label={t('menu_open')} variant="full">
        <nav className="menu">
          {NAV.map(([n, k, h]) => (
            <a key={h} href={h} onClick={(e) => { e.preventDefault(); go(h); }}><i>{n}</i><span>{t(k)}</span></a>
          ))}
          <p className="menu-foot">{t('menu_foot')}</p>
        </nav>
      </Modal>

      <Modal open={open === 'search'} onClose={close} label={t('search')}>
        <div className="srch">
          <small>{t('search')}</small>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('search_ph')} aria-label={t('search_ph')} />
          <ul>
            {results.map(([k, h]) => <li key={h}><a href={h} onClick={(e) => { e.preventDefault(); go(h); }}>{t(k)} <span className="arr">→</span></a></li>)}
            {!results.length && <li className="empty">{t('search_none')} “{q}”.</li>}
          </ul>
        </div>
      </Modal>

      <Modal open={open === 'contact'} onClose={close} label={t('c_title')}>
        {sent ? (
          <div className="form-done">
            <small>{t('c_thanks')}</small>
            <h3>{t('c_done')}</h3>
            <p>{t('c_done_p')}</p>
            <button className="btn" onClick={close}>{t('close')}</button>
          </div>
        ) : (
          <form className="form" onSubmit={submit}>
            <small>{t('c_lot')}</small>
            <h3>{t('c_title')}</h3>
            <label>{t('c_name')}<input required name="name" autoComplete="name" /></label>
            <label>{t('c_email')}<input required type="email" name="email" autoComplete="email" dir="ltr" /></label>
            <label>{t('c_msg')}<textarea name="msg" rows={4} defaultValue={t('c_msg_def')} /></label>
            <button className="btn solid" type="submit">{t('c_send')} <span className="arr">→</span></button>
          </form>
        )}
      </Modal>
    </>
  );
}
