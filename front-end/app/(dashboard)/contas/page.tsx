'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getUsers, deleteUser } from '@/lib/api';
import type { UserResponse } from '@/types/user';

const PAGE_SIZE = 10;

export default function ContasPage() {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const [reloadTrigger, setReloadTrigger] = useState(0);

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
      alert('Erro ao desativar usuário.');
    } finally {
      setDeletingId(null);
    }
  }

  const rangeStart = total === 0 ? 0 : page * PAGE_SIZE + 1;
  const rangeEnd = Math.min((page + 1) * PAGE_SIZE, total);

  return (
    <div>
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <h1 className="text-xl sm:text-2xl font-bold text-[#1a1a1a]">Conta</h1>
        <Link
          id="nova-conta-link"
          href="/contas/nova"
          className="flex items-center justify-center gap-1.5 bg-[#f97316] hover:bg-[#ea6c0e] text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors w-full sm:w-auto"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <line x1="12" y1="5" x2="12" y2="19" strokeLinecap="round" />
            <line x1="5" y1="12" x2="19" y2="12" strokeLinecap="round" />
          </svg>
          Nova Conta
        </Link>
      </div>

      {/* Card */}
      <div className="bg-white rounded-xl shadow-sm border border-[#e5e7eb] overflow-hidden">
        {/* Search bar */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 sm:py-4 border-b border-[#f3f4f6]">
          <div className="relative flex-1 max-w-full sm:max-w-xs">
            <svg
              className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af]"
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" strokeLinecap="round" />
            </svg>
            <input
              id="contas-search"
              type="text"
              placeholder="Pesquisar..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              className="w-full border border-[#d1d5db] rounded-lg pl-9 pr-3 py-2 text-base sm:text-sm text-[#1a1a1a] placeholder:text-[#9ca3af] focus:outline-none focus:border-[#f97316] transition-colors"
            />
          </div>
          <button
            id="contas-filter-btn"
            aria-label="Filtros"
            className="text-[#6b7280] hover:text-[#1a1a1a] transition-colors p-2 ml-2 sm:ml-3 cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Error state */}
        {error && (
          <div className="px-5 py-4 text-sm text-red-600 bg-red-50 border-b border-red-100">
            {error}
          </div>
        )}

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#f3f4f6]">
                {['Nome', 'Email', 'Cargo', 'Ações'].map((col) => (
                  <th
                    key={col}
                    className={`px-6 py-3.5 text-[13px] font-semibold text-[#374151] ${
                      col === 'Ações' ? 'text-right' : 'text-left'
                    }`}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-[#9ca3af] text-sm">
                    <svg className="animate-spin w-5 h-5 mx-auto mb-2 text-[#f97316]" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Carregando...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-[#9ca3af] text-sm">
                    Nenhum usuário encontrado.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="border-b border-[#f9fafb] hover:bg-[#fafafa] transition-colors">
                    <td className="px-6 py-4 font-medium text-[#1a1a1a]">{user.name}</td>
                    <td className="px-6 py-4 text-[#6b7280]">{user.email}</td>
                    <td className="px-6 py-4 text-[#374151]">{user.role}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-3">
                        {/* Edit */}
                        <Link
                          href={`/contas/${user.id}/editar`}
                          aria-label={`Editar ${user.name}`}
                          className="text-[#6b7280] hover:text-[#f97316] transition-colors p-1"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </Link>
                        {/* Delete */}
                        {confirmDeleteId === user.id ? (
                          <span className="flex items-center gap-1">
                            <button
                              onClick={() => handleDelete(user.id)}
                              disabled={deletingId === user.id}
                              className="text-xs text-red-600 font-semibold hover:underline disabled:opacity-50 cursor-pointer"
                            >
                              {deletingId === user.id ? '...' : 'Confirmar'}
                            </button>
                            <span className="text-[#d1d5db]">|</span>
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              className="text-xs text-[#6b7280] hover:underline cursor-pointer"
                            >
                              Cancelar
                            </button>
                          </span>
                        ) : (
                          <button
                            onClick={() => setConfirmDeleteId(user.id)}
                            aria-label={`Excluir ${user.name}`}
                            className="text-[#6b7280] hover:text-red-500 transition-colors p-1 cursor-pointer"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <polyline strokeLinecap="round" points="3 6 5 6 21 6" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                              <path strokeLinecap="round" d="M10 11v6M14 11v6" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
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
            <div className="p-8 text-center text-[#9ca3af] text-sm">
              <svg className="animate-spin w-5 h-5 mx-auto mb-2 text-[#f97316]" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Carregando...
            </div>
          ) : users.length === 0 ? (
            <div className="p-8 text-center text-[#9ca3af] text-sm">
              Nenhum usuário encontrado.
            </div>
          ) : (
            users.map((user) => (
              <div key={user.id} className="p-4 flex flex-col gap-2 hover:bg-[#fafafa] transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-sm text-[#1a1a1a]">{user.name}</h3>
                    <p className="text-xs text-[#6b7280] mt-0.5">{user.email}</p>
                  </div>
                  <span className="text-[11px] font-medium bg-[#f3f4f6] text-[#374151] px-2 py-0.5 rounded-full shrink-0">
                    {user.role}
                  </span>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#f9fafb]">
                  <Link
                    href={`/contas/${user.id}/editar`}
                    className="flex items-center gap-1 text-xs text-[#6b7280] hover:text-[#f97316] py-1 px-2 rounded transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                    Editar
                  </Link>

                  {confirmDeleteId === user.id ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDelete(user.id)}
                        disabled={deletingId === user.id}
                        className="text-xs text-red-600 font-semibold px-2 py-1 rounded bg-red-50 hover:bg-red-100 disabled:opacity-50 cursor-pointer"
                      >
                        {deletingId === user.id ? 'Excluindo...' : 'Confirmar'}
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        className="text-xs text-[#6b7280] px-2 py-1 hover:underline cursor-pointer"
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDeleteId(user.id)}
                      className="flex items-center gap-1 text-xs text-[#6b7280] hover:text-red-500 py-1 px-2 rounded transition-colors cursor-pointer"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <polyline strokeLinecap="round" points="3 6 5 6 21 6" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                        <path strokeLinecap="round" d="M10 11v6M14 11v6" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
                      </svg>
                      Excluir
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-6 py-3.5 border-t border-[#f3f4f6]">
          <span className="text-xs text-[#6b7280] text-center sm:text-left">
            {total === 0 ? 'Nenhum registro' : `Mostrando ${rangeStart} a ${rangeEnd} de ${total} registros`}
          </span>
          <div className="flex items-center gap-1">
            <button
              id="pagination-prev-btn"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="w-8 h-8 sm:w-7 sm:h-7 flex items-center justify-center rounded border border-[#d1d5db] text-[#374151] hover:border-[#f97316] hover:text-[#f97316] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              aria-label="Página anterior"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>

            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i).map((i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                className="w-8 h-8 sm:w-7 sm:h-7 flex items-center justify-center rounded text-xs font-medium transition-colors border cursor-pointer"
                style={{
                  background: page === i ? '#f97316' : 'white',
                  color: page === i ? 'white' : '#374151',
                  borderColor: page === i ? '#f97316' : '#d1d5db',
                }}
              >
                {i + 1}
              </button>
            ))}

            <button
              id="pagination-next-btn"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="w-8 h-8 sm:w-7 sm:h-7 flex items-center justify-center rounded border border-[#d1d5db] text-[#374151] hover:border-[#f97316] hover:text-[#f97316] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
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
