"use client";
import Link from 'next/link';
import { ShieldAlert, Menu, Globe } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';
import { Language } from '@/lib/translations';

export default function Navbar() {
  const { lang, setLang, t } = useLanguage();

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/" className="flex-shrink-0 flex items-center gap-2">
              <div className="p-2 bg-blue-600 rounded-lg">
                <ShieldAlert className="h-6 w-6 text-white" />
              </div>
              <span className="font-bold text-xl text-gray-900 tracking-tight">JanSetu<span className="text-blue-600">AI</span></span>
            </Link>
          </div>
          
          <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-8">
            <Link href="/report" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">
              {t('reportIssue')}
            </Link>
            <Link href="/dashboard" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">
              {t('government')}
            </Link>
            <Link href="/policymaker" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">
              {t('policymaker')}
            </Link>
            
            <div className="flex items-center gap-2 text-gray-500 border-l pl-4 border-gray-300">
              <Globe className="h-4 w-4" />
              <select 
                value={lang} 
                onChange={(e) => setLang(e.target.value as Language)}
                className="bg-transparent text-sm font-medium focus:outline-none cursor-pointer"
              >
                <option value="en">English</option>
                <option value="te">తెలుగు (Telugu)</option>
                <option value="hi">हिंदी (Hindi)</option>
              </select>
            </div>
          </div>
          
          <div className="flex items-center sm:hidden">
            <button type="button" className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none">
              <Menu className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
