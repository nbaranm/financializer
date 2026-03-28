import Link from 'next/link';
import { formatNumber } from '@/lib/utils';
import { getDemoProjections } from '@/lib/demo-data';
import { TEMPLATES } from '@/lib/projection/templates';
import type { Projection } from '@/types';

const TEMPLATE_ICONS: Record<string, string> = {
  indie_game: '🎮',
  mobile_game: '📱',
  saas: '☁️',
  agency: '🏢',
};

export default function DemoDashboardPage() {
  const items = getDemoProjections();

  const totalRevenue = items.reduce(
    (sum, p) => sum + p.projection_data.reduce((s, m) => s + m.revenue, 0), 0
  );
  const totalExpense = items.reduce(
    (sum, p) => sum + p.projection_data.reduce((s, m) => s + m.expense, 0), 0
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            Hosgeldin, Demo Kullanici
          </h1>
          <p className="text-sm text-zinc-500">
            {items.length} projeksiyon &middot;{' '}
            <span className="rounded bg-violet-100 px-1.5 py-0.5 text-xs font-medium text-violet-700 dark:bg-violet-900/30 dark:text-violet-300">
              Demo
            </span>
          </p>
        </div>
        <Link
          href="/demo/new"
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Yeni Projeksiyon
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-xs font-medium text-zinc-500">Toplam Projeksiyon</p>
          <p className="mt-1 text-2xl font-bold text-zinc-900 dark:text-zinc-100">{items.length}</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-xs font-medium text-zinc-500">Toplam Tahmini Gelir</p>
          <p className="mt-1 text-2xl font-bold text-green-600">{formatNumber(totalRevenue)}</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-xs font-medium text-zinc-500">Toplam Tahmini Gider</p>
          <p className="mt-1 text-2xl font-bold text-red-600">{formatNumber(totalExpense)}</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-xs font-medium text-zinc-500">Net Kar/Zarar</p>
          <p className={`mt-1 text-2xl font-bold ${totalRevenue - totalExpense >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatNumber(totalRevenue - totalExpense)}
          </p>
        </div>
      </div>

      {/* Projections Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((p) => {
          const totalRev = p.projection_data.reduce((s, m) => s + m.revenue, 0);
          const totalNet = p.projection_data.reduce((s, m) => s + m.net, 0);
          const breakEven = p.projection_data.findIndex((m) => m.net > 0) + 1;
          const icon = TEMPLATE_ICONS[p.template] || '📊';

          return (
            <Link
              key={p.id}
              href={`/demo/p/${p.id}`}
              className="group rounded-xl border border-zinc-200 bg-white p-5 transition-all hover:border-blue-300 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-blue-700"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{icon}</span>
                  <div>
                    <h3 className="font-semibold text-zinc-900 group-hover:text-blue-600 dark:text-zinc-100">{p.name}</h3>
                    <p className="text-xs text-zinc-500">{p.projection_months} ay</p>
                  </div>
                </div>
                <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                  Aktif
                </span>
              </div>

              {/* Mini KPIs */}
              <div className="mt-4 grid grid-cols-3 gap-3 border-t border-zinc-100 pt-4 dark:border-zinc-800">
                <div>
                  <p className="text-xs text-zinc-400">Gelir</p>
                  <p className="text-sm font-semibold text-green-600">{formatNumber(totalRev)}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-400">Net K/Z</p>
                  <p className={`text-sm font-semibold ${totalNet >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatNumber(totalNet)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-zinc-400">Break-Even</p>
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    {breakEven > 0 ? `Ay ${breakEven}` : '-'}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
