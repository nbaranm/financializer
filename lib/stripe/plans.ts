import type { Plan } from '@/types';

export const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    maxProjections: 1,
    maxMonths: 6,
    hasActuals: false,
    hasReport: false,
    hasExport: false,
    hasApi: false,
    hasTeam: false,
    features: [
      '1 projeksiyon',
      '6 aylık projeksiyon',
      'Temel dashboard',
      'Temel grafikler',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 29,
    maxProjections: 10,
    maxMonths: 24,
    hasActuals: true,
    hasReport: false,
    hasExport: true,
    hasApi: false,
    hasTeam: false,
    features: [
      '10 projeksiyon',
      '24 aylık projeksiyon',
      'Gerçek veri takibi',
      'Projeksiyon vs Gerçekleşen karşılaştırma',
      'PDF & Excel export',
      'Gelişmiş grafikler',
    ],
  },
  {
    id: 'studio',
    name: 'Studio',
    price: 79,
    maxProjections: Infinity,
    maxMonths: 60,
    hasActuals: true,
    hasReport: true,
    hasExport: true,
    hasApi: true,
    hasTeam: true,
    features: [
      'Sınırsız projeksiyon',
      '60 aylık projeksiyon',
      'Yatırımcı raporu',
      'API erişimi',
      'Takım üyeleri',
      'Öncelikli destek',
      'Tüm Pro özellikleri',
    ],
  },
];

export function getPlan(planId: string): Plan {
  return PLANS.find((p) => p.id === planId) ?? PLANS[0];
}

export function getStripePriceId(planId: string): string | null {
  if (planId === 'pro') return process.env.STRIPE_PRO_PRICE_ID!;
  if (planId === 'studio') return process.env.STRIPE_STUDIO_PRICE_ID!;
  return null;
}
