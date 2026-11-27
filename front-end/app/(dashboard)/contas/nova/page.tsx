'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { registerUser } from '@/lib/api';
import type { UserRole, ApiError, ValidationErrors } from '@/types/user';

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: 'ADMIN', label: 'Administrador' },
  { value: 'WAITER', label: 'Garçom' },
  { value: 'COOK', label: 'Cozinheiro' },
  { value: 'CASHIER', label: 'Caixa' },
];

export default function NovaContaPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '' as UserRole | '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  function handleChange(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => ({ ...prev, [field]: '' }));
    setError('');
  }

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Nome completo é obrigatório.';
    if (!form.email.trim()) errs.email = 'E-mail é obrigatório.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = 'Informe um e-mail válido.';
    if (!form.password) errs.password = 'Senha é obrigatória.';
    else if (form.password.length < 6) errs.password = 'Mínimo de 6 caracteres.';
    if (form.password !== form.confirmPassword)
      errs.confirmPassword = 'As senhas não coincidem.';
    if (!form.role) errs.role = 'Selecione uma função.';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setError('');
    try {
      await registerUser({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role as UserRole,
      });
      setSuccess(true);
      setTimeout(() => router.push('/contas'), 1200);
    } catch (err: unknown) {
      if (err && typeof err === 'object') {
        const asApiError = err as ApiError;
        if (asApiError.status === 409) {
          setError('Este e-mail já está cadastrado.');
        } else if (asApiError.status === 403) {
          setError('Acesso negado. Apenas administradores podem cadastrar usuários.');
        } else if (asApiError.status === 401) {
          setError('Sessão expirada. Faça login novamente.');
        } else if (!('status' in asApiError)) {
          const validationErrs = err as ValidationErrors;
          setFieldErrors((prev) => ({ ...prev, ...validationErrs }));
        } else {
          setError(asApiError.message ?? 'Erro ao cadastrar funcionário.');
        }
      } else {
        setError('Erro de conexão. Verifique o servidor.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Page header with back arrow matching image 2 */}
      <div className="flex items-center gap-3 mb-6">
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
        <h1 className="text-2xl sm:text-3xl font-bold text-[#1a1a1a]">Nova Conta</h1>
      </div>

      {/* Main white card */}
      <div className="bg-white rounded-xl shadow-sm border border-[#e5e7eb] px-6 py-8 sm:px-10 sm:py-10 md:px-14 md:py-12">
        {/* Card centered title matching image 2 */}
        <h2 className="text-2xl sm:text-[26px] font-bold text-[#1a1a1a] text-center mb-8 sm:mb-12">
          Informações pessoais
        </h2>

        {/* Success banner */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3 mb-6 flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Funcionário cadastrado com sucesso! Redirecionando...
          </div>
        )}

        {/* Error banner */}
        {error && (
          <div
            id="register-error-banner"
            className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-6 flex items-start gap-2"
          >
            <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="12" cy="12" r="10" />
              <path strokeLinecap="round" d="M12 8v4M12 16h.01" />
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* 2-column grid matching image 2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 lg:gap-x-14 gap-y-6 sm:gap-y-8">
            {/* Field 1: Nome Completo */}
            <div>
              <label htmlFor="register-name" className="block text-base font-bold text-[#1a1a1a] mb-2">
                Nome Completo
              </label>
              <input
                id="register-name"
                type="text"
                autoComplete="name"
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Digite o nome completo"
                className={`w-full border rounded-lg px-4 py-3 text-sm text-[#1a1a1a] placeholder:text-[#9ca3af] focus:outline-none focus:border-[#f97316] focus:ring-1 focus:ring-[#f97316] transition-colors ${
                  fieldErrors.name ? 'border-red-400 focus:border-red-400' : 'border-[#d1d5db]'
                }`}
              />
              {fieldErrors.name && (
                <p className="text-xs text-red-500 mt-1.5">{fieldErrors.name}</p>
              )}
            </div>

            {/* Field 2: Email */}
            <div>
              <label htmlFor="register-email" className="block text-base font-bold text-[#1a1a1a] mb-2">
                Email
              </label>
              <input
                id="register-email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="exemplo@uorderflow.com"
                className={`w-full border rounded-lg px-4 py-3 text-sm text-[#1a1a1a] placeholder:text-[#9ca3af] focus:outline-none focus:border-[#f97316] focus:ring-1 focus:ring-[#f97316] transition-colors ${
                  fieldErrors.email ? 'border-red-400 focus:border-red-400' : 'border-[#d1d5db]'
                }`}
              />
              {fieldErrors.email && (
                <p className="text-xs text-red-500 mt-1.5">{fieldErrors.email}</p>
              )}
            </div>

            {/* Field 3: Senha */}
            <div>
              <label htmlFor="register-password" className="block text-base font-bold text-[#1a1a1a] mb-2">
                Senha
              </label>
              <input
                id="register-password"
                type="password"
                autoComplete="new-password"
                value={form.password}
                onChange={(e) => handleChange('password', e.target.value)}
                placeholder="Digite a sua senha"
                className={`w-full border rounded-lg px-4 py-3 text-sm text-[#1a1a1a] placeholder:text-[#9ca3af] focus:outline-none focus:border-[#f97316] focus:ring-1 focus:ring-[#f97316] transition-colors ${
                  fieldErrors.password ? 'border-red-400 focus:border-red-400' : 'border-[#d1d5db]'
                }`}
              />
              {fieldErrors.password && (
                <p className="text-xs text-red-500 mt-1.5">{fieldErrors.password}</p>
              )}
            </div>

            {/* Field 4: Função */}
            <div>
              <label htmlFor="register-role" className="block text-base font-bold text-[#1a1a1a] mb-2">
                Função
              </label>
              <div className="relative">
                <select
                  id="register-role"
                  value={form.role}
                  onChange={(e) => handleChange('role', e.target.value)}
                  className={`w-full appearance-none border rounded-lg px-4 py-3 pr-10 text-sm focus:outline-none focus:border-[#f97316] focus:ring-1 focus:ring-[#f97316] transition-colors bg-white cursor-pointer ${
                    fieldErrors.role ? 'border-red-400 focus:border-red-400' : 'border-[#d1d5db]'
                  } ${form.role ? 'text-[#1a1a1a]' : 'text-[#9ca3af]'}`}
                >
                  <option value="" disabled>
                    Selecione a categoria
                  </option>
                  {ROLE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value} className="text-[#1a1a1a]">
                      {opt.label}
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
              {fieldErrors.role && (
                <p className="text-xs text-red-500 mt-1.5">{fieldErrors.role}</p>
              )}
            </div>

            {/* Field 5: Confirmar Senha */}
            <div>
              <label htmlFor="register-confirm-password" className="block text-base font-bold text-[#1a1a1a] mb-2">
                Confirmar Senha
              </label>
              <input
                id="register-confirm-password"
                type="password"
                autoComplete="new-password"
                value={form.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                placeholder="Digite a senha novamente"
                className={`w-full border rounded-lg px-4 py-3 text-sm text-[#1a1a1a] placeholder:text-[#9ca3af] focus:outline-none focus:border-[#f97316] focus:ring-1 focus:ring-[#f97316] transition-colors ${
                  fieldErrors.confirmPassword ? 'border-red-400 focus:border-red-400' : 'border-[#d1d5db]'
                }`}
              />
              {fieldErrors.confirmPassword && (
                <p className="text-xs text-red-500 mt-1.5">{fieldErrors.confirmPassword}</p>
              )}
            </div>
          </div>

          {/* Submit button at bottom-right matching image 2 */}
          <div className="flex justify-end mt-10 sm:mt-12">
            <button
              id="register-submit-btn"
              type="submit"
              disabled={loading || success}
              className="w-full sm:w-auto bg-[#f97316] hover:bg-[#ea580c] text-white font-bold px-8 py-3 rounded-xl text-sm transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
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
                'Cadastrar Funcionário'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
