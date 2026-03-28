'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { PLANS } from '@/lib/stripe/plans';
import type { Profile } from '@/types';

export default function SettingsPage() {
  const router = useRouter();
  const supabase = createClient();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [upgrading, setUpgrading] = useState<string | null>(null);
  const [form, setForm] = useState({ full_name: '', company_name: '' });

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (data) {
        setProfile(data as Profile);
        setForm({ full_name: data.full_name || '', company_name: data.company_name || '' });
      }
      setLoading(false);
    }
    load();
  }, [router, supabase]);

  async function handleSave() {
    if (!profile) return;
    setSaving(true);
    await supabase
      .from('profiles')
      .update({
        full_name: form.full_name,
        company_name: form.company_name,
        updated_at: new Date().toISOString(),
      })
      .eq('id', profile.id);
    setSaving(false);
  }

  async function handleUpgrade(planId: string) {
    setUpgrading(planId);
    try {
      const priceEnv = planId === 'pro' ? 'STRIPE_PRO_PRICE_ID' : 'STRIPE_STUDIO_PRICE_ID';
      // We use the plan ID to determine the price on the server side
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: planId === 'pro'
            ? process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID
            : process.env.NEXT_PUBLIC_STRIPE_STUDIO_PRICE_ID,
        }),
      });
      const { url, error } = await res.json();
      if (url) window.location.href = url;
      else if (error) alert(error);
    } catch {
      alert('Bir hata olustu');
    }
    setUpgrading(null);
  }

  async function handleManageBilling() {
    const res = await fetch('/api/stripe/portal', { method: 'POST' });
    const { url } = await res.json();
    if (url) window.location.href = url;
  }

  if (loading) {
    return <div className="py-12 text-center text-zinc-500">Yukleniyor...</div>;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Ayarlar</h1>

      {/* Profile */}
      <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Profil</h2>
        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Ad Soyad</label>
            <input
              type="text"
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Sirket Adi</label>
            <input
              type="text"
              value={form.company_name}
              onChange={(e) => setForm({ ...form, company_name: e.target.value })}
              className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Email</label>
            <p className="mt-1 text-sm text-zinc-500">{profile?.email}</p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </div>
      </div>

      {/* Subscription */}
      <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Abonelik</h2>
          {profile?.stripe_subscription_id && (
            <button
              onClick={handleManageBilling}
              className="text-sm text-blue-600 hover:underline"
            >
              Faturalandirmayi Yonet
            </button>
          )}
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {PLANS.map((plan) => {
            const isCurrent = profile?.plan === plan.id;
            return (
              <div
                key={plan.id}
                className={`rounded-lg border p-4 ${
                  isCurrent
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-zinc-200 dark:border-zinc-700'
                }`}
              >
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">{plan.name}</h3>
                <p className="mt-1 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                  ${plan.price}<span className="text-sm font-normal text-zinc-500">/ay</span>
                </p>
                <ul className="mt-3 space-y-1">
                  {plan.features.map((f) => (
                    <li key={f} className="text-xs text-zinc-600 dark:text-zinc-400">
                      &bull; {f}
                    </li>
                  ))}
                </ul>
                {isCurrent ? (
                  <div className="mt-4 rounded-md bg-blue-100 px-3 py-1.5 text-center text-xs font-medium text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                    Mevcut Plan
                  </div>
                ) : plan.id !== 'free' ? (
                  <button
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={upgrading === plan.id}
                    className="mt-4 w-full rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    {upgrading === plan.id ? 'Yonlendiriliyor...' : 'Yukselt'}
                  </button>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
