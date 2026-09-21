'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { logout, getUserEmail, getInitials } from '@/lib/auth';

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
];

import Image from 'next/image';

// ─── UOrderFlow Logo ─────────────────────────────────────────────────────────
function UOrderLogo({ size = 36 }: { size?: number }) {
  return (
    <div style={{ width: size, height: size }}>
      <img src="/logo-uorder.png" alt="UOrderFlow Logo" className="w-full h-full object-contain" />
    </div>
  );
}

// ─── Dashboard Layout ────────────────────────────────────────────────────────
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setUserEmail(getUserEmail());
  }, []);

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
      {/* ── Left Sidebar (full height) ─────────────────────────────────── */}
      <aside
        className="fixed top-0 left-0 bottom-0 flex flex-col z-20"
        style={{ width: 136, background: '#3c3c3c' }}
      >
        {/* Logo area */}
        <div
          className="flex flex-col items-center justify-center gap-1.5 shrink-0"
          style={{ height: 80, borderBottom: '1px solid rgba(255,255,255,0.08)' }}
        >
          <UOrderLogo size={34} />
          <span className="text-white text-[10px] font-bold tracking-wider uppercase">UOrderFlow</span>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col flex-1 py-2">
          {NAV_ITEMS.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
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
      <div className="flex flex-col flex-1" style={{ marginLeft: 136 }}>
        {/* Top header bar */}
        <header
          className="flex items-center justify-end px-5 gap-3 shrink-0 sticky top-0 z-10"
          style={{ height: 52, background: '#3c3c3c' }}
        >
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
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold transition-opacity hover:opacity-80"
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

                <button className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-[#374151] hover:bg-[#f9fafb] transition-colors">
                  <svg className="w-4 h-4 text-[#6b7280]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  Editar Perfil
                </button>

                <button className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-[#374151] hover:bg-[#f9fafb] transition-colors">
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
                    className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
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
        </header>

        {/* Page content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
