import type { Metadata } from 'next';
import { Libre_Franklin, Public_Sans, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';

const display = Libre_Franklin({
  subsets: ['latin'],
  weight: ['700', '800'],
  variable: '--font-display',
  display: 'swap',
});

const body = Public_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-body',
  display: 'swap',
});

const mono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['500', '600'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'RCV Simulator',
  description: 'Try ranked-choice voting on a sample ballot. See what happens round-by-round.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body className="rcv-app rcv-grain relative min-h-screen antialiased">{children}</body>
    </html>
  );
}
