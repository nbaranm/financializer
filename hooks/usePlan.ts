'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export function usePlan() {
  const [plan, setPlan] = useState<'free' | 'pro' | 'studio'>('free')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('plan')
          .eq('id', user.id)
          .single()
        setPlan(data?.plan || 'free')
      }
      setLoading(false)
    })
  }, [])

  return {
    plan,
    loading,
    isPro: plan === 'pro' || plan === 'studio',
    isStudio: plan === 'studio',
    canCreateProjection: (currentCount: number) => {
      if (plan === 'free') return currentCount < 1
      if (plan === 'pro') return currentCount < 10
      return true
    },
    maxMonths: plan === 'free' ? 6 : plan === 'pro' ? 24 : 60,
  }
}
