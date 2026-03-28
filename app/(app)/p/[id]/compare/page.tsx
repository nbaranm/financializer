'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency } from '@/lib/utils';
import type { Projection, Actual } from '@/types';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import { use } from 'react';

export default function ComparePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const supabase = createClient();
  const [projection, setProjection] = useState<Projection | null>(null);
  const [actuals, setActuals] = useState<Actual[]>([]);
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

      if (!profile || profile.plan === 'free') { router.push(`/p/${id}`); return; }

      const { data: proj } = await supabase
        .from('projections')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (!proj) { router.push('/dashboard'); return; }
      setProjection(proj as Projection);

      const { data: acts } = await supabase
        .from('actuals')
        .select('*')
        .eq('projection_id', id)
        .order('month_number');

      setActuals((acts || []) as Actual[]);
      setLoading(false);
    }
    load();
  }, [id, router, supabase]);

  if (loading || !projection) {
    return <div className="py-12 text-center text-zinc-500">Yukleniyor...</div>;
  }

  if (actuals.length === 0) {
    return (
      <div className="space-y-4">
        <button onClick={() => router.push(`/p/${id}`)} className="text-sm text-blue-600 hover:underline">&larr; Projeksiyona don</button>
        <div className="rounded-lg border border-dashed border-zinc-300 p-12 text-center dark:border-zinc-700">
          <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">Henuz gercek veri yok</h3>
          <p className="mt-1 text-sm text-zinc-500">Karsilastirma icin once gercek verileri girin.</p>
          <button
            onClick={() => router.push(`/p/${id}/actuals`)}
            className="mt-4 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Gercek Veri Gir
          </button>
        </div>
      </div>
    );
  }

  const comparisonData = actuals.map((a) => {
    const projected = projection.projection_data[a.month_number - 1];
    return {
      name: `Ay ${a.month_number}`,
      'Proj. Gelir': projected?.revenue || 0,
      'Gercek Gelir': a.revenue_total,
      'Proj. Gider': projected?.expense || 0,
      'Gercek Gider': a.expense_total,
    };
  });

  const totalProjectedRev = actuals.reduce((s, a) => s + (projection.projection_data[a.month_number - 1]?.revenue || 0), 0);
  const totalActualRev = actuals.reduce((s, a) => s + a.revenue_total, 0);
  const totalProjectedExp = actuals.reduce((s, a) => s + (projection.projection_data[a.month_number - 1]?.expense || 0), 0);
  const totalActualExp = actuals.reduce((s, a) => s + a.expense_total, 0);

  const revVariance = totalProjectedRev > 0 ? ((totalActualRev - totalProjectedRev) / totalProjectedRev) * 100 : 0;
  const expVariance = totalProjectedExp > 0 ? ((totalActualExp - totalProjectedExp) / totalProjectedExp) * 100 : 0;

  return (
    <div className="space-y-6">
      <div>
        <button onClick={() => router.push(`/p/${id}`)} className="text-sm text-blue-600 hover:underline">&larr; Projeksiyona don</button>
        <h1 className="mt-2 text-2xl font-bold text-zinc-900 dark:text-zinc-50">Projeksiyon vs Gerceklesen</h1>
        <p className="text-sm text-zinc-500">{projection.name} &middot; {actuals.length} ay veri</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-xs text-zinc-500">Proj. Gelir</p>
          <p className="mt-1 text-lg font-semibold text-zinc-900 dark:text-zinc-100">{formatCurrency(totalProjectedRev)}</p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-xs text-zinc-500">Gercek Gelir</p>
          <p className={`mt-1 text-lg font-semibold ${totalActualRev >= totalProjectedRev ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(totalActualRev)}
          </p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-xs text-zinc-500">Gelir Sapma</p>
          <p className={`mt-1 text-lg font-semibold ${revVariance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {revVariance >= 0 ? '+' : ''}{revVariance.toFixed(1)}%
          </p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-xs text-zinc-500">Gider Sapma</p>
          <p className={`mt-1 text-lg font-semibold ${expVariance <= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {expVariance >= 0 ? '+' : ''}{expVariance.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Comparison Chart */}
      <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <h3 className="mb-4 text-sm font-medium text-zinc-700 dark:text-zinc-300">Gelir Karsilastirma</h3>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={comparisonData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => formatCurrency(v)} />
            <Tooltip // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={(value: any) => formatCurrency(Number(value))} />
            <Legend />
            <Bar dataKey="Proj. Gelir" fill="#93c5fd" radius={[2, 2, 0, 0]} />
            <Bar dataKey="Gercek Gelir" fill="#22c55e" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Expense comparison */}
      <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <h3 className="mb-4 text-sm font-medium text-zinc-700 dark:text-zinc-300">Gider Karsilastirma</h3>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={comparisonData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => formatCurrency(v)} />
            <Tooltip // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={(value: any) => formatCurrency(Number(value))} />
            <Legend />
            <Bar dataKey="Proj. Gider" fill="#fca5a5" radius={[2, 2, 0, 0]} />
            <Bar dataKey="Gercek Gider" fill="#ef4444" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Color-coded deviation table */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800">
        <div className="border-b border-zinc-200 bg-zinc-50 px-5 py-3 dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Sapma Analizi</h3>
          <p className="text-xs text-zinc-500">Yesil = hedefin ustunde, Kirmizi = altinda</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800">
                <th className="px-4 py-2.5 text-left font-medium text-zinc-600">Ay</th>
                <th className="px-4 py-2.5 text-right font-medium text-zinc-600">Proj. Gelir</th>
                <th className="px-4 py-2.5 text-right font-medium text-zinc-600">Gercek Gelir</th>
                <th className="px-4 py-2.5 text-right font-medium text-zinc-600">Gelir %</th>
                <th className="px-4 py-2.5 text-right font-medium text-zinc-600">Proj. Gider</th>
                <th className="px-4 py-2.5 text-right font-medium text-zinc-600">Gercek Gider</th>
                <th className="px-4 py-2.5 text-right font-medium text-zinc-600">Gider %</th>
              </tr>
            </thead>
            <tbody>
              {actuals.map((a) => {
                const projected = projection.projection_data[a.month_number - 1];
                const projRev = projected?.revenue || 0;
                const projExp = projected?.expense || 0;
                const revDiff = projRev > 0 ? ((a.revenue_total - projRev) / projRev) * 100 : 0;
                const expDiff = projExp > 0 ? ((a.expense_total - projExp) / projExp) * 100 : 0;
                const revPositive = revDiff >= 0;
                const expPositive = expDiff <= 0; // less expense is good

                return (
                  <tr key={a.id} className="border-b border-zinc-100 dark:border-zinc-800">
                    <td className="px-4 py-2 font-medium text-zinc-900 dark:text-zinc-100">Ay {a.month_number}</td>
                    <td className="px-4 py-2 text-right text-zinc-500">{formatCurrency(projRev)}</td>
                    <td className="px-4 py-2 text-right text-zinc-900 dark:text-zinc-100">{formatCurrency(a.revenue_total)}</td>
                    <td className={`px-4 py-2 text-right font-semibold ${revPositive ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'}`}>
                      {revDiff >= 0 ? '+' : ''}{revDiff.toFixed(1)}%
                    </td>
                    <td className="px-4 py-2 text-right text-zinc-500">{formatCurrency(projExp)}</td>
                    <td className="px-4 py-2 text-right text-zinc-900 dark:text-zinc-100">{formatCurrency(a.expense_total)}</td>
                    <td className={`px-4 py-2 text-right font-semibold ${expPositive ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'}`}>
                      {expDiff >= 0 ? '+' : ''}{expDiff.toFixed(1)}%
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
