import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import BrowserLayout from '@/components/BrowserLayout';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Portfolio',
  description: 'Personal portfolio showcasing my projects and skills',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 min-h-screen`}>
        <BrowserLayout>
          {children}
        </BrowserLayout>
      </body>
    </html>
  );
}
