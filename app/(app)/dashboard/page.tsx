import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';
import { getPlan } from '@/lib/stripe/plans';
import type { Projection } from '@/types';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Dashboard</h1>
          <p className="text-sm text-zinc-500">
            {items.length} / {plan.maxProjections === Infinity ? 'Sinirsiz' : plan.maxProjections} projeksiyon
          </p>
        </div>
        {canCreate && (
          <Link
            href="/new"
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            + Yeni Projeksiyon
          </Link>
        )}
      </div>

      {items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-zinc-300 p-12 text-center dark:border-zinc-700">
          <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">Henuz projeksiyon yok</h3>
          <p className="mt-1 text-sm text-zinc-500">Ilk projeksiyonunuzu olusturarak baslayin.</p>
          <Link
            href="/new"
            className="mt-4 inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Projeksiyon Olustur
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((p) => {
            const lastMonth = p.projection_data?.[p.projection_data.length - 1];
            return (
              <Link
                key={p.id}
                href={`/p/${p.id}`}
                className="rounded-lg border border-zinc-200 bg-white p-5 transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-zinc-900 dark:text-zinc-100">{p.name}</h3>
                    <p className="text-xs text-zinc-500">{p.template} &middot; {p.projection_months} ay</p>
                  </div>
                  <span className={`rounded px-2 py-0.5 text-xs font-medium ${
                    p.status === 'active'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800'
                  }`}>
                    {p.status}
                  </span>
                </div>
                {lastMonth && (
                  <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-zinc-500">Toplam Gelir</p>
                      <p className="font-medium text-zinc-900 dark:text-zinc-100">
                        {formatCurrency(p.projection_data.reduce((s, m) => s + m.revenue, 0), p.currency)}
                      </p>
                    </div>
                    <div>
                      <p className="text-zinc-500">Son Ay Net</p>
                      <p className={`font-medium ${lastMonth.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(lastMonth.net, p.currency)}
                      </p>
                    </div>
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}

      {!canCreate && plan.id === 'free' && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
          <p className="text-sm text-amber-800 dark:text-amber-200">
            Free planda maksimum {plan.maxProjections} projeksiyon olusturabilirsiniz.{' '}
            <Link href="/settings" className="font-medium underline">
              Pro&apos;ya yukselt
            </Link>
          </p>
        </div>
      )}
    </div>
  );
}
