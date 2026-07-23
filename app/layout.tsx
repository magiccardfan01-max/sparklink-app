import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SparkLink - AI URL Shortener',
  description: 'Shorten, analyze, and share links with AI-powered insights',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-black text-white min-h-screen">
        {children}
      </body>
    </html>
  );
}
