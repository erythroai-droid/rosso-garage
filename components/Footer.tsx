'use client';
import { useI18n } from '@/lib/i18n';

export default function Footer() {
  const { t } = useI18n();
  return (
    <footer className="ftr rise" id="contact" data-slide="blk">
      <div className="ftr-grid">
        <div>
          <div className="logo">rosso<br />garage</div>
          <p className="muted">{t('f_about')}</p>
        </div>
        <div>
          <h4>{t('f_lot')}</h4>
          <p>{t('f_paint')}</p>
          <p>{t('f_carbon')}</p>
          <a className="btn" href="mailto:hello@example.com">{t('contact_seller')} <span className="arr">→</span></a>
        </div>
        <div>
          <h4>{t('f_garage')}</h4>
          <a href="#top">{t('f_collection')}</a><a href="#top">{t('f_sell')}</a><a href="#top">{t('f_concierge')}</a><a href="#top">{t('f_journal')}</a>
        </div>
        <div>
          <h4>{t('f_contact')}</h4>
          <a href="mailto:hello@example.com" dir="ltr">hello@example.com</a>
          <p className="muted" dir="ltr">+00 000 000 00 00</p>
        </div>
      </div>
      <div className="ftr-bot"><span>© 2026 rosso garage</span></div>
    </footer>
  );
}
