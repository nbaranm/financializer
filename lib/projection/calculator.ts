export interface ProjectionInput {
  template: string;
  team_size: number;
  monthly_burn: number;
  launch_month: number;
  expected_revenue: number;
  growth_rate: number;
  initial_investment: number;
  projection_months: number; // 6, 12, 24, 36, 60
}

export interface MonthData {
  month: number;
  revenue: number;
  expense: number;
  net: number;
  cumulative_net: number;
  runway_months: number | null; // null = infinite (profitable)
  revenue_breakdown: Record<string, number>;
  expense_breakdown: Record<string, number>;
}

export function calculateProjection(input: ProjectionInput): MonthData[] {
  const months: MonthData[] = [];
  let cumNet = input.initial_investment;

  // Use a seeded approach for deterministic results
  let seed = hashCode(JSON.stringify(input));

  for (let i = 1; i <= input.projection_months; i++) {
    const revenue = calculateRevenue(input, i, () => {
      seed = (seed * 16807 + 0) % 2147483647;
      return seed / 2147483647;
    });
    const expense = calculateExpense(input, i);
    const net = revenue.total - expense.total;
    cumNet += net;

    months.push({
      month: i,
      revenue: revenue.total,
      expense: expense.total,
      net,
      cumulative_net: cumNet,
      runway_months: net >= 0 ? null : Math.max(0, Math.floor(cumNet / Math.abs(net))),
      revenue_breakdown: revenue.breakdown,
      expense_breakdown: expense.breakdown,
    });
  }

  return months;
}

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash) || 1;
}

function calculateRevenue(
  input: ProjectionInput,
  month: number,
  random: () => number
): { total: number; breakdown: Record<string, number> } {
  const isPreLaunch = month < input.launch_month;
  if (isPreLaunch) return { total: 0, breakdown: {} };

  const monthsSinceLaunch = month - input.launch_month;
  let breakdown: Record<string, number> = {};

  switch (input.template) {
    case 'indie_game': {
      // Lansman spike → hızlı düşüş → uzun kuyruk + mevsimsel spike'lar (sale dönemleri)
      const baseRevenue = input.expected_revenue;
      let multiplier = 1;

      if (monthsSinceLaunch === 0) {
        multiplier = 3.0; // Lansman ayı: 3x
      } else if (monthsSinceLaunch <= 2) {
        multiplier = 1.5 * Math.pow(0.6, monthsSinceLaunch);
      } else {
        multiplier = 0.15 + 0.05 * random(); // Uzun kuyruk: baz gelirin %15-20'si
      }

      // Steam sale spike'ları (her 3 ayda)
      if (monthsSinceLaunch > 0 && monthsSinceLaunch % 3 === 0) {
        multiplier *= 2.0;
      }

      const total = Math.round(baseRevenue * multiplier);
      breakdown = {
        'Steam Satış': Math.round(total * 0.65),
        'Epic Satış': Math.round(total * 0.20),
        'DLC': monthsSinceLaunch > 4 ? Math.round(total * 0.10) : 0,
        'Bundle': monthsSinceLaunch > 6 ? Math.round(total * 0.05) : 0,
      };
      return { total, breakdown };
    }

    case 'mobile_game': {
      // Yavaş başlangıç → UA ile büyüme → platoya ulaşma
      const maturityFactor = Math.min(1, monthsSinceLaunch / 8);
      const growthFactor = Math.pow(1 + input.growth_rate / 100, Math.min(monthsSinceLaunch, 12));
      const total = Math.round(
        input.expected_revenue * maturityFactor * growthFactor * (0.9 + random() * 0.2)
      );

      breakdown = {
        'IAP': Math.round(total * 0.50),
        'Reklam Geliri': Math.round(total * 0.30),
        'Battle Pass': Math.round(total * 0.15),
        'Sponsorluk': Math.round(total * 0.05),
      };
      return { total, breakdown };
    }

    case 'saas': {
      // Klasik SaaS compound growth — her ay MRR büyür
      const mrr = input.expected_revenue * Math.pow(1 + input.growth_rate / 100, monthsSinceLaunch);
      const churnRate = 0.05; // Aylık %5 churn
      const netMRR = mrr * Math.pow(1 - churnRate, monthsSinceLaunch);
      const total = Math.round(netMRR);

      breakdown = {
        'MRR (Abonelik)': Math.round(total * 0.70),
        'Yıllık Plan': Math.round(total * 0.20),
        'Enterprise': monthsSinceLaunch > 6 ? Math.round(total * 0.08) : 0,
        'Add-on': Math.round(total * 0.02),
      };
      return { total, breakdown };
    }

    case 'agency': {
      // Proje bazlı — dalgalı ama genel trend yukarı
      const baseFactor = 1 + (input.growth_rate / 100) * (monthsSinceLaunch / 12);
      const volatility = 0.7 + random() * 0.6; // %70-130 arası dalgalanma
      const total = Math.round(input.expected_revenue * baseFactor * volatility);

      breakdown = {
        'Proje Gelirleri': Math.round(total * 0.70),
        'Retainer': Math.round(total * 0.15),
        'Danışmanlık': Math.round(total * 0.10),
        'Royalty': Math.round(total * 0.05),
      };
      return { total, breakdown };
    }

    default:
      return { total: input.expected_revenue, breakdown: { 'Gelir': input.expected_revenue } };
  }
}

