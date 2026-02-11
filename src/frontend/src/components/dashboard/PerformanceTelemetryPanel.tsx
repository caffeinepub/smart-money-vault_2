import { useGetEquityCurve } from '../../hooks/useEquityCurve';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Loader2 } from 'lucide-react';

export default function PerformanceTelemetryPanel() {
  const { data, isLoading, isError } = useGetEquityCurve();

  return (
    <div className="rounded-xl border border-white/5 bg-[#121212] p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-medium tracking-tight text-white/70">Performance Telemetry</h2>
        <TrendingUp className="h-4 w-4 text-white/40" />
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-white/40" />
        </div>
      ) : isError ? (
        <div className="flex h-64 items-center justify-center">
          <p className="text-sm text-white/40">Failed to load performance data</p>
        </div>
      ) : data.length === 0 ? (
        <div className="flex h-64 items-center justify-center">
          <p className="text-sm text-white/40">No trade data available</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="oklch(0.65 0.15 150)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="oklch(0.65 0.15 150)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="time"
              stroke="oklch(0.5 0 0 / 0.2)"
              tick={{ fill: 'oklch(0.5 0 0)', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="oklch(0.5 0 0 / 0.2)"
              tick={{ fill: 'oklch(0.5 0 0)', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${value.toLocaleString()}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'oklch(0.07 0 0)',
                border: '1px solid oklch(1 0 0 / 0.1)',
                borderRadius: '8px',
                fontSize: '12px',
              }}
              labelStyle={{ color: 'oklch(0.98 0 0)' }}
              itemStyle={{ color: 'oklch(0.65 0.15 150)' }}
              formatter={(value: number) => [`$${value.toLocaleString()}`, 'Equity']}
            />
            <Area
              type="monotone"
              dataKey="equity"
              stroke="oklch(0.65 0.15 150)"
              strokeWidth={2}
              fill="url(#equityGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
