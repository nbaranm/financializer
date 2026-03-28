import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { formatCurrency, formatPercentage } from '@/lib/utils';
import { calculateKPIs } from '@/lib/projection/calculator';
import type { Projection } from '@/types';
import { ProjectionCharts } from './charts';

const TEMPLATE_ICONS: Record<string, string> = {
  indie_game: '🎮',
  mobile_game: '📱',
  saas: '☁️',
  agency: '🏢',
};

export default async function ProjectionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', user.id)
    .single();

  const { data } = await supabase
    .from('projections')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (!data) notFound();

  const projection = data as Projection;
  const kpis = calculateKPIs(projection.projection_data, {
    template: projection.template,
    team_size: projection.team_size,
    monthly_burn: projection.monthly_burn,
    launch_month: projection.launch_month,
    expected_revenue: projection.expected_revenue,
    growth_rate: projection.growth_rate,
    initial_investment: projection.initial_investment,
    projection_months: projection.projection_months,
  });

  const plan = profile?.plan || 'free';
  const icon = TEMPLATE_ICONS[projection.template] || '📊';

  // Critical milestones
  const breakEvenMonth = projection.projection_data.findIndex((m) => m.net > 0) + 1;
  const milestones = [
    { month: 1, label: 'Baslangic', color: 'bg-blue-500' },
    ...(projection.launch_month <= projection.projection_months
      ? [{ month: projection.launch_month, label: 'Lansman', color: 'bg-violet-500' }]
      : []),
    ...(breakEvenMonth > 0
      ? [{ month: breakEvenMonth, label: 'Break-Even', color: 'bg-green-500' }]
      : []),
    ...(projection.projection_months >= 12
      ? [{ month: 12, label: '1. Yil', color: 'bg-amber-500' }]
      : []),
    ...(projection.projection_months >= 24
      ? [{ month: 24, label: '2. Yil', color: 'bg-amber-500' }]
      : []),
  ].sort((a, b) => a.month - b.month);

  return (
    <div className="space-y-6">
      {/* Header with action buttons */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link href="/dashboard" className="text-sm text-blue-600 hover:underline">&larr; Dashboard</Link>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-2xl">{icon}</span>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{projection.name}</h1>
          </div>
          <p className="mt-0.5 text-sm text-zinc-500">{projection.template} &middot; {projection.projection_months} ay &middot; {projection.currency}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {(plan === 'pro' || plan === 'studio') && (
            <a
              href={`/api/export/excel?id=${id}`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 px-3.5 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              Excel
            </a>
          )}
          {(plan === 'pro' || plan === 'studio') && (
            <Link
              href={`/p/${id}/actuals`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-green-300 bg-green-50 px-3.5 py-2 text-sm font-medium text-green-700 hover:bg-green-100 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
              Gercek Veri Gir
            </Link>
          )}
          {(plan === 'pro' || plan === 'studio') && (
            <Link
              href={`/p/${id}/compare`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 px-3.5 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              Karsilastir
            </Link>
          )}
          {plan === 'studio' && (
            <Link
              href={`/p/${id}/report`}
              className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3.5 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              Yatirimci Raporu
            </Link>
          )}
          {plan === 'free' && (
            <Link
              href="/settings"
              className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-3.5 py-2 text-sm font-medium text-amber-700 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-300"
            >
              🔒 Pro Ozellikleri Ac
            </Link>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: 'Toplam Gelir', value: formatCurrency(kpis.totalRevenue, projection.currency), color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
          { label: 'Toplam Gider', value: formatCurrency(kpis.totalExpense, projection.currency), color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20' },
          { label: 'Net Kar/Zarar', value: formatCurrency(kpis.netProfitLoss, projection.currency), color: kpis.netProfitLoss >= 0 ? 'text-green-600' : 'text-red-600', bg: kpis.netProfitLoss >= 0 ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20' },
          { label: 'Break-Even', value: kpis.breakEvenMonth ? `Ay ${kpis.breakEvenMonth}` : 'N/A', color: 'text-zinc-900 dark:text-zinc-100', bg: 'bg-zinc-50 dark:bg-zinc-800' },
          { label: 'Ort. Aylik Buyume', value: formatPercentage(kpis.avgMoMGrowth), color: kpis.avgMoMGrowth >= 0 ? 'text-green-600' : 'text-red-600', bg: 'bg-zinc-50 dark:bg-zinc-800' },
          { label: 'ROI', value: kpis.roi !== null ? `${kpis.roi}%` : 'N/A', color: (kpis.roi ?? 0) >= 0 ? 'text-green-600' : 'text-red-600', bg: 'bg-zinc-50 dark:bg-zinc-800' },
          { label: 'Peak Burn', value: formatCurrency(kpis.peakBurn, projection.currency), color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
          { label: 'Saglik Skoru', value: `${kpis.financialHealthScore}/100`, color: kpis.financialHealthScore >= 60 ? 'text-green-600' : 'text-amber-600', bg: kpis.financialHealthScore >= 60 ? 'bg-green-50 dark:bg-green-900/20' : 'bg-amber-50 dark:bg-amber-900/20' },
        ].map((kpi) => (
          <div key={kpi.label} className={`rounded-xl border border-zinc-200 p-4 dark:border-zinc-800 ${kpi.bg}`}>
            <p className="text-xs font-medium text-zinc-500">{kpi.label}</p>
            <p className={`mt-1 text-xl font-bold ${kpi.color}`}>{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Critical Milestones Timeline */}
      <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <h3 className="mb-4 text-sm font-semibold text-zinc-700 dark:text-zinc-300">Kritik Noktalar</h3>
        <div className="relative">
          <div className="absolute left-0 right-0 top-1/2 h-0.5 -translate-y-1/2 bg-zinc-200 dark:bg-zinc-700" />
          <div className="relative flex justify-between">
            {milestones.map((m, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className={`relative z-10 h-4 w-4 rounded-full ${m.color} ring-4 ring-white dark:ring-zinc-900`} />
                <div className="mt-2 text-center">
                  <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">{m.label}</p>
                  <p className="text-xs text-zinc-500">Ay {m.month}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts */}
      <ProjectionCharts data={projection.projection_data} currency={projection.currency} />

      {/* Monthly Detail Table */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800">
        <div className="border-b border-zinc-200 bg-zinc-50 px-5 py-3 dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Aylik Detay Tablosu</h3>
        </div>
        <div className="max-h-[500px] overflow-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-white dark:bg-zinc-900">
              <tr className="border-b border-zinc-200 dark:border-zinc-800">
                <th className="px-4 py-2.5 text-left font-medium text-zinc-600 dark:text-zinc-400">Ay</th>
                <th className="px-4 py-2.5 text-right font-medium text-zinc-600 dark:text-zinc-400">Gelir</th>
                <th className="px-4 py-2.5 text-right font-medium text-zinc-600 dark:text-zinc-400">Gider</th>
                <th className="px-4 py-2.5 text-right font-medium text-zinc-600 dark:text-zinc-400">Net</th>
                <th className="px-4 py-2.5 text-right font-medium text-zinc-600 dark:text-zinc-400">Kumulatif</th>
                <th className="px-4 py-2.5 text-right font-medium text-zinc-600 dark:text-zinc-400">Runway</th>
              </tr>
            </thead>
            <tbody>
              {projection.projection_data.map((m) => {
                const isBreakEven = breakEvenMonth === m.month;
                const isLaunch = projection.launch_month === m.month;
                return (
                  <tr
                    key={m.month}
                    className={`border-b border-zinc-100 dark:border-zinc-800 ${
                      isBreakEven ? 'bg-green-50/50 dark:bg-green-900/10' :
                      isLaunch ? 'bg-violet-50/50 dark:bg-violet-900/10' : ''
                    }`}
                  >
                    <td className="px-4 py-2 text-zinc-900 dark:text-zinc-100">
                      Ay {m.month}
                      {isBreakEven && <span className="ml-1 text-xs text-green-600">&#9679; BE</span>}
                      {isLaunch && <span className="ml-1 text-xs text-violet-600">&#9679; Lansman</span>}
                    </td>
                    <td className="px-4 py-2 text-right text-green-600">{formatCurrency(m.revenue, projection.currency)}</td>
                    <td className="px-4 py-2 text-right text-red-600">{formatCurrency(m.expense, projection.currency)}</td>
                    <td className={`px-4 py-2 text-right font-medium ${m.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(m.net, projection.currency)}
                    </td>
                    <td className={`px-4 py-2 text-right ${m.cumulative_net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(m.cumulative_net, projection.currency)}
                    </td>
                    <td className="px-4 py-2 text-right text-zinc-600 dark:text-zinc-400">
                      {m.runway_months === null ? <span className="text-green-600">Karli</span> : `${m.runway_months} ay`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
