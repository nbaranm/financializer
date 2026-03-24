'use client';

import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, Area, AreaChart,
} from 'recharts';
import type { MonthData } from '@/types';
import { formatCurrency } from '@/lib/utils';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const tooltipFormatter = (value: any) => formatCurrency(Number(value));

export function ProjectionCharts({ data, currency }: { data: MonthData[]; currency: string }) {
  const chartData = data.map((m) => ({
    name: `Ay ${m.month}`,
    Gelir: m.revenue,
    Gider: m.expense,
    Net: m.net,
    Kumulatif: m.cumulative_net,
  }));

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Revenue vs Expense */}
      <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <h3 className="mb-4 text-sm font-medium text-zinc-700 dark:text-zinc-300">Gelir vs Gider</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => formatCurrency(v, currency)} />
            <Tooltip formatter={tooltipFormatter} />
            <Legend />
            <Bar dataKey="Gelir" fill="#22c55e" radius={[2, 2, 0, 0]} />
            <Bar dataKey="Gider" fill="#ef4444" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Cumulative Net */}
      <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <h3 className="mb-4 text-sm font-medium text-zinc-700 dark:text-zinc-300">Kumulatif Net</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => formatCurrency(v, currency)} />
            <Tooltip formatter={tooltipFormatter} />
            <defs>
              <linearGradient id="colorKum" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey="Kumulatif" stroke="#3b82f6" fill="url(#colorKum)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Monthly Net */}
      <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 lg:col-span-2">
        <h3 className="mb-4 text-sm font-medium text-zinc-700 dark:text-zinc-300">Aylik Net Kar/Zarar</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => formatCurrency(v, currency)} />
            <Tooltip formatter={tooltipFormatter} />
            <Line type="monotone" dataKey="Net" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
