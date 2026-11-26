'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Link from 'next/link';
import {
  getOrders,
  getOrderById,
  updateOrder,
  prepareOrder,
  deliverOrder,
  cancelOrder,
  getProducts,
  getUsers,
} from '@/lib/api';
import { useSession } from '@/lib/use-session';
import type {
  OrderSummaryResponse,
  OrderDetailsResponse,
  OrderItemCreateRequest,
} from '@/types/order';
import type { ProductSummaryResponse } from '@/types/product';
import type { UserResponse } from '@/types/user';

const PAGE_SIZE = 10;

type CanonicalStatus = 'WAITING' | 'PREPARING' | 'DELIVERED' | 'CANCELLED';

function normalizeStatus(status?: string | null): CanonicalStatus {
  if (!status) return 'WAITING';
  const s = status.toLowerCase();
  if (s.includes('await') || s.includes('aguardando') || s === 'waiting') return 'WAITING';
  if (s.includes('prepar') || s.includes('andamento') || s === 'preparing') return 'PREPARING';
  if (s.includes('deliver') || s.includes('entregue') || s === 'delivered') return 'DELIVERED';
  if (s.includes('cancel') || s.includes('cancelado') || s === 'cancelled') return 'CANCELLED';
  return 'WAITING';
}

const STATUS_DETAILS: Record<
  CanonicalStatus,
  {
    label: string;
    cardLabel: string;
    badgeClass: string;
  }
> = {
  WAITING: {
    label: 'Aguardando',
    cardLabel: 'Aguardando',
    badgeClass: 'bg-[#e0f2fe] text-[#0284c7] border border-[#bae6fd]',
  },
  PREPARING: {
    label: 'Em Andamento',
    cardLabel: 'Em Andamento',
    badgeClass: 'bg-[#fef9c3] text-[#ca8a04] border border-[#fef08a]',
  },
  DELIVERED: {
    label: 'Entregue',
    cardLabel: 'Entregues',
    badgeClass: 'bg-[#dcfce7] text-[#16a34a] border border-[#bbf7d0]',
  },
  CANCELLED: {
    label: 'Cancelado',
    cardLabel: 'Cancelados',
    badgeClass: 'bg-[#fee2e2] text-[#dc2626] border border-[#fecaca]',
  },
};

function getErrorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === 'object' && 'message' in err && typeof err.message === 'string') {
    return err.message;
  }
  return fallback;
}

// ─── Modal Detalhes / Edição de Pedido ───────────────────────────────────────
interface OrderModalProps {
  orderId: number;
  canEditOrder: boolean;
  onClose: () => void;
  onSaved: () => void;
  onActionComplete: () => void;
}

