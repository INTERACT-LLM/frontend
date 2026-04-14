import { Work_Sans, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';

const workSans = Work_Sans({
  variable: '--font-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

const mono = IBM_Plex_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
  weight: ['400', '500'],
});

export { workSans, mono };

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${workSans.variable} ${mono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
