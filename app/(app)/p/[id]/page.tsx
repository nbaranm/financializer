import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { formatCurrency, formatPercentage } from '@/lib/utils';
import { calculateKPIs } from '@/lib/projection/calculator';
import type { Projection } from '@/types';
import { ProjectionCharts } from './charts';

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/dashboard" className="text-sm text-blue-600 hover:underline">&larr; Dashboard</Link>
          <h1 className="mt-1 text-2xl font-bold text-zinc-900 dark:text-zinc-50">{projection.name}</h1>
          <p className="text-sm text-zinc-500">{projection.template} &middot; {projection.projection_months} ay</p>
        </div>
        <div className="flex gap-2">
          {(plan === 'pro' || plan === 'studio') && (
            <Link
              href={`/p/${id}/actuals`}
              className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
            >
              Gercek Veriler
            </Link>
          )}
          {(plan === 'pro' || plan === 'studio') && (
            <Link
              href={`/p/${id}/compare`}
              className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
            >
              Karsilastir
            </Link>
          )}
          {plan === 'studio' && (
            <Link
              href={`/p/${id}/report`}
              className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
            >
              Rapor
            </Link>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: 'Toplam Gelir', value: formatCurrency(kpis.totalRevenue, projection.currency), color: 'text-green-600' },
          { label: 'Toplam Gider', value: formatCurrency(kpis.totalExpense, projection.currency), color: 'text-red-600' },
          { label: 'Net Kar/Zarar', value: formatCurrency(kpis.netProfitLoss, projection.currency), color: kpis.netProfitLoss >= 0 ? 'text-green-600' : 'text-red-600' },
          { label: 'Break-Even', value: kpis.breakEvenMonth ? `Ay ${kpis.breakEvenMonth}` : 'N/A', color: 'text-zinc-900 dark:text-zinc-100' },
          { label: 'Ort. Aylik Buyume', value: formatPercentage(kpis.avgMoMGrowth), color: kpis.avgMoMGrowth >= 0 ? 'text-green-600' : 'text-red-600' },
          { label: 'ROI', value: kpis.roi !== null ? `${kpis.roi}%` : 'N/A', color: (kpis.roi ?? 0) >= 0 ? 'text-green-600' : 'text-red-600' },
          { label: 'Peak Burn', value: formatCurrency(kpis.peakBurn, projection.currency), color: 'text-amber-600' },
          { label: 'Saglik Skoru', value: `${kpis.financialHealthScore}/100`, color: kpis.financialHealthScore >= 60 ? 'text-green-600' : 'text-amber-600' },
        ].map((kpi) => (
          <div key={kpi.label} className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-xs text-zinc-500">{kpi.label}</p>
            <p className={`mt-1 text-lg font-semibold ${kpi.color}`}>{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <ProjectionCharts data={projection.projection_data} currency={projection.currency} />

      {/* Monthly Table */}
      <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
              <th className="px-4 py-2 text-left font-medium text-zinc-600 dark:text-zinc-400">Ay</th>
              <th className="px-4 py-2 text-right font-medium text-zinc-600 dark:text-zinc-400">Gelir</th>
              <th className="px-4 py-2 text-right font-medium text-zinc-600 dark:text-zinc-400">Gider</th>
              <th className="px-4 py-2 text-right font-medium text-zinc-600 dark:text-zinc-400">Net</th>
              <th className="px-4 py-2 text-right font-medium text-zinc-600 dark:text-zinc-400">Kumulatif</th>
              <th className="px-4 py-2 text-right font-medium text-zinc-600 dark:text-zinc-400">Runway</th>
            </tr>
          </thead>
          <tbody>
            {projection.projection_data.map((m) => (
              <tr key={m.month} className="border-b border-zinc-100 dark:border-zinc-800">
                <td className="px-4 py-2 text-zinc-900 dark:text-zinc-100">Ay {m.month}</td>
                <td className="px-4 py-2 text-right text-green-600">{formatCurrency(m.revenue, projection.currency)}</td>
                <td className="px-4 py-2 text-right text-red-600">{formatCurrency(m.expense, projection.currency)}</td>
                <td className={`px-4 py-2 text-right font-medium ${m.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(m.net, projection.currency)}
                </td>
                <td className={`px-4 py-2 text-right ${m.cumulative_net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(m.cumulative_net, projection.currency)}
                </td>
                <td className="px-4 py-2 text-right text-zinc-600 dark:text-zinc-400">
                  {m.runway_months === null ? 'Karli' : `${m.runway_months} ay`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
