'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency, formatPercentage } from '@/lib/utils';
import { calculateKPIs } from '@/lib/projection/calculator';
import type { Projection } from '@/types';
import { use } from 'react';

export default function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const supabase = createClient();
  const [projection, setProjection] = useState<Projection | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }

      const { data: profile } = await supabase
        .from('profiles')
        .select('plan')
        .eq('id', user.id)
        .single();

      if (profile?.plan !== 'studio') { router.push(`/p/${id}`); return; }

      const { data: proj } = await supabase
        .from('projections')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (!proj) { router.push('/dashboard'); return; }
      setProjection(proj as Projection);
      setLoading(false);
    }
    load();
  }, [id, router, supabase]);

  if (loading || !projection) {
    return <div className="py-12 text-center text-zinc-500">Yukleniyor...</div>;
  }

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <button onClick={() => router.push(`/p/${id}`)} className="text-sm text-blue-600 hover:underline">&larr; Projeksiyona don</button>
          <h1 className="mt-2 text-2xl font-bold text-zinc-900 dark:text-zinc-50">Yatirimci Raporu</h1>
          <p className="text-sm text-zinc-500">{projection.name}</p>
        </div>
        <button
          onClick={() => window.print()}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900"
        >
          PDF Yazdir
        </button>
      </div>

      {/* Report content */}
      <div className="space-y-8 rounded-lg border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-900 print:border-0 print:p-0">
        {/* Header */}
        <div className="border-b border-zinc-200 pb-6 dark:border-zinc-800">
          <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">{projection.name}</h2>
          <p className="mt-1 text-zinc-500">Finansal Projeksiyon Raporu &middot; {new Date().toLocaleDateString('tr-TR')}</p>
        </div>

        {/* Executive Summary */}
        <section>
          <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Yonetici Ozeti</h3>
          <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <div className="rounded-lg bg-zinc-50 p-4 dark:bg-zinc-800">
              <p className="text-xs text-zinc-500">Toplam Gelir</p>
              <p className="mt-1 text-xl font-bold text-green-600">{formatCurrency(kpis.totalRevenue)}</p>
            </div>
            <div className="rounded-lg bg-zinc-50 p-4 dark:bg-zinc-800">
              <p className="text-xs text-zinc-500">Net Kar/Zarar</p>
              <p className={`mt-1 text-xl font-bold ${kpis.netProfitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(kpis.netProfitLoss)}
              </p>
            </div>
            <div className="rounded-lg bg-zinc-50 p-4 dark:bg-zinc-800">
              <p className="text-xs text-zinc-500">ROI</p>
              <p className="mt-1 text-xl font-bold text-zinc-900 dark:text-zinc-100">
                {kpis.roi !== null ? `${kpis.roi}%` : 'N/A'}
              </p>
            </div>
            <div className="rounded-lg bg-zinc-50 p-4 dark:bg-zinc-800">
              <p className="text-xs text-zinc-500">Saglik Skoru</p>
              <p className={`mt-1 text-xl font-bold ${kpis.financialHealthScore >= 60 ? 'text-green-600' : 'text-amber-600'}`}>
                {kpis.financialHealthScore}/100
              </p>
            </div>
          </div>
        </section>

        {/* Key Metrics */}
        <section>
          <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Temel Metrikler</h3>
          <div className="mt-4 space-y-3">
            <div className="flex justify-between border-b border-zinc-100 py-2 dark:border-zinc-800">
              <span className="text-zinc-600 dark:text-zinc-400">Baslangic Yatirimi</span>
              <span className="font-medium text-zinc-900 dark:text-zinc-100">{formatCurrency(projection.initial_investment)}</span>
            </div>
            <div className="flex justify-between border-b border-zinc-100 py-2 dark:border-zinc-800">
              <span className="text-zinc-600 dark:text-zinc-400">Aylik Gider (Baslangic)</span>
              <span className="font-medium text-zinc-900 dark:text-zinc-100">{formatCurrency(projection.monthly_burn)}</span>
            </div>
            <div className="flex justify-between border-b border-zinc-100 py-2 dark:border-zinc-800">
              <span className="text-zinc-600 dark:text-zinc-400">Break-Even Noktasi</span>
              <span className="font-medium text-zinc-900 dark:text-zinc-100">{kpis.breakEvenMonth ? `Ay ${kpis.breakEvenMonth}` : 'Henuz ulasilamadi'}</span>
            </div>
            <div className="flex justify-between border-b border-zinc-100 py-2 dark:border-zinc-800">
              <span className="text-zinc-600 dark:text-zinc-400">Ortalama Aylik Buyume</span>
              <span className="font-medium text-zinc-900 dark:text-zinc-100">{formatPercentage(kpis.avgMoMGrowth)}</span>
            </div>
            <div className="flex justify-between border-b border-zinc-100 py-2 dark:border-zinc-800">
              <span className="text-zinc-600 dark:text-zinc-400">Takim Buyuklugu</span>
              <span className="font-medium text-zinc-900 dark:text-zinc-100">{projection.team_size} kisi</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-zinc-600 dark:text-zinc-400">Projeksiyon Suresi</span>
              <span className="font-medium text-zinc-900 dark:text-zinc-100">{projection.projection_months} ay</span>
            </div>
          </div>
        </section>

        {/* Monthly Breakdown */}
        <section>
          <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Aylik Projeksiyon</h3>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-zinc-200 dark:border-zinc-700">
                  <th className="px-3 py-2 text-left">Ay</th>
                  <th className="px-3 py-2 text-right">Gelir</th>
                  <th className="px-3 py-2 text-right">Gider</th>
                  <th className="px-3 py-2 text-right">Net</th>
                  <th className="px-3 py-2 text-right">Kumulatif</th>
                </tr>
              </thead>
              <tbody>
                {projection.projection_data.map((m) => (
                  <tr key={m.month} className="border-b border-zinc-100 dark:border-zinc-800">
                    <td className="px-3 py-1.5">{m.month}</td>
                    <td className="px-3 py-1.5 text-right">{formatCurrency(m.revenue)}</td>
                    <td className="px-3 py-1.5 text-right">{formatCurrency(m.expense)}</td>
                    <td className={`px-3 py-1.5 text-right font-medium ${m.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(m.net)}
                    </td>
                    <td className={`px-3 py-1.5 text-right ${m.cumulative_net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(m.cumulative_net)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="border-t border-zinc-200 pt-4 text-center text-xs text-zinc-400 dark:border-zinc-800">
          StudioCast tarafindan olusturuldu &middot; {new Date().toLocaleDateString('tr-TR')}
        </div>
      </div>
    </div>
  );
}
