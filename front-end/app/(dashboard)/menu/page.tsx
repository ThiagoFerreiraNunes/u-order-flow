'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
  getProducts,
  getProductCategories,
  deleteProduct,
  createProductCategory,
  deleteProductCategory,
} from '@/lib/api';
import { useSession } from '@/lib/use-session';
import type { ProductSummaryResponse, ProductCategoryResponse } from '@/types/product';

const PAGE_SIZE = 10;

// Category Badge Color Helper matching the layout style
function getCategoryBadgeStyle(categoryName?: string) {
  const norm = (categoryName || '').toLowerCase().trim();
  if (norm.includes('lanche')) {
    return 'bg-[#fff7ed] text-[#ea580c] border border-[#ffedd5]';
  }
  if (norm.includes('bebida')) {
    return 'bg-[#fef2f2] text-[#ef4444] border border-[#fee2e2]';
  }
  if (norm.includes('porç') || norm.includes('porc')) {
    return 'bg-[#fefce8] text-[#ca8a04] border border-[#fef9c3]';
  }
  if (norm.includes('pizza')) {
    return 'bg-[#f5f3ff] text-[#7c3aed] border border-[#ede9fe]';
  }
  if (norm.includes('sobremesa') || norm.includes('doce')) {
    return 'bg-[#fdf2f8] text-[#db2777] border border-[#fce7f3]';
  }
  return 'bg-[#f3f4f6] text-[#4b5563] border border-[#e5e7eb]';
}

function CategoryBadge({ categoryName }: { categoryName?: string }) {
  const [customStyle, setCustomStyle] = useState<{
    color?: string;
    backgroundColor?: string;
    borderColor?: string;
  } | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('uorder_category_colors');
      if (stored) {
        const map = JSON.parse(stored);
        const norm = (categoryName || '').toLowerCase().trim();
        if (map[norm]) {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setCustomStyle({
            color: map[norm].hex,
            backgroundColor: map[norm].bg,
            borderColor: map[norm].border,
          });
        }
      }
    } catch {}
  }, [categoryName]);

  const presetClass = getCategoryBadgeStyle(categoryName);

  return (
    <span
      style={customStyle ? { ...customStyle, borderWidth: '1px' } : undefined}
      className={`px-3 py-1 rounded-full text-xs font-medium inline-block shadow-2xs ${
        customStyle ? '' : presetClass
      }`}
    >
      {categoryName}
    </span>
  );
}
interface CategoryModalProps {
  categories: ProductCategoryResponse[];
  onClose: () => void;
  onSaved: () => void;
  onDeleteCategory: (id: number) => Promise<void>;
}

