import { useState } from 'react';
import { useGetTradesPaginated } from '../hooks/useTrades';
import { useGetCallerUserProfile } from '../hooks/useCurrentUserProfile';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, ChevronLeft, ChevronRight, TrendingUp, TrendingDown } from 'lucide-react';
import { formatTimestamp, calculatePnL } from '../utils/format';

const PAGE_SIZE = 20;

export default function TradesScreen() {
  const { data: userProfile } = useGetCallerUserProfile();
  const [page, setPage] = useState(0);
  const [accountFilter, setAccountFilter] = useState('');
  const [startTimeFilter, setStartTimeFilter] = useState('');
  const [endTimeFilter, setEndTimeFilter] = useState('');

  const accountId = accountFilter || userProfile?.accountId || null;
  const startTime = startTimeFilter ? BigInt(new Date(startTimeFilter).getTime() * 1_000_000) : null;
  const endTime = endTimeFilter ? BigInt(new Date(endTimeFilter).getTime() * 1_000_000) : null;

  const { data: trades, isLoading } = useGetTradesPaginated(
    accountId,
    startTime,
    endTime,
    BigInt(page * PAGE_SIZE),
    BigInt(PAGE_SIZE)
  );

  const handlePrevPage = () => setPage((p) => Math.max(0, p - 1));
  const handleNextPage = () => {
    if (trades && trades.length === PAGE_SIZE) {
      setPage((p) => p + 1);
    }
  };

  const handleResetFilters = () => {
    setAccountFilter('');
    setStartTimeFilter('');
    setEndTimeFilter('');
    setPage(0);
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">Trades</h2>
          <p className="text-xs text-white/60 sm:text-sm">View and filter your trade history</p>
        </div>

        {/* Filters */}
        <Card className="border-white/5 bg-[#000000]">
          <CardHeader>
            <CardTitle className="text-base text-white sm:text-lg">Filters</CardTitle>
            <CardDescription className="text-xs text-white/60 sm:text-sm">
              Filter trades by account and time range
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="accountFilter" className="text-xs text-white/80 sm:text-sm">
                  Account ID
                </Label>
                <Input
                  id="accountFilter"
                  value={accountFilter}
                  onChange={(e) => {
                    setAccountFilter(e.target.value);
                    setPage(0);
                  }}
                  placeholder="Filter by account..."
                  className="border-white/10 bg-white/5 text-sm text-white placeholder:text-white/40"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="startTime" className="text-xs text-white/80 sm:text-sm">
                  Start Date
                </Label>
                <Input
                  id="startTime"
                  type="datetime-local"
                  value={startTimeFilter}
                  onChange={(e) => {
                    setStartTimeFilter(e.target.value);
                    setPage(0);
                  }}
                  className="border-white/10 bg-white/5 text-sm text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime" className="text-xs text-white/80 sm:text-sm">
                  End Date
                </Label>
                <Input
                  id="endTime"
                  type="datetime-local"
                  value={endTimeFilter}
                  onChange={(e) => {
                    setEndTimeFilter(e.target.value);
                    setPage(0);
                  }}
                  className="border-white/10 bg-white/5 text-sm text-white"
                />
              </div>
            </div>
            <div className="mt-4">
              <Button
                onClick={handleResetFilters}
                variant="outline"
                size="sm"
                className="border-white/10 bg-white/5 text-xs text-white hover:bg-white/10 sm:text-sm"
              >
                Reset Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Trades Table */}
        <Card className="border-white/5 bg-[#000000]">
          <CardHeader>
            <CardTitle className="text-base text-white sm:text-lg">Trade History</CardTitle>
            <CardDescription className="text-xs text-white/60 sm:text-sm">
              {trades && trades.length > 0
                ? `Showing ${page * PAGE_SIZE + 1}-${page * PAGE_SIZE + trades.length} trades`
                : 'No trades found'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-white/40" />
              </div>
            ) : !trades || trades.length === 0 ? (
              <div className="flex h-64 items-center justify-center">
                <p className="text-sm text-white/60">No trades found</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-white/5 hover:bg-transparent">
                        <TableHead className="text-xs text-white/60 sm:text-sm">Trade ID</TableHead>
                        <TableHead className="text-xs text-white/60 sm:text-sm">Account</TableHead>
                        <TableHead className="text-xs text-white/60 sm:text-sm">Side</TableHead>
                        <TableHead className="text-xs text-white/60 sm:text-sm">Instrument</TableHead>
                        <TableHead className="text-right text-xs text-white/60 sm:text-sm">Size</TableHead>
                        <TableHead className="text-right text-xs text-white/60 sm:text-sm">Entry Price</TableHead>
                        <TableHead className="text-right text-xs text-white/60 sm:text-sm">Exit Price</TableHead>
                        <TableHead className="text-right text-xs text-white/60 sm:text-sm">P&L</TableHead>
                        <TableHead className="text-xs text-white/60 sm:text-sm">Entry Time</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {trades.map((trade) => {
                        const pnl = calculatePnL(trade);
                        return (
                          <TableRow
                            key={trade.tradeId}
                            className="border-white/5 hover:bg-white/5"
                          >
                            <TableCell className="font-mono text-xs text-white sm:text-sm">
                              {trade.tradeId}
                            </TableCell>
                            <TableCell className="font-mono text-xs text-white/80 sm:text-sm">
                              {trade.accountId}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={
                                  trade.side === 'buy'
                                    ? 'border-[#10b981]/30 bg-[#10b981]/10 text-[#10b981]'
                                    : 'border-[#ef4444]/30 bg-[#ef4444]/10 text-[#ef4444]'
                                }
                              >
                                {trade.side === 'buy' ? (
                                  <>
                                    <TrendingUp className="mr-1 h-3 w-3" />
                                    Buy
                                  </>
                                ) : (
                                  <>
                                    <TrendingDown className="mr-1 h-3 w-3" />
                                    Sell
                                  </>
                                )}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-xs text-white sm:text-sm">{trade.instrument}</TableCell>
                            <TableCell className="text-right text-xs text-white sm:text-sm">
                              {trade.size.toFixed(4)}
                            </TableCell>
                            <TableCell className="text-right text-xs text-white sm:text-sm">
                              ${trade.entryPrice.toFixed(2)}
                            </TableCell>
                            <TableCell className="text-right text-xs text-white/80 sm:text-sm">
                              {trade.exitPrice ? `$${trade.exitPrice.toFixed(2)}` : '—'}
                            </TableCell>
                            <TableCell className="text-right text-xs sm:text-sm">
                              {pnl !== null ? (
                                <span
                                  className={
                                    pnl >= 0 ? 'text-[#10b981]' : 'text-[#ef4444]'
                                  }
                                >
                                  {pnl >= 0 ? '+' : ''}${pnl.toFixed(2)}
                                </span>
                              ) : (
                                <span className="text-white/40">—</span>
                              )}
                            </TableCell>
                            <TableCell className="text-xs text-white/60 sm:text-sm">
                              {formatTimestamp(trade.entryTimestamp)}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-xs text-white/60 sm:text-sm">
                    Page {page + 1}
                  </p>
                  <div className="flex space-x-2">
                    <Button
                      onClick={handlePrevPage}
                      disabled={page === 0}
                      variant="outline"
                      size="sm"
                      className="border-white/10 bg-white/5 text-white hover:bg-white/10 disabled:opacity-30"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={handleNextPage}
                      disabled={!trades || trades.length < PAGE_SIZE}
                      variant="outline"
                      size="sm"
                      className="border-white/10 bg-white/5 text-white hover:bg-white/10 disabled:opacity-30"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
