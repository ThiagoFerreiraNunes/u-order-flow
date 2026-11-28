'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { loginUser } from '@/lib/api';
import { saveUserSession } from '@/lib/auth';
import type { ApiError } from '@/types/user';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await loginUser({ email, password });
      saveUserSession(email);

      // Fetch session to determine role-based landing page
      let landingPage = '/pedidos';
      try {
        const sessionRes = await fetch('/api/session', { cache: 'no-store' });
        if (sessionRes.ok) {
          const session = await sessionRes.json();
          if (session.role === 'ADMIN') {
            landingPage = '/inicio';
          }
        }
      } catch {
        // fallback to /pedidos — middleware will handle the redirect anyway
      }
      router.push(landingPage);
    } catch (err: unknown) {
      if (err && typeof err === 'object') {
        const apiError = err as ApiError;
        if (apiError.status === 401) setError('E-mail ou senha inválidos.');
        else if (apiError.status === 403) setError('Conta inativa. Contate o administrador.');
        else setError('Erro ao realizar login. Tente novamente.');
      } else {
        setError('Erro de conexão. Verifique se o servidor está rodando.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#ebebeb] flex flex-col">
      {/* ── Top bar (matches dashboard header) ── */}
      <header className="h-[52px] bg-[#3c3c3c] flex items-center px-4 sm:px-6 shrink-0">
        <div className="flex items-center gap-2.5">
          {/* Logo icon */}
          <div className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center relative">
            <Image
              src="/logo-uorder.png"
              alt="UOrderFlow Logo"
              width={36}
              height={36}
              className="object-contain"
              priority
            />
          </div>
          <span className="text-white font-bold text-sm tracking-wide">UOrderFlow</span>
        </div>
      </header>

      {/* ── Centered login card ── */}
      <div className="flex flex-1 items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-sm">
          {/* Card */}
          <div className="bg-white rounded-xl shadow-sm border border-[#e5e7eb] px-5 py-7 sm:px-8 sm:py-9 md:px-10 md:py-10">
            {/* Brand */}
            <div className="flex flex-col items-center mb-6 sm:mb-8">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-[#1a1a1a] rounded-2xl flex items-center justify-center p-3 mb-4 shadow-sm relative">
                <Image
                  src="/logo-uorder.png"
                  alt="UOrderFlow Logo"
                  width={72}
                  height={72}
                  className="object-contain"
                  priority
                />
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-[#1a1a1a]">Bem-vindo!</h1>
              <p className="text-xs sm:text-sm text-[#6b7280] mt-1 text-center">Acesse sua conta para continuar</p>
            </div>

            {/* Error banner */}
            {error && (
              <div
                id="login-error-banner"
                className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-5 flex items-start gap-2"
              >
                <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <circle cx="12" cy="12" r="10" strokeWidth="2" />
                  <path strokeWidth="2" strokeLinecap="round" d="M12 8v4M12 16h.01" />
                </svg>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {/* Email */}
              <div>
                <label htmlFor="login-email" className="block text-xs sm:text-sm font-semibold text-[#1a1a1a] mb-1.5">
                  E-mail
                </label>
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemplo@uorderflow.com"
                  required
                  className="w-full border border-[#d1d5db] rounded-lg px-3 py-2.5 text-base sm:text-sm text-[#1a1a1a] placeholder:text-[#9ca3af] focus:outline-none focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/20 transition-colors"
                />
              </div>

              {/* Password */}
              <div>
                <label htmlFor="login-password" className="block text-xs sm:text-sm font-semibold text-[#1a1a1a] mb-1.5">
                  Senha
                </label>
                <div className="relative">
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Digite a senha"
                    required
                    minLength={6}
                    className="w-full border border-[#d1d5db] rounded-lg px-3 py-2.5 pr-10 text-base sm:text-sm text-[#1a1a1a] placeholder:text-[#9ca3af] focus:outline-none focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/20 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#6b7280] transition-colors"
                  >
                    {showPassword ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" strokeWidth={2} strokeLinecap="round" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                id="login-submit-btn"
                type="submit"
                disabled={loading}
                className="w-full bg-[#f97316] hover:bg-[#ea6c0e] text-white font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-2 text-sm cursor-pointer min-h-[44px]"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Entrando...
                  </span>
                ) : (
                  'Entrar'
                )}
              </button>
            </form>
          </div>

          <p className="text-center text-xs text-[#9ca3af] mt-5">
            Sem conta? Solicite acesso ao administrador.
          </p>
        </div>
      </div>
    </div>
  );
}
