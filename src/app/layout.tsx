import type { Metadata } from 'next';
import './globals.css';

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
    <html lang="en">
      <body className="rcv-app min-h-screen bg-white text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
