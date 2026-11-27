'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { getUsers, deleteUser } from '@/lib/api';
import type { UserResponse, UserRole } from '@/types/user';
import { USER_ROLE_LABELS } from '@/types/user';

const PAGE_SIZE = 10;

export default function ContasPage() {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const filterMenuRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (filterMenuRef.current && !filterMenuRef.current.contains(e.target as Node)) {
        setFilterMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    let ignore = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setError('');

    getUsers({ name: search || undefined, page, size: PAGE_SIZE })
      .then((data) => {
        if (!ignore) {
          setUsers(data.content);
          setTotal(data.totalElements);
          setTotalPages(data.totalPages || 1);
        }
      })
      .catch(() => {
        if (!ignore) {
          setError('Não foi possível carregar os usuários.');
        }
      })
      .finally(() => {
        if (!ignore) {
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [search, page, reloadTrigger]);

  async function handleDelete(id: number) {
    setDeletingId(id);
    try {
      await deleteUser(id);
      setConfirmDeleteId(null);
      setReloadTrigger((v) => v + 1);
    } catch {
      alert('Erro ao excluir usuário.');
    } finally {
      setDeletingId(null);
    }
  }

  const displayedUsers = roleFilter
    ? users.filter((u) => u.role.toUpperCase() === roleFilter)
    : users;

  const rangeStart = total === 0 ? 0 : page * PAGE_SIZE + 1;
  const rangeEnd = Math.min((page + 1) * PAGE_SIZE, total);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Page header */}
      <div className="flex items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#1a1a1a]">Conta</h1>
        <Link
          id="nova-conta-link"
          href="/contas/nova"
          className="inline-flex items-center justify-center gap-1.5 bg-[#f97316] hover:bg-[#ea580c] text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors shadow-sm cursor-pointer"
        >
          <span className="text-base font-bold leading-none">+</span>
          <span>Nova Conta</span>
        </Link>
      </div>

      {/* Main card */}
      <div className="bg-white rounded-xl shadow-sm border border-[#e5e7eb] overflow-hidden">
        {/* Search & Filter row */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-[#f3f4f6]">
          {/* Search box */}
          <div className="relative w-full max-w-xs sm:w-80">
            <svg
              className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#4b5563]"
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" strokeLinecap="round" />
            </svg>
            <input
              id="contas-search"
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              placeholder="Pesquisar"
              className="w-full pl-9 pr-3 py-2 text-sm text-[#1a1a1a] placeholder:text-[#6b7280] border border-[#e2e8f0] rounded-md focus:outline-none focus:ring-1 focus:ring-[#f97316] focus:border-[#f97316] bg-white transition-colors"
            />
          </div>

          {/* Funnel / Filter icon */}
          <div className="relative" ref={filterMenuRef}>
            <button
              type="button"
              onClick={() => setFilterMenuOpen((v) => !v)}
              className={`p-2 transition-colors cursor-pointer rounded-lg relative ${
                roleFilter ? 'text-[#f97316] bg-[#fff1e8]' : 'text-[#374151] hover:text-[#1a1a1a]'
              }`}
              aria-label="Filtrar por função"
              title="Filtrar por função"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z" />
              </svg>
              {roleFilter && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#f97316]" />
              )}
            </button>

            {filterMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-[#e5e7eb] py-2 z-20">
                <div className="px-3 py-1.5 text-xs font-semibold text-[#9ca3af] uppercase tracking-wider">
                  Filtrar por cargo
                </div>
                <button
                  type="button"
                  onClick={() => { setRoleFilter(''); setFilterMenuOpen(false); }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-[#f9fafb] cursor-pointer ${
                    roleFilter === '' ? 'text-[#f97316] font-semibold bg-[#fff7ed]' : 'text-[#374151]'
                  }`}
                >
                  <span>Todos</span>
                  {roleFilter === '' && <span>✓</span>}
                </button>
                {(['ADMIN', 'WAITER', 'COOK', 'CASHIER'] as UserRole[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => { setRoleFilter(r); setFilterMenuOpen(false); }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-[#f9fafb] cursor-pointer ${
                      roleFilter === r ? 'text-[#f97316] font-semibold bg-[#fff7ed]' : 'text-[#374151]'
                    }`}
                  >
                    <span>{USER_ROLE_LABELS[r]}</span>
                    {roleFilter === r && <span>✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div className="px-6 py-3.5 text-sm text-red-600 bg-red-50 border-b border-red-100">
            {error}
          </div>
        )}

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#f4f5f7] border-b border-[#e5e7eb]">
                <th className="px-6 py-4 text-sm font-semibold text-[#374151] text-left">
                  Nome
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-[#374151] text-center">
                  Email
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-[#374151] text-center">
                  Cargo
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-[#374151] text-right">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f3f4f6]">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-[#6b7280] text-sm">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-6 h-6 border-2 border-[#f97316] border-t-transparent rounded-full animate-spin mb-2" />
                      Carregando...
                    </div>
                  </td>
                </tr>
              ) : displayedUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-[#6b7280] text-sm">
                    Nenhum usuário encontrado.
                  </td>
                </tr>
              ) : (
                displayedUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-[#fafafa] transition-colors">
                    <td className="px-6 py-5 font-normal text-[#374151] text-left">
                      {user.name}
                    </td>
                    <td className="px-6 py-5 text-[#374151] text-center">
                      {user.email}
                    </td>
                    <td className="px-6 py-5 text-[#374151] text-center">
                      {USER_ROLE_LABELS[user.role.toUpperCase() as UserRole] ?? user.role}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-3 text-[#374151]">
                        {/* Edit icon */}
                        <Link
                          href={`/contas/${user.id}/editar`}
                          aria-label={`Editar ${user.name}`}
                          className="text-[#374151] hover:text-[#1a1a1a] transition-colors p-1 cursor-pointer"
                          title="Editar"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                          </svg>
                        </Link>

                        {/* Delete icon */}
                        {confirmDeleteId === user.id ? (
                          <div className="flex items-center gap-1.5 bg-red-50 px-2 py-1 rounded">
                            <button
                              onClick={() => handleDelete(user.id)}
                              disabled={deletingId === user.id}
                              className="text-xs text-red-600 font-semibold hover:underline disabled:opacity-50 cursor-pointer"
                            >
                              {deletingId === user.id ? '...' : 'Sim'}
                            </button>
                            <span className="text-[#d1d5db]">|</span>
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              className="text-xs text-[#6b7280] hover:underline cursor-pointer"
                            >
                              Não
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDeleteId(user.id)}
                            aria-label={`Excluir ${user.name}`}
                            className="text-[#374151] hover:text-red-600 transition-colors p-1 cursor-pointer"
                            title="Excluir"
                          >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards View */}
        <div className="md:hidden divide-y divide-[#f3f4f6]">
          {loading ? (
            <div className="p-8 text-center text-[#6b7280] text-sm">Carregando...</div>
          ) : displayedUsers.length === 0 ? (
            <div className="p-8 text-center text-[#6b7280] text-sm">Nenhum usuário encontrado.</div>
          ) : (
            displayedUsers.map((user) => (
              <div key={user.id} className="p-4 flex flex-col gap-2 hover:bg-[#fafafa] transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-sm text-[#1a1a1a]">{user.name}</h3>
                    <p className="text-xs text-[#6b7280] mt-0.5">{user.email}</p>
                  </div>
                  <span className="text-xs font-medium text-[#374151]">
                    {USER_ROLE_LABELS[user.role.toUpperCase() as UserRole] ?? user.role}
                  </span>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#f9fafb]">
                  <Link
                    href={`/contas/${user.id}/editar`}
                    className="p-1 text-[#374151] hover:text-[#1a1a1a]"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                    </svg>
                  </Link>

                  {confirmDeleteId === user.id ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDelete(user.id)}
                        disabled={deletingId === user.id}
                        className="text-xs text-red-600 font-semibold px-2 py-1 rounded bg-red-50"
                      >
                        {deletingId === user.id ? '...' : 'Confirmar'}
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        className="text-xs text-[#6b7280]"
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDeleteId(user.id)}
                      className="p-1 text-[#374151] hover:text-red-600"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-[#f3f4f6]">
          {/* Centered record count */}
          <div className="flex-1 text-center sm:text-center text-xs text-[#6b7280]">
            {total === 0 ? 'Nenhum registro' : `Mostrando ${rangeStart} a ${rangeEnd} de ${total} registros`}
          </div>

          {/* Right-aligned pagination buttons */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              id="pagination-prev-btn"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="w-7 h-7 flex items-center justify-center rounded border border-[#e5e7eb] text-[#6b7280] hover:text-[#1a1a1a] hover:border-gray-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer bg-white"
              aria-label="Página anterior"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>

            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i).map((i) => {
              const isCurrent = page === i;
              return (
                <button
                  key={i}
                  onClick={() => setPage(i)}
                  className={`w-7 h-7 flex items-center justify-center rounded text-xs font-medium transition-colors border cursor-pointer ${
                    isCurrent
                      ? 'bg-[#fff1e8] text-[#f97316] border-[#fde0cf]'
                      : 'bg-white text-[#4b5563] border-[#e5e7eb] hover:border-gray-400'
                  }`}
                >
                  {i + 1}
                </button>
              );
            })}

            <button
              id="pagination-next-btn"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="w-7 h-7 flex items-center justify-center rounded border border-[#e5e7eb] text-[#6b7280] hover:text-[#1a1a1a] hover:border-gray-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer bg-white"
              aria-label="Próxima página"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
