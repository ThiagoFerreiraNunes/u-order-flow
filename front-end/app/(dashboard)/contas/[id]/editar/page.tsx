'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getUserById, updateUser, updateUserPassword } from '@/lib/api';
import type { UserRole, ApiError, ValidationErrors } from '@/types/user';

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: 'ADMIN', label: 'Administrador' },
  { value: 'WAITER', label: 'Garçom' },
  { value: 'COOK', label: 'Cozinheiro' },
  { value: 'CASHIER', label: 'Caixa' },
];

function normalizeRole(role: string): UserRole | '' {
  const upper = role.trim().toUpperCase();
  if (upper === 'ADMIN' || upper === 'WAITER' || upper === 'COOK' || upper === 'CASHIER') {
    return upper;
  }
  return '';
}

export default function EditarContaPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const userId = Number(params.id);
  const isValidId = Boolean(userId && !Number.isNaN(userId));

  const [form, setForm] = useState({
    name: '',
    email: '',
    role: '' as UserRole | '',
  });
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loadingUser, setLoadingUser] = useState(isValidId);
  const [saving, setSaving] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [error, setError] = useState(isValidId ? '' : 'ID de usuário inválido.');
  const [passwordError, setPasswordError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (!isValidId) return;

    let ignore = false;
    getUserById(userId)
      .then((user) => {
        if (ignore) return;
        setForm({
          name: user.name,
          email: user.email,
          role: normalizeRole(user.role),
        });
      })
      .catch(() => {
        if (!ignore) setError('Não foi possível carregar os dados do usuário.');
      })
      .finally(() => {
        if (!ignore) setLoadingUser(false);
      });

    return () => {
      ignore = true;
    };
  }, [userId, isValidId]);

  function handleChange(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => ({ ...prev, [field]: '' }));
    setError('');
    setSuccessMsg('');
  }

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Nome completo é obrigatório.';
    if (!form.email.trim()) errs.email = 'E-mail é obrigatório.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = 'Informe um e-mail válido.';
    if (!form.role) errs.role = 'Selecione uma função.';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    setError('');
    setSuccessMsg('');
    try {
      await updateUser(userId, {
        name: form.name.trim(),
        email: form.email.trim(),
        role: form.role as UserRole,
      });
      setSuccessMsg('Dados atualizados com sucesso!');
      setTimeout(() => router.push('/contas'), 1200);
    } catch (err: unknown) {
      if (err && typeof err === 'object') {
        const asApiError = err as ApiError;
        if (asApiError.status === 409) {
          setError('Este e-mail já está em uso por outro usuário.');
        } else if (asApiError.status === 403) {
          setError('Acesso negado. Apenas administradores podem editar contas.');
        } else if (!('status' in asApiError)) {
          const validationErrs = err as ValidationErrors;
          setFieldErrors((prev) => ({ ...prev, ...validationErrs }));
        } else {
          setError(asApiError.message ?? 'Erro ao atualizar usuário.');
        }
      } else {
        setError('Erro de conexão. Verifique o servidor.');
      }
    } finally {
      setSaving(false);
    }
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError('');
    setSuccessMsg('');

    if (newPassword.length < 6) {
      setPasswordError('A nova senha deve ter no mínimo 6 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('As senhas não coincidem.');
      return;
    }

    setSavingPassword(true);
    try {
      await updateUserPassword(userId, { newPassword });
      setNewPassword('');
      setConfirmPassword('');
      setSuccessMsg('Senha alterada com sucesso!');
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      setPasswordError(apiErr?.message ?? 'Erro ao alterar senha.');
    } finally {
      setSavingPassword(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Page header with back arrow */}
      <div className="flex items-center gap-3">
        <Link
          href="/contas"
          className="text-[#1a1a1a] hover:text-[#f97316] transition-colors p-1"
          aria-label="Voltar para contas"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <line x1="19" y1="12" x2="5" y2="12" strokeLinecap="round" />
            <polyline points="12 19 5 12 12 5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#1a1a1a]">Editar Conta</h1>
      </div>

      {/* Main card: Informações pessoais */}
      <div className="bg-white rounded-xl shadow-sm border border-[#e5e7eb] px-6 py-8 sm:px-10 sm:py-10 md:px-14 md:py-12">
        <h2 className="text-2xl sm:text-[26px] font-bold text-[#1a1a1a] text-center mb-8 sm:mb-12">
          Informações pessoais
        </h2>

        {successMsg && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3 mb-6 flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            {successMsg}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-6 flex items-start gap-2">
            <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="12" cy="12" r="10" />
              <path strokeLinecap="round" d="M12 8v4M12 16h.01" />
            </svg>
            {error}
          </div>
        )}

        {loadingUser ? (
          <div className="py-12 text-center text-[#9ca3af] text-sm">Carregando dados...</div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 lg:gap-x-14 gap-y-6 sm:gap-y-8">
              <div>
                <label htmlFor="edit-name" className="block text-base font-bold text-[#1a1a1a] mb-2">
                  Nome Completo
                </label>
                <input
                  id="edit-name"
                  type="text"
                  value={form.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Digite o nome completo"
                  className={`w-full border rounded-lg px-4 py-3 text-sm text-[#1a1a1a] placeholder:text-[#9ca3af] focus:outline-none focus:border-[#f97316] focus:ring-1 focus:ring-[#f97316] transition-colors ${
                    fieldErrors.name ? 'border-red-400 focus:border-red-400' : 'border-[#d1d5db]'
                  }`}
                />
                {fieldErrors.name && <p className="text-xs text-red-500 mt-1.5">{fieldErrors.name}</p>}
              </div>

              <div>
                <label htmlFor="edit-email" className="block text-base font-bold text-[#1a1a1a] mb-2">
                  Email
                </label>
                <input
                  id="edit-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="exemplo@uorderflow.com"
                  className={`w-full border rounded-lg px-4 py-3 text-sm text-[#1a1a1a] placeholder:text-[#9ca3af] focus:outline-none focus:border-[#f97316] focus:ring-1 focus:ring-[#f97316] transition-colors ${
                    fieldErrors.email ? 'border-red-400 focus:border-red-400' : 'border-[#d1d5db]'
                  }`}
                />
                {fieldErrors.email && <p className="text-xs text-red-500 mt-1.5">{fieldErrors.email}</p>}
              </div>

              <div>
                <label htmlFor="edit-role" className="block text-base font-bold text-[#1a1a1a] mb-2">
                  Função
                </label>
                <div className="relative">
                  <select
                    id="edit-role"
                    value={form.role}
                    onChange={(e) => handleChange('role', e.target.value)}
                    className={`w-full appearance-none border rounded-lg px-4 py-3 pr-10 text-sm focus:outline-none focus:border-[#f97316] focus:ring-1 focus:ring-[#f97316] transition-colors bg-white cursor-pointer ${
                      fieldErrors.role ? 'border-red-400 focus:border-red-400' : 'border-[#d1d5db]'
                    } ${form.role ? 'text-[#1a1a1a]' : 'text-[#9ca3af]'}`}
                  >
                    <option value="" disabled>Selecione a categoria</option>
                    {ROLE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value} className="text-[#1a1a1a]">{opt.label}</option>
                    ))}
                  </select>
                  <svg
                    className="w-5 h-5 text-[#4b5563] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
                {fieldErrors.role && <p className="text-xs text-red-500 mt-1.5">{fieldErrors.role}</p>}
              </div>
            </div>

            <div className="flex justify-end mt-10 sm:mt-12">
              <button
                type="submit"
                disabled={saving}
                className="w-full sm:w-auto bg-[#f97316] hover:bg-[#ea580c] text-white font-bold px-8 py-3 rounded-xl text-sm transition-colors shadow-sm disabled:opacity-60 cursor-pointer"
              >
                {saving ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Card Redefinir Senha */}
      {!loadingUser && (
        <div className="bg-white rounded-xl shadow-sm border border-[#e5e7eb] px-6 py-8 sm:px-10 sm:py-10 md:px-14 md:py-12">
          <h2 className="text-xl font-bold text-[#1a1a1a] mb-6">
            Redefinir Senha
          </h2>

          {passwordError && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-2.5 mb-6">
              {passwordError}
            </div>
          )}

          <form onSubmit={handlePasswordSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 lg:gap-x-14 gap-y-6 sm:gap-y-8">
              <div>
                <label htmlFor="edit-new-password" className="block text-base font-bold text-[#1a1a1a] mb-2">
                  Nova Senha
                </label>
                <input
                  id="edit-new-password"
                  type="password"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full border border-[#d1d5db] rounded-lg px-4 py-3 text-sm text-[#1a1a1a] placeholder:text-[#9ca3af] focus:outline-none focus:border-[#f97316] focus:ring-1 focus:ring-[#f97316]"
                />
              </div>

              <div>
                <label htmlFor="edit-confirm-password" className="block text-base font-bold text-[#1a1a1a] mb-2">
                  Confirmar Nova Senha
                </label>
                <input
                  id="edit-confirm-password"
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repita a nova senha"
                  className="w-full border border-[#d1d5db] rounded-lg px-4 py-3 text-sm text-[#1a1a1a] placeholder:text-[#9ca3af] focus:outline-none focus:border-[#f97316] focus:ring-1 focus:ring-[#f97316]"
                />
              </div>
            </div>

            <div className="flex justify-end mt-8">
              <button
                type="submit"
                disabled={savingPassword}
                className="w-full sm:w-auto bg-[#3c3c3c] hover:bg-[#1a1a1a] text-white font-bold px-8 py-3 rounded-xl text-sm transition-colors disabled:opacity-60 cursor-pointer"
              >
                {savingPassword ? 'Alterando...' : 'Alterar Senha'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
