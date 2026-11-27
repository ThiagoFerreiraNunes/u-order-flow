'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef, useSyncExternalStore } from 'react';
import { logout, getUserEmail, getInitials } from '@/lib/auth';
import { useSession } from '@/lib/use-session';

// ─── Nav items (matches prototype sidebar) ──────────────────────────────────
const NAV_ITEMS = [
  {
    href: '/inicio',
    label: 'Início',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 9.75l9-7.5 9 7.5v10.5a1.5 1.5 0 01-1.5 1.5h-15A1.5 1.5 0 013 20.25V9.75z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 21V12h6v9" />
      </svg>
    ),
  },
  {
    href: '/contas',
    label: 'Contas',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.118a7.5 7.5 0 0115 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.5-1.632z" />
      </svg>
    ),
  },
  {
    href: '/menu',
    label: 'Menu',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
      </svg>
    ),
  },
  {
    href: '/pedidos',
    label: 'Pedidos',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    href: '/comandas',
    label: 'Comandas',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <rect x="3" y="4" width="18" height="16" rx="2" strokeWidth={2} />
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h2m4 0h4" />
      </svg>
    ),
  },
  {
    href: '/mesas',
    label: 'Mesas',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <rect x="3" y="7" width="18" height="4" rx="1" />
        <line x1="6" y1="11" x2="6" y2="19" strokeLinecap="round" />
        <line x1="18" y1="11" x2="18" y2="19" strokeLinecap="round" />
      </svg>
    ),
  },
];

const emptySubscribe = () => () => {};

// ─── Dashboard Layout ────────────────────────────────────────────────────────
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { role, email: sessionEmail } = useSession();
  const localEmail = useSyncExternalStore(
    emptySubscribe,
    getUserEmail,
    () => null,
  );
  const userEmail = sessionEmail ?? localEmail;
  const menuRef = useRef<HTMLDivElement>(null);

  const visibleNavItems = NAV_ITEMS.filter((item) => {
    if (item.href === '/inicio' || item.href === '/contas' || item.href === '/mesas') return role === 'ADMIN';
    if (item.href === '/comandas') return role !== 'COOK';
    return true;
  });

  // Close user menu on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const initials = getInitials(userEmail);

  return (
    <div className="min-h-screen flex flex-col bg-[#ebebeb]">
      {/* ── Top header bar (full width across top) ───────────────────────── */}
      <header className="h-[60px] bg-[#3c3c3c] flex items-center justify-between px-4 sm:px-6 shrink-0 sticky top-0 z-30 shadow-sm">
        {/* Left: Brand logo */}
        <div className="flex items-center gap-3">
          {/* Mobile hamburger button */}
          <button
            type="button"
            id="header-mobile-menu-btn"
            onClick={() => setSidebarOpen((v) => !v)}
            aria-label="Abrir menu lateral"
            className="md:hidden text-gray-300 hover:text-white transition-colors p-1"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <line x1="3" y1="6" x2="21" y2="6" strokeLinecap="round" />
              <line x1="3" y1="12" x2="21" y2="12" strokeLinecap="round" />
              <line x1="3" y1="18" x2="21" y2="18" strokeLinecap="round" />
            </svg>
          </button>

          <Link href="/inicio" className="flex items-center gap-2.5">
            <div className="w-9 h-9 relative flex items-center justify-center">
              <Image
                src="/logo-uorder.png"
                alt="UOrderFlow Logo"
                width={36}
                height={36}
                className="object-contain"
                priority
              />
            </div>
          </Link>
        </div>

        {/* Right actions: Bell, Gear, Avatar */}
        <div className="flex items-center gap-4 sm:gap-5">
          {/* Notification bell */}
          <button
            id="header-notifications-btn"
            aria-label="Notificações"
            className="text-white hover:text-gray-200 transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
            </svg>
          </button>

          {/* Settings gear */}
          <button
            id="header-settings-btn"
            aria-label="Configurações"
            className="text-white hover:text-gray-200 transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
            </svg>
          </button>

          {/* User avatar circle (White circle with dark bold text) */}
          <div className="relative" ref={menuRef}>
            <button
              id="header-user-menu-btn"
              onClick={() => setUserMenuOpen((v) => !v)}
              className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#1a1a1a] text-xs font-bold shadow-sm transition-opacity hover:opacity-90 cursor-pointer"
              aria-label="Menu do usuário"
              aria-expanded={userMenuOpen}
            >
              {initials}
            </button>

            {userMenuOpen && (
              <div
                id="user-dropdown-menu"
                className="absolute right-0 top-11 bg-white rounded-xl shadow-lg border border-[#e5e7eb] w-52 py-1 z-50 overflow-hidden"
              >
                {/* User info */}
                <div className="px-4 py-3 border-b border-[#f3f4f6]">
                  <p className="text-xs font-bold text-[#1a1a1a] truncate">{userEmail ?? 'Usuário'}</p>
                  <p className="text-[10px] text-[#6b7280] mt-0.5 truncate">{userEmail}</p>
                </div>

                <div className="border-t border-[#f3f4f6] mt-1 pt-1">
                  <button
                    id="user-logout-btn"
                    onClick={logout}
                    className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" d="M17 16l4-4m0 0l-4-4m4 4H7" />
                      <path strokeLinecap="round" d="M3 12a9 9 0 0112-8.46M3 12a9 9 0 0012 8.46" />
                    </svg>
                    Sair
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Main body below header: Sidebar (left) + Content (right) ───────── */}
      <div className="flex flex-1 min-h-[calc(100vh-60px)]">
        {/* Mobile backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-xs transition-opacity"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed md:sticky top-[60px] left-0 bottom-0 md:bottom-auto md:h-[calc(100vh-60px)] w-48 bg-white border-r border-[#e5e7eb] flex flex-col z-40 transition-transform duration-200 ease-in-out shrink-0 ${
            sidebarOpen ? 'translate-x-0 shadow-xl' : '-translate-x-full md:translate-x-0'
          }`}
        >
          <nav className="flex flex-col py-3">
            {visibleNavItems.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-5 py-3 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-[#fff1e8] text-[#f97316] border-l-4 border-[#f97316]'
                      : 'text-[#4b5563] hover:text-[#1a1a1a] hover:bg-[#f9fafb] border-l-4 border-transparent'
                  }`}
                >
                  <span className={isActive ? 'text-[#f97316]' : 'text-[#4b5563]'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 min-w-0 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
