import Link from 'next/link';
import { PLANS } from '@/lib/stripe/plans';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Header */}
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <span className="text-lg font-bold text-zinc-900 dark:text-zinc-50">StudioCast</span>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400">
              Giris Yap
            </Link>
            <Link
              href="/register"
              className="rounded-md bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
            >
              Kayit Ol
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-4 py-20 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl">
          Finansal Projeksiyonlarini
          <br />
          <span className="text-blue-600">Dakikalar Icinde</span> Olustur
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
          Oyun studyolari, SaaS startuplari ve ajanslara ozel finansal modelleme araci.
          Gelir projeksiyonu, gider takibi ve yatirimci raporu tek platformda.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link
            href="/register"
            className="rounded-md bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700"
          >
            Ucretsiz Basla
          </Link>
          <Link
            href="/login"
            className="rounded-md border border-zinc-300 px-6 py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300"
          >
            Giris Yap
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-center text-2xl font-bold text-zinc-900 dark:text-zinc-50">Ozellikler</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { title: 'Hazir Sablonlar', desc: 'Indie Game, Mobile Game, SaaS ve Agency icin optimize edilmis modeller.' },
            { title: 'Otomatik Hesaplama', desc: 'Gelir, gider, break-even noktasi ve runway otomatik hesaplanir.' },
            { title: 'Gercek Veri Takibi', desc: 'Projeksiyonlarinizi gercek verilerle karsilastirin (Pro+).' },
            { title: 'Gorsel Grafikler', desc: 'Gelir/gider trendleri ve kumulatif net grafikleri.' },
            { title: 'Yatirimci Raporu', desc: 'PDF olarak paylasabilecaginiz profesyonel raporlar (Studio).' },
            { title: 'Export', desc: 'PDF ve Excel formatinda disa aktarma (Pro+).' },
          ].map((f) => (
            <div key={f.title} className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">{f.title}</h3>
              <p className="mt-2 text-sm text-zinc-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-center text-2xl font-bold text-zinc-900 dark:text-zinc-50">Fiyatlandirma</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`rounded-lg border p-6 ${
                plan.id === 'pro'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900'
              }`}
            >
              {plan.id === 'pro' && (
                <span className="mb-2 inline-block rounded bg-blue-600 px-2 py-0.5 text-xs font-medium text-white">
                  Populer
                </span>
              )}
              <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{plan.name}</h3>
              <p className="mt-1 text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                ${plan.price}<span className="text-sm font-normal text-zinc-500">/ay</span>
              </p>
              <ul className="mt-4 space-y-2">
                {plan.features.map((f) => (
                  <li key={f} className="text-sm text-zinc-600 dark:text-zinc-400">&bull; {f}</li>
                ))}
              </ul>
              <Link
                href="/register"
                className={`mt-6 block rounded-md px-4 py-2 text-center text-sm font-medium ${
                  plan.id === 'pro'
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'border border-zinc-300 text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300'
                }`}
              >
                {plan.price === 0 ? 'Ucretsiz Basla' : 'Basla'}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200 py-8 text-center text-sm text-zinc-500 dark:border-zinc-800">
        StudioCast &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}
