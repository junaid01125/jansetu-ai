"use client";

import { useState } from 'react';
import Link from 'next/link';
import { ShieldAlert, Menu, X, Globe, LogIn, LogOut, UserRound } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';
import { Language } from '@/lib/translations';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import ThemeToggle from '@/components/ui/ThemeToggle';

export default function Navbar() {
  const { lang, setLang, t } = useLanguage();
  const { user, isLoading, signOut } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <nav className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-gray-200 dark:border-slate-800 sticky top-0 z-50 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center gap-2.5 group">
              <div className="p-2 bg-gradient-to-tr from-blue-600 to-cyan-500 rounded-xl shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <ShieldAlert className="h-5 w-5 text-white" />
              </div>
              <span className="font-extrabold text-xl text-gray-900 dark:text-white tracking-tight">
                JanSetu<span className="text-blue-600 dark:text-cyan-400">AI</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden sm:flex sm:items-center sm:space-x-6">
            <Link
              href="/report"
              className="text-gray-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-cyan-400 px-3 py-2 text-sm font-medium transition-colors"
            >
              {t('reportIssue')}
            </Link>
            <Link
              href="/dashboard"
              className="text-gray-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-cyan-400 px-3 py-2 text-sm font-medium transition-colors"
            >
              {t('government')}
            </Link>
            <Link
              href="/policymaker"
              className="text-gray-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-cyan-400 px-3 py-2 text-sm font-medium transition-colors"
            >
              {t('policymaker')}
            </Link>

            {/* Language Selector */}
            <div className="flex items-center gap-1.5 text-gray-600 dark:text-slate-300 border-l pl-4 border-gray-200 dark:border-slate-800">
              <Globe className="h-4 w-4 text-gray-400 dark:text-slate-500" />
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value as Language)}
                aria-label="Language"
                className="bg-transparent text-sm font-medium focus:outline-none cursor-pointer text-gray-700 dark:text-slate-200 dark:bg-slate-900"
              >
                <option value="en" className="dark:bg-slate-900">English</option>
                <option value="te" className="dark:bg-slate-900">తెలుగు</option>
                <option value="hi" className="dark:bg-slate-900">हिंदी</option>
              </select>
            </div>

            {/* Theme Toggle (Light / Dark / System) */}
            <div className="border-l pl-4 border-gray-200 dark:border-slate-800">
              <ThemeToggle />
            </div>

            {/* Auth section */}
            {!isLoading && (
              <div className="border-l border-gray-200 dark:border-slate-800 pl-4">
                {user ? (
                  <div className="flex items-center gap-3">
                    <Link
                      href="/profile"
                      className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-slate-200 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-400">
                        <UserRound className="h-4 w-4" />
                      </span>
                      <span className="max-w-28 truncate font-medium">{user.name}</span>
                    </Link>
                    <button
                      type="button"
                      onClick={handleSignOut}
                      title="Sign out"
                      className="rounded-lg p-2 text-gray-500 dark:text-slate-400 transition hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white"
                    >
                      <LogOut className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    className="flex items-center gap-2 rounded-xl bg-gray-900 dark:bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-cyan-700 dark:hover:bg-blue-500 transition-all"
                  >
                    <LogIn className="h-4 w-4" /> Sign in
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Mobile hamburger button */}
          <div className="flex items-center gap-2 sm:hidden">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-lg text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 focus:outline-none transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-gray-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-4 pt-3 pb-5 space-y-3 animate-in slide-in-from-top duration-200">
          <div className="flex flex-col space-y-2">
            <Link
              href="/report"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-base font-medium text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800"
            >
              {t('reportIssue')}
            </Link>
            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-base font-medium text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800"
            >
              {t('government')}
            </Link>
            <Link
              href="/policymaker"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-base font-medium text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800"
            >
              {t('policymaker')}
            </Link>
          </div>

          <div className="pt-3 border-t border-gray-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-slate-300">
              <Globe className="h-4 w-4 text-gray-400 dark:text-slate-500" />
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value as Language)}
                className="bg-transparent font-medium focus:outline-none cursor-pointer dark:bg-slate-900 text-gray-800 dark:text-slate-200"
              >
                <option value="en" className="dark:bg-slate-900">English</option>
                <option value="te" className="dark:bg-slate-900">తెలుగు (Telugu)</option>
                <option value="hi" className="dark:bg-slate-900">हिंदी (Hindi)</option>
              </select>
            </div>
          </div>

          <div className="pt-3 border-t border-gray-200 dark:border-slate-800">
            <p className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-2">
              Appearance
            </p>
            <ThemeToggle variant="segmented" className="w-full justify-center" />
          </div>

          {!isLoading && (
            <div className="pt-3 border-t border-gray-200 dark:border-slate-800">
              {user ? (
                <div className="flex items-center justify-between">
                  <Link
                    href="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 text-sm font-medium text-gray-800 dark:text-slate-200"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-400">
                      <UserRound className="h-4 w-4" />
                    </span>
                    <span>{user.name}</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      handleSignOut();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-1 text-sm font-medium text-red-600 dark:text-red-400 px-3 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign out</span>
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm"
                >
                  <LogIn className="h-4 w-4" /> Sign in
                </Link>
              )}
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
