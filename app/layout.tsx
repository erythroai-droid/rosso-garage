import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'rosso garage — Rosso Spider',
  description: 'A private showcase of sports cars: 360° view, top view and macro details.',
};
export const viewport: Viewport = { themeColor: '#07080b', width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
