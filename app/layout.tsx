import type { Metadata } from 'next';
import '@/styles/globals.css';
import { ThemeSync } from '@/components/ThemeSync';

export const metadata: Metadata = {
  title: 'Tradevii - Smart Investment Portfolio Manager',
  description: 'Track trades, manage investors, and monitor live portfolio performance.',
  manifest: '/manifest.json',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <ThemeSync />
        {children}
      </body>
    </html>
  );
}
