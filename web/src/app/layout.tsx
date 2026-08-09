'use client';

import { Inter } from "next/font/google";
import "./globals.css";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, List, BookOpen, AlertCircle, BarChart2, Settings, Code2 } from 'lucide-react';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="layout-container">
          <aside className="sidebar">
            <div className="logo-section">
              <Code2 size={24} color="var(--text-main)" />
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
