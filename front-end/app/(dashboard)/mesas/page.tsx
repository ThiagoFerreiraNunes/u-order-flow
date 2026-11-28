'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  getRestaurantTables,
  createRestaurantTable,
  updateRestaurantTable,
  deleteRestaurantTable,
} from '@/lib/api';
import type { RestaurantTableResponse } from '@/types/table';

import { getErrorMessage } from '@/lib/formatters';

const SEM_MESA_TABLE: RestaurantTableResponse = {
  id: 0,
  number: 0,
};

export default function MesasPage() {
  const [tables, setTables] = useState<RestaurantTableResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newNumber, setNewNumber] = useState('');
  const [creating, setCreating] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editNumber, setEditNumber] = useState('');
  const [savingId, setSavingId] = useState<number | null>(null);

  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  const reload = useCallback(() => setReloadTrigger((n) => n + 1), []);

  useEffect(() => {
    let ignore = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setError('');

    getRestaurantTables()
      .then((data) => {
        if (!ignore) {
          const list = data.some((t) => t.id === 0 || t.number === 0)
            ? data
            : [SEM_MESA_TABLE, ...data];
          setTables([...list].sort((a, b) => a.number - b.number));
        }
      })
      .catch(() => {
        if (!ignore) {
          // Garante que pelo menos a opção Sem Mesa seja exibida mesmo em falha de conexão
          setTables([SEM_MESA_TABLE]);
          setError('Não foi possível carregar as demais mesas.');
        }
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [reloadTrigger]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const num = Number(newNumber);
    if (!newNumber.trim() || !Number.isInteger(num) || num <= 0) {
      if (num === 0) {
        setError('A opção "Sem Mesa" já existe como padrão fixo do sistema.');
        return;
      }
      setError('Informe um número de mesa válido (maior que 0).');
      return;
    }

    setCreating(true);
    setError('');
    try {
      await createRestaurantTable({ number: num });
      setNewNumber('');
      reload();
    } catch (err) {
      setError(getErrorMessage(err, 'Erro ao criar mesa. Verifique se o número já existe.'));
    } finally {
      setCreating(false);
    }
  }

  async function handleUpdate(id: number) {
    if (id === 0) {
      setError('A opção "Sem Mesa" não pode ser editada.');
      return;
    }
    const num = Number(editNumber);
    if (!editNumber.trim() || !Number.isInteger(num) || num <= 0) {
      setError('Informe um número de mesa válido (maior que 0).');
      return;
    }

    setSavingId(id);
    setError('');
    try {
      await updateRestaurantTable(id, { number: num });
      setEditingId(null);
      reload();
    } catch (err) {
      setError(getErrorMessage(err, 'Erro ao atualizar mesa.'));
    } finally {
      setSavingId(null);
    }
  }

  async function handleDelete(id: number) {
    if (id === 0) {
      setError('A opção "Sem Mesa" não pode ser excluída.');
      return;
    }
    setDeletingId(id);
    setError('');
    try {
      await deleteRestaurantTable(id);
      setConfirmDeleteId(null);
      reload();
    } catch (err) {
      setError(getErrorMessage(err, 'Erro ao excluir mesa.'));
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      {/* Cabeçalho */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[#1a1a1a]">Mesas</h1>
        <p className="text-sm text-[#6b7280] mt-0.5">
          {tables.length} mesa{tables.length !== 1 ? 's' : ''} cadastrada{tables.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Formulário de criação rápida */}
      <form
        onSubmit={handleCreate}
        className="bg-white rounded-xl border border-[#e5e7eb] p-4 sm:p-5 shadow-sm mb-6 flex flex-col sm:flex-row sm:items-end gap-3"
      >
        <div className="flex-1 max-w-xs">
          <label htmlFor="new-table-number" className="block text-xs font-medium text-[#374151] mb-1">
            Número da Nova Mesa
          </label>
          <input
            id="new-table-number"
            type="number"
            min={1}
            step={1}
            value={newNumber}
            onChange={(e) => setNewNumber(e.target.value)}
            placeholder="Ex: 1, 2, 10..."
            className="w-full border border-[#d1d5db] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3c3c3c]"
          />
        </div>
        <button
          type="submit"
          disabled={creating}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm bg-[#3c3c3c] text-white rounded-lg hover:bg-[#1a1a1a] transition-colors disabled:opacity-60 cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          {creating ? 'Criando...' : 'Adicionar Mesa'}
        </button>
      </form>

      {/* Erro */}
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
      {!loading && tables.length === 0 && (
        <div className="bg-white rounded-xl border border-[#e5e7eb] p-12 text-center text-[#9ca3af]">
          <p className="text-sm">Nenhuma mesa cadastrada ainda.</p>
        </div>
      )}

      {/* Grid de Mesas */}
      {!loading && tables.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {tables.map((table) => {
            const isEditing = editingId === table.id;
            const isDeleting = confirmDeleteId === table.id;
            const isSemMesa = table.id === 0 || table.number === 0;

            return (
              <div
                key={table.id}
                className={`bg-white rounded-xl border p-4 shadow-sm flex flex-col justify-between gap-3 ${
                  isSemMesa ? 'border-amber-200 bg-amber-50/20 ring-1 ring-amber-100' : 'border-[#e5e7eb]'
                }`}
              >
                {isEditing && !isSemMesa ? (
                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-[#374151]">Novo número</label>
                    <input
                      type="number"
                      min={1}
                      step={1}
                      value={editNumber}
                      onChange={(e) => setEditNumber(e.target.value)}
                      className="w-full border border-[#d1d5db] rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#3c3c3c]"
                      autoFocus
                    />
                    <div className="flex gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="flex-1 text-xs py-1.5 border border-[#d1d5db] text-[#374151] rounded-lg hover:bg-[#f9fafb]"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdate(table.id)}
                        disabled={savingId === table.id}
                        className="flex-1 text-xs py-1.5 bg-[#3c3c3c] text-white rounded-lg hover:bg-[#1a1a1a] disabled:opacity-60"
                      >
                        {savingId === table.id ? '...' : 'Salvar'}
                      </button>
                    </div>
                  </div>
                ) : isSemMesa ? (
                  <>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="text-base font-bold text-[#1a1a1a]">Sem Mesa</p>
                          <span className="text-[10px] bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded-full">
                            Padrão
                          </span>
                        </div>
                        <p className="text-xs text-[#6b7280] mt-0.5">Balcão / Viagem / Múltiplas Comandas</p>
                      </div>
                      <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009 9c.697 0 1.343-.238 1.875-.64a3 3 0 004.25 0c.532.402 1.178.64 1.875.64.697 0 1.343-.238 1.875-.64a3 3 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.15c0 .414.336.75.75.75z" />
                        </svg>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-[#f3f4f6] text-[11px] text-[#6b7280]">
                      <span>Várias comandas vinculadas</span>
                      <span className="font-medium text-[#9ca3af] bg-[#f3f4f6] px-1.5 py-0.5 rounded">
                        Não editável
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-base font-bold text-[#1a1a1a]">Mesa {table.number}</p>
                        <p className="text-xs text-[#9ca3af] font-mono">ID #{table.id}</p>
                      </div>
                      <div className="w-9 h-9 rounded-lg bg-[#f3f4f6] flex items-center justify-center text-[#3c3c3c]">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                          <rect x="3" y="7" width="18" height="4" rx="1" />
                          <line x1="6" y1="11" x2="6" y2="19" strokeLinecap="round" />
                          <line x1="18" y1="11" x2="18" y2="19" strokeLinecap="round" />
                        </svg>
                      </div>
                    </div>

                    {isDeleting ? (
                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#f3f4f6]">
                        <span className="text-xs text-red-600 font-medium">Excluir?</span>
                        <div className="flex gap-1.5">
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(null)}
                            className="text-xs px-2 py-1 border border-[#d1d5db] text-[#374151] rounded-lg hover:bg-[#f9fafb]"
                          >
                            Não
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(table.id)}
                            disabled={deletingId === table.id}
                            className="text-xs px-2 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-60"
                          >
                            {deletingId === table.id ? '...' : 'Sim'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2 pt-2 border-t border-[#f3f4f6]">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingId(table.id);
                            setEditNumber(String(table.number));
                            setConfirmDeleteId(null);
                          }}
                          className="flex-1 text-xs py-1.5 border border-[#d1d5db] text-[#374151] rounded-lg hover:bg-[#f9fafb] transition-colors"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(table.id)}
                          className="flex-1 text-xs py-1.5 border border-red-200 text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          Excluir
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
