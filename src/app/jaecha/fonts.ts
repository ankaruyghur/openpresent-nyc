import { DM_Mono, Libre_Baskerville, Montserrat } from 'next/font/google';

export const libreBaskerville = Libre_Baskerville({
  variable: '--font-jae-serif',
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
});

export const dmMono = DM_Mono({
  variable: '--font-jae-mono',
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  display: 'swap',
});

export const montserrat = Montserrat({
  variable: '--font-jae-sans',
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
});
