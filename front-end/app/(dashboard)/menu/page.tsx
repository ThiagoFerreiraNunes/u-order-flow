'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  getProducts,
  getProductCategories,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductCategory,
  deleteProductCategory,
} from '@/lib/api';
import { useSession } from '@/lib/use-session';
import type { ProductSummaryResponse, ProductCategoryResponse } from '@/types/product';

const PAGE_SIZE = 12;

// ─── Modal de Produto ─────────────────────────────────────────────────────────
interface ProductModalProps {
  product?: ProductSummaryResponse | null;
  categories: ProductCategoryResponse[];
  onClose: () => void;
  onSaved: () => void;
}

function parseBRLToInput(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return '';
  const normalized = trimmed.includes(',')
    ? trimmed.replace(/[^\d,-]/g, '').replace(',', '.')
    : trimmed.replace(/[^\d.-]/g, '');
  const num = parseFloat(normalized);
  return Number.isNaN(num) ? '' : num.toFixed(2);
}

function ProductModal({ product, categories, onClose, onSaved }: ProductModalProps) {
  const [name, setName] = useState(product?.name ?? '');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(product ? parseBRLToInput(String(product.price)) : '');
  const [image, setImage] = useState(product?.image ?? '');
  const [categoryId, setCategoryId] = useState<number | ''>(
    product
      ? (categories.find((c) => c.name === product.productCategory)?.id ?? '')
      : '',
  );
  const [isAvailable, setIsAvailable] = useState(product?.isAvailable ?? true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !price || !image.trim() || categoryId === '') {
      setError('Preencha todos os campos obrigatórios.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const payload = {
        name: name.trim(),
        description: description.trim(),
        price: parseFloat(price),
        image: image.trim(),
        productCategoryId: categoryId as number,
        isAvailable,
      };
      if (product) {
        await updateProduct(product.id, payload);
      } else {
        await createProduct(payload);
      }
      onSaved();
    } catch {
      setError('Erro ao salvar produto. Verifique os dados.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-[#1a1a1a]">
            {product ? 'Editar Produto' : 'Novo Produto'}
          </h2>
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
            <label className="block text-xs font-medium text-[#374151] mb-1">Nome *</label>
            <input
              className="w-full border border-[#d1d5db] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3c3c3c]"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome do produto"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#374151] mb-1">Descrição</label>
            <textarea
              className="w-full border border-[#d1d5db] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3c3c3c] resize-none"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descrição do produto"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#374151] mb-1">Preço (R\$) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="w-full border border-[#d1d5db] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3c3c3c]"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0,00"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#374151] mb-1">Categoria *</label>
              <select
                className="w-full border border-[#d1d5db] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3c3c3c] bg-white"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : '')}
              >
                <option value="">Selecione</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-[#374151] mb-1">URL da Imagem *</label>
            <input
              className="w-full border border-[#d1d5db] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3c3c3c]"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://..."
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isAvailable"
              checked={isAvailable}
              onChange={(e) => setIsAvailable(e.target.checked)}
              className="w-4 h-4 rounded"
            />
            <label htmlFor="isAvailable" className="text-sm text-[#374151]">Disponível para pedidos</label>
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
              disabled={loading}
              className="px-4 py-2 text-sm bg-[#3c3c3c] text-white rounded-lg hover:bg-[#1a1a1a] transition-colors disabled:opacity-60"
            >
              {loading ? 'Salvando...' : (product ? 'Salvar' : 'Criar')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Modal de Categoria ───────────────────────────────────────────────────────
interface CategoryModalProps {
  onClose: () => void;
  onSaved: () => void;
}

function CategoryModal({ onClose, onSaved }: CategoryModalProps) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setError('Informe o nome da categoria.'); return; }
    setLoading(true);
    setError('');
    try {
      await createProductCategory({ name: name.trim() });
      onSaved();
    } catch {
      setError('Erro ao criar categoria.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-[#1a1a1a]">Nova Categoria</h2>
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
            <label className="block text-xs font-medium text-[#374151] mb-1">Nome da Categoria *</label>
            <input
              className="w-full border border-[#d1d5db] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3c3c3c]"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Bebidas, Pratos Principais..."
              autoFocus
            />
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

// ─── Página Menu ──────────────────────────────────────────────────────────────
export default function MenuPage() {
  const { role } = useSession();
  const isAdmin = role === 'ADMIN';

  const [products, setProducts] = useState<ProductSummaryResponse[]>([]);
  const [categories, setCategories] = useState<ProductCategoryResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadTrigger, setReloadTrigger] = useState(0);
  const [catReload, setCatReload] = useState(0);

  const [productModal, setProductModal] = useState<ProductSummaryResponse | null | false>(false);
  const [categoryModal, setCategoryModal] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const reload = useCallback(() => setReloadTrigger((n) => n + 1), []);

  // Load categories once + on catReload (ADMIN only endpoint)
  useEffect(() => {
    if (!isAdmin) return;
    getProductCategories()
      .then(setCategories)
      .catch(() => {});
  }, [catReload, isAdmin]);

  // Load products
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
        if (!ignore) setError('Não foi possível carregar os produtos.');
      })
      .finally(() => { if (!ignore) setLoading(false); });

    return () => { ignore = true; };
  }, [search, page, reloadTrigger]);

  // Filter by category client-side (since backend doesn't support categoryId filter)
  const displayed = selectedCategory
    ? products.filter((p) => p.productCategory === selectedCategory)
    : products;

  async function handleDelete(id: number) {
    setDeletingId(id);
    try {
      await deleteProduct(id);
      reload();
    } catch {
      setError('Erro ao excluir produto.');
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  }

  async function handleDeleteCategory(id: number) {
    try {
      await deleteProductCategory(id);
      setCatReload((n) => n + 1);
    } catch {
      setError('Erro ao excluir categoria (pode ter produtos associados).');
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Modais */}
      {productModal !== false && (
        <ProductModal
          product={productModal}
          categories={categories}
          onClose={() => setProductModal(false)}
          onSaved={() => { setProductModal(false); reload(); }}
        />
      )}
      {categoryModal && (
        <CategoryModal
          onClose={() => setCategoryModal(false)}
          onSaved={() => { setCategoryModal(false); setCatReload((n) => n + 1); }}
        />
      )}
      {confirmDeleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-[#1a1a1a] mb-2">Excluir produto?</h3>
            <p className="text-sm text-[#6b7280] mb-5">Esta ação não pode ser desfeita.</p>
            <div className="flex justify-center gap-3">
              <button onClick={() => setConfirmDeleteId(null)}
                className="px-5 py-2 text-sm border border-[#d1d5db] text-[#374151] rounded-lg hover:bg-[#f9fafb] transition-colors">
                Cancelar
              </button>
              <button onClick={() => handleDelete(confirmDeleteId!)}
                disabled={deletingId !== null}
                className="px-5 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-60">
                {deletingId === confirmDeleteId ? 'Excluindo...' : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-bold text-[#1a1a1a]">Menu</h1>
          <p className="text-sm text-[#6b7280] mt-0.5">{total} produto{total !== 1 ? 's' : ''} cadastrado{total !== 1 ? 's' : ''}</p>
        </div>
        {isAdmin && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setCategoryModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm border border-[#d1d5db] text-[#374151] rounded-lg hover:bg-[#f9fafb] transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a2 2 0 014-4z" />
              </svg>
              Nova Categoria
            </button>
            <button
              onClick={() => setProductModal(null)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm bg-[#3c3c3c] text-white rounded-lg hover:bg-[#1a1a1a] transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Novo Produto
            </button>
          </div>
        )}
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9ca3af]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <circle cx="11" cy="11" r="8" /><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35" />
          </svg>
          <input
            className="w-full pl-9 pr-3 py-2 border border-[#d1d5db] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3c3c3c]"
            placeholder="Pesquisar produto..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          />
        </div>
        <select
          className="border border-[#d1d5db] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3c3c3c] bg-white sm:w-52"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">Todas as categorias</option>
          {categories.map((c) => (
            <option key={c.id} value={c.name}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Categorias (chips) */}
      {isAdmin && categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((c) => (
            <div key={c.id} className="flex items-center gap-1 px-3 py-1 bg-[#f3f4f6] rounded-full text-xs text-[#374151] border border-[#e5e7eb]">
              <span>{c.name}</span>
              <button
                onClick={() => handleDeleteCategory(c.id)}
                className="ml-1 text-[#9ca3af] hover:text-red-500 transition-colors"
                title="Excluir categoria"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

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

      {/* Grid de Produtos */}
      {!loading && displayed.length === 0 && (
        <div className="text-center py-16 text-[#9ca3af]">
          <svg className="w-12 h-12 mx-auto mb-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <p className="text-sm">Nenhum produto encontrado.</p>
        </div>
      )}

      {!loading && displayed.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {displayed.map((product) => (
            <div key={product.id} className="bg-white rounded-xl border border-[#e5e7eb] overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              {/* Imagem */}
              <div className="h-36 bg-[#f9fafb] flex items-center justify-center overflow-hidden">
                {product.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                ) : (
                  <svg className="w-10 h-10 text-[#d1d5db]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                )}
              </div>

              {/* Info */}
              <div className="p-3">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="text-sm font-semibold text-[#1a1a1a] leading-tight line-clamp-2">{product.name}</p>
                  <span className={`shrink-0 text-xs px-1.5 py-0.5 rounded-full font-medium ${product.isAvailable ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {product.isAvailable ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
                <p className="text-xs text-[#9ca3af] mb-2">{product.productCategory}</p>
                <p className="text-sm font-bold text-[#1a1a1a]">{product.price}</p>

                {/* Ações */}
                {isAdmin && (
                  <div className="flex gap-2 mt-3 pt-3 border-t border-[#f3f4f6]">
                    <button
                      onClick={() => setProductModal(product)}
                      className="flex-1 text-xs py-1.5 border border-[#d1d5db] text-[#374151] rounded-lg hover:bg-[#f9fafb] transition-colors"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(product.id)}
                      className="flex-1 text-xs py-1.5 border border-red-200 text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      Excluir
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Paginação */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-3 py-1.5 text-sm border border-[#d1d5db] rounded-lg hover:bg-[#f9fafb] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            ← Anterior
          </button>
          <span className="text-sm text-[#6b7280]">Página {page + 1} de {totalPages}</span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="px-3 py-1.5 text-sm border border-[#d1d5db] rounded-lg hover:bg-[#f9fafb] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Próxima →
          </button>
        </div>
      )}
    </div>
  );
}
