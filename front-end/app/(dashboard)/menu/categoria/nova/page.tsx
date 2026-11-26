'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createProductCategory } from '@/lib/api';

// Paleta de cores predefinidas para categorias (combinando com os badges do menu)
const PRESET_COLORS = [
  { name: 'Laranja', hex: '#ea580c', bg: '#fff7ed', border: '#ffedd5' },
  { name: 'Vermelho / Rosa', hex: '#ef4444', bg: '#fef2f2', border: '#fee2e2' },
  { name: 'Amarelo / Âmbar', hex: '#ca8a04', bg: '#fefce8', border: '#fef9c3' },
  { name: 'Roxo / Violeta', hex: '#7c3aed', bg: '#f5f3ff', border: '#ede9fe' },
  { name: 'Verde', hex: '#16a34a', bg: '#f0fdf4', border: '#dcfce7' },
  { name: 'Azul', hex: '#2563eb', bg: '#eff6ff', border: '#dbeafe' },
  { name: 'Rosa / Pink', hex: '#db2777', bg: '#fdf2f8', border: '#fce7f3' },
  { name: 'Ciano / Turquesa', hex: '#0891b2', bg: '#ecfeff', border: '#cffafe' },
];

export default function NovaCategoriaPage() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState<{
    name: string;
    hex: string;
    bg: string;
    border: string;
  } | null>(null);

  const [paletteOpen, setPaletteOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  const colorDropdownRef = useRef<HTMLDivElement>(null);

  // Fechar dropdown de cores ao clicar fora
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (colorDropdownRef.current && !colorDropdownRef.current.contains(e.target as Node)) {
        setPaletteOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'O nome da categoria é obrigatório.';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setError('');
    try {
      await createProductCategory({ name: name.trim() });

      // Salvar a cor personalizada associada à categoria no localStorage
      if (selectedColor) {
        try {
          const stored = localStorage.getItem('uorder_category_colors');
          const map = stored ? JSON.parse(stored) : {};
          map[name.trim().toLowerCase()] = selectedColor;
          localStorage.setItem('uorder_category_colors', JSON.stringify(map));
        } catch {}
      }

      setSuccess(true);
      setTimeout(() => router.push('/menu'), 1200);
    } catch {
      setError('Erro ao cadastrar a categoria. Verifique se o nome já não está em uso.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* ── Header com seta de retorno matching Imagem anexa ── */}
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
        <h1 className="text-2xl sm:text-3xl font-bold text-[#1a1a1a]">Nova Categoria</h1>
      </div>

      {/* ── Card Principal matching Imagem anexa ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#e5e7eb] px-6 py-8 sm:px-10 sm:py-10 md:px-12 md:py-12 max-w-xl">
        {/* Título interno do card */}
        <h2 className="text-2xl sm:text-[26px] font-bold text-[#1a1a1a] mb-8 sm:mb-10">
          Informações da Categoria
        </h2>

        {/* Feedback de sucesso */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3 mb-6 flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Categoria cadastrada com sucesso! Redirecionando...
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

        <form onSubmit={handleSubmit} noValidate className="space-y-6 sm:space-y-8">
          {/* Campo 1: Nome da Categoria */}
          <div>
            <label htmlFor="category-name" className="block text-base font-bold text-[#1a1a1a] mb-2">
              Nome da Categoria
            </label>
            <input
              id="category-name"
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

          {/* Campo 2: Escolha a Cor */}
          <div className="relative" ref={colorDropdownRef}>
            <label className="block text-base font-bold text-[#1a1a1a] mb-2">
              Escolha a Cor
            </label>

            {/* Input visual da cor matching o layout */}
            <div
              onClick={() => setPaletteOpen((v) => !v)}
              className="w-full border border-[#d1d5db] rounded-lg px-4 py-3 text-sm flex items-center gap-3.5 cursor-pointer bg-white hover:border-[#f97316] transition-colors"
            >
              {/* Círculo indicador da cor */}
              <div
                className="w-6 h-6 rounded-full border border-[#d1d5db] shrink-0 transition-colors shadow-2xs"
                style={{
                  backgroundColor: selectedColor ? selectedColor.hex : '#f3f4f6',
                }}
              />

              {/* Texto do placeholder / cor selecionada */}
              <span
                className={`flex-1 select-none text-sm ${
                  selectedColor ? 'text-[#1a1a1a] font-medium' : 'text-[#9ca3af]'
                }`}
              >
                {selectedColor ? selectedColor.name : 'Selecione a cor da categoria'}
              </span>

              {/* Ícone chevron sutil */}
              <svg
                className={`w-4 h-4 text-[#9ca3af] transition-transform ${
                  paletteOpen ? 'rotate-180' : ''
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>

            {/* Paleta suspensa de cores */}
            {paletteOpen && (
              <div className="absolute left-0 right-0 mt-2 p-4 bg-white border border-[#e5e7eb] rounded-xl shadow-lg z-20">
                <p className="text-xs font-bold text-[#6b7280] uppercase tracking-wider mb-3">
                  Cores sugeridas para cardápio
                </p>
                <div className="grid grid-cols-4 gap-2.5">
                  {PRESET_COLORS.map((col) => (
                    <button
                      key={col.name}
                      type="button"
                      onClick={() => {
                        setSelectedColor(col);
                        setPaletteOpen(false);
                      }}
                      className={`flex flex-col items-center gap-1.5 p-2 rounded-lg border text-center transition-colors cursor-pointer ${
                        selectedColor?.hex === col.hex
                          ? 'border-[#f97316] bg-orange-50/60'
                          : 'border-[#e5e7eb] hover:bg-[#f9fafb]'
                      }`}
                    >
                      <div
                        className="w-6 h-6 rounded-full border border-black/10 shadow-2xs"
                        style={{ backgroundColor: col.hex }}
                      />
                      <span className="text-[11px] text-[#4b5563] truncate w-full">
                        {col.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Botão Cadastrar Categoria alinhado à direita matching o layout */}
          <div className="flex justify-end pt-4">
            <button
              id="cadastrar-categoria-btn"
              type="submit"
              disabled={loading}
              className="bg-[#f97316] hover:bg-[#ea580c] text-white font-bold px-8 py-3 rounded-xl text-base transition-colors shadow-sm disabled:opacity-60 cursor-pointer"
            >
              {loading ? 'Cadastrando...' : 'Cadastrar Categoria'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
