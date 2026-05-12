import type { Metadata } from 'next';
import { NavBar } from './_components/NavBar';
import { dmMono, libreBaskerville, montserrat } from './fonts';
import './jaecha.css';

export const metadata: Metadata = {
  title: 'Jae Cha — Photography',
  description:
    'Jae Cha is a photographer whose work dwells in the somber, melancholic beauty of everyday life — portraiture, still life, landscape, and commercial work.',
  openGraph: {
    title: 'Jae Cha — Photography',
    description:
      'Portraiture, still life, landscape, and commercial photography by Jae Cha.',
    type: 'website',
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
    </div>
  );
}
