'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency } from '@/lib/utils';
import type { Projection, Actual } from '@/types';
import { use } from 'react';

export default function ActualsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const supabase = createClient();
  const [projection, setProjection] = useState<Projection | null>(null);
  const [actuals, setActuals] = useState<Actual[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(1);
  const [form, setForm] = useState({ revenue_total: 0, expense_total: 0, notes: '' });

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

  async function handleSave() {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const existing = actuals.find((a) => a.month_number === selectedMonth);

    if (existing) {
      await supabase
        .from('actuals')
        .update({
          revenue_total: form.revenue_total,
          expense_total: form.expense_total,
          notes: form.notes || null,
          revenue_breakdown: {},
          expense_breakdown: {},
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id);
    } else {
      await supabase.from('actuals').insert({
        projection_id: id,
        user_id: user.id,
        month_number: selectedMonth,
        revenue_total: form.revenue_total,
        expense_total: form.expense_total,
        revenue_breakdown: {},
        expense_breakdown: {},
        notes: form.notes || null,
      });
    }

    const { data: acts } = await supabase
      .from('actuals')
      .select('*')
      .eq('projection_id', id)
      .order('month_number');
    setActuals((acts || []) as Actual[]);
    setSaving(false);
  }

  function selectMonth(month: number) {
    setSelectedMonth(month);
    const existing = actuals.find((a) => a.month_number === month);
    if (existing) {
      setForm({ revenue_total: existing.revenue_total, expense_total: existing.expense_total, notes: existing.notes || '' });
    } else {
      setForm({ revenue_total: 0, expense_total: 0, notes: '' });
    }
  }

  if (loading || !projection) {
    return <div className="py-12 text-center text-zinc-500">Yukleniyor...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <button onClick={() => router.push(`/p/${id}`)} className="text-sm text-blue-600 hover:underline">&larr; Projeksiyona don</button>
        <h1 className="mt-2 text-2xl font-bold text-zinc-900 dark:text-zinc-50">Gercek Veriler</h1>
        <p className="text-sm text-zinc-500">{projection.name}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Month selector */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Ay Sec</h3>
          <div className="grid grid-cols-4 gap-1">
            {Array.from({ length: projection.projection_months }, (_, i) => i + 1).map((month) => {
              const hasActual = actuals.some((a) => a.month_number === month);
              return (
                <button
                  key={month}
                  onClick={() => selectMonth(month)}
                  className={`rounded px-2 py-1.5 text-xs font-medium transition-colors ${
                    selectedMonth === month
                      ? 'bg-blue-600 text-white'
                      : hasActual
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400'
                  }`}
                >
                  {month}
                </button>
              );
            })}
          </div>
        </div>

        {/* Input form */}
        <div className="space-y-4 lg:col-span-2">
          <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="mb-3 text-sm font-medium">Ay {selectedMonth} - Gercek Veriler</h3>
            <div className="mb-2 rounded bg-zinc-50 p-2 text-xs text-zinc-500 dark:bg-zinc-800">
              Projeksiyon: Gelir {formatCurrency(projection.projection_data[selectedMonth - 1]?.revenue || 0)} / Gider {formatCurrency(projection.projection_data[selectedMonth - 1]?.expense || 0)}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Gercek Gelir ($)</label>
                <input
                  type="number"
                  value={form.revenue_total}
                  onChange={(e) => setForm({ ...form, revenue_total: Number(e.target.value) })}
                  className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Gercek Gider ($)</label>
                <input
                  type="number"
                  value={form.expense_total}
                  onChange={(e) => setForm({ ...form, expense_total: Number(e.target.value) })}
                  className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>
            </div>
            <div className="mt-3">
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Notlar</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={2}
                className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              />
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="mt-3 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>

          {/* Actuals table */}
          {actuals.length > 0 && (
            <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
                    <th className="px-3 py-2 text-left">Ay</th>
                    <th className="px-3 py-2 text-right">Gercek Gelir</th>
                    <th className="px-3 py-2 text-right">Proj. Gelir</th>
                    <th className="px-3 py-2 text-right">Gercek Gider</th>
                    <th className="px-3 py-2 text-right">Proj. Gider</th>
                  </tr>
                </thead>
                <tbody>
                  {actuals.map((a) => {
                    const projected = projection.projection_data[a.month_number - 1];
                    return (
                      <tr key={a.id} className="border-b border-zinc-100 dark:border-zinc-800">
                        <td className="px-3 py-2">Ay {a.month_number}</td>
                        <td className="px-3 py-2 text-right text-green-600">{formatCurrency(a.revenue_total)}</td>
                        <td className="px-3 py-2 text-right text-zinc-500">{formatCurrency(projected?.revenue || 0)}</td>
                        <td className="px-3 py-2 text-right text-red-600">{formatCurrency(a.expense_total)}</td>
                        <td className="px-3 py-2 text-right text-zinc-500">{formatCurrency(projected?.expense || 0)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
