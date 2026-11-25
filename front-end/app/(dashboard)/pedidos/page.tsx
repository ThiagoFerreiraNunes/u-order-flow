'use client';

import { useState, useEffect, useCallback } from 'react';
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

const PAGE_SIZE = 20;

const STATUS_WAITING = 'Awaiting preparation';
const STATUS_PREPARING = 'Preparing';
const STATUS_DELIVERED = 'Delivered';
const STATUS_CANCELLED = 'Cancelled';

const STATUS_LABEL: Record<string, string> = {
  [STATUS_WAITING]: 'Aguardando preparo',
  [STATUS_PREPARING]: 'Preparando',
  [STATUS_DELIVERED]: 'Entregue',
  [STATUS_CANCELLED]: 'Cancelado',
};

const STATUS_COLOR: Record<string, string> = {
  [STATUS_WAITING]: 'bg-yellow-100 text-yellow-700',
  [STATUS_PREPARING]: 'bg-blue-100 text-blue-700',
  [STATUS_DELIVERED]: 'bg-green-100 text-green-700',
  [STATUS_CANCELLED]: 'bg-gray-100 text-gray-500',
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
}

function OrderModal({ orderId, canEditOrder, onClose, onSaved }: OrderModalProps) {
  const [order, setOrder] = useState<OrderDetailsResponse | null>(null);
  const [products, setProducts] = useState<ProductSummaryResponse[]>([]);
  const [employees, setEmployees] = useState<UserResponse[]>([]);
  const [employeeId, setEmployeeId] = useState<number | ''>('');
  const [items, setItems] = useState<OrderItemCreateRequest[]>([]);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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

  const canEdit = canEditOrder && order?.status === STATUS_WAITING;

  function addItem() {
    const firstProduct = products[0];
    if (!firstProduct) return;
    setItems((prev) => [...prev, { productId: firstProduct.id, quantity: 1, note: '' }]);
  }

  function updateItem(index: number, patch: Partial<OrderItemCreateRequest>) {
    setItems((prev) => prev.map((item, idx) => (idx === index ? { ...item, ...patch } : item)));
  }

  function removeItem(index: number) {
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-[#1a1a1a]">Pedido #{orderId}</h2>
            {order && (
              <span className={`inline-block mt-1 text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLOR[order.status] ?? 'bg-gray-100 text-gray-600'}`}>
                {STATUS_LABEL[order.status] ?? order.status}
              </span>
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

        {loading && (
          <div className="flex justify-center py-10">
            <div className="w-7 h-7 border-2 border-[#3c3c3c] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && order && !editing && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-xs bg-[#f9fafb] rounded-lg p-3 border border-[#e5e7eb]">
              <div>
                <p className="text-[#9ca3af]">Cliente</p>
                <p className="font-medium text-[#1a1a1a]">{order.customer}</p>
              </div>
              <div>
                <p className="text-[#9ca3af]">Mesa</p>
                <p className="font-medium text-[#1a1a1a]">
                  {order.restaurantTable ? `Mesa ${order.restaurantTable.number}` : 'Sem mesa'}
                </p>
              </div>
              <div>
                <p className="text-[#9ca3af]">Atendente</p>
                <p className="font-medium text-[#1a1a1a]">{order.employee.name}</p>
              </div>
              <div>
                <p className="text-[#9ca3af]">Total</p>
                <p className="font-bold text-[#1a1a1a]">{order.totalPrice}</p>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-[#6b7280] uppercase tracking-wide mb-2">Itens</h3>
              <div className="divide-y divide-[#f3f4f6] border border-[#e5e7eb] rounded-lg">
                {order.items.map((item, idx) => (
                  <div key={idx} className="p-3 flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-[#1a1a1a]">
                        {item.quantity}x {item.product.name}
                      </p>
                      {item.note && (
                        <p className="text-xs text-[#6b7280] mt-0.5">Obs: {item.note}</p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold text-[#1a1a1a]">{item.totalPrice}</p>
                      <p className="text-[11px] text-[#9ca3af]">{item.unitPrice} un.</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm border border-[#d1d5db] text-[#374151] rounded-lg hover:bg-[#f9fafb] transition-colors"
              >
                Fechar
              </button>
              {canEdit && (
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="px-4 py-2 text-sm bg-[#3c3c3c] text-white rounded-lg hover:bg-[#1a1a1a] transition-colors"
                >
                  Editar Pedido
                </button>
              )}
            </div>
          </div>
        )}

        {!loading && order && editing && (
          <form onSubmit={handleSave} className="space-y-4">
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
                <label className="text-xs font-medium text-[#374151]">Itens *</label>
                <button
                  type="button"
                  onClick={addItem}
                  className="text-xs text-[#3c3c3c] font-medium hover:underline"
                >
                  + Adicionar item
                </button>
              </div>
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
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="px-4 py-2 text-sm border border-[#d1d5db] text-[#374151] rounded-lg hover:bg-[#f9fafb] transition-colors"
              >
                Voltar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 text-sm bg-[#3c3c3c] text-white rounded-lg hover:bg-[#1a1a1a] transition-colors disabled:opacity-60"
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

export default function PedidosPage() {
  const { role } = useSession();
  const canManageOrders = role !== null && role !== 'COOK';

  const [orders, setOrders] = useState<OrderSummaryResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionId, setActionId] = useState<number | null>(null);
  const [reloadTrigger, setReloadTrigger] = useState(0);
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

  const reload = useCallback(() => setReloadTrigger((n) => n + 1), []);

  useEffect(() => {
    let ignore = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setError('');

    getOrders({ page, size: PAGE_SIZE })
      .then((data) => {
        if (!ignore) {
          setOrders(data.content);
          setTotal(data.totalElements);
          setTotalPages(data.totalPages || 1);
        }
      })
      .catch(() => { if (!ignore) setError('Não foi possível carregar os pedidos.'); })
      .finally(() => { if (!ignore) setLoading(false); });

    return () => { ignore = true; };
  }, [page, reloadTrigger]);

  const displayed = filterStatus ? orders.filter((o) => o.status === filterStatus) : orders;

  async function handleAction(id: number, action: 'prepare' | 'deliver' | 'cancel') {
    setActionId(id);
    setError('');
    try {
      if (action === 'prepare') await prepareOrder(id);
      else if (action === 'deliver') await deliverOrder(id);
      else await cancelOrder(id);
      reload();
    } catch (err) {
      setError(getErrorMessage(err, 'Erro ao atualizar pedido.'));
    } finally {
      setActionId(null);
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {selectedOrderId !== null && (
        <OrderModal
          orderId={selectedOrderId}
          canEditOrder={canManageOrders}
          onClose={() => setSelectedOrderId(null)}
          onSaved={() => { setSelectedOrderId(null); reload(); }}
        />
      )}

      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-bold text-[#1a1a1a]">Pedidos</h1>
          <p className="text-sm text-[#6b7280] mt-0.5">{total} pedido{total !== 1 ? 's' : ''} no total</p>
        </div>
        <div className="flex gap-2">
          <select
            className="border border-[#d1d5db] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3c3c3c] bg-white"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">Todos os status</option>
            <option value={STATUS_WAITING}>{STATUS_LABEL[STATUS_WAITING]}</option>
            <option value={STATUS_PREPARING}>{STATUS_LABEL[STATUS_PREPARING]}</option>
            <option value={STATUS_DELIVERED}>{STATUS_LABEL[STATUS_DELIVERED]}</option>
            <option value={STATUS_CANCELLED}>{STATUS_LABEL[STATUS_CANCELLED]}</option>
          </select>
          <button
            onClick={reload}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm border border-[#d1d5db] text-[#374151] rounded-lg hover:bg-[#f9fafb] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Atualizar
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-4">
          {error}
        </div>
      )}

      {/* KDS — colunas por status */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {([STATUS_WAITING, STATUS_PREPARING, STATUS_DELIVERED, STATUS_CANCELLED] as const).map((status) => {
          const col = displayed.filter((o) => o.status === status);
          return (
            <div key={status} className="bg-[#f9fafb] rounded-xl border border-[#e5e7eb] p-4">
              <div className="flex items-center justify-between mb-3">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLOR[status]}`}>
                  {STATUS_LABEL[status]}
                </span>
                <span className="text-xs text-[#9ca3af]">{col.length} pedido{col.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="space-y-3">
                {col.length === 0 && (
                  <p className="text-xs text-[#9ca3af] text-center py-6">Nenhum pedido</p>
                )}
                {col.map((order) => (
                  <div key={order.id} className="bg-white rounded-lg border border-[#e5e7eb] p-3 shadow-sm">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="text-xs font-semibold text-[#1a1a1a]">Pedido #{order.id}</p>
                          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${STATUS_COLOR[order.status] ?? 'bg-gray-100 text-gray-600'}`}>
                            {STATUS_LABEL[order.status] ?? order.status}
                          </span>
                        </div>
                        <p className="text-xs text-[#6b7280] mt-0.5">Cliente: {order.customer}</p>
                        <p className="text-xs text-[#9ca3af]">Garçom: {order.employee}</p>
                        {order.restaurantTable && (
                          <p className="text-xs text-[#9ca3af]">Mesa {order.restaurantTable}</p>
                        )}
                      </div>
                      <span className="text-xs font-bold text-[#1a1a1a]">{order.totalPrice}</span>
                    </div>

                    {/* Ações */}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      <button
                        onClick={() => setSelectedOrderId(order.id)}
                        className="text-xs px-2.5 py-1.5 border border-[#d1d5db] text-[#374151] rounded-lg hover:bg-[#f9fafb] transition-colors"
                      >
                        {canManageOrders && status === STATUS_WAITING ? 'Ver / Editar' : 'Detalhes'}
                      </button>
                      {status === STATUS_WAITING && (
                        <>
                          <button
                            onClick={() => handleAction(order.id, 'prepare')}
                            disabled={actionId === order.id}
                            className="flex-1 text-xs py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-60"
                          >
                            Preparar
                          </button>
                          {canManageOrders && (
                            <button
                              onClick={() => handleAction(order.id, 'cancel')}
                              disabled={actionId === order.id}
                              className="text-xs px-2 py-1.5 border border-red-200 text-red-500 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-60"
                            >
                              Cancelar
                            </button>
                          )}
                        </>
                      )}
                      {status === STATUS_PREPARING && canManageOrders && (
                        <>
                          <button
                            onClick={() => handleAction(order.id, 'deliver')}
                            disabled={actionId === order.id}
                            className="flex-1 text-xs py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-60"
                          >
                            {actionId === order.id ? 'Aguarde...' : 'Entregar'}
                          </button>
                          <button
                            onClick={() => handleAction(order.id, 'cancel')}
                            disabled={actionId === order.id}
                            className="text-xs px-2 py-1.5 border border-red-200 text-red-500 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-60"
                          >
                            Cancelar
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-[#3c3c3c] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Paginação */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-3 py-1.5 text-sm border border-[#d1d5db] rounded-lg hover:bg-[#f9fafb] disabled:opacity-40 transition-colors"
          >
            ← Anterior
          </button>
          <span className="text-sm text-[#6b7280]">Página {page + 1} de {totalPages}</span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="px-3 py-1.5 text-sm border border-[#d1d5db] rounded-lg hover:bg-[#f9fafb] disabled:opacity-40 transition-colors"
          >
            Próxima →
          </button>
        </div>
      )}
    </div>
  );
}
