import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { calculateProjection } from '@/lib/projection/calculator';
import { getPlan } from '@/lib/stripe/plans';

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', user.id)
    .single();

  const plan = getPlan(profile?.plan || 'free');

  // Check projection count
  const { count } = await supabase
    .from('projections')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  if ((count ?? 0) >= plan.maxProjections) {
    return NextResponse.json({ error: 'Plan limit reached' }, { status: 403 });
  }

  const body = await req.json();

  // Validate projection months against plan
  if (body.projection_months > plan.maxMonths) {
    return NextResponse.json({ error: `Max ${plan.maxMonths} months for your plan` }, { status: 403 });
  }

  const projectionData = calculateProjection({
    template: body.template,
    team_size: body.team_size,
    monthly_burn: body.monthly_burn,
    launch_month: body.launch_month,
    expected_revenue: body.expected_revenue,
    growth_rate: body.growth_rate,
    initial_investment: body.initial_investment,
    projection_months: body.projection_months,
  });

  const { data, error } = await supabase
    .from('projections')
    .insert({
      user_id: user.id,
      name: body.name,
      template: body.template,
      team_size: body.team_size,
      monthly_burn: body.monthly_burn,
      launch_month: body.launch_month,
      expected_revenue: body.expected_revenue,
      growth_rate: body.growth_rate,
      initial_investment: body.initial_investment,
      projection_data: projectionData,
      projection_months: body.projection_months,
      custom_params: body.custom_params || {},
      currency: body.currency || 'USD',
      status: 'active',
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}
