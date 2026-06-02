import type { Metadata } from 'next';
import { CursorProvider } from '@/components/cursor';
import { jaechaCursorTheme } from '@/components/cursor/themes/jaecha';
import { NavBar } from './_components/NavBar';
import { dmMono, libreBaskerville, montserrat } from './fonts';
import './jaecha.css';

export const metadata: Metadata = {
  // Absolute base so OG/Twitter image URLs resolve fully — required for iMessage
  // and other link-preview crawlers, which won't load relative image paths.
  metadataBase: new URL('https://www.openpresent.nyc'),
  title: 'Jae Cha — Photography',
  description:
    'Jae Cha is a photographer whose work dwells in the somber, melancholic beauty of everyday life — portraiture, still life, landscape, and commercial work.',
  openGraph: {
    title: 'Jae Cha — Photography',
    description:
      'Portraiture, still life, landscape, and commercial photography by Jae Cha.',
    type: 'website',
    url: '/jaecha',
    images: [
      {
        // Static JPEG (iMessage doesn't reliably render AVIF/WebP). 1200×630 is
        // the standard OG card ratio for a large rich preview.
        url: '/jaecha/og.jpg',
        width: 1200,
        height: 630,
        alt: 'Jae Cha — Photography',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Jae Cha — Photography',
    description:
      'Portraiture, still life, landscape, and commercial photography by Jae Cha.',
    images: ['/jaecha/og.jpg'],
  },
};

export default function JaechaLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`${libreBaskerville.variable} ${dmMono.variable} ${montserrat.variable}`}
      style={{
        background: '#F5F0EB',
        minHeight: '100vh',
        color: '#2C2824',
      }}
    >
      <NavBar />
      {children}
      <CursorProvider theme={jaechaCursorTheme} />
    </div>
  );
}
