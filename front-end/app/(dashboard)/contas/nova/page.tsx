'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { registerUser } from '@/lib/api';
import { USER_ROLE_LABELS } from '@/types/user';
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
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
    if (!form.role) errs.role = 'Selecione um cargo.';
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
      setTimeout(() => router.push('/contas'), 1500);
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
          // Validation errors from backend: { fieldName: "message" }
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
    <div>
      {/* Page header with back arrow */}
      <div className="flex items-center gap-2 mb-6">
        <Link
          href="/contas"
          className="text-[#6b7280] hover:text-[#1a1a1a] transition-colors"
          aria-label="Voltar para contas"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <line x1="19" y1="12" x2="5" y2="12" strokeLinecap="round" />
            <polyline points="12 19 5 12 12 5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
        <h1 className="text-2xl font-bold text-[#1a1a1a]">Nova Conta</h1>
      </div>

      {/* White card */}
      <div className="bg-white rounded-xl shadow-sm border border-[#e5e7eb] px-8 py-8 max-w-3xl">
        {/* Card title */}
        <h2 className="text-xl font-semibold text-[#1a1a1a] text-center mb-8">
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
          {/* Row 1: Nome Completo | Email */}
          <div className="grid grid-cols-2 gap-6 mb-5">
            <div>
              <label htmlFor="register-name" className="block text-sm font-semibold text-[#1a1a1a] mb-1.5">
                Nome Completo
              </label>
              <input
                id="register-name"
                type="text"
                autoComplete="name"
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Digite o nome completo"
                className={`w-full border rounded-lg px-3 py-2.5 text-sm text-[#1a1a1a] placeholder:text-[#9ca3af] focus:outline-none focus:ring-2 transition-colors ${
                  fieldErrors.name
                    ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
                    : 'border-[#d1d5db] focus:border-[#f97316] focus:ring-[#f97316]/20'
                }`}
              />
              {fieldErrors.name && (
                <p className="text-xs text-red-500 mt-1">{fieldErrors.name}</p>
              )}
            </div>

            <div>
              <label htmlFor="register-email" className="block text-sm font-semibold text-[#1a1a1a] mb-1.5">
                Email
              </label>
              <input
                id="register-email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="exemplo@uorderflow.com"
                className={`w-full border rounded-lg px-3 py-2.5 text-sm text-[#1a1a1a] placeholder:text-[#9ca3af] focus:outline-none focus:ring-2 transition-colors ${
                  fieldErrors.email
                    ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
                    : 'border-[#d1d5db] focus:border-[#f97316] focus:ring-[#f97316]/20'
                }`}
              />
              {fieldErrors.email && (
                <p className="text-xs text-red-500 mt-1">{fieldErrors.email}</p>
              )}
            </div>
          </div>

          {/* Row 2: Senha | Função */}
          <div className="grid grid-cols-2 gap-6 mb-5">
            <div>
              <label htmlFor="register-password" className="block text-sm font-semibold text-[#1a1a1a] mb-1.5">
                Senha
              </label>
              <div className="relative">
                <input
                  id="register-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={form.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  placeholder="Digite a senha"
                  className={`w-full border rounded-lg px-3 py-2.5 pr-10 text-sm text-[#1a1a1a] placeholder:text-[#9ca3af] focus:outline-none focus:ring-2 transition-colors ${
                    fieldErrors.password
                      ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
                      : 'border-[#d1d5db] focus:border-[#f97316] focus:ring-[#f97316]/20'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#6b7280]"
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" strokeLinecap="round" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-xs text-red-500 mt-1">{fieldErrors.password}</p>
              )}
            </div>

            <div>
              <label htmlFor="register-role" className="block text-sm font-semibold text-[#1a1a1a] mb-1.5">
                Função
              </label>
              <div className="relative">
                <select
                  id="register-role"
                  value={form.role}
                  onChange={(e) => handleChange('role', e.target.value)}
                  className={`w-full appearance-none border rounded-lg px-3 py-2.5 pr-8 text-sm focus:outline-none focus:ring-2 transition-colors bg-white cursor-pointer ${
                    fieldErrors.role
                      ? 'border-red-400 focus:border-red-400 focus:ring-red-100 text-[#1a1a1a]'
                      : 'border-[#d1d5db] focus:border-[#f97316] focus:ring-[#f97316]/20'
                  } ${form.role ? 'text-[#1a1a1a]' : 'text-[#9ca3af]'}`}
                >
                  <option value="" disabled>
                    Selecione o cargo
                  </option>
                  {ROLE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <svg
                  className="w-4 h-4 text-[#9ca3af] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
              {fieldErrors.role && (
                <p className="text-xs text-red-500 mt-1">{fieldErrors.role}</p>
              )}
            </div>
          </div>

          {/* Row 3: Confirmar Senha */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div>
              <label htmlFor="register-confirm-password" className="block text-sm font-semibold text-[#1a1a1a] mb-1.5">
                Confirmar Senha
              </label>
              <div className="relative">
                <input
                  id="register-confirm-password"
                  type={showConfirm ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={form.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  placeholder="Digite novamente a senha"
                  className={`w-full border rounded-lg px-3 py-2.5 pr-10 text-sm text-[#1a1a1a] placeholder:text-[#9ca3af] focus:outline-none focus:ring-2 transition-colors ${
                    fieldErrors.confirmPassword
                      ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
                      : 'border-[#d1d5db] focus:border-[#f97316] focus:ring-[#f97316]/20'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#6b7280]"
                  aria-label={showConfirm ? 'Ocultar confirmação' : 'Mostrar confirmação'}
                >
                  {showConfirm ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" strokeLinecap="round" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
              {fieldErrors.confirmPassword && (
                <p className="text-xs text-red-500 mt-1">{fieldErrors.confirmPassword}</p>
              )}
            </div>

            {/* Submit button aligned to right column */}
            <div className="flex items-end justify-end">
              <button
                id="register-submit-btn"
                type="submit"
                disabled={loading || success}
                className="bg-[#f97316] hover:bg-[#ea6c0e] text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Cadastrando...
                  </>
                ) : (
                  'Cadastrar Funcionário'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
