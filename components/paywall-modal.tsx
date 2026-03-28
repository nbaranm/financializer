'use client'

import { useState } from 'react'

interface PaywallModalProps {
  feature: string
  onClose: () => void
}

export function PaywallModal({ feature, onClose }: PaywallModalProps) {
  const [loading, setLoading] = useState(false)

  const handleUpgrade = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID }),
      })
      const { url } = await res.json()
      window.location.href = url
    } catch {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl"
        >
          ✕
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🚀</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Pro&apos;ya Geç</h2>
          <p className="text-gray-600 mt-2">
            &ldquo;{feature}&rdquo; özelliği Pro planda kullanılabilir.
          </p>
        </div>

        <ul className="space-y-3 mb-8">
          {[
            '10 projeksiyon',
            '24 ay projeksiyon',
            'Gerçek veri takibi',
            'PDF yatırımcı raporu',
            'Excel dışa aktarma',
            'Karşılaştırma analizi',
          ].map((item) => (
            <li key={item} className="flex items-center gap-3 text-gray-700">
              <span className="text-green-500 text-lg">✓</span>
              {item}
            </li>
          ))}
        </ul>

        <button
          onClick={handleUpgrade}
          disabled={loading}
          className="w-full py-3 px-6 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors"
        >
          {loading ? 'Yönlendiriliyor...' : "Pro'ya Geç — $29/ay"}
        </button>

        <p className="text-center text-sm text-gray-500 mt-4">
          İstediğin zaman iptal edebilirsin
        </p>
      </div>
    </div>
  )
}
