"use client";
import React, { ReactNode, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sun, Moon, Monitor, Menu, X } from 'lucide-react';

const navItems = [
  { number: '01', name: 'about', path: '/' },
  { number: '02', name: 'projects', path: '/projects' },
  { number: '03', name: 'blog', path: '/blog' },
  { number: '04', name: 'resume', path: '/resume' },
  { number: '05', name: 'contact', path: '/contact' },
  { number: '06', name: 'visitors', path: '/visitors' },
];

type ThemeMode = 'light' | 'dark' | 'system';

function applyTheme(mode: ThemeMode) {
  const root = document.documentElement;
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const dark = mode === 'dark' || (mode === 'system' && systemDark);
  root.classList.add('theme-xfade');
  root.classList.toggle('dark', dark);
  window.setTimeout(() => root.classList.remove('theme-xfade'), 500);
}

function ThemeSwitch() {
  const [mode, setMode] = useState<ThemeMode>('system');

  useEffect(() => {
    const stored = localStorage.getItem('theme');
    if (stored === 'light' || stored === 'dark') setMode(stored);
  }, []);

  useEffect(() => {
    if (mode !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => applyTheme('system');
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [mode]);

  const select = useCallback((next: ThemeMode) => {
    setMode(next);
    if (next === 'system') localStorage.removeItem('theme');
    else localStorage.setItem('theme', next);
    applyTheme(next);
  }, []);

  const options: { value: ThemeMode; icon: ReactNode; label: string }[] = [
    { value: 'light', icon: <Sun className="w-3.5 h-3.5" />, label: 'light theme' },
    { value: 'system', icon: <Monitor className="w-3.5 h-3.5" />, label: 'system theme' },
    { value: 'dark', icon: <Moon className="w-3.5 h-3.5" />, label: 'dark theme' },
  ];

  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-gray-300 p-1">
      {options.map((opt) => (
        <button
          key={opt.value}
          aria-label={opt.label}
          onClick={() => select(opt.value)}
          className={`p-1.5 rounded-full transition-colors duration-200 ${
            mode === opt.value
              ? 'bg-ink text-background'
              : 'text-gray-400 hover:text-ink'
          }`}
        >
          {opt.icon}
        </button>
      ))}
    </div>
  );
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <ul className="space-y-1">
      {navItems.map((item) => {
        const active =
          item.path === '/'
            ? pathname === '/'
            : pathname.startsWith(item.path);
        return (
          <li key={item.path}>
            <Link
              href={item.path}
              onClick={onNavigate}
              className={`group flex items-baseline gap-3 py-1.5 font-mono text-[13px] transition-colors duration-200 ${
                active ? 'text-ink' : 'text-gray-500 hover:text-ink'
              }`}
            >
              <span className="micro">{item.number}</span>
              <span>
                {active && <span className="mr-1.5">→</span>}
                {item.name}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export default function SiteShell({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  return (
    <div>
      {/* fixed sidebar ≥1024px */}
      <nav
        aria-label="Primary"
        className="hidden lg:flex fixed inset-y-0 left-0 w-56 flex-col justify-between border-r border-gray-200 px-6 py-8"
      >
        <div>
          <Link href="/" className="block">
            <span className="page-title !text-xl">steven carreon</span>
            <span className="micro block mt-2">cloud / devops engineer</span>
          </Link>
          <div className="mt-10 border-t border-gray-200 pt-6">
            <NavLinks />
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="status-dot inline-block w-1.5 h-1.5 rounded-full bg-ink" />
            <span className="micro">open to work</span>
          </div>
          <ThemeSwitch />
        </div>
      </nav>

      {/* sticky top bar <1024px */}
      <header className="lg:hidden sticky top-0 z-40 border-b border-gray-200 bg-background/90 backdrop-blur">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/" className="page-title !text-base">
            steven carreon
          </Link>
          <button
            aria-label={menuOpen ? 'close menu' : 'open menu'}
            onClick={() => setMenuOpen((v) => !v)}
            className="p-2 text-gray-500 hover:text-ink transition-colors"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* full-screen overlay menu */}
      {menuOpen && (
        <div className="lg:hidden fixed inset-0 z-30 bg-background pt-20 px-6">
          <NavLinks onNavigate={() => setMenuOpen(false)} />
          <div className="mt-10 flex items-center justify-between border-t border-gray-200 pt-6">
            <div className="flex items-center gap-2">
              <span className="status-dot inline-block w-1.5 h-1.5 rounded-full bg-ink" />
              <span className="micro">open to work</span>
            </div>
            <ThemeSwitch />
          </div>
        </div>
      )}

      <main className="lg:pl-56">{children}</main>
    </div>
  );
}
