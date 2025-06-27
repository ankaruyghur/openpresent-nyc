import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OPEN PRESENT | Creative Solutions",
  description: "Open Present: Creative Solutions: ",
  keywords: ["interactive art", "photobooth", "TouchDesigner", "digital art", "NYC", "creative experiences", "DJ", "live events", "Boiler Room"],
  icons: {
    icon: "/icons/favicon_io/favicon.ico",
    shortcut: "/icons/favicon_io/favicon-16x16.png",
    apple: "/icons/favicon_io/apple-touch-icon.png",
    other: [
      {
        rel: "icon",
        type: "image/png",
        sizes: "32x32",
        url: "/icons/favicon_io/favicon-32x32.png",
      },
      {
        rel: "android-chrome",
        sizes: "192x192",
        url: "/icons/favicon_io/android-chrome-192x192.png",
      },
    ],
  },
  manifest: "/icons/favicon_io/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
