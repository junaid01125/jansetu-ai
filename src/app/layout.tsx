import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ReportProvider } from '@/lib/ReportContext';
import { LanguageProvider } from '@/lib/LanguageContext';
import { AuthProvider } from '@/lib/AuthContext';
import { ThemeProvider } from '@/lib/ThemeContext';
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
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col transition-colors duration-200`}>
        <ThemeProvider>
          <LanguageProvider>
            <AuthProvider>
              <ReportProvider>
                <Navbar />
                <main className="flex-1 flex flex-col">
                  {children}
                </main>
              </ReportProvider>
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
