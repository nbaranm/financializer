import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { getPlan } from '@/lib/stripe/plans';
import { TEMPLATES } from '@/lib/projection/templates';
import type { Projection } from '@/types';

const TEMPLATE_ICONS: Record<string, string> = {
  indie_game: '🎮',
  mobile_game: '📱',
  saas: '☁️',
  agency: '🏢',
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} dk once`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} saat once`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} gun once`;
  return `${Math.floor(days / 30)} ay once`;
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan, full_name')
    .eq('id', user.id)
    .single();

  const plan = getPlan(profile?.plan || 'free');

  const { data: projections } = await supabase
    .from('projections')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false });

  const items = (projections || []) as Projection[];
  const canCreate = items.length < plan.maxProjections;

  // Summary KPIs
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
            Hosgeldin{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}
          </h1>
          <p className="text-sm text-zinc-500">
            {items.length} / {plan.maxProjections === Infinity ? 'Sinirsiz' : plan.maxProjections} projeksiyon &middot;{' '}
            <span className="rounded bg-blue-100 px-1.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
              {plan.name}
            </span>
          </p>
        </div>
        {canCreate && (
          <Link
            href="/new"
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Yeni Projeksiyon
          </Link>
        )}
      </div>

      {/* Summary Cards */}
      {items.length > 0 && (
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
      )}

      {/* Projections Grid */}
      {items.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-zinc-300 p-16 text-center dark:border-zinc-700">
          <div className="text-4xl">📊</div>
          <h3 className="mt-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">Henuz projeksiyon yok</h3>
          <p className="mt-2 text-sm text-zinc-500">Ilk projeksiyonunuzu olusturarak finansal planlamaya baslayin.</p>
          <Link
            href="/new"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Projeksiyon Olustur
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((p) => {
            const lastMonth = p.projection_data?.[p.projection_data.length - 1];
            const totalRev = p.projection_data.reduce((s, m) => s + m.revenue, 0);
            const totalNet = p.projection_data.reduce((s, m) => s + m.net, 0);
            const breakEven = p.projection_data.findIndex((m) => m.net > 0) + 1;
            const icon = TEMPLATE_ICONS[p.template] || '📊';

            return (
              <Link
                key={p.id}
                href={`/p/${p.id}`}
                className="group rounded-xl border border-zinc-200 bg-white p-5 transition-all hover:border-blue-300 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-blue-700"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{icon}</span>
                    <div>
                      <h3 className="font-semibold text-zinc-900 group-hover:text-blue-600 dark:text-zinc-100">{p.name}</h3>
                      <p className="text-xs text-zinc-500">{p.projection_months} ay &middot; {timeAgo(p.updated_at)}</p>
                    </div>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    p.status === 'active'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800'
                  }`}>
                    {p.status === 'active' ? 'Aktif' : 'Arsiv'}
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
      )}

      {/* Paywall for free users */}
      {!canCreate && plan.id === 'free' && (
        <div className="rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-6 dark:border-amber-800 dark:from-amber-900/20 dark:to-orange-900/20">
          <div className="flex items-start gap-4">
            <span className="text-2xl">🔒</span>
            <div>
              <h3 className="font-semibold text-amber-900 dark:text-amber-100">Plan Limitine Ulastiniz</h3>
              <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">
                Free planda maksimum {plan.maxProjections} projeksiyon olusturabilirsiniz. Daha fazla projeksiyon icin Pro plana yukseltin.
              </p>
              <Link
                href="/settings"
                className="mt-3 inline-block rounded-lg bg-amber-600 px-5 py-2 text-sm font-medium text-white hover:bg-amber-700 transition-colors"
              >
                Pro&apos;ya Yukselt
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
