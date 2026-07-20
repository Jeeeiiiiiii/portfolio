import './globals.css';
import type { Metadata } from 'next';
import { Geist, Geist_Mono, Source_Serif_4 } from 'next/font/google';
import localFont from 'next/font/local';
import SiteShell from '@/components/SiteShell';

const geistSans = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
  display: 'swap',
});

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
  display: 'swap',
});

const sourceSerif = Source_Serif_4({
  subsets: ['latin'],
  variable: '--font-source-serif',
  display: 'swap',
});

const geistPixel = localFont({
  src: './fonts/GeistPixel-Square.woff2',
  variable: '--font-geist-pixel',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Steven Carreon — DevOps Engineer',
  description: 'Personal portfolio showcasing my projects and skills',
};

// Sets the theme class before hydration so there is no flash of wrong theme.
const themeInitScript = `
(function () {
  try {
    var stored = localStorage.getItem('theme');
    var system = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var dark = stored === 'dark' || (stored !== 'light' && system);
    if (dark) document.documentElement.classList.add('dark');
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${sourceSerif.variable} ${geistPixel.variable} bg-background text-ink min-h-screen`}
      >
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
