'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  getBillById,
  closeBill,
  payBill,
  getOrderById,
  updateOrder,
  cancelOrder,
  getProducts,
  getUsers,
} from '@/lib/api';
import { useSession } from '@/lib/use-session';
import type { BillDetailsResponse } from '@/types/bill';
import type { OrderDetailsResponse, OrderItemCreateRequest } from '@/types/order';
import type { ProductSummaryResponse } from '@/types/product';
import type { UserResponse } from '@/types/user';

const PAGE_SIZE = 10;

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
  WAITING: 'Aguardando preparo',
  PREPARING: 'Preparando',
  DELIVERED: 'Entregue',
  CANCELLED: 'Cancelado',
};

const ORDER_STATUS_COLOR: Record<string, string> = {
  'Awaiting preparation': 'bg-yellow-100 text-yellow-700',
  Preparing: 'bg-blue-100 text-blue-700',
  Delivered: 'bg-green-100 text-green-700',
  Cancelled: 'bg-gray-100 text-gray-500',
  WAITING: 'bg-yellow-100 text-yellow-700',
  PREPARING: 'bg-blue-100 text-blue-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-gray-100 text-gray-500',
};

function isOrderWaiting(status: string): boolean {
  return status === 'Awaiting preparation' || status === 'WAITING';
}

function isOrderCancellable(status: string): boolean {
  return isOrderWaiting(status) || status === 'Preparing' || status === 'PREPARING';
}

import { getErrorMessage, USER_ROLE_LABELS } from '@/lib/formatters';

// ─── Modal Editar Pedido ───────────────────────────────────────────────────────
interface EditOrderModalProps {
  orderId: number;
  onClose: () => void;
  onSaved: () => void;
}

