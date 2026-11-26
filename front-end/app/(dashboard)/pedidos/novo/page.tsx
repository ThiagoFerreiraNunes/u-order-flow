'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { getBills, getUsers, getProducts, createBillOrder } from '@/lib/api';
import type { BillSummaryResponse } from '@/types/bill';
import type { UserResponse } from '@/types/user';
import type { ProductSummaryResponse } from '@/types/product';

const PAGE_SIZE = 10;

interface CartItem {
  product: ProductSummaryResponse;
  quantity: number;
  note: string;
}

function getErrorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === 'object' && 'message' in err && typeof err.message === 'string') {
    return err.message;
  }
  return fallback;
}

// Category badge colors — cycle through a palette
const CATEGORY_COLORS: string[] = [
  'bg-orange-100 text-orange-700',
  'bg-pink-100 text-pink-700',
  'bg-yellow-100 text-yellow-700',
  'bg-blue-100 text-blue-700',
  'bg-green-100 text-green-700',
  'bg-purple-100 text-purple-700',
  'bg-red-100 text-red-700',
  'bg-indigo-100 text-indigo-700',
];

function categoryColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return CATEGORY_COLORS[Math.abs(hash) % CATEGORY_COLORS.length];
}

export default function NovoPedidoPage() {
  const router = useRouter();

  // ─── Form Data ───────────────────────────────────────────────────────────────
  const [bills, setBills] = useState<BillSummaryResponse[]>([]);
  const [employees, setEmployees] = useState<UserResponse[]>([]);
  const [products, setProducts] = useState<ProductSummaryResponse[]>([]);

  const [selectedBillId, setSelectedBillId] = useState<number | ''>('');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | ''>('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [globalNote, setGlobalNote] = useState('');

  // ─── UI State ────────────────────────────────────────────────────────────────
  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);

  // ─── Load initial data ───────────────────────────────────────────────────────
  useEffect(() => {
    let ignore = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoadingData(true);
    Promise.all([
      getBills({ size: 100 }),
      getUsers({ excludeRole: 'COOK', size: 100 }),
      getProducts({ size: 200 }),
    ])
      .then(([billsData, usersData, productsData]) => {
        if (ignore) return;
        const openBills = billsData.content.filter((b) => b.status === 'OPEN');
        setBills(openBills);
        if (openBills.length > 0) setSelectedBillId(openBills[0].id);
        setEmployees(usersData.content);
        if (usersData.content.length > 0) setSelectedEmployeeId(usersData.content[0].id);
        setProducts(productsData.content.filter((p) => p.isAvailable));
      })
      .catch(() => {
        if (!ignore) setError('Não foi possível carregar os dados. Tente novamente.');
      })
      .finally(() => {
        if (!ignore) setLoadingData(false);
      });
    return () => { ignore = true; };
  }, []);

  // ─── Derived state ───────────────────────────────────────────────────────────
  const selectedBill = bills.find((b) => b.id === selectedBillId) ?? null;

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.description ?? '').toLowerCase().includes(q) ||
        (p.productCategory ?? '').toLowerCase().includes(q),
    );
  }, [products, search]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages - 1);
  const paginatedProducts = filteredProducts.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);

  const rangeStart = filteredProducts.length === 0 ? 0 : currentPage * PAGE_SIZE + 1;
  const rangeEnd = Math.min((currentPage + 1) * PAGE_SIZE, filteredProducts.length);

  // Cart helpers
  function cartQuantity(productId: number): number {
    return cart.find((c) => c.product.id === productId)?.quantity ?? 0;
  }

  function incrementItem(product: ProductSummaryResponse) {
    setCart((prev) => {
      const existing = prev.find((c) => c.product.id === product.id);
      if (existing) {
        return prev.map((c) =>
          c.product.id === product.id ? { ...c, quantity: c.quantity + 1 } : c,
        );
      }
      return [...prev, { product, quantity: 1, note: globalNote }];
    });
  }

  function decrementItem(productId: number) {
    setCart((prev) => {
      const existing = prev.find((c) => c.product.id === productId);
      if (!existing) return prev;
      if (existing.quantity <= 1) return prev.filter((c) => c.product.id !== productId);
      return prev.map((c) =>
        c.product.id === productId ? { ...c, quantity: c.quantity - 1 } : c,
      );
    });
  }

  function removeFromCart(productId: number) {
    setCart((prev) => prev.filter((c) => c.product.id !== productId));
  }

  // Parse price string to number for calculations (e.g. "R$ 26,90" → 26.90)
  function parsePrice(priceStr: string): number {
    const cleaned = priceStr.replace(/[R$\s.]/g, '').replace(',', '.');
    return parseFloat(cleaned) || 0;
  }

  const orderTotal = cart.reduce(
    (sum, item) => sum + parsePrice(item.product.price) * item.quantity,
    0,
  );

  function formatBRL(value: number): string {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  // ─── Submit ──────────────────────────────────────────────────────────────────
  async function handleSubmit() {
    if (!selectedBillId) {
      setError('Selecione uma comanda.');
      return;
    }
    if (!selectedEmployeeId) {
      setError('Selecione o funcionário responsável.');
      return;
    }
    if (cart.length === 0) {
      setError('Adicione ao menos um item ao pedido.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await createBillOrder(Number(selectedBillId), {
        employeeId: Number(selectedEmployeeId),
        items: cart.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
          note: (item.note || globalNote).trim() || undefined,
        })),
      });
      router.push('/pedidos');
    } catch (err) {
      setError(getErrorMessage(err, 'Erro ao criar o pedido. Tente novamente.'));
      setSaving(false);
    }
  }

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Page header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          type="button"
          onClick={() => router.push('/pedidos')}
          className="text-[#1a1a1a] hover:text-[#f97316] transition-colors cursor-pointer"
          aria-label="Voltar para Pedidos"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#1a1a1a]">Novo Pedido</h1>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mb-5 px-4 py-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl">
          {error}
        </div>
      )}

      {loadingData ? (
        <div className="flex flex-col items-center justify-center py-24 text-[#6b7280]">
          <div className="w-8 h-8 border-2 border-[#f97316] border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-sm">Carregando dados...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
          {/* ═══════════════════════════ LEFT COLUMN ═══════════════════════════ */}
          <div className="xl:col-span-2 space-y-5">

            {/* ── Informações Card ── */}
            <div className="bg-white rounded-2xl border border-[#e5e7eb] shadow-sm p-6">
              <h2 className="text-xl font-bold text-[#1a1a1a] mb-5">Informações</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Comanda Select */}
                <div>
                  <label className="block text-xs font-semibold text-[#374151] mb-1">
                    Comanda
                  </label>
                  <div className="relative">
                    <select
                      className="w-full appearance-none border border-[#d1d5db] rounded-xl px-4 py-3 pr-10 text-sm text-[#1a1a1a] bg-white focus:outline-none focus:ring-2 focus:ring-[#f97316] focus:border-[#f97316] transition-colors cursor-pointer"
                      value={selectedBillId}
                      onChange={(e) => setSelectedBillId(e.target.value ? Number(e.target.value) : '')}
                    >
                      <option value="">Selecione a comanda</option>
                      {bills.map((bill) => (
                        <option key={bill.id} value={bill.id}>
                          #{bill.id} — {bill.customer}
                          {bill.restaurantTable ? ` (Mesa ${bill.restaurantTable})` : ''}
                        </option>
                      ))}
                    </select>
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af]">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </span>
                  </div>
                  {bills.length === 0 && (
                    <p className="text-xs text-amber-600 mt-1">
                      Nenhuma comanda aberta. Crie uma em Comandas.
                    </p>
                  )}
                </div>

                {/* Funcionário Select */}
                <div>
                  <label className="block text-xs font-semibold text-[#374151] mb-1">
                    Funcionário
                  </label>
                  <div className="relative">
                    <select
                      className="w-full appearance-none border border-[#d1d5db] rounded-xl px-4 py-3 pr-10 text-sm text-[#1a1a1a] bg-white focus:outline-none focus:ring-2 focus:ring-[#f97316] focus:border-[#f97316] transition-colors cursor-pointer"
                      value={selectedEmployeeId}
                      onChange={(e) => setSelectedEmployeeId(e.target.value ? Number(e.target.value) : '')}
                    >
                      <option value="">Selecione o funcionário</option>
                      {employees.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.name}
                        </option>
                      ))}
                    </select>
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af]">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Product Search & Table Card ── */}
            <div className="bg-white rounded-2xl border border-[#e5e7eb] shadow-sm overflow-hidden">
              {/* Search bar */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#f3f4f6]">
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
                    type="text"
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                    placeholder="Pesquisar"
                    className="w-full pl-9 pr-3 py-2 text-sm text-[#1a1a1a] placeholder:text-[#6b7280] border border-[#e2e8f0] rounded-md focus:outline-none focus:ring-1 focus:ring-[#f97316] focus:border-[#f97316] bg-white transition-colors"
                  />
                </div>
                <svg className="w-5 h-5 text-[#374151]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z" />
                </svg>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#f4f5f7] border-b border-[#e5e7eb]">
                      <th className="px-5 py-3.5 text-sm font-semibold text-[#374151] text-left w-12" />
                      <th className="px-5 py-3.5 text-sm font-semibold text-[#374151] text-left">Item</th>
                      <th className="px-5 py-3.5 text-sm font-semibold text-[#374151] text-left hidden sm:table-cell">Descrição</th>
                      <th className="px-5 py-3.5 text-sm font-semibold text-[#374151] text-center">Categoria</th>
                      <th className="px-5 py-3.5 text-sm font-semibold text-[#374151] text-center">Preço</th>
                      <th className="px-5 py-3.5 text-sm font-semibold text-[#374151] text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f3f4f6]">
                    {paginatedProducts.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-5 py-10 text-center text-sm text-[#6b7280]">
                          Nenhum item encontrado.
                        </td>
                      </tr>
                    ) : (
                      paginatedProducts.map((product) => {
                        const qty = cartQuantity(product.id);
                        return (
                          <tr key={product.id} className="hover:bg-[#fafafa] transition-colors">
                            {/* Image */}
                            <td className="px-5 py-4">
                              <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#f3f4f6] flex-shrink-0">
                                {product.image ? (
                                  <Image
                                    src={product.image}
                                    alt={product.name}
                                    width={40}
                                    height={40}
                                    className="w-full h-full object-cover"
                                    unoptimized
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-[#9ca3af]">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                                    </svg>
                                  </div>
                                )}
                              </div>
                            </td>

                            {/* Name */}
                            <td className="px-5 py-4 font-semibold text-[#1a1a1a] text-left">
                              {product.name}
                            </td>

                            {/* Description */}
                            <td className="px-5 py-4 text-xs text-[#6b7280] text-center hidden sm:table-cell max-w-[180px]">
                              <span className="line-clamp-2">{product.description || '—'}</span>
                            </td>

                            {/* Category */}
                            <td className="px-5 py-4 text-center">
                              <span
                                className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${categoryColor(product.productCategory || '')}`}
                              >
                                {product.productCategory || 'Sem categoria'}
                              </span>
                            </td>

                            {/* Price */}
                            <td className="px-5 py-4 text-center font-semibold text-[#1a1a1a]">
                              {product.price}
                            </td>

                            {/* Actions: + and − */}
                            <td className="px-5 py-4 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => incrementItem(product)}
                                  className="w-7 h-7 flex items-center justify-center rounded-full bg-[#f97316] text-white hover:bg-[#ea580c] transition-colors cursor-pointer font-bold text-base leading-none"
                                  aria-label={`Adicionar ${product.name}`}
                                >
                                  +
                                </button>
                                {qty > 0 && (
                                  <span className="text-xs font-bold text-[#1a1a1a] min-w-[16px] text-center">
                                    {qty}
                                  </span>
                                )}
                                <button
                                  type="button"
                                  onClick={() => decrementItem(product.id)}
                                  disabled={qty === 0}
                                  className="w-7 h-7 flex items-center justify-center rounded-full border border-[#d1d5db] text-[#374151] hover:border-[#f97316] hover:text-[#f97316] transition-colors cursor-pointer disabled:opacity-30 font-bold text-base leading-none"
                                  aria-label={`Remover ${product.name}`}
                                >
                                  −
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination footer */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-4 border-t border-[#f3f4f6]">
                <div className="flex-1 text-center text-xs text-[#6b7280]">
                  {filteredProducts.length === 0
                    ? 'Nenhum registro'
                    : `Mostrando ${rangeStart} a ${rangeEnd} de ${filteredProducts.length} registros`}
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={currentPage === 0}
                    className="w-7 h-7 flex items-center justify-center rounded border border-[#e5e7eb] text-[#6b7280] hover:text-[#1a1a1a] hover:border-gray-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer bg-white"
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
                      className={`w-7 h-7 flex items-center justify-center rounded text-xs font-medium transition-colors border cursor-pointer ${
                        currentPage === i
                          ? 'bg-[#fff1e8] text-[#f97316] border-[#fde0cf]'
                          : 'bg-white text-[#4b5563] border-[#e5e7eb] hover:border-gray-400'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}

                  <button
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
          </div>

          {/* ═══════════════════════════ RIGHT COLUMN — Resumo ═══════════════════════════ */}
          <div className="xl:col-span-1">
            <div className="bg-white rounded-2xl border border-[#e5e7eb] shadow-sm p-6 xl:sticky xl:top-6">
              <h2 className="text-xl font-bold text-[#1a1a1a] mb-5">Resumo Pedido</h2>

              {/* Mesa & Cliente */}
              {selectedBill ? (
                <div className="flex items-start justify-between gap-4 mb-5">
                  {selectedBill.restaurantTable && (
                    <div className="text-center">
                      <p className="text-xs text-[#9ca3af]">Mesa</p>
                      <p className="text-lg font-bold text-[#1a1a1a]">
                        {String(selectedBill.restaurantTable).padStart(2, '0')}
                      </p>
                    </div>
                  )}
                  <div className={selectedBill.restaurantTable ? 'text-center' : 'text-left'}>
                    <p className="text-xs text-[#9ca3af]">Cliente</p>
                    <p className="font-bold text-[#1a1a1a]">{selectedBill.customer}</p>
                  </div>
                </div>
              ) : (
                <div className="mb-5 text-sm text-[#9ca3af] italic">Selecione uma comanda</div>
              )}

              {/* Items do Pedido */}
              <div className="mb-5">
                <p className="text-sm font-bold text-[#1a1a1a] mb-2">Itens do Pedido</p>
                <div className="border border-[#e5e7eb] rounded-xl min-h-[80px] overflow-hidden">
                  {cart.length === 0 ? (
                    <div className="flex items-center justify-center py-6 px-4">
                      <p className="text-xs text-center text-[#9ca3af]">
                        Nenhum item foi adicionado ainda.
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-[#f3f4f6] max-h-56 overflow-y-auto">
                      {cart.map((item) => (
                        <div key={item.product.id} className="flex items-center justify-between gap-2 px-3 py-2.5">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-[#1a1a1a] truncate">
                              {item.quantity}x {item.product.name}
                            </p>
                            <p className="text-[11px] text-[#9ca3af]">
                              {formatBRL(parsePrice(item.product.price) * item.quantity)}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => decrementItem(item.product.id)}
                              className="w-5 h-5 flex items-center justify-center rounded-full border border-[#d1d5db] text-[#374151] hover:border-[#f97316] hover:text-[#f97316] transition-colors cursor-pointer text-xs font-bold leading-none"
                            >
                              −
                            </button>
                            <span className="text-xs font-bold text-[#1a1a1a] min-w-[16px] text-center">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => incrementItem(item.product)}
                              className="w-5 h-5 flex items-center justify-center rounded-full bg-[#f97316] text-white hover:bg-[#ea580c] transition-colors cursor-pointer text-xs font-bold leading-none"
                            >
                              +
                            </button>
                            <button
                              type="button"
                              onClick={() => removeFromCart(item.product.id)}
                              className="ml-1 text-[#9ca3af] hover:text-red-500 transition-colors cursor-pointer"
                              aria-label={`Remover ${item.product.name} do carrinho`}
                            >
                              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Observações */}
              <div className="mb-5">
                <p className="text-sm font-bold text-[#1a1a1a] mb-2">Observações</p>
                <textarea
                  value={globalNote}
                  onChange={(e) => setGlobalNote(e.target.value)}
                  placeholder="Algumas observações de cada item do pedido."
                  rows={3}
                  className="w-full border border-[#e5e7eb] rounded-xl px-3 py-2.5 text-xs text-[#1a1a1a] placeholder:text-[#9ca3af] resize-none focus:outline-none focus:ring-1 focus:ring-[#f97316] focus:border-[#f97316] transition-colors bg-white"
                />
              </div>

              {/* Total do Pedido */}
              <div className="flex items-center justify-between mb-5 pt-3 border-t border-[#f3f4f6]">
                <span className="text-sm font-bold text-[#1a1a1a]">Total do Pedido</span>
                <span className="text-lg font-bold text-[#f97316]">{formatBRL(orderTotal)}</span>
              </div>

              {/* Criar pedido button */}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={saving || cart.length === 0 || !selectedBillId || !selectedEmployeeId}
                className="w-full py-3.5 text-sm font-bold text-white bg-[#f97316] hover:bg-[#ea580c] rounded-xl transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {saving ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Criando pedido...
                  </span>
                ) : (
                  'Criar pedido'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
