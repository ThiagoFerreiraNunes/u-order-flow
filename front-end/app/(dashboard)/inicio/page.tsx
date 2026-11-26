'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { getDashboardSummary, getDashboardRevenueChart } from '@/lib/api';
import type {
  DashboardSummaryResponse,
  DashboardRevenueChartResponse,
} from '@/types/dashboard';

const BAR_COLORS = [
  '#ff2e63', // Seg - Pink/Red
  '#f97316', // Ter - Orange
  '#2563eb', // Qua - Blue
  '#ef4444', // Qui - Red
  '#22c55e', // Sex - Green
  '#eab308', // Sáb - Yellow
  '#6366f1', // Dom - Purple
];

const DAY_LABELS: Record<string, string> = {
  SEG: 'Seg',
  TER: 'Ter',
  QUA: 'Qua',
  QUI: 'Qui',
  SEX: 'Sex',
  'SÁB': 'Sáb',
  SAB: 'Sáb',
  DOM: 'Dom',
};

function getTodayIso(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDateBR(isoDate: string): string {
  const parts = isoDate.split('-');
  if (parts.length !== 3) return isoDate;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

function formatShortDateBR(isoDate: string): string {
  const parts = isoDate.split('-');
  if (parts.length !== 3) return isoDate;
  return `${parts[2]}/${parts[1]}`;
}

function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function formatDayLabel(dayOfWeek: string): string {
  const upper = dayOfWeek.trim().toUpperCase();
  return DAY_LABELS[upper] ?? dayOfWeek;
}

function formatRelativeTime(isoDateTime: string): string {
  const date = new Date(isoDateTime);
  if (Number.isNaN(date.getTime())) return '';
  const diffMs = Date.now() - date.getTime();
  if (diffMs < 0) return 'Agora';

  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'Agora';
  if (diffMin < 60) return `${diffMin} min atrás`;

  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours} h atrás`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} d atrás`;
}

function computeNiceMax(maxVal: number): number {
  if (maxVal <= 0) return 1000;
  const magnitude = Math.pow(10, Math.floor(Math.log10(maxVal)));
  const normalized = maxVal / magnitude;
  let niceFactor: number;
  if (normalized <= 1.2) niceFactor = 1.2;
  else if (normalized <= 1.5) niceFactor = 1.5;
  else if (normalized <= 2) niceFactor = 2;
  else if (normalized <= 3) niceFactor = 3;
  else if (normalized <= 5) niceFactor = 5;
  else if (normalized <= 8) niceFactor = 8;
  else niceFactor = 10;
  return Math.ceil(niceFactor * magnitude);
}

function getErrorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === 'object' && 'message' in err && typeof err.message === 'string') {
    return err.message;
  }
  return fallback;
}

