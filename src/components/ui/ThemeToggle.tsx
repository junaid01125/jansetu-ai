"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Monitor, Check, ChevronDown } from 'lucide-react';
import { useTheme, ThemeMode } from '@/lib/ThemeContext';

interface ThemeToggleProps {
  variant?: 'dropdown' | 'segmented' | 'icon-only';
  className?: string;
}

export default function ThemeToggle({ variant = 'dropdown', className = '' }: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme, mounted } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const options: { mode: ThemeMode; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { mode: 'light', label: 'Light', icon: Sun },
    { mode: 'dark', label: 'Dark', icon: Moon },
    { mode: 'system', label: 'System', icon: Monitor },
  ];

  // While mounting on client, render identical SSR output to prevent hydration mismatch
  if (!mounted) {
    if (variant === 'segmented') {
      return (
        <div className={`inline-flex items-center p-1 rounded-xl bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 h-9 w-48 animate-pulse ${className}`} />
      );
    }
    return (
      <div className={`relative inline-block text-left ${className}`}>
        <button
          type="button"
          aria-label="Theme toggle"
          disabled
          suppressHydrationWarning
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium text-gray-700 dark:text-slate-200 border border-gray-200 dark:border-slate-700/80 opacity-70"
        >
          <div className="w-4 h-4 rounded-full bg-gray-300 dark:bg-slate-700" />
          <span className="capitalize text-xs font-semibold tracking-wide hidden md:inline" suppressHydrationWarning>
            Theme
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
        </button>
      </div>
    );
  }

  // Segmented control variant (for mobile menu or settings)
  if (variant === 'segmented') {
    return (
      <div className={`inline-flex items-center p-1 rounded-xl bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 ${className}`}>
        {options.map((option) => {
          const Icon = option.icon;
          const isSelected = theme === option.mode;
          return (
            <button
              key={option.mode}
              type="button"
              onClick={() => setTheme(option.mode)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                isSelected
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-cyan-400 shadow-sm'
                  : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200'
              }`}
              title={`Switch to ${option.label} mode`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{option.label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <button
        type="button"
        id="theme-toggle-button"
        aria-label="Toggle theme"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        suppressHydrationWarning
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800 border border-gray-200 dark:border-slate-700/80 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        title={`Current theme: ${theme} (${resolvedTheme})`}
      >
        <div className="flex items-center justify-center">
          {resolvedTheme === 'dark' ? (
            <Moon className="w-4 h-4 text-cyan-400 transition-transform" />
          ) : (
            <Sun className="w-4 h-4 text-amber-500 transition-transform" />
          )}
        </div>
        <span className="capitalize text-xs font-semibold tracking-wide hidden md:inline" suppressHydrationWarning>
          {theme === 'system' ? 'System' : theme}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-44 rounded-xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-xl py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-3 py-1.5 text-[11px] font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider border-b border-gray-100 dark:border-slate-800 mb-1">
            Appearance
          </div>
          {options.map((option) => {
            const Icon = option.icon;
            const isSelected = theme === option.mode;
            return (
              <button
                key={option.mode}
                type="button"
                onClick={() => {
                  setTheme(option.mode);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-sm text-left transition-colors ${
                  isSelected
                    ? 'bg-blue-50 dark:bg-slate-800/80 text-blue-600 dark:text-cyan-400 font-semibold'
                    : 'text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-blue-600 dark:text-cyan-400' : 'text-gray-400 dark:text-slate-500'}`} />
                  <span>{option.label}</span>
                </div>
                {isSelected && <Check className="w-4 h-4 text-blue-600 dark:text-cyan-400" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