function CategoryModal({ categories, onClose, onSaved, onDeleteCategory }: CategoryModalProps) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError('Informe o nome da categoria.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await createProductCategory({ name: name.trim() });
      setName('');
      onSaved();
    } catch {
      setError('Erro ao criar categoria.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number) {
    setDeletingId(id);
    setError('');
    try {
      await onDeleteCategory(id);
    } catch {
      setError('Erro ao excluir categoria (pode possuir produtos vinculados).');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-[#1a1a1a]">Categorias</h2>
          <button
            onClick={onClose}
            className="text-[#6b7280] hover:text-[#1a1a1a] transition-colors p-1"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-2.5 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mb-6">
          <label className="block text-sm font-semibold text-[#1a1a1a] mb-2">Nova Categoria</label>
          <div className="flex gap-2">
            <input
              type="text"
              className="flex-1 border border-[#d1d5db] rounded-lg px-3.5 py-2.5 text-sm text-[#1a1a1a] placeholder:text-[#9ca3af] focus:outline-none focus:border-[#f97316] focus:ring-1 focus:ring-[#f97316]"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Lanches, Bebidas, Pizzas..."
              autoFocus
            />
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-[#f97316] hover:bg-[#ea580c] text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-60 cursor-pointer"
            >
              {loading ? 'Adicionando...' : 'Adicionar'}
            </button>
          </div>
        </form>

        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#6b7280] mb-3">
            Categorias Existentes ({categories.length})
          </h3>
          <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
            {categories.length === 0 ? (
              <p className="text-sm text-[#9ca3af] py-2">Nenhuma categoria cadastrada.</p>
            ) : (
              categories.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center justify-between px-3.5 py-2 bg-[#f9fafb] border border-[#e5e7eb] rounded-lg text-sm"
                >
                  <span className="font-medium text-[#1a1a1a]">{cat.name}</span>
                  <button
                    type="button"
                    onClick={() => handleDelete(cat.id)}
                    disabled={deletingId === cat.id}
                    className="text-[#9ca3af] hover:text-red-500 transition-colors p-1"
                    title="Excluir categoria"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="flex justify-end pt-5 mt-4 border-t border-[#f3f4f6]">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-sm border border-[#d1d5db] text-[#374151] rounded-lg hover:bg-[#f9fafb] transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}



// ─── Componente Principal MenuPage ────────────────────────────────────────────
export default function MenuPage() {
  const { role } = useSession();
  const isAdmin = role === 'ADMIN';

  const [viewMode, setViewMode] = useState<'table' | 'completo'>('table');
  const [products, setProducts] = useState<ProductSummaryResponse[]>([]);
  const [fullProducts, setFullProducts] = useState<ProductSummaryResponse[]>([]);
  const [loadingFull, setLoadingFull] = useState(false);
  const [categories, setCategories] = useState<ProductCategoryResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadTrigger, setReloadTrigger] = useState(0);
  const [catReload, setCatReload] = useState(0);

  const [categoryModal, setCategoryModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<ProductSummaryResponse | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const reload = useCallback(() => setReloadTrigger((n) => n + 1), []);

  // Carregar categorias
  useEffect(() => {
    getProductCategories()
      .then(setCategories)
      .catch(() => {});
  }, [catReload]);

  // Carregar produtos paginados para modo tabela
  useEffect(() => {
    let ignore = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setError('');

    getProducts({ name: search || undefined, page, size: PAGE_SIZE })
      .then((data) => {
        if (!ignore) {
          setProducts(data.content);
          setTotal(data.totalElements);
          setTotalPages(data.totalPages || 1);
        }
      })
      .catch(() => {
        if (!ignore) setError('Não foi possível carregar os produtos do menu.');
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [search, page, reloadTrigger]);

  // Carregar todos os produtos quando entrar no modo "Menu Completo"
  useEffect(() => {
    if (viewMode === 'completo') {
      let ignore = false;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoadingFull(true);
      getProducts({ size: 100 })
        .then((data) => {
          if (!ignore) {
            setFullProducts(data.content);
          }
        })
        .catch(() => {})
        .finally(() => {
          if (!ignore) setLoadingFull(false);
        });

      return () => {
        ignore = true;
      };
    }
  }, [viewMode, reloadTrigger]);

  // Agrupamento por categoria para o modo Menu Completo
  const groupedCategories = useMemo(() => {
    const list = fullProducts.length > 0 ? fullProducts : products;
    const groups: { categoryName: string; items: ProductSummaryResponse[] }[] = [];

    categories.forEach((cat) => {
      const items = list.filter(
        (p) => p.productCategory?.toLowerCase() === cat.name.toLowerCase()
      );
      if (items.length > 0) {
        groups.push({ categoryName: cat.name, items });
      }
    });

    const otherItems = list.filter(
      (p) => !categories.some((c) => c.name.toLowerCase() === (p.productCategory || '').toLowerCase())
    );
    if (otherItems.length > 0) {
      groups.push({ categoryName: 'Outros', items: otherItems });
    }

    return groups;
  }, [fullProducts, products, categories]);

  // Filtro de categoria no cliente para modo tabela
  const displayedProducts = selectedCategory
    ? products.filter((p) => p.productCategory === selectedCategory)
    : products;

  async function handleDelete(id: number) {
    setDeletingId(id);
    try {
      await deleteProduct(id);
      setConfirmDelete(null);
      reload();
    } catch {
      setError('Erro ao excluir produto.');
    } finally {
      setDeletingId(null);
    }
  }

  async function handleDeleteCategory(id: number) {
    await deleteProductCategory(id);
    setCatReload((n) => n + 1);
  }

  const rangeStart = total === 0 ? 0 : page * PAGE_SIZE + 1;
  const rangeEnd = Math.min((page + 1) * PAGE_SIZE, total);

  return (
    <div className="max-w-6xl mx-auto">
      {/* ── Modais ── */}
      {categoryModal && (
        <CategoryModal
          categories={categories}
          onClose={() => setCategoryModal(false)}
          onSaved={() => {
            setCategoryModal(false);
            setCatReload((n) => n + 1);
          }}
          onDeleteCategory={handleDeleteCategory}
        />
      )}



      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-[#1a1a1a] mb-2">Excluir item?</h3>
            <p className="text-sm text-[#6b7280] mb-5">
              Deseja realmente excluir <strong>&quot;{confirmDelete.name}&quot;</strong>? Esta ação não pode ser desfeita.
            </p>
            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setConfirmDelete(null)}
                className="px-5 py-2 text-sm border border-[#d1d5db] text-[#374151] rounded-lg hover:bg-[#f9fafb] transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleDelete(confirmDelete.id)}
                disabled={deletingId !== null}
                className="px-5 py-2 text-sm bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition-colors disabled:opacity-60"
              >
                {deletingId === confirmDelete.id ? 'Excluindo...' : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Visualização: Menu Completo (Layout idêntico à Imagem 3) ── */}
      {viewMode === 'completo' ? (
        <div>
          {/* Header do Menu Completo matching o layout */}
          <div className="flex items-center justify-between gap-4 mb-8">
            <h1 className="text-3xl font-bold text-[#1a1a1a]">Menu</h1>

            <button
              type="button"
              id="menu-completo-toggle-btn"
              onClick={() => setViewMode('table')}
              className="inline-flex items-center justify-center gap-2 bg-[#dcdfe4] hover:bg-[#cfd3da] text-[#374151] font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors shadow-sm cursor-pointer"
              title="Clique para voltar para a tabela de gerenciamento"
            >
              <svg className="w-4 h-4 text-[#374151]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span>Menu Completo</span>
            </button>
          </div>

          {/* Conteúdo agrupado por Categoria */}
          {loadingFull ? (
            <div className="flex flex-col items-center justify-center py-24 text-[#6b7280]">
              <div className="w-8 h-8 border-2 border-[#f97316] border-t-transparent rounded-full animate-spin mb-3" />
              Carregando menu completo...
            </div>
          ) : groupedCategories.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#e5e7eb] p-12 text-center text-[#6b7280]">
              <p className="text-base font-medium mb-4">Nenhum item cadastrado no cardápio.</p>
              {isAdmin && (
                <Link
                  href="/menu/novo"
                  className="inline-flex items-center gap-1.5 bg-[#f97316] hover:bg-[#ea580c] text-white font-bold px-5 py-2.5 rounded-xl text-sm"
                >
                  + Cadastrar Primeiro Item
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-10">
              {groupedCategories.map((group) => (
                <section key={group.categoryName}>
                  {/* Título da Categoria com barra vertical laranja matching o layout */}
                  <div className="flex items-center gap-2.5 mb-6">
                    <span className="w-1.5 h-6 bg-[#f97316] rounded-full inline-block" />
                    <h2 className="text-2xl font-bold text-[#1a1a1a]">{group.categoryName}</h2>
                  </div>

                  {/* Grid de 3 colunas matching o layout */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {group.items.map((item) => (
                      <div
                        key={item.id}
                        className="bg-white rounded-2xl shadow-sm border border-[#e5e7eb] overflow-hidden flex flex-col hover:shadow-md transition-shadow"
                      >
                        {/* Imagem do Produto em fundo escuro */}
                        <div className="w-full h-56 bg-[#111111] flex items-center justify-center overflow-hidden">
                          {item.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="text-5xl">🍔</div>
                          )}
                        </div>

                        {/* Conteúdo do Card */}
                        <div className="p-5 flex-1 flex flex-col justify-between">
                          <div>
                            <h3 className="font-bold text-lg text-[#1a1a1a] mb-2">{item.name}</h3>
                            <p className="text-xs text-[#6b7280] leading-relaxed line-clamp-3 mb-4">
                              {item.description || '—'}
                            </p>
                          </div>
                          <div className="text-lg font-bold text-[#f97316]">
                            {item.price}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* ── Visualização: Modo Tabela (Layout idêntico à Imagem 1) ── */
        <div>
          {/* ── Page Header (Layout idêntico à Imagem 1) ── */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h1 className="text-3xl font-bold text-[#1a1a1a]">Menu</h1>

            <div className="flex flex-wrap items-center gap-3">
              {/* Botão + Nova Categoria */}
              <Link
                id="nova-categoria-link"
                href="/menu/categoria/nova"
                className="inline-flex items-center justify-center gap-1.5 bg-[#f97316] hover:bg-[#ea580c] text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors shadow-sm cursor-pointer"
              >
                <span className="text-base font-bold leading-none">+</span>
                <span>Nova Categoria</span>
              </Link>

              {/* Botão Pré-visualizar (Alterna para modo Menu Completo) */}
              <button
                type="button"
                id="pre-visualizar-btn"
                onClick={() => setViewMode('completo')}
                className="inline-flex items-center justify-center gap-2 bg-[#dcdfe4] hover:bg-[#cfd3da] text-[#374151] font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors shadow-sm cursor-pointer"
              >
                <svg className="w-4 h-4 text-[#374151]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span>Pré-visualizar</span>
              </button>

              {/* Botão + Novo Item */}
              {isAdmin && (
                <Link
                  id="novo-item-link"
                  href="/menu/novo"
                  className="inline-flex items-center justify-center gap-1.5 bg-[#f97316] hover:bg-[#ea580c] text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors shadow-sm cursor-pointer"
                >
                  <span className="text-base font-bold leading-none">+</span>
                  <span>Novo Item</span>
                </Link>
              )}
            </div>
          </div>

          {/* ── Main Card (Layout idêntico à Imagem 1) ── */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#e5e7eb] overflow-hidden">
            {/* Search & Filter Toolbar */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#f3f4f6]">
              {/* Caixa de Pesquisa */}
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
                  id="menu-search"
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

              {/* Ícone de Filtro (Funil) */}
              <div className="relative">
                <button
                  type="button"
                  id="menu-filter-btn"
                  onClick={() => setShowCategoryFilter((v) => !v)}
                  className={`p-2 transition-colors rounded-lg cursor-pointer ${
                    selectedCategory ? 'text-[#f97316] bg-orange-50' : 'text-[#374151] hover:text-[#1a1a1a]'
                  }`}
                  aria-label="Filtrar por categoria"
                  title="Filtrar por categoria"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z" />
                  </svg>
                </button>

                {/* Dropdown Filtro por Categoria */}
                {showCategoryFilter && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-[#e5e7eb] rounded-xl shadow-lg p-3 z-20">
                    <p className="text-xs font-bold text-[#6b7280] uppercase tracking-wider mb-2">
                      Filtrar por Categoria
                    </p>
                    <div className="space-y-1">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCategory('');
                          setShowCategoryFilter(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${
                          !selectedCategory ? 'bg-[#f97316] text-white font-medium' : 'text-[#374151] hover:bg-[#f3f4f6]'
                        }`}
                      >
                        Todas as categorias
                      </button>
                      {categories.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => {
                            setSelectedCategory(c.name);
                            setShowCategoryFilter(false);
                          }}
                          className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${
                            selectedCategory === c.name
                              ? 'bg-[#f97316] text-white font-medium'
                              : 'text-[#374151] hover:bg-[#f3f4f6]'
                          }`}
                        >
                          {c.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Mensagem de Erro */}
            {error && (
              <div className="px-6 py-3.5 text-sm text-red-600 bg-red-50 border-b border-red-100">
                {error}
              </div>
            )}

            {/* ── Tabela de Produtos (Layout idêntico à Imagem 1) ── */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#f4f5f7] border-b border-[#e5e7eb]">
                    <th className="px-6 py-4 text-sm font-semibold text-[#374151] text-left w-64 sm:w-72">
                      Item
                    </th>
                    <th className="px-6 py-4 text-sm font-semibold text-[#374151] text-left">
                      Descrição
                    </th>
                    <th className="px-6 py-4 text-sm font-semibold text-[#374151] text-center w-36">
                      Categoria
                    </th>
                    <th className="px-6 py-4 text-sm font-semibold text-[#374151] text-center w-32">
                      Preço
                    </th>
                    <th className="px-6 py-4 text-sm font-semibold text-[#374151] text-right w-28">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f3f4f6]">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-14 text-center text-[#6b7280]">
                        <div className="flex flex-col items-center justify-center">
                          <div className="w-6 h-6 border-2 border-[#f97316] border-t-transparent rounded-full animate-spin mb-2" />
                          Carregando menu...
                        </div>
                      </td>
                    </tr>
                  ) : displayedProducts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-14 text-center text-[#6b7280]">
                        Nenhum item encontrado no menu.
                      </td>
                    </tr>
                  ) : (
                    displayedProducts.map((item) => (
                      <tr key={item.id} className="hover:bg-[#fafafa] transition-colors">
                        {/* Item: Foto + Nome */}
                        <td className="px-6 py-4 text-left">
                          <div className="flex items-center gap-3.5">
                            <div className="w-12 h-12 rounded-xl bg-[#f3f4f6] border border-[#e5e7eb] shrink-0 overflow-hidden flex items-center justify-center shadow-xs">
                              {item.image ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                  }}
                                />
                              ) : (
                                <svg className="w-6 h-6 text-[#9ca3af]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              )}
                            </div>
                            <span className="font-medium text-[#1a1a1a] text-sm">
                              {item.name}
                            </span>
                          </div>
                        </td>

                        {/* Descrição */}
                        <td className="px-6 py-4 text-left">
                          <p className="text-xs sm:text-sm text-[#4b5563] max-w-md leading-relaxed">
                            {item.description || '—'}
                          </p>
                        </td>

                        {/* Categoria */}
                        <td className="px-6 py-4 text-center">
                          <CategoryBadge categoryName={item.productCategory} />
                        </td>

                        {/* Preço */}
                        <td className="px-6 py-4 text-center font-normal text-[#1a1a1a] text-sm whitespace-nowrap">
                          {item.price}
                        </td>

                        {/* Ações */}
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-3 text-[#374151]">
                            {/* Editar */}
                            <Link
                              href={`/menu/${item.id}/editar`}
                              aria-label={`Editar ${item.name}`}
                              className="text-[#374151] hover:text-[#1a1a1a] transition-colors p-1 cursor-pointer"
                              title="Editar"
                            >
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                              </svg>
                            </Link>

                            {/* Excluir */}
                            {isAdmin && (
                              <button
                                type="button"
                                onClick={() => setConfirmDelete(item)}
                                aria-label={`Excluir ${item.name}`}
                                className="text-[#374151] hover:text-red-600 transition-colors p-1 cursor-pointer"
                                title="Excluir"
                              >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
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

            {/* ── Paginação e Total (Layout idêntico à Imagem 1) ── */}
            <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-[#f3f4f6] gap-3 text-sm text-[#4b5563]">
              <div>
                Mostrando {rangeStart} a {rangeEnd} de {total} registros
              </div>

              <div className="flex items-center gap-1.5">
                {/* Botão Página Anterior */}
                <button
                  type="button"
                  id="menu-prev-page"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="w-8 h-8 flex items-center justify-center border border-[#d1d5db] rounded-md hover:bg-[#f3f4f6] disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-xs font-bold"
                  aria-label="Página anterior"
                >
                  &lt;
                </button>

                {/* Número da Página Atual */}
                {Array.from({ length: totalPages }, (_, i) => i).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPage(p)}
                    className={`w-8 h-8 flex items-center justify-center rounded-md text-xs font-semibold transition-colors ${
                      p === page
                        ? 'border border-[#f97316] text-[#ea580c] bg-[#fff7ed]'
                        : 'border border-[#d1d5db] text-[#4b5563] hover:bg-[#f3f4f6]'
                    }`}
                  >
                    {p + 1}
                  </button>
                ))}

                {/* Botão Próxima Página */}
                <button
                  type="button"
                  id="menu-next-page"
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  className="w-8 h-8 flex items-center justify-center border border-[#d1d5db] rounded-md hover:bg-[#f3f4f6] disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-xs font-bold"
                  aria-label="Próxima página"
                >
                  &gt;
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