export default function InicioPage() {
  const [selectedDate, setSelectedDate] = useState<string>(getTodayIso);
  const [chartDays, setChartDays] = useState<number>(7);
  const [summary, setSummary] = useState<DashboardSummaryResponse | null>(null);
  const [chart, setChart] = useState<DashboardRevenueChartResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);

  const fetchDashboard = useCallback(async (date: string, days: number) => {
    const [summaryData, chartData] = await Promise.all([
      getDashboardSummary(date),
      getDashboardRevenueChart(date, days),
    ]);
    return { summaryData, chartData };
  }, []);

  const handleRetry = useCallback(() => {
    setLoading(true);
    setError('');
    fetchDashboard(selectedDate, chartDays)
      .then(({ summaryData, chartData }) => {
        setSummary(summaryData);
        setChart(chartData);
      })
      .catch((err) => {
        setError(getErrorMessage(err, 'Erro ao carregar os dados do dashboard.'));
      })
      .finally(() => {
        setLoading(false);
      });
  }, [selectedDate, chartDays, fetchDashboard]);

  useEffect(() => {
    let cancelled = false;
    fetchDashboard(selectedDate, chartDays)
      .then(({ summaryData, chartData }) => {
        if (cancelled) return;
        setSummary(summaryData);
        setChart(chartData);
        setError('');
      })
      .catch((err) => {
        if (cancelled) return;
        setError(getErrorMessage(err, 'Erro ao carregar os dados do dashboard.'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedDate, chartDays, fetchDashboard]);

  function handleOpenDatePicker() {
    const input = dateInputRef.current;
    if (!input) return;
    if (typeof input.showPicker === 'function') {
      input.showPicker();
    } else {
      input.focus();
      input.click();
    }
  }

  const points = chart?.points ?? [];
  const rawMaxRevenue = points.reduce((acc, p) => Math.max(acc, p.revenue ?? 0), 0);
  const chartMax = computeNiceMax(rawMaxRevenue);
  const yTicks = [1, 0.8, 0.6, 0.4, 0.2, 0].map((ratio) => chartMax * ratio);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* ── Top Header: Title + Date Picker ───────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-[#1a1a1a]">Início</h1>

        <div className="relative inline-flex self-start sm:self-auto">
          <button
            type="button"
            id="dashboard-date-picker-btn"
            onClick={handleOpenDatePicker}
            className="bg-white rounded-xl shadow-sm border border-[#e5e7eb] px-4 py-2.5 flex items-center gap-3 text-sm font-medium text-[#1a1a1a] hover:bg-[#f9fafb] transition-colors cursor-pointer min-w-[190px] justify-between"
          >
            <span className="flex items-center gap-2.5">
              <svg
                className="w-4 h-4 text-[#4b5563]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path strokeLinecap="round" d="M16 2v4M8 2v4M3 10h18" />
              </svg>
              <span>{formatDateBR(selectedDate)}</span>
            </span>
            <svg
              className="w-4 h-4 text-[#6b7280]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <input
            ref={dateInputRef}
            type="date"
            aria-label="Selecionar data do dashboard"
            value={selectedDate}
            onChange={(e) => {
              if (e.target.value) {
                setLoading(true);
                setError('');
                setSelectedDate(e.target.value);
              }
            }}
            className="sr-only"
          />
        </div>
      </div>

      {/* ── Error Banner ──────────────────────────────────────────────────── */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm flex items-center justify-between gap-4">
          <span>{error}</span>
          <button
            type="button"
            onClick={handleRetry}
            className="text-xs font-semibold underline hover:no-underline shrink-0 cursor-pointer"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {/* ── KPI Cards ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Pedidos */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#e5e7eb]/80 px-6 py-5 flex items-center gap-5">
          <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
            <svg
              className="w-6 h-6 text-[#f59e0b]"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M19 7h-3V6a4 4 0 0 0-8 0v1H5a1 1 0 0 0-1 1v11a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V8a1 1 0 0 0-1-1zm-9-1a2 2 0 0 1 4 0v1h-4V6z" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-[#6b7280]">Pedidos</p>
            {loading ? (
              <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mt-1" />
            ) : (
              <p className="text-2xl font-bold text-[#1a1a1a] mt-0.5">
                {summary?.totalOrders ?? 0}
              </p>
            )}
          </div>
        </div>

        {/* Faturamento */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#e5e7eb]/80 px-6 py-5 flex items-center gap-5">
          <div className="w-11 h-11 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
            <div className="w-7 h-7 rounded-full bg-[#22c55e] flex items-center justify-center text-white text-sm font-bold">
              $
            </div>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-[#6b7280]">Faturamento</p>
            {loading ? (
              <div className="h-8 w-32 bg-gray-200 rounded animate-pulse mt-1" />
            ) : (
              <p className="text-2xl font-bold text-[#1a1a1a] mt-0.5 truncate">
                {formatBRL(summary?.totalRevenue ?? 0)}
              </p>
            )}
          </div>
        </div>

        {/* Ticket Médio */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#e5e7eb]/80 px-6 py-5 flex items-center gap-5">
          <div className="w-11 h-11 rounded-xl bg-yellow-50 flex items-center justify-center shrink-0">
            <svg
              className="w-6 h-6 text-[#eab308]"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M21 10V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v3a2 2 0 0 1 0 4v3a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-3a2 2 0 0 1 0-4zm-9 4.75L9.88 16l.56-2.41L8.57 12l2.46-.21L12 9.5l.97 2.29L15.43 12l-1.87 1.59.56 2.41L12 14.75z" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-[#6b7280]">Ticket Médio</p>
            {loading ? (
              <div className="h-8 w-28 bg-gray-200 rounded animate-pulse mt-1" />
            ) : (
              <p className="text-2xl font-bold text-[#1a1a1a] mt-0.5 truncate">
                {formatBRL(summary?.averageTicket ?? 0)}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Revenue Bar Chart ─────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#e5e7eb]/80 p-6">
        <div className="flex items-center justify-between gap-4 mb-6">
          <h2 className="text-base font-bold text-[#1a1a1a]">Faturamento</h2>

          <select
            id="dashboard-chart-days-select"
            aria-label="Período do gráfico de faturamento"
            value={chartDays}
            onChange={(e) => {
              setLoading(true);
              setError('');
              setChartDays(Number(e.target.value));
            }}
            className="text-xs font-medium text-[#4b5563] bg-white border border-[#e5e7eb] rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#3c3c3c] cursor-pointer"
          >
            <option value={7}>Últimos 7 dias</option>
            <option value={14}>Últimos 14 dias</option>
            <option value={30}>Últimos 30 dias</option>
          </select>
        </div>

        {loading ? (
          <div className="h-64 flex items-end gap-4 px-8 pt-6">
            {Array.from({ length: 7 }).map((_, i) => (
              <div
                key={i}
                className="flex-1 bg-gray-100 rounded-2xl animate-pulse"
                style={{ height: `${35 + ((i * 19) % 55)}%` }}
              />
            ))}
          </div>
        ) : points.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-sm text-[#6b7280]">
            Nenhum dado de faturamento disponível para o período.
          </div>
        ) : (
          <div className="flex gap-3 sm:gap-5">
            {/* Y-axis labels */}
            <div className="flex flex-col justify-between items-end h-60 pb-6 text-[11px] text-[#6b7280] shrink-0 select-none">
              {yTicks.map((tick, idx) => (
                <span key={idx}>
                  {tick === 0
                    ? '0'
                    : tick.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                        maximumFractionDigits: 2,
                      })}
                </span>
              ))}
            </div>

            {/* Bars area */}
            <div className="flex-1 relative min-w-0">
              {/* Subtle horizontal grid lines */}
              <div className="absolute inset-0 bottom-6 flex flex-col justify-between pointer-events-none">
                {yTicks.map((_, idx) => (
                  <div
                    key={idx}
                    className="w-full border-b border-dashed border-[#f3f4f6]"
                  />
                ))}
              </div>

              <div className="relative h-60 flex items-end justify-around gap-1.5 sm:gap-3 pt-2 pb-6">
                {points.map((point, idx) => {
                  const pct = chartMax > 0 ? (point.revenue / chartMax) * 100 : 0;
                  const barHeightPct = point.revenue > 0 ? Math.max(pct, 4) : 0;
                  const color = BAR_COLORS[idx % BAR_COLORS.length];
                  const isHovered = hoveredIndex === idx;
                  const showLabel =
                    points.length <= 14 || idx % 3 === 0 || idx === points.length - 1;

                  return (
                    <div
                      key={point.date}
                      onMouseEnter={() => setHoveredIndex(idx)}
                      onMouseLeave={() => setHoveredIndex(null)}
                      className="flex-1 h-full flex flex-col items-center justify-end relative group max-w-[72px]"
                    >
                      {/* Hover tooltip */}
                      {isHovered && (
                        <div className="absolute -top-9 left-1/2 -translate-x-1/2 bg-[#1a1a1a] text-white text-[11px] font-medium px-2.5 py-1 rounded-lg shadow-md whitespace-nowrap z-20 pointer-events-none">
                          {formatDateBR(point.date)}: {formatBRL(point.revenue)}
                        </div>
                      )}

                      {/* Bar */}
                      <div className="w-full flex-1 flex items-end justify-center">
                        <div
                          className={`w-full transition-all duration-300 ${
                            points.length <= 7
                              ? 'rounded-2xl'
                              : points.length <= 14
                                ? 'rounded-xl'
                                : 'rounded-md'
                          } ${isHovered ? 'opacity-90 scale-[1.03]' : ''}`}
                          style={{
                            height: `${barHeightPct}%`,
                            backgroundColor: color,
                            minHeight: point.revenue > 0 ? '8px' : '2px',
                            opacity: point.revenue > 0 ? undefined : 0.2,
                          }}
                        />
                      </div>

                      {/* X-axis label */}
                      <span className="absolute -bottom-6 text-[11px] text-[#6b7280] font-medium whitespace-nowrap">
                        {points.length <= 7
                          ? formatDayLabel(point.dayOfWeek)
                          : showLabel
                            ? formatShortDateBR(point.date)
                            : ''}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Bottom Row: Avisos e alertas + Produtos mais vendidos ─────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Avisos e alertas */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#e5e7eb]/80 p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-[#1a1a1a]">Avisos e alertas</h2>
            <Link
              href="/pedidos"
              className="text-xs font-semibold text-[#f97316] hover:underline"
            >
              Ver todos
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-11 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : !summary?.recentAlerts?.length ? (
            <div className="flex-1 flex items-center justify-center py-8 text-sm text-[#6b7280]">
              Nenhum aviso recente.
            </div>
          ) : (
            <ul className="divide-y divide-[#f3f4f6]">
              {summary.recentAlerts.map((alert) => (
                <li
                  key={alert.orderId}
                  className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-[#1a1a1a] truncate">
                      {alert.message}
                    </p>
                    <p className="text-xs text-[#6b7280] truncate">
                      {alert.tableNumber !== null && alert.tableName
                        ? alert.tableName
                        : 'Balcão'}
                    </p>
                  </div>
                  <span className="text-xs text-[#4b5563] whitespace-nowrap shrink-0">
                    {formatRelativeTime(alert.deliveredAt)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Produtos mais vendidos */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#e5e7eb]/80 p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-[#1a1a1a]">Produtos mais vendidos</h2>
            <Link
              href="/menu"
              className="text-xs font-semibold text-[#f97316] hover:underline"
            >
              Ver todos
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-9 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : !summary?.topProducts?.length ? (
            <div className="flex-1 flex items-center justify-center py-8 text-sm text-[#6b7280]">
              Nenhuma venda registrada nesta data.
            </div>
          ) : (
            <ul className="divide-y divide-[#f3f4f6]">
              {summary.topProducts.map((product) => (
                <li
                  key={product.productId}
                  className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4"
                >
                  <span className="text-sm text-[#1a1a1a] font-medium truncate">
                    {product.productName}
                  </span>
                  <span className="text-sm font-bold text-[#1a1a1a] whitespace-nowrap shrink-0">
                    {product.quantitySold} {product.quantitySold === 1 ? 'venda' : 'vendas'}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
