'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  getBills,
  getBillById,
  createBill,
  closeBill,
  payBill,
  cancelBill,
  createBillOrder,
  getRestaurantTables,
  getProducts,
  getUsers,
} from '@/lib/api';
import { useSession } from '@/lib/use-session';
import type { BillSummaryResponse, BillDetailsResponse } from '@/types/bill';
import type { RestaurantTableResponse } from '@/types/table';
import type { ProductSummaryResponse } from '@/types/product';
import type { UserResponse } from '@/types/user';
import type { OrderItemCreateRequest } from '@/types/order';

const PAGE_SIZE = 15;

const STATUS_LABEL: Record<string, string> = {
  OPEN: 'Aberta',
  CLOSED: 'Fechada',
  PAID: 'Paga',
  CANCELLED: 'Cancelada',
};

const STATUS_COLOR: Record<string, string> = {
  OPEN: 'bg-green-100 text-green-700',
  CLOSED: 'bg-orange-100 text-orange-700',
  PAID: 'bg-blue-100 text-blue-700',
  CANCELLED: 'bg-gray-100 text-gray-500',
};

const ORDER_STATUS_LABEL: Record<string, string> = {
  'Awaiting preparation': 'Aguardando preparo',
  Preparing: 'Preparando',
  Delivered: 'Entregue',
  Cancelled: 'Cancelado',
};

function getErrorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === 'object' && 'message' in err && typeof err.message === 'string') {
    return err.message;
  }
  return fallback;
}

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

// ─── Modal Novo Pedido na Comanda ─────────────────────────────────────────────
interface NewOrderModalProps {
  bill: BillSummaryResponse;
  onClose: () => void;
  onSaved: () => void;
}

