'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getProductById, updateProduct, getProductCategories } from '@/lib/api';
import type { ProductCategoryResponse } from '@/types/product';

function formatCurrency(val: string): string {
  const digits = val.replace(/\D/g, '');
  if (!digits) return '';
  const num = parseInt(digits, 10) / 100;
  return num.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function parseCurrencyToNumber(val: string): number {
  const clean = val.replace(/[^\d]/g, '');
  if (!clean) return 0;
  return parseInt(clean, 10) / 100;
}

export default function EditarItemPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const productId = Number(params.id);
  const isValidId = Boolean(productId && !Number.isNaN(productId));

  const [categories, setCategories] = useState<ProductCategoryResponse[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [priceInput, setPriceInput] = useState('');
  const [image, setImage] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);

  const [loadingInitial, setLoadingInitial] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(isValidId ? '' : 'ID de produto inválido.');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isValidId) return;

    let ignore = false;
    Promise.all([getProductCategories(), getProductById(productId)])
      .then(([cats, product]) => {
        if (ignore) return;
        setCategories(cats);
        setName(product.name || '');
        setDescription(product.description || '');
        if (product.productCategory) {
          if (typeof product.productCategory === 'object' && product.productCategory !== null) {
            setCategoryId((product.productCategory as ProductCategoryResponse).id);
          } else {
            const match = cats.find((c) => c.name === product.productCategory);
            if (match) setCategoryId(match.id);
          }
        }
        if (product.price) {
          setPriceInput(formatCurrency(product.price));
        }
        if (product.image) {
          setImage(product.image);
          setImagePreview(product.image);
        }
        setIsAvailable(product.isAvailable ?? true);
      })
      .catch(() => {
        if (!ignore) setError('Não foi possível carregar os dados do item.');
      })
      .finally(() => {
        if (!ignore) setLoadingInitial(false);
      });

    return () => {
      ignore = true;
    };
  }, [productId, isValidId]);

  function handlePriceChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;
    const formatted = formatCurrency(raw);
    setPriceInput(formatted);
    setFieldErrors((prev) => ({ ...prev, price: '' }));
  }

  function handleFile(file: File) {
    if (!file.type.startsWith('image/')) {
      setError('Por favor, selecione um arquivo de imagem válido.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setImage(result);
      setImagePreview(result);
      setFieldErrors((prev) => ({ ...prev, image: '' }));
    };
    reader.readAsDataURL(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'O nome do item é obrigatório.';
    if (categoryId === '') errs.category = 'Selecione uma categoria.';
    const numPrice = parseCurrencyToNumber(priceInput);
    if (numPrice <= 0) errs.price = 'Informe um preço válido.';
    if (!image.trim()) errs.image = 'Adicione uma imagem do item.';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    setError('');
    try {
      await updateProduct(productId, {
        name: name.trim(),
        description: description.trim(),
        price: parseCurrencyToNumber(priceInput),
        image: image.trim(),
        productCategoryId: categoryId as number,
        isAvailable,
      });
      setSuccess(true);
      setTimeout(() => router.push('/menu'), 1200);
    } catch {
      setError('Erro ao atualizar o item. Verifique os dados informados.');
    } finally {
      setSaving(false);
    }
  }

  if (loadingInitial) {
    return (
      <div className="max-w-6xl mx-auto py-16 text-center text-[#6b7280]">
        <div className="w-8 h-8 border-2 border-[#f97316] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        Carregando dados do item...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header com seta de voltar matching Imagem 2 */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/menu"
          className="text-[#1a1a1a] hover:text-[#f97316] transition-colors p-1"
          aria-label="Voltar para o Menu"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <line x1="19" y1="12" x2="5" y2="12" strokeLinecap="round" />
            <polyline points="12 19 5 12 12 5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#1a1a1a]">Editar Item</h1>
      </div>

      {/* Card principal matching Imagem 2 */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#e5e7eb] px-6 py-8 sm:px-10 sm:py-10 md:px-14 md:py-12">
        {/* Título centralizado matching Imagem 2 */}
        <h2 className="text-2xl sm:text-[26px] font-bold text-[#1a1a1a] text-center mb-8 sm:mb-12">
          Informações do Item
        </h2>

        {/* Feedback de sucesso */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3 mb-6 flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Item atualizado com sucesso! Redirecionando...
          </div>
        )}

        {/* Feedback de erro */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-6 flex items-start gap-2">
            <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="12" cy="12" r="10" />
              <path strokeLinecap="round" d="M12 8v4M12 16h.01" />
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Grid de 2 colunas matching Imagem 2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 lg:gap-x-14 gap-y-6 sm:gap-y-8">
            {/* ─── Coluna Esquerda ─── */}
            <div className="space-y-6 sm:space-y-8">
              {/* Campo 1: Nome do Item */}
              <div>
                <label htmlFor="edit-item-name" className="block text-base font-bold text-[#1a1a1a] mb-2">
                  Nome do Item
                </label>
                <input
                  id="edit-item-name"
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setFieldErrors((prev) => ({ ...prev, name: '' }));
                  }}
                  placeholder="Digite o nome completo"
                  className={`w-full border rounded-lg px-4 py-3 text-sm text-[#1a1a1a] placeholder:text-[#9ca3af] focus:outline-none focus:border-[#f97316] focus:ring-1 focus:ring-[#f97316] transition-colors ${
                    fieldErrors.name ? 'border-red-400 focus:border-red-400' : 'border-[#d1d5db]'
                  }`}
                />
                {fieldErrors.name && (
                  <p className="text-xs text-red-500 mt-1.5">{fieldErrors.name}</p>
                )}
              </div>

              {/* Campo 2: Descrição */}
              <div>
                <label htmlFor="edit-item-description" className="block text-base font-bold text-[#1a1a1a] mb-2">
                  Descrição
                </label>
                <textarea
                  id="edit-item-description"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descreva o item, seus ingredientes e detalhes importantes."
                  className="w-full border border-[#d1d5db] rounded-lg px-4 py-3 text-sm text-[#1a1a1a] placeholder:text-[#9ca3af] focus:outline-none focus:border-[#f97316] focus:ring-1 focus:ring-[#f97316] transition-colors resize-none"
                />
              </div>

              {/* Campo 3: Categoria */}
              <div>
                <label htmlFor="edit-item-category" className="block text-base font-bold text-[#1a1a1a] mb-2">
                  Categoria
                </label>
                <div className="relative">
                  <select
                    id="edit-item-category"
                    value={categoryId}
                    onChange={(e) => {
                      setCategoryId(e.target.value ? Number(e.target.value) : '');
                      setFieldErrors((prev) => ({ ...prev, category: '' }));
                    }}
                    className={`w-full appearance-none border rounded-lg px-4 py-3 pr-10 text-sm focus:outline-none focus:border-[#f97316] focus:ring-1 focus:ring-[#f97316] transition-colors bg-white cursor-pointer ${
                      fieldErrors.category ? 'border-red-400 focus:border-red-400' : 'border-[#d1d5db]'
                    } ${categoryId ? 'text-[#1a1a1a]' : 'text-[#9ca3af]'}`}
                  >
                    <option value="" disabled>
                      Selecione a categoria
                    </option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id} className="text-[#1a1a1a]">
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <svg
                    className="w-5 h-5 text-[#4b5563] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
                {fieldErrors.category && (
                  <p className="text-xs text-red-500 mt-1.5">{fieldErrors.category}</p>
                )}
              </div>
            </div>

            {/* ─── Coluna Direita ─── */}
            <div className="space-y-6 sm:space-y-8">
              {/* Campo 4: Preço */}
              <div>
                <label htmlFor="edit-item-price" className="block text-base font-bold text-[#1a1a1a] mb-2">
                  Preço
                </label>
                <input
                  id="edit-item-price"
                  type="text"
                  inputMode="numeric"
                  value={priceInput}
                  onChange={handlePriceChange}
                  placeholder="R$ 0,00"
                  className={`w-full border rounded-lg px-4 py-3 text-sm text-[#1a1a1a] placeholder:text-[#9ca3af] focus:outline-none focus:border-[#f97316] focus:ring-1 focus:ring-[#f97316] transition-colors ${
                    fieldErrors.price ? 'border-red-400 focus:border-red-400' : 'border-[#d1d5db]'
                  }`}
                />
                {fieldErrors.price && (
                  <p className="text-xs text-red-500 mt-1.5">{fieldErrors.price}</p>
                )}
              </div>

              {/* Campo 5: Imagem (Upload Dropzone) */}
              <div>
                <label className="block text-base font-bold text-[#1a1a1a] mb-2">
                  Imagem
                </label>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFile(e.target.files[0]);
                    }
                  }}
                />

                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragActive(true);
                  }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-full border rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-white min-h-[140px] ${
                    dragActive
                      ? 'border-[#f97316] bg-orange-50/50'
                      : fieldErrors.image
                      ? 'border-red-400'
                      : 'border-[#d1d5db] hover:border-[#f97316]'
                  }`}
                >
                  {imagePreview ? (
                    <div className="relative group w-full flex flex-col items-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imagePreview}
                        alt="Preview do item"
                        className="max-h-24 w-auto rounded-md object-contain mb-2"
                      />
                      <span className="text-xs text-[#f97316] font-medium">
                        Clique ou arraste para trocar a imagem
                      </span>
                    </div>
                  ) : (
                    <>
                      <svg
                        className="w-10 h-10 text-[#4b5563] mb-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.8}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                      <p className="text-sm text-[#4b5563]">Arraste uma imagem para cá</p>
                      <p className="text-sm font-semibold text-[#f97316]">ou clique para selecionar</p>
                    </>
                  )}
                </div>

                {fieldErrors.image && (
                  <p className="text-xs text-red-500 mt-1.5">{fieldErrors.image}</p>
                )}

                <div className="mt-2 text-right">
                  <button
                    type="button"
                    onClick={() => setShowUrlInput((v) => !v)}
                    className="text-xs text-[#6b7280] hover:text-[#f97316] underline"
                  >
                    {showUrlInput ? 'Ocultar inserção por URL' : 'Ou inserir link da imagem'}
                  </button>
                  {showUrlInput && (
                    <div className="mt-2 flex gap-2">
                      <input
                        type="url"
                        placeholder="https://exemplo.com/foto.jpg"
                        value={image.startsWith('data:') ? '' : image}
                        onChange={(e) => {
                          setImage(e.target.value);
                          setImagePreview(e.target.value);
                          setFieldErrors((prev) => ({ ...prev, image: '' }));
                        }}
                        className="flex-1 border border-[#d1d5db] rounded-lg px-3 py-1.5 text-xs text-[#1a1a1a] focus:outline-none focus:border-[#f97316]"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Campo 6: Disponível (Radio Sim / Não) matching Imagem 2 */}
              <div>
                <label className="block text-base font-bold text-[#1a1a1a] mb-2">
                  Disponível
                </label>
                <div className="flex items-center gap-8 mt-3">
                  <label className="flex items-center gap-2.5 cursor-pointer text-sm font-medium text-[#1a1a1a]">
                    <input
                      type="radio"
                      name="isAvailable"
                      checked={isAvailable === true}
                      onChange={() => setIsAvailable(true)}
                      className="w-4 h-4 text-[#f97316] accent-[#f97316] cursor-pointer"
                    />
                    <span>Sim</span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer text-sm font-medium text-[#1a1a1a]">
                    <input
                      type="radio"
                      name="isAvailable"
                      checked={isAvailable === false}
                      onChange={() => setIsAvailable(false)}
                      className="w-4 h-4 text-[#f97316] accent-[#f97316] cursor-pointer"
                    />
                    <span>Não</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Botão Salvar Alterações no canto inferior direito */}
          <div className="flex justify-end mt-10 sm:mt-12">
            <button
              id="salvar-item-btn"
              type="submit"
              disabled={saving}
              className="bg-[#f97316] hover:bg-[#ea580c] text-white font-bold px-8 py-3 rounded-xl text-base transition-colors shadow-sm disabled:opacity-60 cursor-pointer"
            >
              {saving ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
