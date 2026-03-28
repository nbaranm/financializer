import { calculateProjection, calculateKPIs } from '@/lib/projection/calculator';
import type { Projection } from '@/types';

const DEMO_PROJECTIONS_INPUT = [
  {
    id: 'demo-indie-game',
    name: 'Pixel Quest - Steam Release',
    template: 'indie_game' as const,
    team_size: 5,
    monthly_burn: 12000,
    launch_month: 6,
    expected_revenue: 30000,
    growth_rate: -20,
    initial_investment: 80000,
    projection_months: 24,
    currency: 'USD',
    status: 'active' as const,
  },
  {
    id: 'demo-saas',
    name: 'GameAnalytics Pro - SaaS',
    template: 'saas' as const,
    team_size: 4,
    monthly_burn: 10000,
    launch_month: 4,
    expected_revenue: 5000,
    growth_rate: 20,
    initial_investment: 50000,
    projection_months: 24,
    currency: 'USD',
    status: 'active' as const,
  },
  {
    id: 'demo-mobile',
    name: 'Idle Heroes - Mobile F2P',
    template: 'mobile_game' as const,
    team_size: 8,
    monthly_burn: 20000,
    launch_month: 6,
    expected_revenue: 15000,
    growth_rate: 25,
    initial_investment: 120000,
    projection_months: 12,
    currency: 'USD',
    status: 'active' as const,
  },
];

export function getDemoProjections(): Projection[] {
  return DEMO_PROJECTIONS_INPUT.map((input) => {
    const projection_data = calculateProjection(input);
    return {
      ...input,
      user_id: 'demo-user',
      custom_params: {},
      projection_data,
      created_at: '2026-03-01T00:00:00Z',
      updated_at: '2026-03-25T00:00:00Z',
    };
  });
}

export function getDemoProjection(id: string): Projection | null {
  const all = getDemoProjections();
  return all.find((p) => p.id === id) ?? null;
}

export function getDemoKPIs(projection: Projection) {
  return calculateKPIs(projection.projection_data, {
    template: projection.template,
    team_size: projection.team_size,
    monthly_burn: projection.monthly_burn,
    launch_month: projection.launch_month,
    expected_revenue: projection.expected_revenue,
    growth_rate: projection.growth_rate,
    initial_investment: projection.initial_investment,
    projection_months: projection.projection_months,
  });
}