function OrderModal({
  orderId,
  canEditOrder,
  onClose,
  onSaved,
  onActionComplete,
}: OrderModalProps) {
  const [order, setOrder] = useState<OrderDetailsResponse | null>(null);
  const [products, setProducts] = useState<ProductSummaryResponse[]>([]);
  const [employees, setEmployees] = useState<UserResponse[]>([]);
  const [employeeId, setEmployeeId] = useState<number | ''>('');
  const [items, setItems] = useState<OrderItemCreateRequest[]>([]);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;
    Promise.all([
      getOrderById(orderId),
      canEditOrder ? getProducts({ size: 100 }) : Promise.resolve(null),
      canEditOrder ? getUsers({ excludeRole: 'COOK', size: 100 }) : Promise.resolve(null),
    ])
      .then(([orderData, productsPage, usersPage]) => {
        if (ignore) return;
        setOrder(orderData);
        if (productsPage) setProducts(productsPage.content.filter((p) => p.isAvailable));
        if (usersPage) setEmployees(usersPage.content);
        setEmployeeId(orderData.employee.id);
        setItems(
          orderData.items.map((i) => ({
            productId: i.product.id,
            quantity: i.quantity,
            note: i.note ?? '',
          })),
        );
      })
      .catch(() => {
        if (!ignore) setError('Não foi possível carregar os detalhes do pedido.');
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [orderId, canEditOrder]);

  const canonicalStatus = normalizeStatus(order?.status);
  const canEdit = canEditOrder && canonicalStatus === 'WAITING';

  function addItem() {
    const firstProduct = products[0];
    if (!firstProduct) return;
    setItems((prev) => [...prev, { productId: firstProduct.id, quantity: 1, note: '' }]);
  }

  function updateItem(index: number, patch: Partial<OrderItemCreateRequest>) {
    setItems((prev) => prev.map((item, idx) => (idx === index ? { ...item, ...patch } : item)));
  }

  function removeItem(index: number) {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!employeeId) {
      setError('Selecione o atendente responsável.');
      return;
    }
    if (items.length === 0) {
      setError('O pedido precisa ter pelo menos 1 item.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await updateOrder(orderId, {
        employeeId: Number(employeeId),
        items: items.map((item) => ({
          productId: Number(item.productId),
          quantity: Math.max(1, Number(item.quantity)),
          note: item.note?.trim() || undefined,
        })),
      });
      onSaved();
    } catch (err) {
      setError(getErrorMessage(err, 'Erro ao atualizar pedido.'));
    } finally {
      setSaving(false);
    }
  }

  async function handleAdvanceStatus(action: 'prepare' | 'deliver' | 'cancel') {
    setActionLoading(true);
    setError('');
    try {
      if (action === 'prepare') await prepareOrder(orderId);
      else if (action === 'deliver') await deliverOrder(orderId);
      else await cancelOrder(orderId);
      onActionComplete();
      onClose();
    } catch (err) {
      setError(getErrorMessage(err, 'Erro ao atualizar status do pedido.'));
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-[#1a1a1a]">Pedido #{orderId}</h2>
            {order && (
              <span
                className={`inline-block mt-1 text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                  STATUS_DETAILS[canonicalStatus].badgeClass
                }`}
              >
                {STATUS_DETAILS[canonicalStatus].label}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-[#6b7280] hover:text-[#1a1a1a] p-1.5 rounded-lg transition-colors cursor-pointer"
            aria-label="Fechar modal"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-2.5 mb-4">
            {error}
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-12 text-[#6b7280]">
            <div className="w-7 h-7 border-2 border-[#f97316] border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-sm">Carregando detalhes do pedido...</p>
          </div>
        )}

        {!loading && order && !editing && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3 text-xs bg-[#f9fafb] rounded-xl p-3.5 border border-[#e5e7eb]">
              <div>
                <p className="text-[#9ca3af]">Cliente</p>
                <p className="font-semibold text-[#1a1a1a] text-sm mt-0.5">{order.customer}</p>
              </div>
              <div>
                <p className="text-[#9ca3af]">Mesa</p>
                <p className="font-semibold text-[#1a1a1a] text-sm mt-0.5">
                  {order.restaurantTable ? `Mesa ${order.restaurantTable.number}` : 'Sem mesa'}
                </p>
              </div>
              <div>
                <p className="text-[#9ca3af]">Atendente</p>
                <p className="font-semibold text-[#1a1a1a] text-sm mt-0.5">{order.employee.name}</p>
              </div>
              <div>
                <p className="text-[#9ca3af]">Total</p>
                <p className="font-bold text-[#f97316] text-base mt-0.5">{order.totalPrice}</p>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold text-[#6b7280] uppercase tracking-wider mb-2">
                Itens do Pedido ({order.items.length})
              </h3>
              <div className="divide-y divide-[#f3f4f6] border border-[#e5e7eb] rounded-xl overflow-hidden max-h-56 overflow-y-auto">
                {order.items.map((item, idx) => (
                  <div key={idx} className="p-3 bg-white flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[#1a1a1a]">
                        {item.quantity}x {item.product.name}
                      </p>
                      {item.note && (
                        <p className="text-xs text-[#6b7280] mt-0.5 italic">Obs: {item.note}</p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-[#1a1a1a]">{item.totalPrice}</p>
                      <p className="text-[11px] text-[#9ca3af]">{item.unitPrice} un.</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick action buttons for advancing status */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#f3f4f6]">
              <div className="flex flex-wrap gap-2">
                {canonicalStatus === 'WAITING' && (
                  <button
                    type="button"
                    onClick={() => handleAdvanceStatus('prepare')}
                    disabled={actionLoading}
                    className="px-3.5 py-2 text-xs font-bold bg-[#eab308] hover:bg-[#ca8a04] text-white rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                  >
                    Iniciar Preparo
                  </button>
                )}
                {canonicalStatus === 'PREPARING' && (
                  <button
                    type="button"
                    onClick={() => handleAdvanceStatus('deliver')}
                    disabled={actionLoading}
                    className="px-3.5 py-2 text-xs font-bold bg-[#16a34a] hover:bg-[#15803d] text-white rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                  >
                    Marcar como Entregue
                  </button>
                )}
                {canonicalStatus !== 'CANCELLED' && canonicalStatus !== 'DELIVERED' && canEditOrder && (
                  <button
                    type="button"
                    onClick={() => handleAdvanceStatus('cancel')}
                    disabled={actionLoading}
                    className="px-3 py-2 text-xs font-medium border border-red-200 text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                  >
                    Cancelar Pedido
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                {canEdit && (
                  <button
                    type="button"
                    onClick={() => setEditing(true)}
                    className="px-4 py-2 text-sm font-medium border border-[#d1d5db] text-[#374151] rounded-xl hover:bg-[#f9fafb] transition-colors cursor-pointer"
                  >
                    Editar Itens
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium bg-[#1a1a1a] text-white rounded-xl hover:bg-[#333333] transition-colors cursor-pointer"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}

        {!loading && order && editing && (
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1">Atendente *</label>
              <select
                className="w-full border border-[#d1d5db] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#f97316] bg-white text-[#1a1a1a]"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value ? Number(e.target.value) : '')}
              >
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.role})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-[#374151]">Itens *</label>
                <button
                  type="button"
                  onClick={addItem}
                  className="text-xs font-semibold text-[#f97316] hover:text-[#ea580c] cursor-pointer"
                >
                  + Adicionar item
                </button>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {items.map((item, idx) => (
                  <div key={idx} className="p-3 bg-[#f9fafb] rounded-xl border border-[#e5e7eb] space-y-2">
                    <div className="flex gap-2 items-center">
                      <select
                        className="flex-1 border border-[#d1d5db] rounded-lg px-2.5 py-1.5 text-sm bg-white text-[#1a1a1a]"
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
                        className="w-16 border border-[#d1d5db] rounded-lg px-2 py-1.5 text-sm bg-white text-center font-medium text-[#1a1a1a]"
                        value={item.quantity}
                        onChange={(e) => updateItem(idx, { quantity: Number(e.target.value) || 1 })}
                      />
                      <button
                        type="button"
                        onClick={() => removeItem(idx)}
                        disabled={items.length <= 1}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 cursor-pointer"
                        title="Remover item"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <input
                      className="w-full border border-[#d1d5db] rounded-lg px-2.5 py-1.5 text-xs bg-white text-[#1a1a1a]"
                      placeholder="Observação (opcional)"
                      value={item.note ?? ''}
                      onChange={(e) => updateItem(idx, { note: e.target.value })}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-[#f3f4f6]">
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="px-4 py-2 text-sm font-medium border border-[#d1d5db] text-[#374151] rounded-xl hover:bg-[#f9fafb] transition-colors cursor-pointer"
              >
                Voltar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 text-sm font-bold bg-[#f97316] hover:bg-[#ea580c] text-white rounded-xl transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
              >
                {saving ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// ─── Main Pedidos Page Component ─────────────────────────────────────────────
export default function PedidosPage() {
  const { role } = useSession();
  const canManageOrders = role !== null && role !== 'COOK';

  const [orders, setOrders] = useState<OrderSummaryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<CanonicalStatus | 'ALL'>('ALL');
  const [page, setPage] = useState(0);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  // Modals state
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [confirmCancelId, setConfirmCancelId] = useState<number | null>(null);
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  // Filter dropdown toggle
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const filterMenuRef = useRef<HTMLDivElement>(null);

  const reload = useCallback(() => setReloadTrigger((n) => n + 1), []);

  // Fetch all orders
  useEffect(() => {
    let ignore = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setError('');

    getOrders({ size: 100 })
      .then((data) => {
        if (!ignore) {
          setOrders(data.content);
        }
      })
      .catch(() => {
        if (!ignore) setError('Não foi possível carregar os pedidos.');
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [reloadTrigger]);

  // Close filter popover on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (filterMenuRef.current && !filterMenuRef.current.contains(e.target as Node)) {
        setFilterMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Counts for top KPI cards
  const counts = useMemo(() => {
    let waiting = 0;
    let preparing = 0;
    let delivered = 0;
    let cancelled = 0;

    orders.forEach((o) => {
      const status = normalizeStatus(o.status);
      if (status === 'WAITING') waiting++;
      else if (status === 'PREPARING') preparing++;
      else if (status === 'DELIVERED') delivered++;
      else if (status === 'CANCELLED') cancelled++;
    });

    return { waiting, preparing, delivered, cancelled };
  }, [orders]);

  // Client-side search and status filter
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Status filter
      if (selectedStatus !== 'ALL') {
        const orderStatus = normalizeStatus(order.status);
        if (orderStatus !== selectedStatus) return false;
      }

      // Search filter
      if (!search.trim()) return true;

      const q = search.trim().toLowerCase();
      const orderIdStr = String(order.id);
      const matchesId = orderIdStr.includes(q) || `#${orderIdStr}`.includes(q);
      const matchesCustomer = order.customer?.toLowerCase().includes(q) ?? false;
      const matchesEmployee = order.employee?.toLowerCase().includes(q) ?? false;
      const tableStr = order.restaurantTable ? String(order.restaurantTable) : '';
      const matchesTable = tableStr.includes(q) || `mesa ${tableStr}`.toLowerCase().includes(q);

      return matchesId || matchesCustomer || matchesEmployee || matchesTable;
    });
  }, [orders, selectedStatus, search]);

  // Pagination calculation
  const totalRecords = filteredOrders.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages - 1);

  const paginatedOrders = useMemo(() => {
    const start = currentPage * PAGE_SIZE;
    return filteredOrders.slice(start, start + PAGE_SIZE);
  }, [filteredOrders, currentPage]);

  const rangeStart = totalRecords === 0 ? 0 : currentPage * PAGE_SIZE + 1;
  const rangeEnd = Math.min((currentPage + 1) * PAGE_SIZE, totalRecords);

  async function handleCancelOrder(id: number) {
    setCancellingId(id);
    try {
      await cancelOrder(id);
      setConfirmCancelId(null);
      reload();
    } catch (err) {
      alert(getErrorMessage(err, 'Erro ao cancelar pedido.'));
    } finally {
      setCancellingId(null);
    }
  }

  function handleCardClick(status: CanonicalStatus) {
    if (selectedStatus === status) {
      setSelectedStatus('ALL');
    } else {
      setSelectedStatus(status);
    }
    setPage(0);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* ─── Top Header: Title & "+ Novo Pedido" button ─── */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1a1a1a]">Pedidos</h1>
        </div>
        {canManageOrders && (
          <Link
            href="/pedidos/novo"
            className="inline-flex items-center justify-center gap-1.5 bg-[#f97316] hover:bg-[#ea580c] text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors shadow-sm cursor-pointer"
          >
            <span className="text-base font-bold leading-none">+</span>
            <span>Novo Pedido</span>
          </Link>
        )}
      </div>

      {/* ─── 4 Metric Cards (Aguardando, Em Andamento, Entregues, Cancelados) ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Card 1: Aguardando */}
        <div
          onClick={() => handleCardClick('WAITING')}
          className={`bg-white rounded-2xl p-5 sm:p-6 border transition-all cursor-pointer shadow-sm hover:shadow ${
            selectedStatus === 'WAITING'
              ? 'border-[#0284c7] ring-2 ring-[#e0f2fe]'
              : 'border-[#e5e7eb] hover:border-gray-300'
          }`}
        >
          <div className="flex items-center gap-3 mb-3">
            {/* Blue spinner / loading dots icon */}
            <div className="w-8 h-8 rounded-full bg-[#f0f9ff] flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-[#0284c7] animate-spin" viewBox="0 0 24 24" fill="none">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </div>
            <span className="text-sm font-medium text-[#4b5563]">Aguardando</span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-[#1a1a1a] ml-1">{counts.waiting}</p>
        </div>

        {/* Card 2: Em Andamento */}
        <div
          onClick={() => handleCardClick('PREPARING')}
          className={`bg-white rounded-2xl p-5 sm:p-6 border transition-all cursor-pointer shadow-sm hover:shadow ${
            selectedStatus === 'PREPARING'
              ? 'border-[#ca8a04] ring-2 ring-[#fef9c3]'
              : 'border-[#e5e7eb] hover:border-gray-300'
          }`}
        >
          <div className="flex items-center gap-3 mb-3">
            {/* Hourglass icon */}
            <div className="w-8 h-8 rounded-full bg-[#fefce8] flex items-center justify-center shrink-0">
              <svg
                className="w-5 h-5 text-[#ca8a04]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 22h14" />
                <path d="M5 2h14" />
                <path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22" />
                <path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2" />
              </svg>
            </div>
            <span className="text-sm font-medium text-[#4b5563]">Em Andamento</span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-[#1a1a1a] ml-1">{counts.preparing}</p>
        </div>

        {/* Card 3: Entregues */}
        <div
          onClick={() => handleCardClick('DELIVERED')}
          className={`bg-white rounded-2xl p-5 sm:p-6 border transition-all cursor-pointer shadow-sm hover:shadow ${
            selectedStatus === 'DELIVERED'
              ? 'border-[#16a34a] ring-2 ring-[#dcfce7]'
              : 'border-[#e5e7eb] hover:border-gray-300'
          }`}
        >
          <div className="flex items-center gap-3 mb-3">
            {/* Package / Box icon */}
            <div className="w-8 h-8 rounded-full bg-[#f0fdf4] flex items-center justify-center shrink-0">
              <svg
                className="w-5 h-5 text-[#16a34a]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m7.5 4.27 9 5.15" />
                <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                <path d="m3.3 7 8.7 5 8.7-5" />
                <path d="M12 22V12" />
              </svg>
            </div>
            <span className="text-sm font-medium text-[#4b5563]">Entregues</span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-[#1a1a1a] ml-1">{counts.delivered}</p>
        </div>

        {/* Card 4: Cancelados */}
        <div
          onClick={() => handleCardClick('CANCELLED')}
          className={`bg-white rounded-2xl p-5 sm:p-6 border transition-all cursor-pointer shadow-sm hover:shadow ${
            selectedStatus === 'CANCELLED'
              ? 'border-[#dc2626] ring-2 ring-[#fee2e2]'
              : 'border-[#e5e7eb] hover:border-gray-300'
          }`}
        >
          <div className="flex items-center gap-3 mb-3">
            {/* Ban / Cancel circle icon */}
            <div className="w-8 h-8 rounded-full bg-[#fef2f2] flex items-center justify-center shrink-0">
              <svg
                className="w-5 h-5 text-[#dc2626]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
              </svg>
            </div>
            <span className="text-sm font-medium text-[#4b5563]">Cancelados</span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-[#1a1a1a] ml-1">{counts.cancelled}</p>
        </div>
      </div>

      {/* ─── Main White Table Container ─── */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#e5e7eb] overflow-hidden">
        {/* Search & Filter Top Bar */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-[#f3f4f6]">
          {/* Search box with magnifying glass */}
          <div className="relative w-full max-w-xs sm:w-80">
            <svg
              className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#4b5563]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.2}
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" strokeLinecap="round" />
            </svg>
            <input
              id="pedidos-search"
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

          {/* Funnel / Filter Icon & Popover */}
          <div className="relative" ref={filterMenuRef}>
            <button
              type="button"
              onClick={() => setFilterMenuOpen((v) => !v)}
              className={`p-2 transition-colors cursor-pointer rounded-lg relative ${
                selectedStatus !== 'ALL'
                  ? 'text-[#f97316] bg-[#fff1e8]'
                  : 'text-[#374151] hover:text-[#1a1a1a]'
              }`}
              aria-label="Filtrar pedidos"
              title="Filtrar pedidos por status"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z" />
              </svg>
              {selectedStatus !== 'ALL' && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#f97316]" />
              )}
            </button>

            {filterMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-[#e5e7eb] p-2 z-20 text-xs">
                <div className="px-3 py-2 font-bold text-[#1a1a1a] border-b border-[#f3f4f6]">
                  Filtrar por Status
                </div>
                <div className="py-1 space-y-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedStatus('ALL');
                      setFilterMenuOpen(false);
                      setPage(0);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg font-medium transition-colors cursor-pointer ${
                      selectedStatus === 'ALL'
                        ? 'bg-[#fff1e8] text-[#f97316]'
                        : 'text-[#374151] hover:bg-[#f9fafb]'
                    }`}
                  >
                    Todos os status
                  </button>
                  {(['WAITING', 'PREPARING', 'DELIVERED', 'CANCELLED'] as CanonicalStatus[]).map(
                    (st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => {
                          setSelectedStatus(st);
                          setFilterMenuOpen(false);
                          setPage(0);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg font-medium flex items-center justify-between transition-colors cursor-pointer ${
                          selectedStatus === st
                            ? 'bg-[#fff1e8] text-[#f97316]'
                            : 'text-[#374151] hover:bg-[#f9fafb]'
                        }`}
                      >
                        <span>{STATUS_DETAILS[st].label}</span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full ${STATUS_DETAILS[st].badgeClass}`}
                        >
                          {st === 'WAITING'
                            ? counts.waiting
                            : st === 'PREPARING'
                              ? counts.preparing
                              : st === 'DELIVERED'
                                ? counts.delivered
                                : counts.cancelled}
                        </span>
                      </button>
                    ),
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Error message banner */}
        {error && (
          <div className="px-6 py-3.5 text-sm text-red-600 bg-red-50 border-b border-red-100">
            {error}
          </div>
        )}

        {/* ─── Desktop Table View ─── */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#f4f5f7] border-b border-[#e5e7eb]">
                <th className="px-6 py-4 text-sm font-semibold text-[#374151] text-left">Pedido</th>
                <th className="px-6 py-4 text-sm font-semibold text-[#374151] text-center">Mesa</th>
                <th className="px-6 py-4 text-sm font-semibold text-[#374151] text-left">
                  Funcionário
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-[#374151] text-left">Cliente</th>
                <th className="px-6 py-4 text-sm font-semibold text-[#374151] text-center">
                  Status
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-[#374151] text-center">
                  Abertura
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-[#374151] text-center">Total</th>
                <th className="px-6 py-4 text-sm font-semibold text-[#374151] text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f3f4f6]">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-[#6b7280]">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-6 h-6 border-2 border-[#f97316] border-t-transparent rounded-full animate-spin mb-2" />
                      Carregando pedidos...
                    </div>
                  </td>
                </tr>
              ) : paginatedOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-[#6b7280]">
                    Nenhum pedido encontrado.
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((order) => {
                  const statusInfo = STATUS_DETAILS[normalizeStatus(order.status)];
                  return (
                    <tr key={order.id} className="hover:bg-[#fafafa] transition-colors">
                      {/* Pedido #ID */}
                      <td className="px-6 py-5 font-bold text-[#1a1a1a] text-left">
                        #{order.id}
                      </td>

                      {/* Mesa */}
                      <td className="px-6 py-5 text-[#374151] text-center font-medium">
                        {order.restaurantTable ?? '—'}
                      </td>

                      {/* Funcionário */}
                      <td className="px-6 py-5 text-[#374151] text-left">
                        {order.employee}
                      </td>

                      {/* Cliente */}
                      <td className="px-6 py-5 text-[#374151] text-left">
                        {order.customer}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-5 text-center">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${statusInfo.badgeClass}`}
                        >
                          {statusInfo.label}
                        </span>
                      </td>

                      {/* Abertura */}
                      <td className="px-6 py-5 text-center text-xs text-[#6b7280]">
                        {order.createdAt}
                      </td>

                      {/* Total */}
                      <td className="px-6 py-5 text-center font-medium text-[#1a1a1a]">
                        {order.totalPrice}
                      </td>

                      {/* Ações */}
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-3 text-[#374151]">
                          {/* Edit / Details Icon */}
                          <button
                            type="button"
                            onClick={() => setSelectedOrderId(order.id)}
                            aria-label={`Ver ou editar pedido #${order.id}`}
                            className="text-[#374151] hover:text-[#1a1a1a] transition-colors p-1 cursor-pointer"
                            title="Ver detalhes / editar"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={1.8}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                              />
                            </svg>
                          </button>

                          {/* Cancel / Trash Icon */}
                          {confirmCancelId === order.id ? (
                            <div className="flex items-center gap-1.5 bg-red-50 px-2 py-1 rounded">
                              <button
                                onClick={() => handleCancelOrder(order.id)}
                                disabled={cancellingId === order.id}
                                className="text-xs text-red-600 font-semibold hover:underline disabled:opacity-50 cursor-pointer"
                              >
                                {cancellingId === order.id ? '...' : 'Sim'}
                              </button>
                              <span className="text-[#d1d5db]">|</span>
                              <button
                                onClick={() => setConfirmCancelId(null)}
                                className="text-xs text-[#6b7280] hover:underline cursor-pointer"
                              >
                                Não
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmCancelId(order.id)}
                              disabled={normalizeStatus(order.status) === 'CANCELLED'}
                              aria-label={`Cancelar pedido #${order.id}`}
                              className="text-[#374151] hover:text-red-600 transition-colors p-1 cursor-pointer disabled:opacity-30 disabled:hover:text-[#374151]"
                              title={
                                normalizeStatus(order.status) === 'CANCELLED'
                                  ? 'Pedido já cancelado'
                                  : 'Cancelar pedido'
                              }
                            >
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ─── Mobile Cards View ─── */}
        <div className="md:hidden divide-y divide-[#f3f4f6]">
          {loading ? (
            <div className="p-8 text-center text-[#6b7280] text-sm">Carregando pedidos...</div>
          ) : paginatedOrders.length === 0 ? (
            <div className="p-8 text-center text-[#6b7280] text-sm">Nenhum pedido encontrado.</div>
          ) : (
            paginatedOrders.map((order) => {
              const statusInfo = STATUS_DETAILS[normalizeStatus(order.status)];
              return (
                <div key={order.id} className="p-4 flex flex-col gap-2 hover:bg-[#fafafa] transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#1a1a1a]">#{order.id}</span>
                        {order.restaurantTable && (
                          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                            Mesa {order.restaurantTable}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#374151] mt-1 font-medium">Cliente: {order.customer}</p>
                      <p className="text-xs text-[#6b7280]">Atendente: {order.employee}</p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusInfo.badgeClass}`}>
                        {statusInfo.label}
                      </span>
                      <p className="font-bold text-[#1a1a1a] text-sm mt-1">{order.totalPrice}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#f9fafb] text-xs text-[#6b7280]">
                    <span>{order.createdAt}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedOrderId(order.id)}
                        className="px-2.5 py-1 text-xs border border-[#d1d5db] text-[#374151] rounded-lg hover:bg-gray-50"
                      >
                        Detalhes
                      </button>
                      {confirmCancelId === order.id ? (
                        <div className="flex items-center gap-1.5 bg-red-50 px-2 py-1 rounded">
                          <button
                            onClick={() => handleCancelOrder(order.id)}
                            disabled={cancellingId === order.id}
                            className="text-xs text-red-600 font-bold"
                          >
                            Confirmar
                          </button>
                          <span className="text-[#d1d5db]">|</span>
                          <button
                            onClick={() => setConfirmCancelId(null)}
                            className="text-xs text-[#6b7280]"
                          >
                            Voltar
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmCancelId(order.id)}
                          disabled={normalizeStatus(order.status) === 'CANCELLED'}
                          className="p-1 text-[#6b7280] hover:text-red-600 disabled:opacity-30"
                          title="Cancelar pedido"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ─── Pagination Footer ─── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-[#f3f4f6]">
          {/* Centered record count: matches "Mostrando 1 a 4 de 4 registros" */}
          <div className="flex-1 text-center sm:text-center text-xs text-[#6b7280]">
            {totalRecords === 0
              ? 'Nenhum registro'
              : `Mostrando ${rangeStart} a ${rangeEnd} de ${totalRecords} registros`}
          </div>

          {/* Right-aligned pagination buttons: < 1 2 > */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              id="pagination-prev-btn"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={currentPage === 0}
              className="w-7 h-7 flex items-center justify-center rounded border border-[#e5e7eb] text-[#6b7280] hover:text-[#1a1a1a] hover:border-gray-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer bg-white"
              aria-label="Página anterior"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>

            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i).map((i) => {
              const isCurrent = currentPage === i;
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
              disabled={currentPage >= totalPages - 1}
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

      {/* ─── Modal Detalhes / Edição ─── */}
      {selectedOrderId !== null && (
        <OrderModal
          orderId={selectedOrderId}
          canEditOrder={canManageOrders}
          onClose={() => setSelectedOrderId(null)}
          onSaved={() => {
            setSelectedOrderId(null);
            reload();
          }}
          onActionComplete={reload}
        />
      )}
    </div>
  );
}
