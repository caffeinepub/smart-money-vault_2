import { useGetEquityCurve } from '../../hooks/useEquityCurve';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { ChartSkeleton } from '../common/LoadingSkeletons';
import { StateMessage } from '../common/StateMessage';

export default function PerformanceTelemetryPanel() {
  const { data, isLoading, isError } = useGetEquityCurve();

  if (isLoading) {
    return (
      <div id="performance-telemetry-panel" className="rounded-xl border border-white/5 bg-[#121212] p-6">
        <ChartSkeleton />
      </div>
    );
  }

  if (isError) {
    return (
      <div id="performance-telemetry-panel" className="rounded-xl border border-white/5 bg-[#121212] p-6">
        <StateMessage
          variant="error"
          title="Failed to Load"
          description="Unable to fetch performance telemetry data."
        />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div id="performance-telemetry-panel" className="rounded-xl border border-white/5 bg-[#121212] p-6">
        <StateMessage
          variant="empty"
          title="No Trade Data"
          description="Start trading to see your performance telemetry and equity curve."
        />
      </div>
    );
  }

  return (
    <div id="performance-telemetry-panel" className="rounded-xl border border-white/5 bg-[#121212] p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold tracking-tight text-white sm:text-lg">Performance Telemetry</h2>
          <p className="text-xs text-white/50 sm:text-sm">Track your equity curve over time</p>
        </div>
        <TrendingUp className="h-5 w-5 text-white/40" />
      </div>

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
    </div>
  );
}
