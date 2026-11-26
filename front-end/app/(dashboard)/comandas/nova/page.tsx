'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createBill, getRestaurantTables } from '@/lib/api';
import type { RestaurantTableResponse } from '@/types/table';

function getErrorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === 'object' && 'message' in err && typeof err.message === 'string') {
    return err.message;
  }
  return fallback;
}

export default function NovaComandaPage() {
  const router = useRouter();

  const [customer, setCustomer] = useState('');
  const [tableId, setTableId] = useState<number | ''>('');
  const [tables, setTables] = useState<RestaurantTableResponse[]>([]);
  const [loadingTables, setLoadingTables] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    getRestaurantTables()
      .then(setTables)
      .catch(() => {})
      .finally(() => setLoadingTables(false));
  }, []);

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!customer.trim()) errs.customer = 'Informe o nome do cliente.';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setError('');
    try {
      await createBill({
        customer: customer.trim(),
        restaurantTableId: tableId || null,
      });
      setSuccess(true);
      setTimeout(() => router.push('/comandas'), 1200);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Erro ao criar comanda.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Page header */}
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
        <h1 className="text-2xl sm:text-3xl font-bold text-[#1a1a1a]">Nova Comanda</h1>
      </div>

      {/* Main card */}
      <div className="bg-white rounded-xl shadow-sm border border-[#e5e7eb] px-6 py-8 sm:px-10 sm:py-10 md:px-14 md:py-12 max-w-2xl">
        <h2 className="text-2xl sm:text-[26px] font-bold text-[#1a1a1a] mb-8 sm:mb-10">
          Informações da Comanda
        </h2>

        {/* Success banner */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3 mb-6 flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Comanda criada com sucesso! Redirecionando...
          </div>
        )}

        {/* Error banner */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-6 flex items-start gap-2">
            <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="12" cy="12" r="10" />
              <path strokeLinecap="round" d="M12 8v4M12 16h.01" />
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          {/* Número da Mesa */}
          <div>
            <label htmlFor="bill-table" className="block text-base font-bold text-[#1a1a1a] mb-2">
              Número da Mesa
            </label>
            <div className="relative">
              <select
                id="bill-table"
                value={tableId}
                onChange={(e) => setTableId(e.target.value ? Number(e.target.value) : '')}
                disabled={loadingTables}
                className="w-full appearance-none border border-[#d1d5db] rounded-lg px-4 py-3 pr-10 text-sm focus:outline-none focus:border-[#f97316] focus:ring-1 focus:ring-[#f97316] transition-colors bg-white cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed text-[#1a1a1a]"
              >
                <option value="" className="text-[#9ca3af]">
                  {loadingTables ? 'Carregando mesas...' : 'Selecione o número da mesa'}
                </option>
                {tables.map((t) => (
                  <option key={t.id} value={t.id} className="text-[#1a1a1a]">
                    Mesa {t.number}
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
          </div>

          {/* Nome do Cliente */}
          <div>
            <label htmlFor="bill-customer" className="block text-base font-bold text-[#1a1a1a] mb-2">
              Nome do Cliente
            </label>
            <input
              id="bill-customer"
              type="text"
              autoComplete="off"
              value={customer}
              onChange={(e) => {
                setCustomer(e.target.value);
                setFieldErrors((prev) => ({ ...prev, customer: '' }));
                setError('');
              }}
              placeholder="Digite o nome completo"
              className={`w-full border rounded-lg px-4 py-3 text-sm text-[#1a1a1a] placeholder:text-[#9ca3af] focus:outline-none focus:border-[#f97316] focus:ring-1 focus:ring-[#f97316] transition-colors ${
                fieldErrors.customer ? 'border-red-400 focus:border-red-400' : 'border-[#d1d5db]'
              }`}
            />
            {fieldErrors.customer && (
              <p className="text-xs text-red-500 mt-1.5">{fieldErrors.customer}</p>
            )}
          </div>

          {/* Submit button */}
          <div className="flex justify-center pt-4">
            <button
              id="bill-submit-btn"
              type="submit"
              disabled={loading || success}
              className="w-full sm:w-auto bg-[#f97316] hover:bg-[#ea580c] text-white font-bold px-10 py-3 rounded-xl text-sm transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span>Cadastrando...</span>
                </>
              ) : (
                'Cadastrar Comanda'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
