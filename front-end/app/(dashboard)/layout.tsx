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
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        <polyline strokeLinecap="round" strokeLinejoin="round" points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    href: '/contas',
    label: 'Contas',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
  {
    href: '/menu',
    label: 'Menu',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <line x1="8" y1="6" x2="21" y2="6" strokeLinecap="round" />
        <line x1="8" y1="12" x2="21" y2="12" strokeLinecap="round" />
        <line x1="8" y1="18" x2="21" y2="18" strokeLinecap="round" />
        <circle cx="3" cy="6" r="1" fill="currentColor" />
        <circle cx="3" cy="12" r="1" fill="currentColor" />
        <circle cx="3" cy="18" r="1" fill="currentColor" />
      </svg>
    ),
  },
  {
    href: '/pedidos',
    label: 'Pedidos',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
        <rect x="9" y="3" width="6" height="4" rx="1" />
        <line x1="9" y1="12" x2="15" y2="12" strokeLinecap="round" />
        <line x1="9" y1="16" x2="13" y2="16" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: '/comandas',
    label: 'Comandas',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    href: '/mesas',
    label: 'Mesas',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <rect x="3" y="7" width="18" height="4" rx="1" />
        <line x1="6" y1="11" x2="6" y2="19" strokeLinecap="round" />
        <line x1="18" y1="11" x2="18" y2="19" strokeLinecap="round" />
      </svg>
    ),
  },
];

// ─── UOrderFlow Logo ─────────────────────────────────────────────────────────
function UOrderLogo({ size = 36 }: { size?: number }) {
  return (
    <div style={{ width: size, height: size }} className="relative flex items-center justify-center">
      <Image
        src="/logo-uorder.png"
        alt="UOrderFlow Logo"
        width={size}
        height={size}
        className="object-contain"
        priority
      />
    </div>
  );
}

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
    if (item.href === '/contas' || item.href === '/mesas') return role === 'ADMIN';
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
    <div className="min-h-screen flex" style={{ background: '#ebebeb' }}>
      {/* ── Mobile Sidebar Backdrop ────────────────────────────────────── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-xs transition-opacity"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Sidebar (drawer on mobile, fixed on desktop) ───────────────── */}
      <aside
        className={`fixed top-0 left-0 bottom-0 flex flex-col z-40 transition-transform duration-200 ease-in-out md:translate-x-0 ${sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
          }`}
        style={{ width: 136, background: '#3c3c3c' }}
      >
        {/* Logo area */}
        <div
          className="flex flex-col items-center justify-center gap-1.5 shrink-0 relative"
          style={{ height: 80, borderBottom: '1px solid rgba(255,255,255,0.08)' }}
        >
          {/* Close button for mobile */}
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            aria-label="Fechar menu"
            className="md:hidden absolute top-2 right-2 text-gray-400 hover:text-white p-1"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <UOrderLogo size={34} />
          <span className="text-white text-[10px] font-bold tracking-wider uppercase">UOrderFlow</span>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col flex-1 py-2 overflow-y-auto">
          {visibleNavItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-2.5 px-4 py-3 text-[13px] font-medium transition-colors"
                style={{
                  background: isActive ? '#f97316' : 'transparent',
                  color: isActive ? '#ffffff' : '#c9c9c9',
                }}
              >
                <span style={{ opacity: isActive ? 1 : 0.75 }}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* ── Right side: header + content ──────────────────────────────── */}
      <div className="flex flex-col flex-1 min-w-0 md:ml-[136px] transition-all duration-200">
        {/* Top header bar */}
        <header
          className="flex items-center justify-between px-4 sm:px-5 shrink-0 sticky top-0 z-10"
          style={{ height: 52, background: '#3c3c3c' }}
        >
          {/* Mobile hamburger button */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              type="button"
              id="header-mobile-menu-btn"
              onClick={() => setSidebarOpen(true)}
              aria-label="Abrir menu lateral"
              className="text-[#9ca3af] hover:text-white transition-colors p-1"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <line x1="3" y1="6" x2="21" y2="6" strokeLinecap="round" />
                <line x1="3" y1="12" x2="21" y2="12" strokeLinecap="round" />
                <line x1="3" y1="18" x2="21" y2="18" strokeLinecap="round" />
              </svg>
            </button>
            <span className="text-white text-xs font-bold uppercase tracking-wider">UOrderFlow</span>
          </div>

          {/* Spacer on desktop */}
          <div className="hidden md:block" />

          {/* Right actions */}
          <div className="flex items-center gap-3">
            {/* Notification bell */}
            <button
              id="header-notifications-btn"
              aria-label="Notificações"
              className="text-[#9ca3af] hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path strokeLinecap="round" d="M13.73 21a2 2 0 01-3.46 0" />
              </svg>
            </button>

            {/* Settings */}
            <button
              id="header-settings-btn"
              aria-label="Configurações"
              className="text-[#9ca3af] hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="12" r="3" />
                <path strokeLinecap="round" d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
              </svg>
            </button>

            {/* User avatar + dropdown */}
            <div className="relative" ref={menuRef}>
              <button
                id="header-user-menu-btn"
                onClick={() => setUserMenuOpen((v) => !v)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold transition-opacity hover:opacity-80 cursor-pointer"
                style={{ background: '#c2410c' }}
                aria-label="Menu do usuário"
                aria-expanded={userMenuOpen}
              >
                {initials}
              </button>

              {userMenuOpen && (
                <div
                  id="user-dropdown-menu"
                  className="absolute right-0 top-10 bg-white rounded-xl shadow-lg border border-[#e5e7eb] w-52 py-1 z-50 overflow-hidden"
                >
                  {/* User info */}
                  <div className="px-4 py-3 border-b border-[#f3f4f6]">
                    <p className="text-xs font-bold text-[#1a1a1a] truncate">{userEmail ?? 'Usuário'}</p>
                    <p className="text-[10px] text-[#6b7280] mt-0.5 truncate">{userEmail}</p>
                  </div>

                  <button className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-[#374151] hover:bg-[#f9fafb] transition-colors cursor-pointer">
                    <svg className="w-4 h-4 text-[#6b7280]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    Editar Perfil
                  </button>

                  <button className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-[#374151] hover:bg-[#f9fafb] transition-colors cursor-pointer">
                    <svg className="w-4 h-4 text-[#6b7280]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <rect x="3" y="11" width="18" height="11" rx="2" />
                      <path strokeLinecap="round" d="M7 11V7a5 5 0 0110 0v4" />
                    </svg>
                    Alterar Senha
                  </button>

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

        {/* Page content */}
        <main className="flex-1 p-3.5 sm:p-5 md:p-6 min-w-0">{children}</main>
      </div>
    </div>
  );
}
