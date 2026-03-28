import Link from 'next/link';

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Demo Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-2 text-center text-sm font-medium text-white">
        Demo Modu &mdash; Gercek veri kullanmak icin{' '}
        <Link href="/register" className="underline hover:text-blue-100">
          ucretsiz kayit olun
        </Link>
      </div>

      <nav className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <Link href="/demo" className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
              StudioCast
            </Link>
            <div className="hidden items-center gap-4 sm:flex">
              <Link href="/demo" className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50">
                Dashboard
              </Link>
              <Link href="/demo/new" className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50">
                Yeni Projeksiyon
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-700 dark:bg-violet-900/30 dark:text-violet-300">
              Demo
            </span>
            <Link
              href="/register"
              className="rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
            >
              Kayit Ol
            </Link>
          </div>
        </div>
      </nav>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
