// ==================== USER & AUTH ====================
export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  company_name: string | null;
  plan: 'free' | 'pro' | 'studio';
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  created_at: string;
  updated_at: string;
}

// ==================== PROJECTION ====================
export type TemplateType = 'indie_game' | 'mobile_game' | 'saas' | 'agency';
export type ProjectionStatus = 'active' | 'archived';

export interface Projection {
  id: string;
  user_id: string;
  name: string;
  template: TemplateType;
  // Girdi parametreleri
  team_size: number;
  monthly_burn: number;
  launch_month: number;
  expected_revenue: number;
  growth_rate: number;
  initial_investment: number;
  // Ek parametreler
  custom_params: Record<string, unknown>;
  // Hesaplanmış projeksiyon verisi
  projection_data: MonthData[];
  // Meta
  projection_months: number;
  currency: string;
  status: ProjectionStatus;
  created_at: string;
  updated_at: string;
}

export interface MonthData {
  month: number;
  revenue: number;
  expense: number;
  net: number;
  cumulative_net: number;
  runway_months: number | null;
  revenue_breakdown: Record<string, number>;
  expense_breakdown: Record<string, number>;
}

// ==================== ACTUALS (PRO+) ====================
export interface Actual {
  id: string;
  projection_id: string;
  user_id: string;
  month_number: number;
  revenue_total: number;
  revenue_breakdown: Record<string, number>;
  expense_total: number;
  expense_breakdown: Record<string, number>;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// ==================== PLANS ====================
export interface Plan {
  id: 'free' | 'pro' | 'studio';
  name: string;
  price: number;
  features: string[];
  maxProjections: number;
  maxMonths: number;
  hasActuals: boolean;
  hasReport: boolean;
  hasExport: boolean;
  hasApi: boolean;
  hasTeam: boolean;
}

// ==================== KPI ====================
export interface KPI {
  label: string;
  value: string | number;
  change?: number; // percentage change
  trend?: 'up' | 'down' | 'neutral';
}
