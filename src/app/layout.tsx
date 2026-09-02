import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ReportProvider } from '@/lib/ReportContext';
import { LanguageProvider } from '@/lib/LanguageContext';
import Navbar from '@/components/ui/Navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'JanSetu AI',
  description: 'From Citizen Voice to Government Action.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-slate-50 flex flex-col`}>
        <LanguageProvider>
          <ReportProvider>
            <Navbar />
            <main className="flex-1 flex flex-col">
              {children}
            </main>
          </ReportProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
