'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { TEMPLATES } from '@/lib/projection/templates';
import { calculateProjection } from '@/lib/projection/calculator';

export default function NewProjectionPage() {
  const router = useRouter();
  const supabase = createClient();
  const [step, setStep] = useState<'template' | 'params'>('template');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const template = TEMPLATES.find((t) => t.id === selectedTemplate);

  const [form, setForm] = useState({
    name: '',
    team_size: 5,
    monthly_burn: 12000,
    launch_month: 6,
    expected_revenue: 20000,
    growth_rate: 15,
    initial_investment: 50000,
    projection_months: 12,
  });

  function selectTemplate(id: string) {
    const t = TEMPLATES.find((tpl) => tpl.id === id);
    if (!t) return;
    setSelectedTemplate(id);
    setForm((prev) => ({
      ...prev,
      name: `${t.name} - ${new Date().toLocaleDateString('tr-TR')}`,
      ...t.defaults,
    }));
    setStep('params');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setError('Oturum bulunamadi'); setLoading(false); return; }

      const projectionData = calculateProjection({
        template: selectedTemplate,
        team_size: form.team_size,
        monthly_burn: form.monthly_burn,
        launch_month: form.launch_month,
        expected_revenue: form.expected_revenue,
        growth_rate: form.growth_rate,
        initial_investment: form.initial_investment,
        projection_months: form.projection_months,
      });

      const { data, error: dbError } = await supabase
        .from('projections')
        .insert({
          user_id: user.id,
          name: form.name,
          template: selectedTemplate,
          team_size: form.team_size,
          monthly_burn: form.monthly_burn,
          launch_month: form.launch_month,
          expected_revenue: form.expected_revenue,
          growth_rate: form.growth_rate,
          initial_investment: form.initial_investment,
          projection_data: projectionData,
          projection_months: form.projection_months,
          custom_params: {},
          currency: 'USD',
          status: 'active',
        })
        .select('id')
        .single();

      if (dbError) throw dbError;
      router.push(`/p/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata olustu');
      setLoading(false);
    }
  }

  if (step === 'template') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Yeni Projeksiyon</h1>
          <p className="text-sm text-zinc-500">Bir sablon secin</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              onClick={() => selectTemplate(t.id)}
              className="rounded-lg border border-zinc-200 bg-white p-6 text-left transition-all hover:border-blue-500 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-blue-500"
            >
              <span className="text-3xl">{t.icon}</span>
              <h3 className="mt-3 font-medium text-zinc-900 dark:text-zinc-100">{t.name}</h3>
              <p className="mt-1 text-sm text-zinc-500">{t.description}</p>
              <div className="mt-3 flex flex-wrap gap-1">
                {t.revenue_streams.map((s) => (
                  <span key={s} className="rounded bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                    {s}
                  </span>
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <button onClick={() => setStep('template')} className="text-sm text-blue-600 hover:underline">
          &larr; Sablona don
        </button>
        <h1 className="mt-2 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          {template?.icon} {template?.name}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Projeksiyon Adi</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {[
            { key: 'team_size', label: 'Takim Buyuklugu', type: 'number' },
            { key: 'monthly_burn', label: 'Aylik Gider ($)', type: 'number' },
            { key: 'launch_month', label: 'Lansman Ayi', type: 'number' },
            { key: 'expected_revenue', label: 'Beklenen Gelir ($)', type: 'number' },
            { key: 'growth_rate', label: 'Buyume Orani (%)', type: 'number' },
            { key: 'initial_investment', label: 'Baslangic Yatirimi ($)', type: 'number' },
          ].map(({ key, label, type }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">{label}</label>
              <input
                type={type}
                value={form[key as keyof typeof form]}
                onChange={(e) => setForm({ ...form, [key]: Number(e.target.value) })}
                className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              />
            </div>
          ))}
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Projeksiyon Suresi</label>
          <select
            value={form.projection_months}
            onChange={(e) => setForm({ ...form, projection_months: Number(e.target.value) })}
            className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          >
            <option value={6}>6 Ay</option>
            <option value={12}>12 Ay</option>
            <option value={24}>24 Ay (Pro+)</option>
            <option value={36}>36 Ay (Studio)</option>
            <option value={60}>60 Ay (Studio)</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Olusturuluyor...' : 'Projeksiyon Olustur'}
        </button>
      </form>
    </div>
  );
}
