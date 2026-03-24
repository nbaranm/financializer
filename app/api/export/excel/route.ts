import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import type { Projection } from '@/types';

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', user.id)
    .single();

  if (!profile || profile.plan === 'free') {
    return NextResponse.json({ error: 'Pro plan required' }, { status: 403 });
  }

  const projectionId = req.nextUrl.searchParams.get('id');
  if (!projectionId) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const { data } = await supabase
    .from('projections')
    .select('*')
    .eq('id', projectionId)
    .eq('user_id', user.id)
    .single();

  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const projection = data as Projection;

  // Generate CSV (Excel-compatible)
  const header = 'Month,Revenue,Expense,Net,Cumulative Net,Runway';
  const rows = projection.projection_data.map(
    (m) => `${m.month},${m.revenue},${m.expense},${m.net},${m.cumulative_net},${m.runway_months ?? 'Profitable'}`
  );
  const csv = [header, ...rows].join('\n');

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="${projection.name}.csv"`,
    },
  });
}
