'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import {
  getBills,
  getBillById,
  createBill,
  closeBill,
  payBill,
  cancelBill,
  getRestaurantTables,
} from '@/lib/api';
import { useSession } from '@/lib/use-session';
import type { BillSummaryResponse, BillDetailsResponse } from '@/types/bill';
import type { RestaurantTableResponse } from '@/types/table';

const PAGE_SIZE = 15;

const STATUS_LABEL: Record<string, string> = {
  OPEN: 'Aberta',
  CLOSED: 'Fechada',
  PAID: 'Paga',
  CANCELLED: 'Cancelada',
};

const STATUS_COLOR: Record<string, string> = {
  OPEN: 'bg-green-100 text-green-700',
  CLOSED: 'bg-red-100 text-red-600',
  PAID: 'bg-yellow-100 text-yellow-700',
  CANCELLED: 'bg-gray-100 text-gray-500',
};

const ORDER_STATUS_LABEL: Record<string, string> = {
  'Awaiting preparation': 'Aguardando preparo',
  Preparing: 'Preparando',
  Delivered: 'Entregue',
  Cancelled: 'Cancelado',
  WAITING: 'Aguardando preparo',
  PREPARING: 'Preparando',
  DELIVERED: 'Entregue',
  CANCELLED: 'Cancelado',
};

import { getErrorMessage } from '@/lib/formatters';

// ─── Modal Nova Comanda ───────────────────────────────────────────────────────
interface NewBillModalProps {
  tables: RestaurantTableResponse[];
  onClose: () => void;
  onSaved: () => void;
}