function NewOrderModal({ bill, onClose, onSaved }: NewOrderModalProps) {
  const [products, setProducts] = useState<ProductSummaryResponse[]>([]);
  const [employees, setEmployees] = useState<UserResponse[]>([]);
  const [employeeId, setEmployeeId] = useState<number | ''>('');
  const [items, setItems] = useState<OrderItemCreateRequest[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;
    Promise.all([
      getProducts({ size: 100 }),
      getUsers({ excludeRole: 'COOK', size: 100 }),
    ])
      .then(([productsPage, usersPage]) => {
        if (ignore) return;
        const available = productsPage.content.filter((p) => p.isAvailable);
        setProducts(available);
        setEmployees(usersPage.content);
        if (usersPage.content.length > 0) setEmployeeId(usersPage.content[0].id);
        if (available.length > 0) setItems([{ productId: available[0].id, quantity: 1, note: '' }]);
      })
      .catch(() => {
        if (!ignore) setError('Não foi possível carregar produtos ou atendentes.');
      })
      .finally(() => {
        if (!ignore) setLoadingData(false);
      });
    return () => { ignore = true; };
  }, []);

  function addItem() {
    if (products.length === 0) return;
    setItems((prev) => [...prev, { productId: products[0].id, quantity: 1, note: '' }]);
  }

  function updateItem(index: number, patch: Partial<OrderItemCreateRequest>) {
    setItems((prev) => prev.map((item, idx) => (idx === index ? { ...item, ...patch } : item)));
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!employeeId) { setError('Selecione o atendente.'); return; }
    if (items.length === 0) { setError('Adicione pelo menos 1 item.'); return; }
    setSaving(true);
    setError('');
    try {
      await createBillOrder(bill.id, {
        employeeId: Number(employeeId),
        items: items.map((i) => ({
          productId: Number(i.productId),
          quantity: Math.max(1, Number(i.quantity)),
          note: i.note?.trim() || undefined,
        })),
      });
      onSaved();
    } catch (err) {
      setError(getErrorMessage(err, 'Erro ao criar pedido.'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-[#1a1a1a]">Novo Pedido — Comanda #{bill.id}</h2>
            <p className="text-xs text-[#6b7280]">{bill.customer}{bill.restaurantTable ? ` · Mesa ${bill.restaurantTable}` : ''}</p>
          </div>
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

        {loadingData ? (
          <div className="flex justify-center py-10">
            <div className="w-7 h-7 border-2 border-[#3c3c3c] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#374151] mb-1">Atendente *</label>
              <select
                className="w-full border border-[#d1d5db] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3c3c3c] bg-white"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value ? Number(e.target.value) : '')}
              >
                <option value="">Selecione</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.role})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium text-[#374151]">Itens do Pedido *</label>
                <button type="button" onClick={addItem} className="text-xs text-[#3c3c3c] font-medium hover:underline">
                  + Adicionar item
                </button>
              </div>
              {products.length === 0 ? (
                <p className="text-xs text-[#9ca3af] py-4 text-center">Nenhum produto disponível no menu.</p>
              ) : (
                <div className="space-y-2">
                  {items.map((item, idx) => (
                    <div key={idx} className="p-3 bg-[#f9fafb] rounded-lg border border-[#e5e7eb] space-y-2">
                      <div className="flex gap-2">
                        <select
                          className="flex-1 border border-[#d1d5db] rounded-lg px-2.5 py-1.5 text-sm bg-white"
                          value={item.productId}
                          onChange={(e) => updateItem(idx, { productId: Number(e.target.value) })}
                        >
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} — {p.price}
                            </option>
                          ))}
                        </select>
                        <input
                          type="number"
                          min={1}
                          className="w-16 border border-[#d1d5db] rounded-lg px-2 py-1.5 text-sm bg-white text-center"
                          value={item.quantity}
                          onChange={(e) => updateItem(idx, { quantity: Number(e.target.value) || 1 })}
                        />
                        <button
                          type="button"
                          onClick={() => removeItem(idx)}
                          className="px-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Remover item"
                        >
                          ✕
                        </button>
                      </div>
                      <input
                        className="w-full border border-[#d1d5db] rounded-lg px-2.5 py-1.5 text-xs bg-white"
                        placeholder="Observação (opcional)"
                        value={item.note ?? ''}
                        onChange={(e) => updateItem(idx, { note: e.target.value })}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={onClose}
                className="px-4 py-2 text-sm border border-[#d1d5db] text-[#374151] rounded-lg hover:bg-[#f9fafb] transition-colors">
                Cancelar
              </button>
              <button type="submit" disabled={saving || products.length === 0}
                className="px-4 py-2 text-sm bg-[#3c3c3c] text-white rounded-lg hover:bg-[#1a1a1a] transition-colors disabled:opacity-60">
                {saving ? 'Enviando...' : 'Lançar Pedido'}
              </button>
            </div>
          </form>
        )}
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
  const [orderBill, setOrderBill] = useState<BillSummaryResponse | null>(null);
  const [detailsBillId, setDetailsBillId] = useState<number | null>(null);
  const [actionId, setActionId] = useState<number | null>(null);

  const reload = useCallback(() => setReloadTrigger((n) => n + 1), []);

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

  const displayed = filterStatus ? bills.filter((b) => b.status === filterStatus) : bills;

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
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {newBillModal && (
        <NewBillModal
          tables={tables}
          onClose={() => setNewBillModal(false)}
          onSaved={() => { setNewBillModal(false); reload(); }}
        />
      )}
      {orderBill && (
        <NewOrderModal
          bill={orderBill}
          onClose={() => setOrderBill(null)}
          onSaved={() => { setOrderBill(null); reload(); }}
        />
      )}
      {detailsBillId !== null && (
        <BillDetailsModal
          billId={detailsBillId}
          onClose={() => setDetailsBillId(null)}
        />
      )}

      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-bold text-[#1a1a1a]">Comandas</h1>
          <p className="text-sm text-[#6b7280] mt-0.5">{total} comanda{total !== 1 ? 's' : ''} no total</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            className="border border-[#d1d5db] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3c3c3c] bg-white"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">Todos os status</option>
            <option value="OPEN">Aberta</option>
            <option value="CLOSED">Fechada</option>
            <option value="PAID">Paga</option>
            <option value="CANCELLED">Cancelada</option>
          </select>
          <button
            onClick={() => setNewBillModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm bg-[#3c3c3c] text-white rounded-lg hover:bg-[#1a1a1a] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Nova Comanda
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-4">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-[#3c3c3c] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Empty state */}
      {!loading && displayed.length === 0 && (
        <div className="text-center py-16 text-[#9ca3af]">
          <svg className="w-12 h-12 mx-auto mb-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-sm">Nenhuma comanda encontrada.</p>
          <button onClick={() => setNewBillModal(true)} className="mt-3 text-sm text-[#3c3c3c] font-medium hover:underline">
            Criar primeira comanda
          </button>
        </div>
      )}

      {/* Tabela desktop / cards mobile */}
      {!loading && displayed.length > 0 && (
        <>
          {/* Desktop table */}
          <div className="hidden md:block bg-white rounded-xl border border-[#e5e7eb] overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#f3f4f6] bg-[#f9fafb]">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#6b7280] uppercase tracking-wide">#</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#6b7280] uppercase tracking-wide">Cliente</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#6b7280] uppercase tracking-wide">Mesa</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#6b7280] uppercase tracking-wide">Status</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#6b7280] uppercase tracking-wide">Total</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#6b7280] uppercase tracking-wide">Abertura</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {displayed.map((bill) => (
                  <tr key={bill.id} className="border-b border-[#f9fafb] hover:bg-[#fafafa] transition-colors">
                    <td className="px-5 py-3 text-[#6b7280] font-mono text-xs">#{bill.id}</td>
                    <td className="px-5 py-3 font-medium text-[#1a1a1a]">{bill.customer}</td>
                    <td className="px-5 py-3 text-[#6b7280]">{bill.restaurantTable ? `Mesa ${bill.restaurantTable}` : '—'}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLOR[bill.status]}`}>
                        {STATUS_LABEL[bill.status] ?? bill.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-semibold text-[#1a1a1a]">{bill.totalPrice}</td>
                    <td className="px-5 py-3 text-[#6b7280] text-xs">{bill.createdAt}</td>
                    <td className="px-5 py-3">
                      <div className="flex gap-1.5 justify-end">
                        <button
                          onClick={() => setDetailsBillId(bill.id)}
                          className="text-xs px-2.5 py-1 border border-[#d1d5db] text-[#374151] rounded-lg hover:bg-[#f9fafb] transition-colors"
                        >
                          Detalhes
                        </button>
                        {bill.status === 'OPEN' && (
                          <>
                            <button
                              onClick={() => setOrderBill(bill)}
                              className="text-xs px-2.5 py-1 bg-[#3c3c3c] text-white rounded-lg hover:bg-[#1a1a1a] transition-colors"
                            >
                              + Pedido
                            </button>
                            {canManageBill && (
                              <>
                                <button
                                  onClick={() => handleAction(bill.id, 'close')}
                                  disabled={actionId === bill.id}
                                  className="text-xs px-2.5 py-1 border border-orange-300 text-orange-600 rounded-lg hover:bg-orange-50 transition-colors disabled:opacity-60"
                                >
                                  Fechar
                                </button>
                                <button
                                  onClick={() => handleAction(bill.id, 'cancel')}
                                  disabled={actionId === bill.id}
                                  className="text-xs px-2.5 py-1 border border-red-200 text-red-500 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-60"
                                >
                                  Cancelar
                                </button>
                              </>
                            )}
                          </>
                        )}
                        {bill.status === 'CLOSED' && canManageBill && (
                          <button
                            onClick={() => handleAction(bill.id, 'pay')}
                            disabled={actionId === bill.id}
                            className="text-xs px-2.5 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-60"
                          >
                            {actionId === bill.id ? 'Aguarde...' : 'Pagar'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {displayed.map((bill) => (
              <div key={bill.id} className="bg-white rounded-xl border border-[#e5e7eb] p-4 shadow-sm">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <p className="font-semibold text-[#1a1a1a]">{bill.customer}</p>
                    <p className="text-xs text-[#6b7280]">Comanda #{bill.id} · {bill.restaurantTable ? `Mesa ${bill.restaurantTable}` : 'Sem mesa'}</p>
                    <p className="text-xs text-[#9ca3af] mt-0.5">{bill.createdAt}</p>
                  </div>
                  <span className={`shrink-0 text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLOR[bill.status]}`}>
                    {STATUS_LABEL[bill.status] ?? bill.status}
                  </span>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-bold text-[#1a1a1a]">{bill.totalPrice}</p>
                  <div className="flex flex-wrap gap-1.5">
                    <button onClick={() => setDetailsBillId(bill.id)}
                      className="text-xs px-2.5 py-1.5 border border-[#d1d5db] text-[#374151] rounded-lg hover:bg-[#f9fafb] transition-colors">
                      Detalhes
                    </button>
                    {bill.status === 'OPEN' && (
                      <>
                        <button onClick={() => setOrderBill(bill)}
                          className="text-xs px-2.5 py-1.5 bg-[#3c3c3c] text-white rounded-lg hover:bg-[#1a1a1a] transition-colors">
                          + Pedido
                        </button>
                        {canManageBill && (
                          <>
                            <button onClick={() => handleAction(bill.id, 'close')} disabled={actionId === bill.id}
                              className="text-xs px-3 py-1.5 border border-orange-300 text-orange-600 rounded-lg hover:bg-orange-50 transition-colors disabled:opacity-60">
                              Fechar
                            </button>
                            <button onClick={() => handleAction(bill.id, 'cancel')} disabled={actionId === bill.id}
                              className="text-xs px-3 py-1.5 border border-red-200 text-red-500 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-60">
                              Cancelar
                            </button>
                          </>
                        )}
                      </>
                    )}
                    {bill.status === 'CLOSED' && canManageBill && (
                      <button onClick={() => handleAction(bill.id, 'pay')} disabled={actionId === bill.id}
                        className="text-xs px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-60">
                        {actionId === bill.id ? 'Aguarde...' : 'Pagar'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Paginação */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}
            className="px-3 py-1.5 text-sm border border-[#d1d5db] rounded-lg hover:bg-[#f9fafb] disabled:opacity-40 transition-colors">
            ← Anterior
          </button>
          <span className="text-sm text-[#6b7280]">Página {page + 1} de {totalPages}</span>
          <button onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
            className="px-3 py-1.5 text-sm border border-[#d1d5db] rounded-lg hover:bg-[#f9fafb] disabled:opacity-40 transition-colors">
            Próxima →
          </button>
        </div>
      )}
    </div>
  );
}