function EditOrderModal({ orderId, onClose, onSaved }: EditOrderModalProps) {
  const [order, setOrder] = useState<OrderDetailsResponse | null>(null);
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
      getOrderById(orderId),
      getProducts({ size: 100 }),
      getUsers({ excludeRole: 'COOK', size: 100 }),
    ])
      .then(([orderData, productsPage, usersPage]) => {
        if (ignore) return;
        setOrder(orderData);
        const available = productsPage.content.filter((p) => p.isAvailable);
        setProducts(available);
        setEmployees(usersPage.content);
        setEmployeeId(orderData.employee.id);
        setItems(
          orderData.items.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
            note: item.note ?? '',
          }))
        );
      })
      .catch(() => {
        if (!ignore) setError('Não foi possível carregar os dados do pedido.');
      })
      .finally(() => {
        if (!ignore) setLoadingData(false);
      });
    return () => { ignore = true; };
  }, [orderId]);

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
      await updateOrder(orderId, {
        employeeId: Number(employeeId),
        items: items.map((i) => ({
          productId: Number(i.productId),
          quantity: Math.max(1, Number(i.quantity)),
          note: i.note?.trim() || undefined,
        })),
      });
      onSaved();
    } catch (err) {
      setError(getErrorMessage(err, 'Erro ao atualizar pedido.'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-[#1a1a1a]">Editar Pedido #{orderId}</h2>
            {order && (
              <p className="text-xs text-[#6b7280] mt-0.5">{order.customer}</p>
            )}
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
            <div className="w-7 h-7 border-2 border-[#f97316] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Atendente */}
            <div>
              <label className="block text-xs font-medium text-[#374151] mb-1">Atendente *</label>
              <select
                className="w-full border border-[#d1d5db] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#f97316] bg-white"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value ? Number(e.target.value) : '')}
              >
                <option value="">Selecione</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({USER_ROLE_LABELS[emp.role] ?? emp.role})
                  </option>
                ))}
              </select>
            </div>

            {/* Itens */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium text-[#374151]">Itens do Pedido *</label>
                <button
                  type="button"
                  onClick={addItem}
                  className="text-xs text-[#f97316] font-medium hover:underline"
                >
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
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm border border-[#d1d5db] text-[#374151] rounded-lg hover:bg-[#f9fafb] transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving || products.length === 0}
                className="px-4 py-2 text-sm bg-[#f97316] hover:bg-[#ea580c] text-white rounded-lg transition-colors disabled:opacity-60"
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

// ─── Modal de Confirmação de Cancelamento ──────────────────────────────────────
interface CancelConfirmModalProps {
  orderId: number;
  onClose: () => void;
  onConfirmed: () => void;
}

function CancelConfirmModal({ orderId, onClose, onConfirmed }: CancelConfirmModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleCancel() {
    setLoading(true);
    setError('');
    try {
      await cancelOrder(orderId);
      onConfirmed();
    } catch (err) {
      setError(getErrorMessage(err, 'Erro ao cancelar pedido.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
        <div className="flex items-start gap-4 mb-5">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <div>
            <h2 className="text-base font-semibold text-[#1a1a1a]">Cancelar Pedido #{orderId}</h2>
            <p className="text-sm text-[#6b7280] mt-1">
              Tem certeza que deseja cancelar este pedido? Esta ação não pode ser desfeita.
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-2 mb-4">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm border border-[#d1d5db] text-[#374151] rounded-lg hover:bg-[#f9fafb] transition-colors"
          >
            Voltar
          </button>
          <button
            type="button"
            onClick={handleCancel}
            disabled={loading}
            className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-60"
          >
            {loading ? 'Cancelando...' : 'Sim, cancelar'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Página Principal ─────────────────────────────────────────────────────────
export default function ComandaDetailPage() {
  const params = useParams();
  const router = useRouter();
  const billId = Number(params.id);
  const { role } = useSession();
  const canManage = role === 'ADMIN' || role === 'CASHIER' || role === 'WAITER';
  const canManageBill = role === 'ADMIN' || role === 'CASHIER';

  const [bill, setBill] = useState<BillDetailsResponse | null>(null);
  const [orders, setOrders] = useState<OrderDetailsResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [billActionLoading, setBillActionLoading] = useState(false);

  const [editOrderId, setEditOrderId] = useState<number | null>(null);
  const [cancelOrderId, setCancelOrderId] = useState<number | null>(null);

  const reload = useCallback(() => {
    setLoading(true);
    setError('');
    getBillById(billId)
      .then(async (billData) => {
        setBill(billData);
        if (billData.orders.length > 0) {
          const detailedOrders = await Promise.all(
            billData.orders.map((o) => getOrderById(o.id))
          );
          setOrders(detailedOrders);
        } else {
          setOrders([]);
        }
      })
      .catch(() => setError('Não foi possível carregar a comanda.'))
      .finally(() => setLoading(false));
  }, [billId]);

  async function handleCloseBill() {
    if (!bill) return;
    setBillActionLoading(true);
    setError('');
    try {
      await closeBill(bill.id);
      reload();
    } catch (err) {
      setError(getErrorMessage(err, 'Erro ao fechar a comanda.'));
    } finally {
      setBillActionLoading(false);
    }
  }

  async function handlePayBill() {
    if (!bill) return;
    setBillActionLoading(true);
    setError('');
    try {
      await payBill(bill.id);
      reload();
    } catch (err) {
      setError(getErrorMessage(err, 'Erro ao pagar a comanda.'));
    } finally {
      setBillActionLoading(false);
    }
  }

  useEffect(() => {
    if (isNaN(billId)) {
      router.push('/comandas');
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    reload();
  }, [billId, reload, router]);

  // Paginação local sobre os pedidos
  const totalOrders = orders.length;
  const totalPages = Math.max(1, Math.ceil(totalOrders / PAGE_SIZE));
  const pagedOrders = orders.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const rangeStart = totalOrders === 0 ? 0 : page * PAGE_SIZE + 1;
  const rangeEnd = Math.min((page + 1) * PAGE_SIZE, totalOrders);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Modais */}
      {editOrderId !== null && (
        <EditOrderModal
          orderId={editOrderId}
          onClose={() => setEditOrderId(null)}
          onSaved={() => { setEditOrderId(null); reload(); }}
        />
      )}
      {cancelOrderId !== null && (
        <CancelConfirmModal
          orderId={cancelOrderId}
          onClose={() => setCancelOrderId(null)}
          onConfirmed={() => { setCancelOrderId(null); reload(); }}
        />
      )}

      {/* Cabeçalho */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/comandas"
          className="text-[#1a1a1a] hover:text-[#f97316] transition-colors p-1"
          aria-label="Voltar para comandas"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <line x1="19" y1="12" x2="5" y2="12" strokeLinecap="round" />
            <polyline points="12 19 5 12 12 5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#1a1a1a]">Pedidos da Comanda</h1>
      </div>

      {/* Loading */}
      {loading && (
        <div className="bg-white rounded-xl shadow-sm border border-[#e5e7eb] p-16 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-2 border-[#f97316] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-[#6b7280]">Carregando comanda...</p>
        </div>
      )}

      {/* Erro */}
      {!loading && error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-6 py-4 flex items-center gap-2">
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <circle cx="12" cy="12" r="10" />
            <path strokeLinecap="round" d="M12 8v4M12 16h.01" />
          </svg>
          {error}
        </div>
      )}

      {/* Conteúdo */}
      {!loading && bill && (
        <>
          {/* Info da comanda */}
          <div className="bg-white rounded-xl shadow-sm border border-[#e5e7eb] px-6 py-5 mb-5 flex flex-wrap items-center justify-between gap-6">
            <div className="flex flex-wrap items-center gap-6">
              <div>
                <p className="text-xs text-[#9ca3af] mb-0.5">Cliente</p>
                <p className="text-sm font-semibold text-[#1a1a1a]">{bill.customer}</p>
              </div>
              <div>
                <p className="text-xs text-[#9ca3af] mb-0.5">Mesa</p>
                <p className="text-sm font-semibold text-[#1a1a1a]">
                  {bill.restaurantTable ? `Mesa ${bill.restaurantTable}` : 'Sem mesa'}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#9ca3af] mb-0.5">Status</p>
                <span className={`text-xs px-2.5 py-1 rounded font-medium ${STATUS_COLOR[bill.status]}`}>
                  {STATUS_LABEL[bill.status] ?? bill.status}
                </span>
              </div>
              <div>
                <p className="text-xs text-[#9ca3af] mb-0.5">Abertura</p>
                <p className="text-sm font-semibold text-[#1a1a1a]">{bill.createdAt}</p>
              </div>
              <div>
                <p className="text-xs text-[#9ca3af] mb-0.5">Total</p>
                <p className="text-lg font-bold text-[#1a1a1a]">{bill.totalPrice}</p>
              </div>
            </div>

            {/* Ações da Comanda */}
            <div className="flex flex-wrap items-center gap-3">
              {canManage && bill.status === 'OPEN' && (
                <Link
                  href={`/pedidos/novo?billId=${bill.id}`}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-[#f97316] hover:bg-[#ea580c] text-white rounded-xl transition-colors shadow-sm cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  Adicionar Pedido
                </Link>
              )}
              {canManageBill && (
                <>
                  {bill.status === 'OPEN' && (
                    <button
                      type="button"
                      onClick={handleCloseBill}
                      disabled={billActionLoading}
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-amber-500 hover:bg-amber-600 text-white rounded-xl transition-colors shadow-sm disabled:opacity-60 cursor-pointer"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                      </svg>
                      Fechar Comanda
                    </button>
                  )}
                  {(bill.status === 'OPEN' || bill.status === 'CLOSED') && (
                    <button
                      type="button"
                      onClick={handlePayBill}
                      disabled={billActionLoading}
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-green-600 hover:bg-green-700 text-white rounded-xl transition-colors shadow-sm disabled:opacity-60 cursor-pointer"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14.93V18h-2v-1.07C9.14 16.57 8 15.42 8 14h2c0 .55.45 1 1 1h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-1.65 0-3-1.35-3-3 0-1.42 1.14-2.57 2.5-2.93V6h2v1.07C13.86 7.43 15 8.58 15 10h-2c0-.55-.45-1-1-1H10c-.55 0-1 .45-1 1s.45 1 1 1h2c1.65 0 3 1.35 3 3 0 1.42-1.14 2.57-2.5 2.93z" />
                      </svg>
                      Pagar Comanda
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Card da tabela */}
          <div className="bg-white rounded-xl shadow-sm border border-[#e5e7eb] overflow-hidden">

            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#f4f5f7] border-b border-[#e5e7eb]">
                    <th className="px-6 py-4 text-sm font-semibold text-[#374151] text-left">Pedido</th>
                    <th className="px-6 py-4 text-sm font-semibold text-[#374151] text-left">Item</th>
                    <th className="px-6 py-4 text-sm font-semibold text-[#374151] text-left">Preço Unitário</th>
                    <th className="px-6 py-4 text-sm font-semibold text-[#374151] text-left">Quantidade</th>
                    <th className="px-6 py-4 text-sm font-semibold text-[#374151] text-left">Observação</th>
                    <th className="px-6 py-4 text-sm font-semibold text-[#374151] text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f3f4f6]">
                  {pagedOrders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-14 text-center text-[#6b7280] text-sm">
                        <p>Nenhum pedido lançado nesta comanda.</p>
                        {canManage && bill.status === 'OPEN' && (
                          <div className="mt-3">
                            <Link
                              href={`/pedidos/novo?billId=${bill.id}`}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#f97316] text-white rounded-lg hover:bg-[#ea580c] transition-colors"
                            >
                              + Adicionar Pedido
                            </Link>
                          </div>
                        )}
                      </td>
                    </tr>
                  ) : (
                    pagedOrders.map((order) =>
                      // Se o pedido tem itens, expande uma linha por item
                      order.items && order.items.length > 0 ? (
                        order.items.map((item, itemIdx) => (
                          <tr key={`${order.id}-${itemIdx}`} className="hover:bg-[#fafafa] transition-colors">
                            {itemIdx === 0 ? (
                              <td
                                className="px-6 py-5 font-semibold text-[#1a1a1a] font-mono align-top"
                                rowSpan={order.items.length}
                              >
                                <div className="flex flex-col gap-1.5">
                                  <span>#{String(order.id).padStart(4, '0')}</span>
                                  <span className={`inline-block text-[10px] px-2 py-0.5 rounded font-medium w-fit ${ORDER_STATUS_COLOR[order.status] ?? 'bg-gray-100 text-gray-500'}`}>
                                    {ORDER_STATUS_LABEL[order.status] ?? order.status}
                                  </span>
                                </div>
                              </td>
                            ) : null}
                            <td className="px-6 py-4 text-[#374151]">{item.product.name}</td>
                            <td className="px-6 py-4 text-[#374151]">{item.unitPrice}</td>
                            <td className="px-6 py-4 text-[#374151]">{item.quantity}</td>
                            <td className="px-6 py-4 text-[#9ca3af] text-xs">{item.note ?? '—'}</td>
                            {itemIdx === 0 ? (
                              <td
                                className="px-6 py-4 text-right align-top"
                                rowSpan={order.items.length}
                              >
                                <div className="flex items-center justify-end gap-2">
                                  {canManage && isOrderWaiting(order.status) && (
                                    <button
                                      onClick={() => setEditOrderId(order.id)}
                                      title="Editar pedido"
                                      className="text-[#374151] hover:text-[#f97316] transition-colors p-1 cursor-pointer"
                                    >
                                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                      </svg>
                                    </button>
                                  )}
                                  {canManage && isOrderCancellable(order.status) && (
                                    <button
                                      onClick={() => setCancelOrderId(order.id)}
                                      title="Cancelar pedido"
                                      className="text-[#374151] hover:text-red-600 transition-colors p-1 cursor-pointer"
                                    >
                                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                                      </svg>
                                    </button>
                                  )}
                                  {(!canManage || !isOrderCancellable(order.status)) && (
                                    <span className="text-xs text-[#9ca3af]">—</span>
                                  )}
                                </div>
                              </td>
                            ) : null}
                          </tr>
                        ))
                      ) : (
                        <tr key={order.id} className="hover:bg-[#fafafa] transition-colors">
                          <td className="px-6 py-5 font-semibold text-[#1a1a1a] font-mono">
                            #{String(order.id).padStart(4, '0')}
                          </td>
                          <td className="px-6 py-5 text-[#9ca3af] text-xs" colSpan={4}>Sem itens</td>
                          <td className="px-6 py-5 text-right">—</td>
                        </tr>
                      )
                    )
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-[#f3f4f6]">
              {pagedOrders.length === 0 ? (
                <div className="p-8 text-center text-[#6b7280] text-sm">
                  <p>Nenhum pedido lançado nesta comanda.</p>
                  {canManage && bill.status === 'OPEN' && (
                    <div className="mt-3">
                      <Link
                        href={`/pedidos/novo?billId=${bill.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#f97316] text-white rounded-lg hover:bg-[#ea580c] transition-colors"
                      >
                        + Adicionar Pedido
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                pagedOrders.map((order) => (
                    <div key={order.id} className="p-4 space-y-3">
                      {/* Header do pedido */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-[#1a1a1a] font-mono">
                            #{String(order.id).padStart(4, '0')}
                          </span>
                          <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${ORDER_STATUS_COLOR[order.status] ?? 'bg-gray-100 text-gray-500'}`}>
                            {ORDER_STATUS_LABEL[order.status] ?? order.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {canManage && isOrderWaiting(order.status) && (
                            <button
                              onClick={() => setEditOrderId(order.id)}
                              className="p-1.5 text-[#374151] hover:text-[#f97316] transition-colors"
                              title="Editar"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                              </svg>
                            </button>
                          )}
                          {canManage && isOrderCancellable(order.status) && (
                            <button
                              onClick={() => setCancelOrderId(order.id)}
                              className="p-1.5 text-[#374151] hover:text-red-600 transition-colors"
                              title="Cancelar"
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Itens do pedido */}
                      {order.items && order.items.length > 0 ? (
                        <div className="space-y-1.5">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="bg-[#f9fafb] rounded-lg px-3 py-2 text-xs">
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-medium text-[#1a1a1a]">{item.product.name}</span>
                                <span className="text-[#374151]">{item.quantity}x {item.unitPrice}</span>
                              </div>
                              {item.note && (
                                <p className="text-[#9ca3af] mt-0.5">Obs: {item.note}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-[#9ca3af]">Sem itens</p>
                      )}

                      <p className="text-xs text-[#9ca3af]">{order.createdAt}</p>
                    </div>
                  ))
              )}
            </div>

            {/* Paginação */}
            {totalOrders > 0 && (
              <div className="px-6 py-4 border-t border-[#f3f4f6] flex flex-col sm:flex-row items-center justify-between gap-3">
                <p className="text-sm text-[#6b7280]">
                  Mostrando {rangeStart} a {rangeEnd} de {totalOrders} registros
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#e5e7eb] text-[#374151] hover:bg-[#f9fafb] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    aria-label="Página anterior"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <polyline points="15 18 9 12 15 6" />
                    </svg>
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => setPage(i)}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                        page === i
                          ? 'bg-[#f97316] text-white border border-[#f97316]'
                          : 'border border-[#e5e7eb] text-[#374151] hover:bg-[#f9fafb]'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}

                  <button
                    onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                    disabled={page >= totalPages - 1}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#e5e7eb] text-[#374151] hover:bg-[#f9fafb] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    aria-label="Próxima página"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