function NewBillModal({ tables, onClose, onSaved }: NewBillModalProps) {
  const [customer, setCustomer] = useState('');
  const [tableId, setTableId] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!customer.trim()) { setError('Informe o nome do cliente.'); return; }
    setLoading(true);
    setError('');
    try {
      await createBill({ customer: customer.trim(), restaurantTableId: tableId || null });
      onSaved();
    } catch (err) {
      setError(getErrorMessage(err, 'Erro ao criar comanda.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-[#1a1a1a]">Nova Comanda</h2>
          <button onClick={onClose} className="text-[#6b7280] hover:text-[#1a1a1a] transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-2 mb-4">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#374151] mb-1">Nome do Cliente *</label>
            <input
              className="w-full border border-[#d1d5db] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3c3c3c]"
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
              placeholder="Nome do cliente"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#374151] mb-1">Mesa (opcional)</label>
            <select
              className="w-full border border-[#d1d5db] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3c3c3c] bg-white"
              value={tableId}
              onChange={(e) => setTableId(e.target.value ? Number(e.target.value) : '')}
            >
              <option value="">Sem mesa</option>
              {tables.map((t) => (
                <option key={t.id} value={t.id}>Mesa {t.number}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={onClose}
              className="px-4 py-2 text-sm border border-[#d1d5db] text-[#374151] rounded-lg hover:bg-[#f9fafb] transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={loading}
              className="px-4 py-2 text-sm bg-[#3c3c3c] text-white rounded-lg hover:bg-[#1a1a1a] transition-colors disabled:opacity-60">
              {loading ? 'Criando...' : 'Criar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Modal Detalhes da Comanda ────────────────────────────────────────────────
interface BillDetailsModalProps {
  billId: number;
  onClose: () => void;
}

function BillDetailsModal({ billId, onClose }: BillDetailsModalProps) {
  const [bill, setBill] = useState<BillDetailsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;
    getBillById(billId)
      .then((data) => { if (!ignore) setBill(data); })
      .catch(() => { if (!ignore) setError('Não foi possível carregar os detalhes da comanda.'); })
      .finally(() => { if (!ignore) setLoading(false); });
    return () => { ignore = true; };
  }, [billId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-[#1a1a1a]">Comanda #{billId}</h2>
          <button onClick={onClose} className="text-[#6b7280] hover:text-[#1a1a1a] transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-2 mb-4">
            {error}
          </div>
        )}

        {loading && (
          <div className="flex justify-center py-10">
            <div className="w-7 h-7 border-2 border-[#3c3c3c] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && bill && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-xs bg-[#f9fafb] rounded-lg p-3 border border-[#e5e7eb]">
              <div>
                <p className="text-[#9ca3af]">Cliente</p>
                <p className="font-medium text-[#1a1a1a]">{bill.customer}</p>
              </div>
              <div>
                <p className="text-[#9ca3af]">Mesa</p>
                <p className="font-medium text-[#1a1a1a]">{bill.restaurantTable ? `Mesa ${bill.restaurantTable}` : 'Sem mesa'}</p>
              </div>
              <div>
                <p className="text-[#9ca3af]">Status</p>
                <span className={`inline-block mt-0.5 text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[bill.status]}`}>
                  {STATUS_LABEL[bill.status] ?? bill.status}
                </span>
              </div>
              <div>
                <p className="text-[#9ca3af]">Total</p>
                <p className="font-bold text-[#1a1a1a]">{bill.totalPrice}</p>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-[#6b7280] uppercase tracking-wide mb-2">
                Pedidos ({bill.orders.length})
              </h3>
              {bill.orders.length === 0 ? (
                <p className="text-xs text-[#9ca3af] text-center py-6 border border-[#e5e7eb] rounded-lg">
                  Nenhum pedido lançado nesta comanda.
                </p>
              ) : (
                <div className="divide-y divide-[#f3f4f6] border border-[#e5e7eb] rounded-lg">
                  {bill.orders.map((order) => (
                    <div key={order.id} className="p-3 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-[#1a1a1a]">Pedido #{order.id}</p>
                        <p className="text-xs text-[#6b7280]">
                          {ORDER_STATUS_LABEL[order.status] ?? order.status} · {order.employee}
                        </p>
                        <p className="text-[11px] text-[#9ca3af]">{order.createdAt}</p>
                      </div>
                      <p className="text-sm font-semibold text-[#1a1a1a] shrink-0">{order.totalPrice}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button onClick={onClose}
                className="px-4 py-2 text-sm border border-[#d1d5db] text-[#374151] rounded-lg hover:bg-[#f9fafb] transition-colors">
                Fechar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Página Comandas ──────────────────────────────────────────────────────────
export default function ComandasPage() {
  const { role } = useSession();
  const canManageBill = role === 'ADMIN' || role === 'CASHIER';

  const [bills, setBills] = useState<BillSummaryResponse[]>([]);
  const [tables, setTables] = useState<RestaurantTableResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadTrigger, setReloadTrigger] = useState(0);
  const [filterStatus, setFilterStatus] = useState('');
  const [newBillModal, setNewBillModal] = useState(false);
  const [detailsBillId, setDetailsBillId] = useState<number | null>(null);
  const [actionId, setActionId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const filterMenuRef = useRef<HTMLDivElement>(null);

  const reload = useCallback(() => setReloadTrigger((n) => n + 1), []);

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
    getRestaurantTables().then(setTables).catch(() => {});
  }, []);

  useEffect(() => {
    let ignore = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setError('');

    getBills({ page, size: PAGE_SIZE })
      .then((data) => {
        if (!ignore) {
          setBills(data.content);
          setTotal(data.totalElements);
          setTotalPages(data.totalPages || 1);
        }
      })
      .catch(() => { if (!ignore) setError('Não foi possível carregar as comandas.'); })
      .finally(() => { if (!ignore) setLoading(false); });

    return () => { ignore = true; };
  }, [page, reloadTrigger]);

  const displayed = filterStatus
    ? bills.filter((b) => b.status === filterStatus)
    : bills;

  const filteredBySearch = search.trim()
    ? displayed.filter(
        (b) =>
          b.customer.toLowerCase().includes(search.toLowerCase()) ||
          String(b.id).includes(search.trim())
      )
    : displayed;

  const rangeStart = total === 0 ? 0 : page * PAGE_SIZE + 1;
  const rangeEnd = Math.min((page + 1) * PAGE_SIZE, total);

  const openCount = bills.filter((b) => b.status === 'OPEN').length;
  const closedCount = bills.filter((b) => b.status === 'CLOSED').length;
  const paidCount = bills.filter((b) => b.status === 'PAID').length;

  async function handleAction(id: number, action: 'close' | 'pay' | 'cancel') {
    setActionId(id);
    setError('');
    try {
      if (action === 'close') await closeBill(id);
      else if (action === 'pay') await payBill(id);
      else await cancelBill(id);
      reload();
    } catch (err) {
      setError(getErrorMessage(err, 'Erro ao atualizar comanda.'));
    } finally {
      setActionId(null);
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      {newBillModal && (
        <NewBillModal
          tables={tables}
          onClose={() => setNewBillModal(false)}
          onSaved={() => { setNewBillModal(false); reload(); }}
        />
      )}
      {detailsBillId !== null && (
        <BillDetailsModal
          billId={detailsBillId}
          onClose={() => setDetailsBillId(null)}
        />
      )}

      {/* Cabeçalho */}
      <div className="flex items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#1a1a1a]">Comandas</h1>
        <Link
          href="/comandas/nova"
          className="inline-flex items-center justify-center gap-1.5 bg-[#f97316] hover:bg-[#ea580c] text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors shadow-sm cursor-pointer"
        >
          <span className="text-base font-bold leading-none">+</span>
          <span>Nova Comanda</span>
        </Link>
      </div>

      {/* Status Summary Cards */}
      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {/* Abertas */}
          <div
            onClick={() => setFilterStatus(filterStatus === 'OPEN' ? '' : 'OPEN')}
            className={`bg-white rounded-xl border shadow-sm p-5 flex items-center justify-center gap-4 cursor-pointer transition-all ${
              filterStatus === 'OPEN' ? 'border-green-400 ring-2 ring-green-200' : 'border-[#e5e7eb] hover:border-green-300'
            }`}
          >
            <div className="flex-shrink-0">
              <svg className="w-7 h-7 text-green-600" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21 8l-2-4H5L3 8v10a2 2 0 002 2h14a2 2 0 002-2V8zm-4.5 1a1 1 0 01-1 1h-7a1 1 0 01-1-1V8h9v1z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-[#6b7280]">Abertas</p>
              <p className="text-2xl font-bold text-[#1a1a1a]">{openCount}</p>
            </div>
          </div>

          {/* Fechadas */}
          <div
            onClick={() => setFilterStatus(filterStatus === 'CLOSED' ? '' : 'CLOSED')}
            className={`bg-white rounded-xl border shadow-sm p-5 flex items-center justify-center gap-4 cursor-pointer transition-all ${
              filterStatus === 'CLOSED' ? 'border-red-400 ring-2 ring-red-200' : 'border-[#e5e7eb] hover:border-red-300'
            }`}
          >
            <div className="flex-shrink-0">
              <svg className="w-7 h-7 text-red-500" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm4.3 14.3a.996.996 0 01-1.41 0L12 13.41 9.11 16.3a.996.996 0 11-1.41-1.41L10.59 12 7.7 9.11A.996.996 0 119.11 7.7L12 10.59l2.89-2.89a.996.996 0 111.41 1.41L13.41 12l2.89 2.89c.38.38.38 1.02 0 1.41z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-[#6b7280]">Fechadas</p>
              <p className="text-2xl font-bold text-[#1a1a1a]">{closedCount}</p>
            </div>
          </div>

          {/* Pagas */}
          <div
            onClick={() => setFilterStatus(filterStatus === 'PAID' ? '' : 'PAID')}
            className={`bg-white rounded-xl border shadow-sm p-5 flex items-center justify-center gap-4 cursor-pointer transition-all ${
              filterStatus === 'PAID' ? 'border-yellow-400 ring-2 ring-yellow-200' : 'border-[#e5e7eb] hover:border-yellow-300'
            }`}
          >
            <div className="flex-shrink-0">
              <svg className="w-7 h-7 text-yellow-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14.93V18h-2v-1.07C9.14 16.57 8 15.42 8 14h2c0 .55.45 1 1 1h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-1.65 0-3-1.35-3-3 0-1.42 1.14-2.57 2.5-2.93V6h2v1.07C13.86 7.43 15 8.58 15 10h-2c0-.55-.45-1-1-1H10c-.55 0-1 .45-1 1s.45 1 1 1h2c1.65 0 3 1.35 3 3 0 1.42-1.14 2.57-2.5 2.93z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-[#6b7280]">Pagas</p>
              <p className="text-2xl font-bold text-[#1a1a1a]">{paidCount}</p>
            </div>
          </div>
        </div>
      )}

      {/* Main card */}
      <div className="bg-white rounded-xl shadow-sm border border-[#e5e7eb] overflow-hidden">
        {/* Search & Filter row */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-[#f3f4f6]">
          <div className="relative w-full max-w-xs sm:w-80">
            <svg
              className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#4b5563]"
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              placeholder="Pesquisar"
              className="w-full pl-9 pr-3 py-2 text-sm text-[#1a1a1a] placeholder:text-[#6b7280] border border-[#e2e8f0] rounded-md focus:outline-none focus:ring-1 focus:ring-[#f97316] focus:border-[#f97316] bg-white transition-colors"
            />
          </div>

          <div className="relative" ref={filterMenuRef}>
            <button
              type="button"
              onClick={() => setFilterMenuOpen((v) => !v)}
              className={`p-2 transition-colors cursor-pointer rounded-lg relative ${
                filterStatus ? 'text-[#f97316] bg-[#fff1e8]' : 'text-[#374151] hover:text-[#1a1a1a]'
              }`}
              aria-label="Filtrar"
              title="Filtrar por status"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z" />
              </svg>
              {filterStatus && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#f97316]" />
              )}
            </button>

            {filterMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-[#e5e7eb] py-2 z-20">
                <div className="px-3 py-1.5 text-xs font-semibold text-[#9ca3af] uppercase tracking-wider">
                  Filtrar por status
                </div>
                <button
                  type="button"
                  onClick={() => { setFilterStatus(''); setFilterMenuOpen(false); }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-[#f9fafb] cursor-pointer ${
                    filterStatus === '' ? 'text-[#f97316] font-semibold bg-[#fff7ed]' : 'text-[#374151]'
                  }`}
                >
                  <span>Todas</span>
                  {filterStatus === '' && <span>✓</span>}
                </button>
                <button
                  type="button"
                  onClick={() => { setFilterStatus('OPEN'); setFilterMenuOpen(false); }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-[#f9fafb] cursor-pointer ${
                    filterStatus === 'OPEN' ? 'text-[#f97316] font-semibold bg-[#fff7ed]' : 'text-[#374151]'
                  }`}
                >
                  <span>Abertas</span>
                  {filterStatus === 'OPEN' && <span>✓</span>}
                </button>
                <button
                  type="button"
                  onClick={() => { setFilterStatus('CLOSED'); setFilterMenuOpen(false); }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-[#f9fafb] cursor-pointer ${
                    filterStatus === 'CLOSED' ? 'text-[#f97316] font-semibold bg-[#fff7ed]' : 'text-[#374151]'
                  }`}
                >
                  <span>Fechadas</span>
                  {filterStatus === 'CLOSED' && <span>✓</span>}
                </button>
                <button
                  type="button"
                  onClick={() => { setFilterStatus('PAID'); setFilterMenuOpen(false); }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-[#f9fafb] cursor-pointer ${
                    filterStatus === 'PAID' ? 'text-[#f97316] font-semibold bg-[#fff7ed]' : 'text-[#374151]'
                  }`}
                >
                  <span>Pagas</span>
                  {filterStatus === 'PAID' && <span>✓</span>}
                </button>
                <button
                  type="button"
                  onClick={() => { setFilterStatus('CANCELLED'); setFilterMenuOpen(false); }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-[#f9fafb] cursor-pointer ${
                    filterStatus === 'CANCELLED' ? 'text-[#f97316] font-semibold bg-[#fff7ed]' : 'text-[#374151]'
                  }`}
                >
                  <span>Canceladas</span>
                  {filterStatus === 'CANCELLED' && <span>✓</span>}
                </button>
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
              <tr className="bg-white border-b border-[#e5e7eb]">
                <th className="px-6 py-4 text-sm font-semibold text-[#374151] text-center">Comanda</th>
                <th className="px-6 py-4 text-sm font-semibold text-[#374151] text-center">Mesa</th>
                <th className="px-6 py-4 text-sm font-semibold text-[#374151] text-center">Cliente</th>
                <th className="px-6 py-4 text-sm font-semibold text-[#374151] text-center">Status</th>
                <th className="px-6 py-4 text-sm font-semibold text-[#374151] text-center">Abertura</th>
                <th className="px-6 py-4 text-sm font-semibold text-[#374151] text-center">Total</th>
                <th className="px-6 py-4 text-sm font-semibold text-[#374151] text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f3f4f6]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-[#6b7280] text-sm">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-6 h-6 border-2 border-[#f97316] border-t-transparent rounded-full animate-spin mb-2" />
                      Carregando...
                    </div>
                  </td>
                </tr>
              ) : filteredBySearch.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-[#6b7280] text-sm">
                    Nenhuma comanda encontrada.
                  </td>
                </tr>
              ) : (
                filteredBySearch.map((bill) => (
                  <tr key={bill.id} className="hover:bg-[#fafafa] transition-colors">
                    <td className="px-6 py-5 font-semibold text-[#1a1a1a] text-center">#{String(bill.id).padStart(3, '0')}</td>
                    <td className="px-6 py-5 text-[#374151] text-center">{bill.restaurantTable ? `Mesa ${bill.restaurantTable}` : 'Sem mesa'}</td>
                    <td className="px-6 py-5 font-normal text-[#374151] text-center">{bill.customer}</td>
                    <td className="px-6 py-5 text-center">
                      <span className={`text-xs px-2.5 py-1 rounded font-medium inline-block ${STATUS_COLOR[bill.status]}`}>
                        {STATUS_LABEL[bill.status] ?? bill.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-[#374151] text-sm text-center">
                      {bill.createdAt.includes(' às ') ? (
                        <>
                          <span className="block">{bill.createdAt.split(' às ')[0]} às</span>
                          <span className="block">{bill.createdAt.split(' às ')[1]}</span>
                        </>
                      ) : (
                        bill.createdAt
                      )}
                    </td>
                    <td className="px-6 py-5 font-medium text-[#1a1a1a] text-center">{bill.totalPrice}</td>
                    <td className="px-6 py-5 text-center">
                      <div className="flex items-center justify-center gap-2 text-[#374151]">
                        <Link
                          href={`/comandas/${bill.id}`}
                          aria-label="Ver detalhes"
                          title="Ver detalhes"
                          className="text-[#374151] hover:text-[#1a1a1a] transition-colors p-1 cursor-pointer"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                          </svg>
                        </Link>
                        {/* Fechar comanda */}
                        {bill.status === 'OPEN' && canManageBill && (
                          <button
                            type="button"
                            onClick={() => handleAction(bill.id, 'close')}
                            disabled={actionId === bill.id}
                            aria-label="Fechar comanda"
                            title="Fechar comanda"
                            className="text-[#374151] hover:text-amber-600 transition-colors p-1 cursor-pointer disabled:opacity-60"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                            </svg>
                          </button>
                        )}
                        {/* Pagar comanda */}
                        {(bill.status === 'CLOSED' || bill.status === 'OPEN') && canManageBill && (
                          <button
                            type="button"
                            onClick={() => handleAction(bill.id, 'pay')}
                            disabled={actionId === bill.id}
                            aria-label="Pagar comanda"
                            title="Pagar comanda"
                            className="text-[#374151] hover:text-green-600 transition-colors p-1 cursor-pointer disabled:opacity-60"
                          >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14.93V18h-2v-1.07C9.14 16.57 8 15.42 8 14h2c0 .55.45 1 1 1h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-1.65 0-3-1.35-3-3 0-1.42 1.14-2.57 2.5-2.93V6h2v1.07C13.86 7.43 15 8.58 15 10h-2c0-.55-.45-1-1-1H10c-.55 0-1 .45-1 1s.45 1 1 1h2c1.65 0 3 1.35 3 3 0 1.42-1.14 2.57-2.5 2.93z" />
                            </svg>
                          </button>
                        )}
                        <button
                          onClick={() => handleAction(bill.id, 'cancel')}
                          disabled={actionId === bill.id || bill.status !== 'OPEN'}
                          aria-label="Cancelar comanda"
                          title="Cancelar comanda"
                          className="text-[#374151] hover:text-red-600 transition-colors p-1 cursor-pointer disabled:opacity-30"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                          </svg>
                        </button>
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
          ) : filteredBySearch.length === 0 ? (
            <div className="p-8 text-center text-[#6b7280] text-sm">Nenhuma comanda encontrada.</div>
          ) : (
            filteredBySearch.map((bill) => (
              <div key={bill.id} className="p-4 flex flex-col gap-2 hover:bg-[#fafafa] transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-sm text-[#1a1a1a]">
                      #{String(bill.id).padStart(3, '0')} · {bill.customer}
                    </h3>
                    <p className="text-xs text-[#6b7280] mt-0.5">
                      {bill.restaurantTable ? `Mesa ${bill.restaurantTable}` : 'Sem mesa'} · {bill.createdAt}
                    </p>
                  </div>
                  <span className={`shrink-0 text-xs px-2.5 py-1 rounded font-medium ${STATUS_COLOR[bill.status]}`}>
                    {STATUS_LABEL[bill.status] ?? bill.status}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#f9fafb]">
                  <p className="font-bold text-[#1a1a1a]">{bill.totalPrice}</p>
                  <div className="flex items-center gap-2">
                    <Link href={`/comandas/${bill.id}`} className="p-1 text-[#374151] hover:text-[#1a1a1a]" aria-label="Ver detalhes">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                      </svg>
                    </Link>
                    {bill.status === 'OPEN' && canManageBill && (
                      <button
                        type="button"
                        onClick={() => handleAction(bill.id, 'close')}
                        disabled={actionId === bill.id}
                        title="Fechar comanda"
                        aria-label="Fechar comanda"
                        className="p-1 text-[#374151] hover:text-amber-600 disabled:opacity-60 cursor-pointer"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                        </svg>
                      </button>
                    )}
                    {(bill.status === 'CLOSED' || bill.status === 'OPEN') && canManageBill && (
                      <button
                        type="button"
                        onClick={() => handleAction(bill.id, 'pay')}
                        disabled={actionId === bill.id}
                        title="Pagar comanda"
                        aria-label="Pagar comanda"
                        className="p-1 text-[#374151] hover:text-green-600 disabled:opacity-60 cursor-pointer"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14.93V18h-2v-1.07C9.14 16.57 8 15.42 8 14h2c0 .55.45 1 1 1h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-1.65 0-3-1.35-3-3 0-1.42 1.14-2.57 2.5-2.93V6h2v1.07C13.86 7.43 15 8.58 15 10h-2c0-.55-.45-1-1-1H10c-.55 0-1 .45-1 1s.45 1 1 1h2c1.65 0 3 1.35 3 3 0 1.42-1.14 2.57-2.5 2.93z" />
                        </svg>
                      </button>
                    )}
                    <button
                      onClick={() => handleAction(bill.id, 'cancel')}
                      disabled={actionId === bill.id || bill.status !== 'OPEN'}
                      className="p-1 text-[#374151] hover:text-red-600 disabled:opacity-30"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-[#f3f4f6]">
          <div className="flex-1 text-center sm:text-center text-xs text-[#6b7280]">
            {total === 0 ? 'Nenhum registro' : `Mostrando ${rangeStart} a ${rangeEnd} de ${total} registros`}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
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
