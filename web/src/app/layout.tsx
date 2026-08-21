'use client';

import { useEffect, useState } from 'react';
import { Inter } from "next/font/google";
import "./globals.css";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, List, BookOpen, AlertCircle, BarChart2, Settings, Code2, Moon, Sun } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import { applyTheme, getStoredTheme } from '@/lib/theme';

const inter = Inter({ subsets: ["latin"] });

const THEME_INIT_SCRIPT = `
(function () {
  try {
    var stored = localStorage.getItem('theme');
    var theme = stored || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    if (theme === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
  } catch (e) {}
})();
`;

function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(getStoredTheme() === 'dark');
  }, []);

  const toggle = () => {
    const next = !isDark;
    setIsDark(next);
    applyTheme(next ? 'dark' : 'light');
  };

  return (
    <button type="button" onClick={toggle} className="theme-toggle" title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}>
      {isDark ? <Sun size={17} /> : <Moon size={17} />}
    </button>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className={inter.className}>
        <title>DSA Tracker</title>
        <div className="layout-container">
          <aside className="sidebar">
            <div className="logo-section">
              <div className="logo-mark"><Code2 size={18} /></div>
              <h2>DSA Tracker</h2>
            </div>
            <nav className="nav-menu">
              <Link href="/" className={`nav-item ${pathname === '/' ? 'active' : ''}`}>
                <Home size={18} /> Home
              </Link>
              <Link href="/inventory" className={`nav-item ${pathname?.startsWith('/inventory') || pathname?.startsWith('/problems') ? 'active' : ''}`}>
                <List size={18} /> Inventory
              </Link>
              <Link href="/concept-notes" className={`nav-item ${pathname?.startsWith('/concept-notes') ? 'active' : ''}`}>
                <BookOpen size={18} /> Concept Notes
              </Link>
              <Link href="/mistake-journal" className={`nav-item ${pathname?.startsWith('/mistake-journal') ? 'active' : ''}`}>
                <AlertCircle size={18} /> Mistake Journal
              </Link>

              <Link href="/analytics" className={`nav-item ${pathname?.startsWith('/analytics') ? 'active' : ''}`}>
                <BarChart2 size={18} /> Analytics
              </Link>
              <Link href="/settings" className={`nav-item ${pathname?.startsWith('/settings') ? 'active' : ''}`}>
                <Settings size={18} /> Settings
              </Link>
            </nav>
            <div className="sidebar-footer">
              <span className="text-xs" style={{ color: 'var(--sidebar-text-muted)' }}>v0.1 MVP</span>
              <ThemeToggle />
            </div>
          </aside>

          <div className="main-wrapper">
            {children}
            <Toaster position="bottom-right" />
          </div>
        </div>
      </body>
    </html>
  );
}
