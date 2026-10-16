import type { Metadata, Viewport } from 'next';
import './globals.css';
import { I18nProvider } from '@/lib/i18n';
import { Heebo } from 'next/font/google';

// Hebrew-capable sans that matches the Helvetica look of the Latin text (system Helvetica has no Hebrew glyphs)
const heebo = Heebo({ subsets: ['hebrew', 'latin'], weight: ['400', '500', '600', '800'], variable: '--font-he', display: 'swap' });

export const metadata: Metadata = {
  title: 'rosso garage — Rosso Spider',
  description: 'A private showcase of sports cars: 360° view, top view and macro details.',
};
export const viewport: Viewport = { themeColor: '#07080b', width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" className={heebo.variable} suppressHydrationWarning>
      <body><I18nProvider>{children}</I18nProvider></body>
    </html>
  );
}
