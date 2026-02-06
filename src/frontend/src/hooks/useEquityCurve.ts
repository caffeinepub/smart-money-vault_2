import { useGetCallerUserProfile } from './useCurrentUserProfile';
import { useGetTradesPaginated } from './useTrades';
import { TradeSide } from '../backend';

interface EquityPoint {
  time: string;
  equity: number;
}

export function useGetEquityCurve() {
  const { data: userProfile } = useGetCallerUserProfile();
  const accountId = userProfile?.accountId || null;
  
  const { data: trades, isLoading, isError } = useGetTradesPaginated(
    accountId,
    null,
    null,
    0n,
    100n
  );

  // Transform trades into equity curve
  const equityData: EquityPoint[] = [];
  if (trades && trades.length > 0) {
    let runningEquity = 10000; // Starting equity
    
    trades.forEach((trade) => {
      if (trade.exitPrice && trade.exitTimestamp) {
        const pnl = trade.side === TradeSide.buy
          ? (trade.exitPrice - trade.entryPrice) * trade.size
          : (trade.entryPrice - trade.exitPrice) * trade.size;
        
        runningEquity += pnl;
        
        equityData.push({
          time: new Date(Number(trade.exitTimestamp) / 1_000_000).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
          equity: Math.round(runningEquity),
        });
      }
    });
  }

  return {
    data: equityData,
    isLoading,
    isError,
  };
}
