import { useGetLiveLogs } from '../../hooks/useLiveLogs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { FileText, Loader2, RefreshCw } from 'lucide-react';
import { TradeSide } from '../../backend';
import { cn } from '../../lib/utils';

export default function LiveLogsPanel() {
  const { data: logs, isLoading, isError, refetch, isFetching } = useGetLiveLogs();

  return (
    <div className="rounded-xl border border-white/5 bg-[#121212] p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <FileText className="h-4 w-4 text-white/40" />
          <h2 className="text-sm font-medium tracking-tight text-white/70">Live Audit Feed</h2>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
          className="h-8 text-white/50 hover:text-white/70"
        >
          <RefreshCw className={cn('h-3.5 w-3.5', isFetching && 'animate-spin')} />
        </Button>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-white/40" />
        </div>
      ) : isError ? (
        <div className="flex h-64 items-center justify-center">
          <p className="text-sm text-white/40">Failed to load logs</p>
        </div>
      ) : !logs || logs.length === 0 ? (
        <div className="flex h-64 items-center justify-center">
          <p className="text-sm text-white/40">No trade logs available</p>
        </div>
      ) : (
        <ScrollArea className="h-[400px]">
          <Table>
            <TableHeader>
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableHead className="text-xs text-white/50">Time</TableHead>
                <TableHead className="text-xs text-white/50">Signal</TableHead>
                <TableHead className="text-xs text-white/50">Asset</TableHead>
                <TableHead className="text-xs text-white/50">Price</TableHead>
                <TableHead className="text-xs text-white/50">Trust Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log, idx) => {
                const isBuy = log.side === TradeSide.buy;
                return (
                  <TableRow key={idx} className="border-white/5 hover:bg-white/5">
                    <TableCell className="font-mono text-xs text-white/70">
                      {new Date(Number(log.entryTimestamp) / 1_000_000).toLocaleTimeString()}
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          'text-xs font-medium',
                          isBuy ? 'text-profit' : 'text-loss'
                        )}
                      >
                        {isBuy ? 'BUY' : 'SELL'}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-white/70">{log.instrument}</TableCell>
                    <TableCell className="font-mono text-xs text-white/70">
                      ${log.entryPrice.toFixed(2)}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-profit">100%</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </ScrollArea>
      )}
    </div>
  );
}
