import { useGetEquityCurve } from '../../hooks/useEquityCurve';
import { LineChart, Line, Area, ComposedChart, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Loader2 } from 'lucide-react';

export default function EquityCurvePanel() {
  const { data: equityData, isLoading, isError } = useGetEquityCurve();

  return (
    <div className="h-full rounded-xl border border-white/5 bg-[#121212] p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-medium tracking-tight text-white/70">Equity Curve</h2>
        <TrendingUp className="h-4 w-4 text-white/40" />
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-white/40" />
        </div>
      ) : isError ? (
        <div className="flex h-64 items-center justify-center">
          <p className="text-sm text-white/40">Failed to load equity data</p>
        </div>
      ) : !equityData || equityData.length === 0 ? (
        <div className="flex h-64 items-center justify-center">
          <p className="text-sm text-white/40">No equity data available</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart data={equityData}>
            <defs>
              <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="oklch(var(--profit))" stopOpacity={0.3} />
                <stop offset="100%" stopColor="oklch(var(--profit))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="time"
              stroke="rgba(255,255,255,0.1)"
              tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="rgba(255,255,255,0.1)"
              tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${value.toLocaleString()}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#121212',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                fontSize: '12px',
              }}
              labelStyle={{ color: 'rgba(255,255,255,0.7)' }}
              itemStyle={{ color: 'oklch(var(--profit))' }}
            />
            <Area
              type="monotone"
              dataKey="equity"
              fill="url(#equityGradient)"
              stroke="none"
            />
            <Line
              type="monotone"
              dataKey="equity"
              stroke="oklch(var(--profit))"
              strokeWidth={2}
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
