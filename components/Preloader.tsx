'use client';
import { useI18n } from '@/lib/i18n';

export default function Preloader({ pct }: { pct: number }) {
  const { t } = useI18n();
  return (
    <div className={`pre ${pct >= 100 ? 'done' : ''}`} aria-hidden={pct >= 100}>
      <div className="pre-l">{t('loading')}</div>
      <div className="pre-n" dir="ltr">{pct}%</div>
      <div className="pre-t"><i style={{ width: pct + '%' }} /></div>
    </div>
  );
}