function calculateExpense(
  input: ProjectionInput,
  month: number
): { total: number; breakdown: Record<string, number> } {
  // Giderler zaman içinde hafif artar (enflasyon + büyüme)
  const inflationFactor = 1 + 0.005 * month; // Aylık %0.5 artış
  const baseBurn = input.monthly_burn * inflationFactor;

  const breakdown: Record<string, number> = {
    'Maaşlar': Math.round(baseBurn * 0.60),
    'Altyapı': Math.round(baseBurn * 0.10),
    'Pazarlama': Math.round(baseBurn * 0.15),
    'Operasyon': Math.round(baseBurn * 0.10),
    'Diğer': Math.round(baseBurn * 0.05),
  };

  // Lansman ayında ekstra pazarlama
  if (month === input.launch_month) {
    breakdown['Pazarlama'] *= 3;
  }

  const total = Object.values(breakdown).reduce((a, b) => a + b, 0);
  return { total, breakdown };
}

// KPI Hesaplamaları
export function calculateKPIs(months: MonthData[], input: ProjectionInput) {
  const totalRevenue = months.reduce((s, m) => s + m.revenue, 0);
  const totalExpense = months.reduce((s, m) => s + m.expense, 0);
  const breakEvenMonth = months.findIndex((m) => m.net > 0) + 1;
  const peakBurn = Math.min(...months.map((m) => m.cumulative_net));
  const lastMonth = months[months.length - 1];

  // Aylık büyüme ortalaması (lansman sonrası)
  const postLaunchMonths = months.filter(
    (m) => m.month >= input.launch_month && m.revenue > 0
  );
  const avgMoMGrowth =
    postLaunchMonths.length > 1
      ? postLaunchMonths.slice(1).reduce((sum, m, i) => {
          const prev = postLaunchMonths[i].revenue;
          return sum + (prev > 0 ? ((m.revenue - prev) / prev) * 100 : 0);
        }, 0) /
        (postLaunchMonths.length - 1)
      : 0;

  return {
    totalRevenue,
    totalExpense,
    netProfitLoss: totalRevenue - totalExpense,
    breakEvenMonth: breakEvenMonth > 0 ? breakEvenMonth : null,
    peakBurn,
    finalCumulative: lastMonth.cumulative_net,
    avgMoMGrowth: Math.round(avgMoMGrowth * 10) / 10,
    roi:
      input.initial_investment > 0
        ? Math.round(((totalRevenue - totalExpense) / input.initial_investment) * 100)
        : null,
    financialHealthScore: calculateHealthScore(months),
  };
}

function calculateHealthScore(months: MonthData[]): number {
  let score = 50; // Başlangıç

  const last = months[months.length - 1];
  if (last.cumulative_net > 0) score += 20;
  if (last.net > 0) score += 15;

  const breakEven = months.findIndex((m) => m.net > 0);
  if (breakEven >= 0 && breakEven < 12) score += 15;
  else if (breakEven >= 0 && breakEven < 18) score += 10;

  const runway = last.runway_months;
  if (runway === null) score += 10; // Kârlı
  else if (runway > 12) score += 5;

  return Math.min(100, Math.max(0, score));
}
