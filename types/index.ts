// ==================== USER & AUTH ====================
export interface User {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  plan: 'free' | 'pro' | 'studio';
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  created_at: string;
  updated_at: string;
}

// ==================== PROJECTION ====================
export type BusinessModel =
  | 'premium_game'
  | 'free_to_play'
  | 'subscription'
  | 'ad_supported'
  | 'hybrid'
  | 'saas'
  | 'marketplace';

export type ProjectionStatus = 'draft' | 'active' | 'archived';

export interface Projection {
  id: string;
  user_id: string;
  name: string;
  business_model: BusinessModel;
  status: ProjectionStatus;
  months: number; // projeksiyon süresi (ay)
  start_date: string;
  currency: string;
  initial_investment: number;
  monthly_burn_rate: number;
  created_at: string;
  updated_at: string;
}

export interface MonthlyProjection {
  id: string;
  projection_id: string;
  month: number; // 1-indexed
  date: string;
  revenue: number;
  expenses: number;
  net_income: number;
  cumulative_revenue: number;
  cumulative_expenses: number;
  cash_balance: number;
  users: number;
  paying_users: number;
  arpu: number; // Average Revenue Per User
  churn_rate: number;
  created_at: string;
}

// ==================== ACTUALS (PRO+) ====================
export interface MonthlyActual {
  id: string;
  projection_id: string;
  month: number;
  date: string;
  revenue: number;
  expenses: number;
  users: number;
  paying_users: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// ==================== WIZARD ====================
export interface WizardFormData {
  name: string;
  business_model: BusinessModel;
  months: number;
  start_date: string;
  currency: string;
  initial_investment: number;
  monthly_burn_rate: number;
  expected_launch_month: number;
  // Revenue assumptions
  initial_users: number;
  monthly_growth_rate: number; // percentage
  conversion_rate: number; // percentage (for F2P/freemium)
  price_per_unit: number;
  // Expense breakdown
  team_size: number;
  avg_salary: number;
  infrastructure_cost: number;
  marketing_budget: number;
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
