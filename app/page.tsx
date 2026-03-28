import Link from 'next/link';
import { PLANS } from '@/lib/stripe/plans';
import { TEMPLATES } from '@/lib/projection/templates';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/80">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
              StudioCast
            </Link>
            <nav className="hidden items-center gap-6 md:flex">
              <a href="#features" className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50">
                Ozellikler
              </a>
              <a href="#pricing" className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50">
                Fiyatlar
              </a>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400">
              Giris Yap
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition-colors"
            >
              Ucretsiz Basla
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-5xl px-4 pt-24 pb-16 text-center">
        <div className="mb-6 inline-block rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-xs font-medium text-blue-700 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
          Oyun studyolari ve startuplar icin tasarlandi
        </div>
        <h1 className="text-5xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-6xl lg:text-7xl">
          Finansal Geleceginizi
          <br />
          <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
            Simdi Goruntuleyin
          </span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
          Template sec, parametreleri gir, projeksiyonunu aninda gor. Gelir tahminleri,
          gider takibi, break-even analizi ve yatirimci raporu &mdash; hepsi tek platformda.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/register"
            className="rounded-lg bg-blue-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 hover:bg-blue-700 transition-all"
          >
            Ucretsiz Basla &rarr;
          </Link>
          <Link
            href="#features"
            className="rounded-lg border border-zinc-300 px-8 py-3.5 text-sm font-medium text-zinc-700 hover:bg-white dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors"
          >
            Nasil Calisir?
          </Link>
        </div>

        {/* Template Cards in Hero */}
        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TEMPLATES.map((t) => (
            <div
              key={t.id}
              className="group rounded-xl border border-zinc-200 bg-white p-5 text-left transition-all hover:border-blue-300 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-blue-700"
            >
              <span className="text-3xl">{t.icon}</span>
              <h3 className="mt-2 font-semibold text-zinc-900 dark:text-zinc-100">{t.name}</h3>
              <p className="mt-1 text-xs text-zinc-500 leading-relaxed">{t.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t border-zinc-200 bg-white py-24 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">Her Sey Tek Yerde</h2>
            <p className="mt-3 text-zinc-500">Finansal planlamada ihtiyaciniz olan tum araclar</p>
          </div>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: '📊', title: 'Akilli Projeksiyon', desc: 'Template-bazli modeller ile dakikalar icinde detayli finansal projeksiyon olusturun.' },
              { icon: '📈', title: 'Gercek Veri Takibi', desc: 'Aylik gerceklesen verileri girin, projeksiyonlarla otomatik karsilastirin.' },
              { icon: '🔄', title: 'Karsilastirma Analizi', desc: 'Projeksiyon vs gerceklesen overlay grafikleri ile sapmalari aninda gorun.' },
              { icon: '📑', title: 'Yatirimci Raporu', desc: 'Profesyonel PDF raporlari tek tikla olusturun ve paylasin.' },
            ].map((f) => (
              <div key={f.title} className="rounded-xl border border-zinc-100 bg-zinc-50/50 p-6 dark:border-zinc-800 dark:bg-zinc-800/50">
                <span className="text-2xl">{f.icon}</span>
                <h3 className="mt-3 font-semibold text-zinc-900 dark:text-zinc-100">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="border-t border-zinc-200 py-16 dark:border-zinc-800">
        <div className="mx-auto max-w-4xl px-4">
          <div className="grid grid-cols-3 gap-8 text-center">
            {[
              { value: '500+', label: 'Aktif Studyo' },
              { value: '$12M+', label: 'Takip Edilen Butce' },
              { value: '%94', label: 'Dogruluk Orani' },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 sm:text-4xl">{s.value}</p>
                <p className="mt-1 text-sm text-zinc-500">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="border-t border-zinc-200 bg-white py-24 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">Basit Fiyatlandirma</h2>
            <p className="mt-3 text-zinc-500">Her buyuklukteki takima uygun planlar</p>
          </div>
          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            {PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`relative rounded-2xl border p-8 ${
                  plan.id === 'pro'
                    ? 'border-blue-500 bg-blue-50 shadow-xl shadow-blue-600/10 dark:bg-blue-900/20'
                    : 'border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900/50'
                }`}
              >
                {plan.id === 'pro' && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-4 py-1 text-xs font-semibold text-white">
                    En Populer
                  </span>
                )}
                <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{plan.name}</h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-zinc-900 dark:text-zinc-100">${plan.price}</span>
                  <span className="text-sm text-zinc-500">/ay</span>
                </div>
                <ul className="mt-6 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                      <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/register"
                  className={`mt-8 block rounded-lg px-4 py-3 text-center text-sm font-semibold transition-colors ${
                    plan.id === 'pro'
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'border border-zinc-300 text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800'
                  }`}
                >
                  {plan.price === 0 ? 'Ucretsiz Basla' : 'Plani Sec'}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-zinc-200 py-24 dark:border-zinc-800">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            Finansal Planlamaya Bugun Baslayin
          </h2>
          <p className="mt-4 text-lg text-zinc-500">
            Kredi karti gerekmez. Ucretsiz planda hemen projeksiyonunuzu olusturun.
          </p>
          <Link
            href="/register"
            className="mt-8 inline-block rounded-lg bg-blue-600 px-10 py-4 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 hover:bg-blue-700 transition-all"
          >
            Hemen Basla &rarr;
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-white py-10 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 sm:flex-row">
          <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">StudioCast</span>
          <p className="text-xs text-zinc-500">&copy; {new Date().getFullYear()} StudioCast. Tum haklari saklidir.</p>
        </div>
      </footer>
    </div>
  );
}
