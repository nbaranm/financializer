'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { TEMPLATES } from '@/lib/projection/templates';
import { calculateProjection, calculateKPIs } from '@/lib/projection/calculator';
import { formatCurrency, formatNumber } from '@/lib/utils';

type Step = 'template' | 'params' | 'preview';

export default function NewProjectionPage() {
  const router = useRouter();
  const supabase = createClient();
  const [step, setStep] = useState<Step>('template');
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

  // Live preview data
  const previewData = useMemo(() => {
    if (!selectedTemplate) return null;
    const data = calculateProjection({
      template: selectedTemplate,
      ...form,
    });
    const kpis = calculateKPIs(data, { template: selectedTemplate, ...form });
    return { data, kpis };
  }, [selectedTemplate, form]);

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

  async function handleSubmit() {
    setLoading(true);
    setError('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setError('Oturum bulunamadi'); setLoading(false); return; }

      const projectionData = calculateProjection({
        template: selectedTemplate,
        ...form,
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

  const SLIDER_FIELDS: { key: string; label: string; min: number; max: number; step: number; prefix?: string; suffix?: string }[] = [
    { key: 'team_size', label: 'Takim Buyuklugu', min: 1, max: 50, step: 1, suffix: ' kisi' },
    { key: 'monthly_burn', label: 'Aylik Gider', min: 1000, max: 200000, step: 1000, prefix: '$' },
    { key: 'launch_month', label: 'Lansman Ayi', min: 1, max: 24, step: 1, suffix: '. ay' },
    { key: 'expected_revenue', label: 'Beklenen Aylik Gelir', min: 1000, max: 500000, step: 1000, prefix: '$' },
    { key: 'growth_rate', label: 'Buyume Orani', min: -50, max: 100, step: 1, suffix: '%' },
    { key: 'initial_investment', label: 'Baslangic Yatirimi', min: 0, max: 1000000, step: 5000, prefix: '$' },
  ];

  // Step 1: Template Selection
  if (step === 'template') {
    return (
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Steps */}
        <div className="flex items-center justify-center gap-2 text-sm">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">1</span>
          <span className="font-medium text-zinc-900 dark:text-zinc-100">Sablon</span>
          <div className="mx-2 h-px w-8 bg-zinc-300 dark:bg-zinc-700" />
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-200 text-xs text-zinc-500 dark:bg-zinc-800">2</span>
          <span className="text-zinc-400">Parametreler</span>
          <div className="mx-2 h-px w-8 bg-zinc-300 dark:bg-zinc-700" />
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-200 text-xs text-zinc-500 dark:bg-zinc-800">3</span>
          <span className="text-zinc-400">Onizleme</span>
        </div>

        <div className="text-center">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Sablon Secin</h1>
          <p className="mt-1 text-sm text-zinc-500">Isletme tipinize en uygun modeli secin</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              onClick={() => selectTemplate(t.id)}
              className="group rounded-xl border border-zinc-200 bg-white p-6 text-left transition-all hover:border-blue-500 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-blue-500"
            >
              <span className="text-4xl">{t.icon}</span>
              <h3 className="mt-3 text-lg font-semibold text-zinc-900 group-hover:text-blue-600 dark:text-zinc-100">{t.name}</h3>
              <p className="mt-1 text-sm text-zinc-500">{t.description}</p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {t.revenue_streams.map((s) => (
                  <span key={s} className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                    {s}
                  </span>
                ))}
              </div>
              <div className="mt-4 flex items-center gap-4 text-xs text-zinc-400">
                <span>Varsayilan: {t.defaults.team_size} kisi</span>
                <span>${formatNumber(t.defaults.monthly_burn)}/ay</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Step 2: Parameters with Sliders
  if (step === 'params') {
    return (
      <div className="mx-auto max-w-3xl space-y-8">
        {/* Steps */}
        <div className="flex items-center justify-center gap-2 text-sm">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-green-500 text-xs font-bold text-white">&#10003;</span>
          <span className="text-zinc-400">Sablon</span>
          <div className="mx-2 h-px w-8 bg-zinc-300 dark:bg-zinc-700" />
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">2</span>
          <span className="font-medium text-zinc-900 dark:text-zinc-100">Parametreler</span>
          <div className="mx-2 h-px w-8 bg-zinc-300 dark:bg-zinc-700" />
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-200 text-xs text-zinc-500 dark:bg-zinc-800">3</span>
          <span className="text-zinc-400">Onizleme</span>
        </div>

        <div className="text-center">
          <button onClick={() => setStep('template')} className="text-sm text-blue-600 hover:underline">&larr; Sablona don</button>
          <h1 className="mt-2 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            {template?.icon} {template?.name}
          </h1>
          <p className="mt-1 text-sm text-zinc-500">Parametreleri isletmenize gore ayarlayin</p>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Projeksiyon Adi</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              />
            </div>

            {SLIDER_FIELDS.map(({ key, label, min, max, step: fieldStep, prefix, suffix }) => (
              <div key={key}>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{label}</label>
                  <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    {prefix}{form[key as keyof typeof form].toLocaleString()}{suffix}
                  </span>
                </div>
                <input
                  type="range"
                  min={min}
                  max={max}
                  step={fieldStep}
                  value={form[key as keyof typeof form]}
                  onChange={(e) => setForm({ ...form, [key]: Number(e.target.value) })}
                  className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-lg bg-zinc-200 accent-blue-600 dark:bg-zinc-700"
                />
                <div className="mt-1 flex justify-between text-xs text-zinc-400">
                  <span>{prefix}{min.toLocaleString()}{suffix}</span>
                  <span>{prefix}{max.toLocaleString()}{suffix}</span>
                </div>
              </div>
            ))}

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Projeksiyon Suresi</label>
              <div className="mt-2 grid grid-cols-5 gap-2">
                {[6, 12, 24, 36, 60].map((months) => (
                  <button
                    key={months}
                    type="button"
                    onClick={() => setForm({ ...form, projection_months: months })}
                    className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                      form.projection_months === months
                        ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                        : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400'
                    }`}
                  >
                    {months} Ay
                    {months > 12 && <span className="mt-0.5 block text-xs opacity-60">{months > 24 ? 'Studio' : 'Pro+'}</span>}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setStep('template')}
            className="flex-1 rounded-lg border border-zinc-300 px-4 py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300"
          >
            Geri
          </button>
          <button
            onClick={() => setStep('preview')}
            className="flex-1 rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700"
          >
            Onizleme &rarr;
          </button>
        </div>
      </div>
    );
  }

  // Step 3: Preview
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Steps */}
      <div className="flex items-center justify-center gap-2 text-sm">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-green-500 text-xs font-bold text-white">&#10003;</span>
        <span className="text-zinc-400">Sablon</span>
        <div className="mx-2 h-px w-8 bg-zinc-300 dark:bg-zinc-700" />
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-green-500 text-xs font-bold text-white">&#10003;</span>
        <span className="text-zinc-400">Parametreler</span>
        <div className="mx-2 h-px w-8 bg-zinc-300 dark:bg-zinc-700" />
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">3</span>
        <span className="font-medium text-zinc-900 dark:text-zinc-100">Onizleme</span>
      </div>

      <div className="text-center">
        <button onClick={() => setStep('params')} className="text-sm text-blue-600 hover:underline">&larr; Parametrelere don</button>
        <h1 className="mt-2 text-2xl font-bold text-zinc-900 dark:text-zinc-50">Projeksiyon Onizleme</h1>
        <p className="mt-1 text-sm text-zinc-500">{form.name}</p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      {previewData && (
        <>
          {/* Mini KPI Dashboard */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-xs text-zinc-500">Toplam Gelir</p>
              <p className="mt-1 text-xl font-bold text-green-600">{formatCurrency(previewData.kpis.totalRevenue)}</p>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-xs text-zinc-500">Net Kar/Zarar</p>
              <p className={`mt-1 text-xl font-bold ${previewData.kpis.netProfitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(previewData.kpis.netProfitLoss)}
              </p>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-xs text-zinc-500">Break-Even</p>
              <p className="mt-1 text-xl font-bold text-zinc-900 dark:text-zinc-100">
                {previewData.kpis.breakEvenMonth ? `Ay ${previewData.kpis.breakEvenMonth}` : 'N/A'}
              </p>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-xs text-zinc-500">Saglik Skoru</p>
              <p className={`mt-1 text-xl font-bold ${previewData.kpis.financialHealthScore >= 60 ? 'text-green-600' : 'text-amber-600'}`}>
                {previewData.kpis.financialHealthScore}/100
              </p>
            </div>
          </div>

          {/* Preview Table */}
          <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
                  <th className="px-4 py-2.5 text-left font-medium text-zinc-600">Ay</th>
                  <th className="px-4 py-2.5 text-right font-medium text-zinc-600">Gelir</th>
                  <th className="px-4 py-2.5 text-right font-medium text-zinc-600">Gider</th>
                  <th className="px-4 py-2.5 text-right font-medium text-zinc-600">Net</th>
                  <th className="px-4 py-2.5 text-right font-medium text-zinc-600">Kumulatif</th>
                </tr>
              </thead>
              <tbody>
                {previewData.data.slice(0, 6).map((m) => (
                  <tr key={m.month} className="border-b border-zinc-100 dark:border-zinc-800">
                    <td className="px-4 py-2 text-zinc-900 dark:text-zinc-100">Ay {m.month}</td>
                    <td className="px-4 py-2 text-right text-green-600">{formatCurrency(m.revenue)}</td>
                    <td className="px-4 py-2 text-right text-red-600">{formatCurrency(m.expense)}</td>
                    <td className={`px-4 py-2 text-right font-medium ${m.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(m.net)}
                    </td>
                    <td className={`px-4 py-2 text-right ${m.cumulative_net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(m.cumulative_net)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {previewData.data.length > 6 && (
              <div className="border-t border-zinc-100 bg-zinc-50 px-4 py-2 text-center text-xs text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900">
                +{previewData.data.length - 6} ay daha &mdash; kaydettikten sonra tam gorunumu gorun
              </div>
            )}
          </div>
        </>
      )}

      <div className="flex gap-3">
        <button
          onClick={() => setStep('params')}
          className="flex-1 rounded-lg border border-zinc-300 px-4 py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300"
        >
          Geri
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="flex-1 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Kaydediliyor...' : 'Projeksiyonu Kaydet'}
        </button>
      </div>
    </div>
  );
}
