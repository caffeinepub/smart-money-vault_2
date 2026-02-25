import type { Time, Trade } from '../backend';

export function formatTimestamp(timestamp: Time): string {
  const ms = Number(timestamp) / 1_000_000;
  const date = new Date(ms);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function calculatePnL(trade: Trade): number | null {
  if (!trade.exitPrice) return null;
  
  const priceDiff = trade.side === 'buy' 
    ? trade.exitPrice - trade.entryPrice 
    : trade.entryPrice - trade.exitPrice;
  
  return priceDiff * trade.size;
}
