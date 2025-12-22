import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Screen Recorder',
  description: 'Record, trim, and share screen recordings',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-gray-900 text-white min-h-screen">{children}</body>
    </html>
  );
}
