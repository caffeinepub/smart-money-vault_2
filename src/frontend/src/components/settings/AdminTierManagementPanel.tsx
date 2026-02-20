import { useListTiers } from '../../hooks/useTiers';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { TableSkeleton } from '../common/LoadingSkeletons';
import { StateMessage } from '../common/StateMessage';

export default function AdminTierManagementPanel() {
  const { data: tiers, isLoading, isError, refetch } = useListTiers();

  return (
    <Card className="border-white/5 bg-[#121212]">
      <CardHeader>
        <CardTitle className="text-base font-semibold text-white sm:text-lg">Subscription Tiers</CardTitle>
        <CardDescription className="text-xs text-white/60 sm:text-sm">
          View and manage subscription tier configuration
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <TableSkeleton rows={3} />
        ) : isError ? (
          <StateMessage
            variant="error"
            title="Failed to Load Tiers"
            description="Unable to fetch subscription tier data."
            action={{ label: 'Retry', onClick: () => refetch() }}
          />
        ) : !tiers || tiers.length === 0 ? (
          <StateMessage
            variant="empty"
            title="No Tiers Found"
            description="No subscription tiers are configured in the backend."
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-white/5 hover:bg-transparent">
                  <TableHead className="text-xs font-semibold text-white/70 sm:text-sm">Tier</TableHead>
                  <TableHead className="text-xs font-semibold text-white/70 sm:text-sm">Status</TableHead>
                  <TableHead className="text-right text-xs font-semibold text-white/70 sm:text-sm">Price</TableHead>
                  <TableHead className="text-right text-xs font-semibold text-white/70 sm:text-sm">Max Bots</TableHead>
                  <TableHead className="text-right text-xs font-semibold text-white/70 sm:text-sm">Max API Calls</TableHead>
                  <TableHead className="text-xs font-semibold text-white/70 sm:text-sm">Features</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tiers.map((tier) => (
                  <TableRow key={tier.id} className="border-white/5 hover:bg-white/5">
                    <TableCell className="font-medium text-white">{tier.name}</TableCell>
                    <TableCell>
                      <Badge
                        variant={tier.active ? 'default' : 'destructive'}
                        className={
                          tier.active
                            ? 'bg-profit/20 text-profit'
                            : 'bg-loss/20 text-loss'
                        }
                      >
                        {tier.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-white">
                      ${(Number(tier.priceInCents) / 100).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right text-white">
                      {Number(tier.maxBots) >= 999999 ? '∞' : Number(tier.maxBots).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right text-white">
                      {Number(tier.maxApiCalls) >= 999999 ? '∞' : Number(tier.maxApiCalls).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-xs text-white/70 sm:text-sm">
                      {tier.features.slice(0, 2).join(', ')}
                      {tier.features.length > 2 && ` +${tier.features.length - 2} more`}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
